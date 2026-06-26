import type { AuthState } from '../types/authTypes';

const authStorageKey = 'food4groups.auth';

// localStorage pozwala zachować logowanie po odświeżeniu strony
export function getStoredAuth(): AuthState | null {
  const value = localStorage.getItem(authStorageKey);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthState;
  } catch {
    localStorage.removeItem(authStorageKey);
    return null;
  }
}

export function setStoredAuth(auth: AuthState) {
  localStorage.setItem(authStorageKey, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(authStorageKey);
}