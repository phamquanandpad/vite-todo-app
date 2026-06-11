export type TodoStatus = 'pending' | 'in_progress' | 'completed';

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

export interface Notification {
  id: number;
  title: string;
  body: string | null;
  link: string | null;     // client-side path, e.g. "/todos/42"
  read: boolean;
  createdAt: string;
}
