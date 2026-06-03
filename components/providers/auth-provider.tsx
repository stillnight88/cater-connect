"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  parseAccessToken,
  getTokenExpiry,
  isTokenExpired,
  type ClientUser,
} from "@/lib/auth/client-session";
import { refreshApi, logoutApi } from "@/lib/api/auth-api";
import type { UserRole } from "@/types/user";

interface AuthContextValue {
  // State
  user: ClientUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true only during initial session restore on mount

  // Actions
  login: (accessToken: string, name: string) => void;
  logout: () => Promise<void>;
  getAccessToken: () => string | null; 
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref for the proactive refresh timer, Using ref so it survives re-renders without being a dependency
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Called after every successful token acquisition, Refreshes 60 seconds before expiry
  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const now = Date.now();
    const refreshIn = expiry - now - 60_000; // 60s before expiry

    if (refreshIn <= 0) {
      void performRefresh();
      return;
    }

    refreshTimerRef.current = setTimeout(() => {
      void performRefresh();
    }, refreshIn);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Calls /api/auth/refresh — uses httpOnly cookie automatically
  // On success: rotates token in memory + reschedules next refresh
  // On failure: clears session (cookie is gone or revoked)
  const performRefresh = useCallback(async (): Promise<string | null> => {
    const result = await refreshApi();

    if (!result.success) {
      setAccessToken(null);
      setUser(null);
      return null;
    }

    const newToken = result.accessToken;
    const parsed = parseAccessToken(newToken);

    if (!parsed) {
      setAccessToken(null);
      setUser(null);
      return null;
    }

    setAccessToken(newToken);
    // JWT doesn't carry name
    setUser((prev) => ({
      ...parsed,
      name: prev?.name,
    }));
    scheduleRefresh(newToken);
    return newToken;
  }, [scheduleRefresh]);



  // call /api/auth/refresh on load
  // If the cookie exists and is valid → session is restored silently
  // If not → user stays logged out, no error shown
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await refreshApi();

        if (cancelled) return;

        if (result.success) {
          const parsed = parseAccessToken(result.accessToken);
          if (parsed && !cancelled) {
            setAccessToken(result.accessToken);
            setUser(parsed);
            scheduleRefresh(result.accessToken);
          }
        }
      } catch {
        // Network error on load — user stays logged out silently
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [scheduleRefresh]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const login = useCallback(
    (newAccessToken: string, name: string) => {
      const parsed = parseAccessToken(newAccessToken);
      if (!parsed) return;

      setAccessToken(newAccessToken);
      setUser({ ...parsed, name });
      scheduleRefresh(newAccessToken);
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    setAccessToken(null);
    setUser(null);

    try {
      await logoutApi();
    } catch {
      // Already cleared locally — failure here is acceptable
    }
  }, []);


  const getAccessToken = useCallback((): string | null => {
    if (!accessToken) return null;
    if (isTokenExpired(accessToken)) {
      void performRefresh();
      return null;
    }
    return accessToken;
  }, [accessToken, performRefresh]);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "admin";
}

export function useIsVendor(): boolean {
  const { user } = useAuth();
  return user?.role === "vendor";
}

export function useIsCustomer(): boolean {
  const { user } = useAuth();
  return user?.role === "customer";
}

export function useRequireRole(role: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === role;
}
