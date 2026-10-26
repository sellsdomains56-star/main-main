# Dubai ↔ Abu Dhabi by train (map reel)

65 s vertical reel (1080x1920, 30 fps; 62.5 s voice + 3 s end card) from the **HeyGen avatar video** `e283a96216074870b0ba63f3155a6e2c` (version ve64e5635, 26 Oct 2026, English). Map from the first frame plus two REAL PAGES (Khaleej Times, Gulf News) with marker highlights; his face only in the small round bubble; quiet whoosh-only sound; Reels safe zone. Comment CTA "RAIL".

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 3.2 | already connected by a passenger train | the real track draws from Dubai station to Abu Dhabi station |
| 3.2 - 6.6 | ~64 min, from AED 39 | REAL PAGE: Khaleej Times, 28 Sep 2026 - headline, then markers on "each taking 1 hour and 4 minutes" and "Comfort fares from Dubai to Abu Dhabi start at Dh39" |
| 6.6 - 11.3 | a separate high-speed line, ~30 min | REAL PAGE: Gulf News, 23 Jan 2025 - headline "New 30-minute high-speed passenger train project...", then the marker on "connecting Abu Dhabi and Dubai in a matter of 30 minutes" |
| 11.3 - 22.5 | work in one city, live in the other; businesses recruit from a wider area | wide map: the track (train dot running), dashed cyan high-speed schematic through the six announced stations, legend; two gold arcs Dubai ↔ Abu Dhabi; "businesses could recruit from a wider area" card |
| 22.5 - 36.9 | check the full commute: home → station, frequency, station → desk; 30 min on a train can mean an hour door to desk | camera flies down to Dubai station (Al Yalayis); three questions, then a door-to-desk bar (get there · wait · 30 min train · last mile) |
| 36.9 - 43.9 | communities need schools, shops, services | checklist |
| 43.9 - 53.1 | is the seller charging a railway premium? compare similar properties, rents, supply | checklist |
| 53.1 - 60.5 | the full study | corridor overview + study card |
| 60.5 - 65 | comment RAIL | comment animation, "Sending you the full study", end card |

## Map data
- **Passenger track**: OpenStreetMap route relation 21493966 "Etihad Rail: Dubai -> Abu Dhabi", its member ways chained into one line (146.9 km), from the Dubai station on Al Yalayis Street by Jumeirah Golf Estates to the Abu Dhabi station in Mohamed Bin Zayed City (`data/build_geo.py`, raw XML in `data/osm/`). Both ends are within 30 m of the station points.
- **High-speed line**: only the six announced stations are known (Al Jaddaf, Al Maktoum International, Zayed International Airport, Yas, Saadiyat, Reem); no route has been published, so it is drawn as a dashed schematic joining the stations and labelled "planned", not as a track.
- The two arcs between the cities are a concept graphic (where people could work and live), not a route.
- Journey time and fare: [Khaleej Times, 28 Sep 2026](https://www.khaleejtimes.com/uae/etihad-rail-dubai-bookings-now-open-ticket-fares-train-timings-parking) (five direct services, each 1 h 4 min; Comfort from Dh39). High-speed: [Gulf News, 23 Jan 2025](https://gulfnews.com/business/markets/etihad-rail-new-30-minute-high-speed-passenger-train-project-to-link-abu-dhabi-and-dubai-1.500021522) (30 minutes, up to 350 km/h).

## Real pages on screen
Captured through the session proxy with `shot_hl.mjs` (narrow mobile viewport, 2.5x; ad networks blocked; fixed bars, cookie banners, ad slots and 'recommended' blocks hidden; it also writes the exact boxes of the quoted phrases into a `.json` next to the `.png`). Captures live in `assets/` (not committed); rerun the commands to rebuild them. Each page is a full-screen beat flown like the map (headline first, then down to the quoted line with a 3D tilt), with a marker wiping across the exact words as he says them and a source chip (outlet and date) above the captions.
```
node shot_hl.mjs "<khaleej times url>" assets/kt_rail.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --hidetext "RECOMMENDED FOR YOU" --hidetext "BREAKING" --hidetext "Add As A Preferred" --hidetext "ADVERTIS" --find "Comfort fares from Dubai to Abu Dhabi start at Dh39" --find "each taking 1 hour and 4 minutes"
python3 -I cut_blank.py assets/kt_rail.png        # removes the blank band an empty ad slot leaves, and moves the boxes up
node shot_hl.mjs "<gulf news url>" assets/gn_hsr.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --hidetext "SPONSORED LINKS" --hidetext "Get updated faster" --hidetext "What You Need To Know" --hidetext "Ask Gulf" --find "connecting Abu Dhabi and Dubai in a matter of 30 minutes"
```

## Build
Same pipeline as the other map reels: `cut.json` → `prep_cut.py` → ASR → `make_timeline.py` → `snap_onsets.py` → `data/build_geo.py` → `export_cues.mjs` → `fetch_tiles.mjs` → `render.mjs` → `audio.py` → `encode.sh`.
