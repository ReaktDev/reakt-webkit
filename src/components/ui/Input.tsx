import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, id, className, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id ?? `${fallbackId}-${label.toLowerCase().replace(/\W/g, '-')}`;

    return (
      <label className='w-full' htmlFor={inputId}>
        <span className='mb-1 block text-sm font-medium text-[var(--sitekit-input-label)]'>{label}</span>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={`w-full rounded-xl border border-[var(--sitekit-input-border)] bg-[var(--sitekit-input-bg)] px-3 py-2 text-sm text-[var(--sitekit-input-text)] outline-none transition placeholder:text-[color:var(--sitekit-text-subtle)] focus:border-accent-500 focus:ring-2 focus:ring-accent-500/35 ${
            error ? 'border-rose-400/80 focus:border-rose-400/80 focus:ring-rose-400/35' : ''
          } ${className ?? ''}`}
        />
        {helperText ? <p className='mt-1 text-xs site-text-muted'>{helperText}</p> : null}
        {error ? <p className='mt-1 text-xs text-rose-300'>{error}</p> : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
export default Input;
