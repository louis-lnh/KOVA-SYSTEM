"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SessionIdentity } from "../lib/api";

type AuthContextValue = {
  session: SessionIdentity | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load session.");
        }

        const data = (await response.json()) as {
          session: SessionIdentity | null;
        };

        if (active) {
          setSession(data.session);
        }
      } catch {
        if (active) {
          setSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setSession(null);
      window.location.assign("/login");
    }
  }

  return (
    <AuthContext.Provider value={{ session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
