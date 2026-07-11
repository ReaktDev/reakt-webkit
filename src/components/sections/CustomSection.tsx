export default function CustomSection({
  title,
  body,
  buttonLabel,
  buttonHref,
  sectionId = 'custom-section',
  showKicker = true,
}: {
  title: string;
  body: string;
  buttonLabel?: string;
  buttonHref?: string;
  sectionId?: string;
  showKicker?: boolean;
}) {
  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-7xl px-4 lg:px-8'>
        <div className='sitekit-card rounded-3xl border border-[var(--sitekit-card-border)] p-6'>
          {showKicker ? <p className='sitekit-kicker w-fit'>{title ? 'Custom section' : 'Untitled section'}</p> : null}
          <h3 className={`${showKicker ? 'mt-3' : ''} text-2xl font-semibold text-[var(--sitekit-text-primary)]`}>{title || 'Custom section'}</h3>
          <p className='mt-3 max-w-3xl text-sm leading-relaxed site-text-muted'>
            {body || 'Add section content in admin.'}
          </p>
          {buttonLabel ? (
            <a
              href={buttonHref || '#'}
              onClick={(event) => {
              if (!buttonHref) {
                event.preventDefault();
              }
              }}
              className='mt-6 inline-flex rounded-full border border-[var(--sitekit-button-outline-border)] bg-[var(--sitekit-surface-soft)] px-4 py-2 text-sm text-[var(--sitekit-text-primary)]'
            >
              {buttonLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
