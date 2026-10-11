# Manchester City Yas Residences by Ohana — reel

Vertical reel (1080×1920, 30 fps) in the brochure's visual style (Man City sky blue / white, Barlow Condensed caps).
His real on-camera hook and closer frame a cloned-voice narration; everything on screen is generated from code.

## Script
| Part | Voice | Line |
|---|---|---|
| Hook | real footage | Why did investors put six billion into this project in just seventy-two hours? |
| S1 | cloned | Because this is Manchester City Yas Residences, by Ohana. |
| S2 | cloned | The world's first Manchester City inspired residential destination, right on Yas Canal. |
| S3 | cloned | You're minutes from Ferrari World and Yas Marina Circuit, and the airport is ten to fifteen minutes away. |
| S4 | cloned | Townhouses, duplexes and villas, from two to five bedrooms, across one hundred and seventy hectares. |
| S5 | cloned | More than half of it is open space, with a crystal lagoon, a Manchester City training academy, and a canal promenade. |
| P1 | cloned | Price per square foot starts at just 1,852 dirhams, which is 25% below the latest Orchids townhouses. |
| P2 | cloned | That's even below the average Yas luxury apartment, for the first Manchester City-branded waterfront project. |
| P3 | cloned | And family townhouses at this level are scarce across recent Abu Dhabi launches. |
| S6 | cloned | That is what the investors saw. |
| Closer | real footage | …and phase two is dropping now. |
| CTA | cloned | Comment CITY, and I will send you the phase two details. |

Voice cloning: F5-TTS from a reference clip of his own voice (his own footage only).

## Pipeline
`build_timeline.py` (lays out segments + word times → `timeline.json`) → `render.mjs` (frames from `reel.js`) → `audio.py`
(real audio + cloned lines + glitch SFX, no music) → ffmpeg encode (H.264/AAC, −14 LUFS). `matte_cam.py` cuts him out of the
on-camera frames. Brochure photos (`assets/`) and frame/matte caches (`build/`) are not committed.

Price section (P1–P3) comes from the Phase 2 investment study p.4 (AED per sq ft of built-up area; sources: Ohana Phase 2 price list, The Orchids / Metropolitan, Christie's H1 2026).
