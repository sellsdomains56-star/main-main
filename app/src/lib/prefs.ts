import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Settings read synchronously when the app starts (the colour palette and the language are fixed for the session;
 * changing them reloads the website or applies on the next launch of the phone app).
 */
export type ThemePref = "system" | "light" | "dark";
export type LangPref = "en" | "ar";

function read(key: string): string | null {
  try {
    if (Platform.OS === "web") return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    return SecureStore.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key: "af_theme" | "af_lang", value: string) {
  try {
    if (Platform.OS === "web") window.localStorage.setItem(key, value);
    else SecureStore.setItem(key, value);
  } catch {
    // private browsing: the choice lasts until reload
  }
}

export const themePref = (): ThemePref => {
  const v = read("af_theme");
  return v === "light" || v === "dark" ? v : "system";
};
export const langPref = (): LangPref => {
  const v = read("af_lang");
  if (v === "ar" || v === "en") return v;
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.language?.startsWith("ar")) return "ar";
  return "en";
};
