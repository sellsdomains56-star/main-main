# بالم سبرينغز - النسخة الكاملة (Arabic, one video with everything he said)

96.6 s vertical video (1080x1920, **60 fps**; 94.6 s of voice + 2 s end) from his raw Zoom 5/6/7 recordings: the full edit from `../ps-ar-audio` (`palm_springs_full`). His request after the two-clip version: one video with everything. It is `../ps-ar-location` (first 43.5 s) followed by `../ps-ar-growth` (from the drivers on), with one call to action. Everything on screen in Arabic, right to left; real pages with a marker on the exact words. No camera footage and no picture of him (his request).

## The voice
`../ps-ar-audio/build/palm_springs_full.wav`: his voice untouched; cuts in real silences, pauses shortened to 0.3 s, one plain gain (-4.2 dB). No filters, no loudnorm (`AF=anull`). What was removed (retakes, the off-mic aside, "95%") is listed in `../ps-ar-audio/README.md`.

## On screen
| Time | On screen |
|------|-----------|
| 0 - 5.8 | Nakheel card "بالم سبرينغز · من نخيل" -> "ضمن خياراتك الاستثمارية؟" |
| 5.8 - 16.8 | MAP: the reported area (approximate), Palm Jebel Ali, Sheikh Zayed Road, JAFZA, Jebel Ali Port |
| 16.8 - 26.2 | PAGE Dubai Media Office, 5 May 2025: 11 ألف شركة / 36% من الناتج المحلي الإجمالي |
| 26.2 - 35.4 | النشاط الاقتصادي -> عائلات تتمركز حول المنطقة · قريب من مقار العمل |
| 35.4 - 43.6 | MAP: routes from JAFZA and the port; "من الخيارات الرئيسية لهذه العوائل"; "شريحة ممكن تكبر مع الوقت" |
| 43.6 - 50.1 | PAGE Dubai Media Office, 31 May 2023: 13.4 كم² · ضعف نخلة جميرا / لنحو 35 ألف أسرة |
| 50.1 - 52.0 | MAP: Al Maktoum International Airport outline, a line from the reported area to the passenger terminal, "نحو 16 كم عن الموقع · خط مستقيم" |
| 52.0 - 55.0 | PAGE Dubai Media Office, 28 Apr 2024: الأكبر في العالم بتكلفة 128 مليار درهم |
| 55.0 - 63.2 | توسع الأعمال -> زيادة الوظائف -> طلب أعلى على البيوت العائلية -> مجمعات مثل بالم سبرينغز |
| 63.2 - 82.5 | مثال: مجمعات نخيل القريبة -> تلال الفرجان (فيلا 4 غرف): 3.2 مليون -> 6 ملايين درهم, "ارتفاع بنحو 87.5%" |
| 82.5 - end | "عبدالله أهلي · محلل عقاري", "دراسة متكاملة عن المشروع", comment "بالم", reply "بتواصل وياك بشكل مباشر" |

## Facts to check before posting
Same as `../ps-ar-location` and `../ps-ar-growth`: Palm Springs is broker-reported only (approximate pin); **the Tilal Al Furjan example is his own** (Nakheel launched Tilal Al Furjan in Jan 2022, he says off-plan 2021 - please confirm the community, year and prices); 3.2m -> 6m = +87.5%. The 16 km to the airport terminal is a straight line from the approximate Palm Springs pin (Hessyan 1) to the passenger terminal (OSM way 170139991), not a road distance.

## Build
As `../ps-ar-location`; `build/words_raw.json` = `../ps-ar-audio/build/full_words.json` (ASR of the same voice); `bash encode.sh ps-ar-full`.
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
