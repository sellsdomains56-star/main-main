import "highlight.js/styles/github-dark.css";
import "./styles.css";
import { api, downloadFrom, setUnauthorizedHandler } from "./api.js";
import { applyModelFor, focusComposer, isBusy, mountChat, refreshIfOpen, renderHeader, showConversation } from "./chat.js";
import { $, clear, h, onSubmit } from "./dom.js";
import { icon, logo } from "./icons.js";
import { applyTheme, openAgents, openConnectors, openFiles, openMemory, openReminders, openSettings, openUsage } from "./panels.js";
import { prefs, savePrefs, state, type AgentProfile, type Bootstrap, type ConversationSummary, type OpenConversation } from "./state.js";
import { confirmDialog, debounce, promptDialog, relativeDay, toast } from "./util.js";
import { pushOnHere } from "./push.js";
import { lang, setLang, t, type Lang } from "./i18n.js";

const root = document.getElementById("app")!;
applyTheme();

// ── Sign in ───────────────────────────────────────────────────────────────────

type Gate = "setup" | "login" | "unlock";

function showLogin(agentName: string, gate: Gate) {
  clear(root);
  const password = h("input", {
    class: "input",
    type: "password",
    placeholder: gate === "setup" ? t("Choose a password") : t("Password"),
    autocomplete: gate === "setup" ? "new-password" : "current-password",
    required: true,
    minlength: gate === "setup" ? 8 : undefined,
  });
  const confirm = gate === "setup" ? h("input", { class: "input", type: "password", placeholder: t("Type it again"), autocomplete: "new-password", required: true }) : null;
  const error = h("p", { class: "form-error", hidden: true });
  const buttonText = () => (gate === "setup" ? t("Create my lab") : gate === "unlock" ? t("Unlock") : t("Sign in"));
  const button = h("button", { class: "btn primary block", type: "submit" }, buttonText());
  const intro = {
    setup: t("Choose a password. It signs you in and encrypts everything you store here. It can't be recovered, so keep it somewhere safe."),
    login: t("Your private AI lab"),
    unlock: t("The server restarted, so your data is locked. Enter your password to unlock it."),
  }[gate];
  const form = h(
    "form",
    { class: "login-card" },
    h("div", { class: "login-logo", html: logo(48) }),
    h("h1", null, gate === "setup" ? t("Welcome to {name}", { name: agentName }) : agentName),
    h("p", { class: "muted" }, intro),
    password,
    confirm,
    error,
    button,
    h("div", { class: "login-lock" }, h("span", { html: icon("lock", 13) }), h("span", null, t("Encrypted with AES-256 · key never stored"))),
    languageToggle(() => showLogin(agentName, gate)),
  );
  onSubmit(form, async () => {
    error.hidden = true;
    if (confirm && confirm.value !== password.value) {
      error.textContent = t("The passwords don't match");
      error.hidden = false;
      return;
    }
    button.disabled = true;
    button.textContent = gate === "setup" ? t("Setting up…") : t("Unlocking…");
    try {
      await api(gate === "setup" ? "/api/setup" : "/api/login", { body: { password: password.value } });
      await start();
    } catch (err) {
      error.textContent = (err as Error).message;
      error.hidden = false;
      button.disabled = false;
      button.textContent = buttonText();
      password.select();
    }
  });
  root.append(h("div", { class: "login" }, form));
  password.focus();
}

/** English | العربية, for the sign-in screen (the same choice is in Settings). */
function languageToggle(redraw: () => void): HTMLElement {
  const wrap = h("div", { class: "lang-toggle" });
  for (const [code, label] of [["en", "English"], ["ar", "العربية"]] as [Lang, string][]) {
    wrap.append(
      h(
        "button",
        {
          type: "button",
          class: lang() === code ? "active" : "",
          lang: code,
          onclick: () => {
            setLang(code);
            redraw();
          },
        },
        label,
      ),
    );
  }
  return wrap;
}

setUnauthorizedHandler(() => {
  if (state.boot) location.reload();
});

// ── Sidebar ──────────────────────────────────────────────────────────────────

let shell: HTMLElement;
let listEl: HTMLElement;
let searchInput: HTMLInputElement;

function closeSidebarOnMobile() {
  shell.classList.remove("sidebar-open");
}

/** Click handler for in-app links (works even where the URL can't change). */
function go(hash: string) {
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
    e.preventDefault();
    closeSidebarOnMobile();
    navigate(hash);
  };
}

function navItem(iconName: Parameters<typeof icon>[0], label: string, onclick: () => void) {
  return h("button", { class: "nav-item", type: "button", onclick }, h("span", { html: icon(iconName, 17) }), h("span", null, label));
}

function conversationMenu(c: { id: string; title: string; pinned: boolean }, anchor: HTMLElement) {
  $(".popover.conv-menu")?.remove();
  const item = (iconName: Parameters<typeof icon>[0], label: string, fn: () => void, danger = false) =>
    h(
      "button",
      {
        class: `menu-item${danger ? " danger" : ""}`,
        type: "button",
        onclick: () => {
          menu.remove();
          fn();
        },
      },
      h("span", { html: icon(iconName, 15) }),
      h("span", null, label),
    );
  const menu = h(
    "div",
    { class: "popover conv-menu" },
    item("pin", c.pinned ? t("Unpin") : t("Pin"), async () => {
      await api(`/api/conversations/${c.id}`, { method: "PATCH", body: { pinned: !c.pinned } });
      if (state.current?.conversation.id === c.id) state.current.conversation.pinned = !c.pinned;
      void loadConversations();
    }),
    item("edit", t("Rename"), async () => {
      const title = (await promptDialog(t("Rename chat"), c.title))?.trim();
      if (!title) return;
      await api(`/api/conversations/${c.id}`, { method: "PATCH", body: { title } });
      if (state.current?.conversation.id === c.id) {
        state.current.conversation.title = title;
        renderHeader();
      }
      void loadConversations();
    }),
    item("download", t("Export as Markdown"), () => {
      void downloadFrom(`/api/conversations/${c.id}/export`, `${(c.title || "chat").replace(/[\\/:*?"<>|]+/g, "")}.md`).catch((err: Error) =>
        toast(err.message, "error"),
      );
    }),
    item(
      "trash",
      t("Delete"),
      async () => {
        if (!(await confirmDialog(t("Delete this chat? This can't be undone.")))) return;
        await api(`/api/conversations/${c.id}`, { method: "DELETE" });
        if (state.current?.conversation.id === c.id) navigate("#/");
        void loadConversations();
      },
      true,
    ),
  );
  document.body.append(menu);
  const r = anchor.getBoundingClientRect();
  const top = Math.min(r.bottom + 4, window.innerHeight - 190);
  menu.style.top = `${top}px`;
  menu.style.left = `${Math.max(8, Math.min(r.right - 200, window.innerWidth - 208))}px`;
  const close = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("mousedown", close);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", close));
}

function renderConversationList() {
  clear(listEl);
  if (!state.conversations.length) {
    listEl.append(h("div", { class: "side-empty" }, state.search ? t("No chats match.") : t("Your chats will appear here.")));
    return;
  }
  let group = "";
  for (const c of state.conversations) {
    const label = c.pinned ? t("Pinned") : relativeDay(c.updatedAt);
    if (label !== group) {
      group = label;
      listEl.append(h("div", { class: "side-group" }, label));
    }
    const active = state.current?.conversation.id === c.id;
    const more = h("button", { class: "icon-btn side-more", title: t("Options"), html: icon("dots", 15) });
    more.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      conversationMenu(c, more);
    });
    listEl.append(
      h(
        "a",
        { class: `side-item${active ? " active" : ""}`, href: `#/c/${c.id}`, onclick: go(`#/c/${c.id}`) },
        c.agent ? h("span", { class: "side-emoji" }, c.agent.emoji) : null,
        h("span", { class: "side-title", dir: "auto" }, c.title || t("New chat")),
        c.running ? h("span", { class: "side-running", title: t("Working…") }) : null,
        more,
      ),
    );
  }
}

async function loadConversations() {
  state.conversations = await api<ConversationSummary[]>(`/api/conversations?q=${encodeURIComponent(state.search)}`);
  renderConversationList();
}
const loadConversationsSoon = debounce(() => void loadConversations(), 250);

function buildShell() {
  clear(root);
  searchInput = h("input", { class: "side-search", type: "search", placeholder: t("Search chats"), "aria-label": t("Search chats") });
  searchInput.addEventListener(
    "input",
    debounce(() => {
      state.search = searchInput.value;
      void loadConversations();
    }, 200),
  );
  listEl = h("nav", { class: "side-list" });
  const sidebar = h(
    "aside",
    { class: "sidebar" },
    h(
      "div",
      { class: "side-head" },
      h("a", { class: "brand", href: "#/", onclick: go("#/") }, h("span", { html: logo(26) }), h("span", null, state.boot.agentName)),
      h("div", { class: "spacer" }),
      h("button", {
        class: "icon-btn collapse-btn",
        title: t("Hide sidebar"),
        html: icon("sidebar", 18),
        onclick: () => {
          shell.classList.toggle("collapsed");
          savePrefs({ sidebarCollapsed: shell.classList.contains("collapsed") });
        },
      }),
    ),
    h(
      "a",
      { class: "new-chat", href: "#/", onclick: go("#/") },
      h("span", { html: icon("plus", 17) }),
      h("span", null, t("New chat")),
      h("kbd", null, navigator.platform.includes("Mac") ? "⌘⇧O" : "Ctrl⇧O"),
    ),
    h("div", { class: "side-search-wrap" }, h("span", { html: icon("search", 15) }), searchInput),
    h(
      "div",
      { class: "side-nav" },
      navItem("users", t("Agents"), () => {
        closeSidebarOnMobile();
        openAgents((a) => startAgentChat(a));
      }),
      navItem("plug", t("Connectors"), () => {
        closeSidebarOnMobile();
        openConnectors();
      }),
      navItem("bell", t("Reminders & tasks"), () => {
        closeSidebarOnMobile();
        openReminders((id) => navigate(`#/c/${id}`));
      }),
      navItem("bookmark", t("Memory"), () => {
        closeSidebarOnMobile();
        openMemory();
      }),
      navItem("folder", t("Files"), () => {
        closeSidebarOnMobile();
        openFiles();
      }),
      state.boot.cloud || state.boot.demo
        ? null
        : navItem("chart", t("Usage & spending"), () => {
            closeSidebarOnMobile();
            openUsage();
          }),
    ),
    listEl,
    h(
      "button",
      {
        class: "side-user",
        type: "button",
        onclick: () => {
          closeSidebarOnMobile();
          openSettings(
            (s) => {
              state.boot.settings = s;
              // A new language redraws everything.
              if (s.language && s.language !== lang()) {
                setLang(s.language);
                buildShell();
                void loadConversations();
                currentRoute = "";
                void route();
              } else if (!state.current) showConversation(null);
            },
            (everywhere) => void signOut(everywhere),
          );
        },
      },
      h("span", { class: "side-avatar" }, (state.boot.settings.userName || "You").slice(0, 1).toUpperCase()),
      h("span", null, state.boot.settings.userName || t("Settings")),
      h("span", { class: "spacer" }),
      h("span", { html: icon("settings", 16) }),
    ),
  );
  shell = h("div", { class: `shell${prefs().sidebarCollapsed ? " collapsed" : ""}` }, sidebar, h("div", { class: "scrim", onclick: closeSidebarOnMobile }));
  root.append(shell);
  mountChat(
    shell,
    {
      created(id) {
        setHash(`#/c/${id}`, false);
        currentRoute = `#/c/${id}`;
        void loadConversations();
      },
      titled() {
        void loadConversations();
      },
      changed() {
        void loadConversations();
      },
    },
    () => shell.classList.add("sidebar-open"),
    (anchor) => {
      const c = state.current?.conversation;
      if (c) conversationMenu(c, anchor);
      else toast(t("Send a message first"));
    },
  );
  // The "show sidebar" button for when it's collapsed on desktop.
  shell.append(h("button", {
    class: "icon-btn expand-btn",
    title: t("Show sidebar"),
    html: icon("sidebar", 18),
    onclick: () => {
      shell.classList.remove("collapsed");
      savePrefs({ sidebarCollapsed: false });
    },
  }));
}

async function signOut(everywhere: boolean) {
  await api(everywhere ? "/api/logout-all" : "/api/logout", { body: {} });
  setHash("#/", false);
  location.reload();
}

// ── Routing ──────────────────────────────────────────────────────────────────

let currentRoute = "";

/**
 * Where you are in the app lives in the URL (#/c/<chat>). Embedded viewers
 * (sandboxed frames) don't allow changing it, so then it's tracked here instead.
 */
let virtualHash: string | null = null;
const currentHash = () => virtualHash ?? (location.hash || "#/");

/** Returns true when the browser will announce the change itself (a hashchange event follows). */
function setHash(hash: string, push: boolean): boolean {
  try {
    if (push) {
      if (location.hash !== hash) {
        location.hash = hash;
        if (location.hash === hash) {
          virtualHash = null;
          return true;
        }
      }
    } else {
      history.replaceState(null, "", hash);
      if (location.hash === hash) {
        virtualHash = null;
        return false;
      }
    }
  } catch {
    // not allowed here
  }
  virtualHash = hash;
  return false;
}

function navigate(hash: string) {
  if (!setHash(hash, true)) void route();
}

function startAgentChat(agent: AgentProfile) {
  navigate(`#/agent/${agent.id}`);
}

async function route() {
  const hash = currentHash();
  if (hash === currentRoute && state.current) return;
  currentRoute = hash;
  document.querySelector(".popover")?.remove();
  // Coming back from signing in to an app.
  if (hash.startsWith("#/connectors")) {
    const params = new URLSearchParams(hash.split("?")[1] ?? "");
    setHash("#/", false);
    currentRoute = "#/";
    state.draftAgent = null;
    applyModelFor(null);
    showConversation(null);
    renderConversationList();
    openConnectors();
    if (params.get("connected")) toast(t("{name} connected", { name: params.get("connected")! }), "success");
    if (params.get("error")) toast(t(params.get("error")!), "error");
    return;
  }
  const [, kind, id] = hash.match(/^#\/(c|agent)\/([\w-]+)/) ?? [];
  try {
    if (kind === "c") {
      const data = await api<OpenConversation>(`/api/conversations/${id}`);
      state.draftAgent = null;
      applyModelFor(data.agent);
      showConversation(data);
    } else if (kind === "agent") {
      const agent = await api<AgentProfile>(`/api/agents/${id}`);
      state.draftAgent = agent;
      applyModelFor(agent);
      showConversation(null);
    } else {
      state.draftAgent = null;
      applyModelFor(null);
      showConversation(null);
    }
  } catch (err) {
    toast((err as Error).message, "error");
    state.draftAgent = null;
    showConversation(null);
    setHash("#/", false);
    currentRoute = "#/";
  }
  renderConversationList();
}

// ── Live events ──────────────────────────────────────────────────────────────

function listen() {
  const source = new EventSource("/api/events");
  source.onmessage = (msg) => {
    const event = JSON.parse(msg.data) as
      | { type: "hello" }
      | { type: "notification"; title: string; body: string; conversationId: string | null }
      | { type: "conversation"; conversationId: string; running: boolean };
    if (event.type === "notification") {
      const open = () => event.conversationId && navigate(`#/c/${event.conversationId}`);
      toast(`${event.title}: ${event.body}`, "info", open);
      // With push on, the service worker shows it; the page doesn't need to as well.
      if (document.hidden && !pushOnHere() && "Notification" in window && Notification.permission === "granted") {
        const n = new Notification(event.title, { body: event.body, icon: "/icon.svg", tag: event.conversationId ?? undefined });
        n.onclick = () => {
          window.focus();
          open();
        };
      }
    } else if (event.type === "conversation") {
      loadConversationsSoon();
      if (!isBusy()) void refreshIfOpen(event.conversationId, event.running);
    }
  };
}

// ── Start ────────────────────────────────────────────────────────────────────

async function start() {
  state.boot = await api<Bootstrap>("/api/bootstrap");
  // The language saved in Settings wins over this browser's guess.
  if (state.boot.settings.language && state.boot.settings.language !== lang()) setLang(state.boot.settings.language);
  else if (!state.boot.settings.language) void api("/api/settings", { method: "PUT", body: { language: lang() } }).catch(() => {});
  state.effort = prefs().effort ?? state.boot.settings.effort;
  document.title = state.boot.agentName;
  buildShell();
  await loadConversations();
  window.addEventListener("hashchange", () => {
    virtualHash = null;
    void route();
  });
  await route();
  listen();
  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.shiftKey && e.key.toLowerCase() === "o") {
      e.preventDefault();
      navigate("#/");
      focusComposer();
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      shell.classList.add("sidebar-open");
      searchInput.focus();
    }
  });
  if ("serviceWorker" in navigator && !state.boot.demo && !state.boot.cloud) void navigator.serviceWorker.register("/sw.js").catch(() => {});
}

(async () => {
  const session = await api<{ authenticated: boolean; setupRequired: boolean; locked: boolean; agentName: string }>("/api/session");
  document.title = session.agentName;
  if (session.authenticated) await start();
  else showLogin(session.agentName, session.setupRequired ? "setup" : session.locked ? "unlock" : "login");
})().catch((err) => {
  root.textContent = t("Couldn't start: {error}", { error: (err as Error).message });
});
