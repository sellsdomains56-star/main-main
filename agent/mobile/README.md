# Dizz Lab for iPhone and Android

A native app shell (Capacitor 8) that opens **your own Dizz Lab server**, for installing from TestFlight, the App Store, or as an Android app.

**You probably don't need it.** On a phone, open your server's address and choose **Share → Add to Home Screen** (iPhone) or **Install app** (Android Chrome): you get an app icon, full-screen app and push notifications, with nothing to build. Face ID / fingerprint sign-in (passkeys) and Web Push work there today.

Use this shell only if you want a store app. Building it needs a Mac with Xcode (iPhone) or Android Studio (Android):

```bash
cd agent/mobile
npm install
export DIZZ_URL=https://your-dizz-lab.example.com   # your server, HTTPS only
export DIZZ_APP_ID=com.yourname.dizzlab             # your own bundle id
npx cap add ios        # and/or: npx cap add android
npx cap sync
npx cap open ios       # build and run from Xcode (or: npx cap open android)
```

Things to know:

- **Push notifications and passkeys inside the shell** need native plugins (APNs/FCM push, associated domains for passkeys). Web Push and WebAuthn from the web app don't automatically carry over into the app's web view. The Home Screen web app has both without extra work.
- **App Store review:** Apple rejects apps that are only a website in a wrapper (guideline 4.2). For a private app, TestFlight or an ad-hoc build is the practical route; a public listing would need native features of its own.
- Capacitor's own docs mark loading a remote `server.url` as not intended for production; it's the simplest way to point a personal app at your own server.
