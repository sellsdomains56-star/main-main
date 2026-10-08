# Hava

Website for **Hava**, water from Sweden. *Rent, kallt, klart* (pure, cold, clear).

It is one self-contained page, [`index.html`](index.html), with no build step. Open it in a browser, or drop the `hava/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## What's on the page

- **Hero:** the bottle in front of a giant HAVA wordmark that settles like water when the page loads and ripples again when you tap it.
- **The source:** a drawn Swedish lake at midsummer night, with facts about Swedish lakes and bedrock.
- **The bottles:** Still 500 ml, Sparkling 500 ml (with rising bubbles) and Glass 750 ml. "Order this" picks that bottle in the order form.
- **The water:** three promises (Rent, Kallt, Klart) and a back label with the mineral analysis.
- **Order:** a request form for homes, offices, restaurants, hotels and shops.

## To do before going live

- **Bottle photo:** the bottle is a drawing for now (the `<symbol id="bottle">` near the top of `index.html`). Swap in a real photo of the bottle, ideally on a transparent background.
- **Mineral analysis:** the values on the back label are **examples**. Replace them with the lab analysis for the source, then remove the "Exempelvärden" stamp and "(sample values)" from the caption.
- **Products and copy:** the three bottles, sizes, "nothing added", "PANT" on the label and the serving temperature are first-draft choices. Change them to match the real range.
- **Order form:** it shows a thank-you message but doesn't send anything yet. Set `ORDER_ENDPOINT` in the script at the bottom of `index.html` to a form service URL (for example Formspree) and requests will be posted there as JSON.
- **Contact and social:** add an email address, phone number and Instagram link to the footer once they exist.
