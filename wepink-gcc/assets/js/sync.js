/* wepink Gulf — live data from the store's database (Supabase).
 *
 * The site ships with its own catalogue (catalog.js), so it always works.
 * When config.supabase is set, the products, prices and settings edited in
 * admin.html load from the database instead, and are cached in the browser so
 * the next visit opens instantly while it checks for changes.
 *
 * Also the calls the store makes to the database: orders, ambassador sign-ups
 * and stats, referral codes, contact forms, and page views (only after the
 * shopper accepts cookies).
 */
window.WP_SYNC = (function () {
  const D = window.WP_DATA;
  const SB = D.config.supabase || {};
  const live = !!(SB.url && SB.key);
  const T = D.types;
  const bundled = D.products.slice();
  const base = new Map(bundled.map((p) => [p.id, p]));

  /* ---------- browser storage (may be blocked: never required) ---------- */
  const ls = {
    get(k) {
      try {
        return JSON.parse(localStorage.getItem(k) || "null");
      } catch (e) {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* full or blocked */
      }
    },
  };

  /* ---------- database calls ---------- */
  function api(path, opts) {
    const o = opts || {};
    return fetch(SB.url + path, {
      method: o.method || "GET",
      body: o.body,
      headers: Object.assign({ apikey: SB.key, "Content-Type": "application/json" }, o.headers),
    }).then((r) =>
      r.text().then((text) => {
        const body = text ? JSON.parse(text) : null;
        if (!r.ok) throw new Error((body && body.message) || "HTTP " + r.status);
        return body;
      })
    );
  }
  // Calls a database function, as the signed-in shopper when there is one.
  async function rpc(name, args) {
    if (!live) throw new Error("offline");
    const t = session ? await token() : null;
    return api("/rest/v1/rpc/" + name, { method: "POST", body: JSON.stringify(args || {}), headers: t ? { Authorization: "Bearer " + t } : undefined });
  }

  /* ---------- shopper sign-in: Google / Apple through Supabase Auth ---------- */
  const AUTH = "wpg.auth";
  let session = live ? ls.get(AUTH) : null;
  let notice = ""; // "signedIn" just after coming back from Google / Apple, or an error message
  // Coming back from Google / Apple, the session arrives in the address hash.
  (function readRedirect() {
    const h = location.hash.replace(/^#/, "");
    if (!live || !/(^|&)(access_token|error)=/.test(h)) return;
    const q = new URLSearchParams(h);
    if (q.get("access_token")) {
      session = {
        access_token: q.get("access_token"),
        refresh_token: q.get("refresh_token"),
        expires_at: Number(q.get("expires_at")) || Math.floor(Date.now() / 1000) + Number(q.get("expires_in") || 3600),
      };
      ls.set(AUTH, session);
      notice = "signedIn";
    } else notice = q.get("error_description") || q.get("error");
    let back = "";
    try {
      back = sessionStorage.getItem("wpg.authBack") || "";
      sessionStorage.removeItem("wpg.authBack");
    } catch (e) {
      /* ignore */
    }
    history.replaceState(null, "", location.pathname + location.search + back);
  })();
  let refreshing = null;
  function token() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60 > Date.now() / 1000) return Promise.resolve(session.access_token);
    if (!refreshing) {
      refreshing = fetch(`${SB.url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SB.key, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      })
        .then((r) => r.json().then((d) => (r.ok && d.access_token ? d : Promise.reject(d))))
        .then(
          (d) => {
            session = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + d.expires_in };
            ls.set(AUTH, session);
            return session.access_token;
          },
          () => {
            session = null;
            ls.set(AUTH, null);
            ls.set("wpg.account", null);
            return null;
          }
        )
        .finally(() => (refreshing = null));
    }
    return refreshing;
  }
  // Name, email and photo from the sign-in token, until the account loads.
  function claims() {
    try {
      const b = session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(b + "===".slice((b.length + 3) % 4));
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    } catch (e) {
      return {};
    }
  }
  let providers = null;
  const auth = {
    signedIn: () => !!session,
    notice: () => notice,
    clearNotice: () => (notice = ""),
    user() {
      if (!session) return null;
      const a = ls.get("wpg.account");
      const c = claims();
      const m = c.user_metadata || {};
      return { name: (a && a.name) || m.full_name || m.name || "", email: (a && a.email) || c.email || "", avatar: (a && a.avatar) || m.avatar_url || m.picture || "" };
    },
    // Which sign-in methods are switched on in Supabase.
    providers: () => providers || (providers = api("/auth/v1/settings").then((s) => s.external || {}, () => ({}))),
    async signIn(provider) {
      const fail = (code) => Object.assign(new Error(code), { code });
      if (!live) throw fail("offline");
      // Google and Apple send people back to a web address, not a file on a computer.
      if (!/^https?:$/.test(location.protocol)) throw fail("file");
      const on = await auth.providers();
      if (!on[provider]) throw fail("disabled");
      try {
        sessionStorage.setItem("wpg.authBack", location.hash);
      } catch (e) {
        /* ignore */
      }
      location.href = `${SB.url}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(location.href.split("#")[0])}`;
    },
    signOut() {
      const t = session && session.access_token;
      session = null;
      ls.set(AUTH, null);
      ls.set("wpg.account", null);
      if (t) fetch(`${SB.url}/auth/v1/logout`, { method: "POST", headers: { apikey: SB.key, Authorization: "Bearer " + t } }).catch(() => {});
    },
    // The shopper's details and orders (creates their customer record on first sign-in).
    account: () =>
      rpc("my_account").then((a) => {
        ls.set("wpg.account", a);
        return a;
      }),
    save: (p) =>
      rpc("save_my_account", { p }).then((a) => {
        ls.set("wpg.account", a);
        return a;
      }),
  };

  const COLS = "id,cat,type,line,line_ar,size,family,gender,badge,color,color2,price,compare_at,prices,tagline,description,notes,images,cutout,photo_style,source";
  async function fetchProducts() {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const page = await api(`/rest/v1/products?select=${COLS}&order=sort.asc,id.asc&limit=1000&offset=${from}`);
      rows.push(...page);
      if (page.length < 1000) return rows;
    }
  }

  /* ---------- applying database rows to the store ---------- */
  // A row with no images of its own keeps the photos that ship with the site.
  // Campaign scenes ("scene") are full-frame shots; the original cut-out and
  // packshots stay available for staged spots and the product gallery.
  function fromRow(r) {
    const b = base.get(r.id);
    const own = Array.isArray(r.images) && r.images.length > 0;
    const scene = own && r.photo_style === "scene";
    const images = own ? r.images : (b && b.images) || [];
    return {
      id: r.id,
      cat: D.categories.some((c) => c.id === r.cat) ? r.cat : "body-care",
      type: r.type,
      line: r.line,
      lineAr: r.line_ar || undefined,
      size: r.size || "",
      price: Number(r.price),
      compareAt: r.compare_at != null && Number(r.compare_at) > Number(r.price) ? Number(r.compare_at) : undefined,
      prices: r.prices || undefined,
      family: D.families[r.family] ? r.family : undefined,
      gender: r.gender || undefined,
      badge: r.badge || undefined,
      color: r.color || (b && b.color) || "#F06FA8",
      color2: r.color2 || (b && b.color2) || "#FCE4EF",
      tagline: r.tagline && (r.tagline.en || r.tagline.ar) ? r.tagline : undefined,
      desc: r.description && (r.description.en || r.description.ar) ? r.description : undefined,
      notes: r.notes || {},
      image: images[0],
      images,
      cutout: r.cutout || (own && !scene ? "" : (b && b.cutout) || ""),
      scene,
      packshots: scene ? (b && b.images) || [] : [],
      remote: own ? [] : (b && b.remote) || [],
      source: r.source || undefined,
      typeName: T[r.type] || T.bodycare,
    };
  }
  function applyProducts(rows) {
    const list = rows && rows.length ? rows.map(fromRow) : bundled;
    D.products.splice(0, D.products.length, ...list);
  }
  function applySettings(s) {
    if (!s) return;
    if (s.pricing && isFinite(s.pricing.markupPct)) D.config.pricing.markupPct = Number(s.pricing.markupPct);
    const R = D.config.referral;
    if (s.referral) {
      if (isFinite(s.referral.friendDiscountPct)) R.friendDiscountPct = Number(s.referral.friendDiscountPct);
      (s.referral.tiers || []).forEach((x) => {
        const tier = R.tiers.find((y) => y.id === x.id);
        if (tier && isFinite(x.pct) && isFinite(x.minOrders)) Object.assign(tier, { pct: Number(x.pct), minOrders: Number(x.minOrders) });
      });
    }
    if (s.contact) ["whatsapp", "email", "instagram", "tiktok"].forEach((k) => s.contact[k] && (D.config[k] = String(s.contact[k])));
  }

  /* ---------- cache & refresh ---------- */
  const CACHE = "wpg.remote";
  let cached = live ? ls.get(CACHE) : null;
  if (cached && cached.url !== SB.url) cached = null;
  if (cached) {
    applySettings(cached.settings);
    applyProducts(cached.rows);
  }

  async function refresh() {
    const s = await rpc("store_state");
    applySettings(s.settings);
    if (cached && cached.version === s.version) {
      if (JSON.stringify(s.settings) !== JSON.stringify(cached.settings)) ls.set(CACHE, Object.assign(cached, { settings: s.settings }));
      return;
    }
    const count = parseInt(String(s.version), 10) || 0;
    const rows = count ? await fetchProducts() : [];
    applyProducts(rows);
    cached = { url: SB.url, version: s.version, settings: s.settings, rows };
    ls.set(CACHE, cached);
  }

  // The store renders straight away (from the cached copy, or the bundled
  // catalogue on a first visit) and checks the database behind the scenes;
  // listeners hear whether anything the shopper sees changed.
  const C = D.config;
  const sig = () => JSON.stringify([D.products, C.pricing, C.referral, C.whatsapp, C.email, C.instagram, C.tiktok]);
  const listeners = [];
  let pending = live;
  function boot() {
    if (!live) return;
    const before = sig();
    refresh()
      .catch(() => {})
      .then(() => {
        pending = false;
        const changed = sig() !== before;
        listeners.forEach((f) => f(changed));
      });
  }

  /* ---------- visitors ---------- */
  const uid = () =>
    window.crypto && crypto.randomUUID ? crypto.randomUUID() : "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  const consent = {
    get: () => ls.get("wpg.consent"), // "yes", "no" or null (not asked yet)
    set: (v) => ls.set("wpg.consent", v),
  };
  function visitor() {
    let v = ls.get("wpg.vid");
    if (!v) ls.set("wpg.vid", (v = uid()));
    return v;
  }
  function sessionId() {
    try {
      let s = sessionStorage.getItem("wpg.sid");
      if (!s) sessionStorage.setItem("wpg.sid", (s = uid()));
      return s;
    } catch (e) {
      return "nosession";
    }
  }
  // First-touch campaign: ?utm_source=instagram&utm_campaign=launch
  const qs = new URLSearchParams(location.search + "&" + (location.hash.split("?")[1] || ""));
  if (!ls.get("wpg.utm")) {
    const u = {};
    ["source", "medium", "campaign"].forEach((k) => qs.get("utm_" + k) && (u[k] = qs.get("utm_" + k).slice(0, 80)));
    if (Object.keys(u).length) ls.set("wpg.utm", u);
  }
  const utm = () => ls.get("wpg.utm") || undefined;
  const device = () => (/iPad|Tablet/i.test(navigator.userAgent) ? "tablet" : /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop");

  // Fields that link a form or order to this browser's visits (with consent).
  function context() {
    const ok = consent.get() === "yes";
    return { visitor: ok ? visitor() : undefined, utm: utm() };
  }

  let firstView = true;
  function trackPage(info) {
    if (!live || consent.get() !== "yes") return;
    let referrer = "";
    try {
      if (firstView && document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer;
    } catch (e) {
      /* ignore */
    }
    firstView = false;
    rpc("track_visit", {
      p: Object.assign(
        {
          visitor: visitor(),
          session: sessionId(),
          path: (location.protocol === "file:" ? "" : location.pathname) + location.search + location.hash,
          referrer,
          utm: utm(),
          device: device(),
          screen: `${screen.width}x${screen.height}`,
        },
        info
      ),
    }).catch(() => {});
  }

  return { live, rpc, boot, onChange: (f) => listeners.push(f), pending: () => pending, consent, context, trackPage, auth };
})();
