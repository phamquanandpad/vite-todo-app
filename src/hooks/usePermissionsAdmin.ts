import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '../api/permissions';
import type { PermissionInput, PermissionListParams, PermissionUsersParams } from '../types/api';

const keys = {
  all: ['permissions'] as const,
  list: (p: PermissionListParams) => ['permissions', 'list', p] as const,
  users: (id: number, p: PermissionUsersParams) => ['permissions', id, 'users', p] as const,
};

export function usePermissionList(params: PermissionListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => permissionsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PermissionInput) => permissionsApi.create(body),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<PermissionInput> }) =>
      permissionsApi.update(id, body),
    meta: { silent: true },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function usePermissionUsers(id: number, params: PermissionUsersParams) {
  return useQuery({
    queryKey: keys.users(id, params),
    queryFn: () => permissionsApi.listUsers(id, params),
    placeholderData: (prev) => prev,
  });
}

export function useGrantPermissionUser(permissionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => permissionsApi.grantUser(permissionId, userId),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', permissionId, 'users'] }),
  });
}

export function useRevokePermissionUser(permissionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => permissionsApi.revokeUser(permissionId, userId),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', permissionId, 'users'] }),
  });
}
