import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { UserListParams } from '../types/api';

const keys = {
  all: ['users'] as const,
  list: (p: UserListParams) => ['users', 'list', p] as const,
};

export function useUserList(params: UserListParams) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => usersApi.changeRole(id, role),
    meta: { silent: true },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
