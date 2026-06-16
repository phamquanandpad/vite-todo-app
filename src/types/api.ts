export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export type Role = 'member' | 'admin';

export interface MeResponse {
  id: number;
  username: string;
  email: string;
  role: Role;
  permissions: string[];
}

export interface Todo {
  id: number;
  task: string;
  description: string | null;
  status: TodoStatus;
  userId: number;
  estimateStartAt: string | null;
  estimateEndAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissionsCount: number;
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

export interface ErrorResponse {
  errors: string[];
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  builtin: boolean;
  roles: string[];
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionInput {
  name: string;
  description?: string;
  roles?: string[];
}

export interface PermissionListParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface PermissionUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  granted: boolean;
}

export interface PermissionUsersParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface UserListParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface Notification {
  id: number;
  title: string;
  body: string | null;
  link: string | null;     // client-side path, e.g. "/todos/42"
  read: boolean;
  createdAt: string;
}
