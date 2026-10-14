# Product photo re-render (Nano Banana Pro, 2K)

Every product photo on wepink Brasil's site, re-shot as a bright, luxury,
easy-to-see product photo: the same product, box and camera angle as theirs, on
a better set. A product with 5 photos there gets 5 here (some have 6–9).

- **Model:** Nano Banana Pro on Higgsfield, **2K**, 4:5 portrait (matches the
  store's product frames). 2 credits per photo.
- **Inputs per photo:** (1) wepink Brasil's original photo at 2000 px (the VTEX
  URL from `catalog.js` `remote`, with `-800-800` changed to `-2000-2000`), which
  is the product to keep exactly, and (2) the style reference for its set
  (below).
- **Skip** wepink Brasil's photos that show people (e.g. the Beauty Base
  before/after shots); keep only product photos.
- **Sample first:** `sample.json`: Obsessed Eau de Cologne (5 photos, red set)
  and My Lips Gloss Cherry (5 photos, makeup set), 10 photos, 20 credits. The
  client approves the sample before the rest is made.
- **Full run:** 1,890 source photos, about **3,780 credits** at 2K (a little
  less once photos with people are skipped). Allow about 5–8% more for re-dos.
  The account had 9,010 credits on 14 Oct 2026.

## Sets: the four references the client was shown

Matched to each product's colour.

| Set | Use for | Reference (Pinterest) |
|---|---|---|
| `red` | red / black lines (Obsessed, Fatal Rouge, Red, Scarlette…) | https://www.pinterest.com/pin/11329436559922586/ (https://i.pinimg.com/originals/61/04/52/610452568fc348e3b51b7e69108468c0.jpg) |
| `pink` | pink lines and body splashes (Heaven Pink, Obsessed Lovely…) | https://www.pinterest.com/pin/1074953004814634259/ (https://i.pinimg.com/originals/bd/4b/d7/bd4bd739259d7748dc5ff5a46ed5f4b3.png) |
| `gold` | gold, amber, nude and men's lines (VF Golden, Liberté, King Blue…) | https://www.pinterest.com/pin/956944620842739263/ (https://i.pinimg.com/originals/99/83/74/998374c323c4776d73a2eda9476954e5.jpg) |
| `makeup` | makeup | https://www.pinterest.com/pin/1106267095985004881/ (https://i.pinimg.com/originals/99/6e/35/996e35bde3f2f037d33e0f53bb849d44.png) |

## Prompt

Image 1 is the wepink photo; image 2 is the set reference. `{set}` is one of the
lines below.

> Image 1 shows the exact wepink product (and its box, if present) to photograph. Image 2 is only a reference for the set, light and mood: do not copy its product, box or any of its text. Re-photograph image 1 as a premium, luxury e-commerce product photo. Keep the product, cap, pump, box, logo, every word of the label and box text, the colours, materials and proportions exactly as in image 1, and keep the same camera angle and arrangement (the same objects in the same positions: with box, alone, lying down, cap off or box only, as in image 1). Do not add or remove products, and do not change, translate or invent any text. Set: {set}. Bright, soft, even studio daylight with a gentle natural shadow and a subtle reflection; the product fully visible, sharp and readable, centred, about 70% of the frame height, with comfortable margins. True-to-life colours, photorealistic, high-end beauty advertising quality. 4:5 vertical.

- **red:** a warm cream floor and a soft blush-to-rose seamless backdrop, a glossy surface with a faint reflection, one or two folded red silk accents far in the background; bright, never dark.
- **pink:** a glossy pink acrylic surface with a mirror reflection, a soft rose wall with gentle diagonal window light.
- **gold:** a travertine plinth with soft gold veining, a warm champagne plaster backdrop, soft natural sun.
- **makeup:** pink geometric plinths and a small clear glass sphere on a hot-pink-to-blush seamless backdrop, crisp studio light.

## On the site

Each product page shows all of its new photos in wepink Brasil's order; shop
cards show the first one (usually the product with its box) and the second on
hover. They replace the two AI scene photos per product (`product-images/hero/`
in Supabase Storage).
