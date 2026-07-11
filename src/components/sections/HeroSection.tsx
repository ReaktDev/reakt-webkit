import { useMemo } from 'react';
import Button from '../ui/Button';
import type { HeroLayoutPreset } from '../../types/site';

export default function HeroSection({
  kicker,
  headline,
  subheading,
  primaryCtaLabel,
  secondaryCtaLabel,
  layoutPreset = 'spotlight',
  imageUrl,
  imageAlt,
  showKicker = true,
  onPrimary,
  onSecondary,
  sectionId = 'hero',
}: {
  kicker: string;
  headline: string;
  subheading: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  layoutPreset?: HeroLayoutPreset;
  imageUrl?: string;
  imageAlt?: string;
  showKicker?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
  sectionId?: string;
}) {
  const ctaId = useMemo(() => `${headline.slice(0, 4)}-${Date.now()}`.replace(/\W/g, '-').toLowerCase(), [headline]);
  const proofItems = ['No-code editing', 'Local storage + export', 'Production-ready sections'];
  const supportingLines = [
    'Built to pass stakeholder reviews in minutes.',
    'Designed for agencies, consultants, clinics, contractors, and studios.',
  ];

  const ctaGroup = (
    <div className='flex flex-wrap gap-3'>
      <Button id={ctaId} onClick={onPrimary}>
        {primaryCtaLabel}
      </Button>
      <Button variant='outline' onClick={onSecondary}>
        {secondaryCtaLabel}
      </Button>
    </div>
  );

  const proofPills = (
    <div className='mt-5 flex flex-wrap gap-2'>
      {proofItems.map((label) => (
        <span
          key={label}
          className='inline-flex items-center rounded-full border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-3 py-1.5 text-xs text-[var(--sitekit-text-muted)]'
        >
          {label}
        </span>
      ))}
    </div>
  );

  const renderHeroContent = () => {
    if (layoutPreset === 'centeredLaunch') {
      return (
        <div className='relative mx-auto flex max-w-5xl flex-col items-center gap-7 px-4 py-16 text-center sm:py-18 lg:px-8 lg:py-24'>
          {showKicker ? <p className='sitekit-kicker mx-auto w-fit'>{kicker}</p> : null}
          <h1 className='mx-auto max-w-4xl text-4xl font-semibold leading-tight text-[var(--sitekit-text-primary)] sm:text-5xl lg:text-6xl'>
            {headline}
          </h1>
          <p className='mx-auto max-w-2xl text-lg site-text-muted'>{subheading}</p>
          <div className='flex justify-center'>{ctaGroup}</div>
          <div className='grid max-w-3xl gap-3 text-sm site-text-subtle sm:grid-cols-2'>
            {supportingLines.map((line) => (
              <p key={line} className='rounded-2xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-4 py-3'>
                {line}
              </p>
            ))}
          </div>
          {proofPills}
        </div>
      );
    }

    if (layoutPreset === 'splitProof') {
      return (
        <div className='relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-18 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24'>
          <div className='flex flex-col gap-7'>
            {showKicker ? <p className='sitekit-kicker w-fit'>{kicker}</p> : null}
            <h1 className='max-w-4xl text-4xl font-semibold leading-tight text-[var(--sitekit-text-primary)] sm:text-5xl lg:text-6xl'>
              {headline}
            </h1>
            <p className='max-w-2xl text-lg site-text-muted'>{subheading}</p>
            {ctaGroup}
          </div>

          <div className='sitekit-card rounded-3xl border border-[var(--sitekit-card-border)] p-6'>
            <p className='text-xs uppercase tracking-[0.22em] text-[var(--sitekit-accent)]'>Proof stack</p>
            <div className='mt-5 grid gap-3'>
              {supportingLines.map((line) => (
                <p key={line} className='rounded-2xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-4 py-3 text-sm site-text-muted'>
                  {line}
                </p>
              ))}
            </div>
            <div className='mt-5 grid gap-2'>
              {proofItems.map((label) => (
                <span key={label} className='text-sm font-semibold text-[var(--sitekit-text-primary)]'>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (layoutPreset === 'imageSplit') {
      return (
        <div className='relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-18 lg:grid-cols-2 lg:px-8 lg:py-24'>
          <div className='flex flex-col gap-7'>
            {showKicker ? <p className='sitekit-kicker w-fit'>{kicker}</p> : null}
            <h1 className='max-w-4xl text-4xl font-semibold leading-tight text-[var(--sitekit-text-primary)] sm:text-5xl lg:text-6xl'>
              {headline}
            </h1>
            <p className='max-w-2xl text-lg site-text-muted'>{subheading}</p>
            {ctaGroup}
            {proofPills}
          </div>

          <div className='sitekit-card relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)]'>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt || headline}
                className='absolute inset-0 h-full w-full object-cover'
              />
            ) : (
              <div className='absolute inset-0 grid place-items-center bg-[var(--sitekit-card-bg)] p-8 text-center'>
                <div>
                  <p className='text-xs uppercase tracking-[0.22em] text-[var(--sitekit-accent)]'>Hero image</p>
                  <p className='mt-3 text-sm site-text-muted'>Add an image URL in the Hero content controls.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className='relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:py-18 lg:px-8 lg:py-24'>
        {showKicker ? <p className='sitekit-kicker w-fit'>{kicker}</p> : null}

        <h1 className='max-w-4xl text-4xl font-semibold leading-tight text-[var(--sitekit-text-primary)] sm:text-5xl lg:text-6xl'>
          {headline}
        </h1>

        <p className='max-w-2xl text-lg site-text-muted'>{subheading}</p>

        {ctaGroup}

        <div className='mt-3 grid max-w-xl gap-2 text-sm site-text-subtle sm:grid-cols-2'>
          {supportingLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {proofPills}
      </div>
    );
  };

  return (
    <section id={sectionId} className='relative overflow-hidden' data-hero-layout={layoutPreset}>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 opacity-70'>
        <div className='absolute -left-36 top-10 h-72 w-72 rounded-full bg-[rgba(79,140,255,0.24)] blur-3xl' />
        <div className='absolute -right-28 top-24 h-72 w-72 rounded-full bg-[rgba(79,140,255,0.16)] blur-3xl' />
      </div>
      {renderHeroContent()}
    </section>
  );
}
