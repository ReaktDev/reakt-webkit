type HeadingAlign = 'left' | 'center' | 'right';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: HeadingAlign;
}) {
  const alignClass: Record<HeadingAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mx-auto mb-8 max-w-3xl ${alignClass[align]}`}>
      {eyebrow ? (
        <p className='mb-3 text-xs uppercase tracking-[0.24em] text-accent-500/80'>{eyebrow}</p>
      ) : null}
      <h2 className='text-3xl font-semibold text-[var(--sitekit-text-primary)] sm:text-4xl'>{title}</h2>
      {description ? <p className='mt-3 site-text-muted'>{description}</p> : null}
    </div>
  );
}
