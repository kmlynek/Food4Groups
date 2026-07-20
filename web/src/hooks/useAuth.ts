import { useContext } from 'react';
import { AuthContext } from '../context/authContextDefinition';

// Hook udostępnia komponentom stan uwierzytelnienia oraz operacje logowania i wylogowania
export function useAuth() {
    const context = useContext(AuthContext);

    // Hook może zostać użyty wyłącznie wewnątrz komponentu AuthProvider
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
