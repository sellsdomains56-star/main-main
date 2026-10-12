# Scene API (what you can call inside scenes.js)

Contents: 1 contract, 2 timing helpers, 3 text, 4 numbers, 5 cards/pictures, 6 charts and pills, 7 map scenes, 8 face beat + overlays, 9 chat CTA, 10 sound cues, 11 low-level, 12 recipes.
Everything draws into the global `ctx` and is a pure function of time `t` (seconds). Coordinates are the 1080x1920 canvas. Files: `lib.js` (helpers), `scenes_lib.js` (blocks), `satmap.js` (map), `captions.js`, `main.js` (compositor).

## 1. Contract
`buildScenes()` returns `{ FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, PIV, FOOT_MAX }`
- `FACE_SEGS: [[a, b], ...]` seconds when he is full-screen (`[]` for none). `PUNCHES: [[t, amount]]` quick zoom punches on key words (0.05-0.06). `PIV: [x, y]` zoom pivot (his face centre/under the chin: `[540, 1500]` for a chest-up selfie), `FOOT_MAX` last footage frame index.
- `SCENES: [{ id, a, b, box: [y0, y1], fn(t), last?, kind?: 'sat', cfg? }]` - scene time range, content box (`[330, 1270]` normal, `[440, 1280]` for the chat), `fn` draws in absolute canvas coordinates; the compositor centres the box at y 800 and fades/slides it in and out. Scene n+1 starts at `b` of scene n (minus ~0.05).
- `OVERLAYS: [t => draw]` drawn on top of the face beat (hook titles, stamps).
- `IMAGES: { id: 'assets/file.png' }` preloaded images used by `card/pic/badge`.
- `cues`: sound cues (section 10). Globals available: `DUR`, `TL` (timeline), `OUTLINES`, `SAT_SCENES`, `IMG`, `C`, `F`, `E`, `SAFE`, `CX = 540`.

## 2. Timing helpers
- `wt(re, n = 0, fallback = 0, from = 0)` start time (s) of the n-th word matching `re` tested on the UPPER-CASED display token (punctuation included: `/^TOWNHOUSES\.$/`). `wend(...)` = its end. Tokens: figures as shown (`1,852`, `25%`, `2,470.`), so use prefixes (`/^2,470/`).
- `ea(t, a, b, ease = E.out3)` eased progress 0..1 between times; `prog(t, a, b)` linear clamp; `lerp`, `clamp`; eases `E.lin out2 out3 out4 out5 expo in2 in3 inOut2 inOut3 back`.
- `enter(t, a, d = 0.55, dist = 36)` -> `{a: alpha, dy: offset}` for slide-up fades.

## 3. Text
- `T(str, x, y, {font, color, alpha, align, ls, sx, sy, rot})` baseline text; `M(str, font, ls)` measure; fonts `F.d(weight, size)`, `F.t`, `F.i(size)`.
- `Tfit(str, x, y, opts, maxW)` shrinks to fit maxW (clamped to SAFE.w).
- `bw(t, text, y, a, {size=100, ls=2, color, w=800, hl, out, x, maxW, d, alpha})` kinetic line sliding up from a mask at time `a`; `hl: true` (or a colour) wipes a gold box behind it and turns the text black - use for THE key word of a beat; `out` = time it leaves.
- `label(...)`, `wordRow(words, times, y, t, opts)`, `stack(items, y0, step, t)` for lists of statements that appear in turn.

## 4. Numbers
- `bigNumber(t, {pre, preT, val, dec, fin, suffix, a0, a1, y, sc})` count-up with fixed-width digit cells (no jitter); `fin` is the final string (`'1,852'`, `'15.2'`), `suffix` e.g. `'%'`, `pre` a small gold label above, `sc` scale (0.8-0.9 fits the column), `y` centre. `numberStr(v, dec)` formats with thousands commas; `drawNumber`, `numberWidth` low-level.
- Range pop: two `T()` calls with `E.back` scale-in and a `strokePoly` arrow between (Ohana "3.7 -> 5.3").

## 5. Cards and pictures (real material)
`card(t, id, o)` - a real image on a rounded ivory card: `{x, y, w, h, a (enter), out (exit), from: [dx, dy] slide offset, rot (deg), fit: 'cover'|'contain', fx, fy (cover focus 0..1), zoom: [z0, z1] slow push, chip: 'SOURCE · DATE', r, bg, dim, focus, hl}`
- `focus: {bbox: [x, y, w, h] (IMAGE px), t0, t1, zoom (margin factor)}` or an array: the visible window glides onto the box (`zoom` 1.0-1.5: bigger = wider window = smaller text). Use it to "scroll" a long article to the line that matters.
- `hl: {bbox, t0, t1, color: '#FFC93C', mode: 'multiply'}` or an array: marker wipes across the exact words. **Measure bbox with `scripts/textlines.py`** (line bands, then word boxes), never eyeball.
- Card geometry that stays inside the safe zone: `x: 140, w: 800` (the 5% push and rotation stay under x 980). Keep the chip text short (<= 30 chars).
- `pic(t, id, x, y, w, a, {out, dy})` a transparent logo/PNG pop; `badge(t, id, x, y, r, a, name, {fx, fy, zoom, out})` round portrait with a gold ring and a name chip.

## 6. Charts, pills, small motion
- `barRow(t, {label, sub, y, a, g0, g1, val, max, gold, dec})` -> `{by, len}`: label + sub + a bar that grows to `val/max` of the safe column with the number counting inside. Rows at y 520 and 800 (pitch 280). Hang a dashed "gap" on the returned geometry (see Ohana scenes.js `orchids` scene).
- `gauge(t, {cx, cy, r, pct, a0, a1, gold, l1, l2})` ring gauge with a counting %, two-line label; two side by side at cx 340 / 740.
- `pillRow(t, icon, text, y, a, {w: 820, h: 104, size, dim, out})` dark glass pill with an icon and a gold sweep; icons in `ICONS` (`drop tag house chart building briefcase plane flag check bars up cube`) via `icon(name, x, y, halfSize, {p, color, w})`.
- `iconRow`, `ovStamp(text, tHit, tEnd, {y, size, rot})` (returns a function: call it with `t` inside a scene, or put it in OVERLAYS), `bubble(...)`.
- Drawing blocks: `rr(x, y, w, h, r)` rounded-rect path, `line`, `dot`, `ring`, `glow`, `strokePoly(points, p, {color, w})` (partial polyline, returns the head), `polyLen`.

## 7. Map scenes (real satellite)
```js
SAT_SCENES.map = { a: s1a, b: s1b + 0.6, veil: 'top', keys: [[0, lon, lat, zoom], [1.5, lon, lat, zoom], [dur, lon, lat, zoom]] };   // seconds into the scene
add({ id: 'map', kind: 'sat', a: s1a, b: s1b, cfg: {
  outlines: [{ key: 'yas', t0, t1 }],                           // OUTLINES.key from outlines.json (scripts/outline_from_osm.py)
  pins: [{ lon, lat, t, title: 'OHANA', sub: 'YAS CANAL · YAS ISLAND' }],
  top(t, cam) { bw(...); } } });                                 // text over the map (top 330-560 is dark enough)
```
- Zoom 12.5 = whole island + surroundings, 13.5 = district, 14.3 = plot level. End the flight centred on the pin (the camera centre is y 880; the pin label sits 40 px below the pin, so keep other pins >= 150 px away).
- A second pin is fine for orientation (Ferrari World), never three. Esri credit is drawn at y 1440 automatically.
- Positions you do not have coordinates for: do not pin them (say so to the user); indicative pins must be flagged in the hand-over.
- Known places: Yas Island site `[54.6220, 24.4720]`, Ferrari World `[54.6074, 24.4837]`, Yas Marina Circuit `[54.6031, 24.4672]`, Reem Island `[54.4098, 24.4875]`, Al Maryah `[54.3908, 24.5018]`.
- `node export_cues.mjs && node fetch_tiles.mjs` after any camera change (tiles are keyed by the camera path).

## 8. Face beat and overlays
- The face is drawn by main.js from `build/footage/f_%05d.jpg`; it fades in/out over 0.4 s at the `FACE_SEGS` edges, with a slow push (1.05 -> 1.13) and punches.
- `ovHook([[text, time, style], ...], {out, size, y})` title words that slam in as he says them. style `'box'` gold box + black text, `'ivory'` ivory box + black text, `'gold'`/`'ink'` plain with a shadow. **Use boxes** - his background is often a light wall and plain text disappears. Place the block above his head (y 330-560).
- `ovStamp(...)` as an overlay: a rotated gold-outlined stamp ("ANOTHER 2008?", "OUTDATED").

## 9. Chat CTA (last scene)
`sceneChat(t, {head, sub, show, typeA, typeB, send, msg, reply, ph})` (`ph` = field placeholder, e.g. `'Add a comment…'` when the call to action is "write X in the comments"; default `'Message…'`): headline ("Price list?"), a message field where `msg` is typed from `typeA` to `typeB`, sent at `send`, answered with `reply`. Type the keyword while he says it; `send` = when he finishes; the end card (the `extra` seconds of make_timeline) shows the answer.

## 10. Sound cues
`cues.push({k: 'wh', t, d: 0.4, g: 0.04, up: true})` whoosh (an element sweeping in); `{k: 'stamp', t}`, `{k: 'pin', t}`, `{k: 'send', t}`; `cut` is added by `add()` at every scene start. 20-35 cues per reel is about right. They are synthesised air sweeps at about -48 dBFS: do not try to make them louder.

## 11. Low-level contract of a frame (main.js `draw(t)`)
background + dust -> scenes (alpha = 1 - faceness) -> face beat (if any) -> OVERLAYS -> cut sweep -> captions -> grain -> fade from/to black at 0 s and DUR. Rendering `window.draw(t)` twice for the same t gives the same pixels (no state), so stills and the full render match.

## 12. Recipes
- **Real article with proof**: card `fy: 0` + `focus` on the headline (t0 = enter+0.6) + `hl` on the key words at the moment they are spoken + a second `focus` onto the paragraph line ~0.3 s before it is said.
- **Number then context**: bigNumber at the figure's word, `bw` unit line at the unit's word, source chip on the card above.
- **Compare**: barRow(ours, gold) first, barRow(other) at its word, dashed ghost for the gap, `bw('25% CHEAPER', hl: true)` on the claim.
- **Scarcity**: card + `ovStamp('RARE', t, 1e9)` called inside the scene, then two lines of `bw`.
- **Payment plan**: a line drawn with `strokePoly`, one gold dot per instalment popping with `E.back`, a larger gold dot with a house icon at the end, `bw` for "THE REST AT HANDOVER" and a gold-box year.
See the three finished scenes.js files in `examples/` for full working versions.
