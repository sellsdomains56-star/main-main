# Arabic version - the new launch near Silicon Oasis (reel 12, blue edit v2)

67 s vertical reel (1080x1920, 30 fps; 63.5 s of his own recording + 3.5 s end card) from his Arabic recording (WeTransfer 17 Oct 2026, 4K, 25 fps, Gulf Arabic). Engine as `../aldar-dso-reel`, restyled after the feedback "blue, no black, no empty backgrounds, add BK Group and pictures of townhouses, blur Aldar, use the frontal camera angle and put him in the middle, keep it simple":

- **Colour (v3, after the second round of feedback)**: natural imagery, only a light neutral haze; **black glass behind every piece of text** (captions, the HUD title plate, the pop-ups, the comment field); blue only as a small accent (map outline, underline, sub-titles). The dark scrims on his face and the heavy veils are gone. White Arabic text (Cairo bold, right-to-left). **No persistent BK logo; it appears only where he says it.**
- **Only the frontal camera angle is used for his face.** The recording alternates a side angle and a frontal angle (found by scanning the footage: frontal = 3.5-9.9, 13.6-17.6, 22.3-25.5, 27.0-30.6, 35.8-42.5, 44.9-48.4 s; the last 15 s are all side angle). He is shown full screen only inside the frontal shots (`FACE_SEGS`: 3.65-9.55, 22.45-25.1, 27.15-30.25, 35.95-42.15, 45.05-48.05) and **re-framed so he sits in the middle** (`REFRAME` in `scenes.js`: zoom 1.3, his face moved from 60% to 50% across). Everything else is a graphics beat, and the audio runs on underneath.
- **No empty backgrounds**: the text beats sit on real aerial imagery (Esri World Imagery, 3D tilt, slow flight) of Dubai townhouse communities (Arabian Ranches 3, DAMAC Hills 2, The Valley, Tilal Al Ghaf) with a blue wash; the map beat flies Silicon Oasis -> Academic City -> the Blue Line; then two pages of our study.
- **BK Group**: the official logo (white, from bkgroup.ae, "BK Real Estate Brokerage" is one of its divisions) only where he says it (a card on his face beat while he says "BK Real Estate Brokerage"; no logo anywhere else), and a larger "BK GROUP - REAL ESTATE BROKERAGE" card on the face while he says "BK Real Estate Brokerage ... partners of the developer".
- **The developer is shown only as a blurred pop-up** (the Aldar logo and name, blurred beyond reading) when he says "one of the biggest developers" and "the developer". The names on the study pages are blurred too (not covered by black bars; `study_boxes.py render --blur`); the study cover is shown in blue.

| Time | What he says | Picture |
|------|--------------|---------|
| 0 - 3.9 | many complain about townhouse prices in Dubai | AERIAL (townhouses) + type |
| 3.65 - 9.55 | today I brought the solution: a very near launch, a joint venture of one of the biggest developers | FACE (frontal), blurred developer pop-up |
| 9.45 - 17.9 | where? Silicon Oasis, near Academic City, crossing the Blue Line | MAP |
| 17.8 - 22.65 | not announced yet, lots of demand and inquiries | AERIAL + type |
| 22.45 - 25.1 | a clear sign the project will succeed | FACE |
| 25 - 27.3 | how do I secure a unit with the developer? | AERIAL + type |
| 27.15 - 30.25 | many couldn't get the units they wanted | FACE |
| 30.15 - 36.15 | the main element: the strength of the broker | AERIAL + type |
| 35.95 - 42.15 | BK Real Estate Brokerage is one of the distinguished partners of this developer | FACE, BK card + blurred developer pop-up |
| 42.05 - 45.2 | what are the expected scenarios? | STUDY p.2 |
| 45.05 - 48.05 | I prepared a full study from vital data | FACE, study cover pop-up |
| 47.95 - 54.5 | the developer's own performance and its three communities | STUDY p.5 |
| 54.4 - 67 | write "project" in the comments and I'll send you a copy | CTA on aerial: "مشروع" typed, sent, answered |

## Script as captioned (`script.txt`) - please have a native speaker check it
I cannot listen to the audio: the words come from Whisper large-v3 (Arabic) run twice (full and in windows) with the same result; obvious recognition errors are corrected. Choices to confirm:
- The recording starts with a fragment that Whisper heard as "عبدالله،" (0.0 - 0.4 s); it is **not** in the captions.
- "المدينة الجامعية" is what both passes heard (Academic City is usually "المدينة الأكاديمية"); the HUD shows "ACADEMIC CITY" next to it.
- "وبمقربة من", "اللي باها", "بي كي للوساطة العقارية", "ارتفاع هذا المشروع" are my reading of the audio.
- "... one of the distinguished partners of this developer" is his statement; check the RERA / DLD advertising rules before posting.

في الآونة الأخيرة كثير يشتكون من أسعار التاون هاوس في دبي. اليوم أنا جبت لكم الحل، في طرح جداً قريب عبارة عن تعاون أو جوينت فينتشر بين أحد أكبر المطورين على مستوى الدولة. وين رح يكون موقع المشروع؟ المشروع هذا رح يرتكز في السيليكون أويسس، وبمقربة من المدينة الجامعية، ويتقاطع مع الخط الأزرق للمترو. إن المشروع لم يعلن عنه لحد الآن، لكن في كثير طلب عليه واستفسارات، هذا مؤشر واضح إن المشروع رح يلاقي نجاح كبير. كيف أضمن الحجز مع المطور؟ الكثير عانى من تحديات، إنه ما قدر يحصل على الوحدات اللي باها. اليوم العنصر الأساسي اللي يحدد مدى حصولك على الوحدة في المشروع هذا أو لا: قوة الوسيط والشركة اللي خلف الوسيط. واليوم نحن في بي كي للوساطة العقارية نعتبر أحد الشركاء المميزين للمطور هذا. شو السيناريوهات المتوقعة في ارتفاع هذا المشروع؟ أنا أعددت دراسة متكاملة عن هذا المشروع من خلال بيانات حيوية مرتبطة بأداء المطور نفسه في سوق دبي العقاري ومجمعاته الثلاثة اللي موجودة في دبي. إذا أنت حاب تحصل على نسخة من هذه الدراسة المتكاملة المبنية على البيانات الحقيقية والواقعية من السوق، اكتب لي مشروع في التعليقات ورح أرسلك نسخة منها.

## Rebuild
```bash
# a48.wav must be STEREO 48 kHz (ffmpeg -ac 2 -ar 48000); cut.json points at the WeTransfer download in the scratchpad
python3 -I prep_cut.py cut.json                                         # voice + 1,906 footage frames (1620x2880)
ASR_LANG=ar python3 -I asr_words.py build/voice48k.wav build/words_raw.json "<Arabic place names>"
python3 -I make_timeline.py 3.5 && python3 -I snap_onsets.py            # script.txt (Arabic) is aligned to the ASR words
node export_cues.mjs && node fetch_tiles.mjs                            # build/tiles = ../dubai-ideal-time/build/tiles (shared Esri cache)
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh dubai-five-zones-ar
```
`assets/` (not committed): `study_p01/02/05/07.png` from `../aldar-dso-reel/study_boxes.py render --blur 1 2 5 7` (+ `study_p01_blue.png`, a blue gradient-map of the cover), `brand/bk_logo_raw.png` (bkgroup.ae/img/logo2.png, cropped), `brand/aldar_frame.png` (aldar.com, shown only blurred). Imagery (c) Esri, Maxar, Earthstar Geographics; outlines and the Blue Line (c) OpenStreetMap contributors (ODbL). Logos are the companies' trademarks, shown for identification.
