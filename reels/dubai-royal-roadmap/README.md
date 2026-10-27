# How Dubai's royal family is connected to the developers - roadmap reel (60 fps)

75 s vertical reel (1080x1920, **60 fps**; 73.4 s voice + 2 s end card) from the **HeyGen avatar video** `4a30e26b15594227b76fbd3f5ab8446d` (new version v6ba6daca, 27 Oct 2026, English; the link used to hold the China-banks take, see `../difc-china-banks`). Brief: "put their pictures and lines underneath, text and animation, then lines, and underneath who owns it with his pictures, like a roadmap ... with his face as well; not congested, eye friendly; 60 fps".

- A **roadmap**: each sheikh's photo (gold ring), a **gold line "CHAIRS"** down to the entity he chairs (logo card), then **white lines** to what that entity owns (logo cards and landmark photos), built as he says each name; the camera walks down the tree; whatever scrolls up fades out before the Reels top bar.
- His **face full screen** on the hook, on "These are the connections" and on the closing line (no small bubble). Captions throughout.
- The Emaar stake move (22.27% from ICD, 29.73% total, largest shareholder) on its **real page** (Dubai Media Office, 12 May 2026, marker on the exact words).
- Voice: a plain +8.5 dB gain, no filters, no loudnorm. Engine at 60 fps: `lib.js` FPS = 60, `prep_cut.py` / `make_timeline.py` take fps from `cut.json`, `encode.sh` reads it from `timeline.json` (the 25 fps HeyGen footage is repeated to 60).

| Time | He says | On screen |
|------|---------|-----------|
| 0 - 3.5 | How is Dubai's royal family connected to the developers? | FACE |
| 3.5 - 18.7 | Hamdan bin Mohammed chairs ICD; ICD owns Ithra Dubai (One Za'abeel); stake in DIB, a major shareholder in Deyaar | Hamdan -> CHAIRS -> ICD -> OWNS -> Ithra Dubai -> One Za'abeel photo; ICD -> 28% STAKE -> DIB -> ≈45% -> Deyaar |
| 18.7 - 32.4 | Maktoum bin Mohammed chairs DREC (government properties and land); wasl, its arm: homes, offices, hotels, leisure | Maktoum -> CHAIRS -> DREC -> ASSET MANAGEMENT ARM -> wasl -> four tiles |
| 32.4 - 41.7 | Dubai Holding, chaired by Ahmed bin Saeed, government-owned: Nakheel, Meraas, Dubai Properties, Meydan | Dubai Holding <- CHAIRS <- Ahmed; four photo cards (Palm Jumeirah, Ain Dubai, Business Bay, Meydan) |
| 41.7 - 46.0 | May 2026: Dubai Holding acquired ICD's stake in Emaar | ICD -> Dubai Holding, the 22.27% token moves; Emaar card (Burj Khalifa) |
| 46.0 - 51.9 | 29.73%, Emaar's largest shareholder | PAGE Dubai Media Office 12 May 2026 |
| 51.9 - 59.4 | Ahmed also chairs DACC (behind Dubai South) and Expo City Dubai Authority | Ahmed -> CHAIRS -> DACC -> BEHIND -> Dubai South; Ahmed -> ALSO CHAIRS -> Expo City Dubai Authority |
| 59.4 - 60.7 | These are the connections | FACE |
| 60.7 - 69.1 | royals chair government entities; the entities own businesses, land, stakes in developers | overview: three portraits -> ICD / DREC / Dubai Holding + DACC + Expo City -> businesses, land, stakes; legend |
| 69.1 - 73.4 | Chairing the organisation and personally owning its assets are two different things | FACE, then end card |

## Facts (research 27 Oct 2026, every link checked)
- Hamdan chairs ICD (Decree 23 of 2026, 29 Sep 2026; chair since Decree 24 of 2020). ICD = the principal investment arm of the Government of Dubai; wholly owns Ithra Dubai (developer of One Za'abeel); holds 27.97% of Dubai Islamic Bank (31 Dec 2025), which holds 44.9% of Deyaar (DIB Annual Report 2025).
- Maktoum chairs Dubai Real Estate Corporation (Decree 16 of 2026, 24 Jun 2026). DREC owns and manages government-registered properties and land. wasl was "created by DREC to manage and develop its assets" - he says "operating arm"; the screen says ASSET MANAGEMENT ARM (the sources' wording).
- Ahmed bin Saeed chairs Dubai Holding (since Nov 2019); government-owned since Law 1 of 2023 (before that legally owned by the Ruler personally; not a "government entity"). Nakheel, Meraas, Dubai Properties and Meydan are in Dubai Holding Real Estate (Meydan is less visible on its 2026 pages).
- Emaar: 22.27% bought from ICD (12 May 2026), total 29.73%, largest shareholder; ICD holds no Emaar shares since, so no ICD -> Emaar line is drawn.
- Ahmed chairs DACC (Decree 12 of 2015), which is behind Dubai South (Dubai World Central). **Expo City Dubai Authority is not under DACC** (Law 14 of 2022, wholly government-owned); Ahmed chairs it separately (Resolution 27 of 2022) - his sentence reads either way, the screen hangs it from him directly.
- Pictures: Hamdan (MEA India 2025, GODL-India), Maktoum (ITU 2012, CC BY 2.0), Ahmed (Gov. of São Paulo 2021, CC BY 2.0); landmarks from Wikimedia Commons / English Wikipedia (One Za'abeel CC BY-SA 4.0 DvTor8303, Burj Khalifa CC BY-SA 3.0 Donaldytong, Palm Jumeirah NASA PD, Ain Dubai CC BY-SA 4.0 Roxy3115, Business Bay CC BY 4.0, Meydan CC BY 2.0, Al Maktoum airport CC0, Al Wasl Plaza CC BY-SA 4.0 Mike Krüger). Logos are trademarks, used only to identify each company. The UAE has no freedom of panorama (building photos carry a small risk).

## Build
```
python3 -I prep_cut.py cut.json                          # fps 60, chain volume=8.5dB (HeyGen take in the scratchpad, not committed)
ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json && python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node data/raster_logos.mjs assets/logos <logo files>     # SVG/PNG logos -> PNG (Chromium), copied to assets/img with the photos and the cropped portraits
node shot_hl.mjs "<dubai media office url>" assets/dmo_emaar.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --find "Dubai Holding has acquired a 22.27% equity stake in Emaar Properties PJSC (Emaar Properties) from ICD" --find "total shareholding in Emaar Properties has increased to 29.73%, positioning it as the company’s largest shareholder"
python3 -I make_pagedata.py && node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh dubai-royal-roadmap
```
