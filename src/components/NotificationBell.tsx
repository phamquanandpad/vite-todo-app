import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useSendDemoNotification,
} from '../hooks/useNotifications';
import { useNotificationStream } from '../hooks/useNotificationStream';
import { usePermissions } from '../auth/PermissionsContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useToast } from './toast/useToast';
import type { Notification } from '../types/api';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data } = useNotifications();
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const sendDemo = useSendDemoNotification();
  const toast = useToast();
  const { can } = usePermissions();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useNotificationStream((n) => {
    toast.show({
      variant: 'info',
      title: n.title,
      body: n.body ?? undefined,
      link: n.link ?? undefined,
    });
  });

  const handleClick = async (n: Notification) => {
    if (!n.read && can('notifications:read')) await markRead.mutateAsync(n.id);
    close();
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a2 2 0 01-2-2h4a2 2 0 01-2 2z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1
                           rounded-full bg-red-500 text-white text-xs leading-[1.1rem] text-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-lg border
                      border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] shadow-lg z-20
                      motion-safe:animate-[slide-down_150ms_ease-out]"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <button
              onClick={() =>
                sendDemo.mutate(undefined, {
                  onError: () => toast.error('Failed to send demo notification'),
                })
              }
              disabled={sendDemo.isPending}
              className="flex-1 text-xs text-center py-1.5 rounded-md bg-accent/10 text-accent
                         hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendDemo.isPending ? 'Sending…' : '⚡ Send test notification'}
            </button>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-accent hover:underline disabled:opacity-50 whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
          </div>

          {(data?.data.length ?? 0) === 0 ? (
            <div className="p-6 flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">You're all caught up</p>
            </div>
          ) : (
            data?.data.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b last:border-0 border-gray-100
                            dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800
                            ${n.read ? 'opacity-60' : ''}`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                {!n.read && <span className="inline-block mt-1 w-2 h-2 rounded-full bg-accent" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
