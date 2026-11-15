# IRON HORIZON — browser tactical shooter

Team deathmatch, 5 vs 5, against AI bots. Plain WebGL (Three.js), no install.

## Play
Double-click **`IronHorizon.html`** (Chrome / Edge recommended), press **DEPLOY**.
Or serve the folder (`python3 -m http.server`) and open `index.html`.

## Controls
| Key | Action |
|---|---|
| W A S D | Move |
| Mouse | Aim |
| Left click / Right click | Fire / Aim down sights |
| Shift / Space / C | Sprint / Jump / Crouch |
| R | Reload |
| G | Frag grenade |
| 1–5, wheel, Q | Weapons (carbine, SMG, shotgun, sniper, pistol), last weapon |
| Tab | Scoreboard |
| Esc | Pause |
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
- SMG and shotgun are still simple hand-built models.

Rebuild after editing: `python3 build.py path/to/esbuild` (writes `IronHorizon.html` and `dist/game.js`).
