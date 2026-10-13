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
    hours: "10:00 – 22:00", // customer care, every day, Gulf time
    instagram: "https://www.instagram.com/wepink/",
    tiktok: "https://www.tiktok.com/@wepink",
    returnsDays: 14,

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

    // Campaign photos of Virginia Fonseca, cropped from wepink's own campaign
    // banners — confirm GCC usage rights with the brand before launch. Clear a
    // path to fall back to the designed placeholder.
    photos: {
      virginiaHero: "assets/photos/vf-splash-campaign.webp", // Virginia Fonseca with the giant VF body splash, home page hero arch
      virginiaPortrait: "assets/photos/liberte-dore-campaign.webp", // Liberté Doré crown portrait for the "Created by Virginia" section
      // Campaign images (assets/photos/campaign/): an AI model, not Virginia, with the real products.
      campaign: "assets/photos/campaign/chess.webp", // wide campaign image for the "Made to be noticed" band
      club: "assets/photos/campaign/satin-vf.webp", // the Club pop-up
      earn: "assets/photos/campaign/red-stripe.webp", // Earn with wepink hero
      about: "assets/photos/campaign/golden-hour.webp", // About page
      earnBand: "assets/photos/campaign/pink-bags.webp", // the ambassador band on the home page
      gift: "assets/photos/campaign/gift-box.webp", // the gifting promo on the home page
    },

    // Homepage film: "Enter the pink universe" (Seedance 2.5, 30 s, 16:9). It plays muted on a
    // loop at the very top of the home page; phones get the 720p file. Clear `src` to hide it.
    film: { src: "assets/video/wepink-hero-1080.mp4", srcMobile: "assets/video/wepink-hero-720.mp4", poster: "assets/photos/film-poster.jpg" },

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
    { id: "perfume", name: { en: "Perfumes", ar: "العطور" }, blurb: { en: "VF and the full fragrance wardrobe", ar: "مجموعة في إف وكل العطور" } },
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
  // Every catalogue product also has its Nano Banana Pro campaign shot in assets/products/hero/,
  // shown first everywhere; the studio photos follow on the product page.
  const products = (window.WP_CATALOG || []).map((p) => {
    const hero = "assets/products/hero/" + p.id + ".webp";
    const studio = p.images && p.images.length ? p.images : p.image ? [p.image] : [];
    return Object.assign({}, p, { typeName: T[p.type] || T.bodycare, notes: p.notes || {}, scene: true, image: hero, images: [hero], packshots: studio });
  });

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
    // The campaign: editorial images (Nano Banana Pro, 4K) built around real products.
    // `home` ones fill the home page lookbook; the others head their category in the
    // shop (`cat`). Every product in a picture (`product`, then `also`) shows it on
    // its page with an "As seen in the campaign" badge. `pos` frames it in cards.
    looks: [
      { photo: "assets/photos/campaign/satin-vf.webp", product: "colonia-vf-75-ml", cat: "perfume", home: true, pos: "50% 30%", title: { en: "Wrapped in pink", ar: "ملفوفة بالوردي" } },
      { photo: "assets/photos/campaign/red-studio.webp", product: "colonia-fatal-black-for-her-100-ml", cat: "perfume", home: true, pos: "60% 50%", title: { en: "Power, bottled", ar: "القوة في زجاجة" } },
      { photo: "assets/photos/campaign/sit-golden.webp", product: "splash-vf-golden-200-ml", cat: "body-splash", home: true, pos: "50% 40%", title: { en: "Golden, all day", ar: "ذهبية طوال اليوم" } },
      { photo: "assets/photos/campaign/crown.webp", product: "colonia-liberte-dore-100-ml", cat: "perfume", home: true, pos: "50% 30%", title: { en: "Crowned in gold", ar: "متوّجة بالذهب" } },
      { photo: "assets/photos/campaign/giant-heaven.webp", product: "colonia-heaven-pink-100-ml", cat: "perfume", pos: "50% 45%", title: { en: "Bigger than life", ar: "أكبر من الحياة" } },
      { photo: "assets/photos/campaign/peach.webp", product: "splash-perfect-pear-peach-200-ml", cat: "body-splash", title: { en: "Squeeze the day", ar: "اعتصري يومكِ" } },
      { photo: "assets/photos/campaign/fruit-creams.webp", product: "cream-vf-golden-200-ml", also: ["cream-ruby-rhodolite-200-ml", "cream-obsessed-200-ml"], cat: "body-care", title: { en: "Freshly stacked", ar: "طبقات من الانتعاش" } },
      { photo: "assets/photos/campaign/torn-lip.webp", product: "makeup-lip-oil-jujuba-3-5-g", cat: "makeup", title: { en: "Tear into colour", ar: "انطلقي نحو اللون" } },
      { photo: "assets/photos/campaign/beach.webp", product: "skincare-protetor-solar-fps-50-suncare-30ml-we-pink-30-ml", cat: "skincare", title: { en: "Sun-kissed, protected", ar: "مشرقة ومحميّة" } },
      { photo: "assets/photos/campaign/chess.webp", product: "colonia-king-blue-deep-100-ml", also: ["colonia-ruby-rhodolite-100-ml"], cat: "men", title: { en: "Make your move", ar: "حان دورك" } },
      { photo: "assets/photos/campaign/golden-hour.webp", product: "colonia-liberte-nuit-100-ml", cat: "perfume", title: { en: "After golden hour", ar: "بعد الساعة الذهبية" } },
      { photo: "assets/photos/campaign/red-stripe.webp", product: "colonia-red-obsidian-100-ml", cat: "perfume", title: { en: "Seen in red", ar: "حضورٌ بالأحمر" } },
    ],
    // Campaign photos for the "Shop by ritual" tiles (`pos` frames them in the tile).
    categoryPhotos: {
      perfume: { src: "assets/photos/campaign/giant-heaven.webp", pos: "50% 40%" },
      "body-splash": { src: "assets/photos/campaign/peach.webp", pos: "50% 50%" },
      men: { src: "assets/photos/campaign/chess.webp", pos: "68% 50%" },
      "body-care": { src: "assets/photos/campaign/fruit-creams.webp", pos: "50% 45%" },
      hair: { src: "assets/photos/campaign/hair-silk.webp", pos: "50% 50%" },
      makeup: { src: "assets/photos/campaign/torn-lip.webp", pos: "50% 45%" },
      skincare: { src: "assets/photos/campaign/beach.webp", pos: "50% 40%" },
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
      id: "orders", icon: "truck", title: { en: "Orders & delivery", ar: "الطلبات والتوصيل" },
      items: [
        { q: { en: "Which countries do you deliver to?", ar: "إلى أي الدول توصلون؟" },
          a: { en: "The UAE, Saudi Arabia, Qatar, Kuwait, Bahrain and Oman. Choose your country at the top of the page to see local prices, payment options and delivery times.", ar: "الإمارات والسعودية وقطر والكويت والبحرين وعُمان. اختاري دولتكِ أعلى الصفحة لرؤية الأسعار المحلية وطرق الدفع ومواعيد التوصيل." } },
        { q: { en: "How long does delivery take?", ar: "كم تستغرق مدة التوصيل؟" },
          a: { en: "To {country}: {delivery}. You'll see the date for your address at checkout.", ar: "إلى {country}: {delivery}. ستظهر لكِ مدة التوصيل لعنوانكِ عند إتمام الطلب." } },
        { q: { en: "How much is delivery?", ar: "كم تكلفة التوصيل؟" },
          a: { en: "Free on orders over {free}; below that it's {fee}.", ar: "مجاني للطلبات فوق {free}، وأقل من ذلك تكلفته {fee}." } },
        { q: { en: "How do I track my order?", ar: "كيف أتابع طلبي؟" },
          a: { en: "We message you on WhatsApp at every step: confirmed, packed, out for delivery. Signed in with Google or Apple? Your orders are under My account. Tracking can take up to 72 working hours to update after dispatch.", ar: "نراسلكِ على واتساب في كل خطوة: تأكيد الطلب، التجهيز، الخروج للتوصيل. إذا سجّلتِ الدخول عبر جوجل أو آبل ستجدين طلباتكِ في حسابي. قد يستغرق تحديث التتبع حتى 72 ساعة عمل بعد الشحن." } },
        { q: { en: "I entered the wrong address. Can I change it?", ar: "أدخلتُ عنوانًا خاطئًا، هل يمكنني تغييره؟" },
          a: { en: "Yes, until the order is out for delivery. WhatsApp us your order number and the right address and we'll update it.", ar: "نعم، طالما لم يخرج الطلب للتوصيل. أرسلي لنا رقم الطلب والعنوان الصحيح على واتساب وسنحدّثه." } },
        { q: { en: "Do you deliver outside the Gulf?", ar: "هل توصلون خارج الخليج؟" },
          a: { en: "Not yet. wepink Gulf delivers to the six GCC countries only.", ar: "ليس بعد. يوصل wepink الخليج إلى دول مجلس التعاون الست فقط." } },
      ],
    },
    {
      id: "payment", icon: "cash", title: { en: "Payment", ar: "الدفع" },
      items: [
        { q: { en: "Which payment methods can I use?", ar: "ما طرق الدفع المتاحة؟" },
          a: { en: "Visa and Mastercard, Apple Pay, mada (KSA), KNET (Kuwait), BenefitPay (Bahrain), tabby and Tamara instalments, and cash on delivery. Checkout shows the ones available in {country}.", ar: "فيزا وماستركارد وApple Pay ومدى (السعودية) وكي نت (الكويت) وبنفت باي (البحرين) والتقسيط مع تابي وتمارا، والدفع عند الاستلام. تظهر لكِ عند الدفع الطرق المتاحة في {country}." } },
        { q: { en: "Can I pay cash on delivery?", ar: "هل يمكنني الدفع عند الاستلام؟" },
          a: { en: "Yes, in every country we deliver to. Pay the courier in cash when your order arrives.", ar: "نعم، في كل الدول التي نوصل إليها. ادفعي نقدًا لمندوب التوصيل عند وصول طلبكِ." } },
        { q: { en: "How do tabby and Tamara work?", ar: "كيف يعمل تابي وتمارا؟" },
          a: { en: "Choose tabby or Tamara at checkout to split your order into interest-free payments. Approval takes seconds and there are no fees when you pay on time.", ar: "اختاري تابي أو تمارا عند الدفع لتقسيم طلبكِ على دفعات بدون فوائد. الموافقة خلال ثوانٍ ولا رسوم عند السداد في الموعد." } },
        { q: { en: "Is it safe to pay on this site?", ar: "هل الدفع على الموقع آمن؟" },
          a: { en: "Yes. Card payments go through an encrypted, PCI-compliant payment gateway with fraud checks; we never see or store your card number.", ar: "نعم. تتم مدفوعات البطاقات عبر بوابة دفع مشفّرة ومتوافقة مع معايير PCI مع أنظمة للحماية من الاحتيال، ولا نرى رقم بطاقتكِ ولا نحفظه." } },
        { q: { en: "Do prices include VAT?", ar: "هل تشمل الأسعار ضريبة القيمة المضافة؟" },
          a: { en: "Yes. Prices in {country} include VAT at {vat}% where it applies.", ar: "نعم. تشمل الأسعار في {country} ضريبة القيمة المضافة بنسبة {vat}٪ حيث تنطبق." } },
      ],
    },
    {
      id: "returns", icon: "returns", title: { en: "Returns & refunds", ar: "الإرجاع والاسترداد" },
      items: [
        { q: { en: "What is your returns policy?", ar: "ما هي سياسة الإرجاع؟" },
          a: { en: "Unopened products can be returned within {days} days of delivery. Opened fragrance can't be returned for hygiene reasons.", ar: "يمكن إرجاع المنتجات غير المفتوحة خلال {days} يومًا من التوصيل. لا يمكن إرجاع العطور المفتوحة لأسباب صحية." } },
        { q: { en: "How do I ask for an exchange or a return?", ar: "كيف أطلب استبدالًا أو إرجاعًا؟" },
          a: { en: "Fill in the request form at the bottom of this page, or WhatsApp us your order number. We'll arrange the pickup.", ar: "املئي نموذج الطلب أسفل هذه الصفحة، أو أرسلي لنا رقم الطلب على واتساب، وسنرتّب الاستلام." } },
        { q: { en: "How long does a refund take?", ar: "كم يستغرق استرداد المبلغ؟" },
          a: { en: "Up to 7 working days after the return reaches us, back to the way you paid. Cash-on-delivery orders are refunded by bank transfer or store credit.", ar: "حتى 7 أيام عمل بعد وصول المرتجع إلينا، إلى نفس وسيلة الدفع. وتُسترد طلبات الدفع عند الاستلام بتحويل بنكي أو رصيد في المتجر." } },
        { q: { en: "My order arrived damaged or wrong.", ar: "وصل طلبي تالفًا أو غير صحيح." },
          a: { en: "We're sorry! WhatsApp us a photo within 48 hours and we'll send a replacement at no cost. A new tracking code follows within 7 working days.", ar: "نعتذر! أرسلي لنا صورة على واتساب خلال 48 ساعة وسنرسل بديلًا مجانًا، ويصلكِ رمز التتبع الجديد خلال 7 أيام عمل." } },
      ],
    },
    {
      id: "products", icon: "leaf", title: { en: "Products & safety", ar: "المنتجات والسلامة" },
      items: [
        { q: { en: "Are your products authentic?", ar: "هل منتجاتكم أصلية؟" },
          a: { en: "Yes. wepink Gulf is the official franchise, and every product ships from our regional warehouse.", ar: "نعم. wepink الخليج هو الامتياز الرسمي، وكل منتج يُشحن من مستودعنا الإقليمي." } },
        { q: { en: "Are the products dermatologically tested?", ar: "هل المنتجات مختبرة جلديًا؟" },
          a: { en: "Yes. wepink products are dermatologically tested and go through strict quality control, so you can use them with confidence.", ar: "نعم. منتجات wepink مختبرة جلديًا وتخضع لرقابة جودة صارمة، لتستخدميها بثقة واطمئنان." } },
        { q: { en: "Are they tested on animals?", ar: "هل تُختبر على الحيوانات؟" },
          a: { en: "Never. wepink doesn't test on animals and doesn't allow its suppliers to.", ar: "أبدًا. لا تختبر wepink منتجاتها على الحيوانات ولا تسمح لمورّديها بذلك." } },
        { q: { en: "Can I use them while pregnant or breastfeeding?", ar: "هل يمكنني استخدامها أثناء الحمل أو الرضاعة؟" },
          a: { en: "Please check with your doctor before using any product during pregnancy or breastfeeding, or if you have allergies.", ar: "يُرجى استشارة طبيبكِ قبل استخدام أي منتج أثناء الحمل أو الرضاعة، أو إذا كانت لديكِ حساسية." } },
        { q: { en: "What if I have an allergic reaction?", ar: "ماذا أفعل عند حدوث رد فعل تحسسي؟" },
          a: { en: "Stop using the product straight away and see a doctor if it doesn't settle. Then WhatsApp us, and our care team will guide you through the next steps.", ar: "توقفي عن استخدام المنتج فورًا وراجعي الطبيب إذا استمرت الأعراض، ثم راسلينا على واتساب وسيرشدكِ فريق العناية إلى الخطوات التالية." } },
        { q: { en: "Do the scents last in the heat?", ar: "هل تدوم العطور في الحر؟" },
          a: { en: "Body splashes are light by design, so layer them over the matching body cream and refresh through the day. For a longer trail, finish with the eau de cologne.", ar: "البودي سبلاش خفيف بطبيعته، لذا ضعيه فوق كريم الجسم المطابق وجدّديه خلال اليوم. ولأثر أطول، اختمي بالكولونيا." } },
      ],
    },
    {
      id: "about", icon: "sparkle", title: { en: "About wepink", ar: "عن wepink" },
      items: [
        { q: { en: "Who is wepink?", ar: "من هي wepink؟" },
          a: { en: "wepink is the Brazilian fragrance and beauty house co-founded by Virginia Fonseca: body splashes, perfumes and body care that make every day feel special. wepink Gulf is its official franchise in the GCC.", ar: "wepink دار عطور وجمال برازيلية شاركت في تأسيسها فيرجينيا فونسيكا: بودي سبلاش وعطور ومنتجات عناية بالجسم تجعل كل يوم مميزًا. وwepink الخليج هو امتيازها الرسمي في دول الخليج." } },
        { q: { en: "Where can I buy safely?", ar: "أين أشتري بأمان؟" },
          a: { en: "On this website, through our official WhatsApp and, soon, in our Gulf stores. Products bought anywhere else aren't guaranteed to be authentic.", ar: "على هذا الموقع، وعبر واتساب الرسمي، وقريبًا في متاجرنا في الخليج. لا نضمن أصالة المنتجات المشتراة من أي مكان آخر." } },
        { q: { en: "Do you have stores?", ar: "هل لديكم متاجر؟" },
          a: { en: "Our first Gulf stores are on the way. Register on the Stores page and we'll invite you to the opening.", ar: "متاجرنا الأولى في الخليج في الطريق. سجّلي في صفحة المتاجر وسندعوكِ إلى الافتتاح." } },
      ],
    },
    {
      id: "account", icon: "user", title: { en: "Account, Club & ambassadors", ar: "الحساب والنادي والسفيرات" },
      items: [
        { q: { en: "Do I need an account to order?", ar: "هل أحتاج حسابًا لأطلب؟" },
          a: { en: "No. You can check out as a guest. Sign in with Google or Apple to see your orders and fill in your details faster.", ar: "لا. يمكنكِ الطلب كضيفة، أو سجّلي الدخول عبر جوجل أو آبل لرؤية طلباتكِ وتعبئة بياناتكِ أسرع." } },
        { q: { en: "I signed up with the wrong email. Can I change it?", ar: "سجّلتُ ببريد إلكتروني خاطئ، هل يمكنني تغييره؟" },
          a: { en: "Yes. WhatsApp us or email {email} from your new address and we'll update it.", ar: "نعم. راسلينا على واتساب أو على {email} من بريدكِ الجديد وسنحدّثه." } },
        { q: { en: "What is the wepink Club?", ar: "ما هو نادي wepink؟" },
          a: { en: "Our free list for first news of launches, offers and a birthday treat on WhatsApp. Join from the footer; you can leave any time.", ar: "قائمتنا المجانية لأول أخبار الإصدارات والعروض وهدية عيد الميلاد على واتساب. انضمي من أسفل الصفحة ويمكنكِ المغادرة متى شئتِ." } },
        { q: { en: "How do I become an ambassador?", ar: "كيف أصبح سفيرة؟" },
          a: { en: "Sign up on the Earn page to get your own code. Your friends get a discount on their first order and you earn commission on every order they place.", ar: "سجّلي في صفحة اربحي معنا لتحصلي على كودكِ الخاص. تحصل صديقاتكِ على خصم على طلبهن الأول وتربحين عمولة على كل طلب." } },
      ],
    },
  ];

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

  return { config, countries, payNames, categories, families, types: T, products, featured, stores, faq };
})();
