import { api } from './client';
import type { Todo, Paginated, TodoStatus } from '../types/api';

export interface TodoListParams {
  status?: TodoStatus;
  page?: number;
  limit?: number;
}

export interface TodoInput {
  task: string;
  description?: string | null;
  status?: TodoStatus;
}

export interface DeletedTodoListParams {
  page?: number;
  limit?: number;
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
