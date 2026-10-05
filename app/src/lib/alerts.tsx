import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState, Platform } from "react-native";
import { api } from "./api";
import { useAuth } from "./auth";
import { enablePush } from "./push";
import type { AppNotification } from "./types";

interface Alerts {
  items: AppNotification[] | null;
  unread: number;
  /** Arrived while the app was open and not yet shown as a banner (the website's stand-in for push). */
  fresh: AppNotification | null;
  dismissFresh: () => void;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const AlertsContext = createContext<Alerts | null>(null);
const POLL_MS = Platform.OS === "web" ? 15_000 : 60_000;

/** The signed-in user's alerts inbox: polled while the app is open, refreshed when it comes back to the front. */
export function AlertsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [fresh, setFresh] = useState<AppNotification | null>(null);
  const seen = useRef<Set<string> | null>(null); // ids already known, so only new ones pop up

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.notifications();
      setItems(res.items);
      setUnread(res.unread);
      // Pop up alerts that arrived since the last check (or in the last two minutes, on first load).
      // Your own "you're booked" is already on screen, so it doesn't pop up.
      const known = seen.current;
      const arrived = res.items.find(
        (n) => !n.read && n.kind !== "booking_confirmed" && (known ? !known.has(n.id) : Date.now() - Date.parse(n.createdAt) < 120_000),
      );
      if (arrived) setFresh(arrived);
      seen.current = new Set(res.items.map((n) => n.id));
    } catch {
      // offline or signed out — keep what we have
    }
  }, [user]);

  useEffect(() => {
    seen.current = null;
    setItems(null);
    setUnread(0);
    setFresh(null);
    if (!user) return;
    refresh();
    enablePush(false); // registers this phone if alerts are already allowed; never prompts here
    const timer = setInterval(refresh, POLL_MS);
    const sub = AppState.addEventListener("change", (s) => s === "active" && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [user, refresh]);

  const markAllRead = useCallback(async () => {
    setUnread(0);
    setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
    await api.markNotificationsRead().catch(() => {});
  }, []);

  const dismissFresh = useCallback(() => setFresh(null), []);
  const value = useMemo(() => ({ items, unread, fresh, dismissFresh, refresh, markAllRead }), [items, unread, fresh, dismissFresh, refresh, markAllRead]);
  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside AlertsProvider");
  return ctx;
}
