import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { getConsumer, disconnectConsumer } from '../api/cable';
import type { Notification, Paginated } from '../types/api';

interface ConnectedPayload { connected: true; unread: number; }
type IncomingMessage = ConnectedPayload | Notification;

export function useNotificationStream(onNotify?: (n: Notification) => void) {
  const { accessToken, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const consumer = getConsumer(accessToken);
    const subscription = consumer.subscriptions.create(
      { channel: 'NotificationsChannel' },
      {
        received(msg: unknown) {
          const incomingMsg = msg as IncomingMessage;
          if ('connected' in incomingMsg) {
            // Initial greeting: seed the unread count cache.
            qc.setQueryData(['notifications', 'unreadCount'], incomingMsg.unread);
            return;
          }

          // Prepend into the first page of the cached list (if loaded).
          qc.setQueriesData<Paginated<Notification>>(
            { queryKey: ['notifications', 'list'] },
            (prev) => (prev ? { ...prev, data: [incomingMsg, ...prev.data] } : prev),
          );
          qc.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
          onNotify?.(incomingMsg); // optional: toast / sound
        },
      },
    );

    return () => {
      subscription.unsubscribe();
    };
    // Re-subscribe when the token rotates (refresh flow); the old consumer is
    // disconnected inside getConsumer when the token changes.
  }, [isAuthenticated, accessToken, qc, onNotify]);

  // Tear down the shared consumer entirely on logout.
  useEffect(() => {
    if (!isAuthenticated) disconnectConsumer();
  }, [isAuthenticated]);
}
