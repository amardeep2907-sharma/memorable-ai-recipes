"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, authApi, setAuthToken, setOnAuthFailure } from "@/lib/api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  // On first load there's no access token in memory yet (it's never persisted
  // to localStorage), so try to mint a fresh one from the httpOnly refresh
  // cookie the backend set on a previous login.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const refreshRes = await api.post("/auth/refresh");
        setAuthToken(refreshRes.data.data.accessToken);
        const meRes = await api.get("/users/me");
        if (!cancelled) setUser(meRes.data.data);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    setOnAuthFailure(clearSession);

    return () => {
      cancelled = true;
      setOnAuthFailure(null);
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAuthToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setAuthToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await authApi.google(idToken);
    setAuthToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best-effort — clear local state regardless of whether the server call succeeded
    }
    clearSession();
  }, [clearSession]);

  // Re-pulls /users/me - call this after saving profile settings so the
  // navbar/dashboard reflect the new name/avatar without a full reload.
  const refreshUser = useCallback(async () => {
    const meRes = await api.get("/users/me");
    setUser(meRes.data.data);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
