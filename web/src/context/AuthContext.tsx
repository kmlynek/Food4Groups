import { createContext, useMemo, useState, type PropsWithChildren } from 'react';
import { loginRequest } from '../api/authApi';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/authStorage';
import { getUserFromToken } from '../utils/jwt';
import type { AuthState } from '../types/authTypes';

export type AuthContextValue = {
  auth: AuthState | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Context przechowuje aktualny stan logowania i udostępnia akcje login/logout
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState | null>(() => getStoredAuth());

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: Boolean(auth),
      login: async (email, password) => {
        const response = await loginRequest({ email, password });

        const nextAuth: AuthState = {
          token: response.token,
          expiresAt: response.expiresAt,
          user: getUserFromToken(response.token),
        };

        setStoredAuth(nextAuth);
        setAuth(nextAuth);
      },
      logout: () => {
        clearStoredAuth();
        setAuth(null);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}