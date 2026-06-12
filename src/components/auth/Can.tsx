import type { ReactNode } from 'react';
import { usePermissions } from '../../auth/PermissionsContext';

interface Props {
  permission: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: Props) {
  const { can, isLoading } = usePermissions();
  if (isLoading) return null;
  const names = Array.isArray(permission) ? permission : [permission];
  return names.every(can) ? <>{children}</> : <>{fallback}</>;
}
