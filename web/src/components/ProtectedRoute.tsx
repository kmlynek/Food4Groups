import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/authTypes';
import type { JSX } from 'react';

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  children: JSX.Element;
};

// ProtectedRoute pilnuje, żeby niezalogowany użytkownik nie wszedł do panelu
// Sprawdza też, czy użytkownik ma jedną z wymaganych ról
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { auth, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasAllowedRole = auth?.user.roles.some((role) => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}