import { api } from './client';
import type { Paginated, Permission, PermissionInput, PermissionListParams, PermissionUser, PermissionUsersParams } from '../types/api';

export const permissionsApi = {
  list: (params: PermissionListParams) =>
    api.get<Paginated<Permission>>('/api/v1/permissions', { params }).then((r) => r.data),
  create: (body: PermissionInput) =>
    api.post<Permission>('/api/v1/permissions', body).then((r) => r.data),
  update: (id: number, body: Partial<PermissionInput>) =>
    api.patch<Permission>(`/api/v1/permissions/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/v1/permissions/${id}`),
  listUsers: (id: number, params: PermissionUsersParams) =>
    api.get<Paginated<PermissionUser>>(`/api/v1/permissions/${id}/users`, { params }).then((r) => r.data),
  grantUser: (id: number, userId: number) =>
    api.post<Permission>(`/api/v1/permissions/${id}/users/${userId}`).then((r) => r.data),
  revokeUser: (id: number, userId: number) =>
    api.delete(`/api/v1/permissions/${id}/users/${userId}`),
};
