# Vous vivez en Europe ? (French, HeyGen 939e35f4)

38.9 s vertical video (1080x1920, **60 fps**; 36.9 s of voice + 2 s end) from HeyGen take 939e35f4. **Everything on screen is in French.** Same look as `../uk-uae-move` (the royal-family roadmap style), his face **small the whole time**. The German take of the same script is `../europe-planb-de`.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`; the take is -26.2 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 1.8 | EU flag card "L’EUROPE"; title "VOUS VIVEZ EN EUROPE ? · UNE QUESTION" |
| 1.8 - 4.9 | "DES ÉMEUTES AUX INFOS", "L’INSTABILITÉ POLITIQUE", "LE COÛT DE LA VIE" |
| 4.9 - 8.4 | PAGE INSEE, Informations rapides n° 247, 15 Oct 2026: "En septembre 2026, les prix à la consommation augmentent de 3,1 % sur un an" (underlined: white text on blue); title changes to "À QUEL MOMENT · VOTRE PLAN B ?" |
| 8.4 - 15.3 | "DES ANNÉES DE TRAVAIL" -> LOGEMENT, REVENUS, INVESTISSEMENTS -> "UN SEUL PAYS ?" |
| 15.3 - 21.5 | UAE flag card "DUBAÏ · ÉMIRATS ARABES UNIS" -> "UNE RÉSIDENCE SECONDAIRE", "UN POINT D’ANCRAGE POUR LA FAMILLE", "UN INVESTISSEMENT IMMOBILIER" |
| 21.5 - 28.2 | "LES RISQUES RESTENT": LE BIEN ?, LE PRIX ?, VOTRE SITUATION FISCALE ? |
| 28.2 - 31.4 | "QUITTER L’EUROPE DEMAIN ✕ pas besoin", "EXPLORER VOS OPTIONS ✓ dès aujourd’hui" |
| 31.4 - end | DM: types "EUROPE", chips "VOTRE PAYS" / "VOTRE BUDGET", reply "Voyons si Dubaï vous correspond" |

## Facts to check before posting
- The only figure is French inflation: INSEE final result for September 2026, +3.1 % year on year (energy +21.3 %). The October figure is due from INSEE on 13 Nov 2026 (provisional estimate around 30 Oct).
- "Riots on the news" and "political instability" are his framing; no page is shown for them.
- He says "Envoyez-moi Europe": the keyword typed on screen is EUROPE.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=fr python3 -I asr_words.py build/voice48k.wav build/words_raw.json   # build/footage (60 fps) + build/voice48k.wav
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py                       # script.txt = the HeyGen script ("EUROPE" as he says it in the call to action)
node shot_hl.mjs "https://www.insee.fr/fr/statistiques/9080209" assets/insee.png --w 430 --dpr 2.5 --wait 5000 --pad 200 --noempty --find "En septembre 2026, les prix à la consommation augmentent de 3,1 % sur un an"
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh europe-planb-fr
```
`scenes.js` is the same file in `../europe-planb-fr` and `../europe-planb-de` except for `const LANG` and `FOOT_MAX` (the number of face frames). The EU flag (`assets/img/flag_eu.png`) is drawn from the official geometry; the UAE flag is from Wikimedia Commons (public domain).
