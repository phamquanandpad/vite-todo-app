import axios from 'axios';
import { api } from './client';
import type { AuthResponse } from '../types/api';

const base = import.meta.env.VITE_API_BASE_URL;

export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => axios.post(`${base}/api/v1/auth/register`, body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    axios.post<AuthResponse>(`${base}/api/v1/auth/login`, body).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.delete('/api/v1/auth/logout', { data: { refreshToken } }),
};
