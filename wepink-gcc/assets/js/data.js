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

    // Campaign photos of Virginia Fonseca, cropped from wepink's own campaign
    // banners — confirm GCC usage rights with the brand before launch. Clear a
    // path to fall back to the designed placeholder.
    photos: {
      virginiaHero: "assets/photos/virginia-hero.jpg", // tall portrait of Virginia Fonseca for the home page hero
      virginiaPortrait: "assets/photos/virginia-portrait.jpg", // second portrait for the "Created by Virginia" section
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
    { id: "perfume", name: { en: "Perfumes", ar: "العطور" }, blurb: { en: "VF and the full fragrance wardrobe", ar: "مجموعة VF وكل العطور" } },
    { id: "body-splash", name: { en: "Body Splash", ar: "بودي سبلاش" }, blurb: { en: "Brazil's favourite ritual", ar: "طقس البرازيل المفضل" } },
    { id: "men", name: { en: "For Him", ar: "للرجال" }, blurb: { en: "Woody, fresh, magnetic", ar: "خشبي ومنعش وجذّاب" } },
    { id: "body-care", name: { en: "Body Care", ar: "العناية بالجسم" }, blurb: { en: "Creams, oils, scrubs & more", ar: "كريمات وزيوت ومقشرات والمزيد" } },
    { id: "hair", name: { en: "Hair", ar: "الشعر" }, blurb: { en: "Hair mists & care", ar: "عطور الشعر والعناية به" } },
    { id: "makeup", name: { en: "Makeup", ar: "المكياج" }, blurb: { en: "Glosses, lip oils & more", ar: "ملمعات وزيوت شفاه والمزيد" } },
    { id: "skincare", name: { en: "Skincare", ar: "العناية بالبشرة" }, blurb: { en: "Serums & daily care", ar: "سيرومات وعناية يومية" } },
    { id: "gift-sets", name: { en: "Gift Sets", ar: "أطقم الهدايا" }, blurb: { en: "Wrapped in pink, ready to give", ar: "مغلّفة بالوردي وجاهزة للإهداء" } },
  ];

  const families = {
    sweet: { en: "Sweet & gourmand", ar: "حلو وشهي" },
    floral: { en: "Floral & fruity", ar: "زهري وفاكهي" },
    fresh: { en: "Fresh & citrus", ar: "منعش وحمضي" },
    warm: { en: "Warm & oriental", ar: "دافئ وشرقي" },
    woody: { en: "Woody & aromatic", ar: "خشبي وعطري" },
  };

  const T = {
    colonia: { en: "Eau de Cologne", ar: "كولونيا معطّرة" },
    splash: { en: "Body Splash", ar: "بودي سبلاش" },
    cream: { en: "Body Cream", ar: "كريم الجسم" },
    lotion: { en: "Body Lotion", ar: "لوشن الجسم" },
    hairmist: { en: "Hair Mist", ar: "عطر الشعر" },
    bodyoil: { en: "Body Oil", ar: "زيت الجسم" },
    scrub: { en: "Body Scrub", ar: "مقشّر الجسم" },
    butter: { en: "Body Butter", ar: "زبدة الجسم" },
    shower: { en: "Shower Foam", ar: "رغوة الاستحمام" },
    soap: { en: "Bar Soap", ar: "صابون" },
    rollon: { en: "Roll-on Deodorant", ar: "مزيل عرق رول أون" },
    set: { en: "Gift Set", ar: "طقم هدايا" },
    makeup: { en: "Makeup", ar: "مكياج" },
    skincare: { en: "Skincare", ar: "العناية بالبشرة" },
    haircare: { en: "Hair Care", ar: "العناية بالشعر" },
    bodycare: { en: "Body Care", ar: "العناية بالجسم" },
  };

  // The catalogue is generated from wepink Brazil by scripts/import_catalog.py
  // (assets/js/catalog.js). GCC prices there are placeholders by product type.
  const products = (window.WP_CATALOG || []).map((p) => Object.assign({}, p, { typeName: T[p.type] || T.bodycare, notes: p.notes || {} }));

  // Products the home page features (ids from catalog.js).
  const featured = {
    star: "colonia-vf-golden-75-ml",
    stage: ["splash-vf-200-ml", "colonia-vf-golden-75-ml", "colonia-ghadan-100-ml"],
    icons: ["colonia-vf-golden-75-ml", "colonia-ghadan-100-ml", "colonia-ruby-rhodolite-100-ml", "splash-king-blue-deep-200-ml"],
    ritual: ["cream-vf-golden-200-ml", "splash-vf-golden-200-ml", "colonia-vf-golden-75-ml"],
    ritualSet: "set-kit-linha-vf-golden",
    campaign: ["colonia-ruby-rhodolite-100-ml", "colonia-ghadan-100-ml", "colonia-celebrate-life-100-ml"],
    giftSet: "set-kit-linha-vf-golden",
    about: ["splash-vanilla-cuddle-200-ml", "colonia-vf-golden-75-ml", "colonia-ghadan-100-ml", "splash-king-blue-deep-200-ml"],
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

  return { config, countries, payNames, categories, families, products, featured, stores };
})();
