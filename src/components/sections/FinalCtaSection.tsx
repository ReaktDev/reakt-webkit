import Button from '../ui/Button';

export default function FinalCtaSection({
  eyebrow,
  headline,
  text,
  buttonLabel,
  onCta,
  sectionId = 'final-cta',
  showKicker = true,
}: {
  eyebrow: string;
  headline: string;
  text: string;
  buttonLabel: string;
  onCta?: () => void;
  sectionId?: string;
  showKicker?: boolean;
}) {
  return (
    <section id={sectionId} className='pb-20'>
      <div className='sitekit-final-cta-panel mx-auto max-w-6xl rounded-[2.2rem] border border-[var(--sitekit-panel-border)] px-6 py-12 text-center lg:px-12'>
        {showKicker ? <p className='text-xs uppercase tracking-[0.22em]'>{eyebrow}</p> : null}
        <h2 className={`mx-auto max-w-3xl text-3xl font-semibold leading-tight text-[var(--sitekit-text-primary)] sm:text-4xl ${showKicker ? 'mt-3' : ''}`}>
          {headline}
        </h2>
        <p className='mx-auto mt-3 max-w-2xl text-[var(--sitekit-text-muted)]'>{text}</p>
        <Button variant='secondary' onClick={onCta} className='mt-6'>
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
}
