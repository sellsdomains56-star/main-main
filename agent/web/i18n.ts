import { AR } from "./i18n-ar.js";

/**
 * Interface language. Strings are written in English in the code and looked up
 * in the Arabic dictionary when Arabic is on; anything missing falls back to
 * English. Arabic also switches the whole layout to right-to-left.
 */

export type Lang = "en" | "ar";

const KEY = "dizz.lang";

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    // private mode
  }
  return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
}

let current: Lang = initial();

export function lang(): Lang {
  return current;
}

/** Locale for dates and numbers (Arabic with Western digits, as used across the Gulf). */
export function locale(): string {
  return current === "ar" ? "ar-u-nu-latn" : navigator.language || "en";
}

export function setLang(next: Lang): void {
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // private mode
  }
  applyLang();
}

export function applyLang(): void {
  document.documentElement.lang = current;
  document.documentElement.dir = current === "ar" ? "rtl" : "ltr";
}

/** Translate: t("Delete {name}?", { name }) */
export function t(text: string, vars?: Record<string, string | number>): string {
  let out = current === "ar" ? (AR[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

/** Plurals: Arabic has more forms than English, so both are spelled out. */
export function plural(n: number, en: [one: string, many: string], ar: [one: string, two: string, few: string, many: string]): string {
  if (current === "ar") {
    const form = n === 1 ? ar[0] : n === 2 ? ar[1] : n % 100 >= 3 && n % 100 <= 10 ? ar[2] : ar[3];
    return form.replaceAll("{n}", String(n));
  }
  return (n === 1 ? en[0] : en[1]).replaceAll("{n}", String(n));
}

applyLang();
