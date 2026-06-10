import { api } from './client';
import type { User } from '../types/api';

export const usersApi = {
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
};
