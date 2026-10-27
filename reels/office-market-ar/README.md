# سوق المكاتب في الإمارات (Arabic, one video from five voice notes)

About 4 min vertical video (1080x1920, 30 fps; 244.9 s of voice + 3 s end card) from five voice notes he sent on 27 Oct 2026 (03:40-03:42). The brief: "one video from all of this audio; make sure it makes sense and is well combined; if anything repeats, fix it; if there are two takes, remove one".

## The voice (assemble_voice.py, edl.json)
His voice is **untouched**: no time-stretch, no filters, no compressor. The only changes: one plain gain per note so every note sits at the same speech level (n1 -7.9 dB, n2 -0.6, n3 0, n4 +4.5, n5 +5.9), cuts placed in the middle of real silences, 12 ms fades at the joins, 0.42 s between pieces, pauses longer than 0.3 s inside a piece shortened to 0.3 s. The encode skips loudnorm (`AF=anull ABR=256k bash encode.sh office-market-ar`).

| Note | What it is | Used |
|------|-----------|------|
| n5 (2:03) | the office market today (like residential in 2021) + DIFC + Zabeel (short) + Rockefeller + conclusion + "report" | 0 - 53.1 s (thesis, DIFC) and 68.1 s - end (Rockefeller from "كريستيان", conclusion, the one call to action) |
| n3 (0:51) | the DIFC Zabeel expansion in detail | 0 - 36.2 s (its question and "DIFC" call to action dropped); replaces n5's short Zabeel line (53.1 - 61.7 s) |
| n1 (1:01) | Expo City / Aldar (another take of the Expo City script) | 0.9 - 53.8 s ("عبدالله،" and its "إكسبو" call to action dropped) |
| n2 (1:03) | ADGM, Al Maryah and Al Reem | 0 - 57.7 s (its "ADGM" call to action dropped) |
| n4 (1:34) | Rockefeller - a second take of the same part of n5 | only its first line "في برج مكاتب جديد قادم على شارع الشيخ زايد يحمل اسم روكفيلر" (n5's take is used for the rest) |

Order: the market today -> DIFC -> Zabeel -> Expo City -> Abu Dhabi (ADGM, Al Maryah, Al Reem) -> the Rockefeller tower -> conclusion -> "اكتب ريبورت".

## On screen
Everything in Arabic (right to left); every beat is a real page (marker wiping over the exact words) or the map; no face (audio only); captions only on the opening sentence.

| Time | On screen |
|------|-----------|
| 0 - 12.7 | MAP: DIFC, Downtown, Business Bay, E11 (+ captions) |
| 12.7 - 21.7 | MAP: Arabian Ranches - "قطاع الفلل" |
| 21.7 - 34.2 | PAGE Al Bayan (Savills Q1 2026): "ما يعكس دخول شركات جديدة إلى السوق وتوسع شركات قائمة" |
| 34.2 - 36.5 | MAP: DIFC |
| 36.5 - 49.7 | PAGE Dubai Media Office 28 Jul 2026: "إلى 10,018 شركة في نهاية النصف الأول من عام 2026", "ما يمثل نموًا بنسبة 30%", "سيتادل", "جي بي مورجان إنترناشيونال أدفايزرز" |
| 49.7 - 57.5 | PAGE Dubai Media Office 27 Jan 2026: "وتتجاوز القيمة التطويرية الإجمالية التقديرية للمشروع 100 مليار درهم" |
| 57.5 - 66.2 | MAP: DIFC + Za'abeel (OSM relation 18471721; the district's own boundary is not published), "17.7 مليون قدم مربع" |
| 66.2 - 76.0 | PAGE Dubai Media Office: "لاستيعاب أكثر من 42 ألف شركة وقوى عاملة تتجاوز 125 ألف موظف", "ومن المقرر إنجاز المرحلة الأولى في عام 2030" |
| 76.0 - 83.8 | MAP: DIFC, Za'abeel, Downtown, Business Bay + tiles مكاتب · شقق · مطاعم · خدمات |
| 83.8 - 134.8 | Expo City, as in `../expo-city-aldar-ar` (Sky News Arabia, Emarat Al Youm, WAM pages; Expo City / DEC / Al Maktoum airport maps) |
| 134.8 - 142.6 | MAP: Abu Dhabi, Al Maryah Island (ADGM) |
| 142.6 - 153.9 | PAGE Abu Dhabi Media Office 8 Sep 2026: "بلغ إجمالي القوى العاملة في جزيرتي الماريه والريم 49,027 متخصصاً", "نمواً بنسبة 34% ..." |
| 153.9 - 164.4 | PAGE Cushman & Wakefield Core, H1 2026 (English; the Arabic page does not load): "with Prime and Grade A occupancy at around 99%", "Office rents rose 15% QoQ and 32% YoY" |
| 164.4 - 187.7 | MAP: Al Maryah ("السوق الفاخر") and Al Reem ("خيارات سكنية أوسع"), "وين راح يسكنون؟", the housing-demand card |
| 187.7 - 192.4 | MAP: Sheikh Zayed Road (E11), the tower |
| 192.4 - 215.5 | PAGES Masdarak 22 Oct 2026 ("أحد أفراد الجيل السادس من عائلة روكفلر، في أول مشروع عقاري يحمل علامته التجارية", "مكاتب تجارية من الفئة الأولى (Grade A)", "خمسة طوابق مخصصة للمرافق والخدمات") and Al Bayan 22 Oct 2026 ("الظهور العالمي الأول لعلامة ... روكفلر في القطاع العقاري", "المستوحاة من مفهوم الضيافة الفندقية") |
| 215.5 - 229.6 | MAP: the tower + his figures ("بحسب العرض المتاح": from under AED 4.4m, AED 4,000 - 4,600 / sq ft, 50/50 before fees and VAT) |
| 229.6 - 241.1 | MAP: Dubai wide, the conclusion card, "وين تسعير روكفيلر مقارنة بالأبراج المنافسة؟" |
| 241.1 - end | comment animation "ريبورت", "بأرسل لك المقارنة", end card |

## Facts to check before posting
- "Like the start of the 2021 residential boom" is his view; Savills does not make that comparison (Savills Q2/Q3 2026 call the market "a more balanced phase", rents flat at about AED 238-241 / sq ft).
- DIFC: "JP Morgan International Advisors" is one firm (he says "جي بي مورغن وانترناشنال أدفايزرز"); the release says these firms set up regional offices since H1 2025.
- Zabeel: 42,000 companies / 125,000 workers are DIFC's total capacity after the expansion; the first phase is due to be "completed" in 2030 (he says "receives tenants").
- Abu Dhabi: 99% is Prime and Grade A occupancy and +32% is city-wide office rents, both from Cushman & Wakefield Core; other firms publish different figures (CBRE about +20%, 96.4%).
- Rockefeller: the prices and the 50/50 plan are not in any reputable report (broker listings only); the developer did not disclose them. Shown as he says them, under "بحسب العرض المتاح".
- Expo City: the sources say six buildings (he says five) and give no 2028 handover date.

## Build
```
python3 -I assemble_voice.py edl.json                         # build/voice48k.wav + build/cutmap.json (the notes are in the scratchpad, not committed)
ASR_LANG=ar python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py   # script.txt = the joined words, ASR spellings corrected
(cd data && python3 -I nominatim_office.py && python3 -I build_geo.py)
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 160 --noempty --find "<exact phrase>" ...   # one per page (URLs in pagedata.js)
# pagedata.js = the boxes from assets/*.json
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=256k CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh office-market-ar
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
