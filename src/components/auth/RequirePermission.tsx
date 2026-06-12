import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../auth/PermissionsContext';

interface Props {
  permission: string;
  children: ReactNode;
}

export function RequirePermission({ permission, children }: Props) {
  const { can, isLoading } = usePermissions();
  if (isLoading) return null;
  return can(permission) ? <>{children}</> : <Navigate to="/404" replace />;
}
