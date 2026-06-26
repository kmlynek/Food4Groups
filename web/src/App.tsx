import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { allRoles, roles } from './types/authTypes';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={allRoles}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={[roles.admin, roles.groupCoordinator]}>
            <PlaceholderPage
              title="Użytkownicy"
              description="Moduł będzie obsługiwał zarządzanie kontami, rolami oraz przypisaniem użytkowników do grup"
            />
          </ProtectedRoute>
        ),
      },
      {
        path: 'groups',
        element: (
          <ProtectedRoute allowedRoles={[roles.admin, roles.groupCoordinator]}>
            <PlaceholderPage
              title="Grupy"
              description="Moduł będzie obsługiwał grupy żywieniowe, koordynatorów oraz członków przypisanych do grup"
            />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dishes',
        element: (
          <ProtectedRoute allowedRoles={[roles.admin, roles.cateringEmployee, roles.dietitian]}>
            <PlaceholderPage
              title="Dania"
              description="Moduł będzie obsługiwał katalog dań, informacje dietetyczne oraz dostępność pozycji w ofercie"
            />
          </ProtectedRoute>
        ),
      },
      {
        path: 'menus',
        element: (
          <ProtectedRoute allowedRoles={[roles.admin, roles.cateringEmployee, roles.dietitian]}>
            <PlaceholderPage
              title="Menu"
              description="Moduł będzie obsługiwał menu dzienne, pakiety oraz przypisanie dań i dodatków do konkretnych terminów"
            />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute allowedRoles={[roles.admin, roles.cateringEmployee, roles.groupCoordinator, roles.user]}>
            <PlaceholderPage
              title="Zamówienia"
              description="Moduł będzie obsługiwał składanie zamówień, przegląd zamówień oraz statusy realizacji"
            />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

// App odpowiada za główną konfigurację tras aplikacji
// Trasy po zalogowaniu korzystają ze wspólnego layoutu z menu bocznym
export default function App() {
  return <RouterProvider router={router} />;
}