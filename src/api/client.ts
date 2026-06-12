import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Access token lives in memory (set by AuthContext).
// Use a getter/setter so the interceptor always reads the latest value
// without needing a direct dependency on React context.
let _accessToken: string | null = null;
export const setClientAccessToken = (token: string | null) => { _accessToken = token; };

let _on403: (() => void) | null = null;
export const setOn403Handler = (fn: (() => void) | null) => { _on403 = fn; };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send HttpOnly refresh cookie on every request
});

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// Single in-flight refresh shared by all queued requests.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Cookie is sent automatically (withCredentials). No body needed.
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
    {},
    { withCredentials: true },
  );
  _accessToken = data.accessToken;
  return data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 403) {
      _on403?.();
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => { refreshing = null; });
        const newToken = await refreshing;
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      } catch {
        _accessToken = null;
        const from = window.location.pathname + window.location.search;
        const loginUrl = from && from !== '/login'
          ? `/login?from=${encodeURIComponent(from)}&expired=1`
          : '/login';
        window.location.assign(loginUrl);
      }
    }
    return Promise.reject(error);
  },
);
