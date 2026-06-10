# React UI Implementation Guide

A frontend implementation guide for the **Todo API** (`swagger/merged/v1.yaml`). This document describes how to build a React single-page app that consumes the API: authentication with JWT access/refresh tokens, todo CRUD with pagination/filtering, and user profile management.

## 1. API summary

Base URL: `http://localhost:3000` (development).

All request/response JSON keys are **camelCase** (e.g. `accessToken`, `userId`, `createdAt`). Auth-related request bodies still use snake_case for `password_confirmation` (matches the spec).

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | – | Register a user (`username`, `email`, `password`, `password_confirmation`) → `201` |
| POST | `/api/v1/auth/login` | – | Login → `{ user, accessToken, refreshToken }` |
| POST | `/api/v1/auth/refresh` | – | Exchange `refreshToken` → new `{ accessToken, refreshToken }` |
| DELETE | `/api/v1/auth/logout` | Bearer | Invalidate `refreshToken` → `204` |
| GET | `/api/v1/todos` | Bearer | List todos. Query: `status`, `page` (def 1), `limit` (def 20) → `{ data, meta }` |
| POST | `/api/v1/todos` | Bearer | Create todo (`task`, `description?`, `status?`) → `201` |
| GET | `/api/v1/todos/deleted` | Bearer | List soft-deleted (restorable) todos. Query: `page`, `limit` → `{ data, meta }` |
| GET | `/api/v1/todos/{id}` | Bearer | Get a todo |
| PATCH | `/api/v1/todos/{id}` | Bearer | Update a todo |
| DELETE | `/api/v1/todos/{id}` | Bearer | Soft-delete a todo → `204` |
| PATCH | `/api/v1/todos/{id}/restore` | Bearer | Restore a soft-deleted todo → `200` |
| GET | `/api/v1/users/{id}` | Bearer | Get current user |
| PATCH | `/api/v1/users/{id}` | Bearer | Update current user |
| DELETE | `/api/v1/users/{id}` | Bearer | Soft-delete current user → `204` |

### Core types

```ts
// src/types/api.ts
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface Todo {
  id: number;
  task: string;
  description: string | null;
  status: TodoStatus;
  userId: number;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  user: Pick<User, 'username' | 'email'>;
  accessToken: string;
  refreshToken: string;
}

// Errors come back as { errors: string[] } for 401/404/422
export interface ErrorResponse {
  errors: string[];
}
```

### Status codes to handle

- `401 Unauthorized` → access token missing/expired. Attempt a token refresh, then retry once; on failure, log out.
- `404 Not Found` → resource gone (or soft-deleted). Show a not-found state.
- `422 Unprocessable Entity` → validation errors. Render `errors[]` next to the form.

## 2. Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Build tool | **Vite** + React + TypeScript | Fast dev server, first-class TS |
| Routing | **React Router v6** | Nested routes, protected routes |
| Server state | **TanStack Query (React Query)** | Caching, refetch, pagination, mutations |
| HTTP client | **axios** | Interceptors for auth + refresh |
| Forms | **react-hook-form** + **zod** | Typed validation matching API rules |
| Styling | Your choice (Tailwind / CSS Modules) | Not prescriptive |

```bash
npm create vite@latest todo-ui -- --template react-ts
cd todo-ui
npm i axios @tanstack/react-query react-router-dom react-hook-form zod @hookform/resolvers
```

Set the API base URL via env:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
```

## 3. Project structure

```
src/
  api/
    client.ts          # axios instance + interceptors (refresh logic)
    auth.ts            # register / login / refresh / logout
    todos.ts           # todo CRUD
    users.ts           # user read/update/delete
  auth/
    AuthContext.tsx    # token + current user state
    useAuth.ts
    tokenStorage.ts    # read/write tokens
  components/
    ProtectedRoute.tsx
    TodoList.tsx
    TodoItem.tsx
    TodoForm.tsx
    DeletedTodoItem.tsx  # deleted todo row with Restore button
    StatusFilter.tsx
    Pagination.tsx
    ErrorList.tsx
  hooks/
    useTodos.ts        # React Query hooks (includes deleted todos & restore)
    useUser.ts
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    TodosPage.tsx
    DeletedTodosPage.tsx  # /deleted — list & restore soft-deleted todos
    ProfilePage.tsx
  types/
    api.ts
  App.tsx
  main.tsx
```

## 4. Token storage & auth flow

The API issues a short-lived **accessToken** and a longer-lived **refreshToken**. The login response also returns `user.id` indirectly — note the spec's login response only includes `username` and `email`, **not** the user `id`. Since `/users/{id}` needs an id, decode the JWT to obtain the subject claim, or have the backend include it. This guide decodes the access token.

```ts
// src/auth/tokenStorage.ts
const ACCESS = 'todo.accessToken';
const REFRESH = 'todo.refreshToken';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS),
  getRefresh: () => localStorage.getItem(REFRESH),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

// Minimal JWT payload decode (no verification — server verifies).
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}
```

> **Storage trade-off:** `localStorage` is simplest but is exposed to XSS. For higher security, have the backend set the refresh token as an `HttpOnly` cookie and keep only the access token in memory. The interceptor pattern below stays the same.

### Axios client with refresh-on-401

```ts
// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenStorage } from '../auth/tokenStorage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single in-flight refresh shared by all queued requests.
let refreshing: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');
  // Use a bare axios call so we don't recurse through this interceptor.
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
    { refreshToken },
  );
  tokenStorage.set(data.accessToken, data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => { refreshing = null; });
        const newToken = await refreshing;
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      } catch {
        tokenStorage.clear();
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);
```

### API modules

```ts
// src/api/auth.ts
import axios from 'axios';
import { api } from './client';
import type { AuthResponse } from '../types/api';

const base = import.meta.env.VITE_API_BASE_URL;

export const authApi = {
  register: (body: {
    username: string; email: string;
    password: string; password_confirmation: string;
  }) => axios.post(`${base}/api/v1/auth/register`, body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    axios.post<AuthResponse>(`${base}/api/v1/auth/login`, body).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.delete('/api/v1/auth/logout', { data: { refreshToken } }),
};
```

```ts
// src/api/todos.ts
import { api } from './client';
import type { Todo, Paginated, TodoStatus } from '../types/api';

export interface TodoListParams {
  status?: TodoStatus;
  page?: number;
  limit?: number;
}

export interface DeletedTodoListParams {
  page?: number;
  limit?: number;
}

export interface TodoInput {
  task: string;
  description?: string | null;
  status?: TodoStatus;
}

export const todosApi = {
  list: (params: TodoListParams) =>
    api.get<Paginated<Todo>>('/api/v1/todos', { params }).then((r) => r.data),
  listDeleted: (params: DeletedTodoListParams) =>
    api.get<Paginated<Todo>>('/api/v1/todos/deleted', { params }).then((r) => r.data),
  get: (id: number) =>
    api.get<Todo>(`/api/v1/todos/${id}`).then((r) => r.data),
  create: (body: TodoInput) =>
    api.post<Todo>('/api/v1/todos', body).then((r) => r.data),
  update: (id: number, body: Partial<TodoInput>) =>
    api.patch<Todo>(`/api/v1/todos/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/v1/todos/${id}`),
  restore: (id: number) =>
    api.patch<Todo>(`/api/v1/todos/${id}/restore`).then((r) => r.data),
};
```

```ts
// src/api/users.ts
import { api } from './client';
import type { User } from '../types/api';

export const usersApi = {
  get: (id: number) => api.get<User>(`/api/v1/users/${id}`).then((r) => r.data),
  update: (id: number, body: Partial<{
    username: string; email: string;
    password: string; password_confirmation: string;
  }>) => api.patch<User>(`/api/v1/users/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/v1/users/${id}`),
};
```

## 5. Auth context & protected routes

```tsx
// src/auth/AuthContext.tsx
import { createContext, useState, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage, decodeJwt } from './tokenStorage';

interface AuthState {
  userId: number | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>(null!);

function userIdFromToken(): number | null {
  const t = tokenStorage.getAccess();
  const payload = t ? decodeJwt<{ sub?: number | string }>(t) : null;
  return payload?.sub != null ? Number(payload.sub) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(userIdFromToken());

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStorage.set(res.accessToken, res.refreshToken);
    setUserId(userIdFromToken());
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefresh();
    try { if (refresh) await authApi.logout(refresh); } finally {
      tokenStorage.clear();
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userId, isAuthenticated: userId != null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

## 6. React Query hooks

```tsx
// src/hooks/useTodos.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todosApi, TodoListParams, TodoInput, DeletedTodoListParams } from '../api/todos';

const keys = {
  all: ['todos'] as const,
  list: (p: TodoListParams) => ['todos', 'list', p] as const,
  deleted: (p: DeletedTodoListParams) => ['todos', 'deleted', p] as const,
  detail: (id: number) => ['todos', 'detail', id] as const,
};

export function useTodos(params: TodoListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => todosApi.list(params),
    placeholderData: (prev) => prev, // keep page visible while fetching next page
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TodoInput) => todosApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<TodoInput> }) =>
      todosApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => todosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeletedTodos(params: DeletedTodoListParams) {
  return useQuery({
    queryKey: keys.deleted(params),
    queryFn: () => todosApi.listDeleted(params),
    placeholderData: (prev) => prev,
  });
}

export function useRestoreTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => todosApi.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
```

## 7. Key components

### Todos page (list + filter + pagination)

```tsx
// src/pages/TodosPage.tsx
import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoStatus } from '../types/api';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export function TodosPage() {
  const [status, setStatus] = useState<TodoStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useTodos({
    status: status || undefined,
    page,
    limit: 20,
  });

  return (
    <main>
      <h1>My Todos</h1>
      <TodoForm />

      <select value={status} onChange={(e) => { setStatus(e.target.value as TodoStatus | ''); setPage(1); }}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
      </select>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">{(error as Error).message}</p>}
      {data && (
        <>
          <TodoList todos={data.data} />
          <nav>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {data.meta.page} / {data.meta.totalPages}</span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}>Next</button>
          </nav>
        </>
      )}
    </main>
  );
}
```

### Todo item with status toggle + delete

```tsx
// src/components/TodoItem.tsx
import { Todo } from '../types/api';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';

export function TodoItem({ todo }: { todo: Todo }) {
  const update = useUpdateTodo();
  const remove = useDeleteTodo();

  return (
    <li>
      <strong>{todo.task}</strong>
      {todo.description && <p>{todo.description}</p>}
      <select
        value={todo.status}
        onChange={(e) =>
          update.mutate({ id: todo.id, body: { status: e.target.value as Todo['status'] } })
        }>
        <option value="pending">Pending</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
      </select>
      <button onClick={() => remove.mutate(todo.id)} disabled={remove.isPending}>
        Delete
      </button>
    </li>
  );
}
```

### Deleted todo item with restore button

```tsx
// src/components/DeletedTodoItem.tsx
import { Todo } from '../types/api';
import { useRestoreTodo } from '../hooks/useTodos';

export function DeletedTodoItem({ todo }: { todo: Todo }) {
  const restore = useRestoreTodo();

  return (
    <li>
      <strong>{todo.task}</strong>
      {todo.description && <p>{todo.description}</p>}
      <div>
        <span>Status: {todo.status}</span>
        <button
          onClick={() => restore.mutate(todo.id)}
          disabled={restore.isPending}
        >
          Restore
        </button>
      </div>
    </li>
  );
}
```

### Deleted todos page (list + pagination + restore)

```tsx
// src/pages/DeletedTodosPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeletedTodos } from '../hooks/useTodos';
import { DeletedTodoItem } from '../components/DeletedTodoItem';

export function DeletedTodosPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useDeletedTodos({ page, limit: 20 });

  return (
    <main>
      <header>
        <h1>Deleted Todos</h1>
        <Link to="/">← Back to Todos</Link>
      </header>
      <p>These todos have been soft-deleted and can be restored. Once purged, they cannot be recovered.</p>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">{(error as Error).message}</p>}
      {data && data.data.length === 0 && <p>No deleted todos.</p>}
      {data && data.data.length > 0 && (
        <>
          <ul>
            {data.data.map((todo) => (
              <DeletedTodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
          <nav>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {data.meta.page} / {data.meta.totalPages}</span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >Next</button>
          </nav>
        </>
      )}
    </main>
  );
}
```

### Form with validation + 422 handling

```tsx
// src/components/TodoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useCreateTodo } from '../hooks/useTodos';
import type { ErrorResponse } from '../types/api';

const schema = z.object({
  task: z.string().min(1, 'Task is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});
type FormValues = z.infer<typeof schema>;

export function TodoForm() {
  const create = useCreateTodo();
  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: 'pending' } });

  const onSubmit = (values: FormValues) =>
    create.mutate(values, {
      onSuccess: () => reset(),
      onError: (err) => {
        const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
        apiErrors?.forEach((m) => setError('task', { message: m }));
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Task" {...register('task')} />
      {errors.task && <span role="alert">{errors.task.message}</span>}
      <input placeholder="Description (optional)" {...register('description')} />
      <button type="submit" disabled={create.isPending}>Add</button>
    </form>
  );
}
```

## 8. App wiring

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TodosPage } from './pages/TodosPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeletedTodosPage } from './pages/DeletedTodosPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<TodosPage />} />
              <Route path="/deleted" element={<DeletedTodosPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## 9. CORS (backend)

This is an API-only Rails app on a different origin (`:3000`) than the dev frontend (Vite, typically `:5173`). Enable CORS in the backend:

```ruby
# Gemfile
gem 'rack-cors'

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :patch, :delete, :options],
      expose: ['Authorization']
  end
end
```

## 10. Implementation checklist

1. Scaffold Vite + TS project; install deps; set `VITE_API_BASE_URL`.
2. Add `src/types/api.ts` from the spec schemas.
3. Build `tokenStorage` + axios `client` with the refresh interceptor.
4. Add API modules (`auth`, `todos`, `users`).
5. Wire `AuthProvider`, `ProtectedRoute`, router (login/register/todos/profile).
6. Build login & register pages (handle `401`/`422`).
7. Build todos page: list, status filter, pagination, create/update/delete via React Query.
8. Build deleted todos page (`/deleted`): list soft-deleted todos, restore via `PATCH /todos/{id}/restore`.
9. Build profile page (GET/PATCH/DELETE current user via decoded `userId`).
10. Enable CORS on the backend.
11. Verify the full flow: register → login → CRUD todos → delete → restore from `/deleted` → token refresh on expiry → logout.

## Open questions for the backend

- **Login response lacks `user.id`** — the frontend needs it for `/users/{id}`. Either add `id` to the login/refresh response, or confirm the JWT `sub` claim carries the user id (this guide assumes `sub`).
- **Refresh token rotation** — confirm whether `/auth/refresh` invalidates the old refresh token (this guide stores the rotated one returned in the response).
