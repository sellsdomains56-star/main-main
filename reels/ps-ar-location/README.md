# بالم سبرينغز - الموقع والعائلات (Arabic, clip A of the Zoom 5/6/7 recordings)

57.6 s vertical video (1080x1920, **60 fps**; 55.6 s of voice + 2 s end) from his raw Zoom recordings, edited in `../ps-ar-audio` (clip A). Everything on screen in Arabic, right to left; real pages with a marker on the exact words, the map where the place matters. There is no camera footage (audio only), so his still portrait (a frame from his own HeyGen take) sits in the small bubble top-left, its ring pulsing while he speaks.

## The voice
`../ps-ar-audio/build/clip_a_location.wav`: his voice untouched; cuts in real silences, pauses shortened to 0.3 s, one plain gain (-4.2 dB, peaks at -1 dBFS). No filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 5.8 | Nakheel card "بالم سبرينغز · من نخيل" -> "ضمن خياراتك الاستثمارية؟" |
| 5.8 - 16.8 | MAP: the reported area ("حسب المعلومات الأولية · الموقع تقريبي"), Palm Jebel Ali, Sheikh Zayed Road (E11), JAFZA and Jebel Ali Port |
| 16.8 - 26.2 | PAGE Dubai Media Office (Arabic), 5 May 2025: "ارتفاع عدد شركات جافزا من 19 شركة في عام 1985 إلى 11 ألف شركة حالياً", "وميناء جبل علي يسهمان بنسبة 36% من الناتج المحلي الإجمالي لإمارة دبي" |
| 26.2 - 35.4 | "النشاط الاقتصادي · 36%" -> "عائلات تتمركز حول المنطقة", "قريب من مقار العمل" |
| 35.4 - 43.6 | MAP: routes from JAFZA and the port to the area; "بالم سبرينغز · من الخيارات الرئيسية لهذه العوائل"; "شريحة ممكن تكبر مع الوقت" |
| 43.6 - end | "عبدالله أهلي · محلل عقاري", "دراسة متكاملة عن المشروع · من زاوية استثمارية", comment box types "بالم", reply "بتواصل وياك بشكل مباشر" |

## Facts to check before posting
- **Palm Springs is reported only by broker listings** (Hessyan 1 / Jebel Ali, opposite Palm Jebel Ali, off Sheikh Zayed Road; see `../palm-springs`). He says "حسب المعلومات الأولية"; the pin is approximate.
- JAFZA's 11,000 companies and the 36% (JAFZA + Jebel Ali Port, share of Dubai's GDP) are from the Dubai Media Office (5 May 2025).
- "Palm Springs will be among the main options for these families" is his view, shown as such (no source claims it).
- Jebel Ali Port marker: Container Terminal 2 (OpenStreetMap node 2600959627).
- The comment keyword is "بالم" (see `../ps-ar-audio` for how it was checked).

## Build
```
python3 -I ../ps-ar-audio/assemble_voice.py ../ps-ar-audio/edl.json   # then build/voice48k.wav (padded to whole frames) + build/cutmap.json {fps 60}
ASR_LANG=ar python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py         # Arabic-aware make_timeline (from ../om-adgm-ar, fps from cutmap)
node shot_hl.mjs "<url>" assets/dmo_jafza_ar.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URL in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh ps-ar-location
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
