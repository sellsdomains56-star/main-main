// Makes the app installable on phones and desktops. It doesn't cache anything:
// your chats are private and always come straight from your server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
