import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getMe } from "../api/me";
import { getStoredToken, logoutAndRedirect } from "../api/client";
import type { UserMe } from "../types";

type AuthStatus = "idle" | "loading" | "ready" | "error";

type AuthContextValue = {
  user: UserMe | null;
  status: AuthStatus;
  refreshMe: () => Promise<UserMe | null>;
  logout: (message?: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");

  const refreshMe = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setStatus("idle");
      return null;
    }

    setStatus("loading");
    try {
      const me = await getMe();
      setUser(me);
      setStatus("ready");
      return me;
    } catch {
      setUser(null);
      setStatus("error");
      return null;
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      if (user !== null) setUser(null);
      if (status !== "idle") setStatus("idle");
      return;
    }

    if (status === "idle") {
      refreshMe();
    }
  }, [refreshMe, status, user]);

  const logout = useCallback((message?: string) => {
    setUser(null);
    setStatus("idle");
    logoutAndRedirect(message);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      refreshMe,
      logout,
    }),
    [refreshMe, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
