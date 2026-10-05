# JB Always Fresh — design guide

The look: a premium barbershop at night. **Black, charcoal cards, honey-gold light.**
References: a dark step-by-step flow with glowing connector lines (gold instead of orange), a glowing AI orb for the concierge, and an editorial barbershop site (numbered timeline, service tiles, pill button with an arrow).

## Colors (`src/components/theme.ts`)

| Token | Use it for |
| --- | --- |
| `bg` #0A0A0B | Page |
| `card` #141416 | Cards, sheets, footers, tab bar |
| `surface` #1B1B1E | Inputs, chips, option rows, quiet tiles |
| `border` #26262A | Hairline around every card and control |
| `text` #F4F1EA · `muted` #A49F96 · `faint` #6F6B64 | Text, secondary text, icons/placeholders only |
| `gold` #F2B53A | The accent: primary buttons, icons, stars, eyebrow labels, selected states, prices |
| `goldSoft`, `goldLine` | Tinted fills, glowing borders and connector lines |
| `onGold` #17110A | Text and icons on gold |

Rules:
- Gold is light, not paint: use it for edges, icons, labels and the one primary button. Large gold areas are reserved for the primary button, the "Ask JB" button and the user's chat bubbles.
- The **glow** (`glow`, `glowSmall`, `Card glowing`) marks the single most important thing on screen: the active step, the selected option, the best match.
- No emoji as icons — Ionicons in gold. Country flags are content and are fine.

## Type

Inter throughout. Big headings are **Inter Light** (34–40px, tight tracking); eyebrows are 11px uppercase semibold gold with wide tracking ("STEP 1", "SERVICES"); body 16px.

## Patterns

- **Step flow:** `StepCard` + `StepConnector` (try-on, booking). Active step glows, done steps show a gold check, upcoming steps are dimmed.
- **Options:** `OptionRow` (radio + label + icon), selected = gold edge and glow.
- **Hero CTA:** `ArrowButton` — gold pill with the arrow in a dark circle.
- **Timeline:** `Timeline` — "01 — FIND YOUR BARBER" with dots on a thin line.
- **Service tiles:** dark gradient tiles with an uppercase label; replace with real photography when available.

## Shape & spacing

20px page padding, 28px between sections, radius 20 on cards, pills fully rounded, 44px minimum tap targets, visible gold focus ring on the website.
