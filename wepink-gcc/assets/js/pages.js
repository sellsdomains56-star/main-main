/* wepink Gulf — page bodies. Each function fills <main> and returns the page title. */
window.WP_PAGES = (function () {
  const W = window.WP;
  const D = W.data;
  const { t, L, esc, icon, money, local, moneyAED, priceOf, card, media, badge, priceHTML, sizeText, pname, fullName } = W;
  const byId = (id) => D.products.find((p) => p.id === id);
  // Home-page picks fall back to another product from the same category when
  // one is hidden or removed in the admin panel.
  const myAmbassador = () => {
    const a = W.store.get("amb", null);
    return a && a.code && (a.token || !W.sync.live) ? a : null;
  };
  // Signed-in shoppers: fill in what their account already knows.
  function prefill(form) {
    const me = W.store.get("account", null);
    if (!form || !me) return;
    const set = (name, v) => form[name] && v && !form[name].value && (form[name].value = v);
    const dial = W.country().dial.replace(/\D/g, "");
    const ph = String(me.phone || "").replace(/\D/g, "");
    set("name", me.name);
    set("email", me.email);
    set("phone", ph.startsWith(dial) ? ph.slice(dial.length) : ph);
  }
  const pick = (id) => {
    const want = (window.WP_CATALOG || []).find((p) => p.id === id);
    return byId(id) || (want && D.products.find((p) => p.cat === want.cat)) || D.products[0];
  };
  const FRAG = (p) => !["makeup", "skincare", "haircare", "set", "bodycare"].includes(p.type);
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

  /* ---------------- shared visuals ---------------- */
  let satinId = 0;
  // Silk folds in black cherry and hot pink, drawn in SVG.
  function satin(variant) {
    const id = "st" + ++satinId;
    const flip = variant === "flip" ? ' transform="scale(-1 1) translate(-1440 0)"' : "";
    return `<svg class="satin" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#16030C"/><stop offset=".42" stop-color="#5A0632"/><stop offset=".6" stop-color="#E0187F"/>
          <stop offset=".7" stop-color="#FF8CC6"/><stop offset=".8" stop-color="#B0045E"/><stop offset="1" stop-color="#1A030E"/>
        </linearGradient>
        <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#12020A"/><stop offset=".38" stop-color="#7A0942"/><stop offset=".54" stop-color="#FF4FA3"/>
          <stop offset=".62" stop-color="#FFC9E2"/><stop offset=".72" stop-color="#C8086D"/><stop offset="1" stop-color="#14020B"/>
        </linearGradient>
        <radialGradient id="${id}g" cx=".74" cy=".36" r=".55">
          <stop offset="0" stop-color="#FF2E93" stop-opacity=".6"/><stop offset=".6" stop-color="#B0045E" stop-opacity=".12"/><stop offset="1" stop-color="#B0045E" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}s" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
        <filter id="${id}h" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="1440" height="900" fill="#0E0308"/>
      <g${flip}>
        <rect width="1440" height="900" fill="url(#${id}g)"/>
        <g filter="url(#${id}s)">
          <path d="M-120 600 C 220 420 520 800 900 600 S 1380 340 1560 460 L1560 1000 L-120 1000 Z" fill="url(#${id}a)" opacity=".92"/>
          <path d="M-120 730 C 260 590 640 930 1020 750 S 1420 590 1560 670 L1560 1000 L-120 1000 Z" fill="url(#${id}b)" opacity=".88"/>
          <path d="M-120 850 C 300 750 700 990 1100 870 S 1460 790 1560 830 L1560 1000 L-120 1000 Z" fill="#14020B" opacity=".92"/>
        </g>
        <g filter="url(#${id}h)" fill="none" stroke-linecap="round">
          <path d="M-60 588 C 240 440 540 780 900 592 S 1360 360 1520 460" stroke="#FFD1E6" stroke-opacity=".38" stroke-width="10"/>
          <path d="M-60 720 C 280 600 650 910 1020 742 S 1420 610 1520 670" stroke="#FFE3F0" stroke-opacity=".26" stroke-width="7"/>
        </g>
      </g>
    </svg>`;
  }
  // Twinkling stars at fixed, evenly scattered spots.
  function sparkles(n) {
    return Array.from({ length: n }, (_, i) => {
      const left = (i * 37 + 11) % 97;
      const top = (i * 53 + 7) % 88;
      const size = 6 + ((i * 5) % 11);
      const delay = ((i * 0.73) % 3.6).toFixed(2);
      // Keep them on the picture side, clear of the headline.
      return `<span class="sparkle" style="inset-inline-start:${50 + left / 2}%;top:${top}%;--s:${size}px;--delay:-${delay}s"></span>`;
    }).join("");
  }
  const notesLine = (p) => [].concat(...["top", "heart", "base"].map((k) => p.notes[k] || [])).slice(0, 3).map(L).join(" · ");
  function photo(key, alt, cls) {
    const src = D.config.photos && D.config.photos[key];
    return src ? `<img class="${cls || ""}" src="${esc(src)}" alt="${esc(alt)}" loading="${key === "virginiaHero" ? "eager" : "lazy"}" decoding="async">` : "";
  }

  /* ---------------- home ---------------- */
  function home(main) {
    const F = D.featured;
    const star = pick(F.star);
    const icons = F.icons.map(byId).filter(Boolean);
    const sets = D.products.filter((p) => p.cat === "gift-sets");
    const fromSet = sets.length ? Math.min(...sets.map(priceOf)) : 0;
    const ritual = F.ritual.map(byId).filter(Boolean);
    const vfLine = D.products.filter((p) => p.type === "colonia" && /^VF\b/.test(p.line)).slice(0, 8);
    const catArt = F.categories;
    const cities = [...new Map(D.stores.map((s) => [s.city[0], s])).values()];
    const tiers = D.config.referral.tiers;
    const heroPhoto = photo("virginiaHero", t("hn.photoCaption"));
    const portrait = photo("virginiaPortrait", t("hn.photoCaption"));
    const campaign = photo("campaign", "", "campaign-img");

    main.innerHTML = `
      <section class="hero-noir">
        ${satin()}
        <div class="grain" aria-hidden="true"></div>
        <div class="sparkles" aria-hidden="true">${sparkles(14)}</div>
        <div class="container hero-noir-grid">
          <div class="hero-noir-copy">
            <p class="eyebrow eyebrow-glow">${icon("sparkle")}${esc(t("hn.eyebrow"))}</p>
            <h1 class="display-noir">${esc(t("hn.title1"))} <em>${esc(t("hn.title2"))}</em></h1>
            <p class="lead-noir">${esc(t("hn.lead"))}</p>
            <div class="btn-row">
              <a class="btn btn-glow btn-lg" href="shop.html">${esc(t("hn.cta1"))}${icon("arrow", "flip")}</a>
              <button class="btn btn-glass btn-lg" type="button" data-open="quiz">${icon("sparkle")}${esc(t("hero.cta2"))}</button>
            </div>
            <ul class="hero-noir-meta">
              <li>${icon("truck")}${esc(t("hn.meta1"))}</li>
              <li>${icon("gift")}${esc(t("hn.meta2"))}</li>
              <li>${icon("cash")}${esc(t("hn.meta3"))}</li>
            </ul>
          </div>
          <div class="hero-noir-visual${heroPhoto ? " has-photo" : ""}">
            ${
              heroPhoto
                ? `<figure class="portrait-arch">${heroPhoto}<figcaption>${esc(t("hn.photoCaption"))}</figcaption></figure>
                   <div class="float-bottle" aria-hidden="true">${W.art.art(star, { eager: true })}</div>`
                : `<div class="stage" aria-hidden="true">
                    <span class="beam"></span><span class="halo"></span><span class="pedestal"></span>
                    <div class="stage-bottle sb-left">${W.art.art(pick(F.stage[0]), { eager: true })}</div>
                    <div class="stage-bottle sb-right">${W.art.art(pick(F.stage[2]), { eager: true })}</div>
                    <div class="stage-bottle sb-main">${W.art.art(pick(F.stage[1]), { eager: true })}</div>
                  </div>`
            }
            <a class="glass-card" href="product.html?id=${star.id}">
              ${media(star, "media-xs")}
              <span class="glass-card-text">
                <span class="eyebrow">${esc(t("hero.cardEyebrow"))}</span>
                <strong>${esc(pname(star))}</strong>
                <span class="price">${esc(money(priceOf(star)))}</span>
              </span>
              <span class="glass-card-go">${icon("arrow", "flip")}</span>
            </a>
          </div>
        </div>
      </section>

      <div class="marquee marquee-glow" aria-hidden="true"><div class="marquee-track">${`<span>${esc(t("marquee"))}</span><span class="marquee-dot">✦</span>`.repeat(6)}</div></div>

      <section class="section icons" aria-labelledby="icons-title">
        <div class="grain" aria-hidden="true"></div>
        <div class="container">
          <div class="section-head" data-reveal>
            <div><p class="eyebrow eyebrow-light">${esc(t("icons.eyebrow"))}</p><h2 id="icons-title" class="h2">${esc(t("icons.title"))}</h2></div>
            <a class="link-arrow link-light" href="shop.html">${esc(t("home.viewAll"))}${icon("arrow", "flip")}</a>
          </div>
          <div class="icon-grid">
            ${icons
              .map(
                (p, i) => `<article class="icon-card" style="--c:${p.color};--c2:${p.color2};--d:${i * 80}ms" data-reveal>
                <a class="icon-media" href="product.html?id=${p.id}" tabindex="-1" aria-hidden="true">${badge(p)}<span class="icon-glow"></span>${W.art.art(p)}</a>
                <div class="icon-body">
                  <p class="card-type">${esc(L(p.typeName))} · ${esc(sizeText(p))}</p>
                  <h3 class="icon-name"><a href="product.html?id=${p.id}">${esc(pname(p))}</a></h3>
                  <p class="icon-notes">${esc(notesLine(p))}</p>
                  <div class="icon-foot">
                    <span class="price">${esc(money(priceOf(p)))}</span>
                    <button class="btn-add btn-add-glow" type="button" data-add="${esc(p.id)}" aria-label="${esc(t("card.addLabel", { name: fullName(p) }))}">${icon("plus")}<span>${esc(t("card.add"))}</span></button>
                  </div>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

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
                // Prefer a staged cut-out for the tile; fall back to any product in the category.
                const pick = byId(catArt[c.id]);
                const p = pick && pick.cutout ? pick : D.products.find((x) => x.cat === c.id && x.cutout) || pick || D.products.find((x) => x.cat === c.id);
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

      <section class="section virginia" aria-labelledby="vf-title">
        <div class="container virginia-grid">
          <div class="virginia-photo" data-reveal>
            ${
              portrait
                ? `<figure class="portrait-frame">${portrait}</figure>`
                : `<div class="monogram" aria-hidden="true">${satin("flip")}<span class="monogram-vf">VF</span><span class="monogram-name">${esc(t("vf.monogram"))}</span></div>`
            }
          </div>
          <div class="virginia-copy" data-reveal style="--d:90ms">
            <p class="eyebrow">${esc(t("vf.eyebrow"))}</p>
            <h2 id="vf-title" class="h2">${esc(t("vf.title"))}</h2>
            <p class="lead">${esc(t("vf.body"))}</p>
            <div class="vf-chips">${vfLine.map((p) => `<a class="vf-chip" href="product.html?id=${p.id}" style="--c:${p.color}"><span class="vf-dot"></span>${esc(p.line)}</a>`).join("")}</div>
            <a class="btn btn-primary btn-lg" href="shop.html?c=perfume">${esc(t("vf.cta"))}${icon("arrow", "flip")}</a>
          </div>
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
                <a href="product.html?id=${p.id}" class="ritual-link">${esc(fullName(p))} · ${esc(money(priceOf(p)))}</a>
              </li>`
              )
              .join("")}
          </ol>
          <div class="ritual-cta" data-reveal><a class="btn btn-light btn-lg" href="product.html?id=${F.ritualSet}">${esc(t("home.ritualCta"))}${icon("arrow", "flip")}</a></div>
        </div>
      </section>

      <section class="campaign${campaign ? " has-photo" : ""}" aria-labelledby="cb-title">
        ${campaign || satin("flip")}
        <div class="grain" aria-hidden="true"></div>
        <div class="container campaign-grid">
          <div class="campaign-copy" data-reveal>
            <h2 id="cb-title" class="display-noir display-md">${esc(t("cb.title1"))} <em>${esc(t("cb.title2"))}</em></h2>
            <p class="lead-noir">${esc(t("cb.lead"))}</p>
            <a class="btn btn-glow btn-lg" href="shop.html?c=perfume">${esc(t("cb.cta"))}${icon("arrow", "flip")}</a>
          </div>
          ${campaign ? "" : `<div class="campaign-trio" aria-hidden="true" data-reveal style="--d:120ms">${F.campaign.map((id, i) => `<div class="ct ct${i + 1}">${W.art.art(pick(id), { eager: true })}</div>`).join("")}<span class="ct-glow"></span></div>`}
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
              <span class="dot-swatch" style="--s:#E6007E"></span><span class="dot-swatch" style="--s:#C9962E"></span><span class="dot-swatch" style="--s:#2A9BC4"></span><span class="dot-swatch" style="--s:#8E0B2C"></span>
            </div>
          </article>
          <article class="promo promo-gift" data-reveal style="--d:90ms">
            <div class="promo-copy">
              <p class="eyebrow">${esc(t("home.giftEyebrow"))}</p>
              <h2 class="h3">${esc(t("home.giftTitle"))}</h2>
              <p>${esc(t("home.giftLead", { amount: money(fromSet) }))}</p>
              <a class="btn btn-primary" href="shop.html?c=gift-sets">${esc(t("home.giftCta"))}${icon("arrow", "flip")}</a>
            </div>
            <div class="promo-art">${W.art.art(pick(F.giftSet))}</div>
          </article>
        </div>
      </section>

      <section class="earn-band" aria-labelledby="earn-band-title">
        <div class="grain" aria-hidden="true"></div>
        <div class="container earn-band-grid">
          <div data-reveal>
            <p class="eyebrow eyebrow-light">${esc(t("earn.eyebrow"))}</p>
            <h2 id="earn-band-title" class="display-noir display-md">${esc(t("earn.title1"))} <em>${esc(t("earn.title2"))}</em></h2>
            <p class="lead-noir">${esc(t("earn.lead", { pct: W.ref.pct(), max: tiers[tiers.length - 1].pct }))}</p>
            <a class="btn btn-light btn-lg" href="earn.html">${esc(t("earn.cta"))}${icon("arrow", "flip")}</a>
          </div>
          ${ambassadorCard({ code: "YOURNAME" + W.ref.pct(), tier: tiers[tiers.length - 1] })}
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
        ${satin()}
        <div class="container news-grid">
          <div data-reveal>
            <h2 id="news-title" class="h2">${esc(t("home.newsTitle"))}</h2>
            <p>${esc(t("home.newsLead"))}</p>
          </div>
          <div data-reveal>
            <form class="news-form" novalidate>
              <label class="sr-only" for="news-email">${esc(t("home.newsEmail"))}</label>
              <input id="news-email" type="email" required autocomplete="email" placeholder="${esc(t("home.newsEmail"))}">
              <button class="btn btn-glow" type="submit">${esc(t("home.newsCta"))}</button>
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
      const email = input.value.trim();
      const btn = form.querySelector("button");
      const done = () => {
        W.store.set("newsletter", email);
        form.reset();
        msg.textContent = t("home.newsThanks");
      };
      if (!W.sync.live) return done();
      btn.disabled = true;
      W.sync
        .rpc("save_contact", { p: Object.assign({ source: "newsletter", email, country: W.state.country, lang: W.state.lang, marketing: true }, W.sync.context()) })
        .then(done, () => (msg.textContent = t("form.failed")))
        .then(() => (btn.disabled = false));
    });
    return "";
  }

  // A glossy membership card used on the home band and the Earn page.
  function ambassadorCard(o) {
    return `<div class="amb-card-wrap" aria-hidden="true" data-reveal style="--d:120ms">
      <div class="amb-card">
        <span class="amb-shine"></span>
        <div class="amb-top"><img src="assets/brand/logo-white.svg" alt="" width="96" height="28"><span class="amb-tier">${esc(L(o.tier.name))}</span></div>
        <p class="amb-label">${esc(t("earn.dashTitle"))}</p>
        <p class="amb-code">${esc(o.code)}</p>
        <div class="amb-bottom"><span>${esc(t("earn.commission", { pct: o.tier.pct }))}</span><span>wepink ${esc(L(D.config.region))}</span></div>
      </div>
      <span class="amb-ping p1">${icon("bag")}<span>+ ${esc(money(local(27)))}</span></span>
      <span class="amb-ping p2">${icon("sparkle")}<span>+ ${esc(money(local(41)))}</span></span>
    </div>`;
  }

  /* ---------------- earn ---------------- */
  function earn(main) {
    const R = D.config.referral;
    const tiers = R.tiers;
    const minPct = tiers[0].pct;
    const maxPct = tiers[tiers.length - 1].pct;
    const c = W.country();
    const tierFor = (orders) => [...tiers].reverse().find((x) => orders >= x.minOrders) || tiers[0];
    const perk = { pink: "earn.perk.pink", hot: "earn.perk.hot", diamond: "earn.perk.diamond" };
    const linkFor = (code) => {
      const base = location.href.split("#")[0].split("?")[0];
      return W.SINGLE ? `${base}#/home?ref=${code}` : base.replace(/[^/]*$/, "") + `index.html?ref=${code}`;
    };

    function dashboard(a) {
      const link = linkFor(a.code);
      const msg = t("earn.shareMsg", { code: a.code, pct: R.friendDiscountPct, link });
      return `<div class="dash">
        <h2 class="h3">${esc(t("earn.dashTitle"))}</h2>
        <p class="muted">${esc(t("earn.dashLead"))}</p>
        <p class="dash-code" dir="ltr">${esc(a.code)}</p>
        <div class="dash-link"><input id="amb-link" value="${esc(link)}" readonly dir="ltr" aria-label="${esc(t("earn.copy"))}"><button class="btn btn-dark" type="button" data-copy>${esc(t("earn.copy"))}</button></div>
        <div class="btn-row">
          <a class="btn btn-wa" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${icon("chat")}${esc(t("earn.shareWa"))}</a>
        </div>
        <dl class="dash-stats" id="dash-stats">
          <div><dt>${esc(t("earn.statClicks"))}</dt><dd data-stat="clicks">0</dd></div>
          <div><dt>${esc(t("earn.statOrders"))}</dt><dd data-stat="orders">0</dd></div>
          <div><dt>${esc(t("earn.statEarned"))}</dt><dd data-stat="earned">${esc(money(0))}</dd></div>
        </dl>
        <p class="demo-note" id="dash-note">${icon("shield")}<span>${esc(t(W.sync.live ? "earn.live" : "earn.demo"))}</span></p>
        <button class="link-btn small" type="button" data-amb-reset>${esc(t("earn.reset"))}</button>
      </div>`;
    }

    function joinForm() {
      return `<form class="card-form" id="amb-form" novalidate>
        <h2 class="h3">${esc(t("earn.joinTitle"))}</h2>
        <p class="muted">${esc(t("earn.joinLead"))}</p>
        <div class="field"><label for="a-name">${esc(t("earn.name"))}</label><input id="a-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="a-handle">${esc(t("earn.handle"))}</label><input id="a-handle" name="handle" dir="ltr" placeholder="@"></div>
        <div class="field-row">
          <div class="field"><label for="a-phone">${esc(t("earn.phone"))}</label><div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input id="a-phone" name="phone" type="tel" inputmode="tel" dir="ltr" required></div></div>
          <div class="field"><label for="a-email">${esc(t("earn.email"))}</label><input id="a-email" name="email" type="email" dir="ltr" required></div>
        </div>
        <label class="check"><input type="checkbox" name="agree" id="a-agree"><span class="check-box">${icon("check")}</span><span>${esc(t("earn.agree"))}</span></label>
        <p class="field-error" id="a-agree-err"></p>
        <button class="btn btn-primary btn-lg btn-block" type="submit">${icon("sparkle")}${esc(t("earn.submit"))}</button>
      </form>`;
    }

    // Live numbers for the signed-up ambassador on this device.
    function loadStats(a) {
      if (!W.sync.live || !a.token) return;
      W.sync.rpc("ambassador_stats", { p_code: a.code, p_token: a.token }).then((st) => {
        const box = main.querySelector("#dash-stats");
        const note = main.querySelector("#dash-note span");
        if (!box) return;
        if (!st) {
          note.textContent = t("earn.notFound");
          return;
        }
        const set = (k, v) => (box.querySelector(`[data-stat="${k}"]`).textContent = v);
        set("clicks", st.clicks);
        set("orders", st.orders);
        set("earned", money(local(Number(st.earnedAed) + Number(st.paidAed))));
        note.textContent =
          st.status === "paused"
            ? t("earn.paused")
            : Number(st.pendingAed)
            ? t("earn.pending", { amount: money(local(Number(st.pendingAed))) })
            : t("earn.live");
      }, () => {});
    }

    const amb = myAmbassador();
    main.innerHTML = `
      <section class="hero-noir earn-hero">
        ${satin()}
        <div class="grain" aria-hidden="true"></div>
        <div class="sparkles" aria-hidden="true">${sparkles(10)}</div>
        <div class="container hero-noir-grid">
          <div class="hero-noir-copy">
            <p class="eyebrow eyebrow-glow">${icon("sparkle")}${esc(t("earn.eyebrow"))}</p>
            <h1 class="display-noir">${esc(t("earn.title1"))} <em>${esc(t("earn.title2"))}</em></h1>
            <p class="lead-noir">${esc(t("earn.lead", { pct: R.friendDiscountPct, max: maxPct }))}</p>
            <div class="btn-row">
              <a class="btn btn-glow btn-lg" href="#join" data-jump="join">${esc(t("earn.cta"))}${icon("arrow", "flip")}</a>
              <a class="btn btn-glass btn-lg" href="#calc" data-jump="calc">${esc(t("earn.ctaCalc"))}</a>
            </div>
          </div>
          ${ambassadorCard({ code: amb ? amb.code : "YOURNAME" + R.friendDiscountPct, tier: tiers[tiers.length - 1] })}
        </div>
      </section>

      <section class="section" aria-labelledby="how-title">
        <div class="container">
          <h2 id="how-title" class="h2 center">${esc(t("earn.how"))}</h2>
          <ol class="steps">
            ${[
              ["sparkle", "earn.s1", "earn.s1b"],
              ["chat", "earn.s2", "earn.s2b"],
              ["cash", "earn.s3", "earn.s3b"],
            ]
              .map(
                ([ic, a, b], i) => `<li class="step" data-reveal style="--d:${i * 80}ms"><span class="step-num">0${i + 1}</span><span class="step-icon">${icon(ic)}</span><h3>${esc(t(a))}</h3><p class="muted">${esc(t(b, { pct: R.friendDiscountPct, min: minPct, max: maxPct }))}</p></li>`
              )
              .join("")}
          </ol>
        </div>
      </section>

      <section class="section section-tint" id="calc" aria-labelledby="calc-title">
        <div class="container calc">
          <div class="calc-inputs">
            <h2 id="calc-title" class="h2">${esc(t("earn.calcTitle"))}</h2>
            <label class="range"><span class="range-head"><span>${esc(t("earn.calcOrders"))}</span><output id="o-orders"></output></span>
              <input type="range" id="r-orders" min="1" max="120" value="30"></label>
            <label class="range"><span class="range-head"><span>${esc(t("earn.calcBasket"))}</span><output id="o-basket"></output></span>
              <input type="range" id="r-basket" min="80" max="600" step="10" value="180"></label>
          </div>
          <div class="calc-result" aria-live="polite">
            <p class="eyebrow eyebrow-light">${esc(t("earn.calcResult"))}</p>
            <p class="calc-amount" id="calc-amount"></p>
            <p class="calc-per">${esc(t("earn.calcPer"))}</p>
            <p class="calc-year" id="calc-year"></p>
            <p class="calc-tier" id="calc-tier"></p>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="tiers-title">
        <div class="container">
          <h2 id="tiers-title" class="h2 center">${esc(t("earn.tiersTitle"))}</h2>
          <div class="tiers">
            ${tiers
              .map(
                (x, i) => `<article class="tier tier-${x.id}" data-reveal style="--d:${i * 80}ms">
                <p class="tier-name">${esc(L(x.name))}</p>
                <p class="tier-pct">${x.pct}<span>%</span></p>
                <p class="tier-from">${esc(x.minOrders ? t("earn.tierFrom", { n: x.minOrders }) : t("earn.tierFrom0"))}</p>
                <p class="tier-perk">${icon("gift")}<span>${esc(t(perk[x.id]))}</span></p>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section-tint" id="join" aria-label="${esc(t("earn.joinTitle"))}">
        <div class="container form-split">
          <div>
            <h2 class="h2">${esc(t("earn.faqTitle"))}</h2>
            <div class="accordion">
              ${[1, 2, 3].map((n, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(t("earn.q" + n))}${icon("chevron")}</summary><p>${esc(t("earn.a" + n, { days: D.config.returnsDays }))}</p></details>`).join("")}
            </div>
          </div>
          <div id="amb-slot">${amb ? dashboard(amb) : joinForm()}</div>
        </div>
      </section>`;

    // Calculator.
    const ro = main.querySelector("#r-orders");
    const rb = main.querySelector("#r-basket");
    function calc() {
      const orders = +ro.value;
      const basket = local(+rb.value);
      const tier = tierFor(orders);
      const monthly = orders * basket * (tier.pct / 100);
      const round = (v) => (c.decimals ? Math.round(v * 1000) / 1000 : Math.round(v));
      main.querySelector("#o-orders").textContent = orders;
      main.querySelector("#o-basket").textContent = money(basket);
      main.querySelector("#calc-amount").textContent = money(round(monthly));
      main.querySelector("#calc-year").textContent = t("earn.calcYear", { amount: money(round(monthly * 12)) });
      main.querySelector("#calc-tier").textContent = t("earn.calcTier", { tier: L(tier.name), pct: tier.pct });
      [ro, rb].forEach((r) => r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"));
    }
    ro.addEventListener("input", calc);
    rb.addEventListener("input", calc);
    calc();

    // Join, copy, reset.
    const slot = main.querySelector("#amb-slot");
    main.addEventListener("click", (e) => {
      const jump = e.target.closest("[data-jump]");
      if (jump) {
        e.preventDefault();
        main.querySelector("#" + jump.dataset.jump).scrollIntoView({ behavior: "smooth" });
      }
      if (e.target.closest("[data-copy]")) {
        const input = main.querySelector("#amb-link");
        const done = () => W.toast(t("earn.copied"));
        if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, () => (input.select(), document.execCommand("copy"), done()));
        else (input.select(), document.execCommand("copy"), done());
      }
      if (e.target.closest("[data-amb-reset]")) {
        W.store.set("amb", null);
        slot.innerHTML = joinForm();
      }
    });
    main.addEventListener("submit", (e) => {
      if (e.target.id !== "amb-form") return;
      e.preventDefault();
      const form = e.target;
      let ok = validate(form);
      const agree = form.querySelector("#a-agree");
      const agreeErr = form.querySelector("#a-agree-err");
      agreeErr.textContent = agree.checked ? "" : t("earn.required");
      if (!agree.checked) ok = false;
      if (!ok) return;
      const a = { name: form.name.value.trim(), handle: form.handle.value.trim(), at: Date.now() };
      const show = () => {
        W.store.set("amb", a);
        slot.innerHTML = dashboard(a);
        const cardCode = main.querySelector(".earn-hero .amb-code");
        if (cardCode) cardCode.textContent = a.code;
        slot.scrollIntoView({ behavior: "smooth", block: "center" });
        loadStats(a);
      };
      if (!W.sync.live) {
        // Offline preview: make up a code from the first name.
        const first = a.name.split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10);
        a.code = (first.length >= 3 ? first : "PINK" + Math.floor(100 + Math.random() * 900)) + R.friendDiscountPct;
        return show();
      }
      const btn = form.querySelector("[type=submit]");
      btn.disabled = true;
      const entry = { name: a.name, handle: a.handle, phone: `${c.dial}${form.phone.value.replace(/\D/g, "")}`, email: form.email.value.trim(), country: W.state.country, lang: W.state.lang };
      W.sync.rpc("register_ambassador", { p: Object.assign(entry, W.sync.context()) }).then(
        (r) => {
          a.code = r.code;
          a.token = r.token;
          show();
        },
        () => {
          btn.disabled = false;
          agreeErr.textContent = t("form.failed");
        }
      );
    });
    if (amb) loadStats(amb);
    else prefill(main.querySelector("#amb-form"));
    return t("footer.earn");
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
    let shown = 48;
    function draw() {
      const items = list();
      main.querySelector("#shop-count").textContent = t("shop.count", { n: items.length });
      main.querySelector("#shop-more").innerHTML = items.length > shown ? `<button class="btn btn-ghost btn-lg" type="button" data-more>${esc(t("shop.more", { n: items.length - shown }))}</button>` : "";
      main.querySelector("#shop-grid").innerHTML = items.length
        ? items.slice(0, shown).map(card).join("")
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
        <div class="shop-more" id="shop-more"></div>
      </div>
      ${perks()}`;

    main.addEventListener("click", (e) => {
      if (e.target.closest("[data-more]")) {
        shown += 48;
        draw();
        return;
      }
      const b = e.target.closest("[data-cat],[data-reset]");
      if (!b) return;
      shown = 48;
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
      shown = 48;
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
    if (!p && W.sync.pending()) {
      main.innerHTML = `<section class="section"><div class="container empty-state" data-sync-wait><span class="spinner" aria-hidden="true"></span><p class="muted">${esc(t("pdp.loading"))}</p></div></section>`;
      return t("pdp.loading");
    }
    if (!p) {
      main.innerHTML = `<section class="section"><div class="container empty-state"><h1 class="h2">${esc(t("pdp.notFound"))}</h1><a class="btn btn-primary" href="shop.html">${esc(t("pdp.back"))}</a></div></section>`;
      return t("pdp.notFound");
    }
    const c = W.country();
    const cc = cat(p.cat);
    const how = { splash: "howSplash", colonia: "howPerfume", hairmist: "howMist", cream: "howLotion", lotion: "howLotion", butter: "howLotion", bodyoil: "howLotion", set: "howSet" }[p.type];
    // Gallery: the staged cut-out first, then the studio photos (local, then the brand's CDN).
    const shots = [];
    if (p.cutout) shots.push({ cls: "cut", src: p.cutout });
    (p.images || []).forEach((src) => shots.push({ cls: "photo", src }));
    (p.remote || []).slice((p.images || []).length).forEach((src) => shots.push({ cls: "photo", src }));
    const related = [
      ...D.products.filter((x) => x !== p && x.line.split(" ")[0] === p.line.split(" ")[0]),
      ...D.products.filter((x) => x !== p && x.family === p.family),
      ...featured(),
    ].filter((x, i, a) => x !== p && a.indexOf(x) === i).slice(0, 4);
    const each = c.decimals ? Math.round((priceOf(p) / 4) * 1000) / 1000 : Math.round((priceOf(p) / 4) * 100) / 100;
    const bnplOk = c.pay.includes("tabby");
    const noteRow = (k) => (p.notes[k] && p.notes[k].length ? `<div class="note-row"><dt>${esc(t("pdp." + k))}</dt><dd>${p.notes[k].map((n) => `<span class="note">${esc(L(n))}</span>`).join("")}</dd></div>` : "");
    const notesHTML = noteRow("top") + noteRow("heart") + noteRow("base");
    const eachText = Number(each).toLocaleString("en-US", { minimumFractionDigits: c.decimals || 2, maximumFractionDigits: c.decimals || 2 });

    main.innerHTML = `
      <div class="container">
        ${crumbs([["wepink", "index.html"], [L(cc.name), "shop.html?c=" + cc.id], [pname(p)]])}
      </div>
      <section class="container pdp">
        <div class="pdp-gallery">
          <div class="pdp-media media" style="--c:${p.color};--c2:${p.color2}">
            ${badge(p)}
            <div class="pdp-stage" id="pdp-stage">${W.art.art(p, { eager: true })}</div>
          </div>
          ${
            shots.length > 1
              ? `<div class="pdp-thumbs" role="group" aria-label="${esc(t("pdp.photos"))}">${shots
                  .map(
                    (sh, i) => `<button type="button" class="pdp-thumb media${i === 0 ? " is-on" : ""}" style="--c:${p.color};--c2:${p.color2}" data-shot="${i}" aria-label="${esc(t("pdp.photoN", { n: i + 1 }))}"><img class="${sh.cls}" src="${esc(sh.src)}" alt="" loading="lazy"></button>`
                  )
                  .join("")}</div>`
              : ""
          }
        </div>
        <div class="pdp-info">
          <p class="card-type">${esc(L(p.typeName))}${p.family ? ` · ${esc(L(D.families[p.family]))}` : ""}</p>
          <h1 class="h1 pdp-title">${esc(pname(p))}</h1>
          ${p.tagline && L(p.tagline) ? `<p class="pdp-tagline">${esc(L(p.tagline))}</p>` : ""}
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
          <button class="share-earn" type="button" data-share>${icon("sparkle")}<span>${esc(t("pdp.share"))}</span>${icon("arrow", "flip")}</button>

          <div class="accordion">
            ${notesHTML ? `<details open>
              <summary>${esc(t("pdp.notes"))}${icon("chevron")}</summary>
              <dl class="notes">${notesHTML}</dl>
            </details>` : ""}
            ${how ? `<details${notesHTML ? "" : " open"}>
              <summary>${esc(t("pdp.how"))}${icon("chevron")}</summary>
              <p>${esc(t("pdp." + how))}</p>
            </details>` : ""}
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

    main.querySelectorAll("[data-shot]").forEach((b) =>
      b.addEventListener("click", () => {
        const sh = shots[+b.dataset.shot];
        main.querySelector("#pdp-stage").innerHTML = `<img class="${sh.cls}" src="${esc(sh.src)}" alt="">`;
        main.querySelectorAll("[data-shot]").forEach((x) => x.classList.toggle("is-on", x === b));
      })
    );
    const qtyEl = main.querySelector("[data-qty-value]");
    main.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = Math.max(1, Math.min(20, parseInt(qtyEl.textContent, 10) + parseInt(b.dataset.step, 10)));
        qtyEl.textContent = v;
      })
    );

    // Share & earn: ambassadors share with their code; everyone else is invited to join.
    main.querySelector("[data-share]").addEventListener("click", () => {
      const amb = myAmbassador();
      if (!amb) {
        const a = document.createElement("a");
        a.href = "earn.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      const base = location.href.split("#")[0].split("?")[0];
      const link = W.SINGLE ? `${base}#/product?id=${p.id}&ref=${amb.code}` : `${base}?id=${p.id}&ref=${amb.code}`;
      const text = t("pdp.shareMsg", { name: pname(p), link });
      if (navigator.share) navigator.share({ title: `wepink ${pname(p)}`, text, url: link }).catch(() => {});
      else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });

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
      name: `wepink ${p.line}${FRAG(p) ? " " + p.typeName.en : ""}`,
      image: p.cutout || p.image,
      brand: { "@type": "Brand", name: "wepink" },
      description: p.desc ? p.desc.en || p.desc.ar : undefined,
      offers: { "@type": "Offer", priceCurrency: c.currency, price: priceOf(p), availability: "https://schema.org/InStock" },
    });
    return fullName(p);
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
      const phone = c.dial + form.phone.value.replace(/\D/g, "");
      const msg = form.querySelector(".form-msg");
      const btn = form.querySelector("[type=submit]");
      const done = () => {
        const list = W.store.get("interest", []);
        list.push({ name, phone, city: cityKey, at: Date.now() });
        W.store.set("interest", list);
        form.reset();
        msg.textContent = t("stores.thanks", { name: name.split(" ")[0], city });
      };
      if (!W.sync.live) return done();
      btn.disabled = true;
      W.sync
        .rpc("save_contact", { p: Object.assign({ source: "stores", name, phone, country: W.state.country, lang: W.state.lang, details: { storeCity: cityKey } }, W.sync.context()) })
        .then(done, () => (msg.textContent = t("form.failed")))
        .then(() => (btn.disabled = false));
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
            ${D.featured.about.map(pick).map((p, i) => `<div class="about-tile t${i + 1}" style="--c:${p.color};--c2:${p.color2}">${W.art.art(p)}</div>`).join("")}
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
      </section>
      <section class="section section-tint" id="privacy">
        <div class="container narrow privacy">
          <h2 class="h2">${esc(t("privacy.title"))}</h2>
          ${[1, 2, 3, 4, 5].map((n) => `<p>${esc(t("privacy.p" + n, { email: D.config.email }))}</p>`).join("")}
          ${W.sync.live ? `<button class="btn btn-ghost" type="button" data-cookies>${esc(t("consent.settings"))}</button>` : ""}
        </div>
      </section>`;
    return t("help.title");
  }

  /* ---------------- checkout ---------------- */
  const validate = W.validate;

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
  let currentSummary = null;
  function checkout(main) {
    const c = W.country();
    if (!W.bag.count()) {
      main.innerHTML = `<section class="section"><div class="container empty-state"><div class="bag-empty-icon">${icon("bag")}</div><h1 class="h2">${esc(t("co.empty"))}</h1><a class="btn btn-primary" href="shop.html">${esc(t("bag.emptyCta"))}</a></div></section>`;
      return t("co.title");
    }

    function totals() {
      const sub = W.bag.subtotal();
      const del = W.bag.delivery();
      const code = W.ref.get();
      const raw = code ? (sub * W.ref.pct()) / 100 : 0;
      const disc = c.decimals ? Math.round(raw * 1000) / 1000 : Math.round(raw);
      return { sub, del, code, disc, total: sub - disc + del };
    }
    function codeBox(code, error) {
      return code
        ? `<div class="code-applied">${icon("sparkle")}<span>${esc(t("co.codeApplied", { code, pct: W.ref.pct() }))}</span><button class="link-btn small" type="button" data-code-remove>${esc(t("co.removeCode"))}</button></div>`
        : `<form class="code-form" id="code-form" novalidate>
            <label class="sr-only" for="co-code">${esc(t("co.code"))}</label>
            <input id="co-code" placeholder="${esc(t("co.code"))}" autocomplete="off" dir="ltr">
            <button class="btn btn-dark" type="submit">${esc(t("co.apply"))}</button>
          </form>${error ? `<p class="field-error">${esc(error)}</p>` : ""}`;
    }
    function summary(error) {
      const { sub, del, code, disc, total } = totals();
      const vat = c.vat ? total - total / (1 + c.vat / 100) : 0;
      const vatText = c.decimals ? Math.round(vat * 1000) / 1000 : Math.round(vat * 100) / 100;
      return `<ul class="sum-lines">${W.bag
        .items()
        .map(
          (i) => `<li>
          <span class="sum-thumb">${media(i.p, "media-xs")}<span class="sum-qty">${i.qty}</span></span>
          <span class="sum-name"><strong>${esc(pname(i.p))}</strong><span class="muted small">${esc(L(i.p.typeName))} · ${esc(sizeText(i.p))}</span></span>
          <span class="price">${esc(money(priceOf(i.p) * i.qty))}</span>
        </li>`
        )
        .join("")}</ul>
        ${codeBox(code, error)}
        <dl class="sum-totals">
          <div><dt>${esc(t("bag.subtotal"))}</dt><dd>${esc(money(sub))}</dd></div>
          ${disc ? `<div class="sum-disc"><dt>${esc(t("co.discount", { code }))}</dt><dd>− ${esc(money(disc))}</dd></div>` : ""}
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
          <p class="demo-note">${icon("shield")}<span>${esc(t(W.sync.live ? "co.live" : "co.demo"))}</span></p>
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
              <label class="check"><input type="checkbox" name="marketing"><span class="check-box">${icon("check")}</span><span>${esc(t("co.marketing"))}</span></label>
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

    currentSummary = summary;
    if (!checkoutBound) {
      checkoutBound = true;
      document.addEventListener("wp:bag", () => {
        const el = document.getElementById("co-summary");
        if (el && currentSummary) el.innerHTML = currentSummary();
      });
    }
    const sumEl = main.querySelector("#co-summary");
    main.addEventListener("submit", (e) => {
      if (e.target.id !== "code-form") return;
      e.preventDefault();
      const typed = e.target.querySelector("input").value;
      e.target.querySelector("button").disabled = true;
      W.ref.check(typed).then((code) => {
        if (code) W.ref.set(code);
        sumEl.innerHTML = summary(code ? "" : t(W.ref.clean(typed) ? "co.codeUnknown" : "co.codeInvalid"));
        if (!code) {
          const input = sumEl.querySelector("#co-code");
          input.value = typed;
          input.focus();
        }
      });
    });
    main.addEventListener("click", (e) => {
      if (!e.target.closest("[data-code-remove]")) return;
      W.ref.clear();
      sumEl.innerHTML = summary();
    });

    const form = main.querySelector("#co-form");
    prefill(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const btn = form.querySelector(".co-submit");
      btn.disabled = true;
      btn.querySelector("span").textContent = t("co.placing");
      const items = W.bag.items();
      const { sub, del, code, disc, total } = totals();
      const f = Object.fromEntries(new FormData(form).entries());
      const phone = `${c.dial} ${f.phone}`;

      function finish(id) {
        const lines = [
          t("co.waIntro", { id }),
          ...items.map((i) => `• ${i.qty} × ${fullName(i.p)} — ${money(priceOf(i.p) * i.qty)}`),
          disc ? `${t("co.discount", { code })}: − ${money(disc)}` : "",
          `${t("co.total")}: ${money(total)}`,
          `${f.name} · ${phone}`,
          `${f.street}${f.apt ? ", " + f.apt : ""}, ${f.area}, ${f.city}, ${L(c.name)}`,
          `${t("co.payment")}: ${L(D.payNames[f.pay])}`,
          f.gift ? `${t("co.gift")}: ${f.gift}` : "",
        ].filter(Boolean);
        const wa = `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
        const orders = W.store.get("orders", []);
        orders.push({ id, at: Date.now(), country: W.state.country, items: items.map((i) => ({ id: i.p.id, qty: i.qty })), total, code, currency: c.currency });
        W.store.set("orders", orders);
        W.bag.clear();
        // The friend discount is for a first order.
        if (code) W.ref.clear();
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
      }

      // Without the database (or if it can't be reached) the order still goes
      // through WhatsApp with a number made here.
      const localId = "WPG-" + String(Math.floor(100000 + Math.random() * 900000));
      if (!W.sync.live) return setTimeout(() => finish(localId), 700);
      const order = {
        country: W.state.country,
        lang: W.state.lang,
        code: code || undefined,
        items: items.map((i) => ({ id: i.p.id, name: fullName(i.p), qty: i.qty, price: priceOf(i.p) })),
        subtotal: sub,
        discount: disc,
        delivery: del,
        total,
        payment: f.pay,
        gift: f.gift || undefined,
        marketing: f.marketing === "on",
        customer: { name: f.name.trim(), email: f.email.trim(), phone, city: f.city, area: f.area, street: f.street, apt: f.apt, notes: f.notes },
      };
      W.sync.rpc("place_order", { p: Object.assign(order, W.sync.context()) }).then(
        (r) => finish(r.number),
        () => finish(localId)
      );
    });
    return t("co.title");
  }

  return { home, shop, product, stores, about, help, checkout, earn };
})();
