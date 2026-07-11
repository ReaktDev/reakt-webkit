import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import Button from '../ui/Button';
import type { FooterConfig, SectionFontFamily, SectionStyleConfig, SocialLink } from '../../types/site';

type FooterNav = { label: string; href: string };

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
    variables['--sitekit-panel'] = styles.backgroundColor;
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

export default function Footer({
  businessName,
  contactEmail,
  socialLinks,
  ctaLabel,
  onCta,
  navItems,
  settings,
}: {
  businessName: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  ctaLabel: string;
  onCta?: () => void;
  navItems?: FooterNav[];
  settings?: FooterConfig;
}) {
  const nav = navItems && navItems.length > 0 ? navItems : [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];
  const description = settings?.description?.trim() || 'Built with Reakt WebKit for premium service businesses.';
  const showNavigation = settings?.showNavigation ?? true;
  const showSocialLinks = settings?.showSocialLinks ?? true;
  const showContactEmail = settings?.showContactEmail ?? true;
  const showCta = settings?.showCta ?? true;
  const resolvedCtaLabel = settings?.ctaLabel?.trim() || ctaLabel;
  const copyrightText = settings?.copyrightText?.trim() || 'All rights reserved.';
  const releaseText = settings?.releaseText?.trim() || '';
  const fullWidth = settings?.fullWidth ?? true;
  const footerGridClass = showNavigation ? 'lg:grid-cols-[1.4fr_1fr_1fr]' : 'lg:grid-cols-[1.4fr_1fr]';

  return (
    <footer
      className='sitekit-panel sitekit-frame-style border-t border-[var(--sitekit-panel-border)]'
      style={styleVars(settings?.styleSettings)}
    >
      <div className={`sitekit-footer-inner grid w-full gap-8 py-10 ${footerGridClass} ${fullWidth ? 'sitekit-footer-inner--full' : 'sitekit-footer-inner--contained'}`}>
        <div>
          <p className='text-xl font-semibold'>{businessName}</p>
          <p className='mt-2 max-w-md text-sm site-text-muted'>{description}</p>
        </div>

        {showNavigation ? (
          <div>
            <h3 className='mb-3 text-sm font-semibold uppercase tracking-[0.14em] site-text-subtle'>Navigate</h3>
            <ul className='space-y-2'>
              {nav.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <a
                    href={item.href}
                    aria-label={`Navigate to ${item.label.toLowerCase()}`}
                    className='text-sm site-text-muted transition-colors hover:text-[var(--sitekit-text-primary)]'
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className='space-y-3'>
          {showCta ? (
            <Button variant='secondary' onClick={onCta} className='justify-self-start'>
              {resolvedCtaLabel}
            </Button>
          ) : null}
          {showContactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className='block text-sm site-text-muted underline-offset-4 hover:text-[var(--sitekit-text-primary)] hover:underline'
            >
              {contactEmail}
            </a>
          ) : null}
          {showSocialLinks ? (
          <div className='flex flex-wrap gap-3 text-xs site-text-muted'>
            {socialLinks.map((link) => (
              <a
                href={link.url}
                key={link.id}
                className='rounded-full border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-3 py-1.5 hover:bg-[var(--sitekit-button-outline-hover-bg)]'
                rel='noreferrer'
                target='_blank'
              >
                {link.label}
              </a>
            ))}
          </div>
          ) : null}
        </div>
      </div>
      <div className='border-t border-[var(--sitekit-panel-border)] px-4 py-4 text-center text-xs site-text-subtle lg:px-8'>
        <Link to='/' className='hover:text-[var(--sitekit-text-primary)]'>
          © {new Date().getFullYear()} {businessName}. {copyrightText}
        </Link>
        {releaseText ? <span className='ml-1 site-text-subtle'>{releaseText}</span> : null}
      </div>
    </footer>
  );
}
