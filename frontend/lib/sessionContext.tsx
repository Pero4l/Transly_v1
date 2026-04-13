"use client";

import { useState, useEffect, createContext, useContext } from "react";

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
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  token: null,
  loading: true,
  refreshSession: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      // 1. Try Session sync first
      const res = await fetch("https://transly-wr1m.onrender.com/auth/session", {
        credentials: "include",
      });
      let data = await res.json();
      
      // 2. Fallback to LocalStorage JWT if session fails
      if (!data.success) {
        const localToken = localStorage.getItem("transly_token");
        if (localToken) {
          const meRes = await fetch("https://transly-wr1m.onrender.com/auth/me", {
            headers: { Authorization: `Bearer ${localToken}` },
          });
          data = await meRes.json();
        }
      }

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        if (data.token) localStorage.setItem("transly_token", data.token);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("transly_token");
      }
    } catch (err) {
      console.error("Session sync failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("transly_token");
    try {
      await fetch("https://transly-wr1m.onrender.com/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setToken(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if server logout fails, clear local state
      setUser(null);
      setToken(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, token, loading, refreshSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
