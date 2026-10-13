/* wepink Gulf — shared shell: language, country & currency, bag, header,
 * footer, drawers and dialogs. Page bodies live in pages.js.
 */
window.WP = (function () {
  const D = window.WP_DATA;
  const I = window.WP_I18N;
  const ART = window.WP_ART;
  const SYNC = window.WP_SYNC;

  /* ---------- storage (never required: private windows may block it) ---------- */
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem("wpg." + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem("wpg." + k, JSON.stringify(v));
      } catch (e) {
        /* ignore */
      }
    },
  };

  /* ---------- routing ----------
   * Normally each page is its own HTML file. The single-file build
   * (scripts/build-single.mjs) sets window.WP_SINGLE and routes with the
   * hash instead: shop.html?c=perfume becomes #/shop?c=perfume.
   */
  const SINGLE = !!window.WP_SINGLE;
  const PAGE_LINK = /^(index|shop|product|stores|about|help|checkout|earn)\.html(\?[^#]*)?(#.*)?$/;
  function route() {
    if (!SINGLE) return { page: document.body.dataset.page, params: new URLSearchParams(location.search) };
    const m = location.hash.match(/^#\/([a-z]+)(?:\?([^#]*))?/);
    const page = m && window.WP_PAGES && window.WP_PAGES[m[1]] ? m[1] : "home";
    return { page, params: new URLSearchParams(m && m[2] ? m[2] : "") };
  }
  /* The pink line that runs across the top while the next page loads. A
   * normal page link starts it and the next page finishes it; in the
   * single-file build the route change does both. */
  const loader = {
    el: null,
    began: 0,
    mount() {
      if (this.el) return;
      this.el = document.createElement("div");
      this.el.className = "nav-line";
      this.el.setAttribute("aria-hidden", "true");
      document.body.appendChild(this.el);
      let arriving = false;
      try {
        arriving = sessionStorage.getItem("wpg.nav") === "1";
        sessionStorage.removeItem("wpg.nav");
      } catch (e) {
        /* ignore */
      }
      if (arriving) {
        this.el.style.transform = "scaleX(0.7)";
        this.el.style.opacity = "1";
        requestAnimationFrame(() => this.finish());
      }
    },
    start() {
      const el = this.el;
      if (!el) return;
      clearTimeout(this.timer);
      el.className = "nav-line";
      el.removeAttribute("style");
      void el.offsetWidth; // restart the run
      el.classList.add("is-running");
      this.began = performance.now();
    },
    finish() {
      const el = this.el;
      if (!el) return;
      const wait = Math.max(0, 320 - (performance.now() - this.began));
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        el.style.transform = getComputedStyle(el).transform;
        el.style.opacity = "1";
        el.classList.remove("is-running");
        void el.offsetWidth;
        el.classList.add("is-done");
        el.removeAttribute("style");
        this.timer = setTimeout(() => (el.className = "nav-line"), 800);
      }, wait);
    },
  };

  let pendingAnchor = "";
  function navigate(href) {
    loader.start();
    const m = href.match(PAGE_LINK);
    const page = m[1] === "index" ? "home" : m[1];
    pendingAnchor = m[3] ? m[3].slice(1) : "";
    const next = "#/" + page + (m[2] || "");
    if (location.hash === next) afterNavigate();
    else location.hash = next;
  }
  function afterNavigate() {
    closeAll(true);
    render();
    SYNC.trackPage(pageInfo());
    const target = pendingAnchor && document.getElementById(pendingAnchor);
    pendingAnchor = "";
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    loader.finish();
  }

  /* ---------- state ---------- */
  const params = route().params;
  const browserAr = (navigator.language || "").toLowerCase().startsWith("ar");
  const state = {
    lang: ["en", "ar"].includes(params.get("lang")) ? params.get("lang") : store.get("lang", browserAr ? "ar" : "en"),
    country: D.countries[params.get("country")] ? params.get("country") : store.get("country", "AE"),
    cart: store.get("cart", []).filter((i) => i && typeof i.id === "string" && i.qty > 0),
  };
  if (!D.countries[state.country]) state.country = "AE";

  /* ---------- referral codes ----------
   * A link with ?ref=CODE saves the friend's code; checkout applies it.
   * With the database connected, only active ambassadors' codes are accepted;
   * without it (or offline), any well-formed code is.
   */
  const ref = {
    clean(code) {
      const c = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      return c.length >= 4 && c.length <= 16 ? c : "";
    },
    get() {
      return store.get("ref", "");
    },
    set(code) {
      const c = ref.clean(code);
      if (c) store.set("ref", c);
      return c;
    },
    clear() {
      store.set("ref", "");
    },
    pct() {
      return D.config.referral.friendDiscountPct;
    },
    // Resolves to the clean code when it can be used, or "".
    check(code) {
      const c = ref.clean(code);
      if (!c || !SYNC.live) return Promise.resolve(c);
      return SYNC.rpc("check_ref", { p_code: c }).then((ok) => (ok ? c : ""), () => c);
    },
  };
  const incomingRef = ref.clean(params.get("ref"));

  /* ---------- the Club welcome offer ----------
   * Joining the wepink Club (pop-up, assistant or quiz) unlocks
   * config.welcome.pct % off the first order, with config.welcome.code at
   * checkout. State in this browser: "" (not unlocked), "ready", "saved"
   * (taken off at checkout, can be typed back) or "used". */
  const welcome = {
    pct: () => Number((D.config.welcome || {}).pct) || 0,
    code: () => String((D.config.welcome || {}).code || "WELCOME10").toUpperCase(),
    state: () => store.get("welcome", ""),
    ready: () => welcome.pct() > 0 && welcome.state() === "ready",
    unlock() {
      if (welcome.state() !== "used") store.set("welcome", "ready");
      renderBagDrawer();
    },
    set: (v) => store.set("welcome", v),
  };

  /* ---------- helpers ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function t(key, vars) {
    let s = (I[state.lang] && I[state.lang][key]) || I.en[key] || key;
    if (vars) Object.keys(vars).forEach((k) => (s = s.split("{" + k + "}").join(vars[k])));
    return s;
  }
  // Bilingual value: { en, ar } object or [en, ar] pair.
  function L(v) {
    if (v == null) return "";
    if (Array.isArray(v)) return state.lang === "ar" ? v[1] || v[0] : v[0];
    if (typeof v === "object") return v[state.lang] || v.en;
    return v;
  }

  const country = () => D.countries[state.country];
  const FRAGRANCE = new Set(["colonia", "splash", "cream", "lotion", "hairmist", "bodyoil", "scrub", "butter", "shower", "soap", "rollon"]);
  // Display name: fragrance names stay in Latin script; other products have an Arabic name.
  const pname = (p) => (state.lang === "ar" && p.lineAr ? p.lineAr : p.line);
  const fullName = (p) => (FRAGRANCE.has(p.type) ? `${pname(p)} ${L(p.typeName)}` : pname(p));
  // Orders keep the English name, so the team's records read the same whatever the shopper's language.
  const recordName = (p) => (FRAGRANCE.has(p.type) ? `${p.line} ${p.typeName.en}` : p.line);
  const product = (id) => D.products.find((p) => p.id === id);

  // Store-wide price increase (config.pricing, set in the admin panel).
  const markup = () => 1 + (Number(D.config.pricing && D.config.pricing.markupPct) || 0) / 100;
  // Local price for an AED amount (or a product's own exact local price).
  function local(aed, p) {
    const c = country();
    if (p && p.prices && p.prices[c.currency] != null) return p.prices[c.currency];
    const v = aed * c.rate;
    return c.decimals ? Math.round(v * 4) / 4 : Math.round(v);
  }
  function money(amount) {
    const c = country();
    const n = Number(amount).toLocaleString("en-US", { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals });
    return state.lang === "ar" ? `${n} ${c.symbol.ar}` : `${c.symbol.en} ${n}`;
  }
  const priceOf = (p) => local(p.price * markup(), p);
  const wasOf = (p) => local(p.compareAt * markup());
  const moneyAED = (aed) => money(local(aed));

  /* ---------- bag ---------- */
  /* ---------- the ritual set: moisturise, splash, seal ----------
   * A body cream (or lotion / butter), a body splash and an eau de cologne in
   * the bag make a ritual set, each set config.ritual.pct % off. Sets are
   * made from the lowest-priced pieces of each kind, whatever the scent. */
  const STEPS = [
    ["moisturise", ["cream", "lotion", "butter"]],
    ["splash", ["splash"]],
    ["seal", ["colonia"]],
  ];
  const ritual = {
    pct: () => Number((D.config.ritual || {}).pct) || 0,
    step: (p) => (STEPS.find(([, types]) => types.includes(p.type)) || [""])[0],
    of(items) {
      const pct = ritual.pct();
      const units = { moisturise: [], splash: [], seal: [] };
      items.forEach((i) => {
        const st = ritual.step(i.p);
        if (st) for (let k = 0; k < i.qty; k++) units[st].push(priceOf(i.p));
      });
      Object.values(units).forEach((u) => u.sort((a, b) => a - b));
      const sets = pct ? Math.min(units.moisturise.length, units.splash.length, units.seal.length) : 0;
      let base = 0;
      for (let k = 0; k < sets; k++) base += units.moisturise[k] + units.splash[k] + units.seal[k];
      const raw = (base * pct) / 100;
      const amount = country().decimals ? Math.round(raw * 1000) / 1000 : Math.round(raw);
      const missing = Object.keys(units).filter((k) => !units[k].length);
      return { pct, sets, amount, missing };
    },
  };

  const bag = {
    ritual() {
      return ritual.of(bag.items());
    },
    items() {
      return state.cart.map((i) => ({ ...i, p: product(i.id) })).filter((i) => i.p);
    },
    count() {
      return bag.items().reduce((n, i) => n + i.qty, 0);
    },
    subtotal() {
      return bag.items().reduce((s, i) => s + priceOf(i.p) * i.qty, 0);
    },
    delivery() {
      const sub = bag.subtotal();
      if (!sub) return 0;
      return sub >= country().freeOver ? 0 : country().fee;
    },
    add(id, qty) {
      const line = state.cart.find((i) => i.id === id);
      if (line) line.qty = Math.min(line.qty + (qty || 1), 20);
      else state.cart.push({ id, qty: qty || 1 });
      bag.save();
    },
    setQty(id, qty) {
      const line = state.cart.find((i) => i.id === id);
      if (!line) return;
      if (qty <= 0) state.cart = state.cart.filter((i) => i.id !== id);
      else line.qty = Math.min(qty, 20);
      bag.save();
    },
    clear() {
      state.cart = [];
      bag.save();
    },
    save() {
      store.set("cart", state.cart);
      document.querySelectorAll("[data-bag-count]").forEach((el) => {
        const n = bag.count();
        el.textContent = n;
        el.hidden = n === 0;
      });
      renderBagDrawer();
      document.dispatchEvent(new CustomEvent("wp:bag"));
    },
  };

  /* ---------- icons ---------- */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    bag: '<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
    truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4l3 3.2v3.8h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    split: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    returns: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>',
    gift: '<rect x="3" y="8" width="18" height="4.5" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8v12"/><path d="M12 8C10.7 5 7 4.6 7 6.6S10.4 8 12 8Zm0 0c1.3-3 5-3.4 5-1.4S13.6 8 12 8Z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.5"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chat: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.4a8.4 8.4 0 1 1 15.5-4.5Z"/><path d="M9 9.2c0 3 2.6 5.6 5.6 5.6l1.3-1.6-2-1-1 .8a4 4 0 0 1-2.3-2.3l.8-1-1-2L9 9.2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
    tiktok: '<path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14 3.5c.4 2.7 2.4 4.6 5 4.8"/>',
    sparkle: '<path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z"/>',
    shield: '<path d="M12 3 19.5 6v5.6c0 4.4-3.1 8.2-7.5 9.4-4.4-1.2-7.5-5-7.5-9.4V6L12 3Z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19 13 11"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>',
    moon: '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2M12 19.2v2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M2.8 12h2M19.2 12h2M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>',
  };
  function icon(name, cls) {
    return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ""}</svg>`;
  }

  /* ---------- black / white ----------
   * The page head sets data-tone before first paint (saved choice, else the
   * device's dark/light setting); this keeps the buttons and the choice in step. */
  const tone = {
    get: () => (document.documentElement.dataset.tone === "noir" ? "noir" : "blanc"),
    set(v) {
      const html = document.documentElement;
      html.classList.add("tone-shift");
      html.dataset.tone = v;
      store.set("tone", v);
      document.querySelectorAll("[data-tone-toggle]").forEach((b) => (b.outerHTML = toneButton(b.dataset.cls, b.hasAttribute("data-labelled"))));
      clearTimeout(tone.timer);
      tone.timer = setTimeout(() => html.classList.remove("tone-shift"), 500);
    },
  };
  function toneButton(cls, labelled) {
    const noir = tone.get() === "noir";
    const label = t(noir ? "nav.toWhite" : "nav.toBlack");
    return `<button class="${cls}" type="button" data-tone-toggle data-cls="${cls}"${labelled ? " data-labelled" : ""} aria-label="${esc(label)}" title="${esc(label)}">${icon(noir ? "sun" : "moon")}${labelled ? `<span>${esc(t(noir ? "nav.white" : "nav.black"))}</span>` : ""}</button>`;
  }

  /* ---------- product UI ---------- */
  function sizeText(p) {
    const s = L(p.size);
    return state.lang === "ar" && typeof p.size === "string" ? s.replace(/ ml$/, " مل").replace(/ g$/, " غ") : s;
  }
  function badge(p) {
    if (p.compareAt) {
      const pct = Math.round((1 - p.price / p.compareAt) * 100);
      return `<span class="badge badge-save">${esc(t("badge.save", { pct }))}</span>`;
    }
    if (!p.badge) return "";
    return `<span class="badge badge-${p.badge}">${esc(t("badge." + p.badge))}</span>`;
  }
  // A campaign shot that can't load falls back to the product's cut-out (see art.js).
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (!img || img.tagName !== "IMG") return;
      // a gallery thumbnail that can't load (e.g. a blocked remote photo) leaves the row
      const thumb = !img.dataset.fb && img.closest(".pdp-thumb");
      if (thumb) return thumb.remove();
      if (!img.dataset.fb) return;
      const fb = img.dataset.fb;
      delete img.dataset.fb;
      img.className = img.className.replace("scene", "cut");
      img.src = fb;
    },
    true
  );

  function media(p, cls, alt) {
    const second = alt && p.scene && p.images && p.images[1];
    return `<div class="media ${cls || ""}" style="--c:${p.color};--c2:${p.color2}">${ART.art(p)}${second ? `<img class="scene alt" ${pics.attrs(second, true)} alt="" decoding="async">` : ""}</div>`;
  }

  /* Second campaign photos. Cards load theirs the first time the pointer is
   * over them. The single-file preview can't hold one file per photo, so
   * there they come in packs (assets/products/hero2/index.json names the pack
   * for each product); if a pack is missing the plain file is used. */
  const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  const pics = {
    pattern: /^assets\/products\/hero\/(.+)-2\.webp$/,
    index: null,
    packs: {},
    // attributes for an <img>: `later` waits for hydrate() (hover)
    attrs(src, later) {
      const id = SINGLE && (this.pattern.exec(src || "") || [])[1];
      const ready = id ? this.cached(id) : later ? "" : src;
      return ready ? `src="${esc(ready)}"` : `src="${BLANK}" data-pic="${esc(src)}"`;
    },
    cached(id) {
      const name = this.index && this.index.data && this.index.data[id];
      const pack = name && this.packs[name];
      return (pack && pack.data && pack.data[id]) || "";
    },
    get(url, slot) {
      if (!slot.promise) slot.promise = fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))).then((d) => (slot.data = d), () => (slot.data = {}));
      return slot.promise;
    },
    resolve(src) {
      const id = SINGLE && (this.pattern.exec(src) || [])[1];
      if (!id) return Promise.resolve(src);
      this.index = this.index || {};
      return this.get("assets/products/hero2/index.json", this.index).then(() => {
        const name = this.index.data[id];
        if (!name) return src;
        this.packs[name] = this.packs[name] || {};
        return this.get(`assets/products/hero2/${name}.json`, this.packs[name]).then(() => this.packs[name].data[id] || src);
      });
    },
    hydrate(root) {
      (root || document).querySelectorAll("img[data-pic]").forEach((img) => {
        const src = img.getAttribute("data-pic");
        img.removeAttribute("data-pic");
        this.resolve(src).then((real) => (img.src = real));
      });
    },
  };
  // the second photo fades in only once it has really loaded
  document.addEventListener(
    "load",
    (e) => {
      const img = e.target;
      if (img.tagName === "IMG" && img.classList.contains("alt") && !img.hasAttribute("data-pic") && img.getAttribute("src") !== BLANK) img.classList.add("is-ready");
    },
    true
  );
  document.addEventListener("pointerover", (e) => {
    const c = e.pointerType === "mouse" && e.target.closest && e.target.closest(".card");
    if (c) pics.hydrate(c);
  });
  function priceHTML(p) {
    return `<span class="price">${esc(money(priceOf(p)))}</span>${p.compareAt ? `<s class="price-was">${esc(money(wasOf(p)))}</s>` : ""}`;
  }
  function card(p) {
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="card">
      <a class="card-media" href="${url}" tabindex="-1" aria-hidden="true">${badge(p)}${media(p, "", true)}</a>
      <div class="card-body">
        <p class="card-type">${esc(L(p.typeName))}</p>
        <h3 class="card-title"><a href="${url}">${esc(pname(p))}</a></h3>
        <p class="card-size">${esc(sizeText(p))}</p>
        <div class="card-foot">
          <div class="card-price">${priceHTML(p)}</div>
          <button class="btn-add" type="button" data-add="${esc(p.id)}" aria-label="${esc(t("card.addLabel", { name: fullName(p) }))}">${icon("plus")}<span>${esc(t("card.add"))}</span></button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- header & footer ---------- */
  function navLinks() {
    const cats = ["perfume", "body-splash", "men", "gift-sets"].map((id) => D.categories.find((c) => c.id === id));
    return [
      { href: "shop.html", label: t("nav.shop"), key: "shop" },
      ...cats.map((c) => ({ href: `shop.html?c=${c.id}`, label: L(c.name), key: "cat:" + c.id })),
      { href: "earn.html", label: t("nav.earn"), key: "earn", hot: true },
    ];
  }
  function isActive(key) {
    const { page, params } = route();
    if (key === "stores" || key === "earn") return page === key;
    if (key === "shop") return page === "shop" && !params.get("c");
    if (key.startsWith("cat:")) return page === "shop" && params.get("c") === key.slice(4);
    return false;
  }

  /* ---------- seasons: Ramadan, Eid, National Day, White Friday ----------
   * Switched on in the admin panel. The single-file preview can also try
   * each one from a switch in its footer (kept for the browser session). */
  function season() {
    let id = (D.config.season || {}).id || "";
    if (SINGLE) {
      try {
        const pv = sessionStorage.getItem("wpg.seasonPreview");
        if (pv !== null) id = pv;
      } catch (e) {
        /* ignore */
      }
    }
    const s = D.seasons && D.seasons[id];
    if (!s) return null;
    const n = (D.national || {})[state.country] || { name: country().short, flag: ["#e6007e", "#ffffff", "#e6007e"] };
    const vars = { country: L(n.name), amount: money(country().freeOver) };
    const fill = (x) => String(x || "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    const own = D.config.season || {};
    const custom = own.id === id && own.announce ? L(own.announce) : "";
    return { id, motif: s.motif, name: L(s.name), greeting: fill(L(s.greeting)), announce: fill(custom || L(s.announce)), threads: s.threads === "flag" ? n.flag[0] : s.threads, flag: n.flag };
  }
  function seasonDeco() {
    const sz = season();
    if (!sz) return "";
    const gold = `<defs><linearGradient id="sz-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbeec4"/><stop offset=".5" stop-color="#d4a85a"/><stop offset="1" stop-color="#8f6220"/></linearGradient><mask id="sz-moon"><rect width="220" height="260" fill="#fff"/><circle cx="86" cy="118" r="31" fill="#000"/></mask></defs>`;
    const star = (x, y, r, cls) => `<path class="tw ${cls || ""}" d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z"/>`;
    const lantern = (x, len, k) => `<g class="sway s${k}"><line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="url(#sz-gold)" stroke-width="1.4"/><path d="M${x - 9} ${len}h18l-3 7h-12z" fill="url(#sz-gold)"/><circle cx="${x}" cy="${len + 24}" r="14" fill="rgba(255,206,130,.35)"/><rect x="${x - 11}" y="${len + 7}" width="22" height="32" rx="7" fill="rgba(255,214,150,.18)" stroke="url(#sz-gold)" stroke-width="2"/><path d="M${x} ${len + 39}v9" stroke="url(#sz-gold)" stroke-width="2"/></g>`;
    let art = "";
    if (sz.motif === "crescent") {
      art = `${gold}<g class="sway s1"><line x1="70" y1="0" x2="70" y2="92" stroke="url(#sz-gold)" stroke-width="1.4"/><circle cx="70" cy="128" r="36" fill="url(#sz-gold)" mask="url(#sz-moon)"/><g fill="url(#sz-gold)">${star(104, 104, 7)}</g></g>${lantern(150, 46, 2)}${lantern(196, 92, 3)}`;
    } else if (sz.motif === "stars" || sz.motif === "sparkle") {
      const fill = sz.motif === "stars" ? "url(#sz-gold)" : "#ffffff";
      art = `${gold}<g fill="${fill}">${star(60, 60, 22)}${star(140, 40, 12, "d1")}${star(176, 110, 18, "d2")}${star(96, 150, 10, "d3")}${star(30, 140, 8, "d1")}${star(196, 190, 9, "d3")}</g>`;
    } else if (sz.motif === "flag") {
      const [a, b, c] = sz.flag;
      art = `<g class="flutter">${[a, b, c].map((col, i) => `<path d="M0 ${40 + i * 14}C55 ${10 + i * 14} 110 ${70 + i * 14} 220 ${30 + i * 14}" fill="none" stroke="${col}" stroke-width="13" stroke-linecap="round"/>`).join("")}</g><g fill="#ffffff">${star(186, 120, 9, "d2")}${star(40, 130, 6, "d1")}</g>`;
    }
    return `<svg class="season-deco deco-${sz.motif}" viewBox="0 0 220 260" aria-hidden="true" focusable="false">${art}</svg>`;
  }

  function renderHeader() {
    const c = country();
    const maxPct = Math.max(...D.config.referral.tiers.map((x) => x.pct));
    const sz = season();
    const msgs = [...(sz ? [sz.announce] : []), t("announce.1", { amount: money(country().freeOver) }), ...(welcome.pct() ? [t("announce.welcome", { pct: welcome.pct() })] : []), t("announce.4", { pct: ref.pct(), max: maxPct }), t("announce.2"), t("announce.3")];
    const links = navLinks();
    document.getElementById("app-header").innerHTML = `
      <a class="skip-link" href="#main">${esc(t("nav.skip"))}</a>
      <div class="announce" role="region" aria-label="Announcements">
        <div class="announce-inner">${msgs.map((m, i) => `<p class="announce-msg${i === 0 ? " is-on" : ""}">${esc(m)}</p>`).join("")}</div>
      </div>
      <header class="site-header">
        <div class="container header-row">
          <div class="header-start">
            <button class="icon-btn menu-btn" type="button" data-open="menu" aria-label="${esc(t("nav.menu"))}">${icon("menu")}</button>
            <button class="icon-btn search-start" type="button" data-open="search" aria-label="${esc(t("nav.search"))}">${icon("search")}</button>
            <nav class="nav-primary" aria-label="Primary">
              ${links.map((l) => `<a href="${l.href}"${l.hot ? ' class="nav-hot"' : ""}${isActive(l.key) ? ' aria-current="page"' : ""}>${l.hot ? icon("sparkle") : ""}${esc(l.label)}</a>`).join("")}
            </nav>
          </div>
          <a class="logo" href="index.html" aria-label="wepink ${esc(L(D.config.region))}">
            <img class="logo-pink" src="assets/brand/logo.svg" alt="wepink" width="132" height="38">
            <img class="logo-light" src="assets/brand/logo-white.svg" alt="" width="132" height="38">
            <span class="logo-region">${esc(L(D.config.region))}</span>
          </a>
          <div class="header-end">
            <button class="chip-btn region-btn" type="button" data-open="region" aria-label="${esc(t("nav.region"))}: ${esc(L(c.name))}">
              ${icon("globe")}<span class="rb-code">${esc(L(c.short))}</span><span class="rb-cur">${esc(c.symbol[state.lang])}</span>
            </button>
            <button class="chip-btn lang-btn" type="button" data-lang-toggle lang="${state.lang === "ar" ? "en" : "ar"}" aria-label="${esc(t("nav.languageLabel"))}"><span class="lang-full">${esc(t("nav.language"))}</span><span class="lang-short" aria-hidden="true">${state.lang === "ar" ? "EN" : "ع"}</span></button>
            ${toneButton("icon-btn tone-btn")}
            <button class="icon-btn search-end" type="button" data-open="search" aria-label="${esc(t("nav.search"))}">${icon("search")}</button>
            ${SYNC.live ? accountButton() : ""}
            <button class="icon-btn bag-btn" type="button" data-open="bag" aria-label="${esc(t("nav.bag"))}">
              ${icon("bag")}<span class="bag-count" data-bag-count ${bag.count() ? "" : "hidden"}>${bag.count()}</span>
            </button>
          </div>
        </div>
      </header>`;
  }

  function payBadges(list) {
    const label = { card: "VISA · Mastercard", mada: "mada", knet: "KNET", benefit: "BenefitPay", applepay: "Apple Pay", tabby: "tabby", tamara: "Tamara", cod: state.lang === "ar" ? "الدفع عند الاستلام" : "Cash on delivery" };
    return list.map((k) => `<li class="pay-badge pay-${k}">${esc(label[k])}</li>`).join("");
  }

  function renderFooter() {
    const c = country();
    const year = new Date().getFullYear();
    document.getElementById("app-footer").innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <img src="assets/brand/logo-white.svg" alt="wepink" width="150" height="43">
              <p class="footer-tag">${esc(t("meta.tagline"))}</p>
              <p class="footer-franchise">${icon("shield")}<span>${esc(t("footer.franchise"))}</span></p>
              <div class="footer-social">
                <a class="icon-btn icon-btn-light" href="${D.config.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("insta")}</a>
                <a class="icon-btn icon-btn-light" href="${D.config.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon("tiktok")}</a>
                <a class="icon-btn icon-btn-light" href="https://wa.me/${D.config.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon("chat")}</a>
              </div>
            </div>
            <nav class="footer-col" aria-label="${esc(t("footer.shop"))}">
              <h2>${esc(t("footer.shop"))}</h2>
              <a href="shop.html">${esc(t("nav.shop"))}</a>
              ${D.categories.map((cat) => `<a href="shop.html?c=${cat.id}">${esc(L(cat.name))}</a>`).join("")}
            </nav>
            <nav class="footer-col" aria-label="${esc(t("footer.help"))}">
              <h2>${esc(t("footer.help"))}</h2>
              <a href="help.html#faq">${esc(t("footer.faq"))}</a>
              <a href="help.html#faq">${esc(t("footer.delivery"))}</a>
              <a href="help.html#faq">${esc(t("footer.returns"))}</a>
              <a href="help.html">${esc(t("footer.contact"))}</a>
            </nav>
            <nav class="footer-col" aria-label="${esc(t("footer.company"))}">
              <h2>${esc(t("footer.company"))}</h2>
              <a href="about.html">${esc(t("footer.about"))}</a>
              <a href="earn.html">${esc(t("footer.earn"))}</a>
              <a href="stores.html">${esc(t("footer.storesLink"))}</a>
              <button class="footer-club" type="button" data-open="club">${icon("sparkle")}<span>${esc(welcome.pct() ? t("club.footerOffer", { pct: welcome.pct() }) : t("club.footer"))}</span></button>
              <button class="footer-region" type="button" data-open="region">${icon("globe")}<span>${esc(L(c.name))} · ${esc(c.currency)}</span></button>
            </nav>
          </div>
          <div class="footer-pay">
            <span>${esc(t("footer.weAccept"))}</span>
            <ul>${payBadges(c.pay)}</ul>
          </div>
          <div class="footer-bottom">
            <p>${esc(t("footer.rights", { year }))}</p>
            <p><a href="help.html#privacy">${esc(t("footer.privacy"))}</a> · <a href="help.html#faq">${esc(t("footer.terms"))}</a>${SYNC.live ? ` · <button class="link-btn footer-cookies" type="button" data-cookies>${esc(t("consent.settings"))}</button>` : ""}</p>
          </div>
          ${
            SINGLE
              ? `<div class="season-preview" role="group" aria-label="${esc(t("season.preview"))}"><span>${esc(t("season.preview"))}</span>${["", ...Object.keys(D.seasons || {})]
                  .map((id) => `<button type="button" class="pill" data-season-preview="${id}" aria-pressed="${(season() || { id: "" }).id === id}">${esc(id ? L(D.seasons[id].name) : t("season.none"))}</button>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </footer>`;
  }

  /* ---------- layers (drawers & dialogs) ---------- */
  let lastFocus = null;
  function layersRoot() {
    let root = document.getElementById("app-layers");
    if (!root) {
      root = document.createElement("div");
      root.id = "app-layers";
      document.body.appendChild(root);
    }
    return root;
  }

  function renderLayers() {
    const c = country();
    const links = navLinks();
    layersRoot().innerHTML = `
      <div class="backdrop" data-close hidden></div>

      <aside class="layer drawer drawer-end" id="layer-bag" role="dialog" aria-modal="true" aria-labelledby="bag-title" hidden>
        <div class="layer-head">
          <h2 id="bag-title">${esc(t("bag.title"))}</h2>
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div class="bag-body" id="bag-body"></div>
      </aside>

      <aside class="layer drawer drawer-start" id="layer-menu" role="dialog" aria-modal="true" aria-label="${esc(t("nav.menu"))}" hidden>
        <div class="layer-head">
          <img src="assets/brand/logo.svg" alt="wepink" width="110" height="32">
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <nav class="menu-links" aria-label="Mobile">
          ${links.map((l) => `<a href="${l.href}">${esc(l.label)}${icon("arrow", "flip")}</a>`).join("")}
          ${["body-care", "hair", "makeup", "skincare"].map((id) => `<a href="shop.html?c=${id}">${esc(L(D.categories.find((x) => x.id === id).name))}${icon("arrow", "flip")}</a>`).join("")}
          <a href="stores.html">${esc(t("nav.stores"))}${icon("arrow", "flip")}</a>
          <a href="about.html">${esc(t("nav.about"))}${icon("arrow", "flip")}</a>
          <a href="help.html">${esc(t("nav.help"))}${icon("arrow", "flip")}</a>
          ${SYNC.live ? `<button type="button" class="menu-account" data-open="account">${icon("user")}<span>${esc(SYNC.auth.signedIn() ? t("acct.my") : t("acct.signIn"))}</span>${icon("arrow", "flip")}</button>` : ""}
        </nav>
        <div class="menu-foot">
          <button class="chip-btn" type="button" data-open="region">${icon("globe")}<span>${esc(L(c.name))} · ${esc(c.currency)}</span></button>
          <button class="chip-btn" type="button" data-lang-toggle lang="${state.lang === "ar" ? "en" : "ar"}">${esc(t("nav.language"))}</button>
          ${toneButton("chip-btn", true)}
        </div>
      </aside>

      <div class="layer modal modal-search" id="layer-search" role="dialog" aria-modal="true" aria-label="${esc(t("search.label"))}" hidden>
        <div class="search-bar">
          ${icon("search")}
          <input id="search-input" type="search" autocomplete="off" placeholder="${esc(t("search.placeholder"))}" aria-label="${esc(t("search.label"))}">
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div class="search-results" id="search-results" aria-live="polite"></div>
      </div>

      <div class="layer modal modal-center" id="layer-region" role="dialog" aria-modal="true" aria-labelledby="region-title" hidden>
        <div class="layer-head">
          <div>
            <h2 id="region-title">${esc(t("region.title"))}</h2>
            <p class="muted">${esc(t("region.lead"))}</p>
          </div>
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div class="region-list" role="radiogroup" aria-labelledby="region-title">
          ${Object.keys(D.countries)
            .map((code) => {
              const k = D.countries[code];
              const on = code === state.country;
              return `<button type="button" class="region-opt${on ? " is-on" : ""}" role="radio" aria-checked="${on}" data-country="${code}">
                <span class="region-code">${code}</span>
                <span class="region-name">${esc(L(k.name))}</span>
                <span class="region-cur">${esc(k.currency)}</span>
                ${on ? icon("check") : ""}
              </button>`;
            })
            .join("")}
        </div>
      </div>

      <div class="layer modal modal-center modal-quiz" id="layer-quiz" role="dialog" aria-modal="true" aria-labelledby="quiz-title" hidden>
        <div class="layer-head">
          <h2 id="quiz-title">${esc(t("quiz.title"))}</h2>
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div id="quiz-body"></div>
      </div>

      <div class="layer modal modal-center modal-ritual" id="layer-ritual" role="dialog" aria-modal="true" aria-labelledby="ritual-title" hidden>
        <div class="layer-head">
          <div><p class="eyebrow">${esc(t("rit.eyebrow"))}</p><h2 id="ritual-title">${esc(t("rit.title"))}</h2></div>
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div id="ritual-body"></div>
      </div>

      <div class="layer modal modal-center modal-account" id="layer-account" role="dialog" aria-modal="true" aria-labelledby="acct-title" hidden>
        <div class="layer-head">
          <div>
            <p class="eyebrow">wepink ${esc(L(D.config.region))}</p>
            <h2 id="acct-title">${esc(t("acct.title"))}</h2>
          </div>
          <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
        </div>
        <div class="acct-body" id="acct-body"></div>
      </div>

      <div class="layer modal modal-center modal-club" id="layer-club" role="dialog" aria-modal="true" aria-labelledby="club-title" hidden>
        <div class="club-art" aria-hidden="true">
          ${D.config.photos.club || D.config.photos.virginiaPortrait ? `<img class="club-photo" src="${esc(D.config.photos.club || D.config.photos.virginiaPortrait)}" alt="" loading="lazy">` : ""}
          <img src="assets/brand/logo-white.svg" alt="" width="120" height="35">
          <span class="club-glow"></span>
          ${welcome.pct() ? `<p class="club-offer"><strong>${esc(t("club.offerBadge", { pct: welcome.pct() }))}</strong><span>${esc(t("club.offerSub"))}</span></p>` : ""}
          <ul class="club-perks">
            <li>${icon("sparkle")}<span>${esc(t("club.perk1"))}</span></li>
            <li>${icon("gift")}<span>${esc(welcome.pct() ? t("club.perkOffer", { pct: welcome.pct() }) : t("club.perk2"))}</span></li>
            <li>${icon("heart")}<span>${esc(t("club.perk3"))}</span></li>
          </ul>
        </div>
        <div class="club-main">
          <div class="layer-head">
            <div>
              <p class="eyebrow">${esc(t("club.eyebrow"))}</p>
              <h2 id="club-title">${esc(welcome.pct() ? t("club.titleOffer", { pct: welcome.pct() }) : t("club.title"))}</h2>
              <p class="muted">${esc(welcome.pct() ? t("club.leadOffer", { pct: welcome.pct() }) : t("club.lead"))}</p>
            </div>
            <button class="icon-btn" type="button" data-close aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
          </div>
          <div class="club-body" id="club-body">${clubBody()}</div>
        </div>
      </div>

      <div class="toasts" id="toasts" role="status" aria-live="polite"></div>
      ${consentBanner()}`;
    renderBagDrawer();
    renderSearch("");
  }

  /* ---------- shopper accounts: Google / Apple sign-in ---------- */
  const LOGO = {
    google:
      '<svg class="brand-ic" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
    apple:
      '<svg class="brand-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
  };
  const initial = (u) => esc(((u && (u.name || u.email)) || "?").trim().charAt(0).toUpperCase());
  function avatar(u, cls) {
    return u && u.avatar ? `<img class="${cls}" src="${esc(u.avatar)}" alt="" referrerpolicy="no-referrer">` : `<span class="${cls} avatar-initial" aria-hidden="true">${initial(u)}</span>`;
  }
  function accountButton() {
    const u = SYNC.auth.user();
    return `<button class="icon-btn account-btn${u ? " is-in" : ""}" type="button" data-open="account" aria-label="${esc(u ? t("acct.my") : t("acct.signIn"))}">${u ? avatar(u, "avatar") : icon("user")}</button>`;
  }
  function birthdayFields(value, id) {
    const [m, d] = String(value || "").split("-");
    const months = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 1).toLocaleString(state.lang === "ar" ? "ar-AE" : "en-GB", { month: "long" }));
    return `<div class="field"><span class="label" id="${id}">${esc(t("club.birthday"))} <span class="optional">${esc(t("club.optional"))}</span></span>
        <div class="field-row" role="group" aria-labelledby="${id}">
          <label class="select select-block"><select name="bday" aria-label="${esc(t("club.day"))}"><option value="">${esc(t("club.day"))}</option>${Array.from({ length: 31 }, (_, i) => `<option${+d === i + 1 ? " selected" : ""}>${i + 1}</option>`).join("")}</select>${icon("chevron")}</label>
          <label class="select select-block"><select name="bmonth" aria-label="${esc(t("club.month"))}"><option value="">${esc(t("club.month"))}</option>${months.map((name, i) => `<option value="${i + 1}"${+m === i + 1 ? " selected" : ""}>${esc(name)}</option>`).join("")}</select>${icon("chevron")}</label>
        </div>
      </div>`;
  }
  const pad2 = (n) => String(n).padStart(2, "0");
  const birthdayOf = (form) => (form.bday.value && form.bmonth.value ? `${pad2(form.bmonth.value)}-${pad2(form.bday.value)}` : "");

  function renderAccount(msg) {
    const el = document.getElementById("acct-body");
    if (!el) return;
    const title = document.getElementById("acct-title");
    if (!SYNC.auth.signedIn()) {
      title.textContent = t("acct.title");
      el.innerHTML = `<p class="muted">${esc(t("acct.lead"))}</p>
        <div class="oauth">
          <button class="btn-oauth btn-google" type="button" data-signin="google">${LOGO.google}<span>${esc(t("acct.google"))}</span></button>
          <button class="btn-oauth btn-apple" type="button" data-signin="apple">${LOGO.apple}<span>${esc(t("acct.apple"))}</span></button>
        </div>
        <p class="acct-msg" role="status">${esc(msg || "")}</p>
        <p class="acct-or"><span>${esc(t("acct.or"))}</span></p>
        <button class="btn btn-ghost btn-block" type="button" data-open="club">${icon("sparkle")}${esc(t("acct.club"))}</button>
        <p class="acct-legal">${esc(t("acct.legal"))} <a href="help.html#privacy">${esc(t("consent.more"))}</a></p>`;
      return;
    }
    const show = (a) => {
      const u = SYNC.auth.user();
      title.textContent = t("acct.hi", { name: ((a && a.name) || u.name || "").split(" ")[0] || "wepink" });
      el.innerHTML = a ? accountHTML(a, msg) : `<div class="acct-loading"><span class="spinner" aria-hidden="true"></span></div>`;
    };
    show(store.get("account", null));
    SYNC.auth.account().then(
      (a) => {
        const typing = el.contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName);
        if (!typing && document.getElementById("acct-body") === el) show(a);
        refreshAccountButton();
      },
      () => {
        if (SYNC.auth.signedIn()) return; // a network hiccup: keep what's shown
        renderAccount(t("acct.expired"));
        refreshAccountButton();
      }
    );
  }
  function accountHTML(a, msg) {
    const c = country();
    const u = Object.assign({}, SYNC.auth.user(), { name: a.name, email: a.email, avatar: a.avatar });
    const dial = c.dial.replace(/\D/g, "");
    const phone = String(a.phone || "").replace(/\D/g, "");
    const local = phone.startsWith(dial) ? phone.slice(dial.length) : phone;
    const via = { google: "Google", apple: "Apple" }[a.provider] || "";
    const orders = a.orders || [];
    return `<div class="acct-head">${avatar(u, "acct-avatar")}<div><strong>${esc(a.name || u.email)}</strong><span class="muted small" dir="ltr">${esc(a.email || "")}</span>${via ? `<span class="acct-via">${LOGO[a.provider] || ""}${esc(t("acct.via", { provider: via }))}</span>` : ""}</div></div>
      <form class="acct-form" id="acct-form" novalidate>
        <div class="field"><label for="ac-name">${esc(t("club.name"))}</label><input id="ac-name" name="name" autocomplete="name" required value="${esc(a.name || "")}"></div>
        <div class="field"><label for="ac-phone">${esc(t("club.phone"))}</label>
          <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input id="ac-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" value="${esc(local)}"></div>
        </div>
        ${birthdayFields(a.birthday, "ac-bday")}
        <label class="check"><input type="checkbox" name="marketing" ${a.marketing ? "checked" : ""}><span class="check-box">${icon("check")}</span><span>${esc(t("club.agree"))}</span></label>
        <button class="btn btn-primary btn-block" type="submit">${esc(t("acct.save"))}</button>
        <p class="form-msg" role="status">${esc(msg || "")}</p>
      </form>
      <div class="acct-orders">
        <h3 class="h3">${esc(t("acct.orders"))}</h3>
        ${
          orders.length
            ? `<ul>${orders
                .map((o) => {
                  const cur = Object.values(D.countries).find((x) => x.currency === o.currency) || c;
                  const total = Number(o.total).toLocaleString("en-US", { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals });
                  return `<li><span><strong dir="ltr">${esc(o.number)}</strong><span class="muted small">${esc(new Date(o.date).toLocaleDateString(state.lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "short", year: "numeric" }))} · ${esc(t("acct.items", { n: o.items }))}</span></span><span class="acct-order-end"><span class="acct-status st-${esc(o.status)}">${esc(t("acct.st." + o.status))}</span><span class="price">${esc(state.lang === "ar" ? `${total} ${cur.symbol.ar}` : `${cur.symbol.en} ${total}`)}</span></span></li>`;
                })
                .join("")}</ul>`
            : `<p class="muted">${esc(t("acct.noOrders"))}</p>`
        }
      </div>
      <button class="link-btn small acct-out" type="button" data-signout>${esc(t("acct.signOut"))}</button>`;
  }
  function refreshAccountButton() {
    const b = document.querySelector(".account-btn");
    if (b) b.outerHTML = accountButton();
  }
  function submitAccount(form) {
    if (!validate(form)) return;
    const msg = form.querySelector(".form-msg");
    const digits = form.phone.value.replace(/\D/g, "");
    if (digits && !/^[0-9\s-]{7,12}$/.test(form.phone.value.trim())) {
      msg.textContent = t("co.invalidPhone");
      return form.phone.focus();
    }
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    SYNC.auth
      .save({ name: form.name.value.trim(), phone: digits ? country().dial + digits : "", birthday: birthdayOf(form), marketing: form.marketing.checked, country: state.country, lang: state.lang })
      .then(
        () => renderAccount(t("acct.saved")),
        () => {
          btn.disabled = false;
          msg.textContent = t("form.failed");
        }
      );
  }

  /* ---------- wepink Club (sign-up for offers) & cookie consent ---------- */
  function clubBody() {
    if (store.get("club", "") === "joined") {
      const offer = welcome.pct() && welcome.state() !== "used";
      return `<div class="club-done"><span class="thanks-icon">${icon("check")}</span><h3 class="h3">${esc(t("club.doneTitle"))}</h3><p class="muted">${esc(t("club.doneLead"))}</p>
        ${
          offer
            ? `<div class="club-code"><span class="eyebrow">${esc(t("club.codeTitle"))}</span><strong dir="ltr">${esc(welcome.code())}</strong><p class="small muted">${esc(t("club.codeLead", { pct: welcome.pct() }))}</p><button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(welcome.code())}">${icon("check")}<span>${esc(t("club.copy"))}</span></button></div>`
            : ""
        }
        <button class="btn btn-primary btn-block" type="button" data-close>${esc(t(offer ? "club.shop" : "club.doneCta"))}</button></div>`;
    }
    const c = country();
    const me = store.get("account", null) || {};
    return `<form class="club-form" id="club-form" novalidate>
      <div class="field"><label for="cl-name">${esc(t("club.name"))}</label><input id="cl-name" name="name" autocomplete="name" required value="${esc(me.name || "")}"></div>
      <div class="field"><label for="cl-phone">${esc(t("club.phone"))}</label>
        <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input id="cl-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" required></div>
      </div>
      <div class="field"><label for="cl-email">${esc(t("club.email"))} <span class="optional">${esc(t("club.optional"))}</span></label><input id="cl-email" name="email" type="email" autocomplete="email" dir="ltr" value="${esc(me.email || "")}"></div>
      ${birthdayFields(me.birthday, "cl-bday")}
      <label class="check"><input type="checkbox" name="agree" id="cl-agree"><span class="check-box">${icon("check")}</span><span>${esc(t("club.agree"))}</span></label>
      <p class="field-error" id="cl-agree-err"></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit">${icon("sparkle")}<span>${esc(welcome.pct() ? t("club.submitOffer", { pct: welcome.pct() }) : t("club.submit"))}</span></button>
      <p class="club-privacy">${esc(t("club.privacy"))} <a href="help.html#privacy">${esc(t("consent.more"))}</a></p>
    </form>`;
  }
  function submitClub(form) {
    let ok = validate(form);
    const email = form.email.value.trim();
    const emailField = form.email.closest(".field");
    let err = emailField.querySelector(".field-error");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      if (!err) emailField.insertAdjacentHTML("beforeend", `<p class="field-error"></p>`);
      emailField.querySelector(".field-error").textContent = t("co.invalidEmail");
      form.email.setAttribute("aria-invalid", "true");
      if (ok) form.email.focus();
      ok = false;
    } else if (err) err.textContent = "";
    const agreeErr = form.querySelector("#cl-agree-err");
    agreeErr.textContent = form.agree.checked ? "" : t("club.agreeErr");
    if (!form.agree.checked) ok = false;
    if (!ok) return;
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    const c = country();
    const birthday = birthdayOf(form) || undefined;
    const done = () => {
      store.set("club", "joined");
      welcome.unlock();
      document.getElementById("club-body").innerHTML = clubBody();
      const b = document.querySelector("#club-body [data-close]");
      if (b) b.focus();
    };
    const entry = Object.assign(
      { source: "club", name: form.name.value.trim(), phone: `${c.dial}${form.phone.value.replace(/\D/g, "")}`, email, country: state.country, lang: state.lang, marketing: true, details: birthday ? { birthday } : {} },
      SYNC.context()
    );
    if (!SYNC.live) return done();
    SYNC.saveContact(entry).then(done, () => {
      btn.disabled = false;
      agreeErr.textContent = t("form.failed");
    });
  }
  function scheduleClub() {
    if (store.get("club", "") === "joined" || Date.now() - store.get("clubShown", 0) < 7 * 864e5) return;
    let shown = false;
    const show = () => {
      if (shown || store.get("club", "") === "joined") return;
      const busy = ["checkout", "earn"].includes(route().page) || document.querySelector("#app-layers .layer:not([hidden])") || (document.activeElement && document.activeElement.closest && document.activeElement.closest("form"));
      if (busy) return;
      shown = true;
      store.set("clubShown", Date.now());
      open("club");
    };
    setTimeout(show, 15000);
    // On a computer, also when the pointer heads for the tabs or the close button.
    if (window.matchMedia("(pointer: fine)").matches) {
      const leaving = (e) => {
        if (e.clientY > 8 || e.relatedTarget) return;
        document.removeEventListener("mouseout", leaving);
        show();
      };
      setTimeout(() => document.addEventListener("mouseout", leaving), 4000);
    }
  }
  function consentBanner() {
    if (!SYNC.live || SYNC.consent.get()) return "";
    return `<div class="consent" id="consent" role="region" aria-label="${esc(t("consent.label"))}">
      <p><strong>${esc(t("consent.title"))}</strong> ${esc(t("consent.text"))} <a href="help.html#privacy">${esc(t("consent.more"))}</a></p>
      <div class="consent-btns">
        <button class="btn btn-ghost btn-sm" type="button" data-consent="no">${esc(t("consent.no"))}</button>
        <button class="btn btn-primary btn-sm" type="button" data-consent="yes">${esc(t("consent.yes"))}</button>
      </div>
    </div>`;
  }
  const pageInfo = () => ({ page: route().page, country: state.country, lang: state.lang, ref: ref.get() || undefined });

  /* ---------- forms ---------- */
  function validate(form) {
    let first = null;
    form.querySelectorAll("input[required], select[required], textarea[required]").forEach((input) => {
      const field = input.closest(".field");
      let msg = "";
      const v = input.value.trim();
      if (!v) msg = t("co.required");
      else if (input.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) msg = t("co.invalidEmail");
      else if (input.type === "tel" && !/^[0-9\s-]{7,12}$/.test(v)) msg = t("co.invalidPhone");
      let err = field && field.querySelector(".field-error");
      if (msg) {
        input.setAttribute("aria-invalid", "true");
        if (field && !err) {
          err = document.createElement("p");
          err.className = "field-error";
          err.id = input.id + "-err";
          field.appendChild(err);
          input.setAttribute("aria-describedby", err.id);
        }
        if (err) err.textContent = msg;
        if (!first) first = input;
      } else {
        input.removeAttribute("aria-invalid");
        if (err) err.textContent = "";
      }
    });
    if (first) first.focus();
    return !first;
  }

  // In the bag: the set's saving, or what's missing to make one.
  function ritualNote() {
    const r = bag.ritual();
    if (!r.pct) return "";
    if (r.sets) return `<p class="rit-note is-done">${icon("sparkle")}<span>${esc(t("rit.inBag", { n: r.sets, amount: money(r.amount) }))}</span></p>`;
    if (r.missing.length !== 1) return "";
    return `<p class="rit-note">${icon("sparkle")}<span>${esc(t("rit.nudge", { item: t("rit.item_" + r.missing[0]), pct: r.pct }))}</span><button class="link-btn small" type="button" data-open="ritual">${esc(t("rit.build"))}</button></p>`;
  }
  function renderBagDrawer() {
    const el = document.getElementById("bag-body");
    if (!el) return;
    const items = bag.items();
    if (!items.length) {
      el.innerHTML = `<div class="bag-empty">
        <div class="bag-empty-icon">${icon("bag")}</div>
        <p>${esc(t("bag.empty"))}</p>
        <a class="btn btn-primary" href="shop.html">${esc(t("bag.emptyCta"))}</a>
      </div>`;
      return;
    }
    const sub = bag.subtotal();
    const free = country().freeOver;
    const pct = Math.min(100, Math.round((sub / free) * 100));
    const left = Math.max(0, free - sub);
    el.innerHTML = `
      <div class="free-meter">
        <p>${icon(left ? "truck" : "check")}<span>${esc(left ? t("bag.freeProgress", { amount: money(left) }) : t("bag.freeDone"))}</span></p>
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
      </div>
      ${ref.get() ? `<p class="bag-code">${icon("sparkle")}<span>${esc(t("bag.code", { code: ref.get(), pct: ref.pct() }))}</span></p>` : welcome.ready() ? `<p class="bag-code">${icon("sparkle")}<span>${esc(t("bag.welcome", { code: welcome.code(), pct: welcome.pct() }))}</span></p>` : ""}
      <ul class="bag-lines">
        ${items
          .map(
            (i) => `<li class="bag-line">
          <a class="bag-thumb" href="product.html?id=${encodeURIComponent(i.p.id)}" tabindex="-1" aria-hidden="true">${media(i.p, "media-sm")}</a>
          <div class="bag-info">
            <p class="bag-name"><a href="product.html?id=${encodeURIComponent(i.p.id)}">${esc(pname(i.p))}</a></p>
            <p class="muted small">${esc(L(i.p.typeName))} · ${esc(sizeText(i.p))}</p>
            <div class="bag-row">
              <div class="stepper" role="group" aria-label="${esc(t("pdp.qty"))}">
                <button type="button" data-qty="${esc(i.p.id)}" data-delta="-1" aria-label="${esc(t("bag.decrease"))}">${icon("minus")}</button>
                <span aria-live="polite">${i.qty}</span>
                <button type="button" data-qty="${esc(i.p.id)}" data-delta="1" aria-label="${esc(t("bag.increase"))}">${icon("plus")}</button>
              </div>
              <span class="price">${esc(money(priceOf(i.p) * i.qty))}</span>
            </div>
            <button class="link-btn small" type="button" data-remove="${esc(i.p.id)}">${esc(t("bag.remove"))}</button>
          </div>
        </li>`
          )
          .join("")}
      </ul>
      <div class="bag-foot">
        <p class="bag-gift">${icon("gift")}<span>${esc(t("bag.giftNote"))}</span></p>
        ${ritualNote()}
        <div class="bag-total"><span>${esc(t("bag.subtotal"))}</span><strong>${esc(money(sub))}</strong></div>
        ${bag.ritual().amount ? `<div class="bag-total bag-ritual"><span>${esc(t("rit.discount", { pct: ritual.pct() }))}</span><strong>− ${esc(money(bag.ritual().amount))}</strong></div>` : ""}
        <a class="btn btn-primary btn-block" href="checkout.html">${esc(t("bag.checkout"))}${icon("arrow", "flip")}</a>
        <ul class="pay-row">${payBadges(country().pay)}</ul>
      </div>`;
  }

  function renderSearch(q) {
    const el = document.getElementById("search-results");
    if (!el) return;
    const query = q.trim().toLowerCase();
    if (!query) {
      const popular = ["VF Golden", "Ghadan", "Celebrate Life", "King Blue", L(D.categories.find((c) => c.id === "gift-sets").name)];
      el.innerHTML = `<p class="eyebrow">${esc(t("search.popular"))}</p>
        <div class="pill-row">${popular.map((w) => `<button class="pill" type="button" data-search="${esc(w)}">${esc(w)}</button>`).join("")}</div>`;
      return;
    }
    const words = query.split(/\s+/);
    const score = (p) => {
      const cat = D.categories.find((c) => c.id === p.cat).name;
      const fields = [
        [3, [p.line, p.lineAr || ""]],
        [2, [p.typeName.en, p.typeName.ar, cat.en, cat.ar, ...(D.families[p.family] ? [D.families[p.family].en, D.families[p.family].ar] : [])]],
        [1, [].concat(...Object.values(p.notes).map((arr) => arr.flat()), p.tagline ? [p.tagline.en, p.tagline.ar] : [])],
      ];
      let total = 0;
      for (const w of words) {
        const hit = fields.find(([, list]) => list.some((f) => f.toLowerCase().includes(w)));
        if (!hit) return 0;
        total += hit[0];
      }
      return total;
    };
    const ranked = D.products.map((p) => [score(p), p]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]);
    const best = ranked.length ? ranked[0][0] : 0;
    const hits = ranked.filter(([n]) => n === best || n >= words.length * 2).map(([, p]) => p).slice(0, 8);
    el.innerHTML = hits.length
      ? `<ul class="search-list">${hits
          .map(
            (p) => `<li><a href="product.html?id=${encodeURIComponent(p.id)}">
            ${media(p, "media-xs")}
            <span class="search-text"><strong>${esc(pname(p))}</strong><span class="muted small">${esc(L(p.typeName))} · ${esc(sizeText(p))}</span></span>
            <span class="price">${esc(money(priceOf(p)))}</span></a></li>`
          )
          .join("")}</ul>`
      : `<p class="muted search-none">${esc(t("search.empty", { q }))}</p>`;
  }

  function open(name, opts) {
    const layer = document.getElementById("layer-" + name);
    if (!layer) return;
    closeAll(true);
    lastFocus = document.activeElement;
    const backdrop = document.querySelector("#app-layers .backdrop");
    backdrop.hidden = false;
    layer.hidden = false;
    document.documentElement.classList.add("is-locked");
    requestAnimationFrame(() => {
      backdrop.classList.add("is-on");
      layer.classList.add("is-on");
    });
    if (name === "quiz") quiz.start();
    if (name === "ritual") builder.start(opts && opts.line);
    if (name === "account") renderAccount();
    const focusEl = name === "search" ? document.getElementById("search-input") : layer.querySelector("button, a, input, select, textarea");
    setTimeout(() => focusEl && focusEl.focus(), 60);
  }
  function closeAll(silent) {
    const root = document.getElementById("app-layers");
    if (!root) return;
    const opened = root.querySelectorAll(".layer:not([hidden])");
    if (!opened.length) return;
    opened.forEach((l) => {
      l.classList.remove("is-on");
      l.hidden = true;
    });
    const backdrop = root.querySelector(".backdrop");
    backdrop.classList.remove("is-on");
    backdrop.hidden = true;
    document.documentElement.classList.remove("is-locked");
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapFocus(e) {
    const layer = document.querySelector("#app-layers .layer:not([hidden])");
    if (!layer) return;
    const f = [...layer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function toast(msg) {
    const box = document.getElementById("toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon("check")}<span>${esc(msg)}</span>`;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-on"));
    setTimeout(() => {
      el.classList.remove("is-on");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ---------- scent finder ---------- */
  const quiz = {
    answers: {},
    start() {
      quiz.answers = {};
      quiz.step(1);
    },
    step(n) {
      const body = document.getElementById("quiz-body");
      const q =
        n === 1
          ? { key: "family", title: t("quiz.q1"), opts: [["sweet", t("quiz.q1a"), "#E6007E"], ["floral", t("quiz.q1b"), "#F06FA8"], ["fresh", t("quiz.q1c"), "#1FA5C9"], ["warm", t("quiz.q1d"), "#8E0B2C"], ["woody", t("quiz.q1e"), "#0F2C6B"]] }
          : { key: "wear", title: t("quiz.q2"), opts: [["splash", t("quiz.q2a"), "#FF8CC6"], ["perfume", t("quiz.q2b"), "#B0005E"], ["set", t("quiz.q2c"), "#E9B872"]] };
      body.innerHTML = `<p class="eyebrow">${esc(t("quiz.step", { n }))}</p>
        <h3 class="quiz-q">${esc(q.title)}</h3>
        <div class="quiz-opts">${q.opts
          .map(([v, label, col]) => `<button type="button" class="quiz-opt" data-quiz="${q.key}" data-value="${v}"><span class="quiz-dot" style="background:${col}"></span>${esc(label)}${icon("arrow", "flip")}</button>`)
          .join("")}</div>`;
      const first = body.querySelector("button");
      if (first) first.focus();
    },
    answer(key, value) {
      quiz.answers[key] = value;
      if (key === "family") quiz.step(2);
      else quiz.result();
    },
    result() {
      const { family, wear } = quiz.answers;
      const typeCat = family === "woody" ? "men" : { splash: "body-splash", perfume: "perfume", set: "gift-sets" }[wear];
      const pool = D.products.filter((p) => p.family === family && (family === "woody" || p.gender !== "masculino"));
      const best = pool.find((p) => p.cat === typeCat) || pool[0] || D.products[0];
      const also = pool.filter((p) => p !== best).slice(0, 2);
      const body = document.getElementById("quiz-body");
      body.innerHTML = `<p class="eyebrow">${esc(t("quiz.result"))}</p>
        <div class="quiz-result">
          ${media(best, "media-quiz")}
          <div>
            <p class="card-type">${esc(L(best.typeName))} · ${esc(L(D.families[best.family]))}</p>
            <h3 class="quiz-name">${esc(pname(best))}</h3>
            <p class="muted">${esc(L(best.desc))}</p>
            <div class="quiz-actions">
              <span class="price-lg">${esc(money(priceOf(best)))}</span>
              <button class="btn btn-primary" type="button" data-add="${esc(best.id)}">${esc(t("pdp.add"))}</button>
            </div>
            ${store.get("club", "") === "joined" ? "" : `<button class="link-btn quiz-send" type="button" data-quiz-send="${esc([best, ...also].map((p) => p.id).join(","))}">${icon("chat")}<span>${esc(t("quiz.send"))}</span></button>`}
          </div>
        </div>
        ${also.length ? `<p class="eyebrow quiz-also">${esc(t("quiz.also"))}</p><div class="quiz-mini">${also.map((p) => `<a href="product.html?id=${encodeURIComponent(p.id)}">${media(p, "media-xs")}<span><strong>${esc(pname(p))}</strong><span class="muted small">${esc(L(p.typeName))}</span></span></a>`).join("")}</div>` : ""}
        <button class="link-btn" type="button" data-quiz-restart>${esc(t("quiz.restart"))}</button>`;
    },
  };

  /* ---------- build your ritual ---------- */
  const builder = {
    picks: {},
    lines() {
      // scent lines that have all three steps, best sellers first
      const by = new Map();
      D.products.forEach((p) => {
        const st = ritual.step(p);
        if (!st) return;
        const l = by.get(p.line) || { line: p.line, steps: {}, best: 0 };
        if (!l.steps[st] || priceOf(p) < priceOf(l.steps[st])) l.steps[st] = p;
        if (p.badge === "bestseller") l.best++;
        by.set(p.line, l);
      });
      const star = (product(D.featured.star) || {}).line; // the signature line leads
      return [...by.values()]
        .filter((l) => STEPS.every(([st]) => l.steps[st]))
        .sort((a, b) => (b.line === star) - (a.line === star) || b.best - a.best || a.line.localeCompare(b.line));
    },
    start(line) {
      const lines = builder.lines();
      const pick = lines.find((l) => l.line === line) || lines[0];
      builder.picks = {};
      if (pick) STEPS.forEach(([st]) => (builder.picks[st] = pick.steps[st].id));
      builder.line = pick ? pick.line : "";
      builder.draw();
    },
    draw() {
      const body = document.getElementById("ritual-body");
      if (!body) return;
      const lines = builder.lines();
      const chosen = STEPS.map(([st]) => product(builder.picks[st])).filter(Boolean);
      const items = chosen.map((p) => ({ p, qty: 1 }));
      const r = ritual.of(items);
      const full = items.reduce((n, i) => n + priceOf(i.p), 0);
      body.innerHTML = `
        <p class="muted rit-lead">${esc(t("rit.lead", { pct: ritual.pct() }))}</p>
        <p class="eyebrow">${esc(t("rit.lines"))}</p>
        <div class="rit-lines">${lines
          .slice(0, 14)
          .map((l) => `<button class="pill" type="button" data-rit-line="${esc(l.line)}" aria-pressed="${l.line === builder.line}">${esc(pname(l.steps.splash))}</button>`)
          .join("")}</div>
        <ol class="rit-steps">
          ${STEPS.map(([st, types], n) => {
            const p = product(builder.picks[st]);
            const options = D.products.filter((x) => types.includes(x.type)).sort((a, b) => pname(a).localeCompare(pname(b)));
            return `<li class="rit-step">
              <span class="rit-num">0${n + 1}</span>
              ${p ? media(p, "media-sm") : ""}
              <div class="rit-step-text">
                <p class="eyebrow">${esc(t("rit." + st))}</p>
                <strong>${p ? esc(pname(p)) : ""}</strong>
                <span class="muted small">${p ? `${esc(L(p.typeName))} · ${esc(sizeText(p))} · ${esc(money(priceOf(p)))}` : ""}</span>
                <div class="select select-sm"><select data-rit-step="${st}" aria-label="${esc(t("rit." + st))}">${options
                  .map((x) => `<option value="${esc(x.id)}"${x.id === builder.picks[st] ? " selected" : ""}>${esc(pname(x))} · ${esc(sizeText(x))}</option>`)
                  .join("")}</select>${icon("chevron")}</div>
              </div>
            </li>`;
          }).join("")}
        </ol>
        <div class="rit-total">
          <div><span class="muted">${esc(t("rit.separately"))}</span> <s>${esc(money(full))}</s></div>
          <div class="rit-price"><span>${esc(t("rit.yours"))}</span><strong>${esc(money(full - r.amount))}</strong></div>
          ${r.amount ? `<span class="rit-save">${esc(t("rit.save", { amount: money(r.amount) }))}</span>` : ""}
        </div>
        <button class="btn btn-primary btn-lg btn-block" type="button" data-rit-add>${icon("bag")}<span>${esc(t("rit.add"))}</span></button>`;
    },
  };
  document.addEventListener("click", (e) => {
    const line = e.target.closest && e.target.closest("[data-rit-line]");
    if (line) return builder.start(line.getAttribute("data-rit-line"));
    if (e.target.closest && e.target.closest("[data-rit-add]")) {
      STEPS.forEach(([st]) => builder.picks[st] && bag.add(builder.picks[st], 1));
      toast(t("rit.added"));
      open("bag");
    }
  });
  // "Copy" next to a code
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.getAttribute("data-copy");
    const done = () => {
      const label = b.querySelector("span");
      if (label) label.textContent = t("club.copied");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-season-preview]");
    if (!b) return;
    try {
      sessionStorage.setItem("wpg.seasonPreview", b.getAttribute("data-season-preview"));
    } catch (err) {
      /* ignore */
    }
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  });
  document.addEventListener("change", (e) => {
    const sel = e.target.closest && e.target.closest("[data-rit-step]");
    if (!sel) return;
    builder.picks[sel.getAttribute("data-rit-step")] = sel.value;
    builder.line = "";
    builder.draw();
  });

  // Quiz result: "send my match to WhatsApp" (a quiz contact, with consent).
  function submitQuizCapture(form) {
    const f = form.elements;
    const err = form.querySelector(".ai-err");
    const name = f.namedItem("name").value.trim();
    const phone = f.namedItem("phone").value.replace(/\D/g, "");
    if (!name || phone.length < 7) return (err.textContent = t("ai.needDetails"));
    if (!f.namedItem("agree").checked) return (err.textContent = t("club.agreeErr"));
    const c = country();
    const picks = (form.dataset.picks || "").split(",").filter(Boolean);
    const done = () => {
      store.set("club", "joined");
      welcome.unlock();
      form.outerHTML = `<p class="quiz-sent">${icon("check")}<span>${esc(t("ai.saved", { name: name.split(" ")[0] }))}</span></p>`;
    };
    const entry = Object.assign(
      { source: "quiz", name, phone: `${c.dial}${phone}`, country: state.country, lang: state.lang, marketing: true, details: { match: picks } },
      SYNC.context()
    );
    if (!SYNC.live) return done();
    form.querySelector("[type=submit]").disabled = true;
    SYNC.saveContact(entry).then(done, () => {
      form.querySelector("[type=submit]").disabled = false;
      err.textContent = t("form.failed");
    });
  }

  /* ---------- events ---------- */
  function bind() {
    loader.mount();
    document.addEventListener("submit", (e) => {
      const form = e.target.closest && e.target.closest(".quiz-capture");
      if (!form) return;
      e.preventDefault();
      submitQuizCapture(form);
    });
    if (!SINGLE) {
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
        if (!PAGE_LINK.test(a.getAttribute("href")) || a.origin !== location.origin) return;
        if (a.pathname === location.pathname && a.search === location.search) return;
        loader.start();
        try {
          sessionStorage.setItem("wpg.nav", "1");
        } catch (err) {
          /* ignore */
        }
      });
      // back/forward from the browser's cache: don't leave the line hanging
      window.addEventListener("pageshow", (e) => e.persisted && loader.finish());
    }
    if (SINGLE) {
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
        const href = a.getAttribute("href");
        if (href.startsWith("#") && !href.startsWith("#/")) {
          // In-page anchors (the skip link) must not change the route.
          const target = document.getElementById(href.slice(1));
          if (target) {
            e.preventDefault();
            target.focus({ preventScroll: true });
            target.scrollIntoView();
          }
          return;
        }
        if (!PAGE_LINK.test(href)) return;
        e.preventDefault();
        navigate(href);
      });
      window.addEventListener("hashchange", () => {
        if (!location.hash || location.hash.startsWith("#/")) afterNavigate();
      });
    }
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-open],[data-close],[data-add],[data-qty],[data-remove],[data-lang-toggle],[data-tone-toggle],[data-quiz-send],[data-country],[data-search],[data-quiz],[data-quiz-restart]");
      if (!el) return;
      if (el.hasAttribute("data-open")) {
        e.preventDefault();
        open(el.getAttribute("data-open"), el.dataset);
      } else if (el.hasAttribute("data-close")) {
        closeAll();
      } else if (el.hasAttribute("data-add")) {
        const id = el.getAttribute("data-add");
        const qtyEl = el.closest("form, .pdp-buy");
        const qty = qtyEl && qtyEl.querySelector("[data-qty-value]") ? parseInt(qtyEl.querySelector("[data-qty-value]").textContent, 10) || 1 : 1;
        bag.add(id, qty);
        open("bag");
      } else if (el.hasAttribute("data-qty")) {
        const id = el.getAttribute("data-qty");
        const line = state.cart.find((i) => i.id === id);
        if (line) bag.setQty(id, line.qty + parseInt(el.getAttribute("data-delta"), 10));
      } else if (el.hasAttribute("data-remove")) {
        bag.setQty(el.getAttribute("data-remove"), 0);
      } else if (el.hasAttribute("data-lang-toggle")) {
        setLang(state.lang === "ar" ? "en" : "ar");
      } else if (el.hasAttribute("data-quiz-send")) {
        const c = country();
        el.outerHTML = `<form class="ai-capture quiz-capture" data-picks="${esc(el.getAttribute("data-quiz-send"))}" novalidate>
          <input name="name" autocomplete="name" placeholder="${esc(t("stores.name"))}" required>
          <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" placeholder="${esc(t("stores.phone"))}" required></div>
          <label class="ai-agree"><input type="checkbox" name="agree"> <span>${esc(t("ai.agree"))}</span></label>
          <p class="ai-err" aria-live="polite"></p>
          <button class="btn btn-primary btn-sm" type="submit">${esc(t("ai.send"))}</button>
        </form>`;
        const f = document.querySelector(".quiz-capture input");
        if (f) f.focus();
      } else if (el.hasAttribute("data-tone-toggle")) {
        tone.set(tone.get() === "noir" ? "blanc" : "noir");
      } else if (el.hasAttribute("data-country")) {
        setCountry(el.getAttribute("data-country"));
      } else if (el.hasAttribute("data-search")) {
        const input = document.getElementById("search-input");
        input.value = el.getAttribute("data-search");
        renderSearch(input.value);
        input.focus();
      } else if (el.hasAttribute("data-quiz")) {
        quiz.answer(el.getAttribute("data-quiz"), el.getAttribute("data-value"));
      } else if (el.hasAttribute("data-quiz-restart")) {
        quiz.start();
      }
    });
    document.addEventListener("input", (e) => {
      if (e.target.id === "search-input") renderSearch(e.target.value);
    });
    document.addEventListener("click", (e) => {
      const yes = e.target.closest("[data-consent]");
      if (yes) {
        SYNC.consent.set(yes.dataset.consent);
        const banner = document.getElementById("consent");
        if (banner) banner.remove();
        if (yes.dataset.consent === "yes") SYNC.trackPage(pageInfo());
      } else if (e.target.closest("[data-cookies]")) {
        SYNC.consent.set(null);
        renderLayers();
      } else if (e.target.closest("[data-signin]")) {
        const provider = e.target.closest("[data-signin]").dataset.signin;
        const name = provider === "apple" ? "Apple" : "Google";
        SYNC.auth.signIn(provider).catch((err) => renderAccount(t(err.code === "file" ? "acct.needSite" : err.code === "disabled" ? "acct.disabled" : "form.failed", { provider: name })));
      } else if (e.target.closest("[data-signout]")) {
        SYNC.auth.signOut();
        closeAll(true);
        render();
        toast(t("acct.signedOut"));
      }
    });
    document.addEventListener("submit", (e) => {
      if (e.target.id === "club-form") (e.preventDefault(), submitClub(e.target));
      if (e.target.id === "acct-form") (e.preventDefault(), submitAccount(e.target));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
      if (e.key === "Tab") trapFocus(e);
    });

    // Rotate the announcement bar.
    let i = 0;
    setInterval(() => {
      const msgs = document.querySelectorAll(".announce-msg");
      if (!msgs.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      msgs.forEach((m) => m.classList.remove("is-on"));
      i = (i + 1) % msgs.length;
      msgs[i].classList.add("is-on");
    }, 4500);

    // Shadow under the header once the page scrolls.
    const onScroll = () => document.documentElement.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setLang(lang) {
    state.lang = lang;
    store.set("lang", lang);
    render();
    if (window.WP_ASSIST) window.WP_ASSIST.refresh();
  }
  function setCountry(code) {
    state.country = code;
    store.set("country", code);
    closeAll(true);
    render();
    if (window.WP_ASSIST) window.WP_ASSIST.refresh();
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- search engines and link previews ----------
   * Each page may describe itself while it renders (seo.set): a description,
   * an image and structured data for Google. render() then writes the meta
   * tags, the canonical and English / Arabic links, and the JSON-LD. Social
   * apps that don't run scripts read the tags already in each HTML file. */
  const seo = {
    page: {},
    statics: null,
    set(info) {
      Object.assign(this.page, info);
    },
    abs(path) {
      if (path == null) return "";
      if (/^https?:/.test(path)) return path;
      return (D.config.siteUrl || location.origin + "/").replace(/\/?$/, "/") + String(path).replace(/^\.?\//, "");
    },
    tag(sel, make, attrs) {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement(make);
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    },
    apply(page, params) {
      const head = document.head;
      if (!this.statics) {
        const d = head.querySelector('meta[name="description"]');
        this.statics = { description: d ? d.content : "" };
      }
      const info = this.page;
      const description = (info.description || this.statics.description || "").replace(/\s+/g, " ").trim().slice(0, 300);
      // (built from parts so the single-file build doesn't embed the share image)
      const image = this.abs(info.image || ["assets", "photos", "og-share.jpg"].join("/"));
      this.tag('meta[name="description"]', "meta", { name: "description", content: description });
      const og = { "og:title": document.title, "og:description": description, "og:image": image, "og:type": page === "product" ? "product" : "website", "og:locale": state.lang === "ar" ? "ar_AE" : "en_AE" };
      Object.entries(og).forEach(([k, v]) => this.tag(`meta[property="${k}"]`, "meta", { property: k, content: v }));
      this.tag('meta[name="twitter:card"]', "meta", { name: "twitter:card", content: "summary_large_image" });
      this.tag('meta[name="twitter:image"]', "meta", { name: "twitter:image", content: image });
      // Canonical and language links (the single-file preview has no real address).
      if (!SINGLE) {
        const keep = new URLSearchParams();
        ["id", "c"].forEach((k) => params.get(k) && keep.set(k, params.get(k)));
        const file = page === "home" ? "" : page + ".html";
        const url = this.abs(file) + (keep.toString() ? "?" + keep : "");
        const withLang = (l) => url + (keep.toString() ? "&" : "?") + "lang=" + l;
        this.tag('link[rel="canonical"]', "link", { rel: "canonical", href: state.lang === "ar" ? withLang("ar") : url });
        this.tag('meta[property="og:url"]', "meta", { property: "og:url", content: url });
        this.tag('link[rel="alternate"][hreflang="en"]', "link", { rel: "alternate", hreflang: "en", href: url });
        this.tag('link[rel="alternate"][hreflang="ar"]', "link", { rel: "alternate", hreflang: "ar", href: withLang("ar") });
        this.tag('link[rel="alternate"][hreflang="x-default"]', "link", { rel: "alternate", hreflang: "x-default", href: url });
      }
      // Structured data
      head.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach((x) => x.remove());
      const ld = (info.ld || []).slice();
      if (page === "home") {
        ld.push({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "wepink " + D.config.region.en,
          url: this.abs(""),
          logo: this.abs("assets/brand/logo.svg"),
          sameAs: [D.config.instagram, D.config.tiktok].filter(Boolean),
          contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: "+" + D.config.whatsapp, availableLanguage: ["Arabic", "English"], areaServed: Object.keys(D.countries) },
        });
        ld.push({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "wepink " + D.config.region.en,
          url: this.abs(""),
          inLanguage: ["en", "ar"],
          potentialAction: { "@type": "SearchAction", target: this.abs("shop.html") + "?q={search_term_string}", "query-input": "required name=search_term_string" },
        });
      }
      ld.forEach((data) => {
        const el = document.createElement("script");
        el.type = "application/ld+json";
        el.setAttribute("data-seo", "");
        el.textContent = JSON.stringify(data);
        head.appendChild(el);
      });
    },
  };
  function crumbsLd(items) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: href ? seo.abs(href) : undefined })),
    };
  }

  /* ---------- render ---------- */
  function render() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    const sz = season();
    if (sz) {
      html.dataset.season = sz.id;
      html.dataset.threads = sz.threads;
      sz.flag.forEach((col, i) => html.style.setProperty(`--flag${i + 1}`, col));
    } else {
      delete html.dataset.season;
      delete html.dataset.threads;
    }
    const page = route().page;
    document.body.dataset.page = page;
    html.dataset.page = page;
    renderHeader();
    renderLayers();
    // A fresh <main> each render, so page listeners never pile up.
    const old = document.getElementById("main");
    const main = old.cloneNode(false);
    old.replaceWith(main);
    const fn = window.WP_PAGES && window.WP_PAGES[page];
    seo.page = {};
    if (fn) {
      const title = fn(main);
      document.title = title ? `${title} · wepink ${L(D.config.region)}` : `wepink ${L(D.config.region)} — ${t("meta.tagline")}`;
    }
    seo.apply(page, route().params);
    renderFooter();
    reveal();
  }

  function init() {
    bind();
    render();
    // shop.html?q=rose (Google's site search box): open the search with the words in
    const q = route().params.get("q");
    if (q) {
      open("search");
      const input = document.getElementById("search-input");
      input.value = q;
      renderSearch(q);
    }
    if (window.WP_SILK) window.WP_SILK.start();
    // Products, prices and settings from the database: re-render if anything
    // the shopper can see changed, unless they're mid-way through a form.
    SYNC.onChange((changed) => {
      const waiting = document.querySelector("#main [data-sync-wait]");
      if (!changed && !waiting) return;
      const busy =
        route().page === "checkout" ||
        document.querySelector("#app-layers .layer:not([hidden])") ||
        (document.activeElement && document.activeElement.closest && document.activeElement.closest("#main form"));
      if (busy && !waiting) return bag.save();
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
    });
    SYNC.boot();
    SYNC.trackPage(pageInfo());
    if (incomingRef) {
      ref.check(incomingRef).then((code) => {
        if (!code) return;
        ref.set(code);
        toast(t("ref.welcome", { code, pct: ref.pct() }));
        // Count the visit on the ambassador's link once per browser session.
        try {
          if (SYNC.live && !sessionStorage.getItem("wpg.click." + code)) {
            sessionStorage.setItem("wpg.click." + code, "1");
            SYNC.rpc("track_ref_click", { p_code: code }).catch(() => {});
          }
        } catch (e) {
          /* storage blocked */
        }
      });
    }
    // Back from Google / Apple: load (and create) their account, then ask for
    // the details a sign-in doesn't give us (WhatsApp, birthday, offers).
    const notice = SYNC.auth.notice();
    SYNC.auth.clearNotice();
    if (notice === "signedIn") {
      SYNC.auth.account().then(
        (a) => {
          refreshAccountButton();
          toast(t("acct.welcome", { name: (a.name || a.email || "").split(" ")[0] }));
          if (!a.phone) open("account");
        },
        () => toast(t("form.failed"))
      );
    } else if (notice) {
      setTimeout(() => toast(t("acct.failed")), 400);
    } else if (SYNC.auth.signedIn()) {
      SYNC.auth.account().then(refreshAccountButton, () => refreshAccountButton());
    }
    if (notice !== "signedIn") scheduleClub();
  }

  return { init, render, route, SINGLE, ref, welcome, seo, pics, ritual, season, seasonDeco, crumbsLd, pname, fullName, recordName, state, store, t, L, esc, icon, money, local, moneyAED, priceOf, product, country, bag, card, media, badge, priceHTML, sizeText, open, closeAll, toast, validate, sync: SYNC, data: D, art: ART };
})();

document.addEventListener("DOMContentLoaded", () => window.WP.init());
