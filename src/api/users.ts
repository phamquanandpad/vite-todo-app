import { api } from './client';
import type { Paginated, User, UserListParams } from '../types/api';

export const usersApi = {
  list: (params: UserListParams) =>
    api.get<Paginated<User>>('/api/v1/users', { params }).then((r) => r.data),
  get: (id: number) => api.get<User>(`/api/v1/users/${id}`).then((r) => r.data),
  update: (
    id: number,
    body: Partial<{
      username: string;
      email: string;
      password: string;
      password_confirmation: string;
    }>,
  ) => api.patch<User>(`/api/v1/users/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/v1/users/${id}`),
  changeRole: (id: number, role: string) =>
    api.patch<User>(`/api/v1/users/${id}/update_role`, { role }).then((r) => r.data),
};
