/* wepink Gulf — WhatsApp button and Lina, the beauty assistant.
 *
 * Two round buttons in the bottom corner:
 *  - WhatsApp opens a small card (hours, quick topics, "Start chat"), as on
 *    wepink Brazil;
 *  - "Chat with Lina" opens the assistant: wepink Gulf's virtual beauty
 *    advisor (who she is and what she knows: brain.js). She answers from the
 *    help centre (data.js `faq`) and her brain (wepink's story, Virginia,
 *    Samara, Brazil, fragrance know-how), talks about any product (notes, how
 *    to use, ingredients, alcohol, price, sizes, what goes with it, two
 *    products side by side: from the catalogue and details.js), remembers the
 *    shopper's name and the product they're on, recommends from the catalogue
 *    (by scent family, notes, type, who it's for, budget or name) and can send
 *    her picks to the shopper's WhatsApp (saved as a Club contact, with consent).
 * It runs in the browser: no service, no cost per message. Set
 * `config.assistant.endpoint` to a server that answers with a language model
 * ({ reply, products: [ids] }, see supabase/functions/assistant) and she asks
 * it first, with her built-in answer as a hint, falling back to the built-in
 * answers when it can't be reached.
 */
window.WP_ASSIST = (function () {
  const W = window.WP;
  const D = W.data;
  const { t, L, esc, icon } = W;
  const B = window.WP_BRAIN;
  const KEY = "wpg.chat";
  const CTX_KEY = "wpg.chat.ctx";

  /* ---------- understanding text (English, Arabic and Portuguese) ---------- */
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // English and Portuguese words (accents dropped) match from the start of a
  // word ("allerg" finds "allergic" and "alergia" needs its own entry; "call"
  // doesn't fire inside "dermatologically"), and short ones must stand alone
  // ("men" is not inside "women", "ela" not inside "vela"). Arabic words match
  // anywhere, since prefixes attach to them (العطر، بالعود), except two-letter
  // ones like "له".
  function hit(text, word) {
    const w = norm(word);
    if (!w) return false;
    const padded = " " + text + " ";
    if (/^[a-z0-9 ]+$/.test(w)) return w.length <= 3 ? padded.includes(" " + w + " ") : padded.includes(" " + w);
    return w.length <= 2 ? padded.includes(" " + w + " ") : text.includes(w);
  }
  const has = (text, words) => words.reduce((n, w) => n + (hit(text, w) ? 1 : 0), 0);
  // the same, with a matched phrase ("how much is delivery") counting double
  const weigh = (text, words) => words.reduce((n, w) => n + (hit(text, w) ? (w.includes(" ") ? 2 : 1) : 0), 0);

  // Help-centre answers, by [topic id, question number], and the words that point to them.
  const INTENTS = [
    [["orders", 0], ["which countries", "deliver to", "ship to", "countries", "دول", "دوله", "توصلون", "تشحنون", "quais paises", "entregam em", "enviam para", "paises"]],
    [["orders", 1], ["how long", "delivery to", "delivery time", "delivery", "التوصيل", "when will", "arrive", "how many days", "مده", "متي يوصل", "كم يوم", "يستغرق", "متى يوصل", "يوصل", "quanto tempo", "prazo", "prazo de entrega", "entrega", "quando chega", "quantos dias", "demora", "chega"]],
    [["orders", 2], ["delivery fee", "delivery cost", "shipping cost", "free delivery", "free shipping", "how much is delivery", "تكلفه التوصيل", "رسوم", "توصيل مجاني", "شحن مجاني", "سعر التوصيل", "frete", "taxa de entrega", "taxa", "custo da entrega", "frete gratis", "entrega gratis", "quanto custa a entrega", "quanto e o frete"]],
    [["orders", 3], ["track", "tracking", "where is my order", "order status", "تتبع", "وين طلبي", "اين طلبي", "حاله الطلب", "rastrear", "rastreio", "rastreamento", "cade meu pedido", "onde esta meu pedido", "status do pedido", "acompanhar"]],
    [["orders", 4], ["wrong address", "change address", "change my address", "عنوان خطا", "تغيير العنوان", "العنوان", "endereco errado", "mudar o endereco", "trocar o endereco", "alterar o endereco", "endereco"]],
    [["orders", 5], ["outside", "international", "abroad", "europe", "خارج", "internacional", "exterior", "brasil", "no brasil", "para o brasil", "pro brasil", "europa", "fora do golfo"]],
    [["payment", 0], ["payment method", "pay with", "card", "visa", "mastercard", "apple pay", "mada", "knet", "benefit", "طرق الدفع", "بطاقه", "فيزا", "ماستر", "مدي", "كي نت", "ابل باي", "forma de pagamento", "formas de pagamento", "pagar com", "cartao", "pix", "credito", "debito"]],
    [["payment", 1], ["cash", "cod", "on delivery", "عند الاستلام", "كاش", "نقدا", "نقد", "dinheiro", "na entrega", "pagamento na entrega", "pagar na entrega", "em especie"]],
    [["payment", 2], ["tabby", "tamara", "instalment", "installment", "split", "تابي", "تمارا", "تقسيط", "اقساط", "دفعات", "parcelar", "parcelado", "parcelas", "parcela", "dividir", "sem juros"]],
    [["payment", 3], ["safe to pay", "secure", "fraud", "امان", "امن", "احتيال", "seguro pagar", "seguranca", "golpe", "fraude", "confiavel"]],
    [["payment", 4], ["vat", "tax", "ضريبه", "imposto", "impostos", "iva"]],
    [["returns", 0], ["return policy", "returns", "return", "send back", "ارجاع", "استرجاع", "ارجع", "devoluc", "devolv", "politica de devolucao"]],
    [["returns", 1], ["exchange", "swap", "replace", "استبدال", "تبديل", "ابدل", "troca", "trocar", "troco"]],
    [["returns", 2], ["refund", "money back", "استرداد", "فلوسي", "ارجاع المبلغ", "reembolso", "prazo do reembolso", "estorno", "dinheiro de volta", "meu dinheiro"]],
    [["returns", 3], ["damaged", "broken", "wrong item", "leaked", "missing", "تالف", "مكسور", "ناقص", "غلط", "danificado", "quebrado", "veio errado", "produto errado", "vazou", "vazando", "faltando", "avariado"]],
    [["products", 0], ["authentic", "original", "fake", "genuine", "real", "اصلي", "تقليد", "مقلد", "original", "originais", "autentico", "falsificado", "falso", "pirata"]],
    [["products", 1], ["dermatolog", "skin tested", "sensitive skin", "مختبره جلديا", "بشره حساسه", "جلديا", "pele sensivel", "testado dermatologicamente"]],
    [["products", 2], ["animal", "cruelty", "vegan", "حيوان", "حيوانات", "animais", "crueldade", "vegano", "vegana", "testado em animais"]],
    [["products", 3], ["pregnan", "breastfeed", "حامل", "الحمل", "رضاعه", "مرضع", "gravida", "gestante", "gravidez", "amamentando", "amamentacao"]],
    [["products", 4], ["allerg", "reaction", "rash", "itch", "حساسيه", "تحسس", "حكه", "احمرار", "alergia", "alergica", "alergico", "reacao", "irritacao", "coceira", "vermelhidao"]],
    [["products", 5], ["last", "longevity", "heat", "summer", "long lasting", "يدوم", "ثبات", "ثابت", "الحر", "صيف", "fixacao", "fixa", "duracao", "quanto tempo dura", "dura o dia", "calor", "verao"]],
    [["about", 0], ["the brand", "عن الماركه", "a marca"]],
    [["about", 1], ["where to buy", "buy safely", "amazon", "noon", "اين اشتري", "وين اشتري", "نون", "امازون", "onde comprar", "comprar com seguranca", "revendedor"]],
    [["about", 2], ["store", "location", "mall", "branch", "boutique", "متجر", "فرع", "محل", "مول", "معرض", "loja", "lojas", "loja fisica", "quiosque", "shopping"]],
    [["account", 0], ["account", "guest", "sign in", "login", "log in", "حساب", "تسجيل الدخول", "conta", "cadastro", "cadastrar", "entrar", "fazer login", "sem cadastro"]],
    [["account", 1], ["email", "e-mail", "ايميل", "بريد", "meu e-mail"]],
    [["account", 2], ["club", "newsletter", "offers", "birthday", "نادي", "عروض", "عيد ميلاد", "clube", "novidades", "ofertas", "promocao", "promocoes", "aniversario", "cupom"]],
    [["account", 3], ["ambassador", "affiliate", "commission", "influencer", "earn", "سفيره", "عموله", "اربح", "مسوقه", "embaixadora", "afiliada", "comissao", "influenciadora", "ganhar dinheiro", "revender", "revenda", "ganhe"]],
  ];
  const HUMAN = ["human", "agent", "person", "someone", "whatsapp", "call", "talk to", "speak to", "موظف", "شخص", "واتساب", "اتصل", "اكلم", "خدمه العملاء", "atendente", "humano", "pessoa", "falar com", "atendimento", "ligar", "zap"];
  const HELLO = ["hi", "hello", "hey", "salam", "good morning", "good evening", "مرحبا", "السلام", "هلا", "اهلا", "هاي", "صباح", "مساء", "oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai"];
  const THANKS = ["thank", "thx", "شكرا", "مشكور", "يعطيك العافيه", "تسلمين", "تسلم", "obrigad", "valeu", "brigad"];

  const CUES = {
    want: ["recommend", "suggest", "looking for", "want", "need", "find", "show me", "best", "which", "perfume", "scent", "smell", "fragrance", "gift", "present", "اقترح", "انصح", "ابغي", "ابي", "اريد", "ودي", "عطر", "ريحه", "رائحه", "هديه", "افضل", "ايش", "وش", "recomenda", "sugere", "sugestao", "indica", "indicacao", "procurando", "quero", "preciso", "me mostra", "melhor", "qual", "cheiro", "cheirosa", "cheiroso", "fragrancia", "presente"],
    type: {
      splash: ["body splash", "splash", "mist", "بودي سبلاش", "سبلاش", "معطر الجسم", "معطر", "bruma"],
      colonia: ["perfume", "cologne", "eau de", "fragrance", "parfum", "عطر", "عطور", "العطر", "كولونيا", "برفيوم", "colonia", "deo colonia", "desodorante colonia"],
      body: ["cream", "lotion", "moisturi", "body oil", "scrub", "كريم", "لوشن", "مرطب", "زيت الجسم", "مقشر", "creme", "hidratante", "locao", "oleo corporal", "esfoliante", "manteiga"],
      hair: ["hair", "شعر", "cabelo", "cabelos", "capilar"],
      makeup: ["makeup", "make up", "lip", "gloss", "lipstick", "blush", "foundation", "مكياج", "شفاه", "روج", "قلوس", "احمر", "maquiagem", "make", "batom", "labial", "base liquida"],
      skin: ["skin", "serum", "face", "sunscreen", "spf", "بشره", "سيروم", "وجه", "واقي", "pele", "rosto", "protetor solar"],
      set: ["gift set", "set", "kit", "box", "طقم", "بوكس", "مجموعه", "kits", "caixa", "conjunto"],
    },
    family: {
      sweet: ["sweet", "gourmand", "vanilla", "caramel", "candy", "chocolate", "حلو", "فانيلا", "فانيليا", "كراميل", "شوكولا", "doce", "docinho", "baunilha", "caramelo"],
      floral: ["floral", "flower", "fruity", "rose", "jasmine", "زهري", "ورد", "ياسمين", "فاكهي", "زهور", "flor", "flores", "frutado", "frutal", "jasmim"],
      fresh: ["fresh", "citrus", "clean", "light", "aquatic", "منعش", "حمضي", "خفيف", "نظيف", "fresco", "fresquinho", "citrico", "leve", "limpo", "aquatico"],
      warm: ["warm", "oriental", "oud", "amber", "spicy", "musk", "شرقي", "دافئ", "عود", "عنبر", "مسك", "بخور", "quente", "picante", "almiscar", "ambar", "intenso"],
      woody: ["woody", "wood", "sandalwood", "cedar", "خشبي", "صندل", "خشب", "amadeirado", "madeira", "sandalo", "cedro"],
    },
    men: ["men", "man", "male", "him", "his", "husband", "boyfriend", "father", "dad", "brother", "masculine", "رجال", "رجالي", "رجل", "له", "زوجي", "ابوي", "اخوي", "خطيبي", "شباب", "homem", "homens", "masculino", "pra ele", "para ele", "ele", "marido", "namorado", "pai", "irmao", "noivo"],
    women: ["women", "woman", "her", "wife", "mom", "mum", "mother", "sister", "girlfriend", "daughter", "feminine", "نسائي", "نساء", "بنات", "لها", "امي", "زوجتي", "اختي", "بنتي", "خطيبتي", "صديقتي", "mulher", "mulheres", "feminino", "pra ela", "para ela", "ela", "esposa", "mae", "irma", "namorada", "filha", "amiga", "noiva"],
    best: ["best", "bestseller", "best seller", "popular", "top", "most loved", "favourite", "favorite", "trending", "الاكثر مبيعا", "افضل", "مشهور", "ترند", "الاكثر", "mais vendido", "mais vendidos", "queridinho", "queridinhos", "favorito", "sucesso"],
    fresh: ["new", "latest", "newest", "جديد", "الجديد", "novo", "nova", "novidade", "lancamento", "lancamentos"],
    gift: ["gift", "present", "هديه", "اهدي", "presente", "presentear", "mimo"],
  };
  const TYPE_OF = { splash: ["splash", "hairmist"], colonia: ["colonia"], body: ["cream", "lotion", "bodyoil", "scrub", "butter", "shower", "soap", "rollon"], hair: ["haircare", "hairmist"], makeup: ["makeup"], skin: ["skincare"], set: ["set"] };
  const CAT_OF = { hair: "hair", makeup: "makeup", skin: "skincare", set: "gift-sets", body: "body-care" };

  // every scent note in the catalogue, in every language
  let NOTES = null;
  const NOTE_NAMES = new Map(); // English name -> [en, ar, pt]
  function notes() {
    if (NOTES) return NOTES;
    NOTES = new Map();
    for (const p of D.products) {
      for (const layer of Object.values(p.notes || {})) {
        for (const pair of layer) {
          const en = norm(pair[0]);
          NOTE_NAMES.set(en, pair);
          pair.map(norm).forEach((k) => k && k.length > 2 && NOTES.set(k, en));
        }
      }
    }
    return NOTES;
  }
  const noteHits = (q) => [...notes().keys()].filter((k) => (" " + q + " ").includes(" " + k + " ") || (k.length > 4 && q.includes(k)));

  function budget(raw) {
    const m = raw.match(/(?:under|below|less than|max|up to|within|até|ate|abaixo de|menos de|no máximo|no maximo|por até|اقل من|تحت|بحدود|حدود|ما يزيد عن|لا يتجاوز)\s*([0-9٠-٩]+)/i);
    if (!m) return 0;
    return Number(m[1].replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  // product lines named in the question (English or Arabic letters), in the
  // order they're named; "heaven blue" doesn't also count as "heaven"
  function namedLines(q) {
    const found = [];
    const seen = new Set();
    for (const p of D.products) {
      if (seen.has(p.line)) continue;
      for (const n of [norm(p.line), norm(p.lineAr || "")]) {
        if (n.length > 2 && (" " + q + " ").includes(" " + n + " ")) {
          found.push({ line: p.line, n, at: q.indexOf(n) });
          seen.add(p.line);
          break;
        }
      }
    }
    return found
      .filter((a) => !found.some((b) => b !== a && b.n.length > a.n.length && b.n.includes(a.n)))
      .sort((a, b) => a.at - b.at)
      .map((x) => x.line);
  }
  const lineProducts = (line) => D.products.filter((p) => p.line === line && p.cat !== "gift-sets");
  const namedProducts = (q) => namedLines(q).flatMap(lineProducts);

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
        if (best && (p.badge === "bestseller" || (p.rank && p.rank <= 20))) s += 4;
        if (fresh && p.badge === "new") s += 4;
        if (p.badge === "bestseller") s += 1;
        if (p.rank) s += Math.max(0, 1 - p.rank / 60); // wepink Brasil's best sellers break ties
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
    const vars = { free: W.money(c.freeOver), fee: W.money(c.fee), days: D.config.returnsDays, quality: D.config.qualityDays, delivery: L(c.delivery), country: L(c.name), vat: c.vat, hours: D.config.hours, email: D.config.email };
    return L(it.a).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }

  /* ---------- Lina: her voice, her memory, her knowledge ---------- */
  // What she remembers in this tab: the shopper's first name and the product
  // they're talking about (the one she last showed, else the page's product).
  let ctx = { name: "", id: "" };
  try {
    ctx = Object.assign(ctx, JSON.parse(sessionStorage.getItem(CTX_KEY) || "{}"));
  } catch (e) {
    /* ignore */
  }
  const saveCtx = () => {
    try {
      sessionStorage.setItem(CTX_KEY, JSON.stringify(ctx));
    } catch (e) {
      /* ignore */
    }
  };
  const pick = (v) => (Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v);
  // "{, name}" reads ", Sara" when she knows the name and nothing when she doesn't
  function fill(s, vars) {
    const v = Object.assign({ name: ctx.name, pct: (D.config.ritual || {}).pct || 0, lina: L(B.persona.name) }, vars);
    return String(s)
      .replace(/\{([,\s]+)name\}/g, (m, sep) => (v.name ? sep + v.name : ""))
      .replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  }
  const line = (key, vars) => fill(pick(L(B.lines[key])), vars);
  const phrase = (key, vars) => fill(L(B.say[key]), vars);
  const chipsOf = (keys) => (keys || []).map((k) => L(B.chips[k])).filter(Boolean);
  const lower = (s) => (W.state.lang === "ar" ? s : String(s).toLowerCase());
  function list(items) {
    items = items.filter(Boolean);
    if (items.length < 2) return items[0] || "";
    return items.slice(0, -1).join(W.state.lang === "ar" ? "، " : ", ") + L(B.say.and) + items[items.length - 1];
  }
  // up to four notes that tell the story: the first of the top, heart and base, then the rest
  function signature(p, n) {
    const layers = ["top", "heart", "base"].map((k) => (p.notes && p.notes[k]) || []);
    const out = [];
    for (let i = 0; out.length < n && i < 4; i++) layers.forEach((l) => l[i] && out.length < n && out.push(l[i]));
    return out.map(L);
  }
  const firstSentence = (s) => (String(s || "").match(/^.+?[.!؟?](\s|$)/) || [s || ""])[0].trim();

  // "my name is Sara", "me chamo Sara", "اسمي سارة"; "I'm Sara" only when that's all she wrote
  const NOT_NAMES = ["good", "fine", "ok", "okay", "great", "well", "here", "back", "looking", "not", "so", "very", "just", "from", "a", "an", "the", "new", "sorry", "bem", "otima", "otimo", "boa", "bom", "aqui", "procurando", "بخير", "تمام", "زينه", "هنا", "ابغي", "ابي", "اريد", "ودي", "احب", "ادور", "ابحث"];
  function nameIn(raw) {
    const m =
      raw.match(/(?:my name is|my name's|call me|me chamo|meu nome é|meu nome e|pode me chamar de|اسمي|انا اسمي)\s+([\p{L}][\p{L}'-]{1,19})/iu) ||
      (raw.trim().split(/\s+/).length <= 3 && raw.match(/^\s*(?:i am|i'm|im|sou a|sou o|انا)\s+([\p{L}][\p{L}'-]{1,19})[\s!.]*$/iu));
    if (!m || NOT_NAMES.includes(norm(m[1]))) return "";
    return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }

  const PRONOUN = ["it", "its", "this", "that", "this one", "that one", "ele", "ela", "esse", "essa", "este", "esta", "isso", "dele", "dela", "هذا", "هذي", "هذه", "فيه", "ريحته", "رائحته", "سعره", "مكوناته", "ثباته", "استخدمه", "يناسبه", "نوتاته", "فوائده", "حجمه"];
  const FOUNDER = ["virginia", "samara", "fonseca", "founder", "founders", "فيرجينيا", "فرجينيا", "سامارا", "سمارا", "مؤسسه", "fundadora", "fundadoras"];
  const ORDER = ["colonia", "splash", "cream", "bodyoil", "lotion", "butter", "hairmist", "rollon", "shower", "scrub", "soap"];
  // the product of a line to talk about: the type she asked for, else the cologne, the splash…
  function leadOf(lineName, q) {
    const types = Object.keys(CUES.type).filter((k) => has(q, CUES.type[k]));
    const rank = (p) => (types.some((k) => (TYPE_OF[k] || []).includes(p.type) || p.cat === CAT_OF[k]) ? -20 : 0) + (ORDER.includes(p.type) ? ORDER.indexOf(p.type) : 15);
    return lineProducts(lineName).sort((a, b) => rank(a) - rank(b) || (a.rank || 999) - (b.rank || 999))[0] || null;
  }
  function pageProduct() {
    const r = W.route();
    return r.page === "product" ? W.product(r.params.get("id")) : null;
  }
  const ctxProduct = () => (ctx.id && W.product(ctx.id)) || pageProduct();
  // the line's products in the order she'd show them, one per type
  function showLine(lineName, first) {
    const out = first ? [first] : [];
    lineProducts(lineName)
      .sort((a, b) => (ORDER.includes(a.type) ? ORDER.indexOf(a.type) : 15) - (ORDER.includes(b.type) ? ORDER.indexOf(b.type) : 15))
      .forEach((p) => out.length < 3 && !out.some((x) => x.type === p.type) && out.push(p));
    return out;
  }
  // the same pairing as the product page's "Buy together"
  const PAIR = { splash: ["cream", "colonia", "lotion", "bodyoil", "hairmist"], colonia: ["splash", "cream", "lotion", "rollon"], cream: ["splash", "colonia", "hairmist"], lotion: ["splash", "colonia"], butter: ["splash", "colonia"], bodyoil: ["splash", "cream", "colonia"], hairmist: ["splash", "colonia", "cream"], rollon: ["splash", "colonia"], scrub: ["cream", "splash"], shower: ["cream", "splash"], soap: ["cream", "splash"] };
  function pairFor(p) {
    const same = lineProducts(p.line).filter((x) => x !== p && x.type !== p.type);
    for (const ty of PAIR[p.type] || []) {
      const hitP = same.find((x) => x.type === ty);
      if (hitP) return hitP;
    }
    return same[0] || D.products.filter((x) => x.cat === p.cat && x.line !== p.line && x.rank).sort((a, b) => a.rank - b.rank)[0] || null;
  }
  const ETHANOL = /^(alcohol( denat\.?)?|ethanol|ethyl alcohol|sd alcohol.*|álcool( etílico)?|alcool( etilico)?)$/i;
  const FATTY = /^(cetearyl|cetyl|stearyl|behenyl|myristyl|lauryl) alcohol$/i;

  // One product, one question. DT is details.js (null if it isn't loaded yet).
  function aboutProduct(kind, p, DT) {
    const d = DT && DT.p[p.id];
    const tx = (i) => (i == null || !DT.tx[i] ? "" : L(DT.tx[i]));
    const product = W.fullName(p);
    const family = lower((d && d.f != null && tx(d.f)) || L(D.families[p.family]) || "");
    const layer = (k) => list(((p.notes && p.notes[k]) || []).slice(0, 3).map((n) => lower(L(n))));
    const all = list(signature(p, 4).map(lower));
    const highlights = d && d.h ? d.h.map((i) => lower(tx(i))) : [];
    const base = { products: [p], chips: chipsOf(["notes", "how", "pair", "sizes"].filter((k) => k !== kind)) };
    if (kind === "notes") {
      const text = layer("top") && layer("heart") && layer("base") ? phrase("notes", { product, family, top: layer("top"), heart: layer("heart"), base: layer("base") }) : all ? phrase("notesShort", { product, family, all }) : phrase("noNotes", { product, desc: firstSentence(L(p.desc)) });
      return Object.assign(base, { text });
    }
    if (kind === "how") {
      const how = (d && d.u != null && tx(d.u)) || ({ splash: t("pdp.howSplash"), colonia: t("pdp.howPerfume"), hairmist: t("pdp.howMist"), cream: t("pdp.howLotion"), lotion: t("pdp.howLotion"), butter: t("pdp.howLotion"), bodyoil: t("pdp.howLotion"), set: t("pdp.howSet") }[p.type] || "");
      if (!how) return Object.assign(base, { text: phrase("noNotes", { product, desc: L(p.desc) }) });
      // the first lines of the precautions; the page has them all
      const caution = d && d.c != null ? "\n" + phrase("caution", { caution: (tx(d.c).match(/[^.!?]+[.!?]+/g) || [tx(d.c)]).slice(0, 3).join("").trim() }) : "";
      return Object.assign(base, { text: phrase("how", { product, how }) + caution });
    }
    if (kind === "ingredients") {
      if (d && d.a && d.a.length) return Object.assign(base, { text: phrase("actives", { product, actives: list(d.a.slice(0, 4).map(([n, x]) => `${tx(n)} (${lower(tx(x))})`)) }) });
      if (d && d.i != null) return Object.assign(base, { text: phrase("inci", { product, inci: tx(d.i) }) });
      return Object.assign(base, { text: phrase("noInci", { product }), wa: true });
    }
    if (kind === "alcohol") {
      if (!d || d.i == null) return Object.assign(base, { text: phrase("noInci", { product }), wa: true });
      const inci = DT.tx[d.i].en.split(/[,;]\s*/).map((x) => x.replace(/\.$/, "").trim());
      if (inci.some((x) => ETHANOL.test(x))) {
        const care = lineProducts(p.line).find((x) => ["cream", "bodyoil", "butter", "lotion"].includes(x.type));
        const alt = care ? phrase("alcoholAlt", { care: W.fullName(care) }) : phrase("alcoholAltAny");
        return Object.assign(base, { text: phrase("alcoholYes", { product, alt }), products: care ? [p, care] : [p] });
      }
      const fatty = inci.filter((x) => FATTY.test(x));
      return Object.assign(base, { text: phrase("alcoholNo", { product, fatty: fatty.length ? phrase("fatty", { list: list(fatty) }) : "" }) });
    }
    if (kind === "price") return Object.assign(base, { text: phrase("price", { product, size: W.sizeText(p), price: W.money(W.priceOf(p)) }), offer: true });
    if (kind === "sizes") {
      const all = lineProducts(p.line).sort((a, b) => (ORDER.indexOf(a.type) + 1 || 99) - (ORDER.indexOf(b.type) + 1 || 99));
      return Object.assign(base, { text: phrase("sizes", { product: W.pname(p) }), products: all.slice(0, 4) });
    }
    if (kind === "pair") {
      const q = pairFor(p);
      if (!q) return Object.assign(base, { text: phrase("lastingNone", { product, type: lower(L(p.typeName)) }) });
      const key = q.line === p.line ? "pair" : "pairOther";
      return Object.assign(base, { text: phrase(key, { product, other: W.fullName(q) }), products: [p, q], offer: true });
    }
    if (kind === "lasting") {
      return Object.assign(base, { text: highlights.length ? phrase("lasting", { product, why: list(highlights) + "." }) : phrase("lastingNone", { product, type: lower(L(p.typeName)) }) });
    }
    if (kind === "why") {
      return Object.assign(base, { text: highlights.length ? phrase("why", { product, list: list(highlights) }) : L(p.desc) || phrase("introPlain", { product, tagline: lower(L(p.tagline)) }) });
    }
    // just the name: what it is, in a line
    const tagline = lower(L(p.tagline)) || lower(firstSentence(L(p.desc)));
    const text = all ? phrase("intro", { product, tagline, family, all }) : phrase("introPlain", { product, tagline });
    return { text: text + "\n" + line2(B.nudge.product), products: showLine(p.line, p), offer: true, chips: chipsOf(["notes", "how", "pair"]) };
  }
  // two products side by side
  function compare(a, b) {
    const row = (p) => phrase("compareLine", { product: W.fullName(p), family: lower(L(D.families[p.family]) || ""), notes: list(signature(p, 3).map(lower)) });
    return { text: [phrase("compare"), row(a), row(b), phrase("compareEnd")].join("\n"), products: [a, b], offer: true, chips: chipsOf(["notes", "pair"]) };
  }
  function topicAnswer(tp) {
    const r = { text: fill(pick(L(tp.a))), chips: chipsOf(tp.chips), wa: !!tp.wa };
    if (tp.show === "vf") {
      const lines = ["VF Golden", "VF", "VF Bloom", "VF Tropical", "VF Choices"].filter((l) => lineProducts(l).length);
      r.products = lines.slice(0, 3).map((l) => leadOf(l, ""));
      r.offer = true;
    }
    return r;
  }
  // the intro to her picks, from what the shopper asked for
  function picksIntro(raw, q) {
    const fams = Object.keys(CUES.family).filter((k) => has(q, CUES.family[k]));
    if (fams.length === 1) return line(fams[0]);
    if (has(q, CUES.men)) return line("men");
    if (has(q, CUES.gift)) return line("gift");
    const hits = noteHits(q);
    if (hits.length) return line("note", { note: lower(L(NOTE_NAMES.get(notes().get(hits[0])) || hits[0])) });
    if (budget(raw)) return line("budget");
    if (has(q, CUES.best)) return line("best");
    return line("picks");
  }

  /* ---------- the scent quiz, inside the chat ---------- */
  const Q = B.quiz;
  const LOW_AED = 150; // "Under …" in the budget question, in the shopper's currency
  const optLabel = (o) => fill(L(o.label), { low: W.moneyAED(LOW_AED) });
  function quizAsk(i, lead) {
    const st = Q.steps[i];
    return { text: (lead ? lead + "\n" : "") + L(st.q), chips: st.options.map(optLabel), quiz: true };
  }
  function quizStart() {
    ctx.quiz = { step: 0, a: {} };
    saveCtx();
    return quizAsk(0, line2(Q.intro));
  }
  const line2 = (v) => fill(pick(L(v)));
  // the shopper's answer to the current question, or null if they asked something else
  function quizStep(raw, q) {
    const st = Q.steps[ctx.quiz.step];
    if (!st) return (ctx.quiz = null);
    if (has(q, ["stop", "cancel", "exit", "quit", "pare", "parar", "sair", "cancelar", "وقف", "الغاء", "خلاص"])) {
      ctx.quiz = null;
      saveCtx();
      return { text: L(Q.stop), chips: starters() };
    }
    const opt = st.options.find((o) => norm(optLabel(o)) === q) || st.options.find((o) => has(q, o.words || []));
    if (!opt) {
      ctx.quiz = null; // they asked something else: answer that instead
      saveCtx();
      return null;
    }
    ctx.quiz.a[st.id] = opt.key;
    ctx.quiz.step++;
    saveCtx();
    if (ctx.quiz.step < Q.steps.length) return quizAsk(ctx.quiz.step, line2(Q.ack));
    const a = ctx.quiz.a;
    ctx.quiz = null;
    saveCtx();
    return quizResult(a);
  }
  const FRESH = ["bergamot", "lemon", "citrus", "mandarin", "orange", "grapefruit", "aquatic", "marine", "sea", "mint", "green", "tea", "cucumber", "lime", "neroli"];
  function famScore(p, fam) {
    if (fam === "fresh") {
      const ns = Object.values(p.notes || {}).flat().map((n) => norm(n[0]));
      return Math.min(6, ns.filter((n) => FRESH.some((f) => n.includes(f))).length * 2);
    }
    return p.family === fam ? 6 : 0;
  }
  function quizResult(a) {
    const max = a.budget === "low" ? W.local(LOW_AED) : 0;
    const fits = (p) => p.cat !== "gift-sets" && (a.who === "him" ? p.gender !== "feminino" : p.gender !== "masculino");
    const score = (p) => {
      let s = famScore(p, a.fam);
      if (a.when === "night") s += ["warm", "woody", "sweet"].includes(p.family) ? 2 : 0;
      if (a.when === "day") s += p.family === "floral" || a.fam === "fresh" ? 2 : 0;
      if (a.when === "special") s += p.badge === "bestseller" ? 2 : 0;
      if (a.who === "him") s += p.gender === "masculino" ? 3 : 0;
      if (p.rank) s += Math.max(0, 2 - p.rank / 40);
      return s;
    };
    const type = a.kind === "splash" ? "splash" : "colonia";
    const within = (list) => (max ? list.filter((p) => W.priceOf(p) <= max) : list);
    let pool = within(D.products.filter((p) => fits(p) && p.type === type));
    if (!pool.length) pool = within(D.products.filter((p) => fits(p) && ["colonia", "splash"].includes(p.type)));
    if (!pool.length) pool = D.products.filter((p) => fits(p) && ["colonia", "splash"].includes(p.type));
    const ranked = pool.map((p) => ({ p, s: score(p) })).sort((x, y) => y.s - x.s);
    const best = ranked[0] && ranked[0].p;
    if (!best) return { text: line("nothing"), chips: starters() };
    const why = fill(L(Q.why), {
      family: lower(L(D.families[best.family]) || L(D.families.floral) || ""),
      notes: list(signature(best, 3).map(lower)),
      when: L(Q.whenText[a.when] || Q.whenText.day),
    });
    const after = "\n" + L(Q.after);
    const chips = [L(Q.more), L(B.chips.notes), L(Q.again)];
    if (a.kind === "ritual") {
      const order = ["cream", "lotion", "butter", "bodyoil", "splash", "colonia"];
      const set = [];
      for (const ty of ["cream", "splash", "colonia"]) {
        const hit = lineProducts(best.line).find((x) => x.type === ty || (ty === "cream" && order.slice(0, 4).includes(x.type)));
        if (hit && !set.includes(hit)) set.push(hit);
      }
      const shown = set.length ? set : [best];
      return { text: line2(Q.ritual).replace("{line}", W.pname(best)).replace("{why}", why) + after, products: shown, offer: true, chips };
    }
    const more = [];
    for (const { p } of ranked.slice(1)) {
      if (more.length === 2) break;
      if (p.line !== best.line && !more.some((x) => x.line === p.line)) more.push(p);
    }
    return { text: fill(pick(L(Q.match)), { product: W.fullName(best), why }) + after, products: [best, ...more], offer: true, chips };
  }

  // the product she's talking about, for "how do I use it?": the one she showed,
  // or none when she showed several lines
  function remember(products) {
    products = (products || []).filter(Boolean);
    if (!products.length) return;
    ctx.id = new Set(products.map((p) => p.line)).size === 1 ? products[0].id : "";
    saveCtx();
  }
  // Her built-in answer: { text, products?, chips?, wa?, offer?, need? }. `need`
  // asks for details.js first (assistant loads it and asks again).
  function answer(raw, DT) {
    const r = reply(raw, DT);
    if (!r.need) remember(r.products);
    return r;
  }
  function reply(raw, DT) {
    const q = norm(raw);
    if (!q) return { text: t("ai.empty"), chips: starters() };
    const name = nameIn(raw);
    if (name) {
      ctx.name = name;
      saveCtx();
      const rest = norm(raw.replace(/(?:my name is|my name's|call me|me chamo|meu nome é|meu nome e|pode me chamar de|اسمي|انا اسمي|i am|i'm|im|sou a|sou o|انا)\s+[\p{L}'-]+/iu, ""));
      if (!rest || has(rest, HELLO)) return { text: line("named"), chips: starters() };
    }
    // the scent quiz: answering its question, or starting it
    if (ctx.quiz) {
      const r = quizStep(raw, q);
      if (r) return r;
    }
    if (has(q, Q.start) && !namedLines(q).length) return quizStart();
    const asks = Object.keys(B.ask).filter((k) => has(q, B.ask[k]));
    const kind = asks.find((k) => k !== "compare") || "";
    const needs = (k) => ["notes", "how", "ingredients", "alcohol", "lasting", "why"].includes(k) && !DT;
    const lines = namedLines(q);

    // a product named outright
    if (lines.length >= 2 && (asks.includes("compare") || lines.length === 2)) {
      const a = leadOf(lines[0], q);
      const b = leadOf(lines[1], q);
      if (a && b) return compare(a, b);
    }
    let bestFaq = null;
    let faqScore = 0;
    for (const [ref, words] of INTENTS) {
      const s = weigh(q, words);
      if (s > faqScore) {
        bestFaq = ref;
        faqScore = s;
      }
    }
    if (lines.length) {
      const p = leadOf(lines[0], q);
      if (p && kind) return needs(kind) ? { need: true } : aboutProduct(kind, p, DT);
      if (p && faqScore) return { text: faqAnswer(bestFaq[0], bestFaq[1]), products: [p], chips: followUps(bestFaq[0]) };
      if (p) return aboutProduct("", p, DT);
    }

    // her knowledge
    if (has(q, B.privateLife.words) && (has(q, FOUNDER) || has(q, ["ze felipe"]))) return { text: fill(L(B.privateLife.a)), chips: chipsOf(B.privateLife.chips) };
    let topic = null;
    let topicScore = 0;
    for (const tp of B.topics) {
      if (tp.id === "rude") continue;
      const s = weigh(q, tp.words);
      if (s > topicScore) {
        topic = tp;
        topicScore = s;
      }
    }
    const productCue =
      has(q, CUES.want) + has(q, CUES.men) + has(q, CUES.women) + has(q, CUES.best) + has(q, CUES.gift) +
      Object.values(CUES.type).reduce((n, w) => n + has(q, w), 0) +
      Object.values(CUES.family).reduce((n, w) => n + has(q, w), 0) +
      noteHits(q).length;
    const specific = productCue - has(q, CUES.want);

    // "how do I use it?" about the product on screen or the one she just showed
    if (kind) {
      const p = ctxProduct();
      const askScore = has(q, B.ask[kind]);
      if (p && (has(q, PRONOUN) || q.split(" ").length <= 3 || askScore > Math.max(topicScore, faqScore, specific))) return needs(kind) ? { need: true } : aboutProduct(kind, p, DT);
      if (!p && (has(q, PRONOUN) || q.split(" ").length <= 3) && !topicScore && !faqScore && !specific) return { text: line("which"), chips: starters() };
    }
    const phraseHit = topic && topic.words.some((w) => w.includes(" ") && hit(q, w));
    if (topic && topicScore >= faqScore && (topic.show || topicScore > specific || (topicScore === specific && (phraseHit || !has(q, CUES.want))))) return topicAnswer(topic);

    if (has(q, HUMAN) && !specific) return { text: t("ai.human", { hours: D.config.hours }), wa: true };
    if (faqScore && faqScore >= productCue) return { text: faqAnswer(bestFaq[0], bestFaq[1]), chips: followUps(bestFaq[0]), wa: bestFaq[0] === "returns" || (bestFaq[0] === "orders" && bestFaq[1] >= 3) };
    if (productCue) {
      if (!specific && !budget(raw)) return quizStart();
      const r = recommend(raw);
      if (r.products.length) return { text: picksIntro(raw, q) + "\n" + line2(B.nudge.picks), products: r.products, offer: true, chips: [L(B.chips.find), ...chipsOf(["sweet", "gift", "men"])] };
    }
    if (has(q, HELLO)) return { text: line("hello"), chips: starters() };
    if (has(q, THANKS)) return { text: line("thanks"), chips: starters() };
    const rude = B.topics.find((tp) => tp.id === "rude");
    if (rude && has(q, rude.words)) return topicAnswer(rude);
    // a word from a product's name ("golden", "pear")
    const words = q.split(" ").filter((w) => w.length > 3);
    const partial = [...new Set(D.products.filter((p) => words.some((w) => norm(p.line).split(" ").includes(w))).map((p) => p.line))];
    if (partial.length && partial.length <= 3) return { text: line("found"), products: partial.map((l) => leadOf(l, q)), offer: true, chips: chipsOf(["notes", "pair"]) };
    return { text: line("unsure"), chips: starters(), wa: true };
  }
  function starters() {
    return [L(B.chips.find), t("ai.c_best"), L(B.chips.story), t("ai.c_delivery", { country: L(W.country().short) }), t("ai.c_cod"), t("ai.c_returns")];
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

  // A language-model service, when one is configured. It gets the conversation,
  // her built-in answer (`hint`: the facts to keep to, like this country's
  // delivery fee) and the products worth talking about (named, on screen or her
  // picks), and may only show those.
  function brief(p) {
    return { id: p.id, name: W.fullName(p), size: W.sizeText(p), price: W.money(W.priceOf(p)), family: L(D.families[p.family]) || "", notes: Object.values(p.notes || {}).flat().slice(0, 6).map(L), tagline: L(p.tagline) || "", desc: firstSentence(L(p.desc)) };
  }
  function remote(history, mine, text) {
    const cfg = D.config.assistant || {};
    if (!cfg.endpoint) return Promise.reject(new Error("off"));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const pool = [...(mine.products || []), ...(ctxProduct() ? [ctxProduct()] : []), ...recommend(text).products];
    const products = pool.filter((p, i) => p && pool.indexOf(p) === i).slice(0, 6);
    const c = W.country();
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lang: W.state.lang,
        country: W.state.country,
        messages: history.slice(-12).map((m) => ({ role: m.from === "me" ? "user" : "assistant", content: m.text })),
        context: { advisor: L(B.persona.name), shopper: ctx.name, country: L(c.name), hours: D.config.hours, hint: mine.text || "", products: products.map(brief) },
      }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        clearTimeout(timer);
        if (!j || !j.reply) throw new Error("empty");
        const shown = (j.products || []).map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 3);
        return Object.assign({}, mine, { text: String(j.reply), products: shown, offer: shown.length > 0 });
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
    const notesLine = signature(p, 3).join(" · ");
    return `<div class="ai-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="ai-card-img"><img src="${esc(p.image || "")}" alt="" loading="lazy"></a>
      <div class="ai-card-text"><a href="product.html?id=${encodeURIComponent(p.id)}"><strong>${esc(W.pname(p))}</strong></a><span class="muted">${esc(L(p.typeName))} · ${esc(W.money(W.priceOf(p)))}</span>${notesLine ? `<span class="ai-card-notes">${esc(notesLine)}</span>` : ""}</div>
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
    // her own answer first (loading details.js when the question needs it), then
    // the language-model service if there is one, with her answer as the hint
    const first = answer(text, window.WP_DETAILS || null);
    const wait = new Promise((r) => setTimeout(r, Math.min(1300, 380 + String(first.text || "").length * 3)));
    const mine = first.need ? W.details().then((DT) => answer(text, DT || { tx: [], p: {} })) : Promise.resolve(first);
    mine
      .then((r) => Promise.all([remote(log, r, text).catch(() => r), wait]))
      .then(([r]) => {
        const products = (r.products || []).filter(Boolean);
        remember(products);
        say({ from: "bot", text: r.text, products: products.map((p) => p.id), chips: r.chips, wa: r.wa, offer: r.offer });
      });
  }

  // Lina speaks first (the product-page bubble): her answer, without a question bubble
  function speak(text) {
    const r = answer(text, window.WP_DETAILS || null);
    const products = (r.products || []).filter(Boolean);
    say({ from: "bot", text: r.text, products: products.map((p) => p.id), chips: r.chips, offer: r.offer });
  }
  function openPanel() {
    closeCard();
    if (!panel) build();
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-on"));
    if (!log.length) say({ from: "bot", text: line("welcome"), chips: starters() });
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
        <span class="ai-avatar" aria-hidden="true">${esc(L(B.persona.name).charAt(0))}<i class="ai-online"></i></span>
        <div class="ai-head-text"><strong>${esc(L(B.persona.name))}</strong><span>${esc(t("ai.sub"))}</span></div>
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
        if (W.welcome) W.welcome.unlock();
        say({ from: "bot", text: t("ai.saved", { name: name.split(" ")[0] }), chips: starters() });
      };
      if (!W.sync.live) return done();
      form.querySelector("[type=submit]").disabled = true;
      W.sync.saveContact(entry).then(done, () => {
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
  // On a product page, a small bubble by the button after a few seconds, once a visit:
  // "Curious about VF Golden? Ask me". Tapping it opens Lina talking about it.
  let teaserTimer = 0;
  function teaser() {
    clearTimeout(teaserTimer);
    const old = document.querySelector(".ai-teaser");
    if (old) old.remove();
    const p = pageProduct();
    let seen = false;
    try {
      seen = sessionStorage.getItem("wpg.teased") === "1";
    } catch (e) {
      /* ignore */
    }
    if (!p || seen) return;
    teaserTimer = setTimeout(() => {
      if (panel && !panel.hidden) return;
      const dock = document.querySelector(".dock");
      const now = pageProduct(); // products may have been reloaded from the database
      if (!dock || !now || now.id !== p.id) return;
      const tip = document.createElement("div");
      tip.className = "ai-teaser";
      tip.innerHTML = `<button type="button" class="ai-teaser-go"><span class="ai-avatar ai-avatar-sm" aria-hidden="true">${esc(L(B.persona.name).charAt(0))}</span><span>${esc(fill(L(B.teaser), { product: W.pname(now) }))}</span></button><button type="button" class="ai-teaser-x" aria-label="${esc(t("nav.close"))}">${icon("close")}</button>`;
      dock.appendChild(tip);
      requestAnimationFrame(() => tip.classList.add("is-on"));
      try {
        sessionStorage.setItem("wpg.teased", "1");
      } catch (e) {
        /* ignore */
      }
      tip.querySelector(".ai-teaser-x").addEventListener("click", () => tip.remove());
      tip.querySelector(".ai-teaser-go").addEventListener("click", () => {
        tip.remove();
        ctx.id = now.id;
        saveCtx();
        openPanel();
        speak(now.line);
      });
    }, 7000);
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

  document.addEventListener("DOMContentLoaded", () => {
    mount();
    teaser();
    // the one-file build changes page without reloading
    window.addEventListener("hashchange", () => setTimeout(teaser, 50));
  });
  return { open: openPanel, ask, answer, recommend, refresh, quizResult };
})();
