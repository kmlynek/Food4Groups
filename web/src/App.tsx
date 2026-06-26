import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { allRoles } from './types/authTypes';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={allRoles}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

// App odpowiada za główny routing aplikacji
// Pełne strony, takie jak login i dashboard, podpinamy tutaj jako trasy
export default function App() {
  return <RouterProvider router={router} />;
}