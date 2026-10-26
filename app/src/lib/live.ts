import { Platform } from "react-native";
import { currentToken } from "./api";
import { API_URL, DEMO_DATA } from "./config";

type Listener = (event: string, data: unknown) => void;
const listeners = new Set<Listener>();
let source: EventSource | null = null;
let openFor: string | null = null;

/**
 * Live updates from the API (server-sent events): new alerts and chat messages arrive the moment they're made.
 * Websites only; phones get the same through push notifications and refresh when the app comes back.
 */
export function onLive(listener: Listener) {
  listeners.add(listener);
  connect();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) close();
  };
}

function connect() {
  const token = currentToken();
  if (Platform.OS !== "web" || DEMO_DATA || typeof EventSource === "undefined" || !token) return;
  if (source && openFor === token) return;
  close();
  openFor = token;
  source = new EventSource(`${API_URL}/events?token=${encodeURIComponent(token)}`);
  for (const event of ["notification", "chat"]) {
    source.addEventListener(event, (e) => {
      let data: unknown = null;
      try {
        data = JSON.parse((e as MessageEvent).data);
      } catch {
        // keep null
      }
      for (const l of listeners) l(event, data);
    });
  }
}

function close() {
  source?.close();
  source = null;
  openFor = null;
}
