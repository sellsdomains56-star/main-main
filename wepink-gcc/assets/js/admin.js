/* wepink Gulf — admin panel (admin.html).
 *
 * Signs in with Supabase Auth and edits the store's database: products and
 * their photos, orders, ambassadors and commission, customers, visitor stats
 * and store settings. The store picks up changes on a shopper's next page
 * load. Only emails listed in the `admins` table get in (see
 * supabase/schema.sql); everyone else is refused by the database itself.
 */
(function () {
  const D = window.WP_DATA;
  const SB = D.config.supabase || {};
  const app = document.getElementById("app");
  if (!window.supabase || !SB.url) {
    app.innerHTML = `<p class="boot">The admin panel needs an internet connection (and <code>config.supabase</code> in data.js).</p>`;
    return;
  }
  const sb = window.supabase.createClient(SB.url, SB.key);
  const STORE = window.WP_STORE_URL || "index.html";
  const BUCKET = "product-images";
  const CATALOG = new Map((window.WP_CATALOG || []).map((p) => [p.id, p]));
  const COUNTRIES = Object.keys(D.countries);

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ICONS = {
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    bag: '<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    star: '<path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    out: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    down: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
    up: '<path d="M12 20V8M6 14l6-6 6 6M4 4h16"/>',
    chat: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.4a8.4 8.4 0 1 1 15.5-4.5Z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const fmt = (n, d) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 2 : d });
  const aed = (n) => "AED " + fmt(n, Number(n) % 1 ? 2 : 0);
  const compact = (n) => (n >= 10000 ? fmt(n / 1000, 1) + "K" : fmt(n, 0));
  const day = (s) => (s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  const when = (s) => (s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
  const L = (v) => (v == null ? "" : typeof v === "object" ? v.en || v.ar || "" : v);
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const cat = (id) => D.categories.find((c) => c.id === id);
  const typeName = (t) => L(D.types[t]) || t;
  const countryName = (code) => (D.countries[code] ? L(D.countries[code].short) : code || "");
  const localMoney = (v, currency) => {
    const c = Object.values(D.countries).find((x) => x.currency === currency) || { decimals: 0 };
    return `${currency} ${fmt(v, c.decimals)}`;
  };
  function toast(msg, err) {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const el = document.createElement("div");
    el.className = "toast" + (err ? " err" : "");
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), err ? 6000 : 2800);
  }
  const fail = (e) => toast((e && (e.message || e.error_description)) || "Something went wrong", true);

  // Reads every row, 1000 at a time (the database's page size).
  async function all(make) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await make().range(from, from + 999);
      if (error) throw error;
      out.push(...data);
      if (data.length < 1000) return out;
    }
  }

  function csv(rows, cols) {
    const cell = (v) => {
      const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return "﻿" + [cols.map((c) => c[0]).join(","), ...rows.map((r) => cols.map((c) => cell(c[1](r))).join(","))].join("\r\n");
  }
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') (cur += '"'), i++;
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") row.push(cur), (cur = "");
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else cur += ch;
    }
    if (cur || row.length) row.push(cur), rows.push(row);
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
    return rows.filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/csv;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 500);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);

  /* ---------- state ---------- */
  const S = {
    user: null,
    tab: "dashboard",
    settings: {},
    products: null,
    orders: null,
    ambassadors: null,
    customers: null,
    days: 30,
  };
  const markupPct = () => Number(S.settings.pricing && S.settings.pricing.markupPct != null ? S.settings.pricing.markupPct : D.config.pricing.markupPct) || 0;
  // What shoppers pay, exactly as the store works it out.
  function shopPrice(base, code, prices) {
    const c = D.countries[code];
    if (prices && prices[c.currency] != null && prices[c.currency] !== "") return Number(prices[c.currency]);
    const v = Number(base || 0) * (1 + markupPct() / 100) * c.rate;
    return c.decimals ? Math.round(v * 4) / 4 : Math.round(v);
  }

  /* ---------- sign in ---------- */
  function renderLogin(opts) {
    const o = opts || {};
    const photo = D.config.photos && D.config.photos.virginiaHero;
    app.innerHTML = `<div class="login">
      <div class="login-art">
        ${photo ? `<img class="photo" src="${esc(photo)}" alt="">` : ""}
        <h1>wepink Gulf<br><em>admin</em></h1>
        <p>Products, photos, prices, orders, ambassadors and customers — every change goes live on the store.</p>
      </div>
      <div class="login-main">
        <form class="login-card" id="login" novalidate>
          <img class="logo" src="assets/brand/logo.svg" alt="wepink">
          <h2 id="login-title">${o.mode === "signup" ? "Create your admin account" : o.mode === "reset" ? "Choose a new password" : "Sign in"}</h2>
          ${o.mode === "reset" ? "" : `<div class="login-tabs" role="tablist">
            <button type="button" role="tab" data-mode="signin" aria-selected="${o.mode !== "signup"}">Sign in</button>
            <button type="button" role="tab" data-mode="signup" aria-selected="${o.mode === "signup"}">Create account</button>
          </div>`}
          ${o.notAdmin ? `<p class="note warn"><strong>${esc(o.notAdmin)}</strong> isn't an admin yet. Ask the store owner to add this email in Settings → Admins, then sign in again.</p>` : ""}
          ${!o.mode || o.mode === "signin" ? `<div class="oauth">
            <button class="btn-oauth google" type="button" data-oauth="google"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</button>
            <button class="btn-oauth apple" type="button" data-oauth="apple"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>Continue with Apple</button>
          </div>
          <p class="or"><span>or with email</span></p>` : ""}
          ${o.mode === "reset" ? "" : `<label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required value="${esc(o.email || "")}"></label>`}
          <label class="field"><span>${o.mode === "reset" ? "New password" : "Password"}</span><input name="password" type="password" autocomplete="${o.mode === "signin" || !o.mode ? "current-password" : "new-password"}" minlength="8" required></label>
          ${o.mode === "signup" ? `<p class="small muted">At least 8 characters. We'll email you a link to confirm the address — click it, then come back here and sign in.</p>` : ""}
          <button class="btn btn-primary btn-block" type="submit">${o.mode === "signup" ? "Create account" : o.mode === "reset" ? "Save password" : "Sign in"}</button>
          ${!o.mode || o.mode === "signin" ? `<button class="link" type="button" data-forgot>Forgot your password?</button>` : ""}
          <p class="msg" id="login-msg" role="status"></p>
        </form>
      </div>
    </div>`;
    const form = document.getElementById("login");
    const msg = document.getElementById("login-msg");
    const say = (text, ok) => {
      msg.textContent = text;
      msg.className = "msg " + (ok ? "ok" : "err");
    };
    form.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-mode]");
      if (tab) renderLogin({ mode: tab.dataset.mode, email: form.email && form.email.value });
      const oauth = e.target.closest("[data-oauth]");
      if (oauth) {
        const provider = oauth.dataset.oauth;
        const name = provider === "apple" ? "Apple" : "Google";
        if (!/^https?:$/.test(location.protocol))
          return say(`${name} sign-in works when the admin is opened from the store's web address (e.g. yourstore.com/admin.html). From a file on your computer, use email and password.`);
        fetch(`${SB.url}/auth/v1/settings`, { headers: { apikey: SB.key } })
          .then((r) => r.json())
          .then((st) => {
            if (!(st.external || {})[provider]) return say(`${name} sign-in isn't switched on yet: turn it on in Supabase → Authentication → Sign In / Providers (steps in the README).`);
            return sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.href.split("#")[0] } }).then(({ error }) => error && say(error.message));
          })
          .catch(() => say("Couldn't reach the sign-in service — check the connection."));
      }
      if (e.target.closest("[data-forgot]")) {
        const email = form.email.value.trim();
        if (!email) return say("Type your email first, then tap “Forgot your password?”.");
        sb.auth.resetPasswordForEmail(email, { redirectTo: location.protocol.startsWith("http") ? location.href.split("#")[0] : undefined }).then(({ error }) =>
          error ? say(error.message) : say("If that email has an account, a reset link is on its way.", true)
        );
      }
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const password = form.password.value;
      if (password.length < 8) return say("The password needs at least 8 characters.");
      btn.disabled = true;
      try {
        if (o.mode === "reset") {
          const { error } = await sb.auth.updateUser({ password });
          if (error) throw error;
          const { data } = await sb.auth.getUser();
          return enter(data.user);
        }
        const email = form.email.value.trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please enter a valid email.");
        if (o.mode === "signup") {
          const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.protocol.startsWith("http") ? location.href.split("#")[0] : undefined } });
          if (error) throw error;
          if (data.session) return enter(data.user);
          say(`Almost there — open the email we sent to ${email} and click the confirmation link. Then come back and sign in. (If the link opens a page that doesn't load, that's fine: your email is confirmed.)`, true);
        } else {
          const { data, error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw new Error(/confirm/i.test(error.message) ? "Please confirm your email first — check your inbox for the link." : error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
          return enter(data.user);
        }
      } catch (err) {
        say(err.message || String(err));
      } finally {
        btn.disabled = false;
      }
    });
  }

  async function enter(user) {
    const { data: ok, error } = await sb.rpc("is_admin");
    if (error || !ok) {
      await sb.auth.signOut();
      return renderLogin({ notAdmin: user && user.email, email: user && user.email });
    }
    S.user = user;
    const { data: rows } = await sb.from("settings").select("key,value");
    S.settings = Object.fromEntries((rows || []).map((r) => [r.key, r.value]));
    renderShell();
    const tab = location.hash.slice(1);
    go(VIEWS[tab] ? tab : "dashboard");
  }

  /* ---------- shell ---------- */
  const TABS = [
    ["dashboard", "Dashboard", "chart"],
    ["products", "Products", "box"],
    ["orders", "Orders", "bag"],
    ["ambassadors", "Ambassadors", "star"],
    ["customers", "Customers", "users"],
    ["settings", "Settings", "gear"],
  ];
  function renderShell() {
    app.innerHTML = `<div class="adm">
      <aside class="side">
        <div class="side-logo"><img src="assets/brand/logo-white.svg" alt="wepink"><span>Admin</span></div>
        <nav class="nav" aria-label="Admin">${TABS.map(([k, label, ic]) => `<button type="button" data-tab="${k}">${icon(ic)}<span>${label}</span>${k === "orders" ? `<span class="count" id="new-orders" hidden></span>` : ""}</button>`).join("")}</nav>
        <div class="side-foot">
          <a href="${esc(STORE)}" target="_blank" rel="noopener">${icon("ext")}Open the store</a>
          <span class="who" title="${esc(S.user.email)}">${esc(S.user.email)}</span>
          <button type="button" data-signout>${icon("out")}Sign out</button>
        </div>
      </aside>
      <main class="main" id="view"></main>
    </div>`;
    app.querySelector(".nav").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (b) go(b.dataset.tab);
    });
    app.querySelector("[data-signout]").addEventListener("click", () => sb.auth.signOut());
    countNewOrders();
  }
  async function countNewOrders() {
    const { count } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "new");
    const el = document.getElementById("new-orders");
    if (el) (el.hidden = !count), (el.textContent = count || "");
  }
  function go(tab) {
    S.tab = tab;
    history.replaceState(null, "", "#" + tab);
    app.querySelectorAll("[data-tab]").forEach((b) => (b.getAttribute("data-tab") === tab ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
    closeDrawer();
    // A fresh element per view, so one view's listeners never see another's rows.
    const old = document.getElementById("view");
    const v = old.cloneNode(false);
    old.replaceWith(v);
    v.innerHTML = `<p class="boot">Loading…</p>`;
    VIEWS[tab](v).catch((e) => {
      v.innerHTML = `<div class="note warn">Couldn't load this page: ${esc(e.message || e)}</div>`;
    });
    window.scrollTo(0, 0);
  }
  const head = (title, sub, actions) => `<div class="top"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${actions ? `<div class="top-actions">${actions}</div>` : ""}</div>`;

  /* ---------- drawer ---------- */
  let drawerKeys = null;
  function openDrawer(title, body, foot) {
    closeDrawer();
    const wrap = document.createElement("div");
    wrap.id = "drawer-root";
    wrap.innerHTML = `<div class="scrim" data-close-drawer></div>
      <section class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div class="drawer-head"><h2 id="drawer-title">${title}</h2><button class="icon-btn" type="button" data-close-drawer aria-label="Close">${icon("close")}</button></div>
        <div class="drawer-body">${body}</div>
        ${foot ? `<div class="drawer-foot">${foot}</div>` : ""}
      </section>`;
    document.body.appendChild(wrap);
    document.documentElement.style.overflow = "hidden";
    wrap.addEventListener("click", (e) => e.target.closest("[data-close-drawer]") && closeDrawer());
    drawerKeys = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", drawerKeys);
    const first = wrap.querySelector(".drawer-body input, .drawer-body select, .drawer-body textarea, .drawer-body button");
    setTimeout(() => first && first.focus(), 50);
    return wrap.querySelector(".drawer");
  }
  function closeDrawer() {
    const d = document.getElementById("drawer-root");
    if (d) d.remove();
    document.documentElement.style.overflow = "";
    if (drawerKeys) document.removeEventListener("keydown", drawerKeys);
  }

  /* =====================================================================
   * Dashboard
   * ===================================================================== */
  async function viewDashboard(v) {
    const { data: o, error } = await sb.rpc("admin_overview", { p_days: S.days });
    if (error) throw error;
    const range = `<div class="range" role="group" aria-label="Period">${[7, 30, 90]
      .map((d) => `<button type="button" data-days="${d}" aria-pressed="${S.days === d}">${d} days</button>`)
      .join("")}</div>`;
    const st = o.ordersByStatus || {};
    const kpi = (label, value, hint, cls) => `<div class="kpi ${cls || ""}"><p class="label">${esc(label)}</p><p class="value">${value}</p>${hint ? `<p class="hint">${hint}</p>` : ""}</div>`;
    v.innerHTML = `${head("Dashboard", `The last ${S.days} days on the store.`, range)}
      <div class="kpis">
        ${kpi("Sales", aed(o.revenueAed), `${fmt(o.orders)} orders (cancelled and returned left out)`, "hero")}
        ${kpi("Visitors", compact(o.visitors), `${compact(o.visits)} page views`)}
        ${kpi("New customers", compact(o.newCustomers), `${compact(o.customers)} in total`)}
        ${kpi("Agreed to offers", compact(o.marketing), "can receive WhatsApp / email offers")}
        ${kpi("Ambassadors", compact(o.ambassadors), `${compact(o.refClicks)} visits to their links`)}
        ${kpi("Commission due", aed(o.commissionDueAed), "delivered orders, not yet paid")}
        ${kpi("Orders to handle", fmt((st.new || 0) + (st.confirmed || 0)), `${fmt(st.new || 0)} new · ${fmt(st.confirmed || 0)} confirmed · ${fmt(st.shipped || 0)} shipped`)}
      </div>
      <div class="dash-grid">
        <section class="card wide"><div class="card-head"><div><h2>Visits per day</h2><p class="sub">Page views from shoppers who accepted cookies</p></div></div>${columns(o.byDay || [])}</section>
        <section class="card"><div class="card-head"><div><h2>Where visitors come from</h2><p class="sub">Campaign (utm_source), ambassador link or website — by visit</p></div></div>${bars(o.sources)}</section>
        <section class="card"><div class="card-head"><div><h2>Most viewed pages</h2><p class="sub">Page views</p></div></div>${bars(o.pages, (k) => ({ home: "Home", shop: "Shop", product: "Product pages", checkout: "Checkout", earn: "Earn with wepink", stores: "Stores", about: "About", help: "Help" }[k] || k))}</section>
        <section class="card"><div class="card-head"><div><h2>Visitors by country</h2><p class="sub">Where they connect from</p></div></div>${bars(o.geo, geoName)}</section>
        <section class="card"><div class="card-head"><div><h2>Devices &amp; language</h2><p class="sub">Visitors</p></div></div>${bars([...(o.devices || []), ...(o.langs || []).map((x) => ({ k: x.k === "ar" ? "Arabic" : x.k === "en" ? "English" : x.k, n: x.n }))], (k) => k[0].toUpperCase() + k.slice(1))}</section>
      </div>
      ${o.visits ? "" : `<p class="note" style="margin-top:16px">Visitor numbers fill in as shoppers accept the cookie banner on the store. Orders, customers and ambassadors are counted either way.</p>`}`;
    v.querySelector(".range").addEventListener("click", (e) => {
      const b = e.target.closest("[data-days]");
      if (!b) return;
      S.days = +b.dataset.days;
      go("dashboard");
    });
    bindColumns(v);
  }
  const GEO = { AE: "UAE", SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman", US: "United States", GB: "United Kingdom", IN: "India", PK: "Pakistan", EG: "Egypt", BR: "Brazil", JO: "Jordan", LB: "Lebanon", PH: "Philippines" };
  const geoName = (k) => GEO[k] || (k === "?" ? "Unknown" : k);

  // One series → no legend; the card title names it. Hover/focus shows the values.
  function columns(rows) {
    const byDay = new Map(rows.map((r) => [r.day, r]));
    const days = [];
    for (let i = S.days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      days.push(byDay.get(d) || { day: d, visits: 0, visitors: 0 });
    }
    const max = Math.max(1, ...days.map((d) => d.visits));
    const step = niceStep(max);
    const top = Math.ceil(max / step) * step;
    const ticks = [];
    for (let t = 0; t <= top; t += step) ticks.push(t);
    const label = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `<div class="cols-wrap">
      <div class="cols-y" aria-hidden="true">${ticks.map((t) => `<span style="bottom:${(t / top) * 100}%">${compact(t)}</span>`).join("")}</div>
      <div class="cols-plot">
        ${ticks.map((t) => `<span class="cols-grid${t === 0 ? " base" : ""}" style="bottom:${(t / top) * 100}%"></span>`).join("")}
        <div class="cols">${days
          .map(
            (d) =>
              `<button type="button" class="col${d.visits ? "" : " zero"}" data-tip="${esc(label(d.day))}" data-v="${d.visits}" data-u="${d.visitors}" aria-label="${esc(label(d.day))}: ${d.visits} page views, ${d.visitors} visitors"><i style="height:${(d.visits / top) * 100}%"></i></button>`
          )
          .join("")}</div>
        <div class="tip" hidden></div>
      </div>
      <div class="cols-x" aria-hidden="true"><span>${label(days[0].day)}</span><span>${label(days[Math.floor(days.length / 2)].day)}</span><span>${label(days[days.length - 1].day)}</span></div>
    </div>`;
  }
  function niceStep(max) {
    const raw = max / 4;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
  }
  function bindColumns(root) {
    const plot = root.querySelector(".cols-plot");
    if (!plot) return;
    const tip = plot.querySelector(".tip");
    const show = (col) => {
      tip.innerHTML = "";
      const strong = document.createElement("strong");
      strong.textContent = `${fmt(col.dataset.v)} page views`;
      const span = document.createElement("span");
      span.textContent = `${col.dataset.tip} · ${fmt(col.dataset.u)} visitors`;
      tip.append(strong, span);
      const r = col.getBoundingClientRect();
      const pr = plot.getBoundingClientRect();
      const bar = col.querySelector("i").getBoundingClientRect();
      tip.hidden = false;
      const half = tip.offsetWidth / 2;
      tip.style.left = Math.min(Math.max(r.left - pr.left + r.width / 2, half), pr.width - half) + "px";
      tip.style.top = bar.top - pr.top + "px";
    };
    plot.addEventListener("pointerover", (e) => e.target.closest(".col") && show(e.target.closest(".col")));
    plot.addEventListener("focusin", (e) => e.target.closest(".col") && show(e.target.closest(".col")));
    plot.addEventListener("pointerleave", () => (tip.hidden = true));
    plot.addEventListener("focusout", () => (tip.hidden = true));
  }
  function bars(rows, name) {
    rows = (rows || []).filter((r) => r.n > 0);
    if (!rows.length) return `<p class="empty">No data yet</p>`;
    const max = Math.max(...rows.map((r) => r.n));
    return `<ul class="hbars">${rows
      .map((r) => `<li class="hbar"><span class="k" title="${esc(name ? name(r.k) : r.k)}">${esc(name ? name(r.k) : r.k)}</span><span class="bar"><i style="width:${Math.max(1, (r.n / max) * 82)}%"></i><b>${fmt(r.n)}</b></span></li>`)
      .join("")}</ul>`;
  }

  /* =====================================================================
   * Products
   * ===================================================================== */
  const PV = { q: "", cat: "", status: "", shown: 60, sel: new Set() };
  async function loadProducts() {
    S.products = await all(() => sb.from("products").select("*").order("sort").order("id"));
  }
  function photosOf(r) {
    if (r.images && r.images.length) return { own: true, list: r.images, cutout: r.cutout || "" };
    const b = CATALOG.get(r.id);
    if (!b) return { own: false, list: [], cutout: "" };
    return { own: false, list: b.images && b.images.length ? b.images : b.image ? [b.image] : [], cutout: b.cutout || "" };
  }
  const thumbOf = (r) => {
    const ph = photosOf(r);
    return ph.cutout || ph.list[0] || "";
  };

  async function viewProducts(v) {
    if (!S.products) await loadProducts();
    v.innerHTML = `${head(
      "Products",
      `${fmt(S.products.length)} products · ${fmt(S.products.filter((p) => p.active).length)} live · shoppers pay the price <strong>+${markupPct()}%</strong> (<button class="link" type="button" data-goto="settings">change</button>)`,
      `<button class="btn" type="button" data-export>${icon("down")}Export CSV</button>
       <label class="btn">${icon("up")}Import CSV<input type="file" accept=".csv,text/csv" data-import hidden></label>
       <button class="btn btn-primary" type="button" data-new>${icon("plus")}Add product</button>`
    )}
      <div class="toolbar">
        <input class="input search" type="search" placeholder="Search name, id, size…" value="${esc(PV.q)}" data-q aria-label="Search products">
        <select class="input" data-cat aria-label="Category"><option value="">All categories</option>${D.categories.map((c) => `<option value="${c.id}"${PV.cat === c.id ? " selected" : ""}>${esc(L(c.name))}</option>`).join("")}</select>
        <select class="input" data-status aria-label="Status"><option value="">Live and hidden</option><option value="live"${PV.status === "live" ? " selected" : ""}>Live</option><option value="hidden"${PV.status === "hidden" ? " selected" : ""}>Hidden</option></select>
      </div>
      <div class="table-card"><div class="table-scroll"><table>
        <thead><tr><th style="width:36px"><input type="checkbox" data-all aria-label="Select all shown"></th><th></th><th>Product</th><th class="hide-sm">Category</th><th class="num">Price</th><th class="num hide-sm">Shoppers pay (UAE)</th><th>Status</th></tr></thead>
        <tbody id="p-rows"></tbody>
      </table></div><div class="more" id="p-more"></div></div>
      <div id="p-bulk"></div>
      ${CATALOG.size ? `<p class="small muted" style="margin-top:14px">Products removed by mistake? <button class="link" type="button" data-restore>Add back any missing original products</button></p>` : ""}`;
    const draw = () => {
      const q = PV.q.toLowerCase();
      const list = S.products.filter(
        (p) =>
          (!PV.cat || p.cat === PV.cat) &&
          (!PV.status || (PV.status === "live") === p.active) &&
          (!q || [p.id, p.line, p.line_ar, p.size, typeName(p.type)].some((x) => x && String(x).toLowerCase().includes(q)))
      );
      v.querySelector("#p-rows").innerHTML =
        list
          .slice(0, PV.shown)
          .map(
            (p) => `<tr class="row" data-id="${esc(p.id)}">
          <td><input type="checkbox" data-sel="${esc(p.id)}" ${PV.sel.has(p.id) ? "checked" : ""} aria-label="Select ${esc(p.line)}"></td>
          <td>${thumbOf(p) ? `<img class="thumb" src="${esc(thumbOf(p))}" alt="" loading="lazy">` : `<span class="thumb"></span>`}</td>
          <td><span class="strong">${esc(p.line)}</span><span class="sub">${esc(typeName(p.type))}${p.size ? " · " + esc(p.size) : ""}${p.badge ? ` · <span class="tag">${esc(p.badge)}</span>` : ""}</span></td>
          <td class="hide-sm">${esc(L((cat(p.cat) || {}).name) || p.cat)}</td>
          <td class="num">${aed(p.price)}${p.compare_at ? `<span class="sub"><s>${aed(p.compare_at)}</s></span>` : ""}</td>
          <td class="num hide-sm">${aed(shopPrice(p.price, "AE", p.prices))}</td>
          <td>${p.active ? `<span class="pill good">Live</span>` : `<span class="pill off">Hidden</span>`}</td>
        </tr>`
          )
          .join("") || `<tr><td colspan="7" class="empty">No products match</td></tr>`;
      v.querySelector("#p-more").innerHTML = list.length > PV.shown ? `<button class="btn" type="button" data-more>Show more (${fmt(list.length - PV.shown)} left)</button>` : `<span class="small muted">${fmt(list.length)} shown</span>`;
      drawBulk();
    };
    const drawBulk = () => {
      const n = PV.sel.size;
      v.querySelector("#p-bulk").innerHTML = n
        ? `<div class="bulk"><span>${n} selected</span><button class="btn btn-sm" type="button" data-bulk="show">Make live</button><button class="btn btn-sm" type="button" data-bulk="hide">Hide</button><button class="btn btn-sm btn-danger" type="button" data-bulk="delete">Delete</button><button class="btn btn-sm" type="button" data-bulk="clear">Clear</button></div>`
        : "";
    };
    draw();
    v.addEventListener("input", (e) => {
      if (e.target.matches("[data-q]")) (PV.q = e.target.value), (PV.shown = 60), draw();
    });
    v.addEventListener("change", async (e) => {
      if (e.target.matches("[data-cat]")) (PV.cat = e.target.value), (PV.shown = 60), draw();
      if (e.target.matches("[data-status]")) (PV.status = e.target.value), (PV.shown = 60), draw();
      if (e.target.matches("[data-sel]")) {
        e.target.checked ? PV.sel.add(e.target.dataset.sel) : PV.sel.delete(e.target.dataset.sel);
        drawBulk();
      }
      if (e.target.matches("[data-all]")) {
        v.querySelectorAll("[data-sel]").forEach((c) => {
          c.checked = e.target.checked;
          e.target.checked ? PV.sel.add(c.dataset.sel) : PV.sel.delete(c.dataset.sel);
        });
        drawBulk();
      }
      if (e.target.matches("[data-import]") && e.target.files[0]) importProducts(e.target.files[0]).then(() => go("products"));
    });
    v.addEventListener("click", async (e) => {
      if (e.target.closest("[data-goto]")) return go(e.target.closest("[data-goto]").dataset.goto);
      if (e.target.closest("[data-more]")) return (PV.shown += 120), draw();
      if (e.target.closest("[data-new]")) return editProduct(null);
      if (e.target.closest("[data-export]")) return exportProducts();
      if (e.target.closest("[data-restore]")) return restoreBuiltIn().then(() => go("products"));
      const bulk = e.target.closest("[data-bulk]");
      if (bulk) return bulkProducts(bulk.dataset.bulk).then(draw);
      if (e.target.closest("input, label, button, a")) return;
      const row = e.target.closest("tr[data-id]");
      if (row) editProduct(S.products.find((p) => p.id === row.dataset.id));
    });
  }

  async function bulkProducts(action) {
    const ids = [...PV.sel];
    if (action === "clear") return PV.sel.clear();
    if (action === "delete" && !confirm(`Delete ${ids.length} product(s) from the store? This can't be undone (hiding keeps them).`)) return;
    try {
      for (let i = 0; i < ids.length; i += 200) {
        const part = ids.slice(i, i + 200);
        const q = action === "delete" ? sb.from("products").delete().in("id", part) : sb.from("products").update({ active: action === "show" }).in("id", part);
        const { error } = await q;
        if (error) throw error;
      }
      if (action === "delete") S.products = S.products.filter((p) => !PV.sel.has(p.id));
      else S.products.forEach((p) => PV.sel.has(p.id) && (p.active = action === "show"));
      toast(action === "delete" ? `Deleted ${ids.length}` : action === "show" ? `${ids.length} now live` : `${ids.length} hidden`);
      PV.sel.clear();
    } catch (e) {
      fail(e);
    }
  }

  const slug = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  const notesText = (arr) => (arr || []).map(([en, ar]) => (ar && ar !== en ? `${en} | ${ar}` : en)).join("\n");
  const textNotes = (t) =>
    String(t || "")
      .split("\n")
      .map((l) => l.split("|").map((s) => s.trim()))
      .filter((x) => x[0])
      .map(([en, ar]) => [en, ar || en]);
  const GENDERS = [["feminino", "Women"], ["masculino", "Men"], ["unissex", "Unisex"], ["infantil", "Kids"]];
  const BADGES = [["", "None"], ["new", "New"], ["bestseller", "Bestseller"], ["exclusive", "Gulf exclusive"], ["limited", "Limited edition"]];

  function editProduct(row) {
    const isNew = !row;
    const d = row
      ? JSON.parse(JSON.stringify(row))
      : { id: "", active: true, sort: Math.max(0, ...S.products.map((p) => p.sort || 0)) + 10, cat: "body-splash", type: "splash", line: "", line_ar: "", size: "", family: "", gender: "feminino", badge: "new", color: "#F06FA8", color2: "#FCE4EF", price: 79, compare_at: null, prices: null, tagline: { en: "", ar: "" }, description: { en: "", ar: "" }, notes: {}, images: null, cutout: null };
    let images = d.images && d.images.length ? d.images.slice() : null; // null = the store's original photos
    let cutFirst = !!(images && d.cutout && d.cutout === images[0]);
    const tl = d.tagline || {};
    const ds = d.description || {};
    const nt = d.notes || {};
    const sel = (name, opts, val) => `<select name="${name}">${opts.map(([k, l]) => `<option value="${esc(k)}"${String(val || "") === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    const body = `<form id="pform" class="drawer-form" novalidate style="display:grid;gap:16px">
      <section class="section"><h3>Photos</h3><div id="photos"></div></section>
      <section class="section"><h3>Product</h3>
        <div class="grid-2">
          <label class="field"><span>Name *</span><input name="line" required value="${esc(d.line)}" placeholder="e.g. VF Golden"></label>
          <label class="field"><span>Arabic name</span><input name="line_ar" dir="rtl" value="${esc(d.line_ar || "")}" placeholder="مثال: زيت الشعر"><small>For makeup, skincare and hair. Perfumes and body splashes keep their Latin name in Arabic.</small></label>
        </div>
        <div class="grid-3">
          <label class="field"><span>Category *</span>${sel("cat", D.categories.map((c) => [c.id, L(c.name)]), d.cat)}</label>
          <label class="field"><span>Type *</span>${sel("type", Object.keys(D.types).map((k) => [k, L(D.types[k])]), d.type)}</label>
          <label class="field"><span>Size</span><input name="size" value="${esc(d.size || "")}" placeholder="200 ml"></label>
        </div>
        <div class="grid-3">
          <label class="field"><span>Badge</span>${sel("badge", BADGES, d.badge)}</label>
          <label class="field"><span>Scent family</span>${sel("family", [["", "—"], ...Object.keys(D.families).map((k) => [k, L(D.families[k])])], d.family)}</label>
          <label class="field"><span>For</span>${sel("gender", [["", "—"], ...GENDERS], d.gender)}</label>
        </div>
      </section>
      <section class="section"><h3>Price</h3>
        <div class="grid-2">
          <label class="field"><span>Price (AED) *</span><input name="price" type="number" min="0" step="0.01" required value="${esc(d.price)}"></label>
          <label class="field"><span>Was (AED)</span><input name="compare_at" type="number" min="0" step="0.01" value="${esc(d.compare_at || "")}" placeholder="optional — shows “Save x%”"></label>
        </div>
        <div><p class="lbl" style="margin-bottom:6px">Shoppers pay (with the +${markupPct()}% increase)</p><div class="preview-prices" id="pp"></div></div>
        <details class="more-box"${d.prices ? " open" : ""}><summary>Set exact prices per currency</summary>
          <p class="small muted" style="margin-bottom:10px">Leave empty to convert from AED. An exact price is shown as it is (no increase added).</p>
          <div class="grid-3">${COUNTRIES.map((k) => {
            const cur = D.countries[k].currency;
            return `<label class="field"><span>${cur}</span><input name="px_${cur}" type="number" min="0" step="${D.countries[k].decimals ? "0.001" : "1"}" value="${esc(d.prices && d.prices[cur] != null ? d.prices[cur] : "")}"></label>`;
          }).join("")}</div>
        </details>
      </section>
      <section class="section"><h3>Words</h3>
        <div class="grid-2">
          <label class="field"><span>Tagline (English)</span><input name="tl_en" value="${esc(tl.en || "")}"></label>
          <label class="field"><span>Tagline (Arabic)</span><input name="tl_ar" dir="rtl" value="${esc(tl.ar || "")}"></label>
        </div>
        <label class="field"><span>Description (English)</span><textarea name="ds_en" rows="4">${esc(ds.en || "")}</textarea></label>
        <label class="field"><span>Description (Arabic)</span><textarea name="ds_ar" rows="4" dir="rtl">${esc(ds.ar || "")}</textarea></label>
        <div class="grid-3">
          ${["top", "heart", "base"].map((k) => `<label class="field"><span>${{ top: "Top notes", heart: "Heart notes", base: "Base notes" }[k]}</span><textarea name="n_${k}" rows="3" placeholder="Rose | ورد">${esc(notesText(nt[k]))}</textarea></label>`).join("")}
        </div>
        <p class="small muted">Scent notes: one per line, English | Arabic.</p>
      </section>
      <section class="section"><h3>Look &amp; visibility</h3>
        <div class="grid-4">
          <label class="field"><span>Colour</span><input name="color" type="color" value="${esc(d.color || "#F06FA8")}"></label>
          <label class="field"><span>Light colour</span><input name="color2" type="color" value="${esc(d.color2 || "#FCE4EF")}"></label>
          <label class="field"><span>Sort order</span><input name="sort" type="number" step="1" value="${esc(d.sort || 0)}"></label>
          <label class="field"><span>Product id</span><input name="id" value="${esc(d.id)}" ${isNew ? "" : "readonly"} pattern="[a-z0-9-]+" placeholder="made from the name"></label>
        </div>
        <label class="switch"><input type="checkbox" name="active" ${d.active ? "checked" : ""}><span class="track"></span>Live on the store</label>
        <p class="small muted">Colours tint the product's background on the store. Lower sort numbers show first.</p>
      </section>
    </form>`;
    const foot = `${isNew ? "" : `<button class="btn btn-danger" type="button" data-del>${icon("trash")}Delete</button>`}<span class="grow"></span><span class="msg err" id="pmsg"></span><button class="btn" type="button" data-close-drawer>Cancel</button><button class="btn btn-primary" type="button" data-save>${isNew ? "Add product" : "Save"}</button>`;
    const dr = openDrawer(isNew ? "New product" : esc(d.line), body, foot);
    const form = dr.querySelector("#pform");

    function drawPhotos() {
      const built = !images;
      const ph = built ? photosOf(d) : { list: images };
      const list = built ? [ph.cutout, ...ph.list].filter(Boolean) : images;
      dr.querySelector("#photos").innerHTML = `
        <div class="photos">
          ${list
            .map(
              (src, i) => `<div class="photo"><img src="${esc(src)}" alt="">${i === 0 ? `<span class="first">Main</span>` : ""}
              ${built ? "" : `<div class="tools">${i ? `<button type="button" data-mv="${i}" data-dir="-1" aria-label="Move earlier">${icon("left")}</button>` : ""}${i < list.length - 1 ? `<button type="button" data-mv="${i}" data-dir="1" aria-label="Move later">${icon("right")}</button>` : ""}<button type="button" data-rm="${i}" aria-label="Remove photo">${icon("trash")}</button></div>`}</div>`
            )
            .join("")}
          <label class="photo-add" id="add-photo">${icon("image")}<span>${built ? "Upload new photos" : "Add photos"}</span><span class="small muted">PNG, JPG or WebP</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple></label>
        </div>
        ${
          built
            ? `<p class="small muted">${list.length ? "These are the photos that came with the store. Uploading replaces them." : "No photos yet — the store draws a bottle in the product's colours until you add one."}</p>`
            : `<label class="check"><input type="checkbox" data-cut ${cutFirst ? "checked" : ""}>The main photo has a transparent background (the store stages it on its pink scenes)</label>
               ${CATALOG.has(d.id) ? `<button class="link" type="button" data-orig>Go back to the original photos</button>` : ""}`
        }`;
    }
    drawPhotos();

    function prices() {
      const price = Number(form.price.value || 0);
      const px = {};
      COUNTRIES.forEach((k) => {
        const cur = D.countries[k].currency;
        const val = form["px_" + cur].value;
        if (val !== "") px[cur] = Number(val);
      });
      dr.querySelector("#pp").innerHTML = COUNTRIES.map((k) => `<span>${esc(localMoney(shopPrice(price, k, px), D.countries[k].currency))}</span>`).join("");
      return px;
    }
    prices();
    form.addEventListener("input", (e) => {
      if (e.target.name === "price" || (e.target.name || "").startsWith("px_")) prices();
    });

    dr.addEventListener("click", async (e) => {
      const mv = e.target.closest("[data-mv]");
      if (mv) {
        const i = +mv.dataset.mv;
        const j = i + +mv.dataset.dir;
        [images[i], images[j]] = [images[j], images[i]];
        return drawPhotos();
      }
      const rm = e.target.closest("[data-rm]");
      if (rm) {
        images.splice(+rm.dataset.rm, 1);
        if (!images.length) images = CATALOG.has(d.id) ? null : [];
        return drawPhotos();
      }
      if (e.target.closest("[data-orig]")) {
        images = null;
        cutFirst = false;
        return drawPhotos();
      }
      if (e.target.closest("[data-del]")) {
        if (!confirm(`Delete “${d.line}” from the store? This can't be undone — you can hide it instead.`)) return;
        const { error } = await sb.from("products").delete().eq("id", d.id);
        if (error) return fail(error);
        S.products = S.products.filter((p) => p.id !== d.id);
        closeDrawer();
        toast("Product deleted");
        go("products");
      }
      if (e.target.closest("[data-save]")) save(e.target.closest("[data-save]"));
    });
    dr.addEventListener("change", async (e) => {
      if (e.target.matches("[data-cut]")) cutFirst = e.target.checked;
      if (e.target.matches('#add-photo input[type="file"]') && e.target.files.length) {
        const box = dr.querySelector("#add-photo");
        box.classList.add("busy");
        box.querySelector("span").textContent = "Uploading…";
        try {
          const folder = slug(form.id.value || form.line.value) || "product";
          const urls = [];
          for (const file of e.target.files) urls.push(await uploadImage(file, folder));
          images = (images || []).concat(urls);
          toast(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded — save to publish`);
        } catch (err) {
          fail(err);
        }
        drawPhotos();
      }
    });
    form.line.addEventListener("input", () => {
      if (isNew && !form.id.dataset.touched) form.id.value = slug(`${form.type.value} ${form.line.value} ${form.size.value}`);
    });
    form.size.addEventListener("input", () => form.line.dispatchEvent(new Event("input")));
    form.type.addEventListener("change", () => form.line.dispatchEvent(new Event("input")));
    form.id.addEventListener("input", () => (form.id.dataset.touched = "1"));

    async function save(btn) {
      const msg = dr.querySelector("#pmsg");
      const f = form;
      const id = isNew ? slug(f.id.value) : d.id;
      const price = Number(f.price.value);
      const was = f.compare_at.value === "" ? null : Number(f.compare_at.value);
      if (!f.line.value.trim()) return (msg.textContent = "Add a name"), f.line.focus();
      if (!(price >= 0) || f.price.value === "") return (msg.textContent = "Add a price"), f.price.focus();
      if (!/^[a-z0-9][a-z0-9-]{1,90}$/.test(id)) return (msg.textContent = "The product id needs letters or numbers"), f.id.focus();
      if (isNew && S.products.some((p) => p.id === id)) return (msg.textContent = "A product with this id already exists"), f.id.focus();
      const px = prices();
      const row = {
        id,
        active: f.active.checked,
        sort: Number(f.sort.value) || 0,
        cat: f.cat.value,
        type: f.type.value,
        line: f.line.value.trim(),
        line_ar: f.line_ar.value.trim() || null,
        size: f.size.value.trim() || null,
        family: f.family.value || null,
        gender: f.gender.value || null,
        badge: f.badge.value || null,
        color: f.color.value,
        color2: f.color2.value,
        price,
        compare_at: was && was > price ? was : null,
        prices: Object.keys(px).length ? px : null,
        tagline: { en: f.tl_en.value.trim(), ar: f.tl_ar.value.trim() },
        description: { en: f.ds_en.value.trim(), ar: f.ds_ar.value.trim() },
        notes: { top: textNotes(f.n_top.value), heart: textNotes(f.n_heart.value), base: textNotes(f.n_base.value) },
        images: images && images.length ? images : null,
        cutout: images && images.length && cutFirst ? images[0] : null,
      };
      btn.disabled = true;
      msg.textContent = "";
      const q = isNew ? sb.from("products").insert(row).select().single() : sb.from("products").update(row).eq("id", id).select().single();
      const { data, error } = await q;
      btn.disabled = false;
      if (error) return (msg.textContent = error.message);
      if (isNew) S.products.push(data);
      else S.products[S.products.findIndex((p) => p.id === id)] = data;
      S.products.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
      closeDrawer();
      toast(isNew ? "Product added — it's on the store" : "Saved — the store shows it now");
      if (S.tab === "products") go("products");
    }
  }

  // Photos are resized to 1600px and saved as WebP when the browser can.
  async function uploadImage(file, folder) {
    let blob = file;
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * k);
      c.height = Math.round(bmp.height * k);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const webp = await new Promise((r) => c.toBlob(r, "image/webp", 0.88));
      if (webp && webp.type === "image/webp" && (webp.size < file.size || k < 1)) blob = webp;
    } catch (e) {
      /* upload the original */
    }
    const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000", upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const PCOLS = [
    ["id", (p) => p.id],
    ["live", (p) => (p.active ? "yes" : "no")],
    ["sort", (p) => p.sort],
    ["category", (p) => p.cat],
    ["type", (p) => p.type],
    ["name", (p) => p.line],
    ["name_ar", (p) => p.line_ar],
    ["size", (p) => p.size],
    ["price_aed", (p) => p.price],
    ["was_price_aed", (p) => p.compare_at],
    ["badge", (p) => p.badge],
    ["family", (p) => p.family],
    ["gender", (p) => p.gender],
    ["color", (p) => p.color],
    ["color2", (p) => p.color2],
    ["tagline_en", (p) => (p.tagline || {}).en],
    ["tagline_ar", (p) => (p.tagline || {}).ar],
    ["description_en", (p) => (p.description || {}).en],
    ["description_ar", (p) => (p.description || {}).ar],
    ["notes_top", (p) => notesText((p.notes || {}).top).replace(/\n/g, "; ")],
    ["notes_heart", (p) => notesText((p.notes || {}).heart).replace(/\n/g, "; ")],
    ["notes_base", (p) => notesText((p.notes || {}).base).replace(/\n/g, "; ")],
    ["image_urls", (p) => (p.images || []).join(" ")],
    ["exact_prices", (p) => (p.prices ? Object.entries(p.prices).map(([k, v]) => `${k}=${v}`).join(" ") : "")],
  ];
  function exportProducts() {
    download(`wepink-products-${stamp()}.csv`, csv(S.products, PCOLS));
  }
  // Adds or updates products from a CSV with the same columns as the export.
  // Only the columns present in the file are changed.
  async function importProducts(file) {
    const rows = parseCSV(await file.text());
    if (!rows.length) return toast("That file has no rows", true);
    const has = (k) => k in rows[0];
    const notes = (s) => textNotes(String(s || "").replace(/;\s*/g, "\n"));
    const errors = [];
    const out = rows
      .map((r, i) => {
        const id = slug(r.id || `${r.type} ${r.name} ${r.size}`);
        const existing = S.products.find((p) => p.id === id);
        const o = { id };
        const set = (col, key, fn) => has(col) && (o[key] = fn ? fn(r[col]) : r[col] || null);
        set("live", "active", (v) => !/^(no|false|0|hidden)$/i.test(v));
        set("sort", "sort", (v) => Number(v) || 0);
        set("category", "cat", (v) => v || null);
        set("type", "type", (v) => v || null);
        set("name", "line");
        set("name_ar", "line_ar");
        set("size", "size");
        set("price_aed", "price", (v) => (v === "" ? null : Number(v)));
        set("was_price_aed", "compare_at", (v) => (v === "" ? null : Number(v)));
        set("badge", "badge");
        set("family", "family");
        set("gender", "gender");
        set("color", "color");
        set("color2", "color2");
        if (has("tagline_en") || has("tagline_ar")) o.tagline = { en: r.tagline_en || "", ar: r.tagline_ar || "" };
        if (has("description_en") || has("description_ar")) o.description = { en: r.description_en || "", ar: r.description_ar || "" };
        if (has("notes_top") || has("notes_heart") || has("notes_base")) o.notes = { top: notes(r.notes_top), heart: notes(r.notes_heart), base: notes(r.notes_base) };
        set("image_urls", "images", (v) => (v ? v.split(/[\s|]+/).filter((u) => /^https?:\/\//.test(u)) : null));
        set("exact_prices", "prices", (v) => {
          const px = {};
          String(v || "")
            .split(/\s+/)
            .forEach((pair) => {
              const [k, n] = pair.split("=");
              if (k && n !== undefined && n !== "") px[k.toUpperCase()] = Number(n);
            });
          return Object.keys(px).length ? px : null;
        });
        // New products need the basics; existing ones keep what the file leaves out.
        const merged = Object.assign({}, existing || { active: true, sort: 0 }, o);
        if (!merged.line || !merged.cat || !merged.type || merged.price == null || isNaN(merged.price)) errors.push(`Row ${i + 2}: needs name, category, type and price_aed`);
        else if (!cat(merged.cat)) errors.push(`Row ${i + 2}: unknown category “${merged.cat}”`);
        else if (!D.types[merged.type]) errors.push(`Row ${i + 2}: unknown type “${merged.type}”`);
        else if (!/^[a-z0-9][a-z0-9-]{1,90}$/.test(id)) errors.push(`Row ${i + 2}: can't make a product id`);
        else return existing ? o : merged;
        return null;
      })
      .filter(Boolean);
    if (errors.length && !confirm(`${errors.length} row(s) can't be imported:\n\n${errors.slice(0, 8).join("\n")}${errors.length > 8 ? "\n…" : ""}\n\nImport the other ${out.length}?`)) return;
    if (!out.length) return;
    try {
      const fresh = out.filter((o) => !S.products.some((p) => p.id === o.id));
      const updates = out.filter((o) => S.products.some((p) => p.id === o.id));
      for (let i = 0; i < fresh.length; i += 200) {
        const { error } = await sb.from("products").insert(fresh.slice(i, i + 200));
        if (error) throw error;
      }
      for (const u of updates) {
        const { error } = await sb.from("products").update(u).eq("id", u.id);
        if (error) throw error;
      }
      await loadProducts();
      toast(`Imported: ${fresh.length} new, ${updates.length} updated`);
    } catch (e) {
      fail(e);
    }
  }
  async function restoreBuiltIn() {
    const have = new Set(S.products.map((p) => p.id));
    const missing = [...CATALOG.values()].filter((p) => !have.has(p.id));
    if (!missing.length) return toast("All the original products are already there");
    if (!confirm(`Add back ${missing.length} original product(s)?`)) return;
    let sort = Math.max(0, ...S.products.map((p) => p.sort || 0));
    const rows = missing.map((p) => ({
      id: p.id, sort: (sort += 10), cat: p.cat, type: p.type, line: p.line, line_ar: p.lineAr || null, size: p.size || null, family: p.family || null,
      gender: p.gender || null, badge: p.badge || null, color: p.color || null, color2: p.color2 || null, price: p.price, compare_at: p.compareAt || null,
      prices: p.prices || null, tagline: p.tagline || null, description: p.desc || null, notes: p.notes || null, source: p.source || null,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await sb.from("products").insert(rows.slice(i, i + 200));
      if (error) return fail(error);
    }
    await loadProducts();
    toast(`Added back ${rows.length} product(s)`);
  }

  /* =====================================================================
   * Orders
   * ===================================================================== */
  const STATUS = {
    new: ["New", "info"],
    confirmed: ["Confirmed", "warn"],
    shipped: ["Shipped", "warn"],
    delivered: ["Delivered", "good"],
    cancelled: ["Cancelled", "off"],
    returned: ["Returned", "bad"],
  };
  const OV = { status: "", q: "", shown: 100 };
  async function loadOrders() {
    S.orders = await all(() => sb.from("orders").select("*, ambassadors(code,name)").order("created_at", { ascending: false }));
  }
  const statusSelect = (o) =>
    `<select class="input status-select" data-status-of="${o.id}" aria-label="Status of ${esc(o.number)}">${Object.keys(STATUS)
      .map((k) => `<option value="${k}"${o.status === k ? " selected" : ""}>${STATUS[k][0]}</option>`)
      .join("")}</select>`;
  async function viewOrders(v) {
    if (!S.orders) await loadOrders();
    const counts = S.orders.reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {});
    v.innerHTML = `${head("Orders", "Confirm each order with the customer on WhatsApp, then move it along. Commission is due once an order is delivered.", `<button class="btn" type="button" data-export>${icon("down")}Export CSV</button><button class="btn" type="button" data-reload>Refresh</button>`)}
      <div class="chips" role="group" aria-label="Filter by status">
        <button class="chip" type="button" data-f="" aria-pressed="${!OV.status}">All <b>${S.orders.length}</b></button>
        ${Object.keys(STATUS).map((k) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${OV.status === k}">${STATUS[k][0]} <b>${counts[k] || 0}</b></button>`).join("")}
      </div>
      <div class="toolbar"><input class="input search" type="search" placeholder="Search order number, name, phone, code…" value="${esc(OV.q)}" data-q aria-label="Search orders"></div>
      <div class="table-card"><div class="table-scroll"><table>
        <thead><tr><th>Order</th><th>Customer</th><th class="hide-sm">Country</th><th class="num">Total</th><th class="hide-sm">Code</th><th>Status</th><th class="num hide-sm">Commission</th></tr></thead>
        <tbody id="o-rows"></tbody></table></div><div class="more" id="o-more"></div></div>`;
    const draw = () => {
      const q = OV.q.toLowerCase();
      const list = S.orders.filter((o) => (!OV.status || o.status === OV.status) && (!q || [o.number, o.customer && o.customer.name, o.customer && o.customer.phone, o.customer && o.customer.email, o.ref_code].some((x) => x && String(x).toLowerCase().includes(q))));
      v.querySelector("#o-rows").innerHTML =
        list
          .slice(0, OV.shown)
          .map(
            (o) => `<tr class="row" data-id="${o.id}">
            <td><span class="strong">${esc(o.number)}</span><span class="sub">${esc(when(o.created_at))}</span></td>
            <td><span class="strong">${esc(o.customer && o.customer.name)}</span><span class="sub" dir="ltr">${esc(o.customer && o.customer.phone)}</span></td>
            <td class="hide-sm">${esc(countryName(o.country))}<span class="sub">${esc((o.customer && o.customer.city) || "")}</span></td>
            <td class="num"><span class="strong">${esc(localMoney(o.total, o.currency))}</span>${o.currency !== "AED" ? `<span class="sub">${aed(o.total_aed)}</span>` : ""}</td>
            <td class="hide-sm">${o.ref_code ? `<span class="tag">${esc(o.ref_code)}</span>` : ""}</td>
            <td>${statusSelect(o)}</td>
            <td class="num hide-sm">${o.commission_aed != null ? `${aed(o.commission_aed)}<span class="sub">${o.commission_paid ? "paid" : o.status === "delivered" ? "due" : o.status === "cancelled" || o.status === "returned" ? "none" : "pending"}</span>` : "—"}</td>
          </tr>`
          )
          .join("") || `<tr><td colspan="7" class="empty">${S.orders.length ? "No orders match" : "No orders yet — they appear here as soon as shoppers check out."}</td></tr>`;
      v.querySelector("#o-more").innerHTML = list.length > OV.shown ? `<button class="btn" type="button" data-more>Show more</button>` : "";
    };
    draw();
    v.addEventListener("input", (e) => e.target.matches("[data-q]") && ((OV.q = e.target.value), draw()));
    v.addEventListener("change", async (e) => {
      const s = e.target.closest("[data-status-of]");
      if (!s) return;
      const o = S.orders.find((x) => x.id === s.dataset.statusOf);
      const { error } = await sb.from("orders").update({ status: s.value }).eq("id", o.id);
      if (error) return fail(error), (s.value = o.status);
      o.status = s.value;
      toast(`${o.number}: ${STATUS[o.status][0]}`);
      countNewOrders();
      S.ambassadors = null;
    });
    v.addEventListener("click", async (e) => {
      const f = e.target.closest("[data-f]");
      if (f) return (OV.status = f.dataset.f), go("orders");
      if (e.target.closest("[data-more]")) return (OV.shown += 200), draw();
      if (e.target.closest("[data-reload]")) return (S.orders = null), go("orders");
      if (e.target.closest("[data-export]")) return exportOrders();
      if (e.target.closest("select, input, button, a")) return;
      const row = e.target.closest("tr[data-id]");
      if (row) orderDetail(S.orders.find((o) => o.id === row.dataset.id));
    });
  }
  function orderDetail(o) {
    const c = o.customer || {};
    const wa = digits(c.phone);
    const body = `
      <section class="section"><h3>Customer</h3>
        <dl class="kv">
          <dt>Name</dt><dd>${esc(c.name)}</dd>
          <dt>Phone</dt><dd dir="ltr">${esc(c.phone)} ${wa ? `· <a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</dd>
          <dt>Email</dt><dd>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : "—"}</dd>
          <dt>Address</dt><dd>${esc([c.street, c.apt, c.area, c.city, countryName(o.country)].filter(Boolean).join(", "))}</dd>
          ${c.notes ? `<dt>Delivery notes</dt><dd>${esc(c.notes)}</dd>` : ""}
          <dt>Payment</dt><dd>${esc(L(D.payNames[o.payment]) || o.payment || "")}</dd>
          ${o.gift_note ? `<dt>Gift card note</dt><dd>${esc(o.gift_note)}</dd>` : ""}
          <dt>Placed</dt><dd>${esc(when(o.created_at))} · ${esc(o.lang === "ar" ? "Arabic" : "English")} store</dd>
        </dl>
      </section>
      <section class="section"><h3>Items</h3>
        <table class="items"><tbody>${(o.items || [])
          .map((i) => `<tr><td>${esc(i.qty)} × ${esc(i.name || i.id)}</td><td class="num">${esc(localMoney((i.price || 0) * (i.qty || 1), o.currency))}</td></tr>`)
          .join("")}
          <tr><td class="muted">Subtotal</td><td class="num">${esc(localMoney(o.subtotal, o.currency))}</td></tr>
          ${Number(o.discount) ? `<tr><td class="muted">Discount ${o.ref_code ? `(${esc(o.ref_code)})` : ""}</td><td class="num">− ${esc(localMoney(o.discount, o.currency))}</td></tr>` : ""}
          <tr><td class="muted">Delivery</td><td class="num">${Number(o.delivery) ? esc(localMoney(o.delivery, o.currency)) : "Free"}</td></tr>
          <tr><td class="strong">Total</td><td class="num strong">${esc(localMoney(o.total, o.currency))}${o.currency !== "AED" ? ` <span class="muted">(${aed(o.total_aed)})</span>` : ""}</td></tr>
        </tbody></table>
      </section>
      <section class="section"><h3>Status &amp; commission</h3>
        <div class="grid-2">
          <label class="field"><span>Status</span>${statusSelect(o).replace('class="input status-select"', 'class="input" name="status"')}</label>
          <div class="field"><span>Referral</span><p>${o.ref_code ? `${esc(o.ref_code)}${o.ambassadors ? ` — ${esc(o.ambassadors.name)}` : " (not an active ambassador)"}` : "No code"}</p></div>
        </div>
        ${o.commission_aed != null ? `<p>Commission: <strong>${aed(o.commission_aed)}</strong> (${fmt(o.commission_pct)}% of the order before delivery, after the friend discount)</p>
          <label class="check"><input type="checkbox" name="paid" ${o.commission_paid ? "checked" : ""}>Commission paid to the ambassador</label>` : ""}
        <label class="field"><span>Team note</span><textarea name="note" rows="3" placeholder="Only the team sees this">${esc(o.note || "")}</textarea></label>
      </section>`;
    const dr = openDrawer(`Order ${esc(o.number)}`, body, `<button class="btn btn-danger" type="button" data-del>${icon("trash")}Delete</button><span class="grow"></span><button class="btn" type="button" data-close-drawer>Close</button><button class="btn btn-primary" type="button" data-save>Save</button>`);
    dr.addEventListener("click", async (e) => {
      if (e.target.closest("[data-save]")) {
        const patch = { status: dr.querySelector('[name="status"]').value, note: dr.querySelector('[name="note"]').value.trim() || null };
        const paid = dr.querySelector('[name="paid"]');
        if (paid) patch.commission_paid = paid.checked;
        const { error } = await sb.from("orders").update(patch).eq("id", o.id);
        if (error) return fail(error);
        Object.assign(o, patch);
        S.ambassadors = null;
        closeDrawer();
        toast("Order saved");
        countNewOrders();
        go("orders");
      }
      if (e.target.closest("[data-del]")) {
        if (!confirm(`Delete order ${o.number}? Cancelling keeps the record — delete only test or duplicate orders.`)) return;
        const { error } = await sb.from("orders").delete().eq("id", o.id);
        if (error) return fail(error);
        S.orders = S.orders.filter((x) => x.id !== o.id);
        S.ambassadors = null;
        closeDrawer();
        toast("Order deleted");
        go("orders");
      }
    });
  }
  function exportOrders() {
    download(
      `wepink-orders-${stamp()}.csv`,
      csv(S.orders, [
        ["number", (o) => o.number],
        ["date", (o) => o.created_at],
        ["status", (o) => o.status],
        ["name", (o) => o.customer && o.customer.name],
        ["phone", (o) => o.customer && o.customer.phone],
        ["email", (o) => o.customer && o.customer.email],
        ["country", (o) => o.country],
        ["city", (o) => o.customer && o.customer.city],
        ["area", (o) => o.customer && o.customer.area],
        ["street", (o) => o.customer && o.customer.street],
        ["apartment", (o) => o.customer && o.customer.apt],
        ["items", (o) => (o.items || []).map((i) => `${i.qty} x ${i.name || i.id}`).join("; ")],
        ["currency", (o) => o.currency],
        ["subtotal", (o) => o.subtotal],
        ["discount", (o) => o.discount],
        ["delivery", (o) => o.delivery],
        ["total", (o) => o.total],
        ["total_aed", (o) => o.total_aed],
        ["payment", (o) => o.payment],
        ["referral_code", (o) => o.ref_code],
        ["commission_aed", (o) => o.commission_aed],
        ["commission_paid", (o) => (o.commission_aed != null ? (o.commission_paid ? "yes" : "no") : "")],
        ["gift_note", (o) => o.gift_note],
        ["team_note", (o) => o.note],
      ])
    );
  }

  /* =====================================================================
   * Ambassadors
   * ===================================================================== */
  const AV = { q: "" };
  async function loadAmbassadors() {
    const [list, orders] = await Promise.all([
      all(() => sb.from("ambassadors").select("*").order("created_at", { ascending: false })),
      all(() => sb.from("orders").select("ambassador_id,status,total_aed,commission_aed,commission_paid,created_at").not("ambassador_id", "is", null)),
    ]);
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);
    list.forEach((a) => Object.assign(a, { orders: 0, month: 0, sales: 0, pending: 0, due: 0, paid: 0 }));
    const byId = new Map(list.map((a) => [a.id, a]));
    orders.forEach((o) => {
      const a = byId.get(o.ambassador_id);
      if (!a || o.status === "cancelled" || o.status === "returned") return;
      a.orders++;
      if (new Date(o.created_at) >= month) a.month++;
      a.sales += Number(o.total_aed);
      const c = Number(o.commission_aed || 0);
      if (o.status === "delivered") o.commission_paid ? (a.paid += c) : (a.due += c);
      else a.pending += c;
    });
    S.ambassadors = list;
  }
  async function viewAmbassadors(v) {
    if (!S.ambassadors) await loadAmbassadors();
    const R = Object.assign({}, D.config.referral, S.settings.referral || {});
    const tiers = (R.tiers || []).map((t) => {
      const named = D.config.referral.tiers.find((x) => x.id === t.id);
      return `${L(named && named.name) || t.id} ${t.pct}%${t.minOrders ? ` from ${t.minOrders} orders/month` : ""}`;
    });
    const due = S.ambassadors.reduce((s, a) => s + a.due, 0);
    v.innerHTML = `${head("Ambassadors", `Friends get ${R.friendDiscountPct}% off with a code. Commission: ${esc(tiers.join(" · "))} (<button class="link" type="button" data-goto="settings">change</button>).`, `<button class="btn" type="button" data-export>${icon("down")}Export CSV</button>`)}
      <div class="kpis">
        <div class="kpi"><p class="label">Ambassadors</p><p class="value">${fmt(S.ambassadors.length)}</p><p class="hint">${fmt(S.ambassadors.filter((a) => a.status === "active").length)} active</p></div>
        <div class="kpi"><p class="label">Link visits</p><p class="value">${compact(S.ambassadors.reduce((s, a) => s + a.clicks, 0))}</p></div>
        <div class="kpi"><p class="label">Orders with a code</p><p class="value">${fmt(S.ambassadors.reduce((s, a) => s + a.orders, 0))}</p><p class="hint">${aed(S.ambassadors.reduce((s, a) => s + a.sales, 0))} in sales</p></div>
        <div class="kpi"><p class="label">Commission due</p><p class="value">${aed(due)}</p><p class="hint">delivered, not yet paid</p></div>
      </div>
      <div class="toolbar"><input class="input search" type="search" placeholder="Search name, code, phone, email…" value="${esc(AV.q)}" data-q aria-label="Search ambassadors"></div>
      <div class="table-card"><div class="table-scroll"><table>
        <thead><tr><th>Code</th><th>Ambassador</th><th class="num">Visits</th><th class="num">Orders</th><th class="num hide-sm">Sales</th><th class="num">Commission</th><th>Status</th><th></th></tr></thead>
        <tbody id="a-rows"></tbody></table></div></div>`;
    const draw = () => {
      const q = AV.q.toLowerCase();
      const list = S.ambassadors.filter((a) => !q || [a.code, a.name, a.phone, a.email, a.handle].some((x) => x && x.toLowerCase().includes(q)));
      v.querySelector("#a-rows").innerHTML =
        list
          .map(
            (a) => `<tr data-id="${a.id}">
          <td><span class="strong">${esc(a.code)}</span><span class="sub">since ${esc(day(a.created_at))}</span></td>
          <td><span class="strong">${esc(a.name)}</span><span class="sub" dir="ltr">${esc([a.phone, a.email, a.handle].filter(Boolean).join(" · "))}</span></td>
          <td class="num">${fmt(a.clicks)}</td>
          <td class="num">${fmt(a.orders)}<span class="sub">${fmt(a.month)} this month</span></td>
          <td class="num hide-sm">${aed(a.sales)}</td>
          <td class="num"><span class="strong">${aed(a.due)} due</span><span class="sub">${aed(a.pending)} pending · ${aed(a.paid)} paid</span></td>
          <td>${a.status === "active" ? `<span class="pill good">Active</span>` : `<span class="pill off">Paused</span>`}</td>
          <td style="white-space:nowrap">
            ${a.due ? `<button class="btn btn-sm btn-primary" type="button" data-pay="${a.id}">Mark ${aed(a.due)} paid</button>` : ""}
            ${a.phone ? `<a class="btn btn-sm" href="https://wa.me/${digits(a.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(a.name)}">${icon("chat")}</a>` : ""}
            <button class="btn btn-sm" type="button" data-toggle="${a.id}">${a.status === "active" ? "Pause" : "Activate"}</button>
            <button class="btn btn-sm btn-danger" type="button" data-del="${a.id}" aria-label="Delete ${esc(a.name)}">${icon("trash")}</button>
          </td>
        </tr>`
          )
          .join("") || `<tr><td colspan="8" class="empty">${S.ambassadors.length ? "No ambassadors match" : "No ambassadors yet — they join on the store's “Earn with wepink” page."}</td></tr>`;
    };
    draw();
    v.addEventListener("input", (e) => e.target.matches("[data-q]") && ((AV.q = e.target.value), draw()));
    v.addEventListener("click", async (e) => {
      if (e.target.closest("[data-goto]")) return go("settings");
      if (e.target.closest("[data-export]")) return exportAmbassadors();
      const pay = e.target.closest("[data-pay]");
      const tog = e.target.closest("[data-toggle]");
      const del = e.target.closest("[data-del]");
      const a = S.ambassadors.find((x) => x.id === ((pay || tog || del || {}).dataset || {})[pay ? "pay" : tog ? "toggle" : "del"]);
      if (!a) return;
      if (pay) {
        if (!confirm(`Mark ${aed(a.due)} commission as paid to ${a.name}?`)) return;
        const { error } = await sb.from("orders").update({ commission_paid: true }).eq("ambassador_id", a.id).eq("status", "delivered").eq("commission_paid", false);
        if (error) return fail(error);
        toast("Marked as paid");
        S.orders = null;
      } else if (tog) {
        const { error } = await sb.from("ambassadors").update({ status: a.status === "active" ? "paused" : "active" }).eq("id", a.id);
        if (error) return fail(error);
        toast(a.status === "active" ? `${a.code} paused — the code stops working` : `${a.code} active again`);
      } else if (del) {
        if (!confirm(`Delete ambassador ${a.name} (${a.code})? Their code stops working; past orders keep the code.`)) return;
        const { error } = await sb.from("ambassadors").delete().eq("id", a.id);
        if (error) return fail(error);
        toast("Ambassador deleted");
      }
      S.ambassadors = null;
      go("ambassadors");
    });
  }
  function exportAmbassadors() {
    download(
      `wepink-ambassadors-${stamp()}.csv`,
      csv(S.ambassadors, [
        ["code", (a) => a.code],
        ["name", (a) => a.name],
        ["phone", (a) => a.phone],
        ["email", (a) => a.email],
        ["instagram_tiktok", (a) => a.handle],
        ["country", (a) => a.country],
        ["joined", (a) => a.created_at],
        ["status", (a) => a.status],
        ["link_visits", (a) => a.clicks],
        ["orders", (a) => a.orders],
        ["orders_this_month", (a) => a.month],
        ["sales_aed", (a) => a.sales.toFixed(2)],
        ["commission_pending_aed", (a) => a.pending.toFixed(2)],
        ["commission_due_aed", (a) => a.due.toFixed(2)],
        ["commission_paid_aed", (a) => a.paid.toFixed(2)],
      ])
    );
  }

  /* =====================================================================
   * Customers
   * ===================================================================== */
  const SOURCES = { club: "wepink Club", newsletter: "Newsletter", checkout: "Ordered", ambassador: "Ambassador", stores: "Store interest", account: "Signed in" };
  const sourceLabel = (s, c) => (s === "account" && c && c.provider && c.provider !== "email" ? `Signed in with ${c.provider[0].toUpperCase() + c.provider.slice(1)}` : SOURCES[s] || s);
  const CV = { q: "", source: "", offers: false, country: "", shown: 100 };
  async function loadCustomers() {
    S.customers = await all(() => sb.from("customers").select("*").order("last_seen", { ascending: false }));
  }
  async function viewCustomers(v) {
    if (!S.customers) await loadCustomers();
    v.innerHTML = `${head("Customers", "Everyone who left their details on the store — club, newsletter, checkout, ambassadors and store interest. Offers go only to people who agreed.", `<button class="btn btn-primary" type="button" data-export>${icon("down")}Export CSV</button>`)}
      <div class="kpis">
        <div class="kpi"><p class="label">Customers</p><p class="value">${fmt(S.customers.length)}</p></div>
        <div class="kpi"><p class="label">Agreed to offers</p><p class="value">${fmt(S.customers.filter((c) => c.marketing).length)}</p></div>
        <div class="kpi"><p class="label">Have ordered</p><p class="value">${fmt(S.customers.filter((c) => c.orders_count > 0).length)}</p></div>
        <div class="kpi"><p class="label">Club members</p><p class="value">${fmt(S.customers.filter((c) => (c.sources || []).includes("club")).length)}</p></div>
      </div>
      <div class="toolbar">
        <input class="input search" type="search" placeholder="Search name, phone, email…" value="${esc(CV.q)}" data-q aria-label="Search customers">
        <select class="input" data-src aria-label="Joined via"><option value="">Joined via: any</option>${Object.keys(SOURCES).map((k) => `<option value="${k}"${CV.source === k ? " selected" : ""}>${SOURCES[k]}</option>`).join("")}</select>
        <select class="input" data-country aria-label="Country"><option value="">All countries</option>${COUNTRIES.map((k) => `<option value="${k}"${CV.country === k ? " selected" : ""}>${esc(countryName(k))}</option>`).join("")}</select>
        <label class="check"><input type="checkbox" data-offers ${CV.offers ? "checked" : ""}>Agreed to offers only</label>
      </div>
      <div class="table-card"><div class="table-scroll"><table>
        <thead><tr><th>Name</th><th>Contact</th><th class="hide-sm">Country</th><th>Joined via</th><th>Offers</th><th class="num">Orders</th><th class="num hide-sm">Spent</th><th class="hide-sm">Last seen</th></tr></thead>
        <tbody id="c-rows"></tbody></table></div><div class="more" id="c-more"></div></div>`;
    const filtered = () => {
      const q = CV.q.toLowerCase();
      return S.customers.filter(
        (c) =>
          (!CV.source || (c.sources || []).includes(CV.source)) &&
          (!CV.country || c.country === CV.country) &&
          (!CV.offers || c.marketing) &&
          (!q || [c.name, c.phone, c.email].some((x) => x && x.toLowerCase().includes(q)))
      );
    };
    const draw = () => {
      const list = filtered();
      v.querySelector("#c-rows").innerHTML =
        list
          .slice(0, CV.shown)
          .map(
            (c) => `<tr class="row" data-id="${c.id}">
          <td>${c.avatar_url ? `<img class="mini-avatar" src="${esc(c.avatar_url)}" alt="" referrerpolicy="no-referrer">` : ""}<span class="strong">${esc(c.name || "—")}</span>${c.details && c.details.birthday ? `<span class="sub">Birthday ${esc(birthday(c.details.birthday))}</span>` : ""}</td>
          <td><span dir="ltr">${esc(c.phone || "")}</span><span class="sub">${esc(c.email || "")}</span></td>
          <td class="hide-sm">${esc(countryName(c.country))}<span class="sub">${esc(c.city || "")}</span></td>
          <td>${(c.sources || []).map((s) => `<span class="tag">${esc(sourceLabel(s, c))}</span>`).join("")}</td>
          <td>${c.marketing ? `<span class="pill good">Yes</span>` : `<span class="pill off">No</span>`}</td>
          <td class="num">${fmt(c.orders_count)}</td>
          <td class="num hide-sm">${c.spent_aed ? aed(c.spent_aed) : "—"}</td>
          <td class="hide-sm">${esc(day(c.last_seen))}</td>
        </tr>`
          )
          .join("") || `<tr><td colspan="8" class="empty">${S.customers.length ? "No customers match" : "No customers yet."}</td></tr>`;
      v.querySelector("#c-more").innerHTML = list.length > CV.shown ? `<button class="btn" type="button" data-more>Show more</button>` : `<span class="small muted">${fmt(list.length)} shown</span>`;
    };
    draw();
    v.addEventListener("input", (e) => e.target.matches("[data-q]") && ((CV.q = e.target.value), draw()));
    v.addEventListener("change", (e) => {
      if (e.target.matches("[data-src]")) CV.source = e.target.value;
      if (e.target.matches("[data-country]")) CV.country = e.target.value;
      if (e.target.matches("[data-offers]")) CV.offers = e.target.checked;
      draw();
    });
    v.addEventListener("click", (e) => {
      if (e.target.closest("[data-export]")) return exportCustomers(filtered());
      if (e.target.closest("[data-more]")) return (CV.shown += 200), draw();
      const row = e.target.closest("tr[data-id]");
      if (row) customerDetail(S.customers.find((c) => c.id === row.dataset.id));
    });
  }
  const birthday = (s) => {
    const [m, d] = String(s).split("-");
    return m && d ? new Date(2024, +m - 1, +d).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : s;
  };
  async function customerDetail(c) {
    const details = Object.assign({}, c.details || {});
    const extra = Object.keys(details)
      .filter((k) => k !== "birthday")
      .map((k) => `<dt>${esc({ storeCity: "Store wanted", ambassadorCode: "Ambassador code" }[k] || k)}</dt><dd>${esc(typeof details[k] === "object" ? JSON.stringify(details[k]) : details[k])}</dd>`)
      .join("");
    const body = `
      <section class="section"><h3>Details</h3>
        <dl class="kv">
          <dt>Name</dt><dd>${esc(c.name || "—")}</dd>
          <dt>Phone</dt><dd dir="ltr">${esc(c.phone || "—")} ${c.phone ? `· <a href="https://wa.me/${digits(c.phone)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</dd>
          <dt>Email</dt><dd>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : "—"}</dd>
          <dt>Country</dt><dd>${esc(countryName(c.country))}${c.city ? " · " + esc(c.city) : ""}</dd>
          <dt>Language</dt><dd>${c.lang === "ar" ? "Arabic" : c.lang === "en" ? "English" : "—"}</dd>
          ${details.birthday ? `<dt>Birthday</dt><dd>${esc(birthday(details.birthday))}</dd>` : ""}
          <dt>Joined via</dt><dd>${(c.sources || []).map((s) => esc(sourceLabel(s, c))).join(", ")}</dd>
          <dt>Offers</dt><dd>${c.marketing ? "Agreed to WhatsApp / email offers" : "Not agreed — don't send offers"}</dd>
          <dt>Orders</dt><dd>${fmt(c.orders_count)}${c.spent_aed ? ` · ${aed(c.spent_aed)}` : ""}</dd>
          ${c.utm ? `<dt>First came from</dt><dd>${esc(Object.values(c.utm).join(" / "))}</dd>` : ""}
          ${extra}
          <dt>First seen</dt><dd>${esc(when(c.first_seen))}</dd>
          <dt>Last seen</dt><dd>${esc(when(c.last_seen))}</dd>
        </dl>
      </section>
      <section class="section"><h3>Orders</h3><div id="c-orders"><p class="muted">Loading…</p></div></section>
      <section class="section"><h3>Recent visits</h3><div id="c-visits"><p class="muted">${c.visitor_id ? "Loading…" : "No visits on record (cookies not accepted on the device they used)."}</p></div></section>
      <section class="section"><h3>Team note</h3><label class="field"><span class="sr-only">Team note</span><textarea name="note" rows="3" placeholder="Only the team sees this">${esc(c.note || "")}</textarea></label>
        <label class="check"><input type="checkbox" name="marketing" ${c.marketing ? "checked" : ""}>Can receive offers (untick if they ask to stop)</label></section>`;
    const dr = openDrawer(esc(c.name || c.phone || c.email || "Customer"), body, `<button class="btn btn-danger" type="button" data-del>${icon("trash")}Delete their data</button><span class="grow"></span><button class="btn" type="button" data-close-drawer>Close</button><button class="btn btn-primary" type="button" data-save>Save</button>`);
    sb.from("orders")
      .select("number,created_at,status,total,currency")
      .eq("customer_id", c.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const el = dr.querySelector("#c-orders");
        if (el) el.innerHTML = data && data.length ? `<ul class="timeline">${data.map((o) => `<li><span><strong>${esc(o.number)}</strong> · ${esc(STATUS[o.status][0])}</span><span>${esc(localMoney(o.total, o.currency))} · ${esc(day(o.created_at))}</span></li>`).join("")}</ul>` : `<p class="muted">No orders.</p>`;
      });
    if (c.visitor_id)
      sb.from("visits")
        .select("page,path,created_at,device,geo")
        .eq("visitor_id", c.visitor_id)
        .order("created_at", { ascending: false })
        .limit(40)
        .then(({ data }) => {
          const el = dr.querySelector("#c-visits");
          if (el) el.innerHTML = data && data.length ? `<ul class="timeline">${data.map((x) => `<li><span>${esc(x.page)} <span class="muted small">${esc(decodeURIComponent(x.path || "").slice(0, 60))}</span></span><span class="muted">${esc(when(x.created_at))}</span></li>`).join("")}</ul>` : `<p class="muted">No visits recorded.</p>`;
        });
    dr.addEventListener("click", async (e) => {
      if (e.target.closest("[data-save]")) {
        const patch = { note: dr.querySelector('[name="note"]').value.trim() || null, marketing: dr.querySelector('[name="marketing"]').checked };
        const { error } = await sb.from("customers").update(patch).eq("id", c.id);
        if (error) return fail(error);
        Object.assign(c, patch);
        closeDrawer();
        toast("Saved");
        go("customers");
      }
      if (e.target.closest("[data-del]")) {
        if (!confirm(`Delete ${c.name || "this customer"}'s details and recorded visits? Their orders stay (for accounts) but are no longer linked. This can't be undone.`)) return;
        if (c.visitor_id) await sb.from("visits").delete().eq("visitor_id", c.visitor_id);
        const { error } = await sb.from("customers").delete().eq("id", c.id);
        if (error) return fail(error);
        S.customers = S.customers.filter((x) => x.id !== c.id);
        closeDrawer();
        toast("Customer data deleted");
        go("customers");
      }
    });
  }
  function exportCustomers(list) {
    download(
      `wepink-customers-${stamp()}.csv`,
      csv(list, [
        ["name", (c) => c.name],
        ["phone", (c) => c.phone],
        ["email", (c) => c.email],
        ["country", (c) => c.country],
        ["city", (c) => c.city],
        ["language", (c) => c.lang],
        ["birthday", (c) => c.details && c.details.birthday],
        ["joined_via", (c) => (c.sources || []).join(" ")],
        ["signed_in_with", (c) => c.provider],
        ["agreed_to_offers", (c) => (c.marketing ? "yes" : "no")],
        ["orders", (c) => c.orders_count],
        ["spent_aed", (c) => c.spent_aed],
        ["first_source", (c) => c.utm && c.utm.source],
        ["first_campaign", (c) => c.utm && c.utm.campaign],
        ["first_seen", (c) => c.first_seen],
        ["last_seen", (c) => c.last_seen],
        ["team_note", (c) => c.note],
      ])
    );
  }

  /* =====================================================================
   * Settings
   * ===================================================================== */
  async function viewSettings(v) {
    const pricing = Object.assign({ markupPct: D.config.pricing.markupPct }, S.settings.pricing);
    const R = JSON.parse(JSON.stringify(Object.assign({}, D.config.referral, S.settings.referral || {})));
    const contact = Object.assign({ whatsapp: "", email: "", instagram: "", tiktok: "" }, S.settings.contact);
    const { data: admins } = await sb.from("admins").select("email").order("created_at");
    const tierName = (id) => L((D.config.referral.tiers.find((x) => x.id === id) || {}).name) || id;
    v.innerHTML = `${head("Settings", "Changes apply to the store straight away.")}
      <div class="settings">
        <form class="card" data-form="pricing">
          <div><h2>Prices</h2><p class="sub">An increase on every product's price, on top of the price set on the product.</p></div>
          <label class="field"><span>Price increase (%)</span><input name="markupPct" type="number" min="-50" max="200" step="0.5" value="${esc(pricing.markupPct)}"></label>
          <p class="small muted" id="mk-eg"></p>
          <div><button class="btn btn-primary" type="submit">Save prices</button></div>
        </form>
        <form class="card" data-form="referral">
          <div><h2>Referral programme</h2><p class="sub">The friend discount and the ambassadors' commission. Tiers go by orders with their code in the calendar month.</p></div>
          <label class="field"><span>Friend's discount on their first order (%)</span><input name="friendDiscountPct" type="number" min="0" max="50" step="1" value="${esc(R.friendDiscountPct)}"></label>
          <table class="tiers-table"><thead><tr><th>Tier</th><th>From (orders a month)</th><th>Commission (%)</th></tr></thead><tbody>
            ${R.tiers.map((t, i) => `<tr><td class="strong">${esc(tierName(t.id))}</td><td><input class="input" name="min_${i}" type="number" min="0" step="1" value="${esc(t.minOrders)}" ${i === 0 ? "readonly" : ""}></td><td><input class="input" name="pct_${i}" type="number" min="0" max="60" step="0.5" value="${esc(t.pct)}"></td></tr>`).join("")}
          </tbody></table>
          <p class="small muted">New codes end in the friend discount (e.g. MARIAM10). Commission is worked out on each order before delivery and after the friend discount.</p>
          <div><button class="btn btn-primary" type="submit">Save referral terms</button></div>
        </form>
        <form class="card" data-form="contact">
          <div><h2>Contact details</h2><p class="sub">Shown on the store; empty fields keep the ones built into the site.</p></div>
          <label class="field"><span>WhatsApp number (with country code, numbers only)</span><input name="whatsapp" inputmode="tel" placeholder="${esc(D.config.whatsapp)}" value="${esc(contact.whatsapp)}"></label>
          <label class="field"><span>Customer care email</span><input name="email" type="email" placeholder="${esc(D.config.email)}" value="${esc(contact.email)}"></label>
          <label class="field"><span>Instagram link</span><input name="instagram" type="url" placeholder="${esc(D.config.instagram)}" value="${esc(contact.instagram)}"></label>
          <label class="field"><span>TikTok link</span><input name="tiktok" type="url" placeholder="${esc(D.config.tiktok)}" value="${esc(contact.tiktok)}"></label>
          <div><button class="btn btn-primary" type="submit">Save contact details</button></div>
        </form>
        <div class="card">
          <div><h2>Admins</h2><p class="sub">People who can sign in here. They create an account on this page with the same email.</p></div>
          <ul class="admins">${(admins || []).map((a) => `<li><span>${esc(a.email)}${a.email === S.user.email ? ' <span class="muted small">(you)</span>' : ""}</span>${a.email === S.user.email ? "" : `<button class="btn btn-sm btn-danger" type="button" data-rm-admin="${esc(a.email)}">Remove</button>`}</li>`).join("")}</ul>
          <form class="row-inline" data-form="admin"><label class="field"><span>Add an admin</span><input name="email" type="email" placeholder="name@example.com" required></label><button class="btn btn-dark" type="submit">Add</button></form>
        </div>
        <form class="card" data-form="password">
          <div><h2>Your password</h2><p class="sub">Signed in as ${esc(S.user.email)}.</p></div>
          <label class="field"><span>New password</span><input name="password" type="password" minlength="8" autocomplete="new-password" required></label>
          <div><button class="btn" type="submit">Change password</button></div>
        </form>
      </div>`;
    const eg = () => {
      const pct = Number(v.querySelector('[name="markupPct"]').value) || 0;
      v.querySelector("#mk-eg").textContent = `Example: a product priced AED 79 sells for AED ${Math.round(79 * (1 + pct / 100))}; AED 189 sells for AED ${Math.round(189 * (1 + pct / 100))}.`;
    };
    eg();
    v.querySelector('[name="markupPct"]').addEventListener("input", eg);
    const saveSetting = async (key, value) => {
      const { error } = await sb.from("settings").upsert({ key, value });
      if (error) throw error;
      S.settings[key] = value;
    };
    v.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const btn = f.querySelector("[type=submit]");
      btn.disabled = true;
      try {
        if (f.dataset.form === "pricing") {
          const pct = Number(f.markupPct.value);
          if (!isFinite(pct)) throw new Error("Enter a number");
          await saveSetting("pricing", { markupPct: pct });
          toast(`Prices now +${pct}% on the store`);
        } else if (f.dataset.form === "referral") {
          const tiers = R.tiers.map((t, i) => ({ id: t.id, minOrders: Number(f["min_" + i].value) || 0, pct: Number(f["pct_" + i].value) || 0 }));
          await saveSetting("referral", { friendDiscountPct: Number(f.friendDiscountPct.value) || 0, tiers });
          toast("Referral terms saved");
        } else if (f.dataset.form === "contact") {
          const val = { whatsapp: digits(f.whatsapp.value), email: f.email.value.trim(), instagram: f.instagram.value.trim(), tiktok: f.tiktok.value.trim() };
          await saveSetting("contact", val);
          toast("Contact details saved");
        } else if (f.dataset.form === "admin") {
          const email = f.email.value.trim().toLowerCase();
          if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email");
          const { error } = await sb.from("admins").insert({ email });
          if (error) throw error;
          toast(`${email} can now sign in (after creating an account)`);
          return go("settings");
        } else if (f.dataset.form === "password") {
          const { error } = await sb.auth.updateUser({ password: f.password.value });
          if (error) throw error;
          f.reset();
          toast("Password changed");
        }
      } catch (err) {
        fail(err);
      } finally {
        btn.disabled = false;
      }
    });
    v.addEventListener("click", async (e) => {
      const rm = e.target.closest("[data-rm-admin]");
      if (!rm || !confirm(`Remove ${rm.dataset.rmAdmin} as an admin?`)) return;
      const { error } = await sb.from("admins").delete().eq("email", rm.dataset.rmAdmin);
      if (error) return fail(error);
      toast("Admin removed");
      go("settings");
    });
  }

  const VIEWS = { dashboard: viewDashboard, products: viewProducts, orders: viewOrders, ambassadors: viewAmbassadors, customers: viewCustomers, settings: viewSettings };

  /* ---------- start ---------- */
  sb.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      S.user = null;
      S.products = S.orders = S.ambassadors = S.customers = null;
      closeDrawer();
      renderLogin();
    }
    if (event === "PASSWORD_RECOVERY") renderLogin({ mode: "reset" });
  });
  sb.auth.getSession().then(({ data }) => {
    if (/type=recovery/.test(location.hash)) return;
    if (data.session) enter(data.session.user);
    else renderLogin();
  });
})();
