import { useColorScheme } from "react-native";

const light = {
  bg: "#F6F5F2",
  card: "#FFFFFF",
  text: "#111114",
  muted: "#6B6B76",
  border: "#E4E2DC",
  primary: "#0E9F6E", // "fresh" mint green
  primaryText: "#FFFFFF",
  accent: "#F5B301",
  danger: "#D64545",
  chip: "#ECEAE4",
};

const dark: typeof light = {
  bg: "#0B0B0F",
  card: "#16161C",
  text: "#F4F4F6",
  muted: "#9A9AA6",
  border: "#26262E",
  primary: "#22C38E",
  primaryText: "#05140E",
  accent: "#F5C542",
  danger: "#F06A6A",
  chip: "#1F1F27",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
