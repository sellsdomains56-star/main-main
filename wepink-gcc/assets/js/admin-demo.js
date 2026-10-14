/* wepink Gulf — admin panel demo mode.
 *
 * Opens the admin panel without signing in, to show it to people: on
 * admin.html#demo, or on a page that sets window.WP_ADMIN_DEMO = true before
 * its scripts (the preview link). The Supabase client is swapped for one that
 * keeps the real catalogue (catalog.js) and made-up orders, customers,
 * ambassadors and visitors in memory: nothing reaches the database and every
 * change is gone on reload. Without the hash or the flag this file does nothing.
 */
(function () {
  if (window.WP_ADMIN_DEMO !== true && location.hash !== "#demo") return;

  const EMAIL = "demo@wepink.ae";
  const DAY = 864e5;
  const HOUR = 36e5;

  /* ---------- seeded randomness: the same sample on every load ---------- */
  let seed = 20251014;
  const R = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (list) => list[Math.floor(R() * list.length)];
  // [[value, weight], …]
  const weighted = (pairs) => {
    let x = R() * pairs.reduce((s, p) => s + p[1], 0);
    for (const [v, w] of pairs) if ((x -= w) < 0) return v;
    return pairs[pairs.length - 1][0];
  };
  const shuffle = (list) => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const hex = (n) => Array.from({ length: n }, () => Math.floor(R() * 16).toString(16)).join("");
  const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-${"89ab"[int(0, 3)]}${hex(3)}-${hex(12)}`;
  const iso = (t) => new Date(t).toISOString();
  const round2 = (n) => Math.round(n * 100) / 100;
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const clone = (v) => (v == null || typeof v !== "object" ? v : JSON.parse(JSON.stringify(v)));
  const pad = (n, k) => String(n).padStart(k || 2, "0");

  /* ---------- made-up people: first name and initial, placeholder phone and email ---------- */
  // The first five are the ambassadors.
  const FIRST = ["Sara", "Noura", "Hessa", "Maha", "Dana", "Layla", "Huda", "Reem", "Aisha", "Fatima", "Mariam", "Amal", "Rania", "Yasmin", "Hind", "Salma", "Nadia", "Farah", "Hala", "Asma", "Ghada", "Mona", "Dalia", "Joud", "Lama", "Ruba", "Alia", "Meera", "Nada", "Tala", "Rawan", "Shahad", "Jumana", "Lujain", "Bayan", "Haya", "Nouf", "Sana", "Omar", "Khalid", "Faisal", "Yousef", "Hamad", "Saeed"];
  const PLACES = {
    AE: [["Dubai", ["Al Barsha", "Jumeirah", "Business Bay", "Dubai Marina", "Mirdif", "Al Nahda"]], ["Abu Dhabi", ["Al Reem Island", "Khalifa City", "Al Khalidiyah"]], ["Sharjah", ["Al Majaz", "Al Taawun"]], ["Ajman", ["Al Nuaimiya"]]],
    SA: [["Riyadh", ["Al Olaya", "Al Malqa", "Al Yasmin", "Hittin"]], ["Jeddah", ["Al Rawdah", "Al Shati", "Al Zahra"]], ["Al Khobar", ["Al Ulaya"]], ["Dammam", ["Al Faisaliyah"]]],
    KW: [["Kuwait City", ["Sharq", "Dasman"]], ["Salmiya", ["Block 10"]], ["Hawalli", ["Block 3"]]],
    QA: [["Doha", ["West Bay", "Al Sadd", "The Pearl"]], ["Lusail", ["Marina District"]]],
    BH: [["Manama", ["Juffair", "Adliya"]], ["Riffa", ["East Riffa"]]],
    OM: [["Muscat", ["Al Khuwair", "Qurum", "Al Mouj"]], ["Sohar", ["Falaj Al Qabail"]]],
  };
  const GEO = [["AE", 44], ["SA", 26], ["KW", 10], ["QA", 8], ["BH", 6], ["OM", 6]];
  // How visitors first found the store: a campaign (utm_source), an ambassador's link, another website, or typed in.
  const SOURCES = [["instagram", 26], ["tiktok", 16], ["snapchat", 6], ["ambassador", 11], ["google.com", 13], ["wepink.com.br", 3], ["bing.com", 1], ["direct", 24]];
  const AMB_WEIGHT = [40, 25, 15, 10, 10];
  const PAGES = [["home", 26], ["shop", 22], ["product", 34], ["checkout", 4], ["earn", 5], ["stores", 4], ["about", 3], ["help", 2]];
  const SCREENS = { mobile: ["390x844", "393x852", "414x896", "375x812", "412x915"], desktop: ["1440x900", "1920x1080", "1536x864"], tablet: ["820x1180", "768x1024"] };
  const FRAGRANCE = new Set(["colonia", "splash", "cream", "lotion", "hairmist", "bodyoil", "scrub", "butter", "shower", "soap", "rollon"]);

  /* ---------- the sample database ---------- */
  function build() {
    const D = window.WP_DATA;
    const C = D.config;
    const catalog = window.WP_CATALOG || [];
    const now = Date.now();
    const ago = (days) => iso(now - days * DAY);
    const markup = 1 + (Number(C.pricing && C.pricing.markupPct) || 0) / 100;
    const db = { products: [], orders: [], customers: [], ambassadors: [], visits: [], admins: [], settings: [] };

    // Products: the real catalogue, in its own order. Photos: the first re-shot photo
    // (the one the preview link carries), else whatever the catalogue row has.
    const made = ago(120);
    db.products = catalog.map((p, i) => ({
      id: p.id,
      active: true,
      sort: (i + 1) * 10,
      cat: p.cat,
      type: p.type,
      line: p.line,
      line_ar: p.lineAr || null,
      size: p.size || null,
      family: p.family || null,
      gender: p.gender || null,
      badge: p.badge || null,
      color: p.color || null,
      color2: p.color2 || null,
      price: p.price,
      compare_at: p.compareAt || null,
      prices: p.prices || null,
      tagline: clone(p.tagline) || null,
      description: clone(p.desc) || null,
      notes: clone(p.notes) || null,
      images: p.renders > 0 ? [`assets/products/r/${p.id}-1.webp`] : p.images && p.images.length ? p.images.slice() : p.image ? [p.image] : null,
      cutout: null,
      photo_style: p.renders > 0 ? "scene" : p.images && p.images.length ? "studio" : null,
      source: p.source || null,
      created_at: made,
      updated_at: made,
    }));
    const ranked = catalog.slice().sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const bestseller = () => ranked[Math.floor(Math.pow(R(), 2.2) * ranked.length)];

    // Settings: the defaults in data.js.
    const settings = {
      pricing: { markupPct: C.pricing.markupPct },
      referral: { friendDiscountPct: C.referral.friendDiscountPct, tiers: C.referral.tiers.map((t) => ({ id: t.id, minOrders: t.minOrders, pct: t.pct })) },
      contact: { whatsapp: "", email: "", instagram: "", tiktok: "" },
      season: { id: (C.season || {}).id || "", announce: (C.season || {}).announce || null },
      ritual: { pct: (C.ritual || {}).pct || 0 },
      welcome: { pct: (C.welcome || {}).pct || 0, code: (C.welcome || {}).code || "WELCOME10" },
    };
    db.settings = Object.keys(settings).map((key) => ({ key, value: settings[key], updated_at: made }));
    db.admins = [{ email: EMAIL, created_at: made }];

    // Visitor profiles: where they connect from, their device and language, and how they found the store.
    const profile = (at, base) => {
      const v = Object.assign({ id: `v-${hex(16)}`, geo: weighted(GEO), device: weighted([["mobile", 78], ["desktop", 18], ["tablet", 4]]), lang: weighted([["en", 52], ["ar", 44], ["pt", 4]]), utm: null, ref: null, referrer: null }, base);
      v.screen = pick(SCREENS[v.device]);
      let src = weighted(SOURCES);
      if (src === "ambassador") {
        const open = db.ambassadors.map((a, i) => [a, AMB_WEIGHT[i]]).filter(([a]) => Date.parse(a.created_at) < at && (a.status === "active" || at < now - 25 * DAY));
        if (open.length) v.ref = weighted(open).code;
        else src = "direct";
      } else if (/\./.test(src)) v.referrer = `https://www.${src}/`;
      else if (src !== "direct") v.utm = { source: src, medium: src === "snapchat" ? "paid" : "social", campaign: weighted([["gulf-launch", 3], ["vf-golden", 2], ["body-splash-week", 1]]) };
      return v;
    };
    const visitPath = (page, item) =>
      page === "home" ? "/" : page === "product" ? `/product.html?id=${(item || bestseller()).id}` : page === "shop" ? (R() < 0.6 ? "/shop.html" : `/shop.html?c=${pick(D.categories).id}`) : `/${page}.html`;
    const session = (v, t, pages, opts) => {
      const o = opts || {};
      const sid = `s-${hex(16)}`;
      pages.forEach((page, k) => {
        if (t > now) return;
        let path = Array.isArray(page) ? page[1] : visitPath(page);
        page = Array.isArray(page) ? page[0] : page;
        const ref = o.ref || v.ref;
        if (!k && v.utm) path += (path.includes("?") ? "&" : "?") + `utm_source=${v.utm.source}&utm_campaign=${v.utm.campaign}`;
        else if (!k && ref) path += (path.includes("?") ? "&" : "?") + `ref=${ref}`;
        db.visits.push({ id: 0, visitor_id: v.id, session_id: sid, page, path, referrer: v.referrer, utm: v.utm, ref_code: ref, geo: v.geo, country: v.geo, lang: v.lang, device: v.device, screen: v.screen, created_at: iso(t) });
        t += (25 + R() * 160) * 1000;
      });
    };
    const browse = () => {
      const first = weighted([["home", 50], ["product", 27], ["shop", 18], ["earn", 5]]);
      const n = weighted([[1, 30], [2, 22], [3, 18], [4, 12], [5, 9], [7, 6], [10, 3]]);
      return [first].concat(Array.from({ length: n - 1 }, () => weighted(PAGES)));
    };

    // People: the first five are ambassadors, the next 26 order, the rest only left their details.
    const names = FIRST.slice(0, 5).concat(shuffle(FIRST.slice(5)));
    const people = names.map((first, i) => {
      const country = i < 5 ? ["AE", "SA", "KW", "QA", "AE"][i] : weighted(GEO);
      const cc = D.countries[country];
      const [city, areas] = pick(PLACES[country]);
      const initial = "ABDFHKMNRSTY"[int(0, 11)];
      const tel = `${cc.dial} 50 000 ${pad(i + 1, 4)}`;
      const p = {
        first,
        name: `${first} ${initial}.`,
        email: `${first.toLowerCase()}.${initial.toLowerCase()}@example.com`,
        tel,
        phone: tel.replace(/[^0-9+]/g, ""),
        country,
        city,
        area: pick(areas),
        street: `Street ${int(2, 48)}`,
        apt: R() < 0.55 ? `Apt ${int(1, 24)}${pad(int(1, 12))}` : `Villa ${int(3, 60)}`,
      };
      // most accepted cookies, so their visits are on record
      p.v = profile(now - 90 * DAY, { geo: country, lang: country === "AE" && R() < 0.5 ? "en" : weighted([["ar", 55], ["en", 42], ["pt", 3]]) });
      if (R() > 0.85) p.v.id = null;
      return p;
    });
    const seen = (p, t, pages, opts) => p.v.id && session(p.v, t, pages, opts);

    // Ambassadors
    const friendPct = C.referral.friendDiscountPct;
    db.ambassadors = people.slice(0, 5).map((p, i) => ({
      id: uuid(),
      code: (p.first.toUpperCase() + friendPct).slice(0, 16),
      name: p.name,
      phone: p.phone,
      email: p.email,
      handle: `@${p.first.toLowerCase()}.pink.demo`,
      country: p.country,
      lang: p.v.lang,
      status: i === 3 ? "paused" : "active",
      clicks: 0,
      token_hash: hex(64),
      note: null,
      created_at: ago([82, 64, 47, 35, 19][i] + R()),
    }));

    // Customers, one row per person
    const rows = new Map();
    const customer = (p, source, t) => {
      let c = rows.get(p);
      if (!c) {
        c = { id: uuid(), email: p.email, phone: p.phone, name: p.name, country: p.country, city: p.city, lang: p.v.lang, sources: [], marketing: false, details: {}, orders_count: 0, spent_aed: 0, visitor_id: p.v.id, utm: clone(p.v.utm), user_id: null, avatar_url: null, provider: null, note: null, first_seen: iso(t), last_seen: iso(t) };
        rows.set(p, c);
      }
      if (!c.sources.includes(source)) c.sources.push(source);
      if (t < Date.parse(c.first_seen)) c.first_seen = iso(t);
      if (t > Date.parse(c.last_seen)) c.last_seen = iso(t);
      return c;
    };
    db.ambassadors.forEach((a, i) => {
      const t = Date.parse(a.created_at);
      const c = customer(people[i], "ambassador", t);
      c.details = { ambassadorCode: a.code };
      c.marketing = true;
      seen(people[i], t - 4 * 60e3, ["home", "earn", "earn"]);
    });

    // Orders: ~24 in the last 30 days (the newest still to handle) and a quieter stretch before.
    const hours = [];
    for (let h = 1.2 + R(), i = 0; i < 24; i++) hours.push(Math.min(h, 29.6 * 24)), (h += i < 10 ? 3 + R() * 9 : 14 + R() * 30);
    for (let k = 0; k < 12; k++) hours.push((31 + k * 4.8 + R() * 3) * 24);
    const STATUS = (i) =>
      i < 3 ? "new" : i < 6 ? "confirmed" : i === 8 || i === 18 || i === 30 ? "cancelled" : i < 10 ? "shipped" : i === 14 ? "returned" : "delivered";
    const NOTES = { 3: "Confirmed on WhatsApp — delivery after 6 pm", 8: "Cancelled on WhatsApp — ordered twice by mistake", 14: "Returned unopened — refunded", 21: "Sent a VF Golden sample with it" };
    const GIFTS = ["Happy birthday! Lots of love", "Congratulations on the new home", "A little something pink for you"];
    const buyers = people.slice(5, 31);
    const order = [];
    let fresh = 0;
    // oldest first, so repeat customers come back after their first order
    hours
      .map((h, i) => [h, i])
      .reverse()
      .forEach(([h, i], k) => {
        const left = hours.length - k;
        const p = fresh < buyers.length && (left <= buyers.length - fresh || !fresh || R() > 0.3) ? buyers[fresh++] : pick(buyers.slice(0, fresh));
        const t = now - h * HOUR;
        const status = STATUS(i);
        const cc = D.countries[p.country];
        // the basket: 1–4 different products, bestsellers more often
        const items = [];
        for (let n = weighted([[1, 38], [2, 32], [3, 19], [4, 11]]); items.length < n; ) {
          const prod = bestseller();
          if (items.some((x) => x.id === prod.id)) continue;
          const local = prod.prices && prod.prices[cc.currency] != null ? Number(prod.prices[cc.currency]) : cc.decimals ? Math.round(prod.price * markup * cc.rate * 4) / 4 : Math.round(prod.price * markup * cc.rate);
          items.push({ id: prod.id, name: FRAGRANCE.has(prod.type) ? `${prod.line} ${(D.types[prod.type] || {}).en || ""}`.trim() : prod.line, qty: R() < 0.82 ? 1 : 2, price: local });
        }
        // an ambassador's code on about a third of them
        const amb =
          R() < 0.34 &&
          weighted(db.ambassadors.map((a, j) => [a, AMB_WEIGHT[j]]).filter(([a]) => Date.parse(a.created_at) < t && (a.status === "active" || t < now - 25 * DAY)).concat([[null, 0.001]]));
        const sub = round3(items.reduce((s, x) => s + x.price * x.qty, 0));
        const disc = amb ? (cc.decimals ? round3((sub * friendPct) / 100) : Math.round((sub * friendPct) / 100)) : 0;
        const delivery = sub >= cc.freeOver ? 0 : cc.fee;
        const total = round3(sub - disc + delivery);
        const pct = amb ? settings.referral.tiers[0].pct : null;
        const c = customer(p, "checkout", t);
        const o = {
          id: uuid(),
          number: "",
          status,
          country: p.country,
          currency: cc.currency,
          lang: p.v.lang,
          items,
          subtotal: sub,
          discount: disc,
          delivery,
          total,
          total_aed: round2(total / cc.rate),
          ref_code: amb ? amb.code : null,
          ambassador_id: amb ? amb.id : null,
          commission_pct: pct,
          commission_aed: amb ? round2(((Math.max(sub - disc, 0) / cc.rate) * pct) / 100) : null,
          commission_paid: !!amb && status === "delivered" && h > 18 * 24,
          customer: { name: p.name, email: R() < 0.8 ? p.email : "", phone: p.tel, city: p.city, area: p.area, street: p.street, apt: p.apt, notes: R() < 0.2 ? pick(["Please call when you arrive", "Leave it with the concierge", "Evening delivery if possible"]) : "" },
          customer_id: c.id,
          payment: weighted(cc.pay.map((m) => [m, { cod: 28, card: 26, applepay: 24, mada: 14, knet: 14, benefit: 10, tabby: 8, tamara: 5 }[m] || 5])),
          gift_note: i % 9 === 4 ? GIFTS[(i / 9) | 0] || GIFTS[0] : null,
          note: NOTES[i] || null,
          created_at: iso(t),
          updated_at: iso(Math.min(now, t + (status === "new" ? 0 : int(2, 30) * HOUR))),
        };
        order.push(o);
        c.orders_count++;
        c.spent_aed = round2(c.spent_aed + o.total_aed);
        if (R() < 0.55) c.marketing = true;
        // the visit that ended in the order, and for a first order a look around a few days before
        if (c.orders_count === 1) seen(p, t - int(1, 5) * DAY - int(1, 10) * HOUR, ["home", "shop", "product"]);
        seen(p, t - int(6, 25) * 60e3, ["home", ["product", visitPath("product", items[0])], ...(items[1] ? [["product", visitPath("product", items[1])]] : []), "checkout"], { ref: amb && amb.code });
      });
    db.orders = order.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    db.orders.forEach((o, i) => (o.number = "WPG-" + (100001 + i)));

    // Some buyers joined the Club first; one signs in with Google.
    buyers.forEach((p, i) => {
      const c = rows.get(p);
      if (!c) return;
      if (i % 3 === 0) {
        const t = Date.parse(c.first_seen) - int(1, 12) * DAY;
        customer(p, "club", t);
        c.sources.sort((a) => (a === "club" ? -1 : 1));
        c.marketing = true;
        if (R() < 0.6) c.details.birthday = `${pad(int(1, 12))}-${pad(int(1, 28))}`;
      }
      if (i === 4) Object.assign(c, { user_id: uuid(), provider: "google" }), c.sources.push("account");
      if (i === 7) c.note = "Prefers WhatsApp messages in Arabic";
      if (i === 12) c.note = "Regular — sent a thank-you sample";
    });

    // People who only left their details: Club, newsletter, store interest.
    people.slice(31, 40).forEach((p, i) => {
      const source = ["club", "club", "newsletter", "club", "stores", "club", "newsletter", "stores", "club"][i];
      const t = now - (1 + R() * 84) * DAY;
      const c = customer(p, source, t);
      c.marketing = source !== "stores" || R() < 0.5;
      if (source === "club" && R() < 0.6) c.details.birthday = `${pad(int(1, 12))}-${pad(int(1, 28))}`;
      if (source === "stores") {
        const store = (D.stores || []).find((s) => s.country === p.country);
        c.details.storeCity = store ? store.city[0] : "Dubai";
      }
      seen(p, t - 3 * 60e3, source === "stores" ? ["home", "stores"] : source === "club" ? ["home", "shop"] : ["home", "product"]);
    });
    db.customers = [...rows.values()];

    // Everyone else: a store a few months old, growing, busier on Thursday and Friday and in a campaign week.
    const day0 = Math.floor(now / DAY) * DAY;
    const pool = [];
    for (let d = 89; d >= 0; d--) {
      const start = day0 - d * DAY;
      const wd = new Date(start).getUTCDay();
      const n = Math.round((16 + (89 - d) * 0.72) * (wd === 4 || wd === 5 ? 1.3 : 1) * (d >= 9 && d <= 13 ? 1.75 : 1) * (0.85 + R() * 0.3));
      for (let s = 0; s < n; s++) {
        const t = start + (2 + Math.pow(R(), 0.8) * 20) * HOUR; // 6 am to 2 am, Gulf time
        const back = pool.length > 20 && R() < 0.28;
        const v = back ? pool[pool.length - 1 - Math.floor(R() * Math.min(400, pool.length))] : profile(t);
        if (!back) pool.push(v);
        session(v, t, browse());
      }
    }
    db.visits.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    db.visits.forEach((v, i) => (v.id = i + 1));

    // Link visits: more than the recorded ones (not every friend accepts cookies).
    db.ambassadors.forEach((a) => {
      const sessions = new Set(db.visits.filter((v) => v.ref_code === a.code).map((v) => v.session_id));
      a.clicks = Math.round(sessions.size * 1.5) + int(2, 9);
    });
    return db;
  }

  /* ---------- admin_overview, as the database works it out ---------- */
  function overview(db, days) {
    const from = Date.now() - Math.max(1, Math.min(Number(days) || 30, 366)) * DAY;
    const vs = db.visits.filter((v) => Date.parse(v.created_at) >= from);
    const group = (rows, key, val, limit) => {
      const m = new Map();
      rows.forEach((r) => {
        const k = key(r);
        if (!m.has(k)) m.set(k, new Set());
        m.get(k).add(val(r));
      });
      return [...m]
        .map(([k, s]) => ({ k, n: s.size }))
        .sort((a, b) => b.n - a.n)
        .slice(0, limit || 1e9);
    };
    const host = (u) => ((u || "").match(/^https?:\/\/(?:www\.)?([^/:]+)/) || [])[1];
    const byDay = new Map();
    vs.forEach((v) => {
      const d = v.created_at.slice(0, 10);
      if (!byDay.has(d)) byDay.set(d, { day: d, visits: 0, u: new Set() });
      const x = byDay.get(d);
      x.visits++;
      x.u.add(v.visitor_id);
    });
    const live = db.orders.filter((o) => Date.parse(o.created_at) >= from && o.status !== "cancelled" && o.status !== "returned");
    let n = 0;
    return {
      visits: vs.length,
      visitors: new Set(vs.map((v) => v.visitor_id)).size,
      byDay: [...byDay.values()].sort((a, b) => (a.day < b.day ? -1 : 1)).map((x) => ({ day: x.day, visits: x.visits, visitors: x.u.size })),
      pages: group(vs, (v) => v.page || "?", () => n++, 10),
      sources: group(vs, (v) => (v.utm && v.utm.source) || (v.ref_code ? "ambassador " + v.ref_code : null) || host(v.referrer) || "direct", (v) => v.session_id, 10),
      geo: group(vs, (v) => v.geo || "?", (v) => v.visitor_id, 12),
      devices: group(vs, (v) => v.device || "?", (v) => v.visitor_id),
      langs: group(vs, (v) => v.lang || "?", (v) => v.visitor_id),
      orders: live.length,
      revenueAed: round2(live.reduce((s, o) => s + Number(o.total_aed), 0)),
      ordersByStatus: db.orders.reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {}),
      customers: db.customers.length,
      newCustomers: db.customers.filter((c) => Date.parse(c.first_seen) >= from).length,
      marketing: db.customers.filter((c) => c.marketing).length,
      ambassadors: db.ambassadors.length,
      refClicks: db.ambassadors.reduce((s, a) => s + (a.clicks || 0), 0),
      commissionDueAed: round2(db.orders.filter((o) => o.status === "delivered" && !o.commission_paid).reduce((s, o) => s + Number(o.commission_aed || 0), 0)),
    };
  }

  /* ---------- the query builder: from(table).select/insert/update/upsert/delete + filters ---------- */
  const KEYS = { products: "id", settings: "key", admins: "email" };
  const same = (a, b) => a === b || (a != null && b != null && typeof a !== "object" && String(a) === String(b));
  const cmp = (a, b) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a < b ? -1 : a > b ? 1 : 0);
  // "*, ambassadors(code,name)" → ["*", "ambassadors(code,name)"]
  const columns = (s) => {
    const out = [];
    let depth = 0;
    let cur = "";
    for (const ch of String(s || "*")) {
      if (ch === "," && !depth) (out.push(cur.trim()), (cur = ""));
      else (cur += ch), (depth += ch === "(" ? 1 : ch === ")" ? -1 : 0);
    }
    out.push(cur.trim());
    return out.filter(Boolean);
  };
  function shape(db, row, cols) {
    const out = {};
    columns(cols).forEach((c) => {
      if (c === "*") return Object.assign(out, clone(row));
      const m = c.match(/^(\w+)\((.*)\)$/); // a linked table: orders → ambassadors via ambassador_id
      if (m) {
        const rel = (db[m[1]] || []).find((x) => x.id === row[m[1].replace(/s$/, "") + "_id"]);
        out[m[1]] = rel ? shape(db, rel, m[2]) : null;
      } else out[c] = row[c] === undefined ? null : clone(row[c]);
    });
    return out;
  }
  // Column defaults, as in supabase/schema.sql.
  function fresh(table, row) {
    const t = iso(Date.now());
    const base = {
      products: { active: true, sort: 0, created_at: t, updated_at: t },
      orders: { id: uuid(), status: "new", discount: 0, delivery: 0, commission_paid: false, created_at: t, updated_at: t },
      customers: { id: uuid(), sources: [], marketing: false, details: {}, orders_count: 0, spent_aed: 0, first_seen: t, last_seen: t },
      ambassadors: { id: uuid(), status: "active", clicks: 0, created_at: t },
      admins: { created_at: t },
      settings: { updated_at: t },
      visits: { created_at: t },
    }[table];
    return Object.assign({}, base || { id: uuid() }, clone(row));
  }

  function Query(db, table) {
    this.db = db;
    this.table = table;
    this.action = "select";
    this.cols = "*";
    this.opts = {};
    this.filters = [];
    this.sorts = [];
    this.skip = 0;
    this.take = Infinity;
    this.one = false;
    this.back = false;
  }
  Query.prototype = {
    select(cols, opts) {
      if (this.action === "select") this.opts = opts || {};
      else this.back = true; // after a write: send the rows back
      this.cols = cols || "*";
      return this;
    },
    insert(rows) {
      return Object.assign(this, { action: "insert", rows: [].concat(rows) });
    },
    upsert(rows) {
      return Object.assign(this, { action: "upsert", rows: [].concat(rows) });
    },
    update(patch) {
      return Object.assign(this, { action: "update", patch });
    },
    delete() {
      return Object.assign(this, { action: "delete" });
    },
    where(f) {
      this.filters.push(f);
      return this;
    },
    eq(c, v) {
      return this.where((r) => same(r[c], v));
    },
    neq(c, v) {
      return this.where((r) => !same(r[c], v));
    },
    gt(c, v) {
      return this.where((r) => r[c] != null && r[c] > v);
    },
    gte(c, v) {
      return this.where((r) => r[c] != null && r[c] >= v);
    },
    lt(c, v) {
      return this.where((r) => r[c] != null && r[c] < v);
    },
    lte(c, v) {
      return this.where((r) => r[c] != null && r[c] <= v);
    },
    in(c, list) {
      return this.where((r) => (list || []).some((v) => same(r[c], v)));
    },
    is(c, v) {
      return this.where((r) => (v === null ? r[c] == null : r[c] === v));
    },
    ilike(c, pattern) {
      const re = new RegExp("^" + String(pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
      return this.where((r) => re.test(String(r[c] == null ? "" : r[c])));
    },
    match(obj) {
      Object.keys(obj).forEach((c) => this.eq(c, obj[c]));
      return this;
    },
    not(c, op, v) {
      const f = new Query(this.db, this.table)[op](c, v).filters[0];
      return this.where((r) => !f(r));
    },
    order(c, o) {
      this.sorts.push([c, !o || o.ascending !== false]);
      return this;
    },
    range(a, b) {
      return Object.assign(this, { skip: a, take: b - a + 1 });
    },
    limit(n) {
      this.take = Math.min(this.take, n);
      return this;
    },
    single() {
      return Object.assign(this, { one: true });
    },
    maybeSingle() {
      return Object.assign(this, { one: "maybe" });
    },
    then(ok, ko) {
      return new Promise((done) => done(this.run())).then(ok, ko);
    },
    catch(ko) {
      return this.then(null, ko);
    },
    finally(f) {
      return this.then().finally(f);
    },
    run() {
      const db = this.db;
      const all = db[this.table] || (db[this.table] = []);
      const match = (r) => this.filters.every((f) => f(r));
      const key = KEYS[this.table] || "id";
      let out = [];
      if (this.action === "select") {
        let rows = all.filter(match);
        if (this.sorts.length) rows.sort((a, b) => this.sorts.reduce((x, [c, asc]) => x || (asc ? 1 : -1) * cmp(a[c], b[c]), 0));
        const count = this.opts.count ? rows.length : null;
        if (this.opts.head) return { data: null, count, error: null, status: 200 };
        rows = rows.slice(this.skip, this.skip + this.take);
        return this.done(rows.map((r) => shape(db, r, this.cols)), count);
      }
      const now = iso(Date.now());
      if (this.action === "insert") {
        for (const row of this.rows) {
          const r = fresh(this.table, row);
          if (this.table === "admins") r.email = String(r.email || "").trim().toLowerCase();
          if (all.some((x) => same(x[key], r[key]))) return { data: null, error: { message: `duplicate key value violates unique constraint "${this.table}_pkey"`, code: "23505" }, status: 409 };
          all.push(r);
          out.push(r);
        }
      } else if (this.action === "upsert") {
        for (const row of this.rows) {
          const r = all.find((x) => same(x[key], row[key]));
          if (r) out.push(Object.assign(r, clone(row), "updated_at" in r ? { updated_at: now } : {}));
          else all.push((out[out.length] = fresh(this.table, row)));
        }
      } else if (this.action === "update") {
        out = all.filter(match);
        out.forEach((r) => Object.assign(r, clone(this.patch), "updated_at" in r ? { updated_at: now } : {}));
      } else if (this.action === "delete") {
        out = all.filter(match);
        db[this.table] = all.filter((r) => !match(r));
        // on delete set null, as in the schema
        const link = { ambassadors: "ambassador_id", customers: "customer_id" }[this.table];
        if (link) db.orders.forEach((o) => out.some((r) => r.id === o[link]) && (o[link] = null));
      }
      return this.done(this.back ? out.map((r) => shape(db, r, this.cols)) : null);
    },
    done(data, count) {
      if (this.one && data) {
        if (data.length === 1 || (this.one === "maybe" && !data.length)) return { data: data[0] || null, error: null, status: 200 };
        return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" }, status: 406 };
      }
      return { data, count: count == null ? null : count, error: null, status: 200 };
    },
  };

  /* ---------- the stand-in client ---------- */
  let client = null;
  function createClient() {
    if (client) return client;
    const db = build();
    const ok = (data) => Promise.resolve({ data, error: null });
    const user = {
      id: "00000000-0000-4000-8000-00000000d3e0",
      aud: "authenticated",
      role: "authenticated",
      email: EMAIL,
      email_confirmed_at: iso(Date.now() - 120 * DAY),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { name: "Demo", full_name: "Demo" },
      created_at: iso(Date.now() - 120 * DAY),
    };
    const session = { access_token: "demo", refresh_token: "demo", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user };
    const uploads = new Map();
    client = {
      auth: {
        getSession: () => ok({ session }),
        getUser: () => ok({ user }),
        refreshSession: () => ok({ session, user }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        signInWithPassword: () => ok({ user, session }),
        signInWithOAuth: () => ok({ provider: null, url: null }),
        signUp: () => ok({ user, session }),
        updateUser: () => ok({ user }),
        resetPasswordForEmail: () => ok({}),
        // Signing out starts the demo again.
        signOut: () => (setTimeout(() => location.reload(), 0), Promise.resolve({ error: null })),
      },
      rpc: (name, args) => {
        if (name === "is_admin") return ok(true);
        if (name === "admin_overview") return ok(overview(db, args && args.p_days));
        return Promise.resolve({ data: null, error: { message: `${name} isn't part of the demo` } });
      },
      from: (table) => new Query(db, table),
      // Uploaded photos stay in this browser tab.
      storage: {
        from: (bucket) => ({
          upload: (path, file) => (uploads.set(bucket + "/" + path, URL.createObjectURL(file)), ok({ path, id: uuid(), fullPath: bucket + "/" + path })),
          getPublicUrl: (path) => ({ data: { publicUrl: uploads.get(bucket + "/" + path) || "" } }),
          remove: (paths) => ok((paths || []).map((name) => ({ name }))),
        }),
      },
    };
    window.WP_DEMO_DB = db; // for a look from the console
    return client;
  }
  window.supabase = Object.assign({}, window.supabase, { createClient });
  // admin.js needs a database address to start; the demo never uses it.
  const cfg = window.WP_DATA && window.WP_DATA.config;
  if (cfg && !(cfg.supabase && cfg.supabase.url)) cfg.supabase = { url: "https://demo.invalid", key: "demo" };

  // The tabs write their name in the address; keep #demo there so a reload stays in the demo.
  if (location.hash === "#demo") {
    const replace = history.replaceState.bind(history);
    history.replaceState = (state, title, url) => replace(state, title, typeof url === "string" && url.charAt(0) === "#" ? "#demo" : url);
  }

  /* ---------- the banner ---------- */
  function banner() {
    const css = document.createElement("style");
    css.textContent = `
      .demo-bar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 16px; background: var(--blush); border-bottom: 1px solid var(--line-2); color: var(--ink-2); font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; }
      .demo-bar strong { color: var(--pink-600); font-weight: 800; letter-spacing: 0.04em; }
      .adm { min-height: calc(100vh - 30px); }
      .side { top: 30px; height: calc(100vh - 30px); }
      @media (max-width: 860px) { .side { height: auto; } }
      @media (max-width: 440px) { .demo-bar .opt { display: none; } }`;
    document.head.appendChild(css);
    const bar = document.createElement("div");
    bar.className = "demo-bar";
    bar.setAttribute("role", "note");
    bar.innerHTML = `<strong>Demo</strong> · <span class="opt">sample orders and visitors · </span>changes aren't saved`;
    document.body.prepend(bar);
  }
  if (document.body) banner();
  else document.addEventListener("DOMContentLoaded", banner);
})();
