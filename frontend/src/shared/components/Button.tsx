import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'filled' | 'tonal' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-onPrimary hover:brightness-95',
  tonal: 'bg-surfaceVariant text-onSurface hover:brightness-95',
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
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md3 px-4 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

