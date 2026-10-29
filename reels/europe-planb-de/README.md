# Sie leben in Europa? (German, HeyGen f2b407a1)

47.2 s vertical video (1080x1920, **60 fps**; 45.2 s of voice + 2 s end) from HeyGen take f2b407a1. **Everything on screen is in German.** Same look as `../uk-uae-move` (the royal-family roadmap style), his face **small the whole time**. The French take of the same script is `../europe-planb-fr`.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`; the take is -26.1 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 2.3 | EU flag card "EUROPA"; title "SIE LEBEN IN EUROPA? · EINE KURZE FRAGE" |
| 2.3 - 6.5 | "AUSSCHREITUNGEN IN DEN NACHRICHTEN", "POLITISCHE UNSICHERHEIT", "LEBENSHALTUNGSKOSTEN" |
| 6.5 - 10.8 | PAGE Destatis, Pressemitteilung Nr. 364, 13 Oct 2026: "Weiter steigende Energiepreise treiben die Inflationsrate auf den Jahreshöchststand" (underlined: white text on the coloured band), "+3,3 % zum Vorjahresmonat"; title changes to "WANN FANGEN SIE AN? · IHR PLAN B" |
| 10.8 - 18.7 | "JAHRELANGE ARBEIT" -> ZUHAUSE, EINKOMMEN, INVESTITIONEN -> "EIN EINZIGES LAND?" |
| 18.7 - 25.9 | UAE flag card "DUBAI · VEREINIGTE ARABISCHE EMIRATE" -> "EIN ZWEITWOHNSITZ", "EIN ZUHAUSE FÜR IHRE FAMILIE", "IMMOBILIENINVESTITION IM AUSLAND" |
| 25.9 - 33.8 | "DIE RISIKEN BLEIBEN": DIE IMMOBILIE ?, DER PREIS ?, IHRE STEUERLICHE SITUATION ? ("muss zu Ihren Plänen passen") |
| 33.8 - 39.2 | "EUROPA MORGEN VERLASSEN ✕ nicht nötig", "ÜBER MÖGLICHKEITEN INFORMIEREN ✓ schon heute" |
| 39.2 - end | DM: types "EUROPE", chips "WOHNSITZLAND" / "BUDGET", reply "Schauen wir, ob Dubai passt" |

## Facts to check before posting
- The only figure is German inflation: Destatis, September 2026, +3.3 % year on year (the highest since December 2023, per Destatis). The October flash estimate is due at the end of October 2026.
- "Riots on the news" and "political uncertainty" are his framing; no page is shown for them.
- He says "Schicken Sie mir Europe" (the English word): the keyword typed on screen is EUROPE.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=de python3 -I asr_words.py build/voice48k.wav build/words_raw.json   # build/footage (60 fps) + build/voice48k.wav
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py                       # script.txt = the HeyGen script ("EUROPE" as he says it in the call to action)
node shot_hl.mjs "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/10/PD26_364_611.html" assets/destatis.png --w 430 --dpr 2.5 --wait 5000 --pad 200 --noempty --find "Weiter steigende Energiepreise treiben die Inflationsrate auf den Jahreshöchststand" --find "+3,3 % zum Vorjahresmonat"
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh europe-planb-de
```
`scenes.js` is the same file in `../europe-planb-fr` and `../europe-planb-de` except for `const LANG` and `FOOT_MAX` (the number of face frames). The EU flag (`assets/img/flag_eu.png`) is drawn from the official geometry; the UAE flag is from Wikimedia Commons (public domain).
