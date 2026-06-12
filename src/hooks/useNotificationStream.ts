import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { getConsumer, disconnectConsumer } from '../api/cable';
import type { Notification, Paginated } from '../types/api';

interface ConnectedPayload { connected: true; unread: number; }
type IncomingMessage = ConnectedPayload | Notification;

export function useNotificationStream(onNotify?: (n: Notification) => void) {
  const { accessToken, isAuthenticated } = useAuth();
  const qc = useQueryClient();
  // Keep a ref to the latest callback so the subscription effect doesn't need
  // to re-run (and re-subscribe) every time the caller re-renders.
  const onNotifyRef = useRef(onNotify);
  useEffect(() => { onNotifyRef.current = onNotify; });

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const consumer = getConsumer(accessToken);
    const subscription = consumer.subscriptions.create(
      { channel: 'NotificationsChannel' },
      {
        connected() {
          console.log('[ActionCable] NotificationsChannel connected');
        },
        disconnected() {
          console.warn('[ActionCable] NotificationsChannel disconnected');
        },
        rejected() {
          console.error('[ActionCable] NotificationsChannel subscription rejected');
        },
        received(msg: unknown) {
          console.log('[ActionCable] received:', msg);
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
          onNotifyRef.current?.(incomingMsg); // optional: toast / sound
        },
      },
    );

    return () => {
      subscription.unsubscribe();
    };
    // Re-subscribe only when the token rotates (refresh flow); the old consumer
    // is disconnected inside getConsumer when the token changes.
    // onNotify is intentionally excluded – we read it through onNotifyRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, qc]);

  // Tear down the shared consumer entirely on logout.
  useEffect(() => {
    if (!isAuthenticated) disconnectConsumer();
  }, [isAuthenticated]);
}
