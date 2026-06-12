import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../auth/useAuth';

export function useMe() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
