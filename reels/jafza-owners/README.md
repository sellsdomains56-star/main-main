# Who in Dubai's royal family is connected to JAFZA? (HeyGen 7cb7e81c)

60.6 s vertical video (1080x1920, **60 fps**; 58.6 s of voice + 2 s end) from HeyGen take 7cb7e81c. The royal-family roadmap style (`../dubai-royal-roadmap`): portrait -> lines -> logo cards, the camera walking down the ownership chain, real pages with a marker on the exact words, his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`; the take is -26.2 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 3.6 | "?" (Dubai's royal family) -> CONNECTED? -> Jebel Ali Free Zone photo card |
| 3.6 - 18.1 | The chain, camera walking down: Sheikh Ahmed bin Saeed -> CHAIRS -> Dubai World (government-owned) -> OWNS -> Port and Free Zone World (PFZW) -> OWNS -> DP World -> PART OF THE GROUP -> JAFZA |
| 18.1 - 21.3 | PAGE Dubai Media Office, 1 Mar 2020: "Decree No. (9) of 2020 on the Board of Directors of Dubai World.", "Under the chairmanship of HH Sheikh Ahmed bin Saeed Al Maktoum" |
| 21.3 - 23.7 | The chain again with the Government of Dubai on top: ULTIMATE OWNER |
| 23.7 - 31.1 | PAGE Dubai Legislation Portal, Decree No. (1) of 1985: "Law No. (1) of 1980 Establishing the Jebel Ali Free Zone;", "a legal entity named the “Jebel Ali Free Zone Authority” is hereby established" |
| 31.1 - 38.4 | PAGE Dubai Media Office, 17 Feb 2020: "DP World's parent company Port and Free Zone World has offered to acquire the 19.55 per cent of DP World's shares traded on Nasdaq Dubai, returning the company to private ownership." |
| 38.4 - 43.0 | Jebel Ali Port photo card (DP World assets: Jebel Ali Port, JAFZA, NIP) <- MINORITY STAKE <- CDPQ (Canadian investor, 2022) |
| 43.0 - 49.3 | PAGE DP World, 6 Jun 2022: "Global investment group CDPQ will take an approximately 22% stake in Jebel Ali Port, Jebel Ali Free Zone and the National Industries Park" |
| 49.3 - 51.3 | DP WORLD ✓ retained control; THE ASSETS ✓ stay in the DP World group |
| 51.3 - 53.9 | The structure at a glance: Government of Dubai -> Dubai World (chaired by Sheikh Ahmed) -> PFZW -> DP World -> JAFZA |
| 53.9 - end | FOLLOW button tapped -> FOLLOWING; "WHO OWNS DUBAI?" COMPANIES · DEVELOPMENTS |

## Facts to check before posting
- **"At the top of its ownership chain"**: DP World's 2025 annual report (note 1) calls Dubai World the "Intermediate Parent" and says "The Government of Dubai is the Ultimate owner of the Group." The screen puts the Government above Dubai World. Safer wording would be "at the top of DP World's corporate chain".
- Sheikh Ahmed has chaired Dubai World since Dec 2010; the latest decree found is No. (33) of 2023. He is not on DP World's board (DP World's chairman since 13 Feb 2026 is Essa Kazim).
- The Dubai Media Office page's headline says "DP World", but its body is about the Board of Directors of Dubai World; only the body is marked.
- 1980 / 1985: Law No. (1) of 1980 established the free zone (its text is not online); Decree No. (1) of 1985 established the Jebel Ali Free Zone Authority, issued 9 Jan 1985 by Crown Prince Maktoum bin Rashid. JAFZA's own About page credits Sheikh Mohammed bin Rashid, which is wrong, so it is not used.
- 2020: the offer was US$16.75 a share for the 19.55% on Nasdaq Dubai (US$2.7bn); delisted 23 Jun 2020.
- 2022: CDPQ ~22% (US$2.5bn of a US$5bn deal, assets valued at ~US$23bn). Since 5 Mar 2024, DP World holds 65.44% of the joint venture, so "≈22%" is shown as the 2022 figure, not today's. CDPQ trades as "La Caisse" since 2025. DP World's own stake in JAFZA's operating company is therefore 65.4%, not 100%.
- Pictures: Sheikh Ahmed (Government of São Paulo 2021, CC BY 2.0, from `../dubai-royal-roadmap`); Jebel Ali Port aerial (Imre Solt 2007, CC BY-SA 3.0, credited on screen); logos from the companies' sites and Wikimedia Commons (identification only).

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
#   dlp_1985 with --desktop (the Dubai Legislation Portal only lays out as a desktop page; phone emulation renders it blank)
#   dpw_ar (DP World annual report 2025, note 1) was cut from the PDF with its boxes but is not shown: the print is too small for a phone
python3 -I make_pagedata.py
node data/raster_logos.mjs assets/logos <svg files>   # then copied to assets/img/logo_*.png
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh jafza-owners
```
