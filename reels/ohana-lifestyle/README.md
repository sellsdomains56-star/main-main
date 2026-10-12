# Ohana townhouses - why townhouses (reel 06)

93 s vertical reel (1080x1920, 30 fps), Abu Dhabi look + real material, **voice only** (the user's recording, no on-camera beat), whoosh-only sound at a very low level, everything inside the Instagram Reels safe zone.
Voice: the supplied recording `d447e240-1y32uw_mp4.mp4` (90.4 s, audio only), cleaned (`prep_hook_voice.py`); the only edit is the stuttered double "the the" before "comments" (15 ms crossfade). Word times: faster-whisper large-v3 + `snap_onsets.py` (moves word starts Whisper placed too early after a pause) aligned to `script.txt`.

| Time | What happens |
|------|--------------|
| 0 - 5.1 | satellite flight over Yas Island, outline + pin OHANA (Yas Canal), Ferrari World for orientation; captions only for the opening line |
| 5.1 - 9.0 | brochure picture + count-up **1,852** per sq ft (two-bedroom townhouse) |
| 9.0 - 17.8 | bars: Ohana vs The Orchids (approx. 2,470), dashed gap **25% cheaper** |
| 17.8 - 21.8 | even cheaper than the average luxury apartment on Yas (2,393) |
| 21.8 - 26.7 | but why townhouses? recent townhouse launches on Yas have been limited |
| 26.7 - 30.3 | strong demand (Khaleej Times: Dh6 billion in 72 hours, marker) + selling out within days (WAM: The Orchids townhouses sold out, AED 680 million, marker) |
| 30.3 - 37.0 | lower entry price than villas -> wider pool of buyers -> (potentially) easier resale |
| 37.0 - 42.1 | previous launches = villas (struck) / Ohana phase 2 is different (Zawya press release, marker on the unit types) |
| 42.1 - 47.3 | **80%** gauge: townhouses; many below 5 million |
| 47.3 - 51.1 | Disney on Yas Island (Disney's own announcement, marker on "Yas Island") |
| 51.1 - 57.2 | investment study, three scenarios, 2-bedroom townhouse, handover 2029 |
| 57.2 - 71.0 | scenario bars 4.33 / 4.73 / 5.31 million (labelled "modelled scenarios - not a guarantee") |
| 71.0 - 77.1 | Emirati Broker Program (Construction Business News ME, markers on first access / bookings at launches) |
| 77.1 - 81.3 | payment plan: 5% every six months, the rest at handover 2029 |
| 81.3 - 85.5 | UAE nationals 30% / everyone else 35% before handover |
| 85.5 - 92.8 | call to action: "study" typed into a comment field, answered "Full report" |

## Facts and caveats
- **First line of the recording**: "72 billion in just 48 hours." The sources (Khaleej Times, Gulf News, Business Wire, 17 Mar 2026) report **Dh6 billion in 72 hours** for Ohana's first phase. The recording is used as recorded; the figure is shown in captions only (no graphic) - confirm or re-record.
- Verified from sources: Phase 1 Dh6 billion / 72 hours; The Orchids townhouses sold out (WAM, 26 Jun 2026, AED 680 million); Disney + Miral announcement for Yas Island (7 May 2025); Phase 2 press release (townhouses, duplex villas, villas; sales 19 Oct 2026; avg 2-bed townhouse AED 3.75 million; handover by 2029); Emirati Broker Program (Ohana announcement).
- From the user's own investment study (not public): 1,852 / 2,470 / 2,393 per sq ft, 80% townhouses, scenarios 4.33 / 4.73 / 5.31 million, 5% every six months, 30% / 35%. Currency was not spoken for these; dirhams shown on screen. "Below 5 million" has no currency in the recording.
- The map pin is indicative (from the brochure's location map); Disney's site on Yas Island is not pinned (no exact location announced).

## Real material (not committed - third-party)
Khaleej Times (Dh6 billion in 72 hours), WAM (Aldar records AED680 million at The Orchids, 26 Jun 2026), The Walt Disney Company (7 May 2025), Zawya (Ohana Phase 2 press release, 12 Oct 2026), Construction Business News ME (Emirati Broker Program), Ohana brochure renderings. Imagery (c) Esri, Maxar, Earthstar Geographics; island outline (c) OpenStreetMap contributors (ODbL).

## Rebuild
```bash
python3 -I prep_hook_voice.py --voice build/voice_full.wav        # voice only
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Ohana, Yas Island, Disney, Emirati, Orchids, scenario"
python3 -I make_timeline.py 2.5 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --fmt jpg --workers 4 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=19 bash encode.sh ohana-why-townhouses
```
