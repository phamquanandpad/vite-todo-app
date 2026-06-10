import { createContext, useState, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage, decodeJwt } from './tokenStorage';

interface AuthState {
  userId: number | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>(null!);

function userIdFromToken(): number | null {
  const t = tokenStorage.getAccess();
  const payload = t ? decodeJwt<{ sub?: number | string }>(t) : null;
  return payload?.sub != null ? Number(payload.sub) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(userIdFromToken());

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStorage.set(res.accessToken, res.refreshToken);
    setUserId(userIdFromToken());
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } finally {
      tokenStorage.clear();
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated: userId != null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
