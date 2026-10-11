/* wepink Gulf — page bodies. Each function fills <main> and returns the page title. */
window.WP_PAGES = (function () {
  const W = window.WP;
  const D = W.data;
  const { t, L, esc, icon, money, local, moneyAED, priceOf, card, media, badge, priceHTML, sizeText } = W;
  const byId = (id) => D.products.find((p) => p.id === id);
  const cat = (id) => D.categories.find((c) => c.id === id);
  const featured = () => [...D.products].sort((a, b) => (b.badge === "bestseller") - (a.badge === "bestseller"));

  function crumbs(items) {
    return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
      .map((it, i) => (i < items.length - 1 ? `<li><a href="${it[1]}">${esc(it[0])}</a></li>` : `<li aria-current="page">${esc(it[0])}</li>`))
      .join("")}</ol></nav>`;
  }

  function perks() {
    const list = [
      ["truck", t("perk.delivery"), t("perk.deliveryB", { amount: money(W.country().freeOver) })],
      ["cash", t("perk.cod"), t("perk.codB")],
      ["split", t("perk.bnpl"), t("perk.bnplB")],
      ["returns", t("perk.returns"), t("perk.returnsB", { days: D.config.returnsDays })],
    ];
    return `<section class="perks" aria-label="Services"><div class="container perks-grid">${list
      .map(([ic, a, b]) => `<div class="perk">${icon(ic)}<div><p class="perk-title">${esc(a)}</p><p class="perk-text">${esc(b)}</p></div></div>`)
      .join("")}</div></section>`;
  }

  function sealText() {
    return "NOW IN THE GULF  ✦  ".repeat(3);
  }

  /* ---------------- home ---------------- */
  function home(main) {
    const hero = byId("obsessed-body-splash");
    const best = featured().slice(0, 8);
    const sets = D.products.filter((p) => p.cat === "gift-sets");
    const fromSet = Math.min(...sets.map((p) => p.price));
    const ritual = [byId("obsessed-body-lotion"), byId("obsessed-body-splash"), byId("vf-eau-de-parfum")];
    const catArt = { "body-splash": "liberte-body-splash", perfume: "vf-eau-de-parfum", "body-care": "vanilla-body-butter", "hair-mist": "obsessed-hair-mist", "gift-sets": "obsessed-ritual-set" };
    const cities = [...new Map(D.stores.map((s) => [s.city[0], s])).values()];

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow eyebrow-pill">${icon("sparkle")}${esc(t("hero.eyebrow"))}</p>
            <h1 class="display">${esc(t("hero.title1"))} <em class="accent">${esc(t("hero.title2"))}</em></h1>
            <p class="lead">${esc(t("hero.lead"))}</p>
            <div class="btn-row">
              <a class="btn btn-primary btn-lg" href="shop.html">${esc(t("hero.cta1"))}${icon("arrow", "flip")}</a>
              <button class="btn btn-ghost btn-lg" type="button" data-open="quiz">${icon("sparkle")}${esc(t("hero.cta2"))}</button>
            </div>
            <dl class="hero-stats">
              <div><dt>${esc(t("hero.stat1"))}</dt><dd>${esc(t("hero.stat1b"))}</dd></div>
              <div><dt>${esc(t("hero.stat2"))}</dt><dd>${esc(t("hero.stat2b"))}</dd></div>
            </dl>
          </div>
          <div class="hero-visual">
            <div class="hero-panel" aria-hidden="true">
              <span class="hero-ring r1"></span><span class="hero-ring r2"></span>
              <span class="hero-word">pink</span>
              <div class="hero-bottle hb-1">${W.art.art(byId("obsessed-body-lotion"))}</div>
              <div class="hero-bottle hb-2">${W.art.art(byId("vf-eau-de-parfum"))}</div>
              <div class="hero-bottle hb-3">${W.art.art(hero)}</div>
              <svg class="hero-seal" viewBox="0 0 200 200" direction="ltr">
                <defs><path id="seal-path" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
                <circle cx="100" cy="100" r="96" fill="#1C0A14"/>
                <text font-size="15.5" font-weight="700" letter-spacing="2.4" fill="#fff"><textPath href="#seal-path">${esc(sealText())}</textPath></text>
                <text x="100" y="112" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="34" fill="#FF8CC6">we</text>
              </svg>
            </div>
            <a class="hero-card" href="product.html?id=${hero.id}">
              ${media(hero, "media-xs")}
              <span class="hero-card-text">
                <span class="eyebrow">${esc(t("hero.cardEyebrow"))}</span>
                <strong>${esc(hero.line)} ${esc(L(hero.typeName))}</strong>
                <span class="price">${esc(money(priceOf(hero)))}</span>
              </span>
              <span class="hero-card-go">${icon("arrow", "flip")}</span>
            </a>
          </div>
        </div>
      </section>

      <div class="marquee" aria-hidden="true"><div class="marquee-track">${`<span>${esc(t("marquee"))}</span><span class="marquee-dot">✦</span>`.repeat(8)}</div></div>

      ${perks()}

      <section class="section" aria-labelledby="cats-title">
        <div class="container">
          <div class="section-head" data-reveal>
            <div><h2 id="cats-title" class="h2">${esc(t("home.catsTitle"))}</h2><p class="muted">${esc(t("home.catsLead"))}</p></div>
            <a class="link-arrow" href="shop.html">${esc(t("home.viewAll"))}${icon("arrow", "flip")}</a>
          </div>
          <div class="cat-grid">
            ${D.categories
              .map((c, i) => {
                const p = byId(catArt[c.id]);
                return `<a class="cat-tile" href="shop.html?c=${c.id}" style="--c:${p.color};--c2:${p.color2};--d:${i * 60}ms" data-reveal>
                  <span class="cat-art">${W.art.art(p)}</span>
                  <span class="cat-text"><strong>${esc(L(c.name))}</strong><span>${esc(L(c.blurb))}</span></span>
                  <span class="cat-go">${icon("arrow", "flip")}</span>
                </a>`;
              })
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section-tint" aria-labelledby="best-title">
        <div class="container">
          <div class="section-head" data-reveal>
            <div><h2 id="best-title" class="h2">${esc(t("home.bestTitle"))}</h2><p class="muted">${esc(t("home.bestLead"))}</p></div>
            <a class="link-arrow" href="shop.html">${esc(t("home.viewAll"))}${icon("arrow", "flip")}</a>
          </div>
          <div class="product-rail">${best.map(card).join("")}</div>
        </div>
      </section>

      <section class="section ritual" aria-labelledby="ritual-title">
        <div class="container">
          <div class="ritual-head" data-reveal>
            <p class="eyebrow eyebrow-light">${esc(t("home.ritualEyebrow"))}</p>
            <h2 id="ritual-title" class="h2">${esc(t("home.ritualTitle"))}</h2>
            <p class="lead-light">${esc(t("home.ritualLead"))}</p>
          </div>
          <ol class="ritual-steps">
            ${ritual
              .map(
                (p, i) => `<li class="ritual-step" data-reveal style="--d:${i * 90}ms">
                <span class="ritual-num">0${i + 1}</span>
                ${media(p, "media-ritual")}
                <h3>${esc(t("home.ritual" + (i + 1)))}</h3>
                <p>${esc(t("home.ritual" + (i + 1) + "b"))}</p>
                <a href="product.html?id=${p.id}" class="ritual-link">${esc(p.line)} ${esc(L(p.typeName))} · ${esc(money(priceOf(p)))}</a>
              </li>`
              )
              .join("")}
          </ol>
          <div class="ritual-cta" data-reveal><a class="btn btn-light btn-lg" href="product.html?id=obsessed-ritual-set">${esc(t("home.ritualCta"))}${icon("arrow", "flip")}</a></div>
        </div>
      </section>

      <section class="section" aria-label="${esc(t("home.quizTitle"))}">
        <div class="container duo">
          <article class="promo promo-quiz" data-reveal>
            <div class="promo-copy">
              <p class="eyebrow">${esc(t("home.quizEyebrow"))}</p>
              <h2 class="h3">${esc(t("home.quizTitle"))}</h2>
              <p>${esc(t("home.quizLead"))}</p>
              <button class="btn btn-dark" type="button" data-open="quiz">${esc(t("home.quizCta"))}${icon("arrow", "flip")}</button>
            </div>
            <div class="promo-art promo-art-quiz">
              <span class="dot-swatch" style="--s:#E6007E"></span><span class="dot-swatch" style="--s:#F06FA8"></span><span class="dot-swatch" style="--s:#1FA5C9"></span><span class="dot-swatch" style="--s:#5E0B33"></span>
            </div>
          </article>
          <article class="promo promo-gift" data-reveal style="--d:90ms">
            <div class="promo-copy">
              <p class="eyebrow">${esc(t("home.giftEyebrow"))}</p>
              <h2 class="h3">${esc(t("home.giftTitle"))}</h2>
              <p>${esc(t("home.giftLead", { amount: moneyAED(fromSet) }))}</p>
              <a class="btn btn-primary" href="shop.html?c=gift-sets">${esc(t("home.giftCta"))}${icon("arrow", "flip")}</a>
            </div>
            <div class="promo-art">${W.art.art(byId("eid-gift-box"))}</div>
          </article>
        </div>
      </section>

      <section class="section section-tint stores-teaser" aria-labelledby="stores-title">
        <div class="container stores-teaser-grid">
          <div data-reveal>
            <p class="eyebrow">${esc(t("home.storesEyebrow"))}</p>
            <h2 id="stores-title" class="h2">${esc(t("home.storesTitle"))}</h2>
            <p class="muted">${esc(t("home.storesLead"))}</p>
            <a class="btn btn-dark" href="stores.html">${esc(t("home.storesCta"))}${icon("arrow", "flip")}</a>
          </div>
          <ul class="city-cloud" data-reveal>
            ${cities.map((s) => `<li>${icon("pin")}<span><strong>${esc(L(s.city))}</strong><em>${esc(L(D.countries[s.country].short))} · ${esc(t("stores.soon"))}</em></span></li>`).join("")}
          </ul>
        </div>
      </section>

      <section class="section newsletter" aria-labelledby="news-title">
        <div class="container news-grid">
          <div data-reveal>
            <h2 id="news-title" class="h2">${esc(t("home.newsTitle"))}</h2>
            <p>${esc(t("home.newsLead"))}</p>
          </div>
          <div data-reveal>
            <form class="news-form" novalidate>
              <label class="sr-only" for="news-email">${esc(t("home.newsEmail"))}</label>
              <input id="news-email" type="email" required autocomplete="email" placeholder="${esc(t("home.newsEmail"))}">
              <button class="btn btn-dark" type="submit">${esc(t("home.newsCta"))}</button>
            </form>
            <p class="news-msg" role="status"></p>
            <div class="news-social">
              <span class="news-tag">${esc(t("home.socialTitle"))}</span>
              <a class="icon-btn icon-btn-light" href="${D.config.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon("insta")}</a>
              <a class="icon-btn icon-btn-light" href="${D.config.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${icon("tiktok")}</a>
            </div>
          </div>
        </div>
      </section>`;

    const form = main.querySelector(".news-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const msg = main.querySelector(".news-msg");
      if (!/^\S+@\S+\.\S+$/.test(input.value.trim())) {
        input.setAttribute("aria-invalid", "true");
        msg.textContent = t("co.invalidEmail");
        return;
      }
      input.removeAttribute("aria-invalid");
      W.store.set("newsletter", input.value.trim());
      form.reset();
      msg.textContent = t("home.newsThanks");
    });
    return "";
  }

  /* ---------------- shop ---------------- */
  function shop(main) {
    const params = W.route().params;
    const s = { c: params.get("c") || "", f: params.get("f") || "", sort: params.get("sort") || "featured" };
    if (s.c && !cat(s.c)) s.c = "";
    const c = s.c ? cat(s.c) : null;

    function list() {
      let items = featured().filter((p) => (!s.c || p.cat === s.c) && (!s.f || p.family === s.f));
      if (s.sort === "low") items = items.sort((a, b) => a.price - b.price);
      if (s.sort === "high") items = items.sort((a, b) => b.price - a.price);
      return items;
    }
    function sync() {
      const q = new URLSearchParams();
      if (s.c) q.set("c", s.c);
      if (s.f) q.set("f", s.f);
      if (s.sort !== "featured") q.set("sort", s.sort);
      const query = q.toString() ? "?" + q : "";
      history.replaceState(null, "", W.SINGLE ? "#/shop" + query : "shop.html" + query);
    }
    function draw() {
      const items = list();
      main.querySelector("#shop-count").textContent = t("shop.count", { n: items.length });
      main.querySelector("#shop-grid").innerHTML = items.length
        ? items.map(card).join("")
        : `<div class="empty-state"><p>${esc(t("shop.empty"))}</p><button class="btn btn-ghost" type="button" data-reset>${esc(t("shop.reset"))}</button></div>`;
      main.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === s.c)));
      const cc = s.c ? cat(s.c) : null;
      main.querySelector("#shop-title").textContent = cc ? L(cc.name) : t("shop.title");
      document.title = `${cc ? L(cc.name) : t("shop.title")} · wepink ${L(D.config.region)}`;
      main.querySelector("#shop-lead").textContent = cc ? L(cc.blurb) : t("shop.lead");
      main.querySelector("#crumb-current").textContent = cc ? L(cc.name) : t("shop.title");
      document.querySelectorAll(".nav-primary a").forEach((a) => {
        const href = a.getAttribute("href");
        const on = s.c ? href === "shop.html?c=" + s.c : href === "shop.html";
        if (on) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    }

    main.innerHTML = `
      <section class="page-head">
        <div class="container">
          <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">wepink</a></li><li aria-current="page" id="crumb-current"></li></ol></nav>
          <h1 class="h1" id="shop-title"></h1>
          <p class="muted" id="shop-lead"></p>
        </div>
      </section>
      <div class="container shop-tools">
        <div class="pill-row" role="group" aria-label="${esc(t("footer.shop"))}">
          <button class="pill" type="button" data-cat="">${esc(t("shop.all"))}</button>
          ${D.categories.map((x) => `<button class="pill" type="button" data-cat="${x.id}">${esc(L(x.name))}</button>`).join("")}
        </div>
        <div class="shop-selects">
          <label class="select"><span class="sr-only">${esc(t("shop.family"))}</span>
            <select id="shop-family">
              <option value="">${esc(t("shop.anyFamily"))}</option>
              ${Object.keys(D.families).map((k) => `<option value="${k}"${s.f === k ? " selected" : ""}>${esc(L(D.families[k]))}</option>`).join("")}
            </select>${icon("chevron")}
          </label>
          <label class="select"><span class="sr-only">${esc(t("shop.sort"))}</span>
            <select id="shop-sort">
              <option value="featured"${s.sort === "featured" ? " selected" : ""}>${esc(t("shop.sortFeatured"))}</option>
              <option value="low"${s.sort === "low" ? " selected" : ""}>${esc(t("shop.sortLow"))}</option>
              <option value="high"${s.sort === "high" ? " selected" : ""}>${esc(t("shop.sortHigh"))}</option>
            </select>${icon("chevron")}
          </label>
        </div>
      </div>
      <div class="container">
        <p class="muted small shop-count" id="shop-count" aria-live="polite"></p>
        <div class="product-grid" id="shop-grid"></div>
      </div>
      ${perks()}`;

    main.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat],[data-reset]");
      if (!b) return;
      if (b.hasAttribute("data-reset")) {
        s.c = "";
        s.f = "";
        main.querySelector("#shop-family").value = "";
      } else s.c = b.dataset.cat;
      sync();
      draw();
    });
    main.querySelector("#shop-family").addEventListener("change", (e) => {
      s.f = e.target.value;
      sync();
      draw();
    });
    main.querySelector("#shop-sort").addEventListener("change", (e) => {
      s.sort = e.target.value;
      sync();
      draw();
    });
    draw();
    return c ? L(c.name) : t("shop.title");
  }

  /* ---------------- product ---------------- */
  function product(main) {
    const p = byId(W.route().params.get("id"));
    if (!p) {
      main.innerHTML = `<section class="section"><div class="container empty-state"><h1 class="h2">${esc(t("pdp.notFound"))}</h1><a class="btn btn-primary" href="shop.html">${esc(t("pdp.back"))}</a></div></section>`;
      return t("pdp.notFound");
    }
    const c = W.country();
    const cc = cat(p.cat);
    const how = { splash: "howSplash", perfume: "howPerfume", lotion: "howLotion", butter: "howLotion", mist: "howMist", set: "howSet" }[p.type];
    const related = [
      ...D.products.filter((x) => x !== p && x.line.split(" ")[0] === p.line.split(" ")[0]),
      ...D.products.filter((x) => x !== p && x.family === p.family),
      ...featured(),
    ].filter((x, i, a) => x !== p && a.indexOf(x) === i).slice(0, 4);
    const each = c.decimals ? Math.round((priceOf(p) / 4) * 1000) / 1000 : Math.round((priceOf(p) / 4) * 100) / 100;
    const bnplOk = c.pay.includes("tabby");
    const noteRow = (k) => `<div class="note-row"><dt>${esc(t("pdp." + k))}</dt><dd>${p.notes[k].map((n) => `<span class="note">${esc(L(n))}</span>`).join("")}</dd></div>`;
    const eachText = Number(each).toLocaleString("en-US", { minimumFractionDigits: c.decimals || 2, maximumFractionDigits: c.decimals || 2 });

    main.innerHTML = `
      <div class="container">
        ${crumbs([["wepink", "index.html"], [L(cc.name), "shop.html?c=" + cc.id], [p.line]])}
      </div>
      <section class="container pdp">
        <div class="pdp-gallery">
          <div class="pdp-media" style="--c:${p.color};--c2:${p.color2}">
            ${badge(p)}
            ${W.art.art(p)}
          </div>
        </div>
        <div class="pdp-info">
          <p class="card-type">${esc(L(p.typeName))} · ${esc(L(D.families[p.family]))}</p>
          <h1 class="h1 pdp-title">${esc(p.line)}</h1>
          <p class="pdp-size">${esc(sizeText(p))}</p>
          <div class="pdp-price">${priceHTML(p)}</div>
          <p class="muted small">${esc(c.vat ? t("pdp.vat") : t("pdp.vatNone", { country: L(c.short) }))}</p>
          ${bnplOk ? `<p class="bnpl">${icon("split")}<span>${esc(t("pdp.bnpl", { amount: (W.state.lang === "ar" ? `${eachText} ${c.symbol.ar}` : `${c.symbol.en} ${eachText}`) }))}</span></p>` : ""}
          <p class="pdp-desc">${esc(L(p.desc))}</p>

          <div class="pdp-buy">
            <div class="stepper stepper-lg" role="group" aria-label="${esc(t("pdp.qty"))}">
              <button type="button" data-step="-1" aria-label="${esc(t("bag.decrease"))}">${icon("minus")}</button>
              <span data-qty-value aria-live="polite">1</span>
              <button type="button" data-step="1" aria-label="${esc(t("bag.increase"))}">${icon("plus")}</button>
            </div>
            <button class="btn btn-primary btn-lg btn-grow" type="button" data-add="${esc(p.id)}">${icon("bag")}${esc(t("pdp.add"))} · ${esc(money(priceOf(p)))}</button>
          </div>

          <ul class="pdp-service">
            <li>${icon("truck")}<span><strong>${esc(t("pdp.delivery", { country: L(c.short) }))}</strong>${esc(L(c.delivery))} · ${esc(t("pdp.freeOver", { amount: money(W.country().freeOver) }))}</span></li>
            <li>${icon("cash")}<span><strong>${esc(t("pdp.cod"))}</strong>${esc(t("perk.codB"))}</span></li>
            <li>${icon("returns")}<span><strong>${esc(t("perk.returns"))}</strong>${esc(t("perk.returnsB", { days: D.config.returnsDays }))} · ${esc(t("bag.giftNote"))}</span></li>
          </ul>

          <div class="accordion">
            <details open>
              <summary>${esc(t("pdp.notes"))}${icon("chevron")}</summary>
              <dl class="notes">${noteRow("top")}${noteRow("heart")}${noteRow("base")}</dl>
            </details>
            <details>
              <summary>${esc(t("pdp.how"))}${icon("chevron")}</summary>
              <p>${esc(t("pdp." + how))}</p>
            </details>
            <details>
              <summary>${esc(t("pdp.details"))}${icon("chevron")}</summary>
              <p>${esc(t("pdp.detailsBody"))}</p>
            </details>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="ritual-more">
        <div class="container">
          <div class="section-head"><h2 id="ritual-more" class="h2">${esc(t("pdp.ritual"))}</h2></div>
          <div class="product-rail">${related.map(card).join("")}</div>
        </div>
      </section>`;

    const qtyEl = main.querySelector("[data-qty-value]");
    main.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = Math.max(1, Math.min(20, parseInt(qtyEl.textContent, 10) + parseInt(b.dataset.step, 10)));
        qtyEl.textContent = v;
      })
    );

    // Product structured data for search engines.
    let ld = document.getElementById("ld-product");
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "ld-product";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: `wepink ${p.line} ${p.typeName.en}`,
      brand: { "@type": "Brand", name: "wepink" },
      description: p.desc.en,
      offers: { "@type": "Offer", priceCurrency: c.currency, price: priceOf(p), availability: "https://schema.org/InStock" },
    });
    return `${p.line} ${L(p.typeName)}`;
  }

  /* ---------------- stores ---------------- */
  function stores(main) {
    let filter = "";
    const allCities = [...new Map(D.stores.map((s) => [s.city[0], s])).values()];
    const c = W.country();

    function draw() {
      const list = D.stores.filter((s) => !filter || s.country === filter).sort((a, b) => (b.country === W.state.country) - (a.country === W.state.country));
      main.querySelector("#store-grid").innerHTML = list
        .map(
          (s) => `<article class="store-card">
          <div class="store-top"><span class="badge badge-soon">${esc(t("stores.soon"))}</span><span class="store-country">${esc(L(D.countries[s.country].short))}</span></div>
          <h3>${esc(L(s.city))}</h3>
          <p class="muted">${esc(L(s.label))}</p>
          <button class="link-arrow" type="button" data-notify="${esc(s.city[0])}">${esc(t("stores.notify"))}${icon("arrow", "flip")}</button>
        </article>`
        )
        .join("");
      main.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    }

    main.innerHTML = `
      <section class="page-head page-head-pink">
        <div class="container">
          ${crumbs([["wepink", "index.html"], [t("stores.title")]])}
          <h1 class="h1">${esc(t("stores.title"))}</h1>
          <p class="lead">${esc(t("stores.lead"))}</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="pill-row" role="group" aria-label="${esc(t("co.country"))}">
            <button class="pill" type="button" data-filter="">${esc(t("stores.allCountries"))}</button>
            ${Object.keys(D.countries).map((k) => `<button class="pill" type="button" data-filter="${k}">${esc(L(D.countries[k].short))}</button>`).join("")}
          </div>
          <div class="store-grid" id="store-grid"></div>
        </div>
      </section>
      <section class="section section-tint" id="notify">
        <div class="container form-split">
          <div>
            <h2 class="h2">${esc(t("stores.formTitle"))}</h2>
            <p class="muted">${esc(t("stores.formLead"))}</p>
            <div class="partner-box">
              <h3>${esc(t("stores.partnerTitle"))}</h3>
              <p class="muted">${esc(t("stores.partnerLead"))}</p>
              <a class="link-arrow" href="mailto:${D.config.email}">${icon("mail")}<span dir="ltr">${esc(D.config.email)}</span></a>
            </div>
          </div>
          <form class="card-form" id="notify-form" novalidate>
            <div class="field"><label for="n-name">${esc(t("stores.name"))}</label><input id="n-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="n-phone">${esc(t("stores.phone"))}</label>
              <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input id="n-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" required></div>
            </div>
            <div class="field"><label for="n-city">${esc(t("stores.city"))}</label>
              <label class="select select-block"><select id="n-city" name="city">${allCities.map((s) => `<option value="${esc(s.city[0])}">${esc(L(s.city))} — ${esc(L(D.countries[s.country].short))}</option>`).join("")}</select>${icon("chevron")}</label>
            </div>
            <button class="btn btn-primary btn-block btn-lg" type="submit">${esc(t("stores.submit"))}</button>
            <p class="form-msg" role="status"></p>
          </form>
        </div>
      </section>`;

    main.addEventListener("click", (e) => {
      const f = e.target.closest("[data-filter]");
      if (f) {
        filter = f.dataset.filter;
        draw();
      }
      const n = e.target.closest("[data-notify]");
      if (n) {
        main.querySelector("#n-city").value = n.dataset.notify;
        main.querySelector("#notify").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => main.querySelector("#n-name").focus({ preventScroll: true }), 400);
      }
    });
    const form = main.querySelector("#notify-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = validate(form);
      if (!ok) return;
      const name = form.name.value.trim();
      const cityKey = form.city.value;
      const city = L(D.stores.find((s) => s.city[0] === cityKey).city);
      const list = W.store.get("interest", []);
      list.push({ name, phone: c.dial + form.phone.value.trim(), city: cityKey, at: Date.now() });
      W.store.set("interest", list);
      form.reset();
      form.querySelector(".form-msg").textContent = t("stores.thanks", { name: name.split(" ")[0], city });
    });
    draw();
    return t("stores.title");
  }

  /* ---------------- about ---------------- */
  function about(main) {
    const vals = [["heart", "v1"], ["sparkle", "v2"], ["leaf", "v3"], ["pin", "v4"]];
    main.innerHTML = `
      <section class="about-hero">
        <div class="container about-grid">
          <div>
            ${crumbs([["wepink", "index.html"], [t("about.eyebrow")]])}
            <p class="eyebrow">${esc(t("about.eyebrow"))}</p>
            <h1 class="h1 about-title">${esc(t("about.title"))}</h1>
            <p class="lead">${esc(t("about.p1"))}</p>
            <p class="muted">${esc(t("about.p2"))}</p>
            <a class="btn btn-primary btn-lg" href="shop.html">${esc(t("about.cta"))}${icon("arrow", "flip")}</a>
          </div>
          <div class="about-visual" aria-hidden="true">
            ${["vanilla-body-splash", "pink-oud-eau-de-parfum", "liberte-body-lotion", "aqua-body-splash"].map((id, i) => `<div class="about-tile t${i + 1}" style="--c:${byId(id).color};--c2:${byId(id).color2}">${W.art.art(byId(id))}</div>`).join("")}
          </div>
        </div>
      </section>
      <section class="section section-tint">
        <div class="container">
          <h2 class="h2 center">${esc(t("about.valuesTitle"))}</h2>
          <div class="values">${vals
            .map(([ic, k], i) => `<div class="value" data-reveal style="--d:${i * 70}ms"><span class="value-icon">${icon(ic)}</span><h3>${esc(t("about." + k))}</h3><p class="muted">${esc(t("about." + k + "b"))}</p></div>`)
            .join("")}</div>
        </div>
      </section>
      ${perks()}`;
    return t("about.eyebrow");
  }

  /* ---------------- help ---------------- */
  function help(main) {
    const faqs = [1, 2, 3, 4, 5, 6];
    const vars = { free: money(W.country().freeOver), fee: money(W.country().fee), days: D.config.returnsDays };
    main.innerHTML = `
      <section class="page-head">
        <div class="container">
          ${crumbs([["wepink", "index.html"], [t("help.title")]])}
          <h1 class="h1">${esc(t("help.title"))}</h1>
          <p class="muted">${esc(t("help.lead"))}</p>
        </div>
      </section>
      <section class="container contact-grid">
        <a class="contact-card contact-wa" href="https://wa.me/${D.config.whatsapp}" target="_blank" rel="noopener">${icon("chat")}<strong>${esc(t("help.whatsapp"))}</strong><span>${esc(t("help.whatsappB"))}</span></a>
        <a class="contact-card" href="mailto:${D.config.email}">${icon("mail")}<strong>${esc(t("help.email"))}</strong><span dir="ltr">${esc(D.config.email)}</span></a>
        <div class="contact-card">${icon("clock")}<strong dir="ltr">10:00 – 22:00</strong><span>${esc(t("help.hours"))}</span></div>
      </section>
      <section class="section" id="faq">
        <div class="container narrow">
          <h2 class="h2">${esc(t("help.faqTitle"))}</h2>
          <div class="accordion accordion-lg">
            ${faqs.map((n, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(t("help.q" + n))}${icon("chevron")}</summary><p>${esc(t("help.a" + n, vars))}</p></details>`).join("")}
          </div>
        </div>
      </section>`;
    return t("help.title");
  }

  /* ---------------- checkout ---------------- */
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

  // Clear a field's error as soon as the shopper fixes it.
  document.addEventListener("input", (e) => {
    const input = e.target;
    if (input.getAttribute && input.getAttribute("aria-invalid") === "true" && input.value.trim()) {
      input.removeAttribute("aria-invalid");
      const err = input.closest(".field") && input.closest(".field").querySelector(".field-error");
      if (err) err.textContent = "";
    }
  });

  let checkoutBound = false;
  function checkout(main) {
    const c = W.country();
    if (!W.bag.count()) {
      main.innerHTML = `<section class="section"><div class="container empty-state"><div class="bag-empty-icon">${icon("bag")}</div><h1 class="h2">${esc(t("co.empty"))}</h1><a class="btn btn-primary" href="shop.html">${esc(t("bag.emptyCta"))}</a></div></section>`;
      return t("co.title");
    }

    function summary() {
      const sub = W.bag.subtotal();
      const del = W.bag.delivery();
      const total = sub + del;
      const vat = c.vat ? total - total / (1 + c.vat / 100) : 0;
      const vatText = c.decimals ? Math.round(vat * 1000) / 1000 : Math.round(vat * 100) / 100;
      return `<ul class="sum-lines">${W.bag
        .items()
        .map(
          (i) => `<li>
          <span class="sum-thumb">${media(i.p, "media-xs")}<span class="sum-qty">${i.qty}</span></span>
          <span class="sum-name"><strong>${esc(i.p.line)}</strong><span class="muted small">${esc(L(i.p.typeName))} · ${esc(sizeText(i.p))}</span></span>
          <span class="price">${esc(money(priceOf(i.p) * i.qty))}</span>
        </li>`
        )
        .join("")}</ul>
        <dl class="sum-totals">
          <div><dt>${esc(t("bag.subtotal"))}</dt><dd>${esc(money(sub))}</dd></div>
          <div><dt>${esc(t("co.delivery"))}</dt><dd>${del ? esc(money(del)) : `<span class="free">${esc(t("co.free"))}</span>`}</dd></div>
          <div class="sum-total"><dt>${esc(t("co.total"))}</dt><dd>${esc(money(total))}</dd></div>
        </dl>
        <p class="muted small">${esc(c.vat ? t("co.vatIncl", { rate: c.vat, amount: money(vatText) }) : t("co.vatNone"))}</p>`;
    }

    main.innerHTML = `
      <section class="container checkout">
        <div class="checkout-main">
          ${crumbs([["wepink", "index.html"], [t("bag.title"), "shop.html"], [t("co.title")]])}
          <h1 class="h1">${esc(t("co.title"))}</h1>
          <p class="demo-note">${icon("shield")}<span>${esc(t("co.demo"))}</span></p>
          <form id="co-form" novalidate>
            <fieldset>
              <legend>${esc(t("co.contact"))}</legend>
              <div class="field"><label for="co-name">${esc(t("co.name"))}</label><input id="co-name" name="name" autocomplete="name" required></div>
              <div class="field-row">
                <div class="field"><label for="co-email">${esc(t("co.email"))}</label><input id="co-email" name="email" type="email" autocomplete="email" dir="ltr" required></div>
                <div class="field"><label for="co-phone">${esc(t("co.phone"))}</label>
                  <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" required></div>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>${esc(t("co.address"))}</legend>
              <div class="field field-country"><span class="label">${esc(t("co.country"))}</span>
                <div class="country-lock"><span>${icon("globe")}${esc(L(c.name))} · ${esc(c.currency)}</span><button class="link-btn" type="button" data-open="region">${esc(t("co.change"))}</button></div>
              </div>
              <div class="field-row">
                <div class="field"><label for="co-city">${esc(t("co.city"))}</label>
                  <label class="select select-block"><select id="co-city" name="city" required>${c.cities.map((x) => `<option value="${esc(x[0])}">${esc(L(x))}</option>`).join("")}</select>${icon("chevron")}</label>
                </div>
                <div class="field"><label for="co-area">${esc(t("co.area"))}</label><input id="co-area" name="area" autocomplete="address-level3" required></div>
              </div>
              <div class="field"><label for="co-street">${esc(t("co.street"))}</label><input id="co-street" name="street" autocomplete="address-line1" required></div>
              <div class="field-row">
                <div class="field"><label for="co-apt">${esc(t("co.apt"))}</label><input id="co-apt" name="apt" autocomplete="address-line2"></div>
                <div class="field"><label for="co-notes">${esc(t("co.notes"))}</label><input id="co-notes" name="notes"></div>
              </div>
              <p class="muted small delivery-line">${icon("truck")}<span>${esc(L(c.delivery))}</span></p>
            </fieldset>
            <fieldset>
              <legend>${esc(t("co.payment"))}</legend>
              <div class="pay-options">
                ${c.pay
                  .map(
                    (k, i) => `<label class="pay-option"><input type="radio" name="pay" value="${k}"${i === 0 ? " checked" : ""}><span class="pay-dot"></span><span>${esc(L(D.payNames[k]))}</span></label>`
                  )
                  .join("")}
              </div>
            </fieldset>
            <fieldset>
              <legend>${esc(t("co.gift"))}</legend>
              <div class="field"><label for="co-gift">${esc(t("co.giftNote"))}</label><textarea id="co-gift" name="gift" rows="3" maxlength="240" placeholder="${esc(t("co.giftPlaceholder"))}"></textarea></div>
            </fieldset>
            <button class="btn btn-primary btn-lg btn-block co-submit" type="submit">${icon("shield")}<span>${esc(t("co.place"))}</span></button>
          </form>
        </div>
        <aside class="checkout-side" aria-labelledby="sum-title">
          <div class="summary">
            <h2 id="sum-title" class="h3">${esc(t("co.summary"))}</h2>
            <div id="co-summary">${summary()}</div>
            <ul class="pay-row">${c.pay.map((k) => `<li class="pay-badge">${esc(L(D.payNames[k]).split(" — ")[0])}</li>`).join("")}</ul>
          </div>
        </aside>
      </section>`;

    if (!checkoutBound) {
      checkoutBound = true;
      document.addEventListener("wp:bag", () => {
        const el = document.getElementById("co-summary");
        if (el) el.innerHTML = summary();
      });
    }

    const form = main.querySelector("#co-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const btn = form.querySelector(".co-submit");
      btn.disabled = true;
      btn.querySelector("span").textContent = t("co.placing");
      const id = "WPG-" + String(Math.floor(100000 + Math.random() * 900000));
      const items = W.bag.items();
      const sub = W.bag.subtotal();
      const total = sub + W.bag.delivery();
      const f = Object.fromEntries(new FormData(form).entries());
      const phone = `${c.dial} ${f.phone}`;
      const lines = [
        t("co.waIntro", { id }),
        ...items.map((i) => `• ${i.qty} × ${i.p.line} ${L(i.p.typeName)} — ${money(priceOf(i.p) * i.qty)}`),
        `${t("co.total")}: ${money(total)}`,
        `${f.name} · ${phone}`,
        `${f.street}${f.apt ? ", " + f.apt : ""}, ${f.area}, ${f.city}, ${L(c.name)}`,
        `${t("co.payment")}: ${L(D.payNames[f.pay])}`,
        f.gift ? `${t("co.gift")}: ${f.gift}` : "",
      ].filter(Boolean);
      const wa = `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
      const orders = W.store.get("orders", []);
      orders.push({ id, at: Date.now(), country: W.state.country, items: items.map((i) => ({ id: i.p.id, qty: i.qty })), total, currency: c.currency });
      W.store.set("orders", orders);

      setTimeout(() => {
        W.bag.clear();
        main.innerHTML = `<section class="section"><div class="container thanks">
          <span class="thanks-icon">${icon("check")}</span>
          <h1 class="h1">${esc(t("co.thanksTitle", { name: f.name.split(" ")[0] }))}</h1>
          <p class="lead">${esc(t("co.thanksLead", { id, phone }))}</p>
          <div class="btn-row center">
            <a class="btn btn-primary btn-lg" href="${wa}" target="_blank" rel="noopener">${icon("chat")}${esc(t("co.thanksWa"))}</a>
            <a class="btn btn-ghost btn-lg" href="shop.html">${esc(t("co.thanksShop"))}</a>
          </div>
        </div></section>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 700);
    });
    return t("co.title");
  }

  return { home, shop, product, stores, about, help, checkout };
})();
