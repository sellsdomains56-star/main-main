# Five of the wealthiest people living in the UAE (HeyGen 669dac00)

49.0 s vertical video (1080x1920, **60 fps**; 47.0 s of voice + 2 s end) from HeyGen take 669dac00. One real Forbes Middle East page per person (net worth and the line describing them, marked), then all five on one bar scale. His face **small the whole time**. No map.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.8 | "FIVE OF THE WEALTHIEST": five empty bars, "Forbes 2026 · net worth as of 1 March 2026" |
| 4.8 - 10.1 | PAGE Forbes ME, Pavel Durov: "Net Worth: $6.6 B", "Pavel Durov is the founder and owner of messaging app Telegram" |
| 10.1 - 18.1 | PAGE Forbes ME, The World's Richest Arabs 2026: "Hussain Sajwani, founder and chairman of DAMAC Properties, is the UAE’s richest individual on the list at $15.3 billion" |
| 18.1 - 24.2 | PAGE Forbes ME, Andrey Melnichenko & family: "Net Worth: $20.4 B", "Andrey Melnichenko is the founder of fertiliser producer EuroChem and coal energy company SUEK." |
| 24.2 - 32.0 | PAGE Forbes ME, Vinod Adani: "Net Worth: $20.8 B", "Vinod Adani is the older brother of Gautam Adani", "has stakes in various group companies that are held through multiple overseas investment firms that belong to him." |
| 32.0 - 38.1 | PAGE Forbes ME, Changpeng Zhao: "Net Worth: $110 B", "Changpeng Zhao, who goes by CZ, is the cofounder and former CEO of Binance" |
| 38.1 - 45.4 | One scale ($0-110 B): Durov 6.6 (TECHNOLOGY), Sajwani 15.3 (PROPERTY), Melnichenko 20.4 (INDUSTRY), Adani 20.8 (DIVERSIFIED), CZ 110 (FINANCE); "ONE SHARED BASE: THE UAE" |
| 45.4 - end | "WHICH NAME SURPRISED YOU MOST?" with the five names; "Tell me in the comments" |

## Facts to check before posting
- **"Five of the wealthiest", not the top five:** Nik Storonsky ($18.8 B) is #4 on Forbes ME's UAE residents list and is worth more than Sajwani and Durov. The script's wording is right; don't caption it "top five".
- Figures are Forbes' 2026 list values (net worth as of 1 Mar 2026). Real-time Forbes figures now differ (CZ about $114.6 B, Vinod Adani about $24.4 B on 30 Oct 2026).
- **Sajwani "highest-ranked Emirati on Forbes' 2026 billionaires list"**: true by inference but not Forbes' wording; the screen uses Forbes ME's line ("the UAE's richest individual on the list", Richest Arabs 2026). Durov also holds UAE citizenship per Forbes, but ranks far lower.
- CZ: Forbes ME's profile says "cofounder" (its page description elsewhere says "founder"); he says "co-founder". He was sentenced in the US in 2024 and pardoned in October 2025 (on the same page, not shown).
- Melnichenko is under EU/UK/US sanctions (noted on his Forbes profile, not shown); Forbes lists his residence as Ras Al Khaimah.
- Industries are Forbes' own fields (Technology; Metals & Mining shown as "industry"; Diversified; Finance & Investments); "property" for Sajwani is DAMAC.
- The pages: the live Forbes ME pages blank themselves in a headless browser, so saved copies (same text, same stylesheets) were captured with their scripts off by `shot_static.mjs`; the fonts fall back to the browser's serif.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
curl -o <name>.html <forbes url>   # then add <base href="<forbes url>"> after <head>
node shot_static.mjs <name>_base.html assets/fme_<name>.png --url "<forbes url>" --find "<exact phrase>" ...   # URLs in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh uae-wealthiest
```
