# JB Always Fresh — design guide

The look: a quiet, premium barbershop. **Light page, black ink, gold details.**

## Colors (`src/components/theme.ts`)

| Token | Use it for | Never |
| --- | --- | --- |
| `bg` #FAF8F4 | Page background | — |
| `card` #FFFFFF | Cards, sheets | — |
| `surface` #F3EFE7 | Inputs, chips, quiet tiles | Big colored blocks |
| `ink` #111111 | Text, primary buttons, dark banners, selected chips | — |
| `gold` #C5A253 | Icons, stars, selected marks, text **on black** | Large fills, body text on light |
| `goldDeep` #8E6E2A | Gold text/links **on light** backgrounds | — |
| `goldSoft` #F4ECDA | Small tags, avatar fallbacks | Whole sections |

Rules:
- Gold is a detail color. If more than ~5% of a screen is gold, pull it back.
- One primary (black) button per screen, usually in the sticky footer.
- No rainbow tints and no decorative emoji — use gold Ionicons on `surface` or `goldSoft` circles. (Country flags are content and are fine.)
- Reels are the exception: full-bleed black video with white text and a gold "Book" button.

## Type

- `display` / `title` → Playfair Display (serif) for page headings only.
- Everything else → Inter. Body 15, captions 13, small 12.

## Shape & spacing

- 20px page padding, 24px between sections, 12px between cards.
- Radius 18 for cards and tiles, pills fully rounded.
- Soft shadow on white cards only; flat `surface` elsewhere.
