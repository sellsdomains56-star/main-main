# Palm Springs (Arabic) - the edited voice from Zoom 5, 6 and 7

Three raw Zoom recordings (4 Nov 2026), Gulf Arabic, one Palm Springs pitch: Zoom 5 (33 s) = the opening, Zoom 6 (2:13) = the body with several retakes, Zoom 7 (14 s) = the call to action. Edited into one full voiceover and two Instagram clips (two topics).

## How it is edited (assemble_voice.py, edl.json)
His voice is **untouched**: no stretch, no filters, no compressor or limiter. Only: cuts in real silences (one cut exactly at a word gap, checked by re-transcribing), 12 ms fades at the joins, 0.38 s between pieces, pauses longer than 0.3 s shortened to 0.3 s, and one plain gain. The Zoom tracks were recorded hot (peaks above full scale throughout), so the gain is set by the -1 dBFS peak ceiling: -4.2 dB, about -19.4 LUFS.

| Output | Length | Pieces |
|------|------|------|
| `build/palm_springs_full` | 1:35 | Z5 opening -> Z6 families (take 2) -> Z6 "main option for these families / this segment may grow" -> Z6 drivers + jobs -> Z6 Tilal Al Furjan example -> Z7 call to action |
| `build/clip_a_location` | 56 s | Z5 opening (location, JAFZA + Jebel Ali Port, 36% of GDP) -> families -> main option / may grow -> Z7 |
| `build/clip_b_growth` | 63 s | Z5 hook + location (to "شارع شيخ زايد") -> drivers (from "من ضمن المحركات") -> jobs and demand -> Tilal Al Furjan example -> Z7 |

## What was removed
- Z5 18.95-23.5 s: his first attempt at "جافزة فيها أكثر من 11 ألف شركة ومع..." (said twice; the second, complete take is kept).
- Z6 0-21.3 s: the first take of "هذا النشاط الاقتصادي ليش يهم المستثمر..." (broken off).
- Z6 30.8-34.8 s: "وموقع بالم سبرينغز يخليه واحد من الخيارات" (he restarts it as "...راح يكون من ضمن الخيارات الرئيسية لهذه العوائل").
- Z6 43.3-61.2 s: "وكذلك عندك تطوير نخلة جبل علي..." + a misplaced "وهذه الشريحة ممكن تكبر مع الوقت" (he re-records it as "كذلك من ضمن المحركات...").
- Z6 76.4-82.4 s: "راح يزيد الطلب بشكل مؤكد على البيوت العائلية" (his own retake right after drops "بشكل مؤكد" - kept, and it avoids a guarantee claim).
- Z6 100.7-117.0 s: two broken-off "ونفس الوحدة انباعت..." attempts and the off-mic "ياخذ خلني أسجل بالله".
- Z6 122.3 s - end: "يعني سعر البيع ارتفع بحوالي 95%" - a maths slip: 3.2m -> 6m is +87.5%. The video shows the correct figure instead.
- Clip B only: "كذلك" before "من ضمن المحركات" (it would follow nothing).

## Facts to check before posting
- **The Tilal Al Furjan example is his own (no public source found):** Nakheel launched Tilal Al Furjan in **January 2022** (Nakheel, 26 Jan 2022), so "sold off-plan in 2021" does not fit, and as of late Oct 2026 Nakheel's handover page did not yet show it handed over, which "sold ready in 2026" needs. Please confirm the community, year and the two prices (e.g. from the DLD title records) before posting. Murooj Al Furjan (launched May 2021, handed over) would fit the dates.
- "36% of Dubai's GDP" for JAFZA + Jebel Ali Port: see the video README for the source used.
- "Al Maktoum airport expansion above AED 120 billion": the official figure is AED 128 billion (Dubai Media Office, 28 Apr 2024), so "above 120" is true.
- Palm Springs is reported only by broker listings (see `../palm-springs`); his "حسب المعلومات الأولية" fits.
- The comment keyword: he says "اكتب ... في التعليقات" with a short word that matches his own "بالم" (Palm) best (MFCC/DTW comparison against every word he says; transcription models disagreed). The videos use "بالم".

## Build
```
python3 -I assemble_voice.py edl.json         # -> build/<name>.wav + build/<name>.json
ASR_LANG=ar python3 -I asr_words.py build/palm_springs_full.wav build/full_words.json   # check: no repeats, clean joins
```
