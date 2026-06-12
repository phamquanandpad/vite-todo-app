import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ToastApi, ToastOptions, ToastVariant } from './types';
import { ToastViewport } from './ToastViewport';

interface ToastItem extends Required<Omit<ToastOptions, 'link' | 'body' | 'action'>> {
  id: string;
  body?: string;
  link?: string;
  action?: ToastOptions['action'];
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  info: 4_000, success: 4_000, warning: 6_000, error: 8_000,
};
const MAX_VISIBLE = 5;

export const ToastContext = createContext<ToastApi>({} as ToastApi);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) { window.clearTimeout(t); timers.current.delete(id); }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    const id = crypto.randomUUID();
    const variant = opts.variant ?? 'info';
    const duration = opts.duration ?? DEFAULT_DURATION[variant];
    const item: ToastItem = {
      id,
      title: opts.title,
      body: opts.body,
      link: opts.link,
      action: opts.action,
      variant,
      duration,
    };

    setItems((prev) => {
      const next = [...prev, item];
      while (next.length > MAX_VISIBLE) {
        const dropped = next.shift()!;
        const t = timers.current.get(dropped.id);
        if (t) { window.clearTimeout(t); timers.current.delete(dropped.id); }
      }
      return next;
    });

    if (duration > 0) {
      const t = window.setTimeout(() => dismiss(id), duration);
      timers.current.set(id, t);
    }
    return id;
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    show,
    dismiss,
    clear: () => setItems([]),
    info:    (title, body, link) => show({ title, body, link, variant: 'info' }),
    success: (title, body, link) => show({ title, body, link, variant: 'success' }),
    warning: (title, body, link) => show({ title, body, link, variant: 'warning' }),
    error:   (title, body, link) => show({ title, body, link, variant: 'error' }),
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(<ToastViewport items={items} onDismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  );
}
