import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/authTypes';
import type { JSX } from 'react';

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  children: JSX.Element;
};

// Komponent zabezpiecza dostęp do stron wymagających uwierzytelnienia oraz odpowiednich ról
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { auth, isAuthenticated } = useAuth();
    const location = useLocation();

    // Niezalogowany użytkownik zostaje przekierowany na stronę logowania
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Dostęp do strony jest możliwy wyłącznie dla użytkowników posiadających wymaganą rolę
    const hasAllowedRole = auth?.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasAllowedRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}