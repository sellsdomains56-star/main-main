import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAuthToken } from "./api";
import { disablePush } from "./push";
import { storage } from "./storage";
import type { User } from "./types";

const TOKEN_KEY = "af_token";

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await storage.get(TOKEN_KEY);
      if (token) {
        setAuthToken(token);
        try {
          setUser(await api.me());
        } catch {
          setAuthToken(null);
          await storage.remove(TOKEN_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (token: string, next: User) => {
    setAuthToken(token);
    await storage.set(TOKEN_KEY, token);
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    await disablePush();
    await api.logout().catch(() => {});
    setAuthToken(null);
    await storage.remove(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut, setUser }), [user, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
