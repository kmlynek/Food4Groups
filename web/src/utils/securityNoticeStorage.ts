const seededPasswordChangedKey = 'food4groups.seededPasswordChangedEmails';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getChangedEmails() {
  try {
    const value = localStorage.getItem(seededPasswordChangedKey);
    const parsedValue = value ? JSON.parse(value) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

// Sprawdza czy komunikat bezpieczeństwa został już obsłużony dla danego konta
export function hasSeededPasswordChanged(email: string) {
  return getChangedEmails().includes(normalizeEmail(email));
}

// Zapisuje informację o zmianie hasła dla konta startowego
export function markSeededPasswordChanged(email: string) {
  const changedEmails = getChangedEmails();
  const normalizedEmail = normalizeEmail(email);

  if (!changedEmails.includes(normalizedEmail)) {
    localStorage.setItem(seededPasswordChangedKey, JSON.stringify([...changedEmails, normalizedEmail]));
  }
}