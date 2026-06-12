import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
