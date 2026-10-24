# Hudayriyat Island / Wadeem Gardens - map reel

62 s vertical reel (1080x1920, 30 fps; 58.8 s voice + 3 s end card) from the **HeyGen avatar video** `a40a4f33cf9b491fa14113788e7de15f` (version v1d0f4da1, 24 Oct 2026, 720x1280 25 fps, English). Engine = `../kezad-ghantoot` (map layer v2, `mapfx.js`): **no full-screen face**, the map runs from the first frame, his live face is the small round gold-ring bubble top-left; frosted panels; frosted-glass captions; quiet whoosh-only sound; everything inside the Reels safe zone.

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 11.9 | an island big enough to fit Palm Jumeirah nine times ... Hudayriyat Island, 51 km2, more than twice Yas | MAP: Hudayriyat traced and filled gold; nine Palm Jumeirah icons (x9, "icons not to scale"); size bars 51 vs ~25 km2; Yas outlined |
| 11.9 - 20.6 | AED 19bn of homes in six months, more than Saadiyat, Yas, Al Reem individually | MAP: the four islands light up with name tags; bar panel ADREC H1 2026: Hudayriyat 19.0, Saadiyat 13.3, Al Reem + Al Maryah 10.5, Yas 7.3 (AED bn) |
| 20.6 - 40.3 | Modon's Wadeem Gardens, three gated villa communities, next to The Spine (2.3 km, climate-controlled): shops ... schools | MAP north shore: Al Bateen outlined, Wadeem glow "opposite Al Bateen"; The Spine as a 2.3 km scale bar; six amenity chips |
| 40.3 - 46.3 | ~20 min to ADGM, ~25 min to Yas, according to the developer | MAP: arcs to ADGM and Yas with the developer's drive times |
| 46.3 - 53.8 | scale, upcoming infrastructure, demand -> worth watching | MAP + checklist (51 km2 / upcoming infrastructure / AED 19bn in H1 2026) |
| 53.8 - 61.8 | comment OFFPLAN for the fact sheet and master plan | dark: bubble grows, "OFFPLAN" typed and sent, "Sending the fact sheet & master plan" |

## Facts and sources (check before posting; ADREC / Abu Dhabi advertising rules apply)
- Hudayriyat masterplan "more than 51 million square metres, 53.8% of Abu Dhabi Island" - Modon / WAM, 13 Jun 2023. OSM island polygon: 48.9 km2.
- H1 2026 residential sales: Hudayriyat AED 19bn (27% of the emirate), Saadiyat 13.3bn, Al Reem + Al Maryah 10.5bn (reported together), Yas 7.3bn - ADREC H1 2026 report (WAM / Gulf News / The National, 21 Aug 2026).
- Yas Island ~25 km2 (OSM island polygon 22.4 km2, administrative area 28.6 km2). Palm Jumeirah ~5.7 km2 of land -> 51 / 5.7 = ~9.
- Wadeem: Modon's first residential plots community on Hudayriyat, "located opposite Abu Dhabi's Al Bateen area" (WAM, 1 Jul 2025). No public plot map, so the reel shows a soft glow on that shore, not an outline. Wadeem Gardens = the villa community inside it (3 gated clusters, 4-6 bed villas).
- The Spine: 2.3 km (Modon); "climate-controlled" appears in broker/marketing copy, not in Modon's ADX filing. Its route is not published, so it is shown as a 2.3 km scale bar at the map's scale.
- Drive times ~20 min to ADGM and ~25 min to Yas are the developer's figures (he says so).
- Spelling: the voice says "Wadi'in"/"Modan"; the captions use Wadeem Gardens, Modon, Hudayriyat.

## Rebuild
```bash
python3 -I prep_cut.py cut.json                         # cut.json -> scratchpad in16/take.mp4 + a48.wav (stereo 48 kHz)
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Hudayriyat Island, Palm Jumeirah, ..."
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py   # then climate-controlled t = 30.5 (ASR placed it on "2.3")
cd data && python3 -I nominatim_islands.py && python3 -I build_geo.py && cd ..
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh hudayriyat-wadeem
```
