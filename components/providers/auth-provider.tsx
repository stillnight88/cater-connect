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
import { refreshApi, logoutApi, meApi } from "@/lib/api/auth-api";
import type { UserRole } from "@/types/user";

interface AuthContextValue {
  // State
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true only during initial session restore on mount

  // Actions
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
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

  const performRefreshRef = useRef<() => Promise<string | null>>(
    async () => null,
  );

  const hydrateUserProfile = useCallback(async (token: string, fallback: ClientUser) => {
    const result = await meApi(token);
    if (result.success) {
      setUser({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      });
    } else {
      setUser(fallback);
    }
  }, [])

  // Called after every successful token acquisition, Refreshes 60 seconds before expiry
  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const refreshIn = expiry - Date.now() - 60_000; // 60s before expiry

    if (refreshIn <= 0) {
      void performRefreshRef.current();
      return;
    }

    refreshTimerRef.current = setTimeout(() => {
      void performRefreshRef.current();
    }, refreshIn);
  }, []);


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
    scheduleRefresh(newToken);
    await hydrateUserProfile(newToken, parsed);

    return newToken;
  }, [scheduleRefresh, hydrateUserProfile]);

  useEffect(() => {
    performRefreshRef.current = performRefresh;
  }, [performRefresh]);

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
            scheduleRefresh(result.accessToken);
            await hydrateUserProfile(result.accessToken, parsed);
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
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleRefresh, hydrateUserProfile]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const login = useCallback(
    async (newAccessToken: string) => {
      const parsed = parseAccessToken(newAccessToken);
      if (!parsed) return;

      setAccessToken(newAccessToken);
      scheduleRefresh(newAccessToken);
      await hydrateUserProfile(newAccessToken, parsed);
    },
    [scheduleRefresh, hydrateUserProfile],
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


  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null;
    if (isTokenExpired(accessToken)) {
      void performRefresh();
      return null;
    }
    return accessToken;
  }, [accessToken, performRefresh]);

  const value: AuthContextValue = {
    user,
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

export function useHasRole(role: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === role;
}
