# HAVA

Website for **HAVA**, still and sparkling water from Sweden. *The essence of Sweden.*

A cinematic, multi-page site in plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or put the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | **Home.** Opens on the waterfall photo with HAVA either side of the falls and "Water from Sweden" below. Then the HAVA film, the collection, the nine flavours in a row, and the source. |
| `products.html` | HAVA Still (1000, 700 and 500 ml), HAVA Sparkling (700 ml) and every size on the flat-lay. |
| `flavours.html` | The flavour film, then one full screen per flavour: each can wipes up over the last as you scroll, with the list of names alongside. Then all nine as tiles and an order button. |
| `source.html` | The source: why Sweden, in numbers (lakes, forest, bedrock, world ranking), then "From sky to bottle" in five short chapters, with the sources listed at the end. |
| `story.html` | Our story: the idea behind HAVA, with the bottle by the pool, under water and in the stone room. |
| `contact.html` | The contact form. Links like `contact.html#cans` preselect what the visitor is asking about. |

| Folder | What it is |
| --- | --- |
| `css/site.css` | All styles. Colours, fonts and spacing are tokens at the top. |
| `js/i18n.js` | All the copy in English, Arabic, Swedish, French, Turkish, Chinese and German. |
| `js/site.js` | Header, menu, footer, language switch, film grain and the chapter pictures on The source (shared by every page). |
| `js/motion.js` | Smooth scrolling, the curtain between pages, headlines that rise word by word and photos that drift (shared by every page). |
| `js/vendor/lenis.min.js` | [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 for smooth scrolling (MIT licence in `js/vendor/LENIS-LICENSE.txt`). Kept in the repo, so the site needs no CDN. |
| `js/film.js` | The home film. |
| `js/flavours.js` | The flavour film, the full-screen flavours and the row of flavour tiles on Home. |
| `js/contact.js` | The contact form. |
| `assets/` | HAVA photos: the bottle and can shots, the waterfall, pool, under-water and stone-room photos, and the nine flavour photos in `assets/flavours/`. |
| `media/` | The two films, each in 1080p and a lighter 720p for phones. |

## Design

- **Colour:** taken from the waterfall photo. Moss-dark green and river teal for the page, pale mist for the product sections, and the brushed gold of the cap for labels and buttons.
- **Type:** Archivo for everything, wide and extra-bold in capitals for headlines, plain for reading. Bodoni Moda italic only as a gold accent (as in "HAVA *Still*").
- **Layout:** one grid. Every section opens the same way (small gold label, big headline, short text) and every edge lines up with the logo.

## The films

- Both films play silently. The files carry no sound track.
- **Home film** (`media/hava-film-1080.mp4`, phones get `-720`): an 8-second cut of the HAVA ad (`C0825.mp4`) with only the product shots. The shots with the tennis player and Nike clothing are left out until the rights to show them are confirmed. It plays when you scroll to it, tilts back in 3D as you scroll on, and pauses when it's off screen.
- **Flavour film** (`media/flavours-film-1080.mp4`, phones get `-720`): the 25-second flavour ad, on a loop at the top of the Flavours page.
- To change a film, put the new file in `media/` and change the paths at the top of `js/film.js` or in `js/flavours.js`.

## The facts on The source

Every number on `source.html` comes from a public source, listed at the bottom of the page:

- Nearly 100,000 lakes larger than one hectare: SMHI.
- Around 69% of the land is forest: Swedish National Forest Inventory, via Statistics Sweden.
- Most of the bedrock is 1.65 to 2 billion years old: Geological Survey of Sweden (SGU).
- Top 10 in the world for safe drinking water and sanitation (10th, score 98.5): Yale Environmental Performance Index 2024.
- About half of Sweden's drinking water is groundwater, much of it from eskers: Hydrology and Earth System Sciences.
- Drinking water is regulated as a food: Swedish Food Agency, LIVSFS 2022:12.

These are facts about Sweden. The page doesn't name a spring or make claims about HAVA's own analysis. Add those (and a lab report) once you have them.

## Languages

The globe button (or the menu on phones) and the footer switch between the seven languages. Arabic switches the whole site to right-to-left. The choice is remembered on that device, and `?lang=ar` (or `sv`, `fr`, `tr`, `zh`, `de`) on any page opens it in a language directly. To change any text, edit `js/i18n.js`. Every language has the same keys, and anything missing falls back to English.

## To do before going live

- **The full film:** the complete 30-second ad can replace the cut once the rights to show the player and the Nike clothing are confirmed.
- **Flavour descriptions:** the one-line descriptions of the nine flavours are proposals. Change them in `js/i18n.js` (`fl.*`).
- **Contact form:** it shows a thank-you message but sends nothing yet. Set `ORDER_ENDPOINT` in `js/contact.js` to a form service URL (for example Formspree) and messages are posted there as JSON, including the visitor's language.
- **Contact details:** add an email address, phone number and Instagram link to the footer (in `js/site.js`) once they're confirmed.
