import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../api/todos';
import type { TodoListParams, TodoInput, DeletedTodoListParams } from '../api/todos';

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
    placeholderData: (prev) => prev,
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
