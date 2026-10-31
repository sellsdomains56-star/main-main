# Emaar's name vs who owns the community (HeyGen 7cb7e81c, new version)

56.1 s vertical video (1080x1920, **60 fps**; 54.1 s of voice + 2 s end) from HeyGen 7cb7e81c, **version v6d85cb63** (31 Oct 2026). The same link earlier held the JAFZA take (version v6a4dcfee, now `../jafza-owners`). The royal-family roadmap style: Emaar on top, a trunk to each partner community with a split bar (Emaar gold | partner ivory) and both logos, real pages with a marker on the exact words, his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 5.1 | EMAAR "the name on the project" -> OWNS ALL OF IT? -> "THE ENTIRE COMMUNITY · not always" |
| 5.1 - 10.9 | The tree: EMAAR "major developments · partners" -> RASHID YACHTS & MARINA ("launched as Mina Rashid"), bar 70% / 30%, DP World plate, "P&O MARINAS · DP WORLD" |
| 10.9 - 13.8 | PAGE The National, 18 Aug 2019: "Mina Rashid has always been a 70:30 joint venture between Emaar and DP World-owned P&O Marinas." |
| 13.8 - 18.7 | DUBAI HILLS ESTATE ("joint venture since 2013"), bar 50% / 50%, Meraas plate, "MERAAS · NOW PART OF DUBAI HOLDING" |
| 18.7 - 20.7 | PAGE Emaar press release, 14 Nov 2024: "Emaar Properties and Dubai World Trade Centre (DWTC) have established a joint venture to develop Expo Living" |
| 20.7 - 26.1 | EXPO LIVING "JOINT VENTURE" (no split shown) with DWTC; EMAAR SOUTH bar 50% / 50% with DACC |
| 26.1 - 28.8 | DACC (Dubai Aviation City Corporation, "50% partner in Emaar South") -> CHAIRED BY -> Sheikh Ahmed bin Saeed Al Maktoum |
| 28.8 - 34.0 | COMPANY LEVEL: Dubai Holding -> SHAREHOLDER -> Emaar Properties (listed on the DFM); "largest shareholder" |
| 34.0 - 37.9 | PAGE Dubai Media Office, 12 May 2026: "Dubai Holding’s total shareholding in Emaar Properties has increased to 29.73%, positioning it as the company’s largest shareholder." |
| 37.9 - 42.7 | SHARES IN EMAAR (company level) ≠ PARTNER ON ONE COMMUNITY (project level): "TWO DIFFERENT ARRANGEMENTS" |
| 42.7 - 45.9 | "THE NAME ON THE BROCHURE" -> LOOK BEYOND -> "WHO IS BEHIND IT?" |
| 45.9 - 50.5 | Checks: THE PROJECT COMPANY, THE DEVELOPER, YOUR CONTRACT (who is responsible for what) |
| 50.5 - end | FOLLOW button tapped -> FOLLOWING; "WHO'S BEHIND DUBAI'S BIGGEST COMMUNITIES" |

## Facts to check before posting
- **Whose stake:** the 70% (Mina Rashid Properties LLC), 50% (Dubai Hills Estate LLC) and 50% (Emaar Dubai South DWC LLC) stakes are held through **Emaar Development PJSC**, which Emaar Properties owns 80.16% of (Emaar Properties FS 2025). "Emaar holds 70%" is right at the Emaar Development level; Emaar Properties' look-through share is lower (about 56% and 40%).
- Rashid Yachts & Marina launched as "Mina Rashid"; the company is still Mina Rashid Properties LLC. The National (18 Aug 2019) gives the 70:30 split with P&O Marinas (owned by DP World); Emaar also shares 30% of future profits with the partner.
- Dubai Hills Estate: JV with Meraas announced 8 Jun 2013; Meraas is now part of Dubai Holding.
- Expo Living: Emaar and DWTC JV (Emaar, 14 Nov 2024), at Expo City Dubai. The release gives no split. Emaar's FS lists "DWTC Emaar LLC" at 50%, very likely this JV, but no source says so, so no percentage is shown.
- Emaar South: 50% (Emaar FS). Sheikh Ahmed bin Saeed is DACC's chairman; DACC also has an Executive Chairman, Khalifa Al Zaffin.
- Dubai Holding 29.73% after buying ICD's 22.27% (Dubai Media Office, 12 May 2026).
- Pictures: Sheikh Ahmed (Government of São Paulo 2021, CC BY 2.0); logos from the companies' sites and Wikimedia Commons (identification only); DWTC and DACC as text plates.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh emaar-partners
```
The face footage has 3242 frames, two fewer than `timeline.json` counts, so `FOOT_MAX` is clamped to the last real frame.
