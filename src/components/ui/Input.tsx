import type { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
        <input
          className={`w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 outline-none
            border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1f2028] text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-accent/50 focus:border-accent focus:shadow-sm
            hover:border-gray-400 dark:hover:border-gray-500
            ${error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
            ${icon ? 'pl-10' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-red-500 text-xs mt-1 block flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L9 16.586 5.313 12.899a1 1 0 00-1.414 1.414l4.5 4.5a1 1 0 001.414 0l8.586-8.586z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
