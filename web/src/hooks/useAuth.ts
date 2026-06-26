import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook upraszcza korzystanie z AuthContext w komponentach
// Dzięki temu komponent nie musi za każdym razem importować useContext i AuthContext
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}