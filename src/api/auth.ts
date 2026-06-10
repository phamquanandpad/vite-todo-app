import axios from 'axios';
import { api } from './client';
import type { AuthResponse } from '../types/api';

const base = import.meta.env.VITE_API_BASE_URL;
const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };

export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => axios.post(`${base}/api/v1/auth/register`, body, { headers: jsonHeaders }).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    axios.post<AuthResponse>(`${base}/api/v1/auth/login`, body, {
      headers: jsonHeaders,
      withCredentials: true,
    }).then((r) => r.data),

  // Cookie is sent automatically; backend returns new accessToken.
  refresh: () =>
    axios.post<Pick<AuthResponse, 'accessToken'>>(`${base}/api/v1/auth/refresh`, {}, {
      headers: jsonHeaders,
      withCredentials: true,
    }).then((r) => r.data),

  // Cookie cleared by the backend.
  logout: () => api.delete('/api/v1/auth/logout'),
};

