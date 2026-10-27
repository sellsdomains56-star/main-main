# ليش الدار اختارت إكسبو سيتي؟ (Arabic reel, Expo City Dubai)

64 s vertical reel (1080x1920, 30 fps; 60.7 s of his recording + 3 s end card) from his Arabic recording (WeTransfer `t-18nx78ex6AaNmYMZ`, 27 Oct 2026, 2160x3840 25 fps, Gulf Arabic). The recording shows him at the podcast table for the first 6.24 s, then the picture is **black with his voice only** to the end. Feedback: "do the black part with all animation and his VO", "the content is in Arabic so the animation should be the same". So:

- 0 - 6.0 s: his footage exactly as recorded (no zoom, nothing on top); it cross-fades into the animation by 6.24 s, when the recording turns black.
- 6.24 s to the end: all animation on the dark background, **every word on screen in Arabic** (right to left, Cairo bold), **no face circle** (feedback: "don't put his image small, just directly animation to the pages and articles"), no captions (as in the last Arabic reel).
- **His voice exactly as recorded**: `cut.json` points at a stereo 48 kHz extract of the WeTransfer file and sets `chain: anull` (no denoise / compressor / EQ). The first version read a MONO extract as stereo, which played the voice at double speed - fixed; `build/voice48k.wav` now matches the original sample for sample.
- Real **Arabic** news pages as proof, flown like the map, with the marker wiping **right to left** over the exact words he is saying, and a source chip (outlet, date).
- Quiet whoosh-only sound, Reels safe zone; call to action "اكتب إكسبو في التعليقات" (typed, sent, answered "بأرسل لك التفاصيل"), end card "عبدالله أهلي".

**v3 (27 Oct 2026)** after the feedback "add the first question as text at the beginning as a caption, everything with articles or map, and speed our sound a bit without distortion":
- **Voice 1.1x**: `ffmpeg -af rubberband=tempo=1.1:transients=mixed:phase=laminar:formant=preserved:pitchq=quality:channels=together` (pitch and formants kept: median pitch 139.5 Hz before and after); the footage is sped up the same (`setpts=PTS/1.1`) so picture and voice stay in sync. 60.7 s -> 55.2 s, +3 s end card.
- **Captions only for the opening question** (Arabic, right to left, `CAP_UNTIL`), over his footage and the first page.
- **Every beat after the footage is a real page or the map** (the counter, the tiles and the plain cards of v2 are gone).

| Time (1.1x) | What he says | On screen |
|------|--------------|-----------|
| 0 - 5.4 | Abdullah, why is Aldar, an Abu Dhabi company, expanding in Dubai, in Expo City? | FOOTAGE as recorded + the question as captions |
| 5.4 - 10.5 | why did Aldar choose Expo City for a project of nearly AED 1.8 billion? | PAGE Sky News Arabia: headline, then the marker on "بتكلفة إجمالية تتجاوز 1.75 مليار درهم" (+ captions) |
| 10.5 - 13.8 | the answer is what is happening around it | MAP: Expo City outline, pull back with rings |
| 13.8 - 19.9 | Aldar partnered with Expo City Dubai; offices, shops, homes | PAGE Sky News Arabia: "إبرام شراكة لتطوير مشروع رئيسي متعدد الاستخدامات، يضم ... السكنية والمكتبية ومتاجر التجزئة" |
| 19.9 - 24.8 | look at the location: next to the future Dubai Exhibition Centre | MAP: DEC halls, "مشروع الدار بجانب المركز" |
| 24.8 - 27.5 | which has a 10 billion dirham expansion plan | PAGE Emarat Al Youm: "... مركز دبي للمعارض في مدينة إكسبو دبي بتكلفة 10 مليارات درهم" |
| 27.5 - 30.3 | and near Al Maktoum International Airport | MAP: the airport outline, a line from Expo City |
| 30.3 - 32.3 | preparing for a huge expansion | PAGE WAM: "... بتكلفة 128 مليار درهم" |
| 32.3 - 35.1 | the area is not only a place to live | MAP: Expo City + DEC + the airport, "ليست وجهة للسكن فقط" |
| 35.1 - 38.5 | it is being prepared as a hub for business, exhibitions, companies | PAGE Emarat Al Youm: "وتعزّز مكانة مدينة إكسبو كمركز اقتصادي ديناميكي، مدفوعاً بالمعارض والفعاليات العالمية" |
| 38.5 - 41.3 | expected handover 2028 | MAP: Expo City / DEC, a large "2028" card |
| 41.3 - 48.0 | could Expo City become one of Dubai's top office destinations? | MAP: slow flight over Expo City, the question card |
| 48.0 - 51.5 | for the project details and the area plan | PAGE Sky News Arabia (headline, signing photo) + the details card |
| 51.5 - 58.2 | write إكسبو in the comments | comment animation, end card "عبدالله أهلي" |

## Facts and two things to check
- Aldar x Expo City Dubai (Sky News Arabia, WAM, Gulf News, The National, Oct 2024): a 50/50 joint venture, mixed-use (residential, office, retail), total cost **more than AED 1.75 billion** (he says "nearly 1.8 billion"), next to the Dubai Exhibition Centre.
- **Buildings:** every source says **six** buildings ("يضم 6 مبانٍ"); his voice says **five** ("خمسة مباني"). The screen shows no building count.
- **Handover 2028:** no source found for a 2028 handover of this project (the 2028 Aldar date in the news is a separate Dubai Studio City project). The 2028 card shows what he says; check it before posting.
- DEC expansion AED 10 billion (approved 23 Sep 2024, three phases to 2031); Al Maktoum International Airport new passenger terminal AED 128 billion (approved 28 Apr 2024).
- Pages: [Sky News Arabia](https://www.skynewsarabia.com/business/1747377-%D8%A7%D9%84%D8%AF%D8%A7%D8%B1-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9-%D8%AA%D8%A8%D8%B1%D9%85-%D8%B4%D8%B1%D8%A7%D9%83%D8%A9-%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%95%D9%83%D8%B3%D8%A8%D9%88-%D8%AF%D8%A8%D9%8A), [Emarat Al Youm](https://www.emaratalyoum.com/local-section/other/2024-09-24-1.1884699), [WAM](https://www.wam.ae/ar/article/b2vu45r-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B1%D8%A7%D8%B4%D8%AF-%D9%8A%D8%B9%D8%AA%D9%85%D8%AF-%D8%AA%D8%B5%D8%A7%D9%85%D9%8A%D9%85-%D9%85%D8%A8%D9%86%D9%89-%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D9%81%D8%B1%D9%8A%D9%86-%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF).
- Map: Expo 2020 district (OSM way 499367597), DEC north / south halls (ways 750115631 / 750115632), Al Maktoum International Airport (way 214188740), terminal (way 170139991); `data/nominatim_expo.py`, `data/build_geo.py`. The exact plot of the Aldar project is not published, so it is described as "next to the centre", not pinned. (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.

## Build
Engine as `../dubai-population` plus Arabic: Cairo fonts (`index.html`), `T()` / `M()` with no letter-spacing and right-to-left direction for Arabic (`lib.js`), `NO_CAPTIONS` and `STATIC_FACE` (`main.js`), right-to-left marker on pages (`h.rtl`, `scenes_lib.js`), the Arabic-aware `make_timeline.py` from `../dubai-five-zones-ar`.
```
ffmpeg -i take.mp4 -vn -ac 2 -ar 48000 a48s.wav           # STEREO: prep_cut.py reads 2-channel audio
python3 -I prep_cut.py cut.json                          # cut.json -> the WeTransfer file (not committed), chain 'anull' = voice untouched
ASR_LANG=ar python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py   # script.txt = his words, ASR spellings corrected
(cd data && python3 -I nominatim_expo.py && python3 -I build_geo.py)
node shot_hl.mjs "<sky news arabia url>" assets/sky_aldar.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --hidetext "أخبار ذات صلة" --hidetext "سياسة ملفات الارتباط" --find "إبرام شراكة لتطوير مشروع رئيسي متعدد الاستخدامات" --find "يضم مجموعةً متنوعةً من المساحات السكنية والمكتبية ومتاجر التجزئة"
node shot_hl.mjs "<emarat al youm url>" assets/ey_dec.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --find "المخطط الرئيسي لتوسعة مركز دبي للمعارض في مدينة إكسبو دبي بتكلفة 10 مليارات درهم"
node shot_hl.mjs "<wam url>" assets/wam_dwc.png --w 430 --dpr 2.5 --wait 12000 --pad 160 --find "بتكلفة 128 مليار درهم"
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh expo-city-aldar-ar
```
