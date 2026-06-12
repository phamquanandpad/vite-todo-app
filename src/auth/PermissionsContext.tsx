import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../hooks/useMe';
import { useAuth } from './useAuth';
import type { Role } from '../types/api';

interface PermissionsState {
  permissions: Set<string>;
  role: Role | null;
  can: (name: string) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsState>({
  permissions: new Set(),
  role: null,
  can: () => false,
  isLoading: false,
});

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe();
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const prevAuth = useRef<boolean>(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !prevAuth.current) {
      qc.invalidateQueries({ queryKey: ['me'] });
    } else if (!isAuthenticated && prevAuth.current) {
      qc.removeQueries({ queryKey: ['me'] });
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated, qc]);

  const permissions = useMemo(
    () => new Set(data?.permissions ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.permissions],
  );

  const can = useCallback((name: string) => permissions.has(name), [permissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, role: data?.role ?? null, can, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}
