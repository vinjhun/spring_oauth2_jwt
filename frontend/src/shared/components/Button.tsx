import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'filled' | 'tonal' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-onPrimary shadow-sm hover:brightness-95',
  tonal: 'bg-surfaceVariant text-onSurface hover:bg-outline/15',
  text: 'text-primary hover:bg-surfaceVariant',
};

export function Button({
  children,
  className = '',
  variant = 'filled',
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md3 px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
