import { useMemo, useState, type PropsWithChildren } from 'react';
import { loginRequest } from '../api/authApi';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/authStorage';
import { getUserFromToken } from '../utils/jwt';
import type { AuthState } from '../types/authTypes';
import { AuthContext, type AuthContextValue } from './authContextDefinition';

export function AuthProvider({ children }: PropsWithChildren) {
    // Odczytuje zapisany stan logowania podczas uruchamiania aplikacji
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

                    // Dane użytkownika są odczytywane bezpośrednio z tokenu JWT
                    user: getUserFromToken(response.token),
                };

                // Stan logowania jest zapisywany w pamięci przeglądarki oraz w Context API
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
