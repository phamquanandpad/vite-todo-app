import { api } from './client';
import type { Notification, Paginated } from '../types/api';

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  list: (params: NotificationListParams = {}) =>
    api.get<Paginated<Notification>>('/api/v1/notifications', { params }).then((r) => r.data),
  markRead: (id: number) =>
    api.patch(`/api/v1/notifications/${id}/read`),
  markAllRead: () =>
    api.post('/api/v1/notifications/read_all'),
  sendDemo: () =>
    api.post<Notification>('/api/v1/notifications/demo').then((r) => r.data),
};
