import { Platform } from "react-native";

// Minimal "super app" look: white space, soft grey surfaces, one fresh-green accent.
export const colors = {
  bg: "#FFFFFF",
  surface: "#F4F6F5",
  surfaceStrong: "#E9EDEB",
  card: "#FFFFFF",
  text: "#101814",
  muted: "#6B7570",
  faint: "#9AA39F",
  border: "#ECEFED",
  brand: "#0BA360",
  brandDark: "#087A48",
  brandSoft: "#E7F6EE",
  onBrand: "#FFFFFF",
  star: "#F5A623",
  danger: "#E5484D",
  dangerSoft: "#FDECEC",
  warn: "#B7791F",
  warnSoft: "#FFF4E0",
  // Tile tints for the home grid
  peach: "#FFF1E6",
  lilac: "#F1EDFF",
  rose: "#FFEAF1",
  sky: "#E8F3FF",
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_800ExtraBold",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow = Platform.select({
  web: { boxShadow: "0 2px 12px rgba(16, 24, 20, 0.06)" },
  default: { shadowColor: "#101814", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
}) as object;
