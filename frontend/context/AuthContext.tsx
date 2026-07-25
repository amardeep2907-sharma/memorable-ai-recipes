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

  // Helper to fetch complete user profile including role
  const fetchUserProfile = useCallback(async () => {
    try {
      const meRes = await api.get("/users/me");
      setUser(meRes.data.data);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  }, []);

  // On first load, attempt to refresh session silently using httpOnly cookie
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const refreshRes = await api.post("/auth/refresh", {}, { withCredentials: true });
        
        const accessToken = refreshRes.data?.data?.accessToken;
        if (accessToken) {
          setAuthToken(accessToken);
          const meRes = await api.get("/users/me");
          if (!cancelled) setUser(meRes.data.data);
        }
      } catch (err: any) {
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
    // Directly fetch updated /users/me so role is always fresh & complete
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setAuthToken(res.data.accessToken);
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await authApi.google(idToken);
    setAuthToken(res.data.accessToken);
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      // best-effort
    }
    clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

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