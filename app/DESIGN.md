# JB Always Fresh — design guide

The look: a modern barbershop in print. **Warm off-white page, black type, black panels.** No accent colour — black is the accent.
Reference: the "Modern Barber" editorial site — monogram + spaced wordmark, a black pill "Book appointment" button with the arrow in a white circle, a numbered "01 — CONSULTATION" timeline, dark service tiles with uppercase labels, a huge tight headline, a big photo panel, and a rounded black side rail.

## Colors (`src/components/theme.ts`)

| Token | Use it for |
| --- | --- |
| `bg` #EEECE8 | Page |
| `card` #FFFFFF | Cards, sheets, inputs, footers |
| `surface` #E5E2DD | Chips, segmented tracks, quiet tiles |
| `border` #DAD6D0 | Hairline around cards and controls |
| `text` #0B0B0B · `muted` #5E5A55 · `faint` #97928C | Text, secondary text, icons/placeholders only |
| `accent` #0B0B0B / `onAccent` #FFFFFF | Primary buttons, selected chips and segments, radio dots, badges |
| `ink` #0B0B0B / `onInk` #F4F2EE / `inkMuted` / `inkLine` | Black panels: hero, service tiles, AI Try-On and shop banners, tab bar, reels |
| `gold` #C9A04A / `goldInk` #9A7114 | Gold, solid and rare: star ratings (`goldInk` on the light page, `gold` on dark), the "#1" badge, and the edge of the Black member card. No glows, no gold text blocks |

Rules:
- Two values do the work: off-white and black. Grey is for secondary text and hairlines only.
- Emphasis (`emphasis`, `Card highlighted`) is a crisp black edge: the active step, the selected option, the best match.
- On black panels use `onInk` text and the `light` button / `ArrowButton light`.
- No emoji as icons — Ionicons for UI, MaterialCommunityIcons for barber line art (scissors, razor, mustache…). Country flags are content and are fine.

## Type

Inter throughout. Headlines are **Inter Medium with tight tracking** (34px screens, 46–64px on Home); eyebrows are 11px uppercase semibold with wide tracking ("STEP 01", "SERVICES"); body 16px.

## Patterns

- **Navigation:** black tab bar on phones; on wide screens (web ≥1024px) the rounded black side rail with the monogram, tabs, vertical "Book now" and the avatar (`components/TabBar.tsx`).
- **Brand:** the thin-line JB monogram (`Monogram`, paths in `assets/brand/monogram.json`), `LogoLockup` (monogram with ALWAYS FRESH beneath), `Logo` (monogram in a black circle) in `components/Brand.tsx`. The app icon is generated from the same paths (`scripts/make-icons.mjs`). Black and white logo files for print, socials and partners are in `assets/brand/logo/` (`scripts/make-logos.mjs`): transparent PNGs, PNGs on white/black, and SVG monograms. The white logo closes the Home page on a black band.
- **Slide to book:** `SlideToConfirm` — black track, white knob; Home's "Book appointment" (with `resetAfter`) and confirming bookings, then the official Apple Pay / Google Pay "Book" button pays. On phones keep it clear of the floating concierge button.
- **Arrow CTA:** `ArrowButton` — black pill, arrow in a white circle (secondary calls to action).
- **Timeline:** `Timeline` — "01 — FIND YOUR BARBER" with dots on a thin line; the current step has the black dot.
- **Reels:** a 3-column grid (9:16 tiles, 2px gaps, view counts) under story circles; the full-screen viewer has Instagram's right rail (like, comment, share, save, ⋯), a thin progress line and dark bottom sheets (`ReelSheets.tsx`).
- **Cards you hold:** `MemberCard` (Club) and `GiftCardArt` are credit-card proportioned (1.586:1) with the monogram, wide-tracked uppercase labels and a slow light sweep; the member card tilts when dragged.
- **Barbershop page:** a photo header with the name over a dark gradient, then numbered action cards ("01 — Book a chair", "02 — Private hire", "03 — Delivery") that alternate dark and light, black and white only, with the arrow in a contrasting circle. Shop tiles on Home reuse the photo-with-gradient look.
- **Step flow:** `StepCard` + `StepConnector` (try-on, booking). Active step has the black edge, done steps a check, upcoming steps are dimmed.
- **Photography:** the hero carousel (with dots), service tiles and AI Try-On panel use the photos listed in `src/lib/brandMedia.ts`; tiles without a photo fall back to line art on black.

## Shape & spacing

20px page padding on phones (32px on desktop), 32px between sections, radius 20 on cards and 28–32 on panels, pills fully rounded, 44px minimum tap targets, visible black focus ring on the website.
