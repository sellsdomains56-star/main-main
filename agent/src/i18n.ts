import { getSettings } from "./db.js";

/**
 * Words the server shows you (the agent's activity: "Searched the web for…",
 * reminder notes) follow the language chosen in Settings.
 */
export function uiLang(): "en" | "ar" {
  try {
    return getSettings().language === "ar" ? "ar" : "en";
  } catch {
    return "en"; // locked
  }
}

export function tr(en: string, ar: string): string {
  return uiLang() === "ar" ? ar : en;
}

/** Counted phrases; Arabic distinguishes one, two, a few (3–10) and many. */
export function trCount(n: number, en: [string, string], ar: [string, string, string, string]): string {
  if (uiLang() === "ar") {
    const form = n === 1 ? ar[0] : n === 2 ? ar[1] : n % 100 >= 3 && n % 100 <= 10 ? ar[2] : ar[3];
    return form.replaceAll("{n}", String(n));
  }
  return (n === 1 ? en[0] : en[1]).replaceAll("{n}", String(n));
}
