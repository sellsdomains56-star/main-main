# HAVA

Website for **HAVA**, still and sparkling water from Sweden. *The essence of Sweden.*

A cinematic, multi-page site in plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or put the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | **Home.** A full-screen 3D scroll film with sound, then four chapters that open the other pages. |
| `collection.html` | The bottles: Still (1000, 700 and 500 ml), Sparkling (700 ml) and the 330 ml can, with the numbered flat-lay. |
| `flavours.html` | One big can on a dark stage that you drag to turn, in five sparkling flavours. |
| `story.html` | Born of Swedish bedrock: the lake, the forest, the falls and what makes the water. |
| `hotels.html` | Hotels and restaurants: the crate of six, the gift box and turndown service. |
| `contact.html` | The contact form. Links like `contact.html#cans` preselect what the visitor is asking about. |

| Folder | What it is |
| --- | --- |
| `css/site.css` | All styles. Colours, fonts and spacing are tokens at the top. |
| `js/i18n.js` | All the copy in English, Arabic, Swedish, French, Turkish, Chinese and German. |
| `js/site.js` | Header, full-screen menu, footer, language switch, film grain and scroll reveals (shared by every page). |
| `js/motion.js` | The cinematic layer (shared by every page, see below). |
| `js/vendor/lenis.min.js` | [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 for smooth scrolling (MIT licence in `js/vendor/LENIS-LICENSE.txt`). Kept in the repo, so the site needs no CDN. |
| `js/film.js` | The home film. |
| `js/cans.js`, `js/flavours.js` | The 3D flavour cans and the Flavours page. |
| `js/contact.js` | The contact form. |
| `assets/` | Photos and line artwork cropped from the HAVA brand book (`water_final_.pdf`). |
| `media/` | The film goes here (see below). |

## The cinematic layer

`js/motion.js` adds the same feel to every page:

- **Opening:** on the first page of a visit, the HAVA logo draws itself in white and gold over a counter, then the frame opens like a letterbox.
- **Page changes:** a black curtain with the gold mark wipes up between pages and lifts on the next one.
- **Scrolling:** smooth, weighted scrolling (Lenis), so the film and photos glide instead of jumping. Touch screens keep their native scrolling.
- **Headlines:** big titles rise into view word by word.
- **Photos:** page openers and framed photos drift slower than the page.
- **Type band:** a band of giant "The essence of Sweden." on the home page runs with your scroll, faster when you scroll faster.
- **Cursor (mouse only):** a gold ring that grows over links and shows a label over the film ("Scroll"), the chapters ("Explore") and the flavour can ("Drag"). Buttons lean toward the pointer.

Visitors who ask their device for reduced motion get the site without any of this.

## Languages

The globe button (or the menu on phones) and the footer switch between the seven languages. Arabic switches the whole site to right-to-left. The choice is remembered on that device, and `?lang=ar` (or `sv`, `fr`, `tr`, `zh`, `de`) on any page opens it in a language directly. To change any text, edit `js/i18n.js`. Every language has the same keys, and anything missing falls back to English.

## The home film

- **What it does:** the HAVA letters fly past the camera, the letterbox bars open and the film plays as you scroll, with captions. At the end the frame tilts away in 3D into the chapters.
- **Sound:** **Play with sound** plays the film at normal speed with sound and scrolls the page along with it. Scrolling or swiping stops it. The **Sound** button lets the film play with sound at the speed you scroll.
- **Try a video now:** press **Load your video** on the home page, or drag a file onto the film. Any size works because the file never leaves the device. It only plays in that browser and is gone after a reload.
- **The film on the site now:** `media/hava-film-1080.mp4` (phones get `media/hava-film-720.mp4`), set in `SCROLL_VIDEO` at the top of `js/film.js`. It's an 8-second cut of the HAVA ad (`C0825.mp4`) with only the product shots: the ball, the court, the gold H, the cap, the water, the bottle and the "Own the moment" end card. The shots with the tennis player and Nike clothing are left out until the rights to show them are confirmed.
- **Swapping the film:** put the new file in `media/` and change the two paths in `SCROLL_VIDEO`. Set them to `''` to show the photos and the **Load your video** button instead.
- **Encode for smooth scrolling:** a scroll film needs frequent keyframes, or it jumps when scrubbed. This makes a 1080p MP4 that scrubs smoothly and keeps the sound:

  ```sh
  ffmpeg -i original.mov -vf "scale=-2:1080" -c:v libx264 -preset slow -crf 24 -g 6 -keyint_min 6 \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart media/hava-film.mp4
  ```

  The film gets a longer scroll for longer videos (about 30% of a screen height per second, between 4.2 and 24 screens).

## To do before going live

- **The full film:** the complete 30-second ad can replace the cut once the rights to show the player and the Nike clothing are confirmed.
- **Flavours:** the five flavours, their colours and descriptions are proposals. The cans are drawn by the page, so a change of name or colour is a one-line edit in the `FLAVOURS` list in `js/cans.js`.
- **Contact form:** it shows a thank-you message but sends nothing yet. Set `ORDER_ENDPOINT` in `js/contact.js` to a form service URL (for example Formspree) and messages are posted there as JSON, including the visitor's language.
- **Contact details:** add an email address, phone number and Instagram link to the footer (in `js/site.js`) once they're confirmed.
