# Content playbook (Phase 1): what to say, and what to show while saying it

Contents: 1 intake, 2 fact base, 3 hook, 4 the script (voice and rules), 5 beat plan, 6 asset list, 7 what to hand over, 8 worked example.

## 1. Intake (2-3 questions at most)
- **Topic / project / document** - ask for the source (price list, study page, brochure, announcement). If they paste a long script, shorten it; do not start from zero.
- **The one question the viewer asks** ("Why is this different?", "Is Dubai heading for another 2008?", "Does AI raise property prices?"). The reel answers that question and nothing else.
- **Hook**: either they already have an on-camera take (use it - cut at silences) or you write one.
Defaults if unanswered: 45-60 s, UAE investors/buyers as audience, English, call to action = "message me <keyword>".

## 2. Fact base (before a word of script)
- Every number needs: value, unit/currency, period, source. Write them in a table; this table becomes the on-screen sources line.
- Re-derive any derived number (a "25% cheaper" claim is (2,470 - 1,852) / 2,470 = 25.0%; say so only if it checks out).
- Watch the traps seen in real reels: a headline figure that covers one year only ("917 billion dirhams in 2025", not "in 2025 and 2026"); a cumulative figure presented as annual (Microsoft's USD 15.2 billion is 2023-2029); a USD figure presented as dirhams; "AED 2.5 billion" that is the sum of two packages; a programme that benefits brokers presented as a benefit for buyers (the Emirati Broker Programme gives *brokers* priority access and bookings at launches).
- Prefer the primary source (developer's own announcement, government page, the company's own post) and a news article that quotes it. Screenshots of those become the on-screen cards.
- Anything you cannot verify: leave it out, or tell the user plainly in the hand-over ("could not verify X, left it out"). Never present a projection as a fact (cash-on-cash returns were left out for this reason).
- Advertising rules for property in the UAE (permits, licence numbers, regulator wording) differ by emirate and change - remind the user to check them before posting; do not assert specifics you have not read.

## 2b. When a recording arrives: check what was SAID against the fact base
Transcribe first, then compare every spoken figure with the sources. Real cases: the hook was recorded as "72 billion in just 48 hours" while the sources say Dh6 billion in 72 hours (the numbers got swapped); a claim "80% of this launch consists of townhouses" and the three scenario values (4.33 / 4.73 / 5.31 million) came from the user's own study and could not be found in public sources; "below 5 million" had no currency spoken. Rule: never put an unverified or contradicted number on screen as a hero. If the recording contradicts a verified source, use the user's own correct take for that line (e.g. the on-camera hook they already recorded) or ask for a re-record, and say so plainly in the hand-over. Numbers that come only from the user's own study are shown with the source "INVESTMENT STUDY"; projections get "MODELLED SCENARIOS · NOT A GUARANTEE". Currency not spoken: show the unit on screen from the source and flag it.

## 3. The hook (first ~4 s, he is on camera)
- One sentence, a question or a surprising claim with a **concrete number**: "Why did investors put 6 billion into this project in just 72 hours?"
- It must be *his* words in *his* take (the face beat). Pick the take whose first word starts clean; cut start ~60 ms before the first word, end after the last word has decayed (`edl_tools.py env`).
- On screen the number words slam in as gold/ivory boxes at the moment they are said ("6 BILLION", "IN 72 HOURS").
- Right after the hook the first graphic beat names the subject and the promise ("Here's why Ohana townhouses are different.").

## 4. The script
The voice is a friend explaining something over coffee, not a sales video. Rules the user gave, in their own words: *"directly say it, speak like you're speaking to someone, a conversation type of video, not an advertising commercial thing"*, *"don't say 'now the this, now is that'"*, *"make it catchy and remove unnecessary things"*, *"shorter"*, *"dirham, not AED"*, *"readable"*.
1. Straight to the point. First sentence after the hook = the thesis. No warm-ups, no "now", "so", "moreover", "let's talk about".
2. **One idea, one number per sentence**, <= 12 words. Each sentence becomes one beat.
3. Numbers and currency as they are *spoken*: "one thousand eight hundred and fifty-two dirhams per square foot", "twenty-five percent", "three point seven and five point three million dirhams", "twenty twenty-nine". On screen they appear as digits (the script.txt markup `{1,852|one thousand eight hundred and fifty-two}` carries both).
4. Compare, don't boast: show the price against something real ("The newest townhouses at The Orchids, on the same island, are 2,470. So Ohana is twenty-five percent cheaper.").
5. Scarcity or reason-why in one line ("Family townhouses between 3.7 and 5.3 million dirhams are rare. Almost nobody is launching them.").
6. Benefit for the buyer or the viewer's decision (payment plan, who pays what, what to do next).
7. Close: "If you want the price list, message me townhouses." - one keyword, spoken, typed in the on-screen chat.
8. Length: 130-150 spoken words per minute; 110-140 words total for 50 s. Cut anything the viewer would not miss.
9. Read it aloud once. If you stumble, the speaker will.

### Two versions to hand over
- **Speaker version**: plain paragraphs, numbers spelled out, no markup, no timings.
- **`script.txt`** (for the editor): the same words, but figures as `{display|spoken}`, e.g. `{25%|twenty-five percent}`; punctuation attached to the closing brace when it follows (`{2,470|two thousand four hundred and seventy}.`). Words must follow the *recording*, so update it if they changed a word.

## 5. Beat plan: one visual per sentence
| What the sentence does | Visual (engine function) |
|---|---|
| hook | FACE beat + gold/ivory number boxes (`ovHook`) |
| "where is it" | satellite flight, outline of island/district, pin with name + one line (`SAT_SCENES`, `outlines`, `pins`) |
| a thing exists (project, product) | real picture card with a source chip (`card`, `chip`) |
| one key number | counting number + unit line (`bigNumber`, `bw`) |
| compare two or three numbers | bars that grow (`barRow`), dashed gap + "25% CHEAPER" box |
| a range | two numbers popping with an arrow between, unit under (see Ohana "3.7 -> 5.3") |
| rarity / emphasis | picture card + `ovStamp('RARE')`, then two lines of kinetic type |
| "the news says" / proof | real article or post as a card, glide onto the line (`focus`) and mark it (`hl`) |
| list of 2-3 points | pill rows (`pillRow`) |
| payment plan over time | dots on a timeline, last dot = handover (see Ohana S6) |
| split of percentages | two ring gauges (`gauge`) |
| call to action | chat: typed keyword, sent, answered (`sceneChat`) |
Rules: a beat lasts 3-6 s (longer = split it, shorter = merge); never two heroes at once; the first and last beat can be FACE (the hook, optionally a closing line); every figure shown is the figure spoken.

## 6. Asset list (hand to `real-material.md`)
For each beat: what to fetch, from where, and the on-screen source chip text. Typical set for a project reel: 2-3 brochure renderings, the developer's/news article about the news peg, a price comparison table, a location (coordinates or place name for the map + an OSM outline).

## 7. What to hand over after Phase 1
1. Speaker script (ready to record).
2. Figures table with sources (what appears on screen).
3. Beat plan table (time estimate per beat).
4. Asset list, and anything you could not verify.
5. Recording tips: quiet room, phone mic 20 cm from the mouth, steady pace, one pass; a hook take on camera in front of a plain background, chest-up, eyes to lens; leave 0.5 s of silence before and after.

## 8. Worked example (Ohana townhouses, 49 s)
Hook (his take): "Why did investors put six billion into this project in just seventy-two hours?"
Script as recorded: "Here's why Ohana townhouses are different. A two-bedroom townhouse is one thousand eight hundred and fifty-two dirhams per square foot. The newest townhouses at The Orchids, on the same island, are two thousand four hundred and seventy. So Ohana is twenty-five percent cheaper. It's even cheaper per square foot than the average luxury apartment on Yas. Family townhouses between three point seven and five point three million dirhams are rare. Almost nobody is launching them. Ohana also has an Emirati Broker Programme. Emirati brokers get first access to inventory and bookings at launches. You pay five percent every six months, and the rest at handover in twenty twenty-nine. UAE nationals pay thirty percent before handover. Everyone else pays thirty-five percent. If you want the price list, message me townhouses."
Beats: hook (face) -> map flight to the pin -> photo + 1,852 -> bars vs The Orchids (-25%) -> bars vs Yas apartments -> family townhouses 3.7 -> 5.3 -> RARE -> real article with marker on "preferential access to inventory" / "booking access during project launches" -> payment timeline -> 30% / 35% gauges -> chat "Price list?". See `examples/ohana-townhouses/`.
