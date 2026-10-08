# HAVA

Website for **HAVA**, still and sparkling water from Sweden. *The essence of Sweden.*

A cinematic, multi-page site in plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or put the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | **Home.** Opens on the waterfall film with HAVA either side of the falls and "Water from Sweden" below. Then the collection, the nine flavours in a row, and the source. |
| `products.html` | Opens on the "Own the moment" film as a 3D scroll: it fills the screen, then tilts back and dims as you scroll. Then the whole collection side by side, on ice: Still 1000, 700 and 500 ml, Sparkling 700 ml and the flavour cans. Then one full screen each for HAVA Still (the size buttons switch the bottle photo) and HAVA Sparkling, the nine flavours, and every size on the flat-lay. |
| `flavours.html` | The flavour film, then one full screen per flavour: each can wipes up over the last as you scroll, with the list of names alongside. Then all nine as tiles and an order button. |
| `source.html` | The source: why Sweden, in numbers (lakes, forest, bedrock, world ranking), then "From sky to bottle" in five short chapters, with the sources listed at the end. |
| `story.html` | Our story: the idea behind HAVA, with the bottle by the pool, under water and in the stone room. |
| `contact.html` | The contact form. Links like `contact.html#cans` preselect what the visitor is asking about. |

| Folder | What it is |
| --- | --- |
| `css/site.css` | All styles. Colours, fonts and spacing are tokens at the top. |
| `js/i18n.js` | All the copy in English, Arabic, Swedish, French, Turkish, Chinese and German. |
| `js/site.js` | Header, footer, language switch, film grain, the silent films, the Still size buttons and the chapter pictures on The source (shared by every page). |
| `js/motion.js` | Smooth scrolling, the curtain between pages, headlines that rise word by word and photos that drift (shared by every page). |
| `js/vendor/lenis.min.js` | [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 for smooth scrolling (MIT licence in `js/vendor/LENIS-LICENSE.txt`). Kept in the repo, so the site needs no CDN. |
| `js/film.js` | The 3D scroll film at the top of Products. |
| `js/flavours.js` | The flavour film, the full-screen flavours and the row of flavour tiles on Home. |
| `js/contact.js` | The contact form. |
| `assets/` | HAVA photos: the bottles on ice (`ice-*.webp`), the brand-book shots, the pool, under-water and stone-room photos, the film posters, and the nine flavour photos in `assets/flavours/`. |
| `media/` | The three films (waterfall, "Own the moment", flavours), each in 1080p and a lighter 720p for phones. |

## Design

- **Colour:** taken from the waterfall photo. Deep river blue for the page with moss green in the gradients, pale ice blue for the light sections, and the brushed gold of the cap for labels and buttons.
- **Type:** Archivo for everything, wide and extra-bold in capitals for headlines, plain for reading. Bodoni Moda italic only as a gold accent (as in "HAVA *Still*").
- **Layout:** one grid. Every section opens the same way (small gold label, big headline, short text) and every edge lines up with the logo.

## The films

- All films play silently and only while they're on screen. The files carry no sound track. If a browser or an in-app viewer blocks autoplay (an iPhone in Low Power Mode does), the film starts on the visitor's first tap.
- **Waterfall film** (`media/hero-waterfall-1080.mp4`, phones get `-720`): the 14-second loop behind the opening of Home. Until it starts, the opening is plain dark blue; there is no cover picture.
- **"Own the moment" film** (`media/hava-film-1080.mp4`, phones get `-720`), opening the Products page: a 10.5-second cut of the "Own the moment" ad (`C0825.mp4`): the hand on the racket, the ball, the court, the bottle close-ups and the end card. The shots of the player are left out: he looks like Rafael Nadal and wears Nike and his personal logo, so showing him on HAVA's site reads as an endorsement by both. Use the full ad only with signed agreements from them. The film plays when you scroll to it, tilts back in 3D as you scroll on, and pauses when it's off screen.
- **Flavour film** (`media/flavours-film-1080.mp4`, phones get `-720`): the 25-second flavour ad, on a loop at the top of the Flavours page.
- To change a film, put the new file in `media/` and change its path: the `data-src` of the video in the page (waterfall, Products film), the top of `js/film.js` (Products film) or `js/flavours.js` (flavour film).

## The facts on The source

Every number on `source.html` comes from a public source, listed at the bottom of the page:

- Nearly 100,000 lakes larger than one hectare: SMHI.
- Around 69% of the land is forest: Swedish National Forest Inventory, via Statistics Sweden.
- Most of the bedrock is 1.65 to 2 billion years old: Geological Survey of Sweden (SGU).
- Top 10 in the world for safe drinking water and sanitation (10th, score 98.5): Yale Environmental Performance Index 2024.
- About half of Sweden's drinking water is groundwater, much of it from eskers: Hydrology and Earth System Sciences.
- Drinking water is regulated as a food: Swedish Food Agency, LIVSFS 2022:12.

These are facts about Sweden. The page doesn't name a spring or make claims about HAVA's own analysis. Add those (and a lab report) once you have them.

## Publishing an update

Every page loads its styles, scripts and films with a version tag (`?v=13`). After changing any of those files, raise the number on every page (and in `js/film.js` and `js/flavours.js` for the films) so phones and browsers fetch the new files instead of an old copy.

## Menu and languages

The five pages are always listed side by side in the header; on phones and tablets they sit in a row under the logo. The globe button and the footer switch between the seven languages. Arabic switches the whole site to right-to-left. The choice is remembered on that device, and `?lang=ar` (or `sv`, `fr`, `tr`, `zh`, `de`) on any page opens it in a language directly. To change any text, edit `js/i18n.js`. Every language has the same keys, and anything missing falls back to English.

## To do before going live

- **Flavour descriptions:** the one-line descriptions of the nine flavours are proposals. Change them in `js/i18n.js` (`fl.*`).
- **"Natural flavours, no preservatives":** this is on the flavour pages because HAVA asked for it. Check it against the final ingredient list before launch, since food labelling rules require such claims to be accurate.
- **Contact form:** it shows a thank-you message but sends nothing yet. Set `ORDER_ENDPOINT` in `js/contact.js` to a form service URL (for example Formspree) and messages are posted there as JSON, including the visitor's language.
- **Contact details:** add an email address, phone number and Instagram link to the footer (in `js/site.js`) once they're confirmed.
