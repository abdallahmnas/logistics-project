import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type { UserRole } from '../../types/common.types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAppSelector(state => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If not authorized, send back to appropriate dashboard
    return <Navigate to={user.role === 'customer' ? '/dashboard' : '/admin'} replace />;
  }

  return <>{children}</>;
};
