import type { CSSProperties, ReactNode } from 'react';
import Header from '../layout/Header';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import TestimonialSection from '../sections/TestimonialSection';
import ProcessSection from '../sections/ProcessSection';
import FAQSection from '../sections/FAQSection';
import ContactSection from '../sections/ContactSection';
import FinalCtaSection from '../sections/FinalCtaSection';
import CustomSection from '../sections/CustomSection';
import Footer from '../layout/Footer';
import type { PageSectionConfig, SectionFontFamily, SectionStyleConfig, SideMenuConfig, SiteConfig } from '../../types/site';
import { defaultSiteConfig } from '../../config/defaultSiteConfig';

const sectionFontFamilyValue: Record<SectionFontFamily, string> = {
  inherit: 'inherit',
  inter: '"Inter", "Manrope", system-ui, sans-serif',
  manrope: '"Manrope", "Inter", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};

const sectionStyleVars = (styleSettings?: SectionStyleConfig): CSSProperties => {
  const styles = styleSettings ?? ({} as Partial<SectionStyleConfig>);
  const variables: Record<string, string> = {};

  if (styles.backgroundColor) {
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
    variables['--sitekit-kicker-text'] = styles.accentColor;
  }
  if (styles.cardBackgroundColor) {
    variables['--sitekit-card-bg'] = styles.cardBackgroundColor;
    variables['--sitekit-panel'] = styles.cardBackgroundColor;
    variables['--sitekit-surface-soft'] = styles.cardBackgroundColor;
  }
  if (styles.cardBorderColor) {
    variables['--sitekit-card-border'] = styles.cardBorderColor;
    variables['--sitekit-panel-border'] = styles.cardBorderColor;
    variables['--sitekit-divider'] = styles.cardBorderColor;
  }
  if (styles.fontFamily && styles.fontFamily !== 'inherit') {
    variables.fontFamily = sectionFontFamilyValue[styles.fontFamily];
  }

  return variables as CSSProperties;
};

const sideMenuStyleVars = (sideMenu: SideMenuConfig): CSSProperties => {
  const styles = sideMenu.styleSettings ?? ({} as Partial<SectionStyleConfig>);
  return {
    ...sectionStyleVars(sideMenu.styleSettings),
    '--sitekit-side-menu-width': `${sideMenu.width}rem`,
    '--sitekit-side-menu-font-size': `${sideMenu.fontSize}rem`,
    '--sitekit-side-menu-bg': styles.backgroundColor || styles.cardBackgroundColor || '',
    '--sitekit-side-menu-border': styles.cardBorderColor || '',
  } as CSSProperties;
};

const resolvePage = (config: SiteConfig, pageSlug?: string) => {
  if (!config.pages || config.pages.length === 0) {
    return undefined;
  }

  const normalizedSlug = pageSlug?.trim().toLowerCase();
  const normalizeLabel = (label: string) =>
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '');

  const exactMatch = normalizedSlug
    ? config.pages.find((page) => page.enabled && page.slug === normalizedSlug)
    : undefined;

  if (exactMatch) {
    return exactMatch;
  }

  const byLabelMatch = normalizedSlug
    ? config.pages.find((page) => page.enabled && normalizeLabel(page.label) === normalizedSlug)
    : undefined;

  if (byLabelMatch) {
    return byLabelMatch;
  }

  return config.pages.find((page) => page.enabled) ?? config.pages[0];
};

const getSectionFallback = (config: SiteConfig) => (config.pageSections.length > 0 ? config.pageSections : defaultSiteConfig.pageSections);

const layoutSectionOrder = {
  classic: ['hero', 'services', 'about', 'testimonials', 'process', 'faq', 'contact', 'finalCta', 'custom'],
  conversion: ['hero', 'services', 'finalCta', 'process', 'testimonials', 'faq', 'contact', 'about', 'custom'],
  editorial: ['hero', 'about', 'process', 'services', 'testimonials', 'faq', 'finalCta', 'contact', 'custom'],
} as const;

const orderSectionsForLayout = (sections: PageSectionConfig[], layoutPreset: SiteConfig['theme']['layoutPreset']) => {
  const order = layoutSectionOrder[layoutPreset] ?? layoutSectionOrder.classic;
  const ranked = new Map(order.map((sectionType, index) => [sectionType, index]));

  return [...sections].sort((a, b) => {
    const aRank = ranked.get(a.sectionType) ?? order.length;
    const bRank = ranked.get(b.sectionType) ?? order.length;
    if (aRank === bRank) {
      return sections.indexOf(a) - sections.indexOf(b);
    }
    return aRank - bRank;
  });
};

export default function SitePageContent({
  config,
  compact,
  pageSlug,
  trackEvent,
}: {
  config: SiteConfig;
  compact?: boolean;
  pageSlug?: string;
  trackEvent?: (eventName: string, value: string) => void;
}) {
  const activePage = resolvePage(config, pageSlug);
  const sections = activePage?.sections?.length ? activePage.sections : getSectionFallback(config);
  const enabledSections = orderSectionsForLayout(
    sections.filter((section) => section.enabled),
    config.theme.layoutPreset,
  );

  const findAnchor = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const contactAnchor = sections.find((section) => section.sectionType === 'contact' && section.enabled)?.anchor;
  const finalAnchor = sections.find((section) => section.sectionType === 'finalCta' && section.enabled)?.anchor;

  const hiddenHeaderAnchors = new Set(config.header.hiddenNavigationAnchors);
  const visibleHeaderPageSlugs = new Set(config.header.visiblePageSlugs);
  const headerSectionNavItems = enabledSections
    .filter((item) => item.sectionType !== 'finalCta' && !hiddenHeaderAnchors.has(item.anchor))
    .map((item) => ({ id: item.anchor, label: item.label }));
  const headerPageNavItems = config.pages
    .filter((page) => page.enabled && visibleHeaderPageSlugs.has(page.slug))
    .map((page) => ({
      id: `page-${page.slug}`,
      label: page.label,
      href: activePage?.id === page.id ? '#' : `/page/${page.slug}`,
    }));
  const headerNavItems = [...headerSectionNavItems, ...headerPageNavItems];

  const footerNavItems = enabledSections
    .filter((item) => item.sectionType !== 'hero')
    .map((item) => ({ label: item.label, href: `#${item.anchor}` }));

  const wrapSection = (section: PageSectionConfig, content: ReactNode) => (
    <div
      key={`${section.id}-${section.anchor}`}
      className='sitekit-section-style'
      style={sectionStyleVars(section.styleSettings)}
    >
      {content}
    </div>
  );

  const renderSection = (section: PageSectionConfig) => {
    switch (section.sectionType) {
      case 'hero':
        return wrapSection(
          section,
          <HeroSection
            sectionId={section.anchor}
            kicker={config.hero.kicker}
            headline={config.hero.headline}
            subheading={config.hero.subheading}
            primaryCtaLabel={config.hero.primaryCtaLabel}
            secondaryCtaLabel={config.hero.secondaryCtaLabel}
            layoutPreset={config.hero.layoutPreset}
            imageUrl={config.hero.imageUrl}
            imageAlt={config.hero.imageAlt}
            showKicker={section.showKicker}
            onPrimary={() => {
              trackEvent?.('hero_primary_click', config.hero.primaryCtaLabel);
              if (finalAnchor) {
                findAnchor(finalAnchor);
              }
            }}
            onSecondary={() => {
              trackEvent?.('hero_secondary_click', config.hero.secondaryCtaLabel);
              const nextSection = enabledSections.find((entry) => entry.id !== section.id && entry.enabled);
              if (nextSection) {
                findAnchor(nextSection.anchor);
              }
            }}
          />
        );

      case 'services':
        return wrapSection(
          section,
          <ServicesSection
            sectionId={section.anchor}
            services={config.services}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
          />
        );

      case 'about':
        return wrapSection(
          section,
          <AboutSection
            sectionId={section.anchor}
            config={config.about}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
          />
        );

      case 'testimonials':
        return wrapSection(
          section,
          <TestimonialSection
            sectionId={section.anchor}
            testimonials={config.testimonials}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
          />
        );

      case 'process':
        return wrapSection(
          section,
          <ProcessSection
            sectionId={section.anchor}
            steps={config.process}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
          />
        );

      case 'faq':
        return wrapSection(
          section,
          <FAQSection
            sectionId={section.anchor}
            faqs={config.faq}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
          />
        );

      case 'contact':
        return wrapSection(
          section,
          <ContactSection
            sectionId={section.anchor}
            businessEmail={config.contactEmail}
            intro={config.contact.intro}
            serviceLabel={config.contact.serviceLabel}
            submitLabel={config.contact.submitLabel}
            successMessage={config.contact.successMessage}
            privacyNote={config.contact.privacyNote}
            headingTitle={section.headingTitle || section.label}
            headingDescription={section.headingDescription}
            showKicker={section.showKicker}
            trackSubmit={(label, value) => trackEvent?.(label, value)}
          />
        );

      case 'finalCta':
        return wrapSection(
          section,
          <FinalCtaSection
            sectionId={section.anchor}
            eyebrow={config.finalCta.eyebrow}
            headline={config.finalCta.headline}
            text={config.finalCta.text}
            buttonLabel={config.finalCta.buttonLabel}
            showKicker={section.showKicker}
            onCta={() => {
              trackEvent?.('final_cta_click', config.finalCta.buttonLabel);
              if (contactAnchor) {
                findAnchor(contactAnchor);
              }
            }}
          />
        );

      case 'custom':
      default:
        return wrapSection(
          section,
          <CustomSection
            sectionId={section.anchor}
            title={section.headingTitle || section.label}
            body={section.customContent?.body ?? ''}
            buttonLabel={section.customContent?.buttonLabel}
            buttonHref={section.customContent?.buttonHref}
            showKicker={section.showKicker}
          />
        );
    }
  };

  const renderLayoutSections = () => {
    if (config.theme.layoutPreset === 'classic') {
      return enabledSections.map(renderSection);
    }

    const usedSectionIds = new Set<string>();
    const takeSections = (sectionTypes: PageSectionConfig['sectionType'][]) =>
      enabledSections.filter((section) => {
        if (usedSectionIds.has(section.id) || !sectionTypes.includes(section.sectionType)) {
          return false;
        }

        usedSectionIds.add(section.id);
        return true;
      });
    const takeRemainingSections = () =>
      enabledSections.filter((section) => {
        if (usedSectionIds.has(section.id)) {
          return false;
        }

        usedSectionIds.add(section.id);
        return true;
      });
    const renderRegion = (key: string, className: string, regionSections: PageSectionConfig[]) =>
      regionSections.length ? (
        <div key={key} className={className}>
          {regionSections.map(renderSection)}
        </div>
      ) : null;

    if (config.theme.layoutPreset === 'conversion') {
      const heroSections = takeSections(['hero']);
      const offerSections = takeSections(['services', 'finalCta']);
      const proofSections = takeSections(['process', 'testimonials']);
      const supportSections = takeSections(['faq', 'contact', 'about']);
      const remainingSections = takeRemainingSections();

      return (
        <>
          {renderRegion('conversion-hero', 'sitekit-layout-region sitekit-layout-region--hero', heroSections)}
          {renderRegion('conversion-offer', 'sitekit-layout-region sitekit-layout-region--conversion', offerSections)}
          {renderRegion('conversion-proof', 'sitekit-layout-region sitekit-layout-region--proof', proofSections)}
          {renderRegion('conversion-support', 'sitekit-layout-region sitekit-layout-region--support', supportSections)}
          {renderRegion('conversion-rest', 'sitekit-layout-region', remainingSections)}
        </>
      );
    }

    const heroSections = takeSections(['hero']);
    const storySections = takeSections(['about', 'process']);
    const offerSections = takeSections(['services', 'testimonials']);
    const closingSections = takeSections(['faq', 'finalCta', 'contact']);
    const remainingSections = takeRemainingSections();
    const editorialSections = [
      ...heroSections,
      ...storySections,
      ...offerSections,
      ...closingSections,
      ...remainingSections,
    ];
    const configuredSideMenuItems = config.sideMenu.items.filter((item) => item.label.trim() && item.anchor.trim());
    const sideMenuItems = configuredSideMenuItems.length
      ? configuredSideMenuItems
      : editorialSections.map((section) => ({
          id: section.id,
          label: section.label,
          anchor: section.anchor,
        }));

    if (!config.sideMenu.show) {
      return editorialSections.map(renderSection);
    }

    return (
      <div className='sitekit-layout-region sitekit-editorial-shell' style={sideMenuStyleVars(config.sideMenu)}>
        <aside
          className='sitekit-editorial-rail'
          aria-label='Page side menu'
          data-side-menu-layout={config.sideMenu.layoutPreset}
        >
          <div className='sitekit-editorial-rail-inner'>
            <div className='sitekit-editorial-rail-header'>
              <span>{config.sideMenu.eyebrow}</span>
              <strong>{config.sideMenu.title}</strong>
              <small>{config.sideMenu.description}</small>
            </div>
            <ol className='sitekit-editorial-rail-list'>
              {sideMenuItems.map((item, index) => (
                <li key={`rail-${item.id}-${item.anchor}`}>
                  <a href={`#${item.anchor}`}>
                    <span className='sitekit-editorial-rail-index'>{index + 1}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
        <div className='sitekit-editorial-flow'>{editorialSections.map(renderSection)}</div>
      </div>
    );
  };

  return (
    <div
      className='page-shell'
      data-theme={config.theme.preset}
      data-mode={config.theme.mode}
      data-density={config.theme.density}
      data-layout={config.theme.layoutPreset}
      data-motion={config.theme.enableMotion ? 'on' : 'off'}
    >
      <Header
        businessName={config.businessName}
        tagline={config.tagline}
        logoUrl={config.logoUrl}
        ctaLabel={config.header.ctaLabel || config.hero.primaryCtaLabel}
        navItems={headerNavItems}
        settings={config.header}
        onCta={() => {
          if (finalAnchor) {
            findAnchor(finalAnchor);
          } else if (contactAnchor) {
            findAnchor(contactAnchor);
          }
          trackEvent?.('header_cta_click', config.header.ctaLabel || config.hero.primaryCtaLabel);
        }}
      />

      <main className={`sitekit-layout sitekit-layout--${config.theme.layoutPreset}${compact ? ' section-shell' : ''}`}>
        {renderLayoutSections()}
      </main>

      <Footer
        businessName={config.businessName}
        contactEmail={config.contactEmail}
        socialLinks={config.socialLinks}
        ctaLabel={config.footer.ctaLabel || config.hero.secondaryCtaLabel}
        navItems={footerNavItems}
        settings={config.footer}
        onCta={() => {
          trackEvent?.('footer_cta_click', config.footer.ctaLabel || config.hero.secondaryCtaLabel);
          if (contactAnchor) {
            findAnchor(contactAnchor);
          }
        }}
      />
    </div>
  );
}
