import type { AgentEvent, EmailApproval, Source, Step } from "../src/types.js";
import { api, fileUrl, stream, upload } from "./api.js";
import { $, append, clear, h } from "./dom.js";
import { icon, logo, type IconName } from "./icons.js";
import { renderMarkdown } from "./markdown.js";
import { EFFORTS, modelInfo, prefs, savePrefs, state, type FileRecord, type OpenConversation, type StoredMessage } from "./state.js";
import { formatSize, greeting, hostOf, prepareImage, toast } from "./util.js";
import { startCall } from "./call.js";
import { lang, plural, t } from "./i18n.js";

export interface ChatHooks {
  /** A fresh chat got its id (after the first send). */
  created(conversationId: string): void;
  titled(conversationId: string, title: string): void;
  changed(): void;
}

let hooks: ChatHooks;
let main: HTMLElement;
let thread: HTMLElement;
let threadInner: HTMLElement;
let titleEl: HTMLElement;
let textarea: HTMLTextAreaElement;
let attachRow: HTMLElement;
let sendBtn: HTMLButtonElement;
let modelBtn: HTMLButtonElement;
let micBtn: HTMLButtonElement;
let fileInput: HTMLInputElement;

let busy = false;
/** Aborts our side of the stream when you leave a chat; the run carries on on the server. */
let streamAbort: AbortController | null = null;
let pending: { file: FileRecord | null; name: string; preview?: string; el: HTMLElement; promise: Promise<FileRecord | null> }[] = [];
let stickToBottom = true;

const shortModel = (id: string) => t(modelInfo(id)?.label ?? id).replace(/^Claude /, "");

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEP_ICONS: Record<string, IconName> = {
  web_search: "globe",
  web_fetch: "globe",
  x_search: "search",
  run_code: "code",
  remember: "bookmark",
  forget: "bookmark",
  search_past_conversations: "search",
  set_reminder: "bell",
  list_reminders: "bell",
  cancel_reminder: "bell",
  list_files: "folder",
  read_file: "file",
  write_file: "file",
  generate_image: "image",
  delegate_tasks: "users",
  create_agents: "bot",
  list_agents: "bot",
  update_agent: "bot",
  delete_agents: "bot",
  gmail_search: "mail",
  gmail_read: "mail",
  gmail_save_attachment: "mail",
  gmail_send_email: "mail",
  calendar_list_events: "clock",
  calendar_create_event: "clock",
  calendar_delete_event: "clock",
  drive_search: "folder",
  drive_read: "file",
};

function thinkingSeconds(steps: Step[]): number {
  let ms = 0;
  for (const s of steps) if (s.kind === "thinking") ms += (s.endedAt ?? Date.now()) - s.startedAt;
  return Math.max(1, Math.round(ms / 1000));
}

function activitySummary(steps: Step[], running: boolean): string {
  if (running) {
    const last = steps.at(-1);
    if (!last || last.kind === "thinking") return t("Thinking…");
    return last.status === "running" ? `${last.label}…` : last.label;
  }
  const tools = steps.filter((s): s is Extract<Step, { kind: "tool" }> => s.kind === "tool");
  const parts: string[] = [];
  if (steps.some((s) => s.kind === "thinking")) parts.push(t("Thought for {n}s", { n: thinkingSeconds(steps) }));
  const searches = tools.filter((t) => ["web_search", "x_search"].includes(t.name)).length;
  const pages = tools.filter((t) => t.name === "web_fetch").length;
  const agents = tools.filter((t) => t.name === "delegate_tasks").length;
  const other = tools.length - searches - pages - agents;
  if (searches) parts.push(plural(searches, ["{n} search", "{n} searches"], ["بحث واحد", "بحثان", "{n} عمليات بحث", "{n} عملية بحث"]));
  if (pages) parts.push(plural(pages, ["read {n} page", "read {n} pages"], ["قرأ صفحة", "قرأ صفحتين", "قرأ {n} صفحات", "قرأ {n} صفحة"]));
  if (agents) parts.push(t("ran a swarm"));
  if (other) parts.push(plural(other, ["{n} action", "{n} actions"], ["إجراء واحد", "إجراءان", "{n} إجراءات", "{n} إجراء"]));
  return parts.join(" · ") || t("Done");
}

// ── A reply from the agent ────────────────────────────────────────────────────

class AssistantView {
  readonly el: HTMLElement;
  private activity: HTMLElement;
  private activityHead: HTMLElement;
  private activityBody: HTMLElement;
  private content: HTMLElement;
  private approvalsEl: HTMLElement;
  private filesEl: HTMLElement;
  private sourcesEl: HTMLElement;
  private footer: HTMLElement;
  private text = "";
  private steps: Step[] = [];
  private files: FileRecord[] = [];
  private sources: Source[] = [];
  private status: "streaming" | "complete" | "stopped" | "error" = "streaming";
  private error = "";
  private model = state.model;
  private durationMs = 0;
  private startedAt = Date.now();
  private userToggled = false;
  private frame = 0;
  message: StoredMessage | null = null;

  constructor(saved?: StoredMessage) {
    const avatar = state.current?.agent
      ? h("div", { class: "avatar emoji" }, state.current.agent.emoji)
      : h("div", { class: "avatar", html: logo(20) });
    this.activityHead = h("button", { class: "activity-head", type: "button", onclick: () => this.toggleActivity() });
    this.activityBody = h("div", { class: "activity-body" });
    this.activity = h("div", { class: "activity", hidden: true }, this.activityHead, this.activityBody);
    this.content = h("div", { class: "markdown" });
    this.approvalsEl = h("div", { class: "approvals" });
    this.filesEl = h("div", { class: "msg-files" });
    this.sourcesEl = h("div", { class: "sources" });
    this.footer = h("div", { class: "msg-footer" });
    this.el = h(
      "div",
      { class: "msg assistant" },
      avatar,
      h("div", { class: "msg-body" }, this.activity, this.content, this.approvalsEl, this.filesEl, this.sourcesEl, this.footer),
    );
    if (saved) this.load(saved);
    else {
      this.el.classList.add("streaming");
      this.schedule();
    }
  }

  private load(m: StoredMessage) {
    this.message = m;
    this.text = m.text;
    this.steps = m.steps ?? [];
    this.files = m.files ?? [];
    this.sources = m.sources ?? [];
    this.status = m.status ?? "complete";
    this.error = m.error ?? "";
    this.model = m.model ?? "";
    this.durationMs = m.durationMs ?? 0;
    this.render();
  }

  handle(e: AgentEvent) {
    switch (e.type) {
      case "start":
        this.model = e.model;
        this.startedAt = Date.now();
        break;
      case "text":
        this.text += e.delta;
        this.closeThinking();
        if (!this.userToggled) this.activity.classList.remove("open");
        break;
      case "thinking": {
        let last = this.steps.at(-1);
        if (last?.kind !== "thinking" || last.endedAt) {
          last = { kind: "thinking", text: "", startedAt: Date.now() };
          this.steps.push(last);
        }
        last.text += e.delta;
        break;
      }
      case "step": {
        this.closeThinking();
        if (e.step.kind !== "tool") break;
        const id = e.step.id;
        const i = this.steps.findIndex((s) => s.kind === "tool" && s.id === id);
        if (i >= 0) this.steps[i] = e.step;
        else this.steps.push(e.step);
        break;
      }
      case "file":
        if (!this.files.some((f) => f.id === e.file.id)) this.files.push(e.file);
        break;
      case "sources":
        this.sources = e.sources;
        break;
      case "error":
        this.error = e.error;
        break;
      case "done":
        this.load(e.message);
        if (e.message.status === "complete" && prefs().readAloud) speak(e.message.text);
        return;
    }
    this.schedule();
  }

  fail(message: string) {
    this.status = "error";
    this.error = message;
    this.render();
  }

  private closeThinking() {
    const last = this.steps.at(-1);
    if (last?.kind === "thinking" && !last.endedAt) last.endedAt = Date.now();
  }

  private toggleActivity() {
    this.userToggled = true;
    this.activity.classList.toggle("open");
  }

  private schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.render();
    });
  }

  private render() {
    const streaming = this.status === "streaming";
    this.el.classList.toggle("streaming", streaming);

    // Activity: thinking and tool steps
    this.activity.hidden = this.steps.length === 0 && !(streaming && !this.text);
    if (streaming && !this.text && !this.userToggled) this.activity.classList.add("open");
    clear(this.activityHead);
    this.activityHead.append(
      h("span", { class: `activity-icon${streaming ? " spin" : ""}`, html: streaming ? "" : icon("sparkle", 15) }),
      h("span", { class: "activity-label" }, activitySummary(this.steps, streaming)),
      h("span", { class: "activity-chevron", html: icon("chevron", 15) }),
    );
    clear(this.activityBody);
    for (const step of this.steps) this.activityBody.append(renderStep(step));

    // The answer
    this.content.innerHTML = this.text ? renderMarkdown(this.text) : "";
    this.content.classList.toggle("caret", streaming);
    if (this.status === "error") {
      this.content.append(
        h(
          "div",
          { class: "msg-error" },
          h("span", { html: icon("alert", 16) }),
          h("span", null, t(this.error || "Something went wrong.")),
          isLast(this.el) ? h("button", { class: "btn small", onclick: () => void regenerate() }, t("Retry")) : null,
        ),
      );
    } else if (this.status === "stopped") {
      this.content.append(h("div", { class: "msg-note" }, t("Stopped")));
    }

    // Things waiting for your OK (emails it drafted)
    const approvals = this.steps.flatMap((s) => (s.kind === "tool" && s.approval ? [s.approval] : []));
    if (approvals.length !== this.approvalsEl.childElementCount) {
      clear(this.approvalsEl);
      for (const a of approvals) this.approvalsEl.append(emailApprovalCard(a));
    }

    // Files and images it made
    clear(this.filesEl);
    for (const f of this.files) this.filesEl.append(fileView(f));

    // Sources
    clear(this.sourcesEl);
    if (this.sources.length) {
      const shown = this.sources.slice(0, 6);
      for (const s of shown) this.sourcesEl.append(sourceChip(s));
      if (this.sources.length > shown.length) {
        const more = h("button", { class: "source more", type: "button" }, t("+{n} more", { n: this.sources.length - shown.length }));
        more.addEventListener("click", () => {
          more.remove();
          for (const s of this.sources.slice(shown.length)) this.sourcesEl.append(sourceChip(s));
        });
        this.sourcesEl.append(more);
      }
    }

    // Actions
    clear(this.footer);
    if (!streaming) {
      const copy = h("button", { class: "icon-btn", title: t("Copy"), html: icon("copy", 15) });
      copy.addEventListener("click", () => {
        void navigator.clipboard.writeText(this.text).then(() => {
          copy.innerHTML = icon("check", 15);
          setTimeout(() => (copy.innerHTML = icon("copy", 15)), 1500);
        });
      });
      const seconds = this.durationMs ? `${(this.durationMs / 1000).toFixed(this.durationMs < 10_000 ? 1 : 0)}s` : "";
      const usage = this.message?.usage;
      append(this.footer, [
        copy,
        this.message?.provider === "system"
          ? null
          : h("button", { class: "icon-btn act-regenerate", title: t("Regenerate"), html: icon("refresh", 15), onclick: () => void regenerate() }),
        this.text ? h("button", { class: "icon-btn", title: t("Read aloud"), html: icon("volume", 15), onclick: () => speak(this.text) }) : null,
        h(
          "span",
          { class: "msg-meta", title: usage ? t("{in} tokens in · {out} out", { in: usage.inputTokens.toLocaleString(), out: usage.outputTokens.toLocaleString() }) : "" },
          [this.model && this.message?.provider !== "system" ? shortModel(this.model) : "", seconds].filter(Boolean).join(" · "),
        ),
      ]);
    }
    if (stickToBottom) scrollToBottom();
  }
}

// Drafts you've already sent or discarded, remembered in this browser.
const DRAFTS_KEY = "dizz.drafts";
function draftState(id: string): string | undefined {
  try {
    return (JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? "{}") as Record<string, string>)[id];
  } catch {
    return undefined;
  }
}
function setDraftState(id: string, value: string) {
  try {
    const all = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? "{}") as Record<string, string>;
    all[id] = value;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    // private mode
  }
}

function emailApprovalCard(a: EmailApproval): HTMLElement {
  const actions = h("div", { class: "approval-actions" });
  const statusEl = h("span", { class: "approval-status" });
  const card = h(
    "div",
    { class: "approval" },
    h("div", { class: "approval-head" }, h("span", { html: icon("mail", 16) }), h("span", null, t("Email draft")), statusEl),
    h("div", { class: "approval-meta" }, h("div", null, h("span", { class: "muted" }, `${t("To")} `), a.to), h("div", null, h("span", { class: "muted" }, `${t("Subject")} `), a.subject || t("(no subject)"))),
    h("div", { class: "approval-preview", dir: "auto" }, a.preview),
    actions,
  );
  const settle = (state: "sent" | "discarded") => {
    setDraftState(a.draftId, state);
    card.classList.add(state);
    statusEl.textContent = state === "sent" ? t("Sent") : t("Discarded");
    clear(actions);
  };
  const act = async (action: "send" | "discard", button: HTMLButtonElement) => {
    button.disabled = true;
    try {
      await api(`/api/connectors/${a.connectorId}/email/${action}`, { body: { draftId: a.draftId } });
      settle(action === "send" ? "sent" : "discarded");
      if (action === "send") toast(t("Sent to {to}", { to: a.to }), "success");
    } catch (err) {
      toast((err as Error).message, "error");
      button.disabled = false;
    }
  };
  const known = draftState(a.draftId);
  if (known === "sent" || known === "discarded") {
    settle(known);
    return card;
  }
  statusEl.textContent = t("Waiting for you");
  const send = h("button", { class: "btn primary small", type: "button" }, h("span", { html: icon("send", 14) }), t("Send"));
  const discard = h("button", { class: "btn ghost small", type: "button" }, t("Discard"));
  send.addEventListener("click", () => void act("send", send));
  discard.addEventListener("click", () => void act("discard", discard));
  actions.append(
    send,
    discard,
    h("a", { class: "btn ghost small", href: "https://mail.google.com/mail/u/0/#drafts", target: "_blank", rel: "noopener" }, t("Edit in Gmail"), h("span", { html: icon("external", 13) })),
  );
  return card;
}

function renderStep(step: Step): HTMLElement {
  if (step.kind === "thinking") {
    return h(
      "div",
      { class: "step thinking" },
      h("div", { class: "step-line" }, h("span", { class: "step-icon", html: icon("brain", 14) }), h("span", null, step.endedAt ? t("Thought") : t("Thinking"))),
      step.text.trim() ? h("div", { class: "thinking-text", dir: "auto" }, step.text.trim()) : null,
    );
  }
  const detail = step.detail ? h("pre", { class: "step-detail", hidden: true }, step.detail) : null;
  const line = h(
    "button",
    { class: "step-line", type: "button", disabled: !detail },
    h("span", { class: "step-icon", html: icon(STEP_ICONS[step.name] ?? (step.name.includes("__") ? "plug" : "zap"), 14) }),
    h("span", { class: "step-label", dir: "auto" }, step.label),
    step.result ? h("span", { class: "step-result" }, step.result) : null,
    h("span", { class: `step-status ${step.status}`, html: step.status === "ok" ? icon("check", 13) : step.status === "error" ? icon("x", 13) : "" }),
  );
  if (detail) line.addEventListener("click", () => (detail.hidden = !detail.hidden));
  return h("div", { class: `step tool ${step.status}` }, line, detail);
}

function sourceChip(s: Source): HTMLElement {
  return h(
    "a",
    { class: "source", href: s.url, target: "_blank", rel: "noopener noreferrer", title: s.title },
    h("span", { class: "source-host" }, hostOf(s.url)),
    h("span", { class: "source-title" }, s.title),
  );
}

const isImage = (f: FileRecord) => /^image\/(png|jpeg|gif|webp)$/.test(f.mime);

function fileView(f: FileRecord): HTMLElement {
  const url = fileUrl(f.id);
  if (isImage(f)) {
    return h(
      "a",
      { class: "msg-image", href: url, target: "_blank", rel: "noopener" },
      h("img", { src: url, alt: f.name, loading: "lazy" }),
    );
  }
  return h(
    "a",
    { class: "file-card", href: fileUrl(f.id, true), download: f.name.split("/").pop() },
    h("span", { class: "file-card-icon", html: icon("file", 18) }),
    h("span", { class: "file-card-text" }, h("span", { class: "file-card-name" }, f.name), h("span", { class: "file-card-size" }, formatSize(f.size))),
    h("span", { class: "file-card-dl", html: icon("download", 16) }),
  );
}

function userView(m: Pick<StoredMessage, "text" | "attachments" | "scheduled">): HTMLElement {
  const attachments = (m.attachments ?? []).map((a) =>
    isImage(a)
      ? h("a", { class: "user-image", href: fileUrl(a.id), target: "_blank" }, h("img", { src: fileUrl(a.id), alt: a.name }))
      : h("span", { class: "chip" }, h("span", { html: icon("file", 13) }), a.name),
  );
  const copy = h("button", { class: "icon-btn", title: t("Copy"), html: icon("copy", 14) });
  copy.addEventListener("click", () => void navigator.clipboard.writeText(m.text));
  const edit = h("button", { class: "icon-btn", title: t("Edit in the composer"), html: icon("edit", 14) });
  edit.addEventListener("click", () => {
    textarea.value = m.text;
    autosize();
    textarea.focus();
  });
  return h(
    "div",
    { class: `msg user${m.scheduled ? " scheduled" : ""}` },
    m.scheduled ? h("div", { class: "scheduled-tag" }, h("span", { html: icon("clock", 12) }), t("Scheduled task")) : null,
    attachments.length ? h("div", { class: "user-attachments" }, attachments) : null,
    m.text ? h("div", { class: "bubble", dir: "auto" }, m.text) : null,
    h("div", { class: "msg-footer user-footer" }, copy, edit),
  );
}

const isLast = (el: HTMLElement) => el.parentElement?.lastElementChild === el;

// ── Speech ───────────────────────────────────────────────────────────────────

function speak(markdown: string) {
  if (!("speechSynthesis" in window)) return toast(t("This browser can't read aloud"), "error");
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    return;
  }
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " (code) ")
    .replace(/[#*_>`~|]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  speechSynthesis.speak(new SpeechSynthesisUtterance(plain));
}

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
let recognition: Recognition | null = null;

function toggleDictation() {
  const Ctor = (window as unknown as Record<string, new () => Recognition>).SpeechRecognition ??
    (window as unknown as Record<string, new () => Recognition>).webkitSpeechRecognition;
  if (!Ctor) return toast(t("Voice input isn't supported in this browser"), "error");
  if (recognition) {
    recognition.stop();
    return;
  }
  const base = textarea.value ? `${textarea.value.trimEnd()} ` : "";
  recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang() === "ar" ? (navigator.language?.startsWith("ar") ? navigator.language : "ar-AE") : navigator.language || "en-US";
  recognition.onresult = (e) => {
    let transcript = "";
    for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
    textarea.value = base + transcript;
    autosize();
  };
  recognition.onerror = (e) => {
    if (e.error !== "aborted" && e.error !== "no-speech") toast(t("Voice input: {error}", { error: e.error }), "error");
  };
  recognition.onend = () => {
    recognition = null;
    micBtn.classList.remove("listening");
  };
  micBtn.classList.add("listening");
  recognition.start();
}

// ── Composer ─────────────────────────────────────────────────────────────────

function autosize() {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, window.innerHeight * 0.4)}px`;
  updateSendState();
}

function updateSendState() {
  if (busy) {
    sendBtn.innerHTML = icon("stop", 16);
    sendBtn.title = t("Stop");
    sendBtn.disabled = false;
    sendBtn.classList.add("stop");
    return;
  }
  sendBtn.classList.remove("stop");
  sendBtn.innerHTML = icon("send", 18);
  sendBtn.title = t("Send (Enter)");
  sendBtn.disabled = !textarea.value.trim() && pending.length === 0;
}

function updateModelButton() {
  const effort = EFFORTS.find((e) => e.id === state.effort)!;
  modelBtn.innerHTML = "";
  modelBtn.append(
    h("span", { class: "model-name" }, shortModel(state.model)),
    h("span", { class: "model-effort" }, t(effort.label)),
    h("span", { html: icon("chevron", 14) }),
  );
}

function openModelMenu() {
  const existing = $(".popover.model-menu");
  if (existing) {
    existing.remove();
    return;
  }
  const menu = h("div", { class: "popover model-menu", role: "menu" });
  const groups = new Map<string, typeof state.boot.models>();
  for (const m of state.boot.models) {
    const label = m.provider === "anthropic" ? "Claude" : m.provider === "xai" ? "Grok" : t("Demo");
    groups.set(label, [...(groups.get(label) ?? []), m]);
  }
  for (const [label, models] of groups) {
    menu.append(h("div", { class: "menu-label" }, label));
    for (const m of models) {
      menu.append(
        h(
          "button",
          {
            class: `menu-item${m.id === state.model ? " selected" : ""}`,
            type: "button",
            onclick: () => {
              state.model = m.id;
              savePrefs({ model: m.id });
              updateModelButton();
              menu.remove();
            },
          },
          h("span", { class: "menu-item-text" }, h("span", null, t(m.label)), h("small", null, t(m.blurb))),
          m.id === state.model ? h("span", { class: "menu-check", html: icon("check", 15) }) : null,
        ),
      );
    }
  }
  const seg = h("div", { class: "segmented" });
  for (const e of EFFORTS) {
    seg.append(
      h(
        "button",
        {
          class: e.id === state.effort ? "active" : "",
          type: "button",
          title: t(e.hint),
          onclick: () => {
            state.effort = e.id;
            savePrefs({ effort: e.id });
            updateModelButton();
            menu.remove();
          },
        },
        t(e.label),
      ),
    );
  }
  menu.append(h("div", { class: "menu-label" }, t("Thinking")), seg);
  modelBtn.parentElement!.append(menu);
  const close = (ev: MouseEvent) => {
    if (!menu.contains(ev.target as Node) && ev.target !== modelBtn && !modelBtn.contains(ev.target as Node)) {
      menu.remove();
      document.removeEventListener("mousedown", close);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", close));
}

export function addFiles(files: Iterable<File>) {
  for (const file of files) {
    if (pending.length >= 20) {
      toast(t("Up to 20 files per message"), "error");
      break;
    }
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    const remove = h("button", { class: "chip-x", type: "button", title: t("Remove"), html: icon("x", 12) });
    const el = h(
      "div",
      { class: "attachment uploading" },
      preview ? h("img", { src: preview, alt: "" }) : h("span", { class: "attachment-icon", html: icon("file", 16) }),
      h("span", { class: "attachment-name" }, file.name),
      remove,
    );
    const entry: (typeof pending)[number] = {
      file: null,
      name: file.name,
      preview,
      el,
      promise: prepareImage(file)
        .then((blob) => upload<FileRecord>(blob, file.name, state.current?.conversation.id ?? null))
        .then((record) => {
          entry.file = record;
          el.classList.remove("uploading");
          return record;
        })
        .catch((err: Error) => {
          toast(t("Couldn't upload {name}: {error}", { name: file.name, error: t(err.message) }), "error");
          drop();
          return null;
        }),
    };
    const drop = () => {
      pending = pending.filter((p) => p !== entry);
      el.remove();
      if (preview) URL.revokeObjectURL(preview);
      attachRow.hidden = pending.length === 0;
      updateSendState();
    };
    remove.addEventListener("click", drop);
    pending.push(entry);
    attachRow.append(el);
    attachRow.hidden = false;
  }
  updateSendState();
}

/** Sends something said on a voice call and resolves with the reply's text (null if there wasn't one). */
export async function sendSpoken(text: string): Promise<string | null> {
  await send(text, { voice: true });
  const last = state.current?.messages.at(-1);
  return last?.role === "assistant" ? last.text || last.error || null : null;
}

async function send(textOverride?: string, opts: { voice?: boolean } = {}) {
  if (busy) return;
  const text = (textOverride ?? textarea.value).trim();
  if (!text && !pending.length) return;
  busy = true;
  updateSendState();
  try {
    const uploads = (await Promise.all(pending.map((p) => p.promise))).filter((f): f is FileRecord => !!f);
    if (!state.current) {
      const conversation = await api<OpenConversation["conversation"]>("/api/conversations", {
        body: { agentId: state.draftAgent?.id ?? null },
      });
      state.current = { conversation, agent: state.draftAgent, messages: [], running: false };
      hooks.created(conversation.id);
    }
    const conversationId = state.current.conversation.id;
    main.classList.remove("empty");
    threadInner.querySelector(".empty-state")?.remove();
    renderHeader();
    for (const p of pending) if (p.preview) URL.revokeObjectURL(p.preview);
    pending = [];
    clear(attachRow);
    attachRow.hidden = true;
    textarea.value = "";
    autosize();
    threadInner.append(userView({ text, attachments: uploads }));
    stickToBottom = true;
    await runStream(`/api/conversations/${conversationId}/messages`, "POST", {
      text,
      attachmentIds: uploads.map((u) => u.id),
      model: state.model,
      effort: state.effort,
      ...(opts.voice ? { voice: true } : {}),
    });
  } catch (err) {
    toast((err as Error).message, "error");
  } finally {
    busy = false;
    updateSendState();
    hooks.changed();
  }
}

async function runStream(url: string, method: "GET" | "POST", body?: unknown, existing?: AssistantView) {
  const conversationId = state.current!.conversation.id;
  const view = existing ?? new AssistantView();
  if (!existing) threadInner.append(view.el);
  streamAbort?.abort();
  const controller = new AbortController();
  streamAbort = controller;
  busy = true;
  updateSendState();
  try {
    const streamed = await stream(url, { method, body, signal: controller.signal }, (e) => {
      if (e.type === "title") {
        if (state.current?.conversation.id === conversationId) {
          state.current.conversation.title = e.title;
          renderHeader();
        }
        hooks.titled(conversationId, e.title);
        return;
      }
      view.handle(e);
      if (e.type === "done") state.current?.messages.push(e.message);
    });
    if (!streamed) view.el.remove();
  } catch (err) {
    if (controller.signal.aborted) return;
    view.fail((err as Error).message);
  } finally {
    if (streamAbort === controller) {
      streamAbort = null;
      busy = false;
      updateSendState();
    }
  }
}

async function stop() {
  if (!state.current) return;
  await api(`/api/conversations/${state.current.conversation.id}/stop`, { body: {} }).catch(() => {});
}

async function regenerate() {
  if (!state.current || busy) return;
  const last = threadInner.lastElementChild;
  if (last?.classList.contains("assistant")) last.remove();
  const msgs = state.current.messages;
  if (msgs.at(-1)?.role === "assistant") msgs.pop();
  stickToBottom = true;
  await runStream(`/api/conversations/${state.current.conversation.id}/regenerate`, "POST", { model: state.model, effort: state.effort });
  hooks.changed();
}

// ── Header & empty state ─────────────────────────────────────────────────────

export function renderHeader() {
  const c = state.current;
  const agent = c?.agent ?? state.draftAgent;
  titleEl.textContent = c?.conversation.title || (agent ? `${agent.emoji} ${agent.name}` : c ? t("New chat") : "");
  document.title = c?.conversation.title ? `${c.conversation.title} · ${state.boot.agentName}` : state.boot.agentName;
}

function suggestionList(): { label: string; prompt?: string; action?: () => void; icon: IconName }[] {
  const items: { label: string; prompt?: string; action?: () => void; icon: IconName }[] = [
    { icon: "globe", label: t("What's happening in the world today?"), prompt: t("What are the biggest news stories today? Give me a quick briefing with sources.") },
    {
      icon: "users",
      label: t("Build me a team of agents"),
      prompt: t("Create a team of 5 specialist agents to help me launch a business: a strategist, a market researcher, a marketer, a finance analyst and a copywriter."),
    },
    {
      icon: "bell",
      label: t("Daily briefing at 8am"),
      prompt: t("Every weekday at 8:00, give me a short briefing: top news, the weather where I am, and anything on my reminders."),
    },
    { icon: "file", label: t("Analyse a file"), action: () => fileInput.click() },
  ];
  if (state.boot.features.imageGeneration) items.push({ icon: "image", label: t("Generate an image"), prompt: t("Generate an image of a futuristic desert city at golden hour, cinematic, ultra detailed.") });
  if (state.boot.features.codeExecution) items.push({ icon: "code", label: t("Chart something with code"), prompt: t("Write and run Python to plot compound interest on $10,000 at 7% over 30 years, and show me the chart.") });
  return items;
}

function renderEmpty() {
  const agent = state.draftAgent ?? state.current?.agent ?? null;
  const hero = agent
    ? h(
        "div",
        { class: "hero" },
        h("div", { class: "hero-emoji" }, agent.emoji),
        h("h1", null, agent.name),
        agent.description ? h("p", { class: "hero-sub" }, agent.description) : null,
      )
    : h(
        "div",
        { class: "hero" },
        h("div", { class: "hero-logo", html: logo(52) }),
        h("h1", null, greeting(state.boot.settings.userName)),
        h("p", { class: "hero-sub" }, t("What can I do for you?")),
        state.boot.demo
          ? h("p", { class: "demo-note" }, t("Demo: this runs in your browser with scripted replies. Install Dizz Lab on your computer to talk to Claude and Grok."))
          : state.boot.cloud && !state.boot.ai
            ? h("p", { class: "demo-note" }, t("Claude can't be reached from here. Open this page in the Claude app or on claude.ai to chat."))
            : state.boot.cloud && !state.boot.persistent
              ? h("p", { class: "demo-note" }, t("Nothing is saved in this view. Open this page in Claude while signed in to keep your chats."))
              : null,
      );
  const suggestions = h("div", { class: "suggestions" });
  if (!agent) {
    for (const s of suggestionList()) {
      suggestions.append(
        h(
          "button",
          {
            class: "suggestion",
            type: "button",
            onclick: () => {
              if (s.action) s.action();
              else if (s.prompt) void send(s.prompt);
            },
          },
          h("span", { html: icon(s.icon, 15) }),
          s.label,
        ),
      );
    }
  }
  return h("div", { class: "empty-state" }, hero, suggestions);
}

export function scrollToBottom() {
  thread.scrollTop = thread.scrollHeight;
}

// ── Opening a chat ───────────────────────────────────────────────────────────

/** Shows a conversation (or a fresh chat when null). */
export function showConversation(data: OpenConversation | null) {
  streamAbort?.abort();
  streamAbort = null;
  busy = false;
  state.current = data;
  clear(threadInner);
  stickToBottom = true;
  main.classList.toggle("empty", !data || data.messages.length === 0);
  if (!data || (data.messages.length === 0 && !data.running)) threadInner.append(renderEmpty());
  for (const m of data?.messages ?? []) threadInner.append(m.role === "user" ? userView(m) : new AssistantView(m).el);
  renderHeader();
  updateSendState();
  requestAnimationFrame(scrollToBottom);
  // Still working (you came back mid-reply, or a scheduled task is running): follow it live.
  if (data?.running) void runStream(`/api/conversations/${data.conversation.id}/stream`, "GET").then(() => hooks.changed());
  if (matchMedia("(min-width: 900px)").matches) textarea.focus();
}

/** A chat changed on the server while it's open (a reminder fired, a scheduled task started). */
export async function refreshIfOpen(conversationId: string, running: boolean) {
  if (state.current?.conversation.id !== conversationId || busy) return;
  const data = await api<OpenConversation>(`/api/conversations/${conversationId}`);
  if (state.current?.conversation.id !== conversationId || busy) return;
  if (running || data.messages.length !== state.current.messages.length) showConversation(data);
}

export function isBusy() {
  return busy;
}

export function focusComposer() {
  textarea.focus();
}

// ── Mount ────────────────────────────────────────────────────────────────────

export function mountChat(root: HTMLElement, chatHooks: ChatHooks, onMenu: () => void, onConversationMenu: (anchor: HTMLElement) => void) {
  hooks = chatHooks;
  titleEl = h("div", { class: "topbar-title" });
  const more = h("button", { class: "icon-btn", title: t("Chat options"), html: icon("dots", 18) });
  more.addEventListener("click", () => onConversationMenu(more));
  const topbar = h(
    "header",
    { class: "topbar" },
    h("button", { class: "icon-btn menu-btn", title: t("Menu"), html: icon("menu", 20), onclick: onMenu }),
    titleEl,
    h("div", { class: "spacer" }),
    more,
  );

  threadInner = h("div", { class: "thread-inner" });
  thread = h("div", { class: "thread" }, threadInner);
  thread.addEventListener("scroll", () => {
    stickToBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80;
  });

  textarea = h("textarea", { rows: 1, placeholder: t("Ask anything"), "aria-label": t("Message"), enterkeyhint: "send", dir: "auto" });
  textarea.addEventListener("input", autosize);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !matchMedia("(pointer: coarse)").matches) {
      e.preventDefault();
      void send();
    }
  });
  textarea.addEventListener("paste", (e) => {
    const files = [...(e.clipboardData?.files ?? [])];
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  });

  fileInput = h("input", { type: "file", multiple: true, hidden: true });
  fileInput.addEventListener("change", () => {
    addFiles([...(fileInput.files ?? [])]);
    fileInput.value = "";
  });
  attachRow = h("div", { class: "attachments", hidden: true });
  sendBtn = h("button", { class: "send-btn", type: "button" });
  sendBtn.addEventListener("click", () => (busy ? void stop() : void send()));
  modelBtn = h("button", { class: "model-btn", type: "button", title: t("Model and thinking") });
  modelBtn.addEventListener("click", openModelMenu);
  micBtn = h("button", { class: "icon-btn mic-btn", type: "button", title: t("Dictate"), html: icon("mic", 18), onclick: toggleDictation });
  const hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  const composer = h(
    "div",
    { class: "composer" },
    attachRow,
    textarea,
    h(
      "div",
      { class: "composer-bar" },
      h("button", { class: "icon-btn", type: "button", title: t("Attach files"), html: icon("paperclip", 18), onclick: () => fileInput.click() }),
      h("div", { class: "model-wrap" }, modelBtn),
      h("div", { class: "spacer" }),
      hasSpeech ? micBtn : null,
      hasSpeech ? h("button", { class: "icon-btn call-btn", type: "button", title: t("Voice call"), "aria-label": t("Voice call"), html: icon("phone", 18), onclick: () => startCall() }) : null,
      sendBtn,
    ),
    fileInput,
  );
  const dock = h("div", { class: "composer-dock" }, composer, h("div", { class: "disclaimer" }, t("AI can make mistakes. Check important facts.")));

  const dropzone = h("div", { class: "dropzone" }, h("div", null, h("span", { html: icon("upload", 28) }), h("p", null, t("Drop files to attach"))));
  main = h("main", { class: "main empty" }, topbar, thread, dock, dropzone);
  let dragDepth = 0;
  main.addEventListener("dragenter", (e) => {
    if (!e.dataTransfer?.types.includes("Files")) return;
    dragDepth++;
    main.classList.add("dragging");
  });
  main.addEventListener("dragleave", () => {
    if (--dragDepth <= 0) {
      dragDepth = 0;
      main.classList.remove("dragging");
    }
  });
  main.addEventListener("dragover", (e) => e.preventDefault());
  main.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDepth = 0;
    main.classList.remove("dragging");
    addFiles([...(e.dataTransfer?.files ?? [])]);
  });

  root.append(main);
  updateModelButton();
  updateSendState();
}

/** Picks the model for a chat: the agent's own if it has one, otherwise your last choice or default. */
export function applyModelFor(agent: OpenConversation["agent"]) {
  const candidates = [agent?.model, prefs().model, state.boot.settings.defaultModel];
  state.model = candidates.find((id): id is string => !!id && !!modelInfo(id)) ?? state.boot.models[0].id;
  const effort = agent?.effort ?? prefs().effort ?? state.boot.settings.effort;
  if (effort) state.effort = effort;
  updateModelButton();
}

export { updateModelButton };
