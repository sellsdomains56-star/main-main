import { Platform, Share } from "react-native";

/** Opens the share sheet (or copies the text on web browsers without one). Returns "copied" when it only copied. */
export async function shareText(title: string, text: string, url?: string): Promise<"shared" | "copied" | "failed"> {
  const full = url ? `${text}\n${url}` : text;
  try {
    if (Platform.OS === "web") {
      const nav = globalThis.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav?.share) {
        await nav.share({ title, text, ...(url ? { url } : {}) });
        return "shared";
      }
      await nav?.clipboard?.writeText(full);
      return "copied";
    }
    await Share.share(Platform.OS === "ios" && url ? { message: text, url } : { message: full });
    return "shared";
  } catch {
    return "failed";
  }
}
