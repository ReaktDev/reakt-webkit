import type { ReactNode } from 'react';

export default function Card({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-card-bg)] p-5 backdrop-blur ${
        className ?? ''
      }`}
    >
      {title ? (
        <h3 className='mb-4 text-lg font-semibold text-[var(--sitekit-text-primary)]'>{title}</h3>
      ) : null}
      {children}
    </section>
  );
}
