/* wepink Gulf — store data.
 * Everything the client is likely to change lives here: contact details,
 * countries (currency, VAT, delivery), stores and the product catalogue.
 * Prices are set once in AED (`price`) and converted per country; add
 * `prices: { SAR: 75, KWD: 6.25 }` to a product to set a local price by hand.
 */
window.WP_DATA = (function () {
  const config = {
    brand: "wepink",
    region: { en: "Gulf", ar: "الخليج" },
    whatsapp: "971500000000", // placeholder: client's WhatsApp Business number
    email: "care@wepink-gulf.com", // placeholder
    instagram: "https://www.instagram.com/wepink/",
    tiktok: "https://www.tiktok.com/@wepink",
    returnsDays: 14,
  };

  // Each country sets its own free-delivery threshold and delivery fee in
  // local currency (`freeOver`, `fee`).
  // Currency rates are AED -> local. AED, SAR, QAR, BHD and OMR are pegged
  // to the US dollar; KWD follows a basket, so check it before going live.
  const countries = {
    AE: {
      name: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
      short: { en: "UAE", ar: "الإمارات" },
      currency: "AED", symbol: { en: "AED", ar: "د.إ" }, rate: 1, decimals: 0, vat: 5,
      dial: "+971",
      freeOver: 150, fee: 15,
      cities: [
        ["Dubai", "دبي"], ["Abu Dhabi", "أبوظبي"], ["Sharjah", "الشارقة"], ["Ajman", "عجمان"],
        ["Ras Al Khaimah", "رأس الخيمة"], ["Fujairah", "الفجيرة"], ["Umm Al Quwain", "أم القيوين"], ["Al Ain", "العين"],
      ],
      delivery: { en: "1–2 working days · same day in Dubai before 2pm", ar: "1–2 يوم عمل · نفس اليوم في دبي قبل الساعة 2 ظهرًا" },
      pay: ["card", "applepay", "tabby", "tamara", "cod"],
    },
    SA: {
      name: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
      short: { en: "KSA", ar: "السعودية" },
      currency: "SAR", symbol: { en: "SAR", ar: "ر.س" }, rate: 1.0211, decimals: 0, vat: 15,
      dial: "+966",
      freeOver: 150, fee: 15,
      cities: [
        ["Riyadh", "الرياض"], ["Jeddah", "جدة"], ["Dammam", "الدمام"], ["Al Khobar", "الخبر"],
        ["Makkah", "مكة المكرمة"], ["Madinah", "المدينة المنورة"], ["Taif", "الطائف"], ["Abha", "أبها"],
      ],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل" },
      pay: ["card", "mada", "applepay", "tabby", "tamara", "cod"],
    },
    QA: {
      name: { en: "Qatar", ar: "قطر" },
      short: { en: "Qatar", ar: "قطر" },
      currency: "QAR", symbol: { en: "QAR", ar: "ر.ق" }, rate: 0.9912, decimals: 0, vat: 0,
      dial: "+974",
      freeOver: 150, fee: 15,
      cities: [["Doha", "الدوحة"], ["Al Wakrah", "الوكرة"], ["Al Rayyan", "الريان"], ["Lusail", "لوسيل"], ["Al Khor", "الخور"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل" },
      pay: ["card", "applepay", "cod"],
    },
    KW: {
      name: { en: "Kuwait", ar: "الكويت" },
      short: { en: "Kuwait", ar: "الكويت" },
      currency: "KWD", symbol: { en: "KWD", ar: "د.ك" }, rate: 0.0837, decimals: 3, vat: 0,
      dial: "+965",
      freeOver: 12, fee: 1.5,
      cities: [["Kuwait City", "مدينة الكويت"], ["Hawalli", "حولي"], ["Salmiya", "السالمية"], ["Al Ahmadi", "الأحمدي"], ["Jahra", "الجهراء"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل" },
      pay: ["card", "knet", "applepay", "tabby", "cod"],
    },
    BH: {
      name: { en: "Bahrain", ar: "البحرين" },
      short: { en: "Bahrain", ar: "البحرين" },
      currency: "BHD", symbol: { en: "BHD", ar: "د.ب" }, rate: 0.1026, decimals: 3, vat: 10,
      dial: "+973",
      freeOver: 15, fee: 1.5,
      cities: [["Manama", "المنامة"], ["Muharraq", "المحرق"], ["Riffa", "الرفاع"], ["Seef", "السيف"], ["Isa Town", "مدينة عيسى"]],
      delivery: { en: "2–4 working days", ar: "2–4 أيام عمل" },
      pay: ["card", "benefit", "applepay", "cod"],
    },
    OM: {
      name: { en: "Oman", ar: "سلطنة عُمان" },
      short: { en: "Oman", ar: "عُمان" },
      currency: "OMR", symbol: { en: "OMR", ar: "ر.ع" }, rate: 0.1048, decimals: 3, vat: 5,
      dial: "+968",
      freeOver: 15, fee: 1.5,
      cities: [["Muscat", "مسقط"], ["Salalah", "صلالة"], ["Sohar", "صحار"], ["Nizwa", "نزوى"], ["Sur", "صور"]],
      delivery: { en: "3–5 working days", ar: "3–5 أيام عمل" },
      pay: ["card", "applepay", "cod"],
    },
  };

  const payNames = {
    card: { en: "Credit / debit card", ar: "بطاقة ائتمان / خصم" },
    mada: { en: "mada", ar: "مدى" },
    knet: { en: "KNET", ar: "كي نت" },
    benefit: { en: "BenefitPay", ar: "بنفت باي" },
    applepay: { en: "Apple Pay", ar: "Apple Pay" },
    tabby: { en: "tabby — 4 interest-free payments", ar: "تابي — 4 دفعات بدون فوائد" },
    tamara: { en: "Tamara — split in 4", ar: "تمارا — قسّمها على 4" },
    cod: { en: "Cash on delivery", ar: "الدفع عند الاستلام" },
  };

  const categories = [
    { id: "body-splash", name: { en: "Body Splash", ar: "بودي سبلاش" }, blurb: { en: "Light, layerable, all-day", ar: "خفيف وقابل للدمج وطوال اليوم" }, art: "splash", color: "#E6007E", color2: "#FF8CC6" },
    { id: "perfume", name: { en: "Perfume", ar: "العطور" }, blurb: { en: "Long-lasting eau de parfum", ar: "أو دو بارفان يدوم طويلًا" }, art: "perfume", color: "#9E0B5A", color2: "#E9B872" },
    { id: "body-care", name: { en: "Body Care", ar: "العناية بالجسم" }, blurb: { en: "Lotions & body butters", ar: "لوشن وزبدة الجسم" }, art: "lotion", color: "#F49AC1", color2: "#FFFFFF" },
    { id: "hair-mist", name: { en: "Hair Mist", ar: "عطر الشعر" }, blurb: { en: "Scent that moves with you", ar: "عطر يتحرك معكِ" }, art: "mist", color: "#C77DFF", color2: "#FFE3EF" },
    { id: "gift-sets", name: { en: "Gift Sets", ar: "أطقم الهدايا" }, blurb: { en: "Wrapped in pink, ready to give", ar: "مغلّفة بالوردي وجاهزة للإهداء" }, art: "set", color: "#E6007E", color2: "#FFD1E6" },
  ];

  const families = {
    sweet: { en: "Sweet & gourmand", ar: "حلو وشهي" },
    floral: { en: "Floral & fruity", ar: "زهري وفاكهي" },
    fresh: { en: "Fresh & clean", ar: "منعش ونظيف" },
    warm: { en: "Warm & oriental", ar: "دافئ وشرقي" },
  };

  // Notes are [en, ar] pairs.
  const N = {
    vanilla: ["Vanilla", "فانيلا"], caramel: ["Caramel", "كراميل"], praline: ["Praline", "برالين"],
    amber: ["Amber", "عنبر"], tonka: ["Tonka bean", "حبوب التونكا"], pear: ["Pear", "كمثرى"],
    peony: ["Peony", "فاوانيا"], musk: ["White musk", "مسك أبيض"], bergamot: ["Bergamot", "برغموت"],
    jasmine: ["Jasmine", "ياسمين"], sea: ["Sea notes", "نفحات بحرية"], citrus: ["Citrus", "حمضيات"],
    cedar: ["Cedarwood", "خشب الأرز"], sugar: ["Spun sugar", "غزل البنات"], sandal: ["Sandalwood", "خشب الصندل"],
    pepper: ["Pink pepper", "فلفل وردي"], rose: ["Rose", "ورد"], patchouli: ["Patchouli", "باتشولي"],
    oud: ["Oud", "عود"], saffron: ["Saffron", "زعفران"], berries: ["Red berries", "توت أحمر"],
    coconut: ["Coconut", "جوز الهند"], lychee: ["Lychee", "ليتشي"], orange: ["Orange blossom", "زهر البرتقال"],
    mint: ["Mint", "نعناع"], lily: ["Water lily", "زنبق الماء"],
  };

  const T = {
    splash: { en: "Body Splash", ar: "بودي سبلاش" },
    perfume: { en: "Eau de Parfum", ar: "أو دو بارفان" },
    lotion: { en: "Body Lotion", ar: "لوشن الجسم" },
    butter: { en: "Body Butter", ar: "زبدة الجسم" },
    mist: { en: "Hair Mist", ar: "عطر الشعر" },
    set: { en: "Gift Set", ar: "طقم هدايا" },
  };

  // Sample catalogue — replace names, sizes, notes and prices with the
  // official GCC range from the brand before launch.
  const products = [
    {
      id: "obsessed-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Obsessed",
      size: "200 ml", price: 69, family: "sweet", color: "#E6007E", color2: "#FF8CC6", badge: "bestseller",
      notes: { top: [N.berries, N.pear], heart: [N.praline, N.caramel], base: [N.vanilla, N.musk] },
      desc: {
        en: "The one everyone asks about. A sugary, glowing cloud of red berries, praline and creamy vanilla that clings to skin and clothes all day.",
        ar: "العطر الذي يسأل عنه الجميع. سحابة حلوة ومشرقة من التوت الأحمر والبرالين والفانيلا الكريمية تدوم على البشرة والملابس طوال اليوم.",
      },
    },
    {
      id: "warm-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Warm",
      size: "200 ml", price: 69, family: "warm", color: "#C2562B", color2: "#F4B183",
      notes: { top: [N.orange, N.pepper], heart: [N.amber, N.tonka], base: [N.vanilla, N.sandal] },
      desc: {
        en: "A golden-hour hug: amber and tonka bean wrapped in soft vanilla and sandalwood. Cosy, addictive, made for evenings.",
        ar: "عناق وقت الغروب: عنبر وحبوب التونكا ملفوفة بفانيلا ناعمة وخشب الصندل. دافئ ومُدمن ومثالي للمساء.",
      },
    },
    {
      id: "liberte-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Liberté",
      size: "200 ml", price: 69, family: "floral", color: "#F06FA8", color2: "#FFD1E6", badge: "new",
      notes: { top: [N.pear, N.lychee], heart: [N.peony, N.rose], base: [N.musk] },
      desc: {
        en: "Juicy pear and lychee over a bouquet of peony and rose. Bright, flirty and impossible not to notice.",
        ar: "كمثرى وليتشي منعشة فوق باقة من الفاوانيا والورد. مشرق ومرح ولا يمكن تجاهله.",
      },
    },
    {
      id: "infinity-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Infinity",
      size: "200 ml", price: 69, family: "floral", color: "#8E6BD6", color2: "#D8C8FF",
      notes: { top: [N.bergamot], heart: [N.jasmine, N.orange], base: [N.musk, N.cedar] },
      desc: {
        en: "Clean jasmine and orange blossom on a bed of white musk. Soft, elegant and easy to wear every single day.",
        ar: "ياسمين نقي وزهر البرتقال على قاعدة من المسك الأبيض. ناعم وأنيق وسهل الاستخدام كل يوم.",
      },
    },
    {
      id: "aqua-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Aqua",
      size: "200 ml", price: 69, family: "fresh", color: "#1FA5C9", color2: "#A6E6F5",
      notes: { top: [N.citrus, N.mint], heart: [N.sea, N.lily], base: [N.cedar, N.musk] },
      desc: {
        en: "A splash of sea air and citrus for the hottest days. Keep it in the fridge and thank us in August.",
        ar: "رذاذ من نسيم البحر والحمضيات لأشد الأيام حرارة. احتفظي به في الثلاجة وستشكريننا في أغسطس.",
      },
    },
    {
      id: "vanilla-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "Vanilla",
      size: "200 ml", price: 69, family: "sweet", color: "#D9A65B", color2: "#FBE6C2", badge: "bestseller",
      notes: { top: [N.sugar], heart: [N.vanilla, N.coconut], base: [N.sandal, N.musk] },
      desc: {
        en: "Pure, creamy vanilla with a sprinkle of spun sugar and coconut. The comfort scent that went viral.",
        ar: "فانيلا كريمية نقية مع لمسة من غزل البنات وجوز الهند. عطر الراحة الذي انتشر في كل مكان.",
      },
    },
    {
      id: "vf-eau-de-parfum", cat: "perfume", type: "perfume", art: "perfume", line: "VF",
      size: "100 ml", price: 159, family: "sweet", color: "#B0005E", color2: "#E9B872", badge: "bestseller",
      notes: { top: [N.pepper, N.berries], heart: [N.rose, N.praline], base: [N.vanilla, N.patchouli] },
      desc: {
        en: "The signature. Pink pepper and rose melt into praline, vanilla and patchouli for a trail that lasts from morning coffee to midnight.",
        ar: "العطر المميز. فلفل وردي وورد يذوبان في البرالين والفانيلا والباتشولي ليتركوا أثرًا يدوم من قهوة الصباح حتى منتصف الليل.",
      },
    },
    {
      id: "vf-aqua-eau-de-parfum", cat: "perfume", type: "perfume", art: "perfume", line: "VF Aqua",
      size: "100 ml", price: 159, family: "fresh", color: "#2A8FB8", color2: "#DDE7EE",
      notes: { top: [N.bergamot, N.citrus], heart: [N.sea, N.jasmine], base: [N.musk, N.cedar] },
      desc: {
        en: "The signature, turned breezy. Sparkling bergamot and sea notes over clean musk — fresh but never forgettable.",
        ar: "العطر المميز بنسخة منعشة. برغموت متألق ونفحات بحرية فوق مسك نقي — منعش لكنه لا يُنسى.",
      },
    },
    {
      id: "pink-oud-eau-de-parfum", cat: "perfume", type: "perfume", art: "perfume", line: "Pink Oud",
      size: "100 ml", price: 189, family: "warm", color: "#5E0B33", color2: "#D4A85A", badge: "exclusive",
      notes: { top: [N.saffron, N.pepper], heart: [N.rose, N.amber], base: [N.oud, N.vanilla] },
      desc: {
        en: "Made for the Gulf. Saffron and Taif-style rose over smooth oud and vanilla — wepink sweetness with an oriental soul.",
        ar: "صُنع للخليج. زعفران وورد طائفي فوق عود ناعم وفانيلا — حلاوة wepink بروح شرقية.",
      },
    },
    {
      id: "obsessed-body-lotion", cat: "body-care", type: "lotion", art: "lotion", line: "Obsessed",
      size: "200 ml", price: 59, family: "sweet", color: "#E6007E", color2: "#FFE3EF",
      notes: { top: [N.berries], heart: [N.praline], base: [N.vanilla, N.musk] },
      desc: {
        en: "Fast-absorbing body lotion in our most-loved scent. Moisturises for 24 hours and makes your body splash last longer.",
        ar: "لوشن سريع الامتصاص بعطرنا الأكثر حبًا. يرطب لمدة 24 ساعة ويجعل البودي سبلاش يدوم أطول.",
      },
    },
    {
      id: "liberte-body-lotion", cat: "body-care", type: "lotion", art: "lotion", line: "Liberté",
      size: "200 ml", price: 59, family: "floral", color: "#F06FA8", color2: "#FFFFFF",
      notes: { top: [N.pear], heart: [N.peony, N.rose], base: [N.musk] },
      desc: {
        en: "Silky lotion with peony and pear. Light enough for summer, rich enough for air-conditioned offices.",
        ar: "لوشن حريري بالفاوانيا والكمثرى. خفيف بما يكفي للصيف وغني بما يكفي للمكاتب المكيّفة.",
      },
    },
    {
      id: "vanilla-body-butter", cat: "body-care", type: "butter", art: "jar", line: "Vanilla",
      size: "200 g", price: 79, family: "sweet", color: "#D9A65B", color2: "#FFF4E2", badge: "new",
      notes: { top: [N.sugar], heart: [N.vanilla], base: [N.coconut, N.sandal] },
      desc: {
        en: "A whipped body butter with shea and coconut oil. Melts into skin and leaves a soft vanilla glow.",
        ar: "زبدة جسم مخفوقة بزبدة الشيا وزيت جوز الهند. تذوب في البشرة وتترك توهجًا ناعمًا بالفانيلا.",
      },
    },
    {
      id: "obsessed-hair-mist", cat: "hair-mist", type: "mist", art: "mist", line: "Obsessed",
      size: "100 ml", price: 49, family: "sweet", color: "#E6007E", color2: "#FFD1E6",
      notes: { top: [N.berries], heart: [N.praline], base: [N.vanilla] },
      desc: {
        en: "Alcohol-free hair perfume with a touch of argan oil. Scent that moves when you do — perfect under a shayla too.",
        ar: "عطر شعر خالٍ من الكحول مع لمسة من زيت الأرغان. عطر يتحرك معكِ — ومثالي تحت الشيلة أيضًا.",
      },
    },
    {
      id: "pink-oud-hair-mist", cat: "hair-mist", type: "mist", art: "mist", line: "Pink Oud",
      size: "100 ml", price: 59, family: "warm", color: "#5E0B33", color2: "#E8C98F", badge: "exclusive",
      notes: { top: [N.saffron], heart: [N.rose], base: [N.oud, N.vanilla] },
      desc: {
        en: "Our Gulf exclusive, made gentle for hair. Rose and soft oud that lingers on every turn of the head.",
        ar: "حصريتنا الخليجية بتركيبة لطيفة للشعر. ورد وعود ناعم يبقى مع كل التفاتة.",
      },
    },
    {
      id: "obsessed-ritual-set", cat: "gift-sets", type: "set", art: "set", line: "Obsessed Ritual",
      size: { en: "Splash 200 ml · Lotion 200 ml · Hair mist 100 ml", ar: "سبلاش 200 مل · لوشن 200 مل · عطر شعر 100 مل" },
      price: 149, compareAt: 177, family: "sweet", color: "#E6007E", color2: "#FFD1E6", badge: "bestseller",
      notes: { top: [N.berries], heart: [N.praline], base: [N.vanilla] },
      desc: {
        en: "Lotion, splash, hair mist — the full Obsessed layering ritual in a pink keepsake box.",
        ar: "لوشن وسبلاش وعطر شعر — طقوس Obsessed الكاملة في علبة وردية للذكرى.",
      },
    },
    {
      id: "discovery-trio", cat: "gift-sets", type: "set", art: "set", line: "Discovery Trio",
      size: { en: "3 × Body splash 50 ml", ar: "3 × بودي سبلاش 50 مل" },
      price: 89, family: "floral", color: "#F06FA8", color2: "#FFF0F6",
      notes: { top: [N.pear, N.citrus], heart: [N.peony, N.jasmine], base: [N.vanilla, N.musk] },
      desc: {
        en: "Obsessed, Liberté and Aqua in travel sizes. The easiest way to find your signature — or to gift three moods at once.",
        ar: "Obsessed وLiberté وAqua بأحجام السفر. أسهل طريقة لاكتشاف عطركِ المميز — أو لإهداء ثلاثة أمزجة دفعة واحدة.",
      },
    },
    {
      id: "eid-gift-box", cat: "gift-sets", type: "set", art: "set", line: "Eid Gift Box",
      size: { en: "Pink Oud EDP 100 ml · Vanilla splash 200 ml · Vanilla butter 200 g", ar: "بينك عود 100 مل · سبلاش فانيلا 200 مل · زبدة فانيلا 200 غ" },
      price: 279, compareAt: 337, family: "warm", color: "#5E0B33", color2: "#E8C98F", badge: "exclusive",
      notes: { top: [N.saffron], heart: [N.rose, N.vanilla], base: [N.oud, N.sandal] },
      desc: {
        en: "Our most generous gift: Pink Oud, Vanilla body splash and body butter, wrapped with a handwritten card.",
        ar: "هديتنا الأكثر سخاءً: بينك عود وبودي سبلاش الفانيلا وزبدة الجسم، مغلفة مع بطاقة مكتوبة بخط اليد.",
      },
    },
  ];

  products.forEach((p) => { p.typeName = T[p.type]; });

  const stores = [
    { country: "AE", city: ["Dubai", "دبي"], label: { en: "Flagship store", ar: "المتجر الرئيسي" } },
    { country: "AE", city: ["Abu Dhabi", "أبوظبي"], label: { en: "Store", ar: "متجر" } },
    { country: "AE", city: ["Sharjah", "الشارقة"], label: { en: "Kiosk", ar: "كشك" } },
    { country: "SA", city: ["Riyadh", "الرياض"], label: { en: "Flagship store", ar: "المتجر الرئيسي" } },
    { country: "SA", city: ["Jeddah", "جدة"], label: { en: "Store", ar: "متجر" } },
    { country: "SA", city: ["Al Khobar", "الخبر"], label: { en: "Store", ar: "متجر" } },
    { country: "QA", city: ["Doha", "الدوحة"], label: { en: "Store", ar: "متجر" } },
    { country: "KW", city: ["Kuwait City", "مدينة الكويت"], label: { en: "Store", ar: "متجر" } },
    { country: "BH", city: ["Manama", "المنامة"], label: { en: "Store", ar: "متجر" } },
    { country: "OM", city: ["Muscat", "مسقط"], label: { en: "Store", ar: "متجر" } },
  ];

  return { config, countries, payNames, categories, families, products, stores };
})();
