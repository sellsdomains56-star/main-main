# UK, quick question (HeyGen b59fa4fd)

46.2 s vertical video (1080x1920, **60 fps**; 44.2 s of voice + 2 s end) from HeyGen take b59fa4fd. Same look as `../uk-uae-move` (the royal-family roadmap style), with his face **small the whole time** (the round bubble top-left). No map.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB` in `cut.json`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.3 | UK flag card -> "BUILD A LIFE" -> UAE flag card "A LIFE IN DUBAI - what would it actually cost?" |
| 4.3 - 9.7 | PAGE GOV.UK Be Ready campaign: "Being ready for 3 days helps you manage while support reaches those in need.", "including having 3 days’ worth of supplies" |
| 9.7 - 12.8 | Rows "EMERGENCY SUPPLIES · 3 DAYS ✓ sensible preparation", "YOUR LONG-TERM PLANS ? prepare those too" |
| 12.8 - 15.8 | PAGE u.ae, Taxation: "The UAE does not levy income tax on individuals." |
| 15.8 - 20.4 | PAGE Federal Tax Authority, Corporate Tax - Basis of Taxation, Natural Person: "Sources generating the following income streams are not considered as Business or Business Activities:", "Real Estate Investment Income" |
| 20.4 - 26.0 | PAGE Dubai Land Department, Golden Visa application - Investor: "owning a property the purchase value of which is equal to or more than 2 million AED", "to apply for a 10-years renewable residence permit" |
| 26.0 - 32.4 | PAGE GOV.UK, Tax on foreign income - UK residence and tax: "Residents normally pay UK tax on all their income, whether it’s from the UK or abroad.", "Your UK residence status affects whether you need to pay tax in the UK on your foreign income." |
| 32.4 - 39.1 | "CONSIDERING DUBAI?" -> PROPERTY PRICE − ANNUAL COSTS = WHAT YOU KEEP -> "AFTER EXPENSES" |
| 39.1 - end | DM: types "UK", sends it, chips "BUDGET", "RELOCATE", "INVEST", reply "Here are your options" |

## Facts to check before posting
- The 3-day advice is the UK government's Be Ready campaign (launched 22 Oct 2026, a three-year campaign). It is voluntary advice ("encouraged"). The official pages say "3 days", not "72 hours".
- Corporate tax: the exclusion (Cabinet Decision No. 49 of 2023) covers UAE property held by a person directly, not through a company, and not an activity that needs a licence. "Generally" in the script is right.
- Golden visa: Dubai Land Department, ICP and GDRFA Dubai say 10 years for property of AED 2m or more. The federal u.ae table still says 5 years for real estate; it is not shown.
- UK tax after buying abroad depends on UK residence (the statutory residence test), and on inheritance-tax rules for long-term residents (see `../uk-uae-move`).

## Build
```
python3 -I prep_cut.py && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py                       # script.txt = the HeyGen script
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 6000 --pad 160 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
#   fta.png is cut off above the page's own blue "Natural Persons should not register if:" bar; uae_tax / dld_gv are the captures from ../uk-uae-move
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh uk-quick-question
```
