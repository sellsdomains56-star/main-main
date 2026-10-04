import { Platform } from "react-native";

// Light page, black ink, gold for details only. See DESIGN.md before adding colors.
export const colors = {
  // Page & surfaces
  bg: "#FAF8F4", // warm off-white page
  card: "#FFFFFF",
  surface: "#F3EFE7", // inputs, chips, quiet tiles
  surfaceStrong: "#E7E0D3",
  border: "#E9E3D8",

  // Ink
  text: "#111111",
  muted: "#6E675D",
  faint: "#A39C90",
  ink: "#111111", // primary buttons, dark banners, selected chips
  onInk: "#FFFFFF",

  // Gold — details only: icons, stars, selected marks, prices on dark, small highlights
  gold: "#C5A253",
  goldDeep: "#8E6E2A", // gold text on light backgrounds (readable contrast)
  goldSoft: "#F4ECDA", // gold tint for tags and avatar fallbacks

  // Status
  danger: "#B42318",
  dangerSoft: "#FBEAE8",
};

export const fonts = {
  display: "PlayfairDisplay_700Bold", // big headings only
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_800ExtraBold",
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 26, pill: 999 };

export const shadow = Platform.select({
  web: { boxShadow: "0 1px 2px rgba(17,17,17,0.04), 0 4px 16px rgba(17,17,17,0.05)" },
  default: { shadowColor: "#111111", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
}) as object;
