# HAVA

Website for **HAVA**, still and sparkling water from Sweden. *The essence of Sweden.*

Plain HTML, CSS and JavaScript with no build step: open `index.html` in a browser, or put the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

| File | What it is |
| --- | --- |
| `index.html` | The page: layout, styles and scripts. |
| `i18n.js` | All the copy in English, Arabic, Swedish, French, Turkish, Chinese and German. |
| `assets/` | Photos and line artwork cropped from the HAVA brand book (`water_final_.pdf`). |
| `media/` | The scroll film goes here (see below). |

## Languages

The globe button in the header and the list in the footer switch between the seven languages. Arabic switches the whole page to right-to-left. The choice is remembered on that device, and `index.html?lang=ar` (or `sv`, `fr`, `tr`, `zh`, `de`) opens the site in a language directly. To change any text, edit it in `i18n.js`. Every language has the same keys, and anything missing falls back to English.

## Sections

1. **Hero:** the underwater bottle and "The essence of Sweden.", after the website mockup in the brand book.
2. **Scroll film:** a full-screen film that plays as you scroll. It tilts in like a 3D card, lies flat while it plays and tilts away at the end. Until the video is added, four brand photos stand in.
3. **The water:** short introduction and three promises.
4. **The collection:** the flat-lay photo with numbered bottles (Still 1000 ml, Still 700 ml, Sparkling 700 ml, Still 500 ml) and cards for Still, Sparkling and the cans.
5. **Flavours:** a 3D can you can drag to turn, in five sparkling flavours: Lingon (lingonberry), Hjortron (cloudberry), Fläder (elderflower), Blåbär (wild blueberry) and Gurka & mynta (cucumber & mint).
6. **Our story**, **Hotels & restaurants**, **Contact** and the footer.

## The scroll film

- **Try any video now:** in the film section, press **Load your video** (or drag a file onto it). Any size works because the file never leaves the device. It only plays in that browser and is gone after a reload.
- **Sound:** **Play with sound** plays the film at normal speed and scrolls the page along with it. Scrolling or swiping stops it. **Sound on** lets the film play with sound at the speed you scroll, and it pauses when you stop.
- **Make it permanent:** save the video as `media/hava-film.mp4` and set `SCROLL_VIDEO = 'media/hava-film.mp4'` near the top of the script in `index.html`. The load button then disappears for visitors.
- **Encode for smooth scrolling:** a scroll film needs frequent keyframes, or it jumps when scrubbed. This command makes a 1080p MP4 that scrubs smoothly and keeps the sound:

  ```sh
  ffmpeg -i original.mov -vf "scale=-2:1080" -c:v libx264 -preset slow -crf 24 -g 6 -keyint_min 6 \
    -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart media/hava-film.mp4
  ```

  The film section gets longer for longer videos (about 30% of a screen height per second, between 4 and 24 screens).

## To do before going live

- **Scroll film:** add the HAVA video as described above.
- **Flavours:** the five flavours, their colours and descriptions are proposals. The cans are drawn by the page, so a change of name or colour is a one-line edit in the `FLAVOURS` list in `index.html`.
- **Contact form:** it shows a thank-you message but sends nothing yet. Set `ORDER_ENDPOINT` in `index.html` to a form service URL (for example Formspree) and messages are posted there as JSON, including the visitor's language.
- **Contact details:** add an email address, phone number and Instagram link to the footer once they're confirmed.
