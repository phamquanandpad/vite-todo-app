import type { InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  isLoading?: boolean;
}

export function Toggle({ isLoading = false, disabled, ...props }: ToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        disabled={disabled || isLoading}
        {...props}
      />
      <div
        className={[
          'w-10 h-6 rounded-full transition-colors duration-200',
          'bg-gray-200 dark:bg-gray-700',
          'peer-checked:bg-accent',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          'after:content-[\'\'] after:absolute after:top-0.5 after:left-0.5',
          'after:bg-white after:rounded-full after:h-5 after:w-5',
          'after:transition-all after:duration-200',
          'peer-checked:after:translate-x-4',
          isLoading ? 'animate-pulse' : '',
        ].join(' ')}
      />
    </label>
  );
}
