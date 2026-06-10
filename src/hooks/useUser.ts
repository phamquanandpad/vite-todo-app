import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export function useUser(id: number | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id!),
    enabled: id != null,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<{
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
      }>;
    }) => usersApi.update(id, body),
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: ['users', id] }),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
  });
}
