# Arabic version - the new launch near Silicon Oasis (reel 12)

67 s vertical reel (1080x1920, 30 fps; 63.5 s of his own recording + 3.5 s end card) from his Arabic recording (WeTransfer 17 Oct 2026, 4K, 25 fps, Gulf Arabic). Same engine / look as `../aldar-dso-reel`, but as asked:
- **He is not small**: the FACE beats are full screen (his 4K frame, warm grade, slow push-in, punch-ins on key words). There is **no bubble and no pop-up**; between the face beats each background is one thing he speaks about: type (the launch, "how do I secure a unit", "the strength of the broker"), a satellite flight (Silicon Oasis -> Academic City -> the Blue Line, real OSM outlines and route), two pages of our study (expected scenarios; the developer's three Dubai communities), then the call to action.
- **Arabic captions** (frosted-glass pills, Cairo bold, right-to-left) on every beat; all on-screen Arabic text is right-aligned / RTL (`lib.js` removes letter-spacing from Arabic strings; `make_timeline.py` aligns Arabic words).
- The developers are not named (he does not name them); the names on the study pages are covered by bars as in the English version.

| Time | What he says | Picture |
|------|--------------|---------|
| 0 - 4.6 | recently many complain about townhouse prices in Dubai | FACE |
| 4.6 - 9.7 | today I brought the solution: a very near launch, a joint venture of one of the biggest developers in the country | TYPE |
| 9.7 - 11.05 | where will the project be? | FACE |
| 11.05 - 19.6 | in Silicon Oasis, near Academic City, crossing the Blue Line | MAP (3D tilt) |
| 19.6 - 25.3 | not announced yet, lots of demand and inquiries, a clear sign of success | FACE |
| 25.3 - 30.4 | how do I secure a unit? many couldn't get the units they wanted | TYPE |
| 30.4 - 34.8 | the main element that decides if you get a unit | FACE |
| 34.8 - 37.1 | the strength of the broker and the company behind him | TYPE |
| 37.1 - 42.1 | today at BK Real Estate Brokerage we are one of the distinguished partners of this developer | FACE |
| 42.1 - 46.9 | what are the expected scenarios? | STUDY p.2 (executive summary), marker on the base case |
| 46.9 - 54.35 | I prepared a full study from data on the developer's own performance and its three communities | STUDY p.5 (the developer's Dubai record), markers on the three rows and the totals |
| 54.35 - 60.2 | if you want a copy of the study, built on real market data | FACE |
| 60.2 - 67 | write "project" in the comments and I'll send you a copy | CTA: study cover, "مشروع" typed, sent, answered "جاري إرسال الدراسة إليك" |

## Script as captioned (`script.txt`) - please have a native speaker check it
I cannot listen to the audio: the words come from Whisper large-v3 (Arabic) run twice (full and in windows) with the same result, and I corrected the obvious recognition errors. Choices to confirm:
- The recording starts with a fragment that Whisper heard as "عبدالله،" (0.0 - 0.4 s, before "في الآونة الأخيرة"); it is **not** in the captions.
- "المدينة الجامعية" is what both passes heard (Academic City is usually "المدينة الأكاديمية"); the HUD shows "ACADEMIC CITY" next to it.
- "وبمقربة من" (ASR: "وبمغربة عن"), "اللي باها" (Emirati "wanted it"), "بي كي للوساطة العقارية" (BK Real Estate Brokerage), "ارتفاع هذا المشروع" are my reading of the audio.
- "BK ... one of the distinguished partners of this developer" is his statement; it is only in the captions, no graphic repeats it. Check the RERA / DLD advertising rules before posting.

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
Imagery (c) Esri, Maxar, Earthstar Geographics; outlines and the Blue Line (c) OpenStreetMap contributors (ODbL); study pages are captures of `../aldar-dso-townhouses/study/` (not committed: `assets/`).
