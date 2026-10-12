# Real material: pictures, pages, posts, maps

The look depends on **real** things on screen: the actual news article with the line marked, the actual post, the actual project picture, the actual satellite view. The user asked for this explicitly ("take a screenshot of the post", "show the article news and animate that", "use pictures from anywhere you need"). Never fabricate or mock up a post, article, quote or logo.

## What to capture per beat
| Beat | Material | How |
|---|---|---|
| news peg / proof | the article page (headline + the paragraph that carries the claim) | full-page screenshot, >= 2160 px wide, `shot.mjs --full` |
| an official statement | the government / company page or its press release | same; prefer the primary source over a re-write |
| a person's post | the public post page (Truth Social via a public mirror such as trumpstruth.org when the site blocks bots; X/Twitter embeds) | screenshot of the post card only |
| a person | official portrait; public-domain or CC licence with credit (Wikimedia Commons), as a round badge | `badge()` |
| project / product | the developer's brochure pages (the user usually has the PDF), renderings | export pages to JPG 1900 px wide (`pdftoppm -jpeg -r 150`), pick the pretty ones, avoid pages with another brand's logo unless that is the subject |
| a place | real satellite imagery (Esri World Imagery, flown by the engine) + OSM outline | `fetch_tiles.mjs`, `outline_from_osm.py` |
| a logo | official SVG/PNG on transparent background | `pic()` pop |

## Tools
- `node shot.mjs <url> <out.png> [--w 1080] [--h 1700] [--wait 4000] [--full] [--dpr 2]` - Playwright screenshot through the session proxy (`HTTPS_PROXY`), dismisses common cookie banners. Run captures **one at a time**: parallel Chromium launches hang when the CPU is busy. Check each result visually (blank pages and consent walls happen).
- `python3 -I textlines.py <img> <y0> <y1> [x0 x1] [gap]` - prints text line bands and word boxes in a screenshot, so highlight boxes (`hl.bbox = [x, y, w, h]` in image pixels) and focus windows are exact. Workflow: crop the region to look at it, run textlines on that y-range, take the word boxes you need (`gap` 6-8 splits words, 12-14 splits phrases), and add a few px of padding (the card code pads 8 px).
- Ask a subagent to collect assets in parallel when there are > 6 of them: give it the beat list, the output folder, and ask for an `assets.json` manifest (file, URL, date retrieved, licence/credit). Review what comes back yourself - subagents return confident wrong pages (old versions, other articles, consent walls).

## Quality rules
- Resolution: article captures >= 2160 px wide so the glide-and-zoom stays sharp; brochure pictures >= 1900 px wide.
- A highlight must sit on the words being said at that moment. A mis-placed marker is the first thing viewers notice.
- Prefer the page's own date and publisher visible in the capture; the card `chip` says `PUBLISHER · DATE` (short!).
- Currency/period of any figure shown must match the voice: say the unit in the script or on screen.
- If a capture is not possible (blocked site, video-only source), say so and ask the user for the file or use another source; YouTube downloads and Wikimedia bulk API calls were blocked/rate-limited in the sandbox.

## Licences, credits, publishing
- Third-party material is **not committed** to the repo (`assets/` is git-ignored); the README lists URL, date and licence/credit for each item, e.g. portrait: author, licence (CC BY requires credit), cropped.
- Esri credit stays on screen over every satellite beat; OSM-derived outlines (ODbL) are credited in the README.
- Brochure renderings belong to the developer; the user usually has the right to use them - mention the source in the hand-over so they can confirm.
- No private individuals; public figures only through their official/public material and only in the context of what they said or did.
- Do not alter the content of a capture other than cropping/zooming and marker highlights.
