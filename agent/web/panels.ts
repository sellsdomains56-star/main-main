import { api, upload } from "./api.js";
import { clear, h } from "./dom.js";
import { icon } from "./icons.js";
import { EFFORTS, prefs, savePrefs, state, type AgentProfile, type FileRecord, type Settings, type ToolGroup } from "./state.js";
import { confirmDialog, debounce, formatDateTime, formatSize, toast } from "./util.js";

interface Memory {
  id: string;
  text: string;
  category: string;
  createdAt: number;
}
interface Reminder {
  id: string;
  message: string;
  task: string | null;
  nextRun: number;
  repeat: string;
  conversationId: string | null;
}

function modal(title: string, body: HTMLElement, opts: { wide?: boolean; actions?: HTMLElement[]; onClose?: () => void } = {}) {
  const dialog = h(
    "dialog",
    { class: `modal${opts.wide ? " wide" : ""}` },
    h(
      "div",
      { class: "modal-head" },
      h("h2", null, title),
      h("div", { class: "spacer" }),
      ...(opts.actions ?? []),
      h("button", { class: "icon-btn", title: "Close", html: icon("x", 18), onclick: () => close() }),
    ),
    h("div", { class: "modal-body" }, body),
  );
  const close = () => {
    dialog.close();
    dialog.remove();
    opts.onClose?.();
  };
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener("mousedown", (e) => {
    if (e.target === dialog) close();
  });
  document.body.append(dialog);
  dialog.showModal();
  return { dialog, close };
}

const empty = (text: string, sub?: string) => h("div", { class: "panel-empty" }, h("p", null, text), sub ? h("small", null, sub) : null);

// ── Agents ────────────────────────────────────────────────────────────────────

const ABILITY_LABELS: Record<ToolGroup, string> = {
  web: "Web & X search",
  memory: "Memory",
  reminders: "Reminders & tasks",
  files: "Files",
  code: "Run code",
  images: "Image generation",
  connectors: "Connected apps (Gmail…)",
  agents: "Run other agents",
};

export function openAgents(onChat: (agent: AgentProfile) => void) {
  const list = h("div", { class: "agent-grid" });
  const countEl = h("span", { class: "muted" });
  const search = h("input", { class: "input", type: "search", placeholder: "Search agents" });
  const loadMore = h("button", { class: "btn ghost load-more", hidden: true }, "Load more");
  let offset = 0;
  const PAGE = 60;

  const card = (a: AgentProfile) =>
    h(
      "div",
      { class: "agent-card" },
      h("div", { class: "agent-card-top" }, h("span", { class: "agent-emoji" }, a.emoji), h("div", { class: "agent-card-name" }, a.name)),
      h("p", { class: "agent-card-desc" }, a.description || a.instructions.slice(0, 140) || "No description"),
      h(
        "div",
        { class: "agent-card-meta" },
        a.model ? h("span", { class: "tag" }, state.boot.models.find((m) => m.id === a.model)?.label ?? a.model) : h("span", { class: "tag" }, "Default model"),
        a.tools ? h("span", { class: "tag" }, `${a.tools.length} abilities`) : null,
      ),
      h(
        "div",
        { class: "agent-card-actions" },
        h("button", { class: "btn small primary", onclick: () => (close(), onChat(a)) }, h("span", { html: icon("message", 14) }), "Chat"),
        h("button", { class: "icon-btn", title: "Edit", html: icon("edit", 15), onclick: () => editAgent(a, () => reload()) }),
        h(
          "button",
          {
            class: "icon-btn",
            title: "Delete",
            html: icon("trash", 15),
            onclick: async () => {
              if (!(await confirmDialog(`Delete ${a.name}? Its chats are kept.`))) return;
              await api(`/api/agents/${a.id}`, { method: "DELETE" });
              reload();
            },
          },
        ),
      ),
    );

  async function load(reset: boolean) {
    if (reset) {
      offset = 0;
      clear(list);
    }
    const q = encodeURIComponent(search.value);
    const { agents, total } = await api<{ agents: AgentProfile[]; total: number }>(`/api/agents?q=${q}&limit=${PAGE}&offset=${offset}`);
    countEl.textContent = `${total.toLocaleString()} agent${total === 1 ? "" : "s"}`;
    if (reset && !agents.length) {
      list.append(
        search.value
          ? empty("No agents match.")
          : empty("No agents yet.", "Create one here, import a JSON file, or just ask in any chat: “Create 20 agents for…”."),
      );
    }
    for (const a of agents) list.append(card(a));
    offset += agents.length;
    loadMore.hidden = agents.length < PAGE;
  }
  const reload = () => void load(true);
  search.addEventListener("input", debounce(reload, 200));
  loadMore.addEventListener("click", () => void load(false));

  const importInput = h("input", { type: "file", accept: "application/json,.json", hidden: true });
  importInput.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    importInput.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const result = await api<{ created: number; skipped: string[] }>("/api/agents/import", { body: Array.isArray(data) ? data : [data] });
      toast(`Imported ${result.created} agent${result.created === 1 ? "" : "s"}${result.skipped.length ? `, skipped ${result.skipped.length} duplicates` : ""}`, "success");
      reload();
    } catch (err) {
      toast(`Import failed: ${(err as Error).message}`, "error");
    }
  });

  const body = h(
    "div",
    { class: "agents-panel" },
    h(
      "p",
      { class: "panel-intro" },
      `Agents are specialists with their own instructions, model and abilities. Chat with one directly, or let ${state.boot.agentName} run many at once: `,
      h("em", null, "“use my research agents to compare these 30 laptops”"),
      `. Up to ${state.boot.features.swarmConcurrency} work at the same time.`,
    ),
    h("div", { class: "panel-toolbar" }, search, countEl),
    list,
    loadMore,
    importInput,
  );
  const { close } = modal("Agents", body, {
    wide: true,
    actions: [
      h("button", { class: "btn ghost small", onclick: () => importInput.click(), title: "Import agents from a JSON file" }, h("span", { html: icon("upload", 14) }), "Import"),
      h("a", { class: "btn ghost small", href: "/api/agents/export", download: "agents.json", title: "Download all agents as JSON" }, h("span", { html: icon("download", 14) }), "Export"),
      h("button", { class: "btn primary small", onclick: () => editAgent(null, reload) }, h("span", { html: icon("plus", 14) }), "New agent"),
    ],
  });
  reload();
}

export function editAgent(agent: AgentProfile | null, onSaved: (a: AgentProfile) => void) {
  const emoji = h("input", { class: "input emoji-input", value: agent?.emoji ?? "🤖", maxlength: 8, "aria-label": "Emoji" });
  const name = h("input", { class: "input", value: agent?.name ?? "", placeholder: "e.g. Market Researcher", maxlength: 60, required: true });
  const description = h("input", { class: "input", value: agent?.description ?? "", placeholder: "One line on what it's for", maxlength: 300 });
  const instructions = h("textarea", {
    class: "input",
    rows: 6,
    placeholder: "Who it is, what it's expert in, how it should work and what its answers should look like.",
  });
  instructions.value = agent?.instructions ?? "";
  const model = h("select", { class: "input" }, h("option", { value: "" }, "Your default model"));
  for (const m of state.boot.models) model.append(h("option", { value: m.id, selected: agent?.model === m.id }, m.label));
  const effort = h("select", { class: "input" }, h("option", { value: "" }, "Your default"));
  for (const e of EFFORTS) effort.append(h("option", { value: e.id, selected: agent?.effort === e.id }, `${e.label} — ${e.hint}`));
  const abilities = h("div", { class: "checks" });
  for (const g of state.boot.toolGroups) {
    abilities.append(
      h("label", { class: "check" }, h("input", { type: "checkbox", value: g, checked: !agent?.tools || agent.tools.includes(g) }), ABILITY_LABELS[g]),
    );
  }
  const error = h("p", { class: "form-error", hidden: true });
  const form = h(
    "form",
    { class: "form" },
    h("div", { class: "row" }, h("label", { class: "field emoji-field" }, "Icon", emoji), h("label", { class: "field grow" }, "Name", name)),
    h("label", { class: "field" }, "Description", description),
    h("label", { class: "field" }, "Instructions", instructions),
    h("div", { class: "row" }, h("label", { class: "field grow" }, "Model", model), h("label", { class: "field grow" }, "Thinking", effort)),
    h("fieldset", { class: "field" }, h("legend", null, "Abilities"), abilities),
    error,
    h(
      "div",
      { class: "modal-actions" },
      h("button", { class: "btn ghost", type: "button", onclick: () => close() }, "Cancel"),
      h("button", { class: "btn primary", type: "submit" }, agent ? "Save" : "Create agent"),
    ),
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tools = [...abilities.querySelectorAll<HTMLInputElement>("input:checked")].map((i) => i.value as ToolGroup);
    const body = {
      name: name.value.trim(),
      emoji: emoji.value.trim() || "🤖",
      description: description.value.trim(),
      instructions: instructions.value.trim(),
      model: model.value || null,
      effort: effort.value || null,
      tools: tools.length === state.boot.toolGroups.length ? null : tools,
    };
    try {
      const saved = agent
        ? await api<AgentProfile>(`/api/agents/${agent.id}`, { method: "PATCH", body })
        : await api<AgentProfile>("/api/agents", { body });
      close();
      toast(agent ? "Saved" : `${saved.emoji} ${saved.name} is ready`, "success");
      onSaved(saved);
    } catch (err) {
      error.textContent = (err as Error).message;
      error.hidden = false;
    }
  });
  const { close } = modal(agent ? `Edit ${agent.name}` : "New agent", form);
  name.focus();
}

// ── Memory ────────────────────────────────────────────────────────────────────

export function openMemory() {
  const list = h("div", { class: "list" });
  const input = h("input", { class: "input", placeholder: "Add something to remember, e.g. “I'm vegetarian”" });
  const form = h("form", { class: "inline-form" }, input, h("button", { class: "btn primary", type: "submit" }, "Add"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    await api("/api/memories", { body: { text: input.value.trim(), category: "about_me" } });
    input.value = "";
    void load();
  });
  async function load() {
    const memories = await api<Memory[]>("/api/memories");
    clear(list);
    if (!memories.length) list.append(empty("Nothing remembered yet.", "Tell the agent about yourself and it will remember, or add facts here."));
    for (const m of memories.reverse()) {
      list.append(
        h(
          "div",
          { class: "list-row" },
          h("div", { class: "list-main" }, h("div", null, m.text), h("small", null, `${m.category.replace("_", " ")} · ${formatDateTime(m.createdAt)}`)),
          h("button", {
            class: "icon-btn",
            title: "Forget",
            html: icon("trash", 15),
            onclick: async () => {
              await api(`/api/memories/${m.id}`, { method: "DELETE" });
              void load();
            },
          }),
        ),
      );
    }
  }
  modal("Memory", h("div", null, h("p", { class: "panel-intro" }, "What the agent knows about you. It reads this before every reply."), form, list));
  void load();
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export function openReminders(onOpenChat: (id: string) => void) {
  const list = h("div", { class: "list" });
  async function load() {
    const reminders = await api<Reminder[]>("/api/reminders");
    clear(list);
    if (!reminders.length) list.append(empty("No reminders or scheduled tasks.", "Ask in a chat: “Remind me tomorrow at 9 to call mum” or “Every Monday at 8, summarise tech news”."));
    for (const r of reminders) {
      list.append(
        h(
          "div",
          { class: "list-row" },
          h("span", { class: "list-icon", html: icon(r.task ? "zap" : "bell", 16) }),
          h(
            "div",
            { class: "list-main clickable", onclick: () => r.conversationId && (close(), onOpenChat(r.conversationId)) },
            h("div", null, r.message),
            h("small", null, `${formatDateTime(r.nextRun, state.boot.timezone)}${r.repeat !== "none" ? ` · repeats ${r.repeat}` : ""}${r.task ? " · agent task" : ""}`),
          ),
          h("button", {
            class: "icon-btn",
            title: "Cancel",
            html: icon("trash", 15),
            onclick: async () => {
              await api(`/api/reminders/${r.id}`, { method: "DELETE" });
              void load();
            },
          }),
        ),
      );
    }
  }
  const notifyNote = state.boot.features.phoneNotifications
    ? "Reminders also go to your phone through ntfy."
    : "Tip: set NTFY_URL in .env to get reminders on your phone too.";
  const { close } = modal("Reminders & tasks", h("div", null, h("p", { class: "panel-intro" }, `Times are in ${state.boot.timezone}. ${notifyNote}`), list));
  void load();
}

// ── Files ─────────────────────────────────────────────────────────────────────

export function openFiles() {
  const list = h("div", { class: "list" });
  const input = h("input", { type: "file", multiple: true, hidden: true });
  input.addEventListener("change", async () => {
    for (const f of input.files ?? []) await upload(f, f.name, null).catch((err: Error) => toast(err.message, "error"));
    input.value = "";
    void load();
  });
  async function load() {
    const files = await api<FileRecord[]>("/api/files");
    clear(list);
    if (!files.length) list.append(empty("No files yet.", "Files you send and files the agent makes show up here."));
    for (const f of files) {
      const url = `/api/files/${f.id}`;
      const thumb = /^image\/(png|jpeg|gif|webp)$/.test(f.mime)
        ? h("img", { class: "thumb", src: url, alt: "", loading: "lazy" })
        : h("span", { class: "list-icon", html: icon("file", 16) });
      list.append(
        h(
          "div",
          { class: "list-row" },
          thumb,
          h(
            "a",
            { class: "list-main", href: url, target: "_blank", rel: "noopener" },
            h("div", null, f.name),
            h("small", null, `${formatSize(f.size)} · ${f.origin === "upload" ? "uploaded" : "made by the agent"} · ${formatDateTime(f.createdAt)}`),
          ),
          h("a", { class: "icon-btn", title: "Download", href: `${url}?download=1`, download: f.name.split("/").pop(), html: icon("download", 15) }),
          h("button", {
            class: "icon-btn",
            title: "Delete",
            html: icon("trash", 15),
            onclick: async () => {
              if (!(await confirmDialog(`Delete ${f.name}?`))) return;
              await api(`/api/files/${f.id}`, { method: "DELETE" });
              void load();
            },
          }),
        ),
      );
    }
  }
  modal("Files", h("div", null, h("p", { class: "panel-intro" }, "The agent's workspace: your uploads and everything it creates."), list, input), {
    actions: [h("button", { class: "btn primary small", onclick: () => input.click() }, h("span", { html: icon("upload", 14) }), "Upload")],
  });
  void load();
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function openSettings(onSaved: (s: Settings) => void, onSignOut: (everywhere: boolean) => void) {
  const s = state.boot.settings;
  const userName = h("input", { class: "input", value: s.userName, placeholder: "What should it call you?", maxlength: 80 });
  const personality = h("select", { class: "input" });
  for (const [id, label] of [
    ["default", "Default — direct, warm, a little witty"],
    ["fun", "Fun — playful and irreverent"],
    ["concise", "Concise — as short as possible"],
    ["professional", "Professional — polished and thorough"],
  ]) {
    personality.append(h("option", { value: id, selected: s.personality === id }, label));
  }
  const model = h("select", { class: "input" });
  for (const m of state.boot.models) model.append(h("option", { value: m.id, selected: s.defaultModel === m.id }, m.label));
  const effort = h("select", { class: "input" });
  for (const e of EFFORTS) effort.append(h("option", { value: e.id, selected: s.effort === e.id }, `${e.label} — ${e.hint}`));
  const custom = h("textarea", { class: "input", rows: 6, placeholder: "Anything the agent should always know or do. E.g. “I live in Dubai. Use metric units. Answer in English or Arabic, matching me.”" });
  custom.value = s.customInstructions;
  const theme = h("select", { class: "input" });
  for (const [id, label] of [["system", "Match my device"], ["dark", "Dark"], ["light", "Light"]]) {
    theme.append(h("option", { value: id, selected: (prefs().theme ?? "system") === id }, label));
  }
  theme.addEventListener("change", () => {
    savePrefs({ theme: theme.value as "system" | "dark" | "light" });
    applyTheme();
  });
  const readAloud = h("input", { type: "checkbox", checked: !!prefs().readAloud });
  readAloud.addEventListener("change", () => savePrefs({ readAloud: readAloud.checked }));
  const notifyBtn = h("button", { class: "btn ghost small", type: "button" }, "Allow notifications");
  const refreshNotify = () => {
    const p = "Notification" in window ? Notification.permission : "denied";
    notifyBtn.textContent = p === "granted" ? "Notifications on" : p === "denied" ? "Blocked in browser settings" : "Allow notifications";
    notifyBtn.disabled = p !== "default";
  };
  notifyBtn.addEventListener("click", () => void Notification.requestPermission().then(refreshNotify));
  refreshNotify();

  const form = h(
    "form",
    { class: "form" },
    securitySection(),
    h("label", { class: "field" }, "Your name", userName),
    h("label", { class: "field" }, "Personality", personality),
    h("div", { class: "row" }, h("label", { class: "field grow" }, "Default model", model), h("label", { class: "field grow" }, "Default thinking", effort)),
    h("label", { class: "field" }, "Custom instructions", custom),
    h("div", { class: "row" }, h("label", { class: "field grow" }, "Theme", theme), h("div", { class: "field grow" }, "Desktop notifications", notifyBtn)),
    h("label", { class: "check" }, readAloud, "Read replies aloud automatically"),
    changePasswordSection(),
    h(
      "div",
      { class: "modal-actions split" },
      h(
        "div",
        { class: "row" },
        h("button", { class: "btn ghost small", type: "button", onclick: () => onSignOut(false) }, h("span", { html: icon("logout", 14) }), "Sign out"),
        h("button", { class: "btn ghost small", type: "button", onclick: () => onSignOut(true) }, "Sign out everywhere"),
        h(
          "button",
          {
            class: "btn ghost small",
            type: "button",
            title: "Forget the encryption key until you sign in again (stops scheduled tasks meanwhile)",
            onclick: async () => {
              await api("/api/lock", { body: {} });
              location.reload();
            },
          },
          h("span", { html: icon("lock", 14) }),
          "Lock now",
        ),
      ),
      h("button", { class: "btn primary", type: "submit" }, "Save"),
    ),
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const saved = await api<Settings>("/api/settings", {
      method: "PUT",
      body: {
        userName: userName.value.trim(),
        personality: personality.value,
        defaultModel: model.value,
        effort: effort.value,
        customInstructions: custom.value,
      },
    });
    close();
    toast("Settings saved", "success");
    onSaved(saved);
  });
  const { close } = modal("Settings", form);
}

function securitySection(): HTMLElement {
  const secureConnection = location.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  const row = (ok: boolean, title: string, detail: string) =>
    h(
      "div",
      { class: "security-row" },
      h("span", { class: ok ? "ok" : "warn", html: icon(ok ? "shield" : "alert", 16) }),
      h("div", null, title, h("small", null, detail)),
    );
  return h(
    "div",
    { class: "field" },
    "Privacy & encryption",
    h(
      "div",
      { class: "security" },
      row(
        true,
        "Your data is encrypted on disk",
        "Chats, memories, reminders, agents, settings and uploads are stored with AES-256-GCM. The key is unlocked by your password and never saved.",
      ),
      row(
        secureConnection,
        secureConnection ? "This connection is encrypted" : "This connection is NOT encrypted",
        secureConnection
          ? location.protocol === "https:"
            ? "You're connected over HTTPS."
            : "You're on this computer, so nothing crosses the network."
          : "Open the app over HTTPS (for example with Tailscale or a Cloudflare Tunnel) before using it away from this computer.",
      ),
      row(
        true,
        "AI providers",
        "To answer, each message is sent over TLS to the model you pick (Anthropic for Claude, xAI for Grok). No AI can reply to text it can't read, so this step can't be end-to-end encrypted.",
      ),
      state.boot.security.autoUnlock
        ? row(false, "Auto-unlock is on", "AGENT_PASSWORD is set in .env, so anyone with that file can unlock your data. Remove it for full protection.")
        : null,
    ),
  );
}

function changePasswordSection(): HTMLElement {
  const current = h("input", { class: "input", type: "password", placeholder: "Current password", autocomplete: "current-password" });
  const next = h("input", { class: "input", type: "password", placeholder: "New password (8+ characters)", autocomplete: "new-password" });
  const again = h("input", { class: "input", type: "password", placeholder: "New password again", autocomplete: "new-password" });
  const button = h("button", { class: "btn small", type: "button" }, "Change password");
  button.addEventListener("click", async () => {
    if (next.value.length < 8) return toast("Use at least 8 characters", "error");
    if (next.value !== again.value) return toast("The new passwords don't match", "error");
    try {
      await api("/api/password", { body: { current: current.value, next: next.value } });
      current.value = next.value = again.value = "";
      toast("Password changed. Other devices will need to sign in again.", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  });
  return h(
    "details",
    { class: "field" },
    h("summary", null, "Change password"),
    h("div", { class: "form" }, current, next, again, h("div", null, button)),
  );
}

export function applyTheme() {
  const theme = prefs().theme ?? "system";
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

// ── Connectors ────────────────────────────────────────────────────────────────

interface ConnectorView {
  id: string;
  kind: "gmail" | "google_calendar" | "google_drive" | "mcp";
  name: string;
  enabled: boolean;
  status: "connected" | "needs_auth" | "error";
  error?: string;
  account?: string;
  autoSend: boolean;
  url?: string;
  usesToken: boolean;
  tools: { name: string; description: string }[];
}
interface GalleryApp {
  id: string;
  name: string;
  url: string;
  description: string;
  auth: "signin" | "token";
  tokenHelp?: string;
}
interface ConnectorsData {
  connectors: ConnectorView[];
  google: { configured: boolean; fromEnv: boolean; redirectUri: string; services: { kind: ConnectorView["kind"]; name: string; description: string }[] };
  gallery: GalleryApp[];
}

const APP_TILE: Record<string, { letter: string; color: string }> = {
  gmail: { letter: "M", color: "#ea4335" },
  google_calendar: { letter: "31", color: "#4285f4" },
  google_drive: { letter: "D", color: "#0f9d58" },
  notion: { letter: "N", color: "#2f2f2f" },
  linear: { letter: "L", color: "#5e6ad2" },
  atlassian: { letter: "J", color: "#0c66e4" },
  zapier: { letter: "Z", color: "#ff4f00" },
  canva: { letter: "C", color: "#00c4cc" },
  stripe: { letter: "S", color: "#635bff" },
  paypal: { letter: "P", color: "#003087" },
  vercel: { letter: "▲", color: "#111" },
  sentry: { letter: "S", color: "#362d59" },
  github: { letter: "G", color: "#24292f" },
};

function appTile(key: string, name: string) {
  const t = APP_TILE[key] ?? { letter: name.slice(0, 1).toUpperCase(), color: "#3f3f46" };
  return h("span", { class: "app-tile", style: `background:${t.color}` }, t.letter);
}

/** Sends you to the app's sign-in page; you come back to #/connectors. */
function goSignIn(authUrl: string) {
  location.href = authUrl;
}

export function openConnectors() {
  const body = h("div", { class: "connectors" });
  const { close } = modal("Connectors", body, { wide: true });

  async function render() {
    let data: ConnectorsData;
    try {
      data = await api<ConnectorsData>("/api/connectors");
    } catch (err) {
      clear(body);
      body.append(empty("Couldn't load connectors.", (err as Error).message));
      return;
    }
    clear(body);
    body.append(
      h(
        "p",
        { class: "panel-intro" },
        `Let ${state.boot.agentName} use your apps: read and draft email, check your calendar, find documents, work in Notion, Linear, Jira and more. `,
        "Sign-in tokens are stored encrypted, like your chats. Emails it writes wait for your OK before sending.",
      ),
    );

    // Google
    body.append(h("h3", { class: "section-title" }, "Google"));
    if (!data.google.configured) body.append(googleSetup(data.google.redirectUri, render));
    const googleGrid = h("div", { class: "connector-grid" });
    for (const svc of data.google.services) {
      const c = data.connectors.find((x) => x.kind === svc.kind);
      googleGrid.append(connectorCard(svc.kind, svc.name, svc.description, c, data.google.configured, render));
    }
    body.append(googleGrid);
    if (data.google.configured && !data.google.fromEnv) {
      body.append(
        h("button", { class: "linkish", type: "button", onclick: () => body.prepend(googleSetup(data.google.redirectUri, render)) }, "Change Google OAuth client"),
      );
    }

    // Apps by link
    body.append(h("h3", { class: "section-title" }, "Apps"));
    const appGrid = h("div", { class: "connector-grid" });
    for (const app of data.gallery) {
      const c = data.connectors.find((x) => x.kind === "mcp" && x.url === app.url);
      appGrid.append(connectorCard(app.id, app.name, app.description, c, true, render, app));
    }
    body.append(appGrid);

    // Custom links
    const custom = data.connectors.filter((c) => c.kind === "mcp" && !data.gallery.some((g) => g.url === c.url));
    body.append(h("h3", { class: "section-title" }, "Added by link"));
    const customGrid = h("div", { class: "connector-grid" });
    for (const c of custom) customGrid.append(connectorCard("", c.name, c.url ?? "", c, true, render));
    if (custom.length) body.append(customGrid);
    body.append(addByLinkForm(render));
  }

  void render();
  return close;
}

function googleSetup(redirectUri: string, onSaved: () => void): HTMLElement {
  const clientId = h("input", { class: "input", placeholder: "Client ID (….apps.googleusercontent.com)" });
  const clientSecret = h("input", { class: "input", type: "password", placeholder: "Client secret" });
  const copy = h("button", { class: "btn small", type: "button" }, h("span", { html: icon("copy", 13) }), "Copy");
  copy.addEventListener("click", () => void navigator.clipboard.writeText(redirectUri).then(() => toast("Copied", "success")));
  const form = h(
    "form",
    { class: "setup-box" },
    h("div", { class: "setup-title" }, h("span", { html: icon("settings", 15) }), "One-time setup: connect Dizz Lab to Google"),
    h(
      "ol",
      { class: "setup-steps" },
      h("li", null, "Open ", h("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener" }, "Google Cloud → Credentials"), " (create a project if asked)."),
      h(
        "li",
        null,
        "Enable the ",
        h("a", { href: "https://console.cloud.google.com/apis/library/gmail.googleapis.com", target: "_blank", rel: "noopener" }, "Gmail"),
        ", ",
        h("a", { href: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com", target: "_blank", rel: "noopener" }, "Calendar"),
        " and ",
        h("a", { href: "https://console.cloud.google.com/apis/library/drive.googleapis.com", target: "_blank", rel: "noopener" }, "Drive"),
        " APIs.",
      ),
      h("li", null, "OAuth consent screen: choose External, add your own email as a test user, then press ", h("b", null, "Publish app"), " so sign-ins don't expire after 7 days. (Google will warn the app is unverified; that's expected for a private app. Continue.)"),
      h("li", null, "Create credentials → OAuth client ID → Web application, and add this redirect URI:"),
    ),
    h("div", { class: "copy-row" }, h("code", null, redirectUri), copy),
    h("div", { class: "row" }, h("label", { class: "field grow" }, "Client ID", clientId), h("label", { class: "field grow" }, "Client secret", clientSecret)),
    h("div", { class: "modal-actions" }, h("button", { class: "btn primary small", type: "submit" }, "Save")),
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/api/connectors/google/setup", { method: "PUT", body: { clientId: clientId.value, clientSecret: clientSecret.value } });
      toast("Google is set up. Now connect Gmail, Calendar or Drive.", "success");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  });
  return form;
}

function connectorCard(
  key: string,
  name: string,
  description: string,
  c: ConnectorView | undefined,
  available: boolean,
  refresh: () => void,
  app?: GalleryApp,
): HTMLElement {
  const statusText = !c
    ? ""
    : c.status === "connected"
      ? c.account && c.kind !== "mcp"
        ? c.account
        : `Connected · ${c.tools.length} tools`
      : c.status === "needs_auth"
        ? "Needs sign-in"
        : c.error ?? "Error";
  const status = c ? h("span", { class: `conn-status ${c.status}` }, statusText) : null;

  const connect = async () => {
    try {
      if (app && app.auth === "token" && !c) {
        const token = prompt(`Paste your ${app.name} token.${app.tokenHelp ? `\n\nCreate one at ${app.tokenHelp}` : ""}`)?.trim();
        if (!token) return;
        const r = await api<{ connector: ConnectorView; authUrl?: string }>("/api/connectors/mcp", { body: { name: app.name, url: app.url, token } });
        return r.connector.status === "connected" ? (toast(`${app.name} connected`, "success"), refresh()) : (toast(r.connector.error ?? "Couldn't connect", "error"), refresh());
      }
      type Result = { authUrl?: string; connector?: ConnectorView };
      const isGoogle = ["gmail", "google_calendar", "google_drive"].includes(key);
      const r = c
        ? await api<Result>(`/api/connectors/${c.id}/connect`, { body: {} })
        : isGoogle
          ? await api<Result>(`/api/connectors/google/${key}/connect`, { body: {} })
          : await api<Result>("/api/connectors/mcp", { body: { name: app?.name, url: app?.url } });
      if (r.authUrl) return goSignIn(r.authUrl);
      if (r.connector?.status === "connected") toast(`${name} connected`, "success");
      else if (r.connector?.error) toast(r.connector.error, "error");
      refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const actions = h("div", { class: "conn-actions" });
  if (!c || c.status !== "connected") {
    actions.append(h("button", { class: "btn primary small", type: "button", disabled: !available, onclick: () => void connect() }, c ? "Reconnect" : "Connect"));
  }
  if (c) {
    if (c.status === "connected") {
      const toggle = h("input", { type: "checkbox", checked: c.enabled, title: "Let the agent use it" });
      toggle.addEventListener("change", async () => {
        await api(`/api/connectors/${c.id}`, { method: "PATCH", body: { enabled: toggle.checked } });
        toast(toggle.checked ? `${name} is on` : `${name} is off`);
      });
      actions.append(h("label", { class: "switch", title: "On / off" }, toggle, h("span", { class: "switch-track" })));
      if (c.kind === "mcp") actions.append(h("button", { class: "icon-btn", title: "Refresh tools", html: icon("refresh", 15), onclick: () => void connect() }));
    }
    actions.append(
      h("button", {
        class: "icon-btn",
        title: "Disconnect",
        html: icon("trash", 15),
        onclick: async () => {
          if (!(await confirmDialog(`Disconnect ${name}?`, "Disconnect"))) return;
          await api(`/api/connectors/${c.id}`, { method: "DELETE" });
          refresh();
        },
      }),
    );
  }

  const extra: HTMLElement[] = [];
  if (c?.kind === "gmail" && c.status === "connected") {
    const auto = h("input", { type: "checkbox", checked: c.autoSend });
    auto.addEventListener("change", async () => {
      await api(`/api/connectors/${c.id}`, { method: "PATCH", body: { autoSend: auto.checked } });
      toast(auto.checked ? "Emails will be sent without asking" : "Emails wait for your OK", auto.checked ? "info" : "success");
    });
    extra.push(h("label", { class: "check small" }, auto, "Send emails without asking me first"));
  }
  if (c?.kind === "mcp" && c.tools.length) {
    extra.push(
      h(
        "details",
        { class: "conn-tools" },
        h("summary", null, `${c.tools.length} tools`),
        h("ul", null, c.tools.map((t) => h("li", null, h("b", null, t.name), t.description ? ` — ${t.description.slice(0, 140)}` : ""))),
      ),
    );
  }

  return h(
    "div",
    { class: `connector-card${c?.status === "connected" ? " connected" : ""}` },
    h("div", { class: "conn-top" }, appTile(key, name), h("div", { class: "conn-name" }, h("div", null, name), status), actions),
    h("p", { class: "conn-desc" }, description),
    ...extra,
  );
}

function addByLinkForm(refresh: () => void): HTMLElement {
  const url = h("input", { class: "input", type: "url", placeholder: "https://example.com/mcp", required: true });
  const name = h("input", { class: "input", placeholder: "Name (optional)", maxlength: 60 });
  const token = h("input", { class: "input", type: "password", placeholder: "API key or token (only if the app gave you one)" });
  const button = h("button", { class: "btn primary small", type: "submit" }, h("span", { html: icon("plus", 14) }), "Connect");
  const form = h(
    "form",
    { class: "setup-box" },
    h("div", { class: "setup-title" }, h("span", { html: icon("globe", 15) }), "Add any app by link"),
    h("p", { class: "muted small-text" }, "Paste the connector (MCP) link from the app's docs or settings. If it needs you to sign in, you'll be taken to its sign-in page."),
    h("div", { class: "row" }, h("label", { class: "field grow" }, "Link", url), h("label", { class: "field" }, "Name", name)),
    h("label", { class: "field" }, "Token", token),
    h("div", { class: "modal-actions" }, button),
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    button.disabled = true;
    try {
      const r = await api<{ connector: ConnectorView; authUrl?: string }>("/api/connectors/mcp", {
        body: { url: url.value.trim(), name: name.value.trim() || undefined, token: token.value.trim() || undefined },
      });
      if (r.authUrl) return goSignIn(r.authUrl);
      if (r.connector.status === "connected") toast(`${r.connector.name} connected with ${r.connector.tools.length} tools`, "success");
      else toast(r.connector.error ?? "Couldn't connect", "error");
      refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      button.disabled = false;
    }
  });
  return form;
}
