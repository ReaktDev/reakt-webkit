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

  const heroVisual = (
    <div className='sitekit-card relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)]'>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt || headline}
          className='absolute inset-0 h-full w-full object-cover'
        />
      ) : (
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(79,140,255,0.28),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(59,217,175,0.18),transparent_32%),linear-gradient(135deg,var(--sitekit-card-bg),var(--sitekit-surface-soft))]' />
      )}
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

          {heroVisual}
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
          </div>

          {heroVisual}
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
