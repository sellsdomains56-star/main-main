import type { CapacitorConfig } from "@capacitor/cli";

// The app opens your own Dizz Lab server. Set DIZZ_URL to its HTTPS address before `npx cap sync`,
// e.g. DIZZ_URL=https://dizz-lab.fly.dev npx cap sync
const url = process.env.DIZZ_URL;
if (!url?.startsWith("https://")) throw new Error("Set DIZZ_URL to your Dizz Lab server's https:// address");

const config: CapacitorConfig = {
  appId: process.env.DIZZ_APP_ID ?? "com.example.dizzlab",
  appName: "Dizz Lab",
  // Shown only if the server can't be reached.
  webDir: "www",
  server: {
    url,
    cleartext: false,
    allowNavigation: [new URL(url).hostname],
  },
  ios: { contentInset: "always" },
};

export default config;
