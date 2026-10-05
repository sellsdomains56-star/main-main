import { Platform } from "react-native";

// Black, with honey-gold light. See DESIGN.md before adding colors.
export const colors = {
  // Page & surfaces (darkest to lightest)
  bg: "#0A0A0B", // the page
  card: "#141416", // cards, sheets, bars
  surface: "#1B1B1E", // inputs, chips, quiet tiles
  surfaceStrong: "#2A2A2E", // pressed / active surfaces, dividers on cards
  border: "#26262A", // hairline around cards and controls

  // Text
  text: "#F4F1EA",
  muted: "#A49F96", // secondary text (≥7:1 on bg)
  faint: "#6F6B64", // icons, placeholders, disabled — never body text

  // Honey gold — the only accent
  gold: "#F2B53A",
  goldBright: "#FFCB57", // highlights inside glows
  goldDeep: "#E7AE3F", // gold text on dark (same family, a touch calmer)
  goldSoft: "rgba(242, 181, 58, 0.12)", // tinted fills: selected chips, tags, avatar fallbacks
  goldLine: "rgba(242, 181, 58, 0.55)", // glowing borders and connector lines
  onGold: "#17110A", // text and icons on gold fills

  // Raised dark blocks (banners, feature tiles, the floating button) — a step above `card`
  ink: "#121214",
  onInk: "#F4F1EA",

  // Status
  danger: "#FF7A6B",
  dangerSoft: "rgba(255, 122, 107, 0.12)",
};

export const fonts = {
  display: "Inter_300Light", // big, light headings
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_800ExtraBold",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };

/** Depth for cards on black: a faint top highlight plus a soft drop. */
export const shadow = Platform.select({
  web: { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.45)" },
  default: { shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
}) as object;

/** The signature gold glow: selected options, the active step, primary feature cards. */
export const glow = Platform.select({
  web: { boxShadow: "0 0 0 1px rgba(242,181,58,0.55), 0 0 22px rgba(242,181,58,0.22), inset 0 1px 0 rgba(255,255,255,0.05)" },
  default: { shadowColor: "#F2B53A", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
}) as object;

/** A smaller glow for dots, handles and buttons. */
export const glowSmall = Platform.select({
  web: { boxShadow: "0 0 12px rgba(242,181,58,0.55)" },
  default: { shadowColor: "#F2B53A", shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
}) as object;
