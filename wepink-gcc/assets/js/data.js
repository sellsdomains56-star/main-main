/* wepink Gulf — store data.
 * Everything the client is likely to change lives here: contact details,
 * countries (currency, VAT, delivery), stores and the product catalogue.
 * Prices are set once in AED (`price`) and converted per country; add
 * `prices: { SAR: 75, KWD: 6.25 }` to a product to set a local price by hand.
 */
window.WP_DATA = (function () {
  const config = {
    brand: "wepink",
    region: { en: "Gulf", ar: "الخليج", pt: "Golfo" },
    whatsapp: "971500000000", // placeholder: client's WhatsApp Business number
    email: "care@wepink-gulf.com", // placeholder
    siteUrl: "https://www.wepink-gulf.com/", // placeholder: the store's real address (search engines, link previews, sitemap)
    hours: "10:00 – 22:00", // customer care, every day, Gulf time
    instagram: "https://www.instagram.com/wepink/",
    tiktok: "https://www.tiktok.com/@wepink",
    // Exchange and return deadlines, in calendar days after delivery (wepink Brasil's terms):
    // wrong item, change of mind, fragrances and cosmetics; poor quality and faulty caps.
    returnsDays: 7,
    qualityDays: 30,

    // The store's database (Supabase): products, prices and settings edited in
    // admin.html, plus orders, ambassadors and customers. The key is the
    // public "publishable" key, safe in the browser (the database only lets
    // shoppers read live products and send forms). Clear url to run offline
    // from catalog.js alone.
    supabase: {
      url: "https://jkhtnytpkkqwnmhvgfmm.supabase.co",
      key: "sb_publishable_9qcxp-JSXW4pBzUhL5rVZg_iUIrjMte",
    },

    // Every product price goes up by this % (prices in the catalogue stay as
    // set; the admin panel changes this in Settings). Exact local prices set
    // on a product (`prices: { SAR: 89 }`) are shown as they are.
    pricing: { markupPct: 5 },

    // The beauty assistant answers from the help centre and the catalogue in
    // the browser. Point `endpoint` at a language-model service (see README,
    // "Beauty assistant") to let it hold a real conversation; it falls back to
    // the built-in answers whenever the service can't be reached.
    assistant: { endpoint: "" },

    // The ritual set: a body cream (or lotion / butter), a body splash and an
    // eau de cologne together are this % off. 0 turns it off.
    ritual: { pct: 15 },

    // Club welcome offer: joining the wepink Club unlocks this % off the first
    // order, with this code at checkout. 0 turns it off. (Admin: Settings.)
    welcome: { pct: 10, code: "WELCOME10" },

    // Seasonal look, switched on in the admin panel (Settings -> Season):
    // "", "ramadan", "eid", "national" or "whitefriday" (see `seasons` below).
    // `announce` ({ en, ar, pt }) replaces the season's own announcement if set.
    season: { id: "", announce: null },

    // Campaign photos of Virginia Fonseca, cropped from wepink's own campaign
    // banners — confirm GCC usage rights with the brand before launch. Clear a
    // path to fall back to the designed placeholder.
    photos: {
      virginiaHero: "assets/photos/hero-the-oil.webp", // home page hero arch: "the oil." campaign photo (from the client)
      virginiaPortrait: "assets/photos/liberte-dore-campaign.webp", // Liberté Doré crown portrait for the "Created by Virginia" section
      // Campaign images (assets/photos/campaign/): an AI model, not Virginia, with the real products.
      campaign: "assets/photos/campaign/vf-golden-lips.webp", // the "Liquid gold" perfume spotlight on the home page (Nano Banana Pro 4K, VF Golden)
      club: "assets/photos/campaign/satin-vf.webp", // the Club pop-up
      earn: "assets/photos/campaign/red-stripe.webp", // Earn with wepink hero
      about: "assets/photos/campaign/golden-hour.webp", // About page
      earnBand: "assets/photos/campaign/pink-bags.webp", // the ambassador band on the home page
      gift: "assets/photos/campaign/gift-box.webp", // the gifting promo on the home page
    },

    // Homepage film: "wepink × GCC" — the pink wepink jet flies to the Gulf and lands by the
    // Dubai skyline (24 s, 16:9). It plays muted on a loop at the very top of the home page,
    // with a sound button; phones get the 720p file. Clear `src` to hide it.
    film: { src: "assets/video/wepink-gcc-jet-1080.mp4", srcMobile: "assets/video/wepink-gcc-jet-720.mp4", poster: "assets/photos/film-gcc-poster.jpg" },
    // "Enter the pink universe" (Seedance 2.5, 30 s), the first homepage film: now at the top
    // of Shop all (hidden while a category is picked). Clear `src` to hide it.
    shopFilm: { src: "assets/video/wepink-hero-1080.mp4", srcMobile: "assets/video/wepink-hero-720.mp4", poster: "assets/photos/film-poster.jpg" },

    // Referral & ambassador programme (placeholder terms — set with the franchise).
    referral: {
      friendDiscountPct: 10, // friends get this % off their first order with a code
      tiers: [
        { id: "pink", name: { en: "Pink", ar: "بينك", pt: "Pink" }, minOrders: 0, pct: 10 },
        { id: "hot", name: { en: "Hot Pink", ar: "هوت بينك", pt: "Hot Pink" }, minOrders: 20, pct: 15 },
        { id: "diamond", name: { en: "Diamond", ar: "دايموند", pt: "Diamond" }, minOrders: 50, pct: 20 },
      ],
    },
  };

  // Each country sets its own free-delivery threshold and delivery fee in
  // local currency (`freeOver`, `fee`).
  // Currency rates are AED -> local. AED, SAR, QAR, BHD and OMR are pegged
  // to the US dollar; KWD follows a basket, so check it before going live.
  const countries = {
    AE: {
      name: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", pt: "Emirados Árabes Unidos" },
      short: { en: "UAE", ar: "الإمارات", pt: "EAU" },
      currency: "AED", symbol: { en: "AED", ar: "د.إ", pt: "AED" }, rate: 1, decimals: 0, vat: 5,
      dial: "+971",
      freeOver: 150, fee: 15,
      cities: [
        ["Dubai", "دبي"], ["Abu Dhabi", "أبوظبي"], ["Sharjah", "الشارقة"], ["Ajman", "عجمان"],
        ["Ras Al Khaimah", "رأس الخيمة"], ["Fujairah", "الفجيرة"], ["Umm Al Quwain", "أم القيوين"], ["Al Ain", "العين"],
      ],
      delivery: { en: "1–2 working days · same day in Dubai before 2pm", ar: "1–2 يوم عمل · نفس اليوم في دبي قبل الساعة 2 ظهرًا", pt: "1–2 dias úteis · no mesmo dia em Dubai para pedidos até 14h" },
      pay: ["card", "applepay", "tabby", "tamara", "cod"],
    },
    SA: {
      name: { en: "Saudi Arabia", ar: "المملكة العربية السعودية", pt: "Arábia Saudita" },
      short: { en: "KSA", ar: "السعودية", pt: "Arábia Saudita" },
      currency: "SAR", symbol: { en: "SAR", ar: "ر.س", pt: "SAR" }, rate: 1.0211, decimals: 0, vat: 15,
      dial: "+966",
      freeOver: 150, fee: 15,
      cities: [
        ["Riyadh", "الرياض"], ["Jeddah", "جدة"], ["Dammam", "الدمام"], ["Al Khobar", "الخبر"],
        ["Makkah", "مكة المكرمة", "Meca"], ["Madinah", "المدينة المنورة", "Medina"], ["Taif", "الطائف"], ["Abha", "أبها"],
      ],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل", pt: "2–4 dias úteis" },
      pay: ["card", "mada", "applepay", "tabby", "tamara", "cod"],
    },
    QA: {
      name: { en: "Qatar", ar: "قطر", pt: "Catar" },
      short: { en: "Qatar", ar: "قطر", pt: "Catar" },
      currency: "QAR", symbol: { en: "QAR", ar: "ر.ق", pt: "QAR" }, rate: 0.9912, decimals: 0, vat: 0,
      dial: "+974",
      freeOver: 150, fee: 15,
      cities: [["Doha", "الدوحة"], ["Al Wakrah", "الوكرة"], ["Al Rayyan", "الريان"], ["Lusail", "لوسيل"], ["Al Khor", "الخور"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل", pt: "2–4 dias úteis" },
      pay: ["card", "applepay", "cod"],
    },
    KW: {
      name: { en: "Kuwait", ar: "الكويت", pt: "Kuwait" },
      short: { en: "Kuwait", ar: "الكويت", pt: "Kuwait" },
      currency: "KWD", symbol: { en: "KWD", ar: "د.ك", pt: "KWD" }, rate: 0.0837, decimals: 3, vat: 0,
      dial: "+965",
      freeOver: 12, fee: 1.5,
      cities: [["Kuwait City", "مدينة الكويت", "Cidade do Kuwait"], ["Hawalli", "حولي"], ["Salmiya", "السالمية"], ["Al Ahmadi", "الأحمدي"], ["Jahra", "الجهراء"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل", pt: "2–4 dias úteis" },
      pay: ["card", "knet", "applepay", "tabby", "cod"],
    },
    BH: {
      name: { en: "Bahrain", ar: "البحرين", pt: "Bahrein" },
      short: { en: "Bahrain", ar: "البحرين", pt: "Bahrein" },
      currency: "BHD", symbol: { en: "BHD", ar: "د.ب", pt: "BHD" }, rate: 0.1026, decimals: 3, vat: 10,
      dial: "+973",
      freeOver: 15, fee: 1.5,
      cities: [["Manama", "المنامة"], ["Muharraq", "المحرق"], ["Riffa", "الرفاع"], ["Seef", "السيف"], ["Isa Town", "مدينة عيسى", "Cidade de Isa"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل", pt: "2–4 dias úteis" },
      pay: ["card", "benefit", "applepay", "cod"],
    },
    OM: {
      name: { en: "Oman", ar: "سلطنة عُمان", pt: "Omã" },
      short: { en: "Oman", ar: "عُمان", pt: "Omã" },
      currency: "OMR", symbol: { en: "OMR", ar: "ر.ع", pt: "OMR" }, rate: 0.1048, decimals: 3, vat: 5,
      dial: "+968",
      freeOver: 15, fee: 1.5,
      cities: [["Muscat", "مسقط", "Mascate"], ["Salalah", "صلالة"], ["Sohar", "صحار"], ["Nizwa", "نزوى"], ["Sur", "صور"]],
      delivery: { en: "3–5 working days", ar: "3–5 أيام عمل", pt: "3–5 dias úteis" },
      pay: ["card", "applepay", "cod"],
    },
  };

  const payNames = {
    card: { en: "Credit / debit card", ar: "بطاقة ائتمان / خصم", pt: "Cartão de crédito / débito" },
    mada: { en: "mada", ar: "مدى", pt: "mada" },
    knet: { en: "KNET", ar: "كي نت", pt: "KNET" },
    benefit: { en: "BenefitPay", ar: "بنفت باي", pt: "BenefitPay" },
    applepay: { en: "Apple Pay", ar: "Apple Pay", pt: "Apple Pay" },
    tabby: { en: "tabby — 4 interest-free payments", ar: "تابي — 4 دفعات بدون فوائد", pt: "tabby — 4 parcelas sem juros" },
    tamara: { en: "Tamara — split in 4", ar: "تمارا — قسّمها على 4", pt: "Tamara — divida em 4" },
    cod: { en: "Cash on delivery", ar: "الدفع عند الاستلام", pt: "Pagamento na entrega" },
  };

  const categories = [
    { id: "perfume", name: { en: "Perfumes", ar: "العطور", pt: "Perfumes" }, blurb: { en: "VF and the full fragrance wardrobe", ar: "مجموعة في إف وكل العطور", pt: "VF e o guarda-roupa olfativo completo" } },
    { id: "body-splash", name: { en: "Body Splash", ar: "بودي سبلاش", pt: "Body Splash" }, blurb: { en: "Brazil's favourite ritual", ar: "طقس البرازيل المفضل", pt: "O ritual queridinho do Brasil" } },
    { id: "men", name: { en: "For Him", ar: "للرجال", pt: "Para Ele" }, blurb: { en: "Woody, fresh, magnetic", ar: "خشبي ومنعش وجذّاب", pt: "Amadeirado, fresco, magnético" } },
    { id: "body-care", name: { en: "Body Care", ar: "العناية بالجسم", pt: "Cuidados com o Corpo" }, blurb: { en: "Creams, oils, scrubs & more", ar: "كريمات وزيوت ومقشرات والمزيد", pt: "Cremes, óleos, esfoliantes e mais" } },
    { id: "hair", name: { en: "Hair", ar: "الشعر", pt: "Cabelos" }, blurb: { en: "Hair mists & care", ar: "عطور الشعر والعناية به", pt: "Hair mists e cuidados" } },
    { id: "makeup", name: { en: "Makeup", ar: "المكياج", pt: "Maquiagem" }, blurb: { en: "Glosses, lip oils & more", ar: "ملمعات وزيوت شفاه والمزيد", pt: "Glosses, lip oils e mais" } },
    { id: "skincare", name: { en: "Skincare", ar: "العناية بالبشرة", pt: "Skincare" }, blurb: { en: "Serums & daily care", ar: "سيرومات وعناية يومية", pt: "Séruns e cuidados diários" } },
    { id: "gift-sets", name: { en: "Gift Sets", ar: "أطقم الهدايا", pt: "Kits de Presente" }, blurb: { en: "Wrapped in pink, ready to give", ar: "مغلّفة بالوردي وجاهزة للإهداء", pt: "Embalados em rosa, prontos para presentear" } },
  ];

  const families = {
    sweet: { en: "Sweet & gourmand", ar: "حلو وشهي", pt: "Doce e gourmand" },
    floral: { en: "Floral & fruity", ar: "زهري وفاكهي", pt: "Floral e frutado" },
    fresh: { en: "Fresh & citrus", ar: "منعش وحمضي", pt: "Fresco e cítrico" },
    warm: { en: "Warm & oriental", ar: "دافئ وشرقي", pt: "Quente e oriental" },
    woody: { en: "Woody & aromatic", ar: "خشبي وعطري", pt: "Amadeirado e aromático" },
  };

  const T = {
    colonia: { en: "Eau de Cologne", ar: "كولونيا معطّرة", pt: "Desodorante Colônia" },
    splash: { en: "Body Splash", ar: "بودي سبلاش", pt: "Body Splash" },
    cream: { en: "Body Cream", ar: "كريم الجسم", pt: "Body Cream" },
    lotion: { en: "Body Lotion", ar: "لوشن الجسم", pt: "Loção Corporal" },
    hairmist: { en: "Hair Mist", ar: "عطر الشعر", pt: "Hair Mist" },
    bodyoil: { en: "Body Oil", ar: "زيت الجسم", pt: "Óleo Corporal" },
    scrub: { en: "Body Scrub", ar: "مقشّر الجسم", pt: "Esfoliante Corporal" },
    butter: { en: "Body Butter", ar: "زبدة الجسم", pt: "Manteiga Corporal" },
    shower: { en: "Shower Foam", ar: "رغوة الاستحمام", pt: "Espuma de Banho" },
    soap: { en: "Bar Soap", ar: "صابون", pt: "Sabonete em Barra" },
    rollon: { en: "Roll-on Deodorant", ar: "مزيل عرق رول أون", pt: "Desodorante Roll-on" },
    set: { en: "Gift Set", ar: "طقم هدايا", pt: "Kit" },
    makeup: { en: "Makeup", ar: "مكياج", pt: "Maquiagem" },
    skincare: { en: "Skincare", ar: "العناية بالبشرة", pt: "Skincare" },
    haircare: { en: "Hair Care", ar: "العناية بالشعر", pt: "Cuidados com os Cabelos" },
    bodycare: { en: "Body Care", ar: "العناية بالجسم", pt: "Cuidados com o Corpo" },
  };

  // The catalogue is generated from wepink Brazil by scripts/import_catalog.py
  // (assets/js/catalog.js). GCC prices there are placeholders by product type.
  // Every catalogue product also has its Nano Banana Pro campaign shot in assets/products/hero/,
  // shown first everywhere; the studio photos follow on the product page.
  // (`hero` in catalog.js); a product added later shows its wepink Brasil photo until it has them.
  const products = (window.WP_CATALOG || []).map((p) => {
    const hero = "assets/products/hero/" + p.id + ".webp";
    const hero2 = "assets/products/hero/" + p.id + "-2.webp"; // second campaign shot (cards show it on hover)
    const studio = p.images && p.images.length ? p.images : p.image ? [p.image] : [];
    const images = p.hero ? [hero, hero2] : studio;
    return Object.assign({}, p, { typeName: T[p.type] || T.bodycare, notes: p.notes || {}, scene: true, image: images[0], images, packshots: studio });
  });

  // Products the home page features (ids from catalog.js).
  const featured = {
    star: "colonia-vf-golden-75-ml",
    // "Most loved" card on the home hero photo: the product the photo shows, and its picture
    // cut from that photo (the VF body oil in "the oil." campaign photo).
    heroProduct: "bodyoil-vf-120-ml",
    heroThumb: "assets/photos/hero-the-oil-bottle.webp",
    spotlight: "colonia-vf-golden-75-ml", // the "Liquid gold" band: the perfume in its campaign photo (photos.campaign)
    stage: ["splash-vf-200-ml", "colonia-vf-golden-75-ml", "colonia-ghadan-100-ml"],
    icons: ["colonia-vf-golden-75-ml", "colonia-ghadan-100-ml", "colonia-ruby-rhodolite-100-ml", "splash-king-blue-deep-200-ml"],
    ritual: ["cream-vf-golden-200-ml", "splash-vf-golden-200-ml", "colonia-vf-golden-75-ml"],
    ritualSet: "set-kit-linha-vf-golden",
    campaign: ["colonia-ruby-rhodolite-100-ml", "colonia-ghadan-100-ml", "colonia-celebrate-life-100-ml"],
    giftSet: "set-kit-linha-vf-golden",
    about: ["splash-vanilla-cuddle-200-ml", "colonia-vf-golden-75-ml", "colonia-ghadan-100-ml", "splash-king-blue-deep-200-ml"],
    // The campaign: editorial images (Nano Banana Pro, 4K) built around real products.
    // `home` ones fill the home page lookbook; the others head their category in the
    // shop (`cat`). Every product in a picture (`product`, then `also`) shows it on
    // its page with an "As seen in the campaign" badge. `pos` frames it in cards.
    looks: [
      { photo: "assets/photos/campaign/the-sunny-satin.webp", product: "colonia-the-sunny-75-ml", cat: "perfume", home: true, pos: "54% 50%", title: { en: "Wrapped in pink", ar: "ملفوفة بالوردي", pt: "Envolta em rosa" } },
      { photo: "assets/photos/campaign/my-lips-infinity-plim.webp", product: "colonia-infinity-plim-75-ml", also: ["makeup-gloss-my-lips-4-ml"], cat: "perfume", home: true, pos: "50% 30%", title: { en: "Turn up the shine", ar: "ارفعي مستوى اللمعان", pt: "Aumenta o brilho" } },
      { photo: "assets/photos/campaign/sit-golden.webp", product: "splash-vf-golden-200-ml", cat: "body-splash", home: true, pos: "50% 40%", title: { en: "Golden, all day", ar: "ذهبية طوال اليوم", pt: "Dourada o dia todo" } },
      { photo: "assets/photos/campaign/fatal-rouge-crown.webp", product: "colonia-fatal-rouge-100-ml", cat: "perfume", home: true, pos: "45% 40%", title: { en: "Crowned in rouge", ar: "متوّجة بالأحمر", pt: "Coroada de vermelho" } },
      // From the client: Liberté Doré in pink boots heads Perfumes, the giant Liberté body cream
      // heads Body Care; the next three follow them, and the lip tint heads Makeup.
      { photo: "assets/photos/campaign/liberte-dore-boots.webp", product: "colonia-liberte-dore-100-ml", cat: "perfume", pos: "50% 35%", title: { en: "Step into Liberté", ar: "خطوة نحو ليبرتيه", pt: "Entre na Liberté" } },
      { photo: "assets/photos/campaign/liberte-cream-giant.webp", product: "cream-liberte-200-ml", cat: "body-care", pos: "48% 50%", title: { en: "Soft as satin", ar: "ناعمة كالساتان", pt: "Macia como cetim" } },
      { photo: "assets/photos/campaign/heaven-straw.webp", product: "colonia-heaven-pink-100-ml", cat: "perfume", pos: "75% 40%", title: { en: "Sip on Heaven", ar: "رشفة من هيفن", pt: "Um gole de Heaven" } },
      { photo: "assets/photos/campaign/the-oil-blonde.webp", product: "bodyoil-vf-120-ml", cat: "body-care", pos: "50% 30%", title: { en: "Glow, oiled up", ar: "توهّج مع الزيت", pt: "Brilho com óleo" } },
      { photo: "assets/photos/campaign/lip-tint-drip.webp", product: "makeup-lip-tint-glow-essencial-5-8-ml", cat: "makeup", pos: "55% 45%", title: { en: "Dripping in gloss", ar: "لمعان يقطر", pt: "Brilho que escorre" } },
      { photo: "assets/photos/campaign/giant-heaven.webp", product: "colonia-heaven-pink-100-ml", cat: "perfume", pos: "50% 45%", title: { en: "Bigger than life", ar: "أكبر من الحياة", pt: "Maior que a vida" } },
      { photo: "assets/photos/campaign/pink-splash-ribbons.webp", product: "splash-heaven-pink-200-ml", also: ["splash-crave-lovely-200-ml", "splash-obsessed-exclusive-pink-200-ml"], cat: "body-splash", pos: "50% 40%", title: { en: "Tied with a bow", ar: "مربوطة بفيونكة", pt: "Com laço de fita" } },
      { photo: "assets/photos/campaign/peach.webp", product: "splash-perfect-pear-peach-200-ml", cat: "body-splash", title: { en: "Squeeze the day", ar: "اعتصري يومكِ", pt: "Aproveite cada gota" } },
      { photo: "assets/photos/campaign/fruit-creams.webp", product: "cream-vf-golden-200-ml", also: ["cream-ruby-rhodolite-200-ml", "cream-obsessed-200-ml"], cat: "body-care", title: { en: "Freshly stacked", ar: "طبقات من الانتعاش", pt: "Empilhados e fresquinhos" } },
      { photo: "assets/photos/campaign/torn-lip.webp", product: "makeup-lip-oil-jujuba-3-5-g", cat: "makeup", title: { en: "Tear into colour", ar: "انطلقي نحو اللون", pt: "Mergulhe na cor" } },
      { photo: "assets/photos/campaign/serum-glow.webp", product: "skincare-serum-10-em-1-40-ml", cat: "skincare", pos: "50% 30%", title: { en: "Glow, drop by drop", ar: "إشراقة قطرة بقطرة", pt: "Brilho gota a gota" } },
      { photo: "assets/photos/campaign/king-blue-skyline.webp", product: "colonia-king-blue-supreme-100-ml", also: ["splash-king-blue-supreme-200-ml"], cat: "men", pos: "50% 60%", title: { en: "Own the night", ar: "الليل لك", pt: "Dono da noite" } },
      { photo: "assets/photos/campaign/golden-hour.webp", product: "colonia-liberte-nuit-100-ml", cat: "perfume", title: { en: "After golden hour", ar: "بعد الساعة الذهبية", pt: "Depois da hora dourada" } },
      { photo: "assets/photos/campaign/red-stripe.webp", product: "colonia-red-obsidian-100-ml", cat: "perfume", title: { en: "Seen in red", ar: "حضورٌ بالأحمر", pt: "Vista de vermelho" } },
      { photo: "assets/photos/campaign/pink-heaven-water.webp", product: "colonia-heaven-pink-100-ml", cat: "perfume", title: { en: "Making waves", ar: "تموّجات وردية", pt: "Ondas cor-de-rosa" } },
      { photo: "assets/photos/campaign/pink-obsessed-smoke.webp", product: "colonia-obsessed-lovely-100-ml", cat: "perfume", title: { en: "Lost in a pink cloud", ar: "في سحابة وردية", pt: "Nas nuvens cor-de-rosa" } },
      { photo: "assets/photos/campaign/pink-scarlette-heart.webp", product: "colonia-scarlette-50-ml", cat: "perfume", title: { en: "Love, bottled", ar: "الحب في زجاجة", pt: "Amor engarrafado" } },
    ],
    // "The pink edit" on the home page: product-only 4K shots (Nano Banana Pro, after pink Pinterest
    // campaign references). The first is the big one; `pos` frames each photo in its cell.
    pinkEdit: [
      { photo: "assets/photos/campaign/pink-splash-ribbons.webp", product: "splash-heaven-pink-200-ml", pos: "50% 40%" },
      { photo: "assets/photos/campaign/pink-heaven-water.webp", product: "colonia-heaven-pink-100-ml", pos: "45% 50%" },
      { photo: "assets/photos/campaign/pink-obsessed-smoke.webp", product: "colonia-obsessed-lovely-100-ml", pos: "50% 45%" },
      { photo: "assets/photos/campaign/pink-scarlette-heart.webp", product: "colonia-scarlette-50-ml", pos: "50% 50%" },
    ],
    // Campaign photos for the "Shop by ritual" tiles (`pos` frames them in the tile).
    categoryPhotos: {
      perfume: { src: "assets/photos/campaign/liberte-dore-boots.webp", pos: "50% 35%" }, // from the client
      "body-splash": { src: "assets/photos/campaign/pink-splash-ribbons.webp", pos: "50% 40%" }, // the pink edit: three body splashes on satin bows
      men: { src: "assets/photos/campaign/king-blue-skyline.webp", pos: "50% 60%" }, // Nano Banana Pro 4K: King Blue Supreme and its box, Gulf skyline
      "body-care": { src: "assets/photos/campaign/liberte-cream-giant.webp", pos: "48% 50%" }, // from the client
      hair: { src: "assets/photos/campaign/hair-silk.webp", pos: "50% 50%" },
      makeup: { src: "assets/photos/campaign/torn-lip.webp", pos: "50% 45%" },
      skincare: { src: "assets/photos/campaign/serum-glow.webp", pos: "50% 30%" }, // Nano Banana Pro 4K: Sérum 10 em 1
      "gift-sets": { src: "assets/photos/campaign/gift-box.webp", pos: "50% 50%" },
    },
    categories: {
      perfume: "colonia-vf-75-ml",
      "body-splash": "splash-celebrate-life-200-ml",
      men: "splash-king-blue-deep-200-ml",
      "body-care": "cream-vf-golden-200-ml",
      hair: "hairmist-vf-golden-50-ml",
      makeup: "makeup-lip-oil-marshmallow-3-5-g",
      skincare: "skincare-serum-pdrn-30-ml",
      "gift-sets": "set-kit-linha-vf-golden",
    },
  };

  // Help centre, modelled on wepink Brazil's "Central de Ajuda" and adapted to
  // the Gulf. {free}, {fee}, {days}, {delivery}, {country}, {vat}, {hours} and
  // {email} are filled in for the shopper's country. Confirm refund and
  // exchange times with the franchise before launch.
  const faq = [
    {
      id: "orders", icon: "truck", title: { en: "Orders & delivery", ar: "الطلبات والتوصيل", pt: "Pedidos e entrega" },
      items: [
        { q: { en: "Which countries do you deliver to?", ar: "إلى أي الدول توصلون؟", pt: "Para quais países vocês entregam?" },
          a: { en: "The UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman. Choose your country at the top of the page to see local prices, payment options and delivery times.", ar: "الإمارات والسعودية وقطر والكويت والبحرين وعُمان. اختاري دولتكِ أعلى الصفحة لرؤية الأسعار المحلية وطرق الدفع ومواعيد التوصيل.", pt: "Emirados Árabes Unidos, Arábia Saudita, Catar, Kuwait, Bahrein e Omã. Escolha seu país no topo da página para ver os preços locais, as formas de pagamento e os prazos de entrega." } },
        { q: { en: "How long does delivery take?", ar: "كم تستغرق مدة التوصيل؟", pt: "Qual é o prazo de entrega?" },
          a: { en: "To {country}: {delivery}. You'll see the date for your address at checkout.", ar: "إلى {country}: {delivery}. ستظهر لكِ مدة التوصيل لعنوانكِ عند إتمام الطلب.", pt: "{country}: {delivery}. A data para o seu endereço aparece ao finalizar a compra." } },
        { q: { en: "How much is delivery?", ar: "كم تكلفة التوصيل؟", pt: "Quanto custa o frete?" },
          a: { en: "Free on orders over {free}; below that it's {fee}.", ar: "مجاني للطلبات فوق {free}، وأقل من ذلك تكلفته {fee}.", pt: "Grátis em pedidos acima de {free}; abaixo disso, o frete é {fee}." } },
        { q: { en: "How do I track my order?", ar: "كيف أتابع طلبي؟", pt: "Como acompanho meu pedido?" },
          a: { en: "We message you on WhatsApp at every step: confirmed, packed, out for delivery. Signed in with Google or Apple? Your orders are under My account. Tracking can take up to 72 working hours to update after dispatch.", ar: "نراسلكِ على واتساب في كل خطوة: تأكيد الطلب، التجهيز، الخروج للتوصيل. إذا سجّلتِ الدخول عبر جوجل أو آبل ستجدين طلباتكِ في حسابي. قد يستغرق تحديث التتبع حتى 72 ساعة عمل بعد الشحن.", pt: "A gente te avisa no WhatsApp a cada etapa: confirmado, embalado, saiu para entrega. Entrou com Google ou Apple? Seus pedidos ficam em Minha conta. O rastreio pode levar até 72 horas úteis para atualizar depois do envio." } },
        { q: { en: "I entered the wrong address. Can I change it?", ar: "أدخلتُ عنوانًا خاطئًا، هل يمكنني تغييره؟", pt: "Coloquei o endereço errado. Posso alterar?" },
          a: { en: "Yes, until the order is out for delivery. WhatsApp us your order number and the right address and we'll update it.", ar: "نعم، طالما لم يخرج الطلب للتوصيل. أرسلي لنا رقم الطلب والعنوان الصحيح على واتساب وسنحدّثه.", pt: "Sim, enquanto o pedido não sair para entrega. Mande no WhatsApp o número do pedido e o endereço certo, que a gente atualiza." } },
        { q: { en: "Do you deliver outside the Gulf?", ar: "هل توصلون خارج الخليج؟", pt: "Vocês entregam fora do Golfo?" },
          a: { en: "Not yet. wepink Gulf delivers to the six GCC countries only.", ar: "ليس بعد. يوصل wepink الخليج إلى دول مجلس التعاون الست فقط.", pt: "Ainda não. A wepink Golfo entrega somente nos seis países do Golfo." } },
      ],
    },
    {
      id: "payment", icon: "cash", title: { en: "Payment", ar: "الدفع", pt: "Pagamento" },
      items: [
        { q: { en: "Which payment methods can I use?", ar: "ما طرق الدفع المتاحة؟", pt: "Quais formas de pagamento posso usar?" },
          a: { en: "Visa and Mastercard, Apple Pay, mada (KSA), KNET (Kuwait), BenefitPay (Bahrain), tabby and Tamara instalments, and cash on delivery. Checkout shows the ones available in {country}.", ar: "فيزا وماستركارد وApple Pay ومدى (السعودية) وكي نت (الكويت) وبنفت باي (البحرين) والتقسيط مع تابي وتمارا، والدفع عند الاستلام. تظهر لكِ عند الدفع الطرق المتاحة في {country}.", pt: "Visa e Mastercard, Apple Pay, mada (Arábia Saudita), KNET (Kuwait), BenefitPay (Bahrein), parcelamento com tabby e Tamara, e pagamento na entrega. Ao finalizar a compra, você vê as opções disponíveis no seu país ({country})." } },
        { q: { en: "Can I pay cash on delivery?", ar: "هل يمكنني الدفع عند الاستلام؟", pt: "Posso pagar em dinheiro na entrega?" },
          a: { en: "Yes, in every country we deliver to. Pay the courier in cash when your order arrives.", ar: "نعم، في كل الدول التي نوصل إليها. ادفعي نقدًا لمندوب التوصيل عند وصول طلبكِ.", pt: "Sim, em todos os países onde entregamos. É só pagar em dinheiro ao entregador quando o pedido chegar." } },
        { q: { en: "How do tabby and Tamara work?", ar: "كيف يعمل تابي وتمارا؟", pt: "Como funcionam tabby e Tamara?" },
          a: { en: "Choose tabby or Tamara at checkout to split your order into interest-free payments. Approval takes seconds and there are no fees when you pay on time.", ar: "اختاري تابي أو تمارا عند الدفع لتقسيم طلبكِ على دفعات بدون فوائد. الموافقة خلال ثوانٍ ولا رسوم عند السداد في الموعد.", pt: "Escolha tabby ou Tamara ao finalizar a compra para dividir o pedido em parcelas sem juros. A aprovação sai em segundos e não há taxas se você pagar em dia." } },
        { q: { en: "Is it safe to pay on this site?", ar: "هل الدفع على الموقع آمن؟", pt: "É seguro pagar neste site?" },
          a: { en: "Yes. Card payments go through an encrypted, PCI-compliant payment gateway with fraud checks; we never see or store your card number.", ar: "نعم. تتم مدفوعات البطاقات عبر بوابة دفع مشفّرة ومتوافقة مع معايير PCI مع أنظمة للحماية من الاحتيال، ولا نرى رقم بطاقتكِ ولا نحفظه.", pt: "Sim. Os pagamentos com cartão passam por um gateway de pagamento criptografado, em conformidade com o padrão PCI e com verificação antifraude; nunca vemos nem guardamos o número do seu cartão." } },
        { q: { en: "Do prices include VAT?", ar: "هل تشمل الأسعار ضريبة القيمة المضافة؟", pt: "Os preços já incluem o imposto (VAT)?" },
          a: { en: "Yes. Prices in {country} include VAT at {vat}% where it applies.", ar: "نعم. تشمل الأسعار في {country} ضريبة القيمة المضافة بنسبة {vat}٪ حيث تنطبق.", pt: "Sim. Para o seu país ({country}), os preços já incluem o VAT de {vat}%, quando aplicável." } },
      ],
    },
    {
      id: "returns", icon: "returns", title: { en: "Returns & refunds", ar: "الإرجاع والاسترداد", pt: "Devoluções e reembolsos" },
      items: [
        { q: { en: "What is your returns policy?", ar: "ما هي سياسة الإرجاع؟", pt: "Qual é a política de devolução?" },
          a: { en: "You have up to {days} calendar days after delivery for a wrong item, a change of mind, or fragrances and cosmetics (we check usage from a photo), and up to {quality} days for poor quality or a faulty cap or spray. Exchanges are always for the same product, and gifts sent with your order can't be returned. The full terms are with the request form below.", ar: "لديكِ حتى {days} أيام تقويمية بعد التوصيل في حال المنتج غير الصحيح أو تغيير الرأي أو العطور ومستحضرات التجميل (نتحقق من الاستخدام عبر صورة)، وحتى {quality} يومًا في حال الجودة غير المرضية أو عيب في الغطاء أو البخاخ. الاستبدال يكون دائمًا بالمنتج نفسه، والهدايا المرسلة مع الطلب لا تُرجع. الشروط الكاملة مع نموذج الطلب أدناه.", pt: "Você tem até {days} dias corridos após a entrega para produto errado, arrependimento, fragrâncias e cosméticos (avaliamos o uso por foto), e até {quality} dias para qualidade insatisfatória ou defeito na tampa ou na válvula. A troca é sempre pelo mesmo produto, e brindes enviados com o pedido não podem ser devolvidos. Os termos completos estão junto ao formulário abaixo." } },
        { q: { en: "How do I ask for an exchange or a return?", ar: "كيف أطلب استبدالًا أو إرجاعًا؟", pt: "Como peço uma troca ou devolução?" },
          a: { en: "Fill in the request form at the bottom of this page, or WhatsApp us your order number. We'll arrange the pickup.", ar: "املئي نموذج الطلب أسفل هذه الصفحة، أو أرسلي لنا رقم الطلب على واتساب، وسنرتّب الاستلام.", pt: "Preencha o formulário de solicitação no fim desta página ou mande o número do pedido no WhatsApp. A gente agenda a coleta." } },
        { q: { en: "How long does a refund take?", ar: "كم يستغرق استرداد المبلغ؟", pt: "Quanto tempo leva o reembolso?" },
          a: { en: "Up to 7 working days after the return reaches us, back to the way you paid. Cash-on-delivery orders are refunded by bank transfer or store credit.", ar: "حتى 7 أيام عمل بعد وصول المرتجع إلينا، إلى نفس وسيلة الدفع. وتُسترد طلبات الدفع عند الاستلام بتحويل بنكي أو رصيد في المتجر.", pt: "Até 7 dias úteis depois que a devolução chega até nós, na mesma forma de pagamento. Pedidos pagos na entrega são reembolsados por transferência bancária ou crédito na loja." } },
        { q: { en: "My order arrived damaged or wrong.", ar: "وصل طلبي تالفًا أو غير صحيح.", pt: "Meu pedido chegou danificado ou errado." },
          a: { en: "We're sorry! Within {days} days, send us a photo of the item and your invoice through the request form below or on WhatsApp, and we'll send the right product at no cost.", ar: "نعتذر! خلال {days} أيام، أرسلي لنا صورة المنتج والفاتورة عبر نموذج الطلب أدناه أو على واتساب، وسنرسل لكِ المنتج الصحيح مجانًا.", pt: "Sentimos muito! Em até {days} dias, envie uma foto do produto e da nota fiscal pelo formulário abaixo ou no WhatsApp, e enviamos o produto certo sem custo." } },
      ],
    },
    {
      id: "products", icon: "leaf", title: { en: "Products & safety", ar: "المنتجات والسلامة", pt: "Produtos e segurança" },
      items: [
        { q: { en: "Are your products authentic?", ar: "هل منتجاتكم أصلية؟", pt: "Os produtos são originais?" },
          a: { en: "Yes. wepink Gulf is the official franchise, and every product ships from our regional warehouse.", ar: "نعم. wepink الخليج هو الامتياز الرسمي، وكل منتج يُشحن من مستودعنا الإقليمي.", pt: "Sim. A wepink Golfo é a franquia oficial, e todos os produtos saem do nosso centro de distribuição regional." } },
        { q: { en: "Are the products dermatologically tested?", ar: "هل المنتجات مختبرة جلديًا؟", pt: "Os produtos são dermatologicamente testados?" },
          a: { en: "Yes. wepink products are dermatologically tested and go through strict quality control, so you can use them with confidence.", ar: "نعم. منتجات wepink مختبرة جلديًا وتخضع لرقابة جودة صارمة، لتستخدميها بثقة واطمئنان.", pt: "Sim. Os produtos wepink são dermatologicamente testados e passam por um rigoroso controle de qualidade, para você usar com toda a confiança." } },
        { q: { en: "Are they tested on animals?", ar: "هل تُختبر على الحيوانات؟", pt: "São testados em animais?" },
          a: { en: "Never. wepink doesn't test on animals and doesn't allow its suppliers to.", ar: "أبدًا. لا تختبر wepink منتجاتها على الحيوانات ولا تسمح لمورّديها بذلك.", pt: "Nunca. A wepink não testa em animais e não permite que seus fornecedores testem." } },
        { q: { en: "Can I use them while pregnant or breastfeeding?", ar: "هل يمكنني استخدامها أثناء الحمل أو الرضاعة؟", pt: "Posso usar durante a gravidez ou a amamentação?" },
          a: { en: "Please check with your doctor before using any product during pregnancy or breastfeeding, or if you have allergies.", ar: "يُرجى استشارة طبيبكِ قبل استخدام أي منتج أثناء الحمل أو الرضاعة، أو إذا كانت لديكِ حساسية.", pt: "Consulte seu médico antes de usar qualquer produto durante a gravidez ou a amamentação, ou se você tiver alergias." } },
        { q: { en: "What if I have an allergic reaction?", ar: "ماذا أفعل عند حدوث رد فعل تحسسي؟", pt: "E se eu tiver uma reação alérgica?" },
          a: { en: "Stop using the product straight away and see a doctor if it doesn't settle. Then WhatsApp us, and our care team will guide you through the next steps.", ar: "توقفي عن استخدام المنتج فورًا وراجعي الطبيب إذا استمرت الأعراض، ثم راسلينا على واتساب وسيرشدكِ فريق العناية إلى الخطوات التالية.", pt: "Pare de usar o produto imediatamente e procure um médico se a reação não passar. Depois, fale com a gente no WhatsApp: nosso time de atendimento vai te orientar nos próximos passos." } },
        { q: { en: "Do the scents last in the heat?", ar: "هل تدوم العطور في الحر؟", pt: "As fragrâncias duram no calor?" },
          a: { en: "Body splashes are light by design, so layer them over the matching body cream and refresh through the day. For a longer trail, finish with the eau de cologne.", ar: "البودي سبلاش خفيف بطبيعته، لذا ضعيه فوق كريم الجسم المطابق وجدّديه خلال اليوم. ولأثر أطول، اختمي بالكولونيا.", pt: "Os body splashes são leves por natureza, então aplique por cima do body cream da mesma fragrância e reaplique ao longo do dia. Para um rastro mais duradouro, finalize com o desodorante colônia." } },
      ],
    },
    {
      id: "about", icon: "sparkle", title: { en: "About wepink", ar: "عن wepink", pt: "Sobre a wepink" },
      items: [
        { q: { en: "Who is wepink?", ar: "من هي wepink؟", pt: "Quem é a wepink?" },
          a: { en: "wepink is the Brazilian fragrance and beauty house co-founded by Virginia Fonseca: body splashes, perfumes and body care that make every day feel special. wepink Gulf is its official franchise in the GCC.", ar: "wepink دار عطور وجمال برازيلية شاركت في تأسيسها فيرجينيا فونسيكا: بودي سبلاش وعطور ومنتجات عناية بالجسم تجعل كل يوم مميزًا. وwepink الخليج هو امتيازها الرسمي في دول الخليج.", pt: "A wepink é a casa brasileira de fragrâncias e beleza cofundada por Virginia Fonseca: body splashes, perfumes e cuidados com o corpo que deixam todo dia especial. A wepink Golfo é a franquia oficial da marca nos países do Golfo." } },
        { q: { en: "Where can I buy safely?", ar: "أين أشتري بأمان؟", pt: "Onde comprar com segurança?" },
          a: { en: "On this website, through our official WhatsApp and, soon, in our Gulf stores. Products bought anywhere else aren't guaranteed to be authentic.", ar: "على هذا الموقع، وعبر واتساب الرسمي، وقريبًا في متاجرنا في الخليج. لا نضمن أصالة المنتجات المشتراة من أي مكان آخر.", pt: "Neste site, no nosso WhatsApp oficial e, em breve, nas nossas lojas no Golfo. Não garantimos a originalidade de produtos comprados em qualquer outro lugar." } },
        { q: { en: "Do you have stores?", ar: "هل لديكم متاجر؟", pt: "Vocês têm lojas físicas?" },
          a: { en: "Our first Gulf stores are on the way. Register on the Stores page and we'll invite you to the opening.", ar: "متاجرنا الأولى في الخليج في الطريق. سجّلي في صفحة المتاجر وسندعوكِ إلى الافتتاح.", pt: "Nossas primeiras lojas no Golfo estão chegando. Cadastre-se na página Lojas e a gente te convida para a inauguração." } },
      ],
    },
    {
      id: "account", icon: "user", title: { en: "Account, Club & ambassadors", ar: "الحساب والنادي والسفيرات", pt: "Conta, wepink Club e embaixadoras" },
      items: [
        { q: { en: "Do I need an account to order?", ar: "هل أحتاج حسابًا لأطلب؟", pt: "Preciso de uma conta para comprar?" },
          a: { en: "No. You can check out as a guest. Sign in with Google or Apple to see your orders and fill in your details faster.", ar: "لا. يمكنكِ الطلب كضيفة، أو سجّلي الدخول عبر جوجل أو آبل لرؤية طلباتكِ وتعبئة بياناتكِ أسرع.", pt: "Não. Você pode comprar sem cadastro. Entre com Google ou Apple para ver seus pedidos e preencher seus dados mais rápido." } },
        { q: { en: "I signed up with the wrong email. Can I change it?", ar: "سجّلتُ ببريد إلكتروني خاطئ، هل يمكنني تغييره؟", pt: "Me cadastrei com o e-mail errado. Posso trocar?" },
          a: { en: "Yes. WhatsApp us or email {email} from your new address and we'll update it.", ar: "نعم. راسلينا على واتساب أو على {email} من بريدكِ الجديد وسنحدّثه.", pt: "Sim. Fale com a gente no WhatsApp ou escreva para {email} a partir do seu novo e-mail, que a gente atualiza." } },
        { q: { en: "What is the wepink Club?", ar: "ما هو نادي wepink؟", pt: "O que é o wepink Club?" },
          a: { en: "Our free list for first news of launches, offers and a birthday treat on WhatsApp. Join from the footer; you can leave any time.", ar: "قائمتنا المجانية لأول أخبار الإصدارات والعروض وهدية عيد الميلاد على واتساب. انضمي من أسفل الصفحة ويمكنكِ المغادرة متى شئتِ.", pt: "Nossa lista gratuita para saber em primeira mão dos lançamentos e ofertas, e ganhar um mimo de aniversário no WhatsApp. Entre pelo rodapé do site; você pode sair quando quiser." } },
        { q: { en: "How do I become an ambassador?", ar: "كيف أصبح سفيرة؟", pt: "Como me torno embaixadora?" },
          a: { en: "Sign up on the Earn page to get your own code. Your friends get a discount on their first order and you earn commission on every order they place.", ar: "سجّلي في صفحة اربحي معنا لتحصلي على كودكِ الخاص. تحصل صديقاتكِ على خصم على طلبهن الأول وتربحين عمولة على كل طلب.", pt: "Cadastre-se na página Ganhe com a wepink para receber seu código exclusivo. Seus amigos ganham desconto no primeiro pedido e você ganha comissão em cada pedido que eles fizerem." } },
      ],
    },
  ];

  // What each season changes: the announcement bar's first message, the
  // greeting on the home page, a decoration over the hero, and the colour of
  // the silk threads. {country} and {amount} are filled in for the shopper.
  // Exchange and return terms, shown in the help centre before the request form
  // (the shopper reads them and accepts before continuing), as on wepink Brasil.
  // `days`: "days" uses config.returnsDays, "quality" config.qualityDays.
  const returnTerms = {
    reasons: [
      {
        title: { en: "Wrong item", ar: "منتج غير صحيح", pt: "Produto errado" },
        hint: { en: "a different product from the one you ordered", ar: "منتج مختلف عمّا طلبتِه", pt: "produto diferente do que foi pedido" },
        send: { en: "a clear photo of your invoice + a photo of the item you received.", ar: "صورة واضحة للفاتورة + صورة للمنتج الذي استلمتِه.", pt: "uma foto legível da nota fiscal + uma foto do produto recebido." },
        days: "days",
      },
      {
        title: { en: "I changed my mind / ordered the wrong product", ar: "غيّرت رأيي / طلبت منتجًا خطأ", pt: "Me arrependi / pedi o produto errado" },
        hint: { en: "the order was placed with the wrong product", ar: "تم الطلب بمنتج غير المقصود", pt: "pedido feito com o produto errado" },
        send: { en: "a photo of the product you received.", ar: "صورة للمنتج الذي استلمتِه.", pt: "uma foto do produto recebido." },
        days: "days",
      },
      {
        title: { en: "Fragrances", ar: "العطور", pt: "Fragrâncias" },
        hint: { en: "perfumes, body splashes, creams", ar: "العطور، البودي سبلاش، الكريمات", pt: "perfumes, body splashes, cremes" },
        send: { en: "a photo of the front of the product, so we can check how much was used.", ar: "صورة لواجهة المنتج لنتحقق من مقدار الاستخدام.", pt: "uma foto da frente do produto para avaliarmos o uso." },
        days: "days",
      },
      {
        title: { en: "Cosmetics", ar: "مستحضرات التجميل", pt: "Cosméticos" },
        hint: { en: "lip gloss, makeup and others", ar: "ملمّع الشفاه والمكياج وغيرها", pt: "gloss, maquiagem e outros" },
        send: { en: "a photo of the front of the product.", ar: "صورة لواجهة المنتج.", pt: "uma foto da frente do produto." },
        days: "days",
      },
      {
        title: { en: "Poor quality", ar: "جودة غير مرضية", pt: "Qualidade insatisfatória" },
        hint: { en: "appearance or performance not as expected", ar: "المظهر أو الأداء ليس كما هو متوقّع", pt: "aparência ou desempenho abaixo do esperado" },
        send: { en: "a photo of the product for evaluation (used or new).", ar: "صورة للمنتج لتقييمه (مستخدمًا كان أو جديدًا).", pt: "uma foto do produto para avaliação (usado ou novo)." },
        days: "quality",
      },
      {
        title: { en: "Faulty cap or spray", ar: "عيب في الغطاء أو البخاخ", pt: "Defeito na tampa ou na válvula" },
        hint: { en: "damaged or not working", ar: "تالف أو لا يعمل", pt: "danificada ou sem funcionar" },
        send: { en: "a photo of the product for review.", ar: "صورة للمنتج لمراجعته.", pt: "uma foto do produto para análise." },
        days: "quality",
      },
    ],
    kits: { en: "For a refund on a product that is part of a kit, you must return all the items in the kit.", ar: "لاسترداد مبلغ منتج ضمن طقم، يجب إرجاع جميع منتجات الطقم.", pt: "Para reembolso de produtos que fazem parte de um kit, é preciso devolver todos os itens do kit." },
    notes: [
      {
        title: { en: "Exchanges are always for the same product.", ar: "الاستبدال يكون دائمًا بالمنتج نفسه.", pt: "A troca é sempre pelo mesmo produto." },
        text: { en: "You can only exchange for an item identical to the one you bought, and only if it is faulty, damaged or not the item you ordered.", ar: "يمكن الاستبدال فقط بمنتج مطابق لما اشتريتِه، وفقط في حال وجود عيب أو تلف أو إذا وصلكِ منتج غير الذي طلبتِه.", pt: "Você só pode trocar por um item idêntico ao que comprou, e apenas em caso de defeito, avaria ou se o produto recebido estiver errado." },
      },
      {
        title: { en: "Gifts can't be exchanged, returned or refunded.", ar: "الهدايا لا تُستبدل ولا تُرجع ولا يُسترد مبلغها.", pt: "Brindes não podem ser trocados, devolvidos nem reembolsados." },
        text: { en: "Items sent as gifts with your order are not eligible for exchanges, returns or refunds.", ar: "المنتجات المرسلة كهدية مع طلبكِ غير مشمولة بالاستبدال أو الإرجاع أو الاسترداد.", pt: "Itens enviados como brinde junto com o seu pedido não podem ser trocados, devolvidos nem reembolsados." },
      },
    ],
  };

  const seasons = {
    ramadan: {
      name: { en: "Ramadan", ar: "رمضان", pt: "Ramadã" }, motif: "crescent", threads: "#d4a85a",
      greeting: { en: "Ramadan Kareem", ar: "رمضان كريم", pt: "Ramadan Kareem" },
      announce: { en: "Ramadan Kareem 🌙 Free gift wrap and a handwritten card on every order", ar: "رمضان كريم 🌙 تغليف هدايا مجاني وبطاقة مكتوبة بخط اليد مع كل طلب", pt: "Ramadan Kareem 🌙 Embalagem de presente grátis e um cartão escrito à mão em todos os pedidos" },
    },
    eid: {
      name: { en: "Eid", ar: "العيد", pt: "Eid" }, motif: "stars", threads: "#d4a85a",
      greeting: { en: "Eid Mubarak", ar: "عيد مبارك", pt: "Eid Mubarak" },
      announce: { en: "Eid Mubarak ✨ Gift sets wrapped and delivered across the Gulf", ar: "عيد مبارك ✨ أطقم الهدايا مغلّفة وتصلكِ في كل دول الخليج", pt: "Eid Mubarak ✨ Kits de presente embalados e entregues em todo o Golfo" },
    },
    national: {
      name: { en: "National Day", ar: "اليوم الوطني", pt: "Dia Nacional" }, motif: "flag", threads: "flag",
      greeting: { en: "Happy {country} National Day", ar: "كل عام و{country} بخير", pt: "Feliz Dia Nacional, {country}" },
      announce: { en: "Happy {country} National Day 💚 Free delivery on orders over {amount}", ar: "كل عام و{country} بخير 💚 توصيل مجاني للطلبات فوق {amount}", pt: "Feliz Dia Nacional, {country} 💚 Frete grátis em pedidos acima de {amount}" },
    },
    whitefriday: {
      name: { en: "White Friday", ar: "الجمعة البيضاء", pt: "White Friday" }, motif: "sparkle", threads: "#e9e3f0",
      greeting: { en: "White Friday", ar: "الجمعة البيضاء", pt: "White Friday" },
      announce: { en: "White Friday is here 🤍 The season's favourites, wrapped for gifting", ar: "وصلت الجمعة البيضاء 🤍 مفضّلات الموسم مغلّفة للإهداء", pt: "Chegou a White Friday 🤍 Os favoritos da temporada, embalados para presente" },
    },
  };
  // National Day: each country's own name and flag colours.
  const national = {
    AE: { name: { en: "UAE", ar: "الإمارات", pt: "Emirados" }, flag: ["#00732f", "#ef3340", "#000000"] },
    SA: { name: { en: "Saudi", ar: "السعودية", pt: "Arábia Saudita" }, flag: ["#006c35", "#ffffff", "#006c35"] },
    QA: { name: { en: "Qatar", ar: "قطر", pt: "Catar" }, flag: ["#8a1538", "#ffffff", "#8a1538"] },
    KW: { name: { en: "Kuwait", ar: "الكويت", pt: "Kuwait" }, flag: ["#007a3d", "#ce1126", "#000000"] },
    BH: { name: { en: "Bahrain", ar: "البحرين", pt: "Bahrein" }, flag: ["#ce1126", "#ffffff", "#ce1126"] },
    OM: { name: { en: "Oman", ar: "عُمان", pt: "Omã" }, flag: ["#db161b", "#008000", "#ffffff"] },
  };

  const stores = [
    { country: "AE", city: ["Dubai", "دبي"], label: { en: "Flagship store", ar: "المتجر الرئيسي", pt: "Loja conceito" } },
    { country: "AE", city: ["Abu Dhabi", "أبوظبي"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "AE", city: ["Sharjah", "الشارقة"], label: { en: "Kiosk", ar: "كشك", pt: "Quiosque" } },
    { country: "SA", city: ["Riyadh", "الرياض"], label: { en: "Flagship store", ar: "المتجر الرئيسي", pt: "Loja conceito" } },
    { country: "SA", city: ["Jeddah", "جدة"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "SA", city: ["Al Khobar", "الخبر"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "QA", city: ["Doha", "الدوحة"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "KW", city: ["Kuwait City", "مدينة الكويت", "Cidade do Kuwait"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "BH", city: ["Manama", "المنامة"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
    { country: "OM", city: ["Muscat", "مسقط", "Mascate"], label: { en: "Store", ar: "متجر", pt: "Loja" } },
  ];

  return { config, countries, payNames, categories, families, types: T, products, featured, stores, faq, returnTerms, seasons, national };
})();
