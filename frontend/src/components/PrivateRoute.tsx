import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/companies" />;
  return children;
}
