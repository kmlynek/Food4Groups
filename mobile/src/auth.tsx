import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { apiRequest } from './api';

// Moduł odpowiada za odtworzenie sesji, logowanie, wylogowanie
// oraz udostępnienie danych zalogowanego użytkownika ekranom aplikacji
const sessionStorageKey = 'food4groups.auth';
const clientRole = 'User';

// Nazwy claimów odpowiadają formatowi tokena generowanego przez backend 
const roleClaim =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const emailClaim = 'email';

type AuthUser = {
  email: string;
  roles: string[];
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

type LoginResponse = {
  token: string;
  expiresAt: string;
};

type JwtPayload = {
  [roleClaim]?: string | string[];
  [emailClaim]?: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);

  // Stan ładowania pozostaje aktywny do zakończenia odczytu zapisanej sesji
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedValue =
          await SecureStore.getItemAsync(sessionStorageKey);

        if (!storedValue) {
          return;
        }

        const storedSession = JSON.parse(
          storedValue,
        ) as Partial<AuthSession>;

        // Minimalna walidacja chroni aplikację przed uszkodzonym zapisem sesji
        if (
          typeof storedSession.token !== 'string' ||
          typeof storedSession.expiresAt !== 'string'
        ) {
          throw new Error('Nieprawidłowy zapis sesji');
        }

        const user = getUserFromToken(storedSession.token);

        // Sesja jest akceptowana wyłącznie dla użytkownika z rolą Klient
        if (!user.roles.includes(clientRole)) {
          throw new Error('Nieprawidłowa rola użytkownika');
        }

        // Sesja jest odtwarzana bez lokalnej analizy terminu ważności tokena
        // Ważność tokena jest weryfikowana przez backend podczas chronionych żądań
        setSession({
          token: storedSession.token,
          expiresAt: storedSession.expiresAt,
          user,
        });
      } catch {
        // Nieprawidłowy zapis sesji jest usuwany z bezpiecznego magazynu
        await SecureStore.deleteItemAsync(sessionStorageKey);
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  // Logowanie pobiera token, sprawdza rolę użytkownika i zapisuje sesję
  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = getUserFromToken(response.token);

    if (!user.roles.includes(clientRole)) {
      throw new Error(
        'Aplikacja mobilna jest dostępna wyłącznie dla klientów',
      );
    }

    const nextSession: AuthSession = {
      token: response.token,
      expiresAt: response.expiresAt,
      user,
    };

    // SecureStore zapisuje sesję w natywnym, zabezpieczonym magazynie systemu
    await SecureStore.setItemAsync(
      sessionStorageKey,
      JSON.stringify(nextSession),
    );

    setSession(nextSession);
  }, []);

  // Wylogowanie usuwa sesję z urządzenia oraz bieżącego stanu aplikacji
  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(sessionStorageKey);
    setSession(null);
  }, []);

  // Context udostępnia jeden stan uwierzytelnienia wszystkim ekranom
  const value = useMemo(
    () => ({
      session,
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, session],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook udostępnia dane sesji wyłącznie komponentom umieszczonym w AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  }

  return context;
}

// Token jest dekodowany wyłącznie w celu odczytania adresu e-mail i roli
// Autoryzacja operacji pozostaje odpowiedzialnością backendu
function getUserFromToken(token: string): AuthUser {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    throw new Error('Nieprawidłowy token użytkownika');
  }

  // JWT używa wariantu Base64 URL wymagającego zamiany znaków przed dekodowaniem
  const base64 = payloadPart
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const paddedBase64 = base64.padEnd(
    Math.ceil(base64.length / 4) * 4,
    '=',
  );

  const payload = JSON.parse(atob(paddedBase64)) as JwtPayload;
  const rawRoles = payload[roleClaim];

  // Pojedyncza rola ma postać tekstu, a wiele ról ma postać tablicy
  const roles = Array.isArray(rawRoles)
    ? rawRoles
    : rawRoles
      ? [rawRoles]
      : [];

  return {
    email: payload[emailClaim] ?? '',
    roles,
  };
}