import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  children: ReactNode;
}

const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-b from-accent-600 to-[var(--sitekit-accent-end)] text-white shadow-[0_12px_28px_-12px_rgba(47,106,232,0.6)] hover:from-accent-700 hover:to-accent-500',
  secondary:
    'bg-[var(--sitekit-button-secondary-bg)] text-[var(--sitekit-button-secondary-text)] hover:brightness-105',
  outline:
    'border border-[var(--sitekit-button-outline-border)] text-[var(--sitekit-button-outline-text)] bg-[var(--sitekit-button-outline-bg)] hover:bg-[var(--sitekit-button-outline-hover-bg)] hover:border-[var(--sitekit-button-outline-hover-border)]',
  danger: 'bg-rose-600 text-white shadow-[0_12px_28px_-12px_rgba(244,63,94,0.5)] hover:bg-rose-700',
};

export default function Button({ variant = 'primary', fullWidth, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`sitekit-button sitekit-button--${variant} inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${
        styles[variant]
      } ${
        fullWidth ? 'w-full' : ''
      } ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
