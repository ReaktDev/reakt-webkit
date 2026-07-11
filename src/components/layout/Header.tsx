import { useMemo, useState, type CSSProperties } from 'react';
import Button from '../ui/Button';
import type { HeaderConfig, SectionFontFamily, SectionStyleConfig } from '../../types/site';

type NavItem = { id: string; label: string; href?: string };

const fallbackNavItems: NavItem[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'process', label: 'Process' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
  { id: 'final-cta', label: 'Get started' },
];

const fontFamilyValue: Record<SectionFontFamily, string> = {
  inherit: 'inherit',
  inter: '"Inter", "Manrope", system-ui, sans-serif',
  manrope: '"Manrope", "Inter", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};

const styleVars = (styleSettings?: SectionStyleConfig): CSSProperties => {
  const styles = styleSettings ?? ({} as Partial<SectionStyleConfig>);
  const variables: Record<string, string> = {};

  if (styles.backgroundColor) {
    variables['--sitekit-header-bg'] = styles.backgroundColor;
    variables['--sitekit-section-bg'] = styles.backgroundColor;
  }
  if (styles.textColor) {
    variables['--sitekit-text-primary'] = styles.textColor;
  }
  if (styles.mutedTextColor) {
    variables['--sitekit-text-muted'] = styles.mutedTextColor;
    variables['--sitekit-text-subtle'] = styles.mutedTextColor;
  }
  if (styles.accentColor) {
    variables['--sitekit-accent'] = styles.accentColor;
    variables['--sitekit-accent-end'] = styles.accentColor;
  }
  if (styles.cardBackgroundColor) {
    variables['--sitekit-surface-soft'] = styles.cardBackgroundColor;
    variables['--sitekit-card-bg'] = styles.cardBackgroundColor;
  }
  if (styles.cardBorderColor) {
    variables['--sitekit-panel-border'] = styles.cardBorderColor;
    variables['--sitekit-card-border'] = styles.cardBorderColor;
  }
  if (styles.fontFamily && styles.fontFamily !== 'inherit') {
    variables.fontFamily = fontFamilyValue[styles.fontFamily];
  }

  return variables as CSSProperties;
};

export default function Header({
  businessName,
  tagline,
  logoUrl,
  ctaLabel,
  onCta,
  navItems,
  settings,
}: {
  businessName: string;
  tagline: string;
  logoUrl: string;
  ctaLabel: string;
  onCta?: () => void;
  navItems?: NavItem[];
  settings?: HeaderConfig;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = navItems && navItems.length > 0 ? navItems : fallbackNavItems;
  const showLogo = settings?.showLogo ?? true;
  const showTagline = settings?.showTagline ?? true;
  const showNavigation = settings?.showNavigation ?? true;
  const showCta = settings?.showCta ?? true;
  const logoPreset = settings?.logoPreset ?? 'badge';
  const resolvedCtaLabel = settings?.ctaLabel?.trim() || ctaLabel;
  const fullWidth = settings?.fullWidth ?? true;
  const navWithHref = useMemo(
    () =>
      nav.map((item) => ({
        label: item.label,
        href: item.href ?? `#${item.id}`,
      })),
    [nav],
  );

  return (
    <header
      className='sitekit-appbar sitekit-frame-style sticky top-0 z-50 border-b border-[var(--sitekit-panel-border)] backdrop-blur-xl'
      style={styleVars(settings?.styleSettings)}
    >
      <div className={`sitekit-glow sitekit-appbar-inner relative z-10 flex w-full flex-wrap items-center justify-between gap-3 py-4 ${fullWidth ? 'sitekit-appbar-inner--full' : 'sitekit-appbar-inner--contained'}`}>
        <a href='/' className='sitekit-brand-lockup flex min-w-0 items-center gap-3'>
          {showLogo && logoPreset === 'badge' && logoUrl ? (
            <img
              src={logoUrl}
              alt={`${businessName} logo`}
              className='h-10 w-10 rounded-full border border-[var(--sitekit-card-border)] object-cover'
            />
          ) : showLogo && logoPreset === 'badge' ? (
            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 text-sm font-black text-white'>
              {businessName.charAt(0)}
            </span>
          ) : null}
          {showLogo && logoPreset === 'framed' && logoUrl ? (
            <span className='inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] p-1.5'>
              <img src={logoUrl} alt={`${businessName} logo`} className='max-h-full max-w-full object-contain' />
            </span>
          ) : showLogo && logoPreset === 'framed' ? (
            <span className='inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] text-base font-black text-[var(--sitekit-text-primary)]'>
              {businessName.charAt(0)}
            </span>
          ) : null}
          {showLogo && logoPreset === 'wordmark' ? (
            <span className='inline-flex min-h-8 items-center rounded-full border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-2.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--sitekit-text-primary)]'>
              {businessName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word.charAt(0))
                .join('') || businessName.charAt(0)}
            </span>
          ) : null}
          <span className='flex min-w-0 flex-col'>
            <span className='text-lg font-semibold tracking-wide text-[var(--sitekit-text-primary)]'>{businessName}</span>
            {showTagline ? <span className='text-[11px] uppercase tracking-[0.1em] site-text-subtle'>{tagline}</span> : null}
          </span>
        </a>

        {showNavigation ? (
          <button
            type='button'
            className='rounded-lg border border-[var(--sitekit-card-border)] px-3 py-2 text-[var(--sitekit-text-primary)] lg:hidden'
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls='mobile-nav'
            aria-label='Toggle navigation'
          >
            Menu
          </button>
        ) : null}

        {showNavigation ? (
        <nav id='mobile-nav' className={`${menuOpen ? 'block' : 'hidden'} w-full lg:block lg:w-auto`} aria-label='Primary'>
          <ul className='mt-3 flex flex-wrap gap-2 text-sm lg:flex lg:items-center lg:space-x-2 lg:mt-0'>
            {navWithHref.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className='inline-flex rounded-full px-3 py-1.5 text-[var(--sitekit-text-muted)] transition hover:text-[var(--sitekit-text-primary)] hover:bg-[var(--sitekit-surface-soft)]'
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        ) : null}

        {showCta ? (
          <Button variant='primary' onClick={onCta} className='ml-auto hidden lg:inline-flex'>
            {resolvedCtaLabel}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
