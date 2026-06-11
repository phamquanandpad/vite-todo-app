export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title: string;
  body?: string;
  variant?: ToastVariant;
  duration?: number;
  link?: string;
}

export interface ToastApi {
  show: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  info:    (title: string, body?: string, link?: string) => string;
  success: (title: string, body?: string, link?: string) => string;
  warning: (title: string, body?: string, link?: string) => string;
  error:   (title: string, body?: string, link?: string) => string;
}
