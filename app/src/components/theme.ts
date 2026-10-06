import { Platform } from "react-native";

// Off-white page, black ink, black panels — the "Modern Barber" look. See DESIGN.md before adding colors.
export const colors = {
  // Page & surfaces
  bg: "#EEECE8", // the page: warm off-white
  card: "#FFFFFF", // cards, sheets, bars
  surface: "#E5E2DD", // chips, quiet tiles, segmented tracks
  surfaceStrong: "#D5D1CB", // pressed surfaces, inactive dots
  border: "#DAD6D0", // hairline around cards and controls

  // Text
  text: "#0B0B0B",
  muted: "#5E5A55", // secondary text (≥6:1 on bg)
  faint: "#97928C", // icons, placeholders, disabled — never body text

  // Accent is black: primary buttons, selected states, active steps
  accent: "#0B0B0B",
  accentSoft: "rgba(11, 11, 11, 0.06)", // tinted fills
  accentLine: "#0B0B0B", // selected borders and connector lines
  onAccent: "#FFFFFF", // text and icons on black fills

  // Black panels (hero, service tiles, banners, tab bar)
  ink: "#0B0B0B",
  inkRaised: "#1A1A1A", // a step lighter, for controls inside panels
  onInk: "#F4F2EE",
  inkMuted: "rgba(244, 242, 238, 0.62)",
  inkLine: "rgba(244, 242, 238, 0.16)",

  // Gold — a touch of light: service tiles, the barber wheel, barbershop action cards
  neon: "#F2B53A",
  neonBright: "#FFD27A",
  goldInk: "#8A5A0B", // gold for text and lines on light backgrounds (≥4.5:1 on white)

  // Status
  danger: "#B42318",
  dangerSoft: "rgba(180, 35, 24, 0.08)",
};

export const fonts = {
  display: "Inter_500Medium", // big, tight headlines
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_800ExtraBold",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

/** Soft depth for white cards on the off-white page. */
export const shadow = Platform.select({
  web: { boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" },
  default: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
}) as object;

/** Emphasis for the one thing that matters most (selected option, active step): a crisp black edge. */
export const emphasis = Platform.select({
  web: { boxShadow: "0 0 0 1px #0B0B0B, 0 10px 28px rgba(0,0,0,0.08)" },
  default: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
}) as object;

/** Gold neon edge-light for the service tiles. */
export const neonGlow = Platform.select({
  web: { boxShadow: "0 0 0 1px rgba(255,210,122,0.55), 0 0 14px rgba(242,181,58,0.55), 0 0 32px rgba(242,181,58,0.25), inset 0 0 22px rgba(242,181,58,0.28)" },
  default: { shadowColor: "#F2B53A", shadowOpacity: 0.75, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
}) as object;

/** Lift for black buttons and floating controls. */
export const raise = Platform.select({
  web: { boxShadow: "0 6px 16px rgba(0,0,0,0.16)" },
  default: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
}) as object;
