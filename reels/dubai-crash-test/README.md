# Could Iranian attacks trigger a Dubai property crash? (reel)

83 s vertical reel (1080x1920, 30 fps; 81.3 s voice + 2 s end card) from the **HeyGen avatar video** `8c060a424d984fb1b0d28bc8293993a7` (version va17d3f9, 27 Oct 2026, English). His face **full screen** (no small bubble) on the hook and on four short lines; every claim on a **real page** with a marker on the exact words; clean animation for the rest; captions throughout; no map. Voice: a plain +8.5 dB gain, no filters, no loudnorm (`chain: volume=8.5dB`, `AF=anull`), -18 LUFS, peak -2.4 dBFS.

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 1.6 | Could continued Iranian attacks on the Gulf | FACE |
| 1.6 - 3.8 | ... trigger a Dubai property crash? | PAGE The National, 2 Sep 2026: "The UAE on Wednesday condemned Iran's latest attacks across the region" |
| 3.8 - 11 | fewer people, delayed expansion, new homes keep coming, prices under pressure | three rows + a price line bending down |
| 11 - 13.5 | But the evidence doesn't show every business pulling back | FACE |
| 13.5 - 18.2 | global investment firms continued with regional expansion | PAGE The National, 6 Apr 2026: "are boosting their regional operations despite the Iran war" |
| 18.2 - 20.2 | others more cautious | PAGE The National, 20 Oct 2026 (Ministry of Investment): "We are just either waiting, or we're delaying a little bit" |
| 20.2 - 24.1 | supports business activity, doesn't guarantee prices | two rows, check / cross |
| 24.1 - 31 | 4.58 million at the end of 2025, +332,000 | PAGE WAM, 30 Jul 2026: "reached 4.58 million by the end of 2025, an increase of around 332,000 people" |
| 31 - 36.4 | about 4.8 million by September 2026 | PAGE Gulf News, 29 Sep 2026: "reaching 4,807,185 by midday Monday" |
| 36.4 - 44 | the counting method changed; not every increase is a new arrival; growth won't continue forever | PAGE WAM: "relying on administrative records, smart systems and real-time data", then two "≠" cards |
| 44 - 45.8 | Investor interest has also held up | FACE |
| 45.8 - 58.6 | April survey by Arada / Penta Group: 56% of 689 investors, ahead of the US and UK | PAGE Arada press release, 4 Jun 2026: "with 56% of global investors expressing serious interest in the UAE’s property market", "the survey of 689 established property investors", "ahead of the United States (54%), the United Kingdom (41%)" |
| 58.6 - 63.8 | interest isn't a purchase; growth won't support every project equally | "≠" card + three unequal project bars |
| 63.8 - 68 | watch sales, rents, business expansion, completed supply | four tiles |
| 68 - 70.2 | Uncertainty can create opportunities | FACE |
| 70.2 - 77.7 | check if it still works if rents soften, handover is delayed, selling takes longer | checklist |
| 77.7 - 81.3 | Buy because the numbers work ... | FACE |
| 81.3 - 83.3 | | end card ABDULLAH AHLI |

## Facts and caveats (full notes: research by curl, 27 Oct 2026)
- Attacks: Iran's direct strikes on the UAE / Dubai were in Feb - Mar 2026 (e.g. Al Jazeera 1 Mar 2026: 137 missiles and 209 drones across the UAE); after the 8 Apr ceasefire UAE incidents were sporadic and outside its land territory; the 2 Sep 2026 page is about attacks on Bahrain, Kuwait, Jordan and Iraqi Kurdistan, condemned by the UAE. "Continued attacks on the Gulf" is fair for the region; recent direct hits on Dubai are not.
- "Others more cautious": supported only in general terms (Ministry of Investment: investors waiting, delaying or reducing the amount; no planned FDI cancelled). No page names a firm that formally paused a Gulf expansion, so none is named on screen.
- Population: the end-2024 base differs between the old series (3.86M) and the new one (about 4.25M), which supports his caveat that the method changed; how much of +332,000 is method rather than new residents is not published.
- Survey: fieldwork 1-23 April 2026, results published 4 Jun; 56% = share naming the UAE among the three markets they would most seriously consider (not purchase intent); UAE 56% vs US 54% is within the margin of error (about +-3.7 points for 689); India, Saudi Arabia and Egypt respondents lift the total; Arada is a developer (he says it commissioned the survey).

## Build
```
python3 -I prep_cut.py cut.json                           # cut.json -> the HeyGen take (scratchpad, not committed); chain volume=8.5dB
ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --find "<exact phrase>"   # tn_attacks, tn_20tn (--hidetext "Cookie Preferences"), tn_fdi, arada; gn_pop / wam_pop from ../dubai-population
python3 -I make_pagedata.py && node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh dubai-crash-test
```
