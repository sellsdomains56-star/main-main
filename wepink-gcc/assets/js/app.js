/* wepink Gulf — shared shell: language, country & currency, bag, header,
 * footer, drawers and dialogs. Page bodies live in pages.js.
 */
window.WP = (function () {
  const D = window.WP_DATA;
  const I = window.WP_I18N;
  const ART = window.WP_ART;

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
  const PAGE_LINK = /^(index|shop|product|stores|about|help|checkout)\.html(\?[^#]*)?(#.*)?$/;
  function route() {
    if (!SINGLE) return { page: document.body.dataset.page, params: new URLSearchParams(location.search) };
    const m = location.hash.match(/^#\/([a-z]+)(?:\?([^#]*))?/);
    const page = m && window.WP_PAGES && window.WP_PAGES[m[1]] ? m[1] : "home";
    return { page, params: new URLSearchParams(m && m[2] ? m[2] : "") };
  }
  let pendingAnchor = "";
  function navigate(href) {
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
    const target = pendingAnchor && document.getElementById(pendingAnchor);
    pendingAnchor = "";
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  /* ---------- state ---------- */
  const params = route().params;
  const browserAr = (navigator.language || "").toLowerCase().startsWith("ar");
  const state = {
    lang: ["en", "ar"].includes(params.get("lang")) ? params.get("lang") : store.get("lang", browserAr ? "ar" : "en"),
    country: D.countries[params.get("country")] ? params.get("country") : store.get("country", "AE"),
    cart: store.get("cart", []).filter((i) => D.products.some((p) => p.id === i.id)),
  };
  if (!D.countries[state.country]) state.country = "AE";

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
  const product = (id) => D.products.find((p) => p.id === id);

  // Local price for an AED amount (or a product's own override).
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
  const priceOf = (p) => local(p.price, p);
  const moneyAED = (aed) => money(local(aed));

  /* ---------- bag ---------- */
  const bag = {
    items() {
      return state.cart.map((i) => ({ ...i, p: product(i.id) })).filter((i) => i.p);
    },
    count() {
      return state.cart.reduce((n, i) => n + i.qty, 0);
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
  };
  function icon(name, cls) {
    return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ""}</svg>`;
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
  function media(p, cls) {
    return `<div class="media ${cls || ""}" style="--c:${p.color};--c2:${p.color2}">${ART.art(p)}</div>`;
  }
  function priceHTML(p) {
    return `<span class="price">${esc(money(priceOf(p)))}</span>${p.compareAt ? `<s class="price-was">${esc(money(local(p.compareAt)))}</s>` : ""}`;
  }
  function card(p) {
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `<article class="card">
      <a class="card-media" href="${url}" tabindex="-1" aria-hidden="true">${badge(p)}${media(p)}</a>
      <div class="card-body">
        <p class="card-type">${esc(L(p.typeName))}</p>
        <h3 class="card-title"><a href="${url}">${esc(p.line)}</a></h3>
        <p class="card-size">${esc(sizeText(p))}</p>
        <div class="card-foot">
          <div class="card-price">${priceHTML(p)}</div>
          <button class="btn-add" type="button" data-add="${esc(p.id)}" aria-label="${esc(t("card.addLabel", { name: p.line + " " + L(p.typeName) }))}">${icon("plus")}<span>${esc(t("card.add"))}</span></button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- header & footer ---------- */
  function navLinks() {
    const cats = ["body-splash", "perfume", "body-care", "gift-sets"].map((id) => D.categories.find((c) => c.id === id));
    return [
      { href: "shop.html", label: t("nav.shop"), key: "shop" },
      ...cats.map((c) => ({ href: `shop.html?c=${c.id}`, label: L(c.name), key: "cat:" + c.id })),
      { href: "stores.html", label: t("nav.stores"), key: "stores" },
    ];
  }
  function isActive(key) {
    const { page, params } = route();
    if (key === "stores") return page === "stores";
    if (key === "shop") return page === "shop" && !params.get("c");
    if (key.startsWith("cat:")) return page === "shop" && params.get("c") === key.slice(4);
    return false;
  }

  function renderHeader() {
    const c = country();
    const msgs = [t("announce.1", { amount: money(country().freeOver) }), t("announce.2"), t("announce.3")];
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
              ${links.map((l) => `<a href="${l.href}"${isActive(l.key) ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`).join("")}
            </nav>
          </div>
          <a class="logo" href="index.html" aria-label="wepink ${esc(L(D.config.region))}">
            <img src="assets/brand/logo.svg" alt="wepink" width="132" height="38">
            <span class="logo-region">${esc(L(D.config.region))}</span>
          </a>
          <div class="header-end">
            <button class="chip-btn region-btn" type="button" data-open="region" aria-label="${esc(t("nav.region"))}: ${esc(L(c.name))}">
              ${icon("globe")}<span>${esc(L(c.short))} · ${esc(c.symbol[state.lang])}</span>
            </button>
            <button class="chip-btn lang-btn" type="button" data-lang-toggle lang="${state.lang === "ar" ? "en" : "ar"}" aria-label="${esc(t("nav.languageLabel"))}"><span class="lang-full">${esc(t("nav.language"))}</span><span class="lang-short" aria-hidden="true">${state.lang === "ar" ? "EN" : "ع"}</span></button>
            <button class="icon-btn search-end" type="button" data-open="search" aria-label="${esc(t("nav.search"))}">${icon("search")}</button>
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
              <a href="stores.html">${esc(t("footer.storesLink"))}</a>
              <button class="footer-region" type="button" data-open="region">${icon("globe")}<span>${esc(L(c.name))} · ${esc(c.currency)}</span></button>
            </nav>
          </div>
          <div class="footer-pay">
            <span>${esc(t("footer.weAccept"))}</span>
            <ul>${payBadges(c.pay)}</ul>
          </div>
          <div class="footer-bottom">
            <p>${esc(t("footer.rights", { year }))}</p>
            <p><a href="help.html">${esc(t("footer.privacy"))}</a> · <a href="help.html">${esc(t("footer.terms"))}</a></p>
          </div>
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
          <a href="shop.html?c=hair-mist">${esc(L(D.categories.find((x) => x.id === "hair-mist").name))}${icon("arrow", "flip")}</a>
          <a href="about.html">${esc(t("nav.about"))}${icon("arrow", "flip")}</a>
          <a href="help.html">${esc(t("nav.help"))}${icon("arrow", "flip")}</a>
        </nav>
        <div class="menu-foot">
          <button class="chip-btn" type="button" data-open="region">${icon("globe")}<span>${esc(L(c.name))} · ${esc(c.currency)}</span></button>
          <button class="chip-btn" type="button" data-lang-toggle lang="${state.lang === "ar" ? "en" : "ar"}">${esc(t("nav.language"))}</button>
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

      <div class="toasts" id="toasts" role="status" aria-live="polite"></div>`;
    renderBagDrawer();
    renderSearch("");
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
      <ul class="bag-lines">
        ${items
          .map(
            (i) => `<li class="bag-line">
          <a class="bag-thumb" href="product.html?id=${encodeURIComponent(i.p.id)}" tabindex="-1" aria-hidden="true">${media(i.p, "media-sm")}</a>
          <div class="bag-info">
            <p class="bag-name"><a href="product.html?id=${encodeURIComponent(i.p.id)}">${esc(i.p.line)}</a></p>
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
        <div class="bag-total"><span>${esc(t("bag.subtotal"))}</span><strong>${esc(money(sub))}</strong></div>
        <a class="btn btn-primary btn-block" href="checkout.html">${esc(t("bag.checkout"))}${icon("arrow", "flip")}</a>
        <ul class="pay-row">${payBadges(country().pay)}</ul>
      </div>`;
  }

  function renderSearch(q) {
    const el = document.getElementById("search-results");
    if (!el) return;
    const query = q.trim().toLowerCase();
    if (!query) {
      const popular = ["Obsessed", "Vanilla", "VF", "Pink Oud", L(D.categories[4].name)];
      el.innerHTML = `<p class="eyebrow">${esc(t("search.popular"))}</p>
        <div class="pill-row">${popular.map((w) => `<button class="pill" type="button" data-search="${esc(w)}">${esc(w)}</button>`).join("")}</div>`;
      return;
    }
    const words = query.split(/\s+/);
    const score = (p) => {
      const cat = D.categories.find((c) => c.id === p.cat).name;
      const fields = [
        [3, [p.line]],
        [2, [p.typeName.en, p.typeName.ar, cat.en, cat.ar, D.families[p.family].en, D.families[p.family].ar]],
        [1, [].concat(...Object.values(p.notes).map((arr) => arr.flat()))],
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
            <span class="search-text"><strong>${esc(p.line)}</strong><span class="muted small">${esc(L(p.typeName))} · ${esc(sizeText(p))}</span></span>
            <span class="price">${esc(money(priceOf(p)))}</span></a></li>`
          )
          .join("")}</ul>`
      : `<p class="muted search-none">${esc(t("search.empty", { q }))}</p>`;
  }

  function open(name) {
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
          ? { key: "family", title: t("quiz.q1"), opts: [["sweet", t("quiz.q1a"), "#E6007E"], ["floral", t("quiz.q1b"), "#F06FA8"], ["fresh", t("quiz.q1c"), "#1FA5C9"], ["warm", t("quiz.q1d"), "#5E0B33"]] }
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
      const typeCat = { splash: "body-splash", perfume: "perfume", set: "gift-sets" }[wear];
      const pool = D.products.filter((p) => p.family === family);
      const best = pool.find((p) => p.cat === typeCat) || pool[0] || D.products[0];
      const also = pool.filter((p) => p !== best).slice(0, 2);
      const body = document.getElementById("quiz-body");
      body.innerHTML = `<p class="eyebrow">${esc(t("quiz.result"))}</p>
        <div class="quiz-result">
          ${media(best, "media-quiz")}
          <div>
            <p class="card-type">${esc(L(best.typeName))} · ${esc(L(D.families[best.family]))}</p>
            <h3 class="quiz-name">${esc(best.line)}</h3>
            <p class="muted">${esc(L(best.desc))}</p>
            <div class="quiz-actions">
              <span class="price-lg">${esc(money(priceOf(best)))}</span>
              <button class="btn btn-primary" type="button" data-add="${esc(best.id)}">${esc(t("pdp.add"))}</button>
            </div>
          </div>
        </div>
        ${also.length ? `<p class="eyebrow quiz-also">${esc(t("quiz.also"))}</p><div class="quiz-mini">${also.map((p) => `<a href="product.html?id=${encodeURIComponent(p.id)}">${media(p, "media-xs")}<span><strong>${esc(p.line)}</strong><span class="muted small">${esc(L(p.typeName))}</span></span></a>`).join("")}</div>` : ""}
        <button class="link-btn" type="button" data-quiz-restart>${esc(t("quiz.restart"))}</button>`;
    },
  };

  /* ---------- events ---------- */
  function bind() {
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
      const el = e.target.closest("[data-open],[data-close],[data-add],[data-qty],[data-remove],[data-lang-toggle],[data-country],[data-search],[data-quiz],[data-quiz-restart]");
      if (!el) return;
      if (el.hasAttribute("data-open")) {
        e.preventDefault();
        open(el.getAttribute("data-open"));
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
  }
  function setCountry(code) {
    state.country = code;
    store.set("country", code);
    closeAll(true);
    render();
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

  /* ---------- render ---------- */
  function render() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    const page = route().page;
    document.body.dataset.page = page;
    renderHeader();
    renderLayers();
    // A fresh <main> each render, so page listeners never pile up.
    const old = document.getElementById("main");
    const main = old.cloneNode(false);
    old.replaceWith(main);
    const fn = window.WP_PAGES && window.WP_PAGES[page];
    if (fn) {
      const title = fn(main);
      document.title = title ? `${title} · wepink ${L(D.config.region)}` : `wepink ${L(D.config.region)} — ${t("meta.tagline")}`;
    }
    renderFooter();
    reveal();
  }

  function init() {
    bind();
    render();
  }

  return { init, render, route, SINGLE, state, store, t, L, esc, icon, money, local, moneyAED, priceOf, product, country, bag, card, media, badge, priceHTML, sizeText, open, closeAll, toast, data: D, art: ART };
})();

document.addEventListener("DOMContentLoaded", () => window.WP.init());
