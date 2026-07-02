import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-teal-700 text-white shadow-sm hover:bg-teal-600 active:bg-teal-800 focus-visible:ring-teal-500',
  secondary:
    'bg-white text-teal-700 border border-teal-200 shadow-sm hover:bg-teal-50 active:bg-teal-100 focus-visible:ring-teal-400',
  ghost:
    'bg-transparent text-teal-700 hover:bg-teal-50 active:bg-teal-100 focus-visible:ring-teal-400',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-400',
  gold:
    'bg-yellow-700 text-white shadow-sm hover:bg-yellow-600 active:bg-yellow-800 focus-visible:ring-yellow-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const iconSizeClasses: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const Spinner = ({ size }: { size: Size }) => (
  <svg
    className={cn('animate-spin shrink-0', iconSizeClasses[size])}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const leftIcon = loading ? (
      <Spinner size={size} />
    ) : icon && iconPosition === 'left' ? (
      <span className={cn('shrink-0', iconSizeClasses[size])}>{icon}</span>
    ) : null;

    const rightIcon =
      !loading && icon && iconPosition === 'right' ? (
        <span className={cn('shrink-0', iconSizeClasses[size])}>{icon}</span>
      ) : null;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center font-medium tracking-tight',
          'rounded-xl',
          'transition-all duration-150 ease-out',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...props}
      >
        {leftIcon}
        {children && (
          <span className={cn(loading && iconPosition === 'left' && 'ml-0.5')}>
            {children}
          </span>
        )}
        {rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
