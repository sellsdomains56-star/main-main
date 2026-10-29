# UK vs UAE millionaire migration (HeyGen ff714b82)

55.5 s vertical video (1080x1920, **60 fps**; 53.4 s of voice + 2 s end) from HeyGen take ff714b82. Same look as `../e11-land` and `../dso-developers` (the royal-family roadmap style): cards with gold and white lines, real pages with a marker on the exact words, his face **small the whole time** (the round bubble top-left). There is no map because no point in the script is about a place.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB` in `cut.json`, because HeyGen exports at about -26 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 6.7 | UK flag card ("biggest net outflow") and UAE flag card ("biggest net inflow") joined by lines to "ONE FORECAST" (Henley & Partners, Private Wealth Migration Report 2025), "THE NUMBERS" |
| 6.7 - 15.6 | PAGE Henley & Partners press release, 24 Jun 2025: "the UK is forecast to lose a staggering –16,500 millionaires in 2025", "the UAE retains its crown as the world’s leading wealth magnet, with a record net inflow of +9,800 relocating millionaires expected this year" |
| 15.6 - 19.7 | Bars UK –16,500 / UAE +9,800 ("2025 forecast"; millionaire = USD 1m+ liquid investable wealth), rows "FORECASTS FOR 2025 ?" and "BRITISH MILLIONAIRES TO DUBAI ✕ not a confirmed count" |
| 19.7 - 26.8 | PAGE GOV.UK policy paper, 30 Oct 2024: "The measure will replace the remittance basis of taxation, which is based on domicile status, with a new tax regime based on residence from 6 April 2025.", "An individual is long-term resident (and in scope for Inheritance Tax on their non-UK assets)" |
| 26.8 - 30.6 | Cards "10/20 LONG-TERM UK RESIDENT" -> "YOU LEAVE THE UK" -> "3–10 AFTER YOU LEAVE, still in UK inheritance tax" (same policy paper) |
| 30.6 - 34.0 | PAGE u.ae (the UAE government portal), Taxation: "The UAE does not levy income tax on individuals." |
| 34.0 - 40.3 | PAGE Dubai Land Department, Golden Visa application - Investor: "owning a property the purchase value of which is equal to or more than 2 million AED", "to apply for a 10-years renewable residence permit" |
| 40.3 - 47.0 | "MOVING TO DUBAI" -> tiles HOUSING, SCHOOLS, BUSINESS PLANS, TAX RESIDENCY (each as he says it) |
| 47.0 - end | DM: types "MOVE", sends it, chips "ALONE" / "WITH FAMILY", reply "Areas + property options" |

## Facts to check before posting
- The Henley figures are **forecasts** for 2025 (he says so). Henley's 2026 report (16 Jun 2026) dropped per-country counts: "Rather than producing a precise count of movements that the data does not yet support…". Tax Justice Network has also criticised the numbers (a campaign group). Henley's "millionaires" means people with USD 1m+ in liquid investable wealth.
- Golden visa: the Dubai Land Department, ICP and GDRFA Dubai all say **10 years** for property of AED 2m or more. The federal u.ae golden-visa table (updated 28 Jul 2026) still says "5 years (real estate investments)", and an old DLD FAQ also says 5 years / not mortgaged. Neither is shown. The script's "can support an application" is suitably hedged.
- Inheritance tax: long-term resident = UK resident for at least 10 of the last 20 tax years; stays in scope for 3 to 10 years after leaving (it depends on how long they were resident).

## Build
```
python3 -I prep_cut.py && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json   # cut.json -> build/footage (60 fps) + build/voice48k.wav
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py                                            # script.txt = the HeyGen script, ASR spellings corrected
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 6000 --pad 200 --noempty --find "<exact phrase>" ...   # one per page (URLs in pagedata.js); dld_gv / uae_tax with --eval to open the "Read More" text
python3 -I make_pagedata.py
node data/raster_logos.mjs assets/img <svg>...   # flags (Wikimedia Commons, public domain) and the Henley & Partners wordmark (identifies the source report only)
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh uk-uae-move   # 10.1 MB
```
The face footage has 3206 frames (53.44 s), one fewer than `timeline.json` counts, so `FOOT_MAX` is clamped to the last real frame.
