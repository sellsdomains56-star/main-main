# بالم سبرينغز - صوت واحد متصل (Arabic, his three Zoom recordings as one continuous voice)

93.1 s vertical video (1080x1920, **60 fps**; 91.1 s of voice + 2 s end). His request: all of Zoom 5, 6 and 7 as **one voice and one context, no information removed, no gaps**, and a video that **opens on a full map animation and alternates map and non-map**. Everything on screen in Arabic, right to left; no camera footage and no picture of him.

## The voice (`../ps-ar-audio`, `edl_one.json` -> `build/palm_springs_one.wav`)
His voice untouched (no stretch, no filters, no loudnorm; one plain gain, -4.2 dB). Every piece is trimmed right up to the speech (40 ms kept), pieces are joined with a 0.18 s breath, and every pause inside a sentence is at most 0.22 s: no quiet stretch over 0.3 s remains (the earlier edit had 26 of them, up to 1.4 s). Nothing he says is dropped: only repeated takes (the same sentence said again), the off-mic "ياخذ خلني أسجل بالله" and broken-off half-sentences are left out. "يعني سعر البيع ارتفع بحوالي 95%" is back in.

## On screen (map / non-map alternating)
| Time | On screen |
|------|-----------|
| 0 - 15.6 | **MAP**: fly-in over Dubai's coast to the reported area; Nakheel card "بالم سبرينغز · من نخيل"; Palm Jebel Ali, Sheikh Zayed Road, JAFZA, Jebel Ali Port |
| 15.6 - 23.7 | PAGE Dubai Media Office, 5 May 2025: 11 ألف شركة / 36% من الناتج المحلي |
| 23.7 - 39.7 | **MAP**: families around JAFZA and the port, routes to the area, "من الخيارات الرئيسية لهذه العوائل", "شريحة ممكن تكبر مع الوقت" |
| 39.7 - 46.0 | PAGE Dubai Media Office, 31 May 2023: Palm Jebel Ali 13.4 كم² · 35 ألف أسرة |
| 46.0 - 48.8 | **MAP**: Al Maktoum International, ~16 km from the area (straight line) |
| 48.8 - 51.0 | PAGE Dubai Media Office, 28 Apr 2024: الأكبر في العالم بتكلفة 128 مليار درهم |
| 51.0 - 58.3 | **MAP**: توسع الأعمال -> زيادة الوظائف -> طلب أعلى على البيوت العائلية (JAFZA, the airport, routes to the area) -> "مجمعات مثل بالم سبرينغز" |
| 58.3 - 80.2 | Example: مجمعات نخيل القريبة -> تلال الفرجان (فيلا 4 غرف): "بحوالي 3.2 مليون" -> "6 ملايين درهم", "السعر قرابة الضعف" |
| 80.2 - end | "عبدالله أهلي · محلل عقاري", "دراسة متكاملة عن المشروع", comment "بالم", reply "بتواصل وياك بشكل مباشر" |

## Facts to check before posting
- **"بحوالي 95%":** his own figures (about 3.2m -> 6m) give about +88%; 95% would need about 3.08m. The screen shows the two prices and "السعر قرابة الضعف" (nearly double), which is true either way. Confirm the real prices.
- **The Tilal Al Furjan example is his own** (no public source): Nakheel launched Tilal Al Furjan in January 2022, the voice says off-plan 2021 - please confirm the community, year and prices.
- Palm Springs is reported only by broker listings (approximate pin); 16 km is a straight line from that pin to the passenger terminal (OSM way 170139991).

## Build
As `../ps-ar-full`; `build/words_raw.json` = `../ps-ar-audio/build/one_words.json`; `bash encode.sh ps-ar-one`.
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
