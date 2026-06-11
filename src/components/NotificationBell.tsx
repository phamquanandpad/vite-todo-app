import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useUnreadCount, useMarkRead } from '../hooks/useNotifications';
import { useNotificationStream } from '../hooks/useNotificationStream';
import { useToast } from './toast/useToast';
import type { Notification } from '../types/api';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data } = useNotifications();
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const toast = useToast();

  useNotificationStream((n) => {
    toast.show({
      variant: 'info',
      title: n.title,
      body: n.body ?? undefined,
      link: n.link ?? undefined,
    });
  });

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead.mutateAsync(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative p-2" title="Notifications">
        {/* bell icon */}
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
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-lg border
                        border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] shadow-lg z-20">
          {(data?.data.length ?? 0) === 0 ? (
            <p className="p-4 text-sm text-gray-500">No notifications</p>
          ) : (
            data!.data.map((n) => (
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
