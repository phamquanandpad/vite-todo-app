import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  children?: ReactNode;
  variant?: 'default' | 'destructive';
}

export function Dialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  onConfirm,
  onClose,
  children,
  variant = 'default',
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      className="inset-0 m-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2028] p-0 max-w-md w-full max-h-[90vh] overflow-y-auto backdrop:bg-black/40 backdrop:backdrop-blur-sm open:motion-safe:animate-[modal-in_150ms_ease-out]"
    >
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
        {children}
        {onConfirm !== undefined && (
          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={variant === 'destructive' ? 'danger' : 'primary'}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
