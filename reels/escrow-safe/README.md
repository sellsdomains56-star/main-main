# Off-plan in Dubai: where your money goes (HeyGen a3c43173)

55.7 s vertical video (1080x1920, **60 fps**; 53.7 s of voice + 2 s end) from HeyGen take a3c43173. The law itself on screen: Law No. (8) of 2007 Concerning Escrow Accounts (Dubai Legislation Portal PDF), each article with a marker on the exact words and the same words in large type underneath, plus a plain buyer -> escrow -> project flow. His face **small the whole time**. No map.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 3.8 | "AED · YOUR OFF-PLAN PAYMENT" -> "WHERE DOES IT GO?" |
| 3.8 - 7.8 | PAGE Law No. (8) of 2007, Art. 6: "Any Developer who wishes to sell Units off-plan must submit to the Department a request to open an Escrow Account." |
| 7.8 - 12.5 | PAGE Art. 2 (Escrow Agent): "The financial or banking institution accredited by the Department to manage an Escrow Account." |
| 12.5 - 15.6 | BUYER PAYMENTS -> DEPOSITED -> THE ESCROW ACCOUNT (in the project's name) -> CONSTRUCTION ONLY -> THE PROJECT |
| 15.6 - 18.9 | PAGE Art. 9 (1): "No attachment may be imposed on the payments deposited in this account for the benefit of the creditors of the Developer." |
| 18.9 - 26.0 | PAGE Art. 14: "An Escrow Agent must retain five percent (5%) of the total value of each Escrow Account once the Developer obtains the completion certificate." then "The retained amount will be released to the Developer one (1) year from the registration of Units in the name of purchasers." |
| 26.0 - 31.4 | PAGE Art. 15: "… ensure that the Real Estate Development project is completed, or depositors are refunded their payments." |
| 31.4 - 35.4 | ✕ AN IMMEDIATE REFUND (not promised); ✕ A GUARANTEED FULL REFUND (not in every case) |
| 35.4 - 43.1 | ESCROW ✓ an important protection; IT DOESN'T REMOVE: CONSTRUCTION DELAYS, MARKET RISK, READ YOUR CONTRACT |
| 43.1 - 49.5 | Verify: THE PROJECT, APPROVED ACCOUNT DETAILS, CONSTRUCTION STATUS, PAYMENT INSTRUCTIONS - "through official channels" |
| 49.5 - end | Comment box types "SAFE", reply "What to verify before booking" |

## Facts to check before posting
- Every quote is word for word from the English text of Law No. (8) of 2007 on the Dubai Legislation Portal (issued 6 May 2007; the Arabic text prevails). No amending law was found.
- "Seized" in the script = "attachment" in the law.
- Art. 14's release is "one (1) year from the registration of Units in the name of purchasers"; the DLD FAQ paraphrases it as one year after completion. The script follows the law.
- Art. 15 is a duty on the escrow agent ("take the required measures"), not a detailed procedure; cancellation and refunds in practice run through RERA rules (the DLD FAQ mentions a 60-day return request after a cancellation decision). The script's "procedures aimed at completion or returning payments" and "not an immediate or guaranteed full refund" fit this.
- The checklist subtitles are general advice; no specific app or service is named.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
python3 -I data/pdf_pages.py <Law No. (8) of 2007.pdf>   # from the Dubai Legislation Portal; pages 2-5 cropped to the text column, exact phrase boxes
#   (the portal's HTML version renders blank in the headless browser, so the PDF is used)
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh escrow-safe
```
