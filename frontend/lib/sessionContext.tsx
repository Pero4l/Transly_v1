"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { apiFetch } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

interface SessionContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  setUserData: (data: Partial<User>) => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  token: null,
  loading: true,
  refreshSession: async () => {},
  logout: async () => {},
  setUserData: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      // 1. Try Session sync first (Cookie-based)
      const res = await apiFetch("/auth/session");
      let data = await res.json();

      // 2. Aggressive fallback for mobile/iPhones with blocked cookies
      if (!data.success) {
        console.log("[SESSION] Cookie session failed, trying localStorage fallback...");
        const localToken = localStorage.getItem("transly_token");
        if (localToken) {
           const meRes = await apiFetch("/auth/me", {}, localToken);
           data = await meRes.json();
        }
      }

      if (data.success) {
        setUser(data.user);
        if (data.token) {
            setToken(data.token);
            localStorage.setItem("transly_token", data.token);
        }
      } else {
        setUser(null);
        setToken(null);
        // Note: Don't clear localStorage here, it might be a temporary network issue
      }
    } catch (err) {
      console.error("Session sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const setUserData = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const logout = async () => {
    localStorage.removeItem("transly_token");
    document.cookie = 'transly_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      setUser(null);
      setToken(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if server logout fails, clear local state
      setUser(null);
      setToken(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, token, loading, refreshSession, logout, setUserData }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
