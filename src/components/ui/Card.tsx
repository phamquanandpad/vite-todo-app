import type { ReactNode } from 'react';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white dark:bg-[#1f2028] rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-card hover:border-accent/30 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';
