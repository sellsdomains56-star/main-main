# IRON HORIZON — browser tactical shooter

Team deathmatch, 5 vs 5, against AI bots. Plain WebGL (Three.js), no install.

## Play
Double-click **`IronHorizon.html`** (Chrome / Edge recommended), press **DEPLOY**.
Or serve the folder (`python3 -m http.server`) and open `index.html`.

## Modes
- **Battle Royale** (default): 40 players. Jump from the plane, parachute in, loot weapons, stay inside the shrinking zone, last one standing wins.
- **Team Deathmatch**: 5 vs 5 on the Burj Khalifa plaza, first to 40.

## Controls
| Key | Action |
|---|---|
| W A S D | Move / steer while falling |
| Mouse | Look |
| F or left click | Fire (F also jumps from the plane) |
| E (toggle) or right click (hold) | Aim down sights |
| V | First person / third person |
| Shift / Space / C | Sprint / Jump or open parachute / Crouch |
| R / G / H | Reload / Grenade / Use medkit |
| 1–5, wheel, Q | Weapons, last weapon |
| Tab / Esc | Scoreboard / Pause |
| F3 / M | FPS counter / mute |

## Notes
- Aims for 60 FPS; resolution scales automatically if your laptop falls behind. "Performance" in the menu turns off shadows.
- Bots path-find, hear gunfire, flank, strafe, retreat when hurt and throw grenades. Pick RECRUIT / REGULAR / VETERAN.
- Source is in `js/`. After editing, rebuild the single file with
  `npx esbuild js/main.js --bundle --minify --format=iife` and inline the output into `index.html`.

## Map and asset credits
- **Map:** Downtown Dubai, Burj Khalifa plaza. The Burj Khalifa footprint and neighbouring landmark outlines are real OpenStreetMap geometry (© OpenStreetMap contributors, ODbL). Building heights are approximate.
- **Soldier:** `Soldier.glb` from the three.js examples (Mixamo character).
- **Bolt-action rifle, service pistol, stick grenade, crate, barrel, road barrier, all PBR textures:** Poly Haven (CC0).
- **M4A1:** "Low-Poly M4A1" by MallNinjaMax, OpenGameArt (CC0).
- **SMG and shotgun:** Quaternius Ultimate Gun Pack (CC0), via OpenGameArt.

Rebuild after editing: `python3 build.py path/to/esbuild` (writes `IronHorizon.html` and `dist/game.js`).
