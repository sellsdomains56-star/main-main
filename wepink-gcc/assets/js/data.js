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

    // Campaign photos. Put the official files from the wepink brand team in
    // assets/photos/ and set the paths, e.g. virginiaHero: "assets/photos/virginia-hero.jpg".
    // Until a path is set, a designed placeholder is shown instead.
    photos: {
      virginiaHero: "", // tall portrait of Virginia Fonseca for the home page hero
      virginiaPortrait: "", // second portrait for the "Created by Virginia" section
      campaign: "", // wide campaign image for the "Made to be noticed" band
    },

    // Referral & ambassador programme (placeholder terms — set with the franchise).
    referral: {
      friendDiscountPct: 10, // friends get this % off their first order with a code
      tiers: [
        { id: "pink", name: { en: "Pink", ar: "بينك" }, minOrders: 0, pct: 10 },
        { id: "hot", name: { en: "Hot Pink", ar: "هوت بينك" }, minOrders: 20, pct: 15 },
        { id: "diamond", name: { en: "Diamond", ar: "دايموند" }, minOrders: 50, pct: 20 },
      ],
    },
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
    { id: "perfume", name: { en: "VF Perfumes", ar: "عطور VF" }, blurb: { en: "The Virginia Fonseca line", ar: "مجموعة فيرجينيا فونسيكا" }, art: "perfume" },
    { id: "body-splash", name: { en: "Body Splash", ar: "بودي سبلاش" }, blurb: { en: "Brazil's favourite ritual", ar: "طقس البرازيل المفضل" }, art: "splash" },
    { id: "men", name: { en: "For Him", ar: "للرجال" }, blurb: { en: "Woody, fresh, magnetic", ar: "خشبي ومنعش وجذّاب" }, art: "splash" },
    { id: "body-care", name: { en: "Body Care", ar: "العناية بالجسم" }, blurb: { en: "Perfumed body cream", ar: "كريم جسم معطّر" }, art: "lotion" },
    { id: "gift-sets", name: { en: "Gift Sets", ar: "أطقم الهدايا" }, blurb: { en: "Wrapped in pink, ready to give", ar: "مغلّفة بالوردي وجاهزة للإهداء" }, art: "set" },
  ];

  const families = {
    sweet: { en: "Sweet & gourmand", ar: "حلو وشهي" },
    floral: { en: "Floral & fruity", ar: "زهري وفاكهي" },
    fresh: { en: "Fresh & aquatic", ar: "منعش ومائي" },
    warm: { en: "Warm & oriental", ar: "دافئ وشرقي" },
    woody: { en: "Woody & aromatic", ar: "خشبي وعطري" },
  };

  // Notes are [en, ar] pairs.
  const N = {
    pear: ["Pear", "كمثرى"], orangeBlossom: ["Orange blossom", "زهر البرتقال"], amber: ["Amber", "عنبر"],
    patchouli: ["Patchouli", "باتشولي"], pinkPepper: ["Pink pepper", "فلفل وردي"], bergamot: ["Bergamot", "برغموت"],
    mandarin: ["Mandarin", "يوسفي"], sambac: ["Jasmine sambac", "ياسمين سامباك"], lavender: ["Lavender", "لافندر"],
    peony: ["Peony", "فاوانيا"], musk: ["Musk", "مسك"], praline: ["Praline", "برالين"], blackberry: ["Blackberry", "توت أسود"],
    tuberose: ["Tuberose", "مسك الروم"], vanilla: ["Vanilla", "فانيلا"], jasmine: ["Jasmine", "ياسمين"],
    muguet: ["Lily of the valley", "زنبق الوادي"], sandalwood: ["Sandalwood", "خشب الصندل"], apple: ["Apple", "تفاح"],
    freesia: ["Freesia", "فريزيا"], rose: ["Rose", "ورد"], woods: ["Woody notes", "نفحات خشبية"], suede: ["Suede", "جلد السويد"],
    grapefruit: ["Grapefruit peel", "قشر الجريب فروت"], turkishRose: ["Turkish rose", "ورد تركي"], whiteAmber: ["White amber", "عنبر أبيض"],
    benzoin: ["Benzoin", "بنزوين"], tangerine: ["Tangerine", "تانجرين"], cassis: ["Cassis", "كشمش أسود"], ylang: ["Ylang-ylang", "يلانغ يلانغ"],
    strawberry: ["Strawberry", "فراولة"], orange: ["Orange", "برتقال"], plum: ["Plum", "برقوق"], violet: ["Violet", "بنفسج"],
    damaskRose: ["Damask rose", "ورد دمشقي"], yellowFruits: ["Yellow fruits", "فواكه صفراء"], gardenia: ["Gardenia", "غاردينيا"],
    herbs: ["Herbs", "أعشاب"], sweetWoods: ["Sweet woods", "أخشاب حلوة"],
  };

  const T = {
    colonia: { en: "Eau de Cologne", ar: "كولونيا معطّرة" },
    splash: { en: "Body Splash", ar: "بودي سبلاش" },
    cream: { en: "Body Cream", ar: "كريم الجسم" },
    set: { en: "Gift Set", ar: "طقم هدايا" },
  };

  // The wepink range as sold in Brazil (names, sizes and scent notes from the
  // brand's listings). GCC prices are placeholders in AED: set the real ones
  // with the franchise before launch. Add `image: "assets/products/<id>.webp"`
  // to show the official packshot instead of the drawn bottle.
  const products = [
    {
      id: "vf-golden", cat: "perfume", type: "colonia", art: "perfume", line: "VF Golden",
      size: "75 ml", price: 199, family: "warm", color: "#C9962E", color2: "#F6DFA4", badge: "new",
      notes: { top: [N.pinkPepper, N.bergamot, N.mandarin], heart: [N.sambac, N.lavender, N.peony], base: [N.amber, N.musk, N.praline] },
      desc: {
        en: "Liquid gold. Pink pepper and mandarin melt into jasmine sambac and peony, then settle into warm amber, musk and praline. Floral oriental, made for evenings.",
        ar: "ذهب سائل. فلفل وردي ويوسفي يذوبان في ياسمين سامباك والفاوانيا، ثم يستقران على عنبر دافئ ومسك وبرالين. زهري شرقي للمساء.",
      },
    },
    {
      id: "vf", cat: "perfume", type: "colonia", art: "perfume", line: "VF",
      size: "75 ml", price: 189, family: "floral", color: "#D1006F", color2: "#FFC2DF", badge: "bestseller",
      notes: { top: [N.pear, N.orangeBlossom], heart: [N.jasmine], base: [N.amber, N.patchouli] },
      desc: {
        en: "The original signature from Virginia Fonseca. Juicy pear and orange blossom over a sensual base of amber and patchouli.",
        ar: "العطر الأصلي المميز من فيرجينيا فونسيكا. كمثرى ريّانة وزهر البرتقال فوق قاعدة حسية من العنبر والباتشولي.",
      },
    },
    {
      id: "vf-tropical", cat: "perfume", type: "colonia", art: "perfume", line: "VF Tropical",
      size: "75 ml", price: 189, family: "sweet", color: "#F0533F", color2: "#FFC9A8",
      notes: { top: [N.blackberry, N.mandarin], heart: [N.sambac, N.tuberose], base: [N.vanilla, N.musk] },
      desc: {
        en: "Sun on skin. Blackberry and mandarin, a heart of jasmine sambac and tuberose, and a soft vanilla-musk trail.",
        ar: "شمس على البشرة. توت أسود ويوسفي، وقلب من ياسمين سامباك ومسك الروم، وأثر ناعم من الفانيلا والمسك.",
      },
    },
    {
      id: "vf-aqua", cat: "perfume", type: "colonia", art: "perfume", line: "VF Aqua",
      size: "75 ml", price: 189, family: "fresh", color: "#2A9BC4", color2: "#C9EEF8",
      notes: { heart: [N.jasmine, N.muguet, N.peony], base: [N.patchouli, N.musk, N.amber, N.sandalwood] },
      desc: {
        en: "The signature, turned breezy. A fresh floral of jasmine, lily of the valley and peony on patchouli, musk and sandalwood.",
        ar: "العطر المميز بنسخة منعشة. زهري منعش من الياسمين وزنبق الوادي والفاوانيا على باتشولي ومسك وخشب الصندل.",
      },
    },
    {
      id: "vf-bloom", cat: "perfume", type: "colonia", art: "perfume", line: "VF Bloom",
      size: "75 ml", price: 199, family: "floral", color: "#EC5C9A", color2: "#FFD6E8",
      desc: {
        en: "A fruity floral bouquet from the VF line — bright, romantic and made to be noticed.",
        ar: "باقة زهرية فاكهية من مجموعة VF — مشرقة ورومانسية ومصممة لتلفت الأنظار.",
      },
    },
    {
      id: "vf-body-splash", cat: "body-splash", type: "splash", art: "splash", line: "VF",
      size: "200 ml", price: 79, family: "floral", color: "#D1006F", color2: "#FF9CCB",
      notes: { top: [N.yellowFruits], heart: [N.jasmine], base: [N.amber, N.patchouli] },
      desc: {
        en: "Virginia's signature in a body splash: yellow fruits and jasmine on amber and patchouli, for that wrapped-in-VF feeling all day.",
        ar: "توقيع فيرجينيا في بودي سبلاش: فواكه صفراء وياسمين على عنبر وباتشولي، لإحساس VF طوال اليوم.",
      },
    },
    {
      id: "celebrate-life", cat: "body-splash", type: "splash", art: "splash", line: "Celebrate Life",
      size: "200 ml", price: 79, family: "sweet", color: "#E86FA4", color2: "#FFD3E6", badge: "bestseller",
      notes: { top: [N.pinkPepper, N.apple, N.freesia], heart: [N.jasmine, N.rose, N.muguet], base: [N.praline, N.musk, N.suede] },
      desc: {
        en: "Sweet, soft and impossible to forget. Pink pepper and apple, a bouquet of jasmine and rose, then praline and suede on the skin.",
        ar: "حلو وناعم ولا يُنسى. فلفل وردي وتفاح، وباقة من الياسمين والورد، ثم برالين وجلد السويد على البشرة.",
      },
    },
    {
      id: "vanilla-cuddle", cat: "body-splash", type: "splash", art: "splash", line: "Vanilla Cuddle",
      size: "200 ml", price: 79, family: "sweet", color: "#D9A65B", color2: "#FBE6C2", badge: "bestseller",
      notes: { top: [N.tangerine, N.cassis], heart: [N.ylang, N.jasmine], base: [N.vanilla, N.musk] },
      desc: {
        en: "A warm hug in a bottle. Tangerine and cassis over ylang-ylang and jasmine, melting into creamy vanilla and musk.",
        ar: "عناق دافئ في زجاجة. تانجرين وكشمش أسود فوق يلانغ يلانغ وياسمين، يذوبان في فانيلا كريمية ومسك.",
      },
    },
    {
      id: "scarlette-radiance", cat: "body-splash", type: "splash", art: "splash", line: "Scarlette Radiance",
      size: "200 ml", price: 79, family: "floral", color: "#E0245E", color2: "#FFC4D3", badge: "new",
      notes: { top: [N.grapefruit, N.bergamot, N.pear], heart: [N.turkishRose, N.peony, N.vanilla], base: [N.whiteAmber, N.sandalwood, N.benzoin] },
      desc: {
        en: "Radiant and red-hot. Bergamot and pear open onto Turkish rose and peony, with white amber and sandalwood glowing underneath.",
        ar: "مشرق ومتوهج. برغموت وكمثرى ينفتحان على ورد تركي وفاوانيا، مع عنبر أبيض وخشب صندل يتوهجان في العمق.",
      },
    },
    {
      id: "scarlette", cat: "body-splash", type: "splash", art: "splash", line: "Scarlette",
      size: "200 ml", price: 79, family: "sweet", color: "#C8102E", color2: "#FFB3BE",
      notes: { top: [N.strawberry, N.orange, N.plum], heart: [N.violet, N.jasmine], base: [N.vanilla, N.musk, N.amber] },
      desc: {
        en: "Strawberry, orange and plum, a touch of violet, and a vanilla-amber finish. Playful, juicy, a little bit dangerous.",
        ar: "فراولة وبرتقال وبرقوق، ولمسة من البنفسج، وختام من الفانيلا والعنبر. مرح وريّان وفيه شيء من الخطر.",
      },
    },
    {
      id: "fatal-rouge", cat: "body-splash", type: "splash", art: "splash", line: "Fatal Rouge",
      size: "200 ml", price: 79, family: "floral", color: "#8E0B2C", color2: "#F7A8BC",
      notes: { top: [N.cassis, N.pinkPepper], heart: [N.damaskRose], base: [N.vanilla, N.sandalwood] },
      desc: {
        en: "The red lipstick of scents. Cassis and pink pepper on damask rose, with a sweet woody vanilla trail.",
        ar: "أحمر الشفاه بين العطور. كشمش أسود وفلفل وردي على ورد دمشقي، مع أثر خشبي حلو من الفانيلا.",
      },
    },
    {
      id: "king-blue", cat: "men", type: "splash", art: "splash", line: "King Blue",
      size: "200 ml", price: 79, family: "woody", color: "#1E4FA8", color2: "#A9C3F0",
      notes: { top: [N.bergamot, N.herbs], base: [N.patchouli, N.amber] },
      desc: {
        en: "Fresh and confident. Bergamot and herbs on a slightly sweet base of patchouli and amber.",
        ar: "منعش وواثق. برغموت وأعشاب على قاعدة حلوة قليلًا من الباتشولي والعنبر.",
      },
    },
    {
      id: "king-blue-deep", cat: "men", type: "splash", art: "splash", line: "King Blue Deep",
      size: "200 ml", price: 79, family: "woody", color: "#0F2C6B", color2: "#8FA8DA", badge: "bestseller",
      notes: { top: [N.bergamot], heart: [N.gardenia], base: [N.vanilla, N.sandalwood] },
      desc: {
        en: "Masculine elegance. Bergamot and gardenia, closing on an enveloping base of vanilla and sandalwood.",
        ar: "أناقة رجولية. برغموت وغاردينيا، تختم بقاعدة دافئة من الفانيلا وخشب الصندل.",
      },
    },
    {
      id: "lion-noir", cat: "men", type: "splash", art: "splash", line: "Lion Noir",
      size: "200 ml", price: 79, family: "woody", color: "#1B1A1F", color2: "#D4B26A",
      notes: { top: [N.pinkPepper], heart: [N.jasmine], base: [N.sweetWoods] },
      desc: {
        en: "Dark, citrus-woody and magnetic. Pink pepper and jasmine over sweet woods.",
        ar: "داكن وخشبي حمضي وجذّاب. فلفل وردي وياسمين فوق أخشاب حلوة.",
      },
    },
    {
      id: "body-cream-vf-27", cat: "body-care", type: "cream", art: "lotion", line: "VF 2.7",
      size: "200 ml", price: 69, family: "warm", color: "#E46AA0", color2: "#FFE3EF",
      desc: {
        en: "Perfumed body cream from the VF line. A floral oriental that moisturises and makes every splash and perfume last longer.",
        ar: "كريم جسم معطّر من مجموعة VF. زهري شرقي يرطّب ويجعل البودي سبلاش والعطر يدومان أطول.",
      },
    },
    {
      id: "vf-signature-set", cat: "gift-sets", type: "set", art: "set", line: "VF Signature Set",
      size: { en: "VF 75 ml · VF body splash 200 ml · Body Cream VF 2.7", ar: "VF 75 مل · بودي سبلاش VF 200 مل · كريم VF 2.7" },
      price: 299, compareAt: 337, family: "floral", color: "#D1006F", color2: "#F6DFA4", badge: "exclusive",
      notes: { top: [N.pear, N.yellowFruits], heart: [N.jasmine], base: [N.amber, N.patchouli] },
      desc: {
        en: "The full VF ritual — cream, splash, perfume — in a pink keepsake box with a handwritten card.",
        ar: "طقوس VF الكاملة — كريم وسبلاش وعطر — في علبة وردية للذكرى مع بطاقة مكتوبة بخط اليد.",
      },
    },
    {
      id: "splash-trio", cat: "gift-sets", type: "set", art: "set", line: "Splash Trio",
      size: { en: "Celebrate Life · Vanilla Cuddle · Scarlette Radiance, 200 ml each", ar: "Celebrate Life · Vanilla Cuddle · Scarlette Radiance، 200 مل لكل منها" },
      price: 199, compareAt: 237, family: "sweet", color: "#E86FA4", color2: "#FFF0F6", badge: "exclusive",
      notes: { top: [N.pinkPepper, N.tangerine, N.bergamot], heart: [N.jasmine, N.turkishRose], base: [N.vanilla, N.praline, N.whiteAmber] },
      desc: {
        en: "Three of Brazil's most-loved splashes in one pink box. Layer them, gift them, or keep all three.",
        ar: "ثلاثة من أكثر أنواع البودي سبلاش حبًا في البرازيل في علبة وردية واحدة. ادمجيها أو أهديها أو احتفظي بها كلها.",
      },
    },
  ];

  products.forEach((p) => {
    p.typeName = T[p.type];
    p.notes = p.notes || {};
  });

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
