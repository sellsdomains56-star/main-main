/* wepink Gulf — WhatsApp button and the beauty assistant.
 *
 * Two round buttons in the bottom corner:
 *  - WhatsApp opens a small card (hours, quick topics, "Start chat"), as on
 *    wepink Brazil;
 *  - "Ask wepink" opens the assistant: a chat that answers from the help
 *    centre (data.js `faq`), recommends products from the catalogue (by scent
 *    family, notes, type, who it's for, budget or name) and can send its
 *    picks to the shopper's WhatsApp (saved as a Club contact, with consent).
 * It runs in the browser: no service, no cost per message. Set
 * `config.assistant.endpoint` to a server that answers with a language model
 * ({ reply, products: [ids] }) and the assistant asks it first, falling back
 * to the built-in answers when it can't be reached.
 */
window.WP_ASSIST = (function () {
  const W = window.WP;
  const D = W.data;
  const { t, L, esc, icon } = W;
  const KEY = "wpg.chat";

  /* ---------- understanding text (Arabic and English) ---------- */
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // English words match from the start of a word ("allerg" finds "allergic",
  // "call" doesn't fire inside "dermatologically"), and short ones must stand
  // alone ("men" is not inside "women"). Arabic words match anywhere, since
  // prefixes attach to them (العطر، بالعود), except two-letter ones like "له".
  function hit(text, word) {
    const w = norm(word);
    if (!w) return false;
    const padded = " " + text + " ";
    if (/^[a-z0-9 ]+$/.test(w)) return w.length <= 3 ? padded.includes(" " + w + " ") : padded.includes(" " + w);
    return w.length <= 2 ? padded.includes(" " + w + " ") : text.includes(w);
  }
  const has = (text, words) => words.reduce((n, w) => n + (hit(text, w) ? 1 : 0), 0);

  // Help-centre answers, by [topic id, question number], and the words that point to them.
  const INTENTS = [
    [["orders", 0], ["which countries", "deliver to", "ship to", "countries", "دول", "دوله", "توصلون", "تشحنون"]],
    [["orders", 1], ["how long", "delivery to", "delivery time", "delivery", "التوصيل", "when will", "arrive", "how many days", "مده", "متي يوصل", "كم يوم", "يستغرق", "متى يوصل", "يوصل"]],
    [["orders", 2], ["delivery fee", "delivery cost", "shipping cost", "free delivery", "free shipping", "how much is delivery", "تكلفه التوصيل", "رسوم", "توصيل مجاني", "شحن مجاني", "سعر التوصيل"]],
    [["orders", 3], ["track", "tracking", "where is my order", "order status", "تتبع", "وين طلبي", "اين طلبي", "حاله الطلب"]],
    [["orders", 4], ["wrong address", "change address", "change my address", "عنوان خطا", "تغيير العنوان", "العنوان"]],
    [["orders", 5], ["outside", "international", "abroad", "europe", "خارج"]],
    [["payment", 0], ["payment method", "pay with", "card", "visa", "mastercard", "apple pay", "mada", "knet", "benefit", "طرق الدفع", "بطاقه", "فيزا", "ماستر", "مدي", "كي نت", "ابل باي"]],
    [["payment", 1], ["cash", "cod", "on delivery", "عند الاستلام", "كاش", "نقدا", "نقد"]],
    [["payment", 2], ["tabby", "tamara", "instalment", "installment", "split", "تابي", "تمارا", "تقسيط", "اقساط", "دفعات"]],
    [["payment", 3], ["safe to pay", "secure", "fraud", "امان", "امن", "احتيال"]],
    [["payment", 4], ["vat", "tax", "ضريبه"]],
    [["returns", 0], ["return policy", "returns", "return", "send back", "ارجاع", "استرجاع", "ارجع"]],
    [["returns", 1], ["exchange", "swap", "replace", "استبدال", "تبديل", "ابدل"]],
    [["returns", 2], ["refund", "money back", "استرداد", "فلوسي", "ارجاع المبلغ"]],
    [["returns", 3], ["damaged", "broken", "wrong item", "leaked", "missing", "تالف", "مكسور", "ناقص", "غلط"]],
    [["products", 0], ["authentic", "original", "fake", "genuine", "real", "اصلي", "تقليد", "مقلد"]],
    [["products", 1], ["dermatolog", "skin tested", "sensitive skin", "مختبره جلديا", "بشره حساسه", "جلديا"]],
    [["products", 2], ["animal", "cruelty", "vegan", "حيوان", "حيوانات"]],
    [["products", 3], ["pregnan", "breastfeed", "حامل", "الحمل", "رضاعه", "مرضع"]],
    [["products", 4], ["allerg", "reaction", "rash", "itch", "حساسيه", "تحسس", "حكه", "احمرار"]],
    [["products", 5], ["last", "longevity", "heat", "summer", "long lasting", "يدوم", "ثبات", "ثابت", "الحر", "صيف"]],
    [["about", 0], ["who is wepink", "about wepink", "virginia", "the brand", "من هي", "فيرجينيا", "عن الماركه"]],
    [["about", 1], ["where to buy", "buy safely", "amazon", "noon", "اين اشتري", "وين اشتري", "نون", "امازون"]],
    [["about", 2], ["store", "location", "mall", "branch", "boutique", "متجر", "فرع", "محل", "مول", "معرض"]],
    [["account", 0], ["account", "guest", "sign in", "login", "log in", "حساب", "تسجيل الدخول"]],
    [["account", 1], ["email", "e-mail", "ايميل", "بريد"]],
    [["account", 2], ["club", "newsletter", "offers", "birthday", "نادي", "عروض", "عيد ميلاد"]],
    [["account", 3], ["ambassador", "affiliate", "commission", "influencer", "earn", "سفيره", "عموله", "اربح", "مسوقه"]],
  ];
  const HUMAN = ["human", "agent", "person", "someone", "whatsapp", "call", "talk to", "speak to", "موظف", "شخص", "واتساب", "اتصل", "اكلم", "خدمه العملاء"];
  const HELLO = ["hi", "hello", "hey", "salam", "good morning", "good evening", "مرحبا", "السلام", "هلا", "اهلا", "هاي", "صباح", "مساء"];
  const THANKS = ["thank", "thx", "شكرا", "مشكور", "يعطيك العافيه", "تسلمين", "تسلم"];

  const CUES = {
    want: ["recommend", "suggest", "looking for", "want", "need", "find", "show me", "best", "which", "perfume", "scent", "smell", "fragrance", "gift", "present", "اقترح", "انصح", "ابغي", "ابي", "اريد", "ودي", "عطر", "ريحه", "رائحه", "هديه", "افضل", "ايش", "وش"],
    type: {
      splash: ["body splash", "splash", "mist", "بودي سبلاش", "سبلاش", "معطر الجسم", "معطر"],
      colonia: ["perfume", "cologne", "eau de", "fragrance", "parfum", "عطر", "عطور", "العطر", "كولونيا", "برفيوم"],
      body: ["cream", "lotion", "moisturi", "body oil", "scrub", "كريم", "لوشن", "مرطب", "زيت الجسم", "مقشر"],
      hair: ["hair", "شعر"],
      makeup: ["makeup", "make up", "lip", "gloss", "lipstick", "blush", "foundation", "مكياج", "شفاه", "روج", "قلوس", "احمر"],
      skin: ["skin", "serum", "face", "sunscreen", "spf", "بشره", "سيروم", "وجه", "واقي"],
      set: ["gift set", "set", "kit", "box", "طقم", "بوكس", "مجموعه"],
    },
    family: {
      sweet: ["sweet", "gourmand", "vanilla", "caramel", "candy", "chocolate", "حلو", "فانيلا", "فانيليا", "كراميل", "شوكولا"],
      floral: ["floral", "flower", "fruity", "rose", "jasmine", "زهري", "ورد", "ياسمين", "فاكهي", "زهور"],
      fresh: ["fresh", "citrus", "clean", "light", "aquatic", "منعش", "حمضي", "خفيف", "نظيف"],
      warm: ["warm", "oriental", "oud", "amber", "spicy", "musk", "شرقي", "دافئ", "عود", "عنبر", "مسك", "بخور"],
      woody: ["woody", "wood", "sandalwood", "cedar", "خشبي", "صندل", "خشب"],
    },
    men: ["men", "man", "male", "him", "his", "husband", "boyfriend", "father", "dad", "brother", "masculine", "رجال", "رجالي", "رجل", "له", "زوجي", "ابوي", "اخوي", "خطيبي", "شباب"],
    women: ["women", "woman", "her", "wife", "mom", "mum", "mother", "sister", "girlfriend", "daughter", "feminine", "نسائي", "نساء", "بنات", "لها", "امي", "زوجتي", "اختي", "بنتي", "خطيبتي", "صديقتي"],
    best: ["best", "bestseller", "best seller", "popular", "top", "most loved", "favourite", "favorite", "trending", "الاكثر مبيعا", "افضل", "مشهور", "ترند", "الاكثر"],
    fresh: ["new", "latest", "newest", "جديد", "الجديد"],
    gift: ["gift", "present", "هديه", "اهدي"],
  };
  const TYPE_OF = { splash: ["splash", "hairmist"], colonia: ["colonia"], body: ["cream", "lotion", "bodyoil", "scrub", "butter", "shower", "soap", "rollon"], hair: ["haircare", "hairmist"], makeup: ["makeup"], skin: ["skincare"], set: ["set"] };
  const CAT_OF = { hair: "hair", makeup: "makeup", skin: "skincare", set: "gift-sets", body: "body-care" };

  // every scent note in the catalogue, in both languages
  let NOTES = null;
  function notes() {
    if (NOTES) return NOTES;
    NOTES = new Map();
    for (const p of D.products) {
      for (const layer of Object.values(p.notes || {})) {
        for (const pair of layer) {
          const en = norm(pair[0]);
          const ar = norm(pair[1]);
          [en, ar].forEach((k) => k && k.length > 2 && NOTES.set(k, en));
        }
      }
    }
    return NOTES;
  }
  const noteHits = (q) => [...notes().keys()].filter((k) => (" " + q + " ").includes(" " + k + " ") || (k.length > 4 && q.includes(k)));

  function budget(raw) {
    const m = raw.match(/(?:under|below|less than|max|up to|within|اقل من|تحت|بحدود|حدود|ما يزيد عن|لا يتجاوز)\s*([0-9٠-٩]+)/i);
    if (!m) return 0;
    return Number(m[1].replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  // products whose name (English or Arabic letters) is in the question; the
  // longest name wins, so "heaven blue" beats "heaven"
  function namedProducts(q) {
    let best = 0;
    const found = [];
    for (const p of D.products) {
      for (const n of [norm(p.line), norm(p.lineAr || "")]) {
        if (n.length > 2 && hit(q, n) && (" " + q + " ").includes(" " + n + " ")) {
          if (n.length > best) {
            best = n.length;
            found.length = 0;
          }
          if (n.length === best) found.push(p);
        }
      }
    }
    return found;
  }

  // pick up to three products (one per line) for what the shopper asked
  function recommend(raw) {
    const q = norm(raw);
    const types = Object.keys(CUES.type).filter((k) => has(q, CUES.type[k]));
    const fams = Object.keys(CUES.family).filter((k) => has(q, CUES.family[k]));
    const men = has(q, CUES.men) > 0;
    const women = has(q, CUES.women) > 0;
    const best = has(q, CUES.best) > 0;
    const fresh = has(q, CUES.fresh) > 0;
    const gift = has(q, CUES.gift) > 0;
    const hits = noteHits(q);
    const max = budget(raw);
    // a product named outright wins
    const named = namedProducts(q);
    const scored = D.products
      .filter((p) => !max || W.priceOf(p) <= max)
      .map((p) => {
        let s = 0;
        if (named.includes(p)) s += 20;
        if (types.length) {
          const ok = types.some((k) => (TYPE_OF[k] || []).includes(p.type) || p.cat === CAT_OF[k]);
          s += ok ? 6 : -8;
        }
        if (fams.length) s += fams.includes(p.family) ? 4 : 0;
        if (hits.length) {
          const mine = Object.values(p.notes || {}).flat().map((pair) => norm(pair[0]));
          s += hits.filter((h) => mine.includes(notes().get(h))).length * 4;
        }
        if (men) s += p.gender === "masculino" ? 6 : p.gender === "unissex" ? 2 : -6;
        else if (women) s += p.gender === "feminino" ? 3 : p.gender === "masculino" ? -6 : 0;
        if (gift && (p.type === "set" || p.cat === "gift-sets")) s += 3;
        if (best && p.badge === "bestseller") s += 4;
        if (fresh && p.badge === "new") s += 4;
        if (p.badge === "bestseller") s += 1;
        if (p.type === "colonia" || p.type === "splash") s += 0.5;
        return { p, s };
      })
      .sort((a, b) => b.s - a.s);
    const out = [];
    const lines = new Set();
    for (const { p, s } of scored) {
      if (s <= 0 && out.length) break;
      if (lines.has(p.line)) continue;
      lines.add(p.line);
      out.push(p);
      if (out.length === 3) break;
    }
    return { products: out, named: named.length > 0 };
  }

  function faqAnswer(topic, n) {
    const g = D.faq.find((x) => x.id === topic);
    const it = g && g.items[n];
    if (!it) return "";
    const c = W.country();
    const vars = { free: W.money(c.freeOver), fee: W.money(c.fee), days: D.config.returnsDays, delivery: L(c.delivery), country: L(c.name), vat: c.vat, hours: D.config.hours, email: D.config.email };
    return L(it.a).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }

  // the built-in brain: returns { text, products?, chips?, wa?, offer? }
  function answer(raw) {
    const q = norm(raw);
    if (!q) return { text: t("ai.empty"), chips: starters() };
    const productCue =
      has(q, CUES.want) + has(q, CUES.men) + has(q, CUES.women) + has(q, CUES.best) + has(q, CUES.gift) +
      Object.values(CUES.type).reduce((n, w) => n + has(q, w), 0) +
      Object.values(CUES.family).reduce((n, w) => n + has(q, w), 0) +
      noteHits(q).length;
    let best = null;
    let bestScore = 0;
    for (const [ref, words] of INTENTS) {
      const s = has(q, words);
      if (s > bestScore) {
        best = ref;
        bestScore = s;
      }
    }
    const named = namedProducts(q);
    const specific = productCue - has(q, CUES.want);
    if (has(q, HUMAN) && !specific && !named.length) return { text: t("ai.human", { hours: D.config.hours }), wa: true };
    if (named.length && bestScore < 2) {
      const types = Object.keys(CUES.type).filter((k) => has(q, CUES.type[k]));
      const order = ["colonia", "splash", "cream", "lotion", "bodyoil", "hairmist", "rollon"];
      const rank = (p) => (types.some((k) => (TYPE_OF[k] || []).includes(p.type)) ? -10 : 0) + (order.includes(p.type) ? order.indexOf(p.type) : 9);
      const list = named.slice().sort((a, b) => rank(a) - rank(b)).slice(0, 3);
      return { text: t("ai.found"), products: list, offer: true, chips: [t("ai.c_more"), t("ai.c_best")] };
    }
    if (bestScore && bestScore >= productCue) return { text: faqAnswer(best[0], best[1]), chips: followUps(best[0]), wa: best[0] === "returns" || (best[0] === "orders" && best[1] >= 3) };
    if (productCue) {
      const r = recommend(raw);
      if (r.products.length) return { text: t(r.named ? "ai.found" : "ai.picks"), products: r.products, offer: true, chips: [t("ai.c_more"), t("ai.c_gift"), t("ai.c_men")] };
    }
    if (has(q, HELLO)) return { text: t("ai.hello"), chips: starters() };
    if (has(q, THANKS)) return { text: t("ai.thanks"), chips: starters() };
    return { text: t("ai.unsure"), chips: starters(), wa: true };
  }
  function starters() {
    return [t("ai.c_find"), t("ai.c_best"), t("ai.c_delivery", { country: L(W.country().short) }), t("ai.c_cod"), t("ai.c_returns")];
  }
  function followUps(topic) {
    const map = {
      orders: [t("ai.c_track"), t("ai.c_cod"), t("ai.c_find")],
      payment: [t("ai.c_tabby"), t("ai.c_delivery", { country: L(W.country().short) }), t("ai.c_find")],
      returns: [t("ai.c_refund"), t("ai.c_find")],
      products: [t("ai.c_best"), t("ai.c_find")],
      about: [t("ai.c_best"), t("ai.c_stores")],
      account: [t("ai.c_find"), t("ai.c_best")],
    };
    return map[topic] || starters();
  }

  // a language-model service, when one is configured
  function remote(history) {
    const cfg = D.config.assistant || {};
    if (!cfg.endpoint) return Promise.reject(new Error("off"));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang: W.state.lang, country: W.state.country, messages: history.slice(-12).map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })) }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        clearTimeout(timer);
        if (!j || !j.reply) throw new Error("empty");
        const products = (j.products || []).map((id) => W.product(id)).filter(Boolean).slice(0, 3);
        return { text: String(j.reply), products, offer: products.length > 0 };
      });
  }

  /* ---------- the chat ---------- */
  let log = [];
  try {
    log = JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch (e) {
    log = [];
  }
  const save = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(log.slice(-30)));
    } catch (e) {
      /* ignore */
    }
  };
  const waLink = (text) => `https://wa.me/${D.config.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  function productCard(p) {
    return `<div class="ai-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="ai-card-img"><img src="${esc(p.image || "")}" alt="" loading="lazy"></a>
      <div class="ai-card-text"><a href="product.html?id=${encodeURIComponent(p.id)}"><strong>${esc(W.pname(p))}</strong></a><span class="muted">${esc(L(p.typeName))} · ${esc(W.money(W.priceOf(p)))}</span></div>
      <button class="ai-add" type="button" data-add="${esc(p.id)}" aria-label="${esc(t("card.addLabel", { name: W.fullName(p) }))}">${icon("plus")}</button>
    </div>`;
  }
  function bubble(m, i) {
    if (m.from === "me") return `<div class="ai-msg ai-me"><p>${esc(m.text)}</p></div>`;
    const products = (m.products || []).map((id) => W.product(id)).filter(Boolean);
    const last = i === log.length - 1;
    return `<div class="ai-msg ai-bot">
      <p>${esc(m.text)}</p>
      ${products.length ? `<div class="ai-cards">${products.map(productCard).join("")}</div>` : ""}
      ${m.offer && last && !m.sent ? `<button class="ai-offer" type="button" data-ai-offer>${icon("chat")}<span>${esc(t("ai.offer"))}</span></button>` : ""}
      ${m.capture && !m.sent ? captureForm() : ""}
      ${m.wa ? `<a class="ai-wa" href="${waLink(t("ai.waHello"))}" target="_blank" rel="noopener">${icon("chat")}<span>${esc(t("ai.toWa"))}</span></a>` : ""}
    </div>`;
  }
  function captureForm() {
    const c = W.country();
    return `<form class="ai-capture" novalidate>
      <input name="name" autocomplete="name" placeholder="${esc(t("stores.name"))}" required>
      <div class="input-prefix"><span dir="ltr">${esc(c.dial)}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" placeholder="${esc(t("stores.phone"))}" required></div>
      <label class="ai-agree"><input type="checkbox" name="agree"> <span>${esc(t("ai.agree"))}</span></label>
      <p class="ai-err" aria-live="polite"></p>
      <button class="btn btn-primary btn-sm" type="submit">${esc(t("ai.send"))}</button>
    </form>`;
  }

  let panel = null;
  function paint() {
    if (!panel) return;
    const box = panel.querySelector(".ai-log");
    box.innerHTML = log.map(bubble).join("");
    const lastBot = [...log].reverse().find((m) => m.from === "bot");
    panel.querySelector(".ai-chips").innerHTML = (lastBot && lastBot.chips ? lastBot.chips : starters()).map((c) => `<button type="button" class="ai-chip">${esc(c)}</button>`).join("");
    box.scrollTop = box.scrollHeight;
  }
  function say(m) {
    log.push(m);
    save();
    paint();
  }
  function ask(text) {
    text = String(text || "").trim();
    if (!text) return;
    say({ from: "me", text });
    const box = panel.querySelector(".ai-log");
    box.insertAdjacentHTML("beforeend", `<div class="ai-msg ai-bot ai-typing" aria-label="${esc(t("ai.typing"))}"><span></span><span></span><span></span></div>`);
    box.scrollTop = box.scrollHeight;
    const local = () => answer(text);
    const wait = new Promise((r) => setTimeout(r, 450));
    Promise.all([remote(log).catch(local), wait]).then(([r]) => {
      say({ from: "bot", text: r.text, products: (r.products || []).map((p) => p.id), chips: r.chips, wa: r.wa, offer: r.offer });
    });
  }

  function openPanel() {
    closeCard();
    if (!panel) build();
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-on"));
    if (!log.length) say({ from: "bot", text: t("ai.welcome"), chips: starters() });
    else paint();
    setTimeout(() => panel.querySelector(".ai-input").focus(), 80);
    document.querySelector(".dock-ai").setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("is-on");
    panel.hidden = true;
    document.querySelector(".dock-ai").setAttribute("aria-expanded", "false");
  }

  function build() {
    panel = document.createElement("section");
    panel.className = "ai-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", t("ai.title"));
    panel.hidden = true;
    panel.innerHTML = `
      <header class="ai-head">
        <span class="ai-avatar">${icon("sparkle")}</span>
        <div class="ai-head-text"><strong>${esc(t("ai.title"))}</strong><span>${esc(t("ai.sub"))}</span></div>
        <a class="ai-head-wa" href="${waLink(t("ai.waHello"))}" target="_blank" rel="noopener" aria-label="${esc(t("ai.toWa"))}" title="${esc(t("ai.toWa"))}">${icon("chat")}</a>
        <button class="ai-close" type="button" aria-label="${esc(t("nav.close"))}">${icon("close")}</button>
      </header>
      <div class="ai-log" aria-live="polite"></div>
      <div class="ai-chips"></div>
      <form class="ai-form"><input class="ai-input" autocomplete="off" placeholder="${esc(t("ai.placeholder"))}" aria-label="${esc(t("ai.placeholder"))}"><button class="ai-send" type="submit" aria-label="${esc(t("ai.sendMsg"))}">${icon("arrow", "flip")}</button></form>
      <p class="ai-foot">${esc(t("ai.foot"))}</p>`;
    document.body.appendChild(panel);
    panel.querySelector(".ai-close").addEventListener("click", closePanel);
    panel.querySelector(".ai-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = panel.querySelector(".ai-input");
      ask(input.value);
      input.value = "";
    });
    panel.addEventListener("click", (e) => {
      const chip = e.target.closest(".ai-chip");
      if (chip) return ask(chip.textContent);
      if (e.target.closest("[data-ai-offer]")) {
        const m = [...log].reverse().find((x) => x.from === "bot" && x.offer);
        if (m) m.offer = false;
        say({ from: "bot", text: t("ai.captureAsk"), capture: true, picks: m ? m.products : [] });
      }
    });
    panel.addEventListener("submit", (e) => {
      const form = e.target.closest(".ai-capture");
      if (!form) return;
      e.preventDefault();
      const err = form.querySelector(".ai-err");
      const f = form.elements;
      const name = f.namedItem("name").value.trim();
      const phone = f.namedItem("phone").value.replace(/\D/g, "");
      if (!name || phone.length < 7) return (err.textContent = t("ai.needDetails"));
      if (!f.namedItem("agree").checked) return (err.textContent = t("club.agreeErr"));
      const m = [...log].reverse().find((x) => x.capture && !x.sent);
      const picks = (m && m.picks) || [];
      const c = W.country();
      const entry = Object.assign(
        { source: "club", name, phone: `${c.dial}${phone}`, country: W.state.country, lang: W.state.lang, marketing: true, details: { via: "assistant", picks } },
        W.sync.context ? W.sync.context() : {}
      );
      const done = () => {
        if (m) m.sent = true;
        W.store.set("club", "joined");
        say({ from: "bot", text: t("ai.saved", { name: name.split(" ")[0] }), chips: starters() });
      };
      if (!W.sync.live) return done();
      form.querySelector("[type=submit]").disabled = true;
      W.sync.rpc("save_contact", { p: entry }).then(done, () => {
        form.querySelector("[type=submit]").disabled = false;
        err.textContent = t("form.failed");
      });
    });
    document.addEventListener("keydown", (e) => e.key === "Escape" && (closePanel(), closeCard()));
  }

  /* ---------- WhatsApp card ---------- */
  let card = null;
  function openCard() {
    closePanel();
    if (!card) {
      card = document.createElement("section");
      card.className = "wa-card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", t("wa.title"));
      card.hidden = true;
      document.body.appendChild(card);
      card.addEventListener("click", (e) => e.target.closest(".wa-x") && closeCard());
    }
    const topics = [["wa.t_order", "wa.m_order"], ["wa.t_advice", "wa.m_advice"], ["wa.t_pay", "wa.m_pay"]];
    card.innerHTML = `
      <header class="wa-head"><span class="wa-logo">${icon("chat")}</span><div><strong>wepink ${esc(L(D.config.region))}</strong><span>${esc(t("wa.sub"))}</span></div><button class="wa-x" type="button" aria-label="${esc(t("nav.close"))}">${icon("close")}</button></header>
      <div class="wa-body">
        <p class="wa-bubble">${esc(t("wa.hello"))}<span class="wa-time" dir="ltr">${esc(D.config.hours)}</span></p>
        <div class="wa-topics">${topics.map(([k, m]) => `<a href="${waLink(t(m))}" target="_blank" rel="noopener">${esc(t(k))}</a>`).join("")}</div>
      </div>
      <a class="wa-start" href="${waLink(t("ai.waHello"))}" target="_blank" rel="noopener">${icon("chat")}<span>${esc(t("wa.start"))}</span></a>`;
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add("is-on"));
    document.querySelector(".dock-wa").setAttribute("aria-expanded", "true");
  }
  function closeCard() {
    if (!card || card.hidden) return;
    card.classList.remove("is-on");
    card.hidden = true;
    document.querySelector(".dock-wa").setAttribute("aria-expanded", "false");
  }

  function mount() {
    if (document.querySelector(".dock")) return;
    const dock = document.createElement("div");
    dock.className = "dock";
    dock.innerHTML = `
      <button class="dock-btn dock-wa" type="button" aria-expanded="false" aria-label="${esc(t("wa.title"))}"><span class="dock-label">${esc(t("wa.title"))}</span>${icon("chat")}</button>
      <button class="dock-btn dock-ai" type="button" aria-expanded="false" aria-label="${esc(t("ai.title"))}"><span class="dock-label">${esc(t("ai.ask"))}</span>${icon("sparkle")}</button>`;
    document.body.appendChild(dock);
    dock.querySelector(".dock-wa").addEventListener("click", () => (card && !card.hidden ? closeCard() : openCard()));
    dock.querySelector(".dock-ai").addEventListener("click", () => (panel && !panel.hidden ? closePanel() : openPanel()));
    // "Ask our beauty assistant" anywhere on the page
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.closest('[data-open="assistant"]')) {
          e.preventDefault();
          e.stopPropagation();
          openPanel();
        }
      },
      true
    );
  }
  // Language or country changed: rebuild the words, keep the conversation.
  function refresh() {
    const dock = document.querySelector(".dock");
    if (dock) dock.remove();
    const wasOpen = panel && !panel.hidden;
    if (panel) panel.remove();
    if (card) card.remove();
    panel = null;
    card = null;
    mount();
    if (wasOpen) openPanel();
  }

  document.addEventListener("DOMContentLoaded", mount);
  return { open: openPanel, ask, answer, recommend, refresh };
})();
