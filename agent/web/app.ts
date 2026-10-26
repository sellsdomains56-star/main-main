import "highlight.js/styles/github-dark.css";
import "./styles.css";
import { api, setUnauthorizedHandler } from "./api.js";
import { applyModelFor, focusComposer, isBusy, mountChat, refreshIfOpen, renderHeader, showConversation } from "./chat.js";
import { $, clear, h } from "./dom.js";
import { icon, logo } from "./icons.js";
import { applyTheme, openAgents, openConnectors, openFiles, openMemory, openReminders, openSettings } from "./panels.js";
import { prefs, savePrefs, state, type AgentProfile, type Bootstrap, type ConversationSummary, type OpenConversation } from "./state.js";
import { confirmDialog, debounce, relativeDay, toast } from "./util.js";

const root = document.getElementById("app")!;
applyTheme();

// ── Sign in ───────────────────────────────────────────────────────────────────

type Gate = "setup" | "login" | "unlock";

function showLogin(agentName: string, gate: Gate) {
  clear(root);
  const password = h("input", {
    class: "input",
    type: "password",
    placeholder: gate === "setup" ? "Choose a password" : "Password",
    autocomplete: gate === "setup" ? "new-password" : "current-password",
    required: true,
    minlength: gate === "setup" ? 8 : undefined,
  });
  const confirm = gate === "setup" ? h("input", { class: "input", type: "password", placeholder: "Type it again", autocomplete: "new-password", required: true }) : null;
  const error = h("p", { class: "form-error", hidden: true });
  const button = h("button", { class: "btn primary block", type: "submit" }, gate === "setup" ? "Create my lab" : gate === "unlock" ? "Unlock" : "Sign in");
  const intro = {
    setup: "Choose a password. It signs you in and encrypts everything you store here. It can't be recovered, so keep it somewhere safe.",
    login: "Your private AI lab",
    unlock: "The server restarted, so your data is locked. Enter your password to unlock it.",
  }[gate];
  const form = h(
    "form",
    { class: "login-card" },
    h("div", { class: "login-logo", html: logo(48) }),
    h("h1", null, gate === "setup" ? `Welcome to ${agentName}` : agentName),
    h("p", { class: "muted" }, intro),
    password,
    confirm,
    error,
    button,
    h("div", { class: "login-lock", html: `${icon("lock", 13)}<span>Encrypted with AES-256 · key never stored</span>` }),
  );
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    if (confirm && confirm.value !== password.value) {
      error.textContent = "The passwords don't match";
      error.hidden = false;
      return;
    }
    button.disabled = true;
    button.textContent = gate === "setup" ? "Setting up…" : "Unlocking…";
    try {
      await api(gate === "setup" ? "/api/setup" : "/api/login", { body: { password: password.value } });
      await start();
    } catch (err) {
      error.textContent = (err as Error).message;
      error.hidden = false;
      button.disabled = false;
      button.textContent = gate === "setup" ? "Create my lab" : gate === "unlock" ? "Unlock" : "Sign in";
      password.select();
    }
  });
  root.append(h("div", { class: "login" }, form));
  password.focus();
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
    item("pin", c.pinned ? "Unpin" : "Pin", async () => {
      await api(`/api/conversations/${c.id}`, { method: "PATCH", body: { pinned: !c.pinned } });
      if (state.current?.conversation.id === c.id) state.current.conversation.pinned = !c.pinned;
      void loadConversations();
    }),
    item("edit", "Rename", async () => {
      const title = prompt("Rename chat", c.title)?.trim();
      if (!title) return;
      await api(`/api/conversations/${c.id}`, { method: "PATCH", body: { title } });
      if (state.current?.conversation.id === c.id) {
        state.current.conversation.title = title;
        renderHeader();
      }
      void loadConversations();
    }),
    item("download", "Export as Markdown", () => {
      location.href = `/api/conversations/${c.id}/export`;
    }),
    item(
      "trash",
      "Delete",
      async () => {
        if (!(await confirmDialog("Delete this chat? This can't be undone."))) return;
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
    listEl.append(h("div", { class: "side-empty" }, state.search ? "No chats match." : "Your chats will appear here."));
    return;
  }
  let group = "";
  for (const c of state.conversations) {
    const label = c.pinned ? "Pinned" : relativeDay(c.updatedAt);
    if (label !== group) {
      group = label;
      listEl.append(h("div", { class: "side-group" }, label));
    }
    const active = state.current?.conversation.id === c.id;
    const more = h("button", { class: "icon-btn side-more", title: "Options", html: icon("dots", 15) });
    more.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      conversationMenu(c, more);
    });
    listEl.append(
      h(
        "a",
        { class: `side-item${active ? " active" : ""}`, href: `#/c/${c.id}`, onclick: closeSidebarOnMobile },
        c.agent ? h("span", { class: "side-emoji" }, c.agent.emoji) : null,
        h("span", { class: "side-title" }, c.title || "New chat"),
        c.running ? h("span", { class: "side-running", title: "Working…" }) : null,
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
  searchInput = h("input", { class: "side-search", type: "search", placeholder: "Search chats", "aria-label": "Search chats" });
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
      h("a", { class: "brand", href: "#/", onclick: closeSidebarOnMobile }, h("span", { html: logo(26) }), h("span", null, state.boot.agentName)),
      h("div", { class: "spacer" }),
      h("button", {
        class: "icon-btn collapse-btn",
        title: "Hide sidebar",
        html: icon("sidebar", 18),
        onclick: () => {
          shell.classList.toggle("collapsed");
          savePrefs({ sidebarCollapsed: shell.classList.contains("collapsed") });
        },
      }),
    ),
    h(
      "a",
      { class: "new-chat", href: "#/", onclick: closeSidebarOnMobile },
      h("span", { html: icon("plus", 17) }),
      h("span", null, "New chat"),
      h("kbd", null, navigator.platform.includes("Mac") ? "⌘⇧O" : "Ctrl⇧O"),
    ),
    h("div", { class: "side-search-wrap" }, h("span", { html: icon("search", 15) }), searchInput),
    h(
      "div",
      { class: "side-nav" },
      navItem("users", "Agents", () => {
        closeSidebarOnMobile();
        openAgents((a) => startAgentChat(a));
      }),
      navItem("plug", "Connectors", () => {
        closeSidebarOnMobile();
        openConnectors();
      }),
      navItem("bell", "Reminders & tasks", () => {
        closeSidebarOnMobile();
        openReminders((id) => navigate(`#/c/${id}`));
      }),
      navItem("bookmark", "Memory", () => {
        closeSidebarOnMobile();
        openMemory();
      }),
      navItem("folder", "Files", () => {
        closeSidebarOnMobile();
        openFiles();
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
              if (!state.current) showConversation(null);
            },
            (everywhere) => void signOut(everywhere),
          );
        },
      },
      h("span", { class: "side-avatar" }, (state.boot.settings.userName || "You").slice(0, 1).toUpperCase()),
      h("span", null, state.boot.settings.userName || "Settings"),
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
        history.replaceState(null, "", `#/c/${id}`);
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
      else toast("Send a message first");
    },
  );
  // The "show sidebar" button for when it's collapsed on desktop.
  shell.append(h("button", {
    class: "icon-btn expand-btn",
    title: "Show sidebar",
    html: icon("sidebar", 18),
    onclick: () => {
      shell.classList.remove("collapsed");
      savePrefs({ sidebarCollapsed: false });
    },
  }));
}

async function signOut(everywhere: boolean) {
  await api(everywhere ? "/api/logout-all" : "/api/logout", { body: {} });
  location.hash = "";
  location.reload();
}

// ── Routing ──────────────────────────────────────────────────────────────────

let currentRoute = "";

function navigate(hash: string) {
  if (location.hash === hash) void route();
  else location.hash = hash;
}

function startAgentChat(agent: AgentProfile) {
  navigate(`#/agent/${agent.id}`);
}

async function route() {
  const hash = location.hash || "#/";
  if (hash === currentRoute && state.current) return;
  currentRoute = hash;
  document.querySelector(".popover")?.remove();
  // Coming back from signing in to an app.
  if (hash.startsWith("#/connectors")) {
    const params = new URLSearchParams(hash.split("?")[1] ?? "");
    history.replaceState(null, "", "#/");
    currentRoute = "#/";
    state.draftAgent = null;
    applyModelFor(null);
    showConversation(null);
    renderConversationList();
    openConnectors();
    if (params.get("connected")) toast(`${params.get("connected")} connected`, "success");
    if (params.get("error")) toast(params.get("error")!, "error");
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
    history.replaceState(null, "", "#/");
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
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
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
  state.effort = prefs().effort ?? state.boot.settings.effort;
  document.title = state.boot.agentName;
  buildShell();
  await loadConversations();
  window.addEventListener("hashchange", () => void route());
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
  if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => {});
}

(async () => {
  const session = await api<{ authenticated: boolean; setupRequired: boolean; locked: boolean; agentName: string }>("/api/session");
  document.title = session.agentName;
  if (session.authenticated) await start();
  else showLogin(session.agentName, session.setupRequired ? "setup" : session.locked ? "unlock" : "login");
})().catch((err) => {
  root.textContent = `Couldn't start: ${(err as Error).message}`;
});
