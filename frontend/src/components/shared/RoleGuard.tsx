import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const CASHIER_ALLOWED = ['/billing', '/products', '/settings'];

interface RoleGuardProps {
  children: React.ReactNode;
}

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export function RoleGuard({ children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin sees everything
  if (user.role === 'admin') return <>{children}</>;

  // Cashier: check current path
  const path = window.location.pathname;
  const allowed = CASHIER_ALLOWED.some((p) => path === p || path.startsWith(p + '/'));

  if (!allowed) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
}

export function isCashier(role?: string) {
  return role === 'cashier';
}
