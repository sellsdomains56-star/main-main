# HAVA

Website for **HAVA**, still and sparkling water from Sweden. *The essence of Sweden.*

A cinematic, multi-page site in plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or put the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | **Home.** The HAVA film fills the first screen and plays with its sound, under "HAVA, Water from Sweden". Then the introduction, the products, the five flavours, the story and hotels. |
| `products.html` | HAVA Still (1000, 700 and 500 ml), HAVA Sparkling (700 ml), the five sparkling flavours on a 3D can you can drag to turn, and every size on the flat-lay. |
| `story.html` | Our story: the lake, the forest, the falls and what makes the water. |
| `hotels.html` | Hotels and restaurants: the crate of six, the gift box and turndown service. |
| `contact.html` | The contact form. Links like `contact.html#cans` preselect what the visitor is asking about. |

| Folder | What it is |
| --- | --- |
| `css/site.css` | All styles. Colours, fonts and spacing are tokens at the top. |
| `js/i18n.js` | All the copy in English, Arabic, Swedish, French, Turkish, Chinese and German. |
| `js/site.js` | Header, menu, footer, language switch and film grain (shared by every page). |
| `js/motion.js` | Smooth scrolling, the curtain between pages, headlines that rise word by word and photos that drift (shared by every page). |
| `js/vendor/lenis.min.js` | [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 for smooth scrolling (MIT licence in `js/vendor/LENIS-LICENSE.txt`). Kept in the repo, so the site needs no CDN. |
| `js/film.js` | The home film. |
| `js/cans.js`, `js/flavours.js` | The 3D flavour cans. |
| `js/contact.js` | The contact form. |
| `assets/` | Photos and line artwork cropped from the HAVA brand book (`water_final_.pdf`). |
| `media/` | The film. |

## Design

- **Type:** Archivo for everything, wide and extra-bold in capitals for headlines, plain for reading. Bodoni Moda italic only as a gold accent (as in "HAVA *Still*").
- **Colour:** the brand book palette. Deep Water and near-black for the film, story and hotels; Fog for the products, so the product photos sit on a matching light ground; brushed gold for labels and buttons.
- **Layout:** one grid. Every section opens the same way (small gold label, big headline, short text) and every edge lines up with the logo.

## The home film

- The film (`media/hava-film-1080.mp4`, phones get `media/hava-film-720.mp4`) starts by itself, with sound. Browsers only allow sound after a visitor has clicked, tapped or pressed a key on the site, so if a browser refuses, the film plays silently with a small "Click or tap for sound" note, and the first click or tap starts it again from the beginning with sound.
- "HAVA, Water from Sweden" shows over the start and fades after a few seconds, leaving the screen to the film.
- As you scroll on, the film tilts back in 3D and dims into the page. It pauses when it's off screen and carries on when you come back. Click it after it ends to watch it again.
- The film is an 8-second cut of the HAVA ad (`C0825.mp4`) with only the product shots. The shots with the tennis player and Nike clothing are left out until the rights to show them are confirmed.
- To change the film, put the new file in `media/` and change the two paths at the top of `js/film.js`.

## Languages

The globe button (or the menu on phones) and the footer switch between the seven languages. Arabic switches the whole site to right-to-left. The choice is remembered on that device, and `?lang=ar` (or `sv`, `fr`, `tr`, `zh`, `de`) on any page opens it in a language directly. To change any text, edit `js/i18n.js`. Every language has the same keys, and anything missing falls back to English.

## To do before going live

- **The full film:** the complete 30-second ad can replace the cut once the rights to show the player and the Nike clothing are confirmed.
- **Flavours:** the five flavours, their colours and descriptions are proposals. The cans are drawn by the page, so a change of name or colour is a one-line edit in the `FLAVOURS` list in `js/cans.js`.
- **Contact form:** it shows a thank-you message but sends nothing yet. Set `ORDER_ENDPOINT` in `js/contact.js` to a form service URL (for example Formspree) and messages are posted there as JSON, including the visitor's language.
- **Contact details:** add an email address, phone number and Instagram link to the footer (in `js/site.js`) once they're confirmed.
