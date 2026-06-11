import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';

const keys = {
  all: ['notifications'] as const,
  list: (page: number) => ['notifications', 'list', page] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
};

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: keys.list(page),
    queryFn: () => notificationsApi.list({ page, limit: 20 }),
    placeholderData: (prev) => prev,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unreadCount,
    // Derive from page 1, or expose a dedicated /unread_count endpoint server-side.
    queryFn: async () => {
      const res = await notificationsApi.list({ page: 1, limit: 50 });
      return res.data.filter((n) => !n.read).length;
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
