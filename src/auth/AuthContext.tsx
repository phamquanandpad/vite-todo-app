import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import { setClientAccessToken } from '../api/client';
import { decodeJwt } from './tokenStorage';

interface AuthState {
  userId: number | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthState>(null!);

// Shared promise across StrictMode double-mount so refresh is only called once.
let initialTokenPromise: Promise<string | null> | null = null;
function getInitialToken(): Promise<string | null> {
  if (!initialTokenPromise) {
    initialTokenPromise = authApi.refresh()
      .then((res) => res.accessToken)
      .catch(() => null);
  }
  return initialTokenPromise;
}

function userIdFromToken(token: string | null): number | null {
  // The backend encodes { user_id: ... } (not the standard `sub` claim).
  const payload = token ? decodeJwt<{ user_id?: number | string }>(token) : null;
  return payload?.user_id != null ? Number(payload.user_id) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ accessToken: string | null; isInitializing: boolean }>({
    accessToken: null,
    isInitializing: true,
  });

  const { accessToken, isInitializing } = authState;

  // Sync access token into the axios client whenever it changes.
  useEffect(() => {
    setClientAccessToken(accessToken);
  }, [accessToken]);

  // On mount, try to get a fresh access token using the HttpOnly refresh cookie.
  // Module-level promise prevents double-firing in React StrictMode (dev).
  useEffect(() => {
    let cancelled = false;
    getInitialToken().then((token) => {
      if (!cancelled) {
        // Use functional update to avoid overwriting a token that was already
        // set by a concurrent login() call (race condition: initial refresh
        // completes after login succeeds and would clobber the login token).
        setAuthState((prev) =>
          prev.isInitializing
            ? { accessToken: token, isInitializing: false }
            : prev
        );
      }
    });
    return () => { cancelled = true; };
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    setAuthState((prev) => ({ ...prev, accessToken: token }));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    // Set the axios client token synchronously so that any requests fired
    // immediately after navigate() (before the useEffect can run) already
    // carry the Authorization header and don't trigger a spurious refresh.
    setClientAccessToken(res.accessToken);
    setAuthState({ accessToken: res.accessToken, isInitializing: false });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setClientAccessToken(null); // clear immediately, same reason
      setAuthState({ accessToken: null, isInitializing: false });
    }
  };

  const userId = userIdFromToken(accessToken);

  return (
    <AuthContext.Provider value={{
      userId,
      accessToken,
      isAuthenticated: userId != null,
      isInitializing,
      login,
      logout,
      setAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
