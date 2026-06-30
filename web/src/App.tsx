import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { allRoles, roles } from './types/authTypes';
import { AccountPage } from './pages/AccountPage';
import { RegisterPage } from './pages/RegisterPage';
import { GroupsPage } from './pages/GroupsPage';
import { DishesPage } from './pages/DishesPage';
import { AddonsPage } from './pages/AddonsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/register',
    element: <RegisterPage />
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
        path: 'account',
        element: <AccountPage />,
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
          <ProtectedRoute allowedRoles={[roles.admin, roles.cateringEmployee]}>
            <GroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dishes',
        element: (
          <ProtectedRoute allowedRoles={allRoles}>
            <DishesPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'addons',
        element: (
          <ProtectedRoute allowedRoles={allRoles}>
            <AddonsPage />
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

// App odpowiada za główną konfigurację tras/routingu aplikacji
// Trasy po zalogowaniu korzystają ze wspólnego layoutu z menu bocznym
export default function App() {
  return <RouterProvider router={router} />;
}