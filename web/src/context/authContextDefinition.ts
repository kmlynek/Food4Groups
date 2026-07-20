import { createContext } from 'react';
import type { AuthState } from '../types/authTypes';

export type AuthContextValue = {
  auth: AuthState | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Context przechowuje stan uwierzytelnienia i udostępnia go wszystkim komponentom aplikacji
export const AuthContext = createContext<AuthContextValue | null>(null);
