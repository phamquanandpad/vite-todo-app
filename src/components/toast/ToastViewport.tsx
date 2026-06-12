import { useNavigate } from 'react-router-dom';
import type { ToastAction, ToastVariant } from './types';

interface Item {
  id: string;
  title: string;
  body?: string;
  link?: string;
  action?: ToastAction;
  variant: ToastVariant;
}

const styles: Record<ToastVariant, string> = {
  info:    'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100',
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/30 dark:text-green-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100',
  error:   'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100',
};

const icons: Record<ToastVariant, string> = {
  info:    'ℹ',
  success: '✓',
  warning: '⚠',
  error:   '✕',
};

const ariaRole = (v: ToastVariant) => (v === 'error' || v === 'warning' ? 'alert' : 'status');

export function ToastViewport({ items, onDismiss }: { items: Item[]; onDismiss: (id: string) => void }) {
  const navigate = useNavigate();

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed top-20 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto z-50 flex w-auto sm:w-full sm:max-w-xs flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={ariaRole(t.variant)}
          aria-live={ariaRole(t.variant) === 'alert' ? 'assertive' : 'polite'}
          onClick={() => { if (t.link) navigate(t.link); onDismiss(t.id); }}
          className={`pointer-events-auto cursor-pointer rounded-lg border px-4 py-3 shadow-md
                      motion-safe:animate-[slide-in-right_180ms_ease-out] ${styles[t.variant]}`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-sm font-bold flex-shrink-0" aria-hidden="true">
              {icons[t.variant]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs opacity-90 break-words">{t.body}</p>}
              {t.action && (
                <button
                  onClick={(e) => { e.stopPropagation(); t.action!.onClick(); onDismiss(t.id); }}
                  className="mt-1.5 text-xs font-semibold underline underline-offset-2 hover:no-underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}
              className="ml-2 text-current opacity-60 hover:opacity-100 flex-shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
