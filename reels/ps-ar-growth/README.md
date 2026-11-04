# بالم سبرينغز - محركات النمو (Arabic, clip B of the Zoom 5/6/7 recordings)

64.7 s vertical video (1080x1920, **60 fps**; 62.7 s of voice + 2 s end) from his raw Zoom recordings, edited in `../ps-ar-audio` (clip B). Everything on screen in Arabic, right to left; real pages with a marker on the exact words. Audio only, so his still portrait sits in the small bubble top-left, its ring pulsing while he speaks.

## The voice
`../ps-ar-audio/build/clip_b_growth.wav`: his voice untouched; cuts in real silences (one exact cut before "من ضمن المحركات"), pauses shortened to 0.3 s, one plain gain (-4.2 dB). No filters, no loudnorm (`AF=anull`). His "يعني سعر البيع ارتفع بحوالي 95%" is cut (3.2m -> 6m is +87.5%).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 5.8 | Nakheel card "بالم سبرينغز · من نخيل" -> "ضمن خياراتك الاستثمارية؟" |
| 5.8 - 12.3 | MAP: the reported area (approximate), Palm Jebel Ali, Sheikh Zayed Road |
| 12.3 - 18.2 | PAGE Dubai Media Office (Arabic), 31 May 2023: "على مساحة 13.4 كيلومترات مربعة أي ما يعادل ضعف حجم", "بما يوفر معيشة مميزة بإطلالة رائعة على شاطئ البحر لنحو 35 ألف أسرة" |
| 18.2 - 23.1 | PAGE Dubai Media Office (Arabic), 28 Apr 2024: "الأكبر في العالم بتكلفة 128 مليار درهم" |
| 23.1 - 31.3 | توسع الأعمال -> زيادة الوظائف -> طلب أعلى على البيوت العائلية -> مجمعات مثل بالم سبرينغز |
| 31.3 - 37.0 | "مثال على ارتفاع رأس المال", Nakheel card "مجمعات نخيل · القريبة من هذه المنطقة" |
| 37.0 - 50.6 | Nakheel card "تلال الفرجان · فيلا من 4 غرف · مثال"; bars "السعر على الخريطة 3.2 مليون درهم" and "السعر وهي جاهزة 6 ملايين درهم"; "ارتفاع بنحو 87.5%" |
| 50.6 - end | "عبدالله أهلي · محلل عقاري", "دراسة متكاملة عن المشروع", comment box types "بالم", reply "بتواصل وياك بشكل مباشر" |

## Facts to check before posting
- **The Tilal Al Furjan example is his own; no public source was found.** Nakheel launched Tilal Al Furjan in **January 2022** (Nakheel, 26 Jan 2022), so "sold off-plan in 2021" (said in the voice) does not fit; listings give its handover as late 2024 / 2025. Please confirm the community, year and both prices (e.g. from the title deeds) before posting. The screen shows no years, only his two prices and the correct change (+87.5%).
- "تتجاوز الـ120 مليار" for the Al Maktoum expansion: the official figure is AED 128 billion (shown on the page), so it is true.
- "Demand will rise for family homes" is his expectation; his own retake without "بشكل مؤكد" is used.
- Palm Springs is reported only by broker listings (approximate pin; see `../palm-springs`).

## Build
As `../ps-ar-location` (pages `dmo_pja_ar`, `dmo_dwc_ar`; URLs in pagedata.js); `bash encode.sh ps-ar-growth`.
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
