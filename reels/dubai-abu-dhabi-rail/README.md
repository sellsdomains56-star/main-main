# Dubai ↔ Abu Dhabi by train (map reel)

65 s vertical reel (1080x1920, 30 fps; 62.5 s voice + 3 s end card) from the **HeyGen avatar video** `e283a96216074870b0ba63f3155a6e2c` (version ve64e5635, 26 Oct 2026, English). Map from the first frame; his face only in the small round bubble; quiet whoosh-only sound; Reels safe zone. Comment CTA "RAIL".

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 6.8 | already connected by a passenger train, ~64 min, from AED 39 | the real track draws from Dubai station to Abu Dhabi station (a train dot runs along it); "train today ≈64 min, from AED 39" bar |
| 6.8 - 11.4 | a separate high-speed line, ~30 min | camera widens; dashed cyan line through the six announced stations (Al Jaddaf → Reem); second bar "≈30 min, planned" |
| 11.4 - 22.5 | work in one city, live in the other; businesses recruit from a wider area | two gold arcs Dubai ↔ Abu Dhabi; "businesses could recruit from a wider area" card |
| 22.5 - 36.9 | check the full commute: home → station, frequency, station → desk; 30 min on a train can mean an hour door to desk | camera flies down to Dubai station (Al Yalayis); three questions, then a door-to-desk bar (get there · wait · 30 min train · last mile) |
| 36.9 - 43.9 | communities need schools, shops, services | checklist |
| 43.9 - 53.1 | is the seller charging a railway premium? compare similar properties, rents, supply | checklist |
| 53.1 - 60.5 | the full study | corridor overview + study card |
| 60.5 - 65 | comment RAIL | comment animation, "Sending you the full study", end card |

## Map data
- **Passenger track**: OpenStreetMap route relation 21493966 "Etihad Rail: Dubai -> Abu Dhabi", its member ways chained into one line (146.9 km), from the Dubai station on Al Yalayis Street by Jumeirah Golf Estates to the Abu Dhabi station in Mohamed Bin Zayed City (`data/build_geo.py`, raw XML in `data/osm/`). Both ends are within 30 m of the station points.
- **High-speed line**: only the six announced stations are known (Al Jaddaf, Al Maktoum International, Zayed International Airport, Yas, Saadiyat, Reem); no route has been published, so it is drawn as a dashed schematic joining the stations and labelled "planned", not as a track.
- The two arcs between the cities are a concept graphic (where people could work and live), not a route.
- Journey times and fare are as he says them in the script (≈64 min, from AED 39; high-speed ≈30 min).

## Build
Same pipeline as the other map reels: `cut.json` → `prep_cut.py` → ASR → `make_timeline.py` → `snap_onsets.py` → `data/build_geo.py` → `export_cues.mjs` → `fetch_tiles.mjs` → `render.mjs` → `audio.py` → `encode.sh`.
