import { defaultSectionStyle, defaultSiteConfig } from '../config/defaultSiteConfig';
import {
  type AboutSectionConfig,
  type AnalyticsSettings,
  type BackendIntegrationProvider,
  type CmsIntegrationProvider,
  type ContactConfig,
  type ContentPageConfig,
  type FinalCtaConfig,
  type FaqItem,
  type HeroConfig,
  type HeroLayoutPreset,
  type HeaderLogoPreset,
  type HeaderConfig,
  type FooterConfig,
  type IntegrationSettings,
  type PageSectionConfig,
  type ProcessStep,
  type SectionType,
  type SectionFontFamily,
  type SectionStyleConfig,
  type SeoConfig,
  type SiteConfig,
  type SideMenuConfig,
  type SideMenuItem,
  type SideMenuLayoutPreset,
  type SocialLink,
  type SetupExperience,
  type ServiceItem,
  type ThemeConfig,
  type ThemeMode,
  type ThemeDensity,
  type ThemeLayoutPreset,
  type ThemePreset,
  type Testimonial,
} from '../types/site';
import { createId } from './utils';

const STORAGE_KEY = 'reakt-sitekit.content.v1';
const DEFAULT_CONFIG_ID = 'site';
const DEFAULT_COLLECTION_NAME = 'site_config';
const DEFAULT_STRAPI_ENDPOINT = '/api/reakt-webkit-config';

const ensureString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const ensureBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const ensureNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const ensureArray = <T,>(value: unknown, fallback: T[]): T[] => (Array.isArray(value) ? value : fallback);

const ensureSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

const ensureUniqueSlug = (value: string, fallback: string, used: Set<string>): string => {
  const normalized = ensureSlug(value) || fallback;
  let candidate = normalized;
  let index = 2;

  while (used.has(candidate)) {
    candidate = `${normalized}-${index}`;
    index += 1;
  }

  used.add(candidate);
  return candidate;
};

const builtInSectionTypes: SectionType[] = [
  'hero',
  'services',
  'about',
  'testimonials',
  'process',
  'faq',
  'contact',
  'finalCta',
  'custom',
];

const sectionTypeLabel: Record<SectionType, string> = {
  hero: 'Hero',
  services: 'Services',
  about: 'About',
  testimonials: 'Testimonials',
  process: 'Process',
  faq: 'FAQ',
  contact: 'Contact',
  finalCta: 'Final CTA',
  custom: 'Custom',
};

const sectionAnchorFallback: Record<SectionType, string> = {
  hero: 'hero',
  services: 'services',
  about: 'about',
  testimonials: 'testimonials',
  process: 'process',
  faq: 'faq',
  contact: 'contact',
  finalCta: 'final-cta',
  custom: 'custom-section',
};

const ensureSectionType = (value: unknown, fallback: SectionType): SectionType => {
  return builtInSectionTypes.includes(value as SectionType) ? (value as SectionType) : fallback;
};

const ensureThemePreset = (value: unknown, fallback: ThemePreset): ThemePreset => {
  return value === 'midnight' || value === 'aurora' || value === 'graphite' ? value : fallback;
};

const ensureHeroLayoutPreset = (value: unknown, fallback: HeroLayoutPreset): HeroLayoutPreset => {
  return value === 'spotlight' || value === 'splitProof' || value === 'centeredLaunch' || value === 'imageSplit'
    ? value
    : fallback;
};

const ensureHeaderLogoPreset = (value: unknown, fallback: HeaderLogoPreset): HeaderLogoPreset => {
  return value === 'badge' || value === 'wordmark' || value === 'framed' ? value : fallback;
};

const ensureSideMenuLayoutPreset = (value: unknown, fallback: SideMenuLayoutPreset): SideMenuLayoutPreset => {
  return value === 'panel' || value === 'timeline' || value === 'minimal' ? value : fallback;
};

const ensureDensity = (value: unknown, fallback: ThemeDensity): ThemeDensity => {
  return value === 'cozy' || value === 'spacious' ? value : fallback;
};

const ensureThemeMode = (value: unknown, fallback: ThemeMode): ThemeMode => {
  return value === 'light' || value === 'dark' ? value : fallback;
};

const ensureThemeLayoutPreset = (value: unknown, fallback: ThemeLayoutPreset): ThemeLayoutPreset => {
  return value === 'classic' || value === 'conversion' || value === 'editorial' ? value : fallback;
};

const ensureBackendProvider = (value: unknown, fallback: BackendIntegrationProvider): BackendIntegrationProvider => {
  return value === 'local' || value === 'supabase' || value === 'firebase' || value === 'strapi'
    ? value
    : fallback;
};

const ensureCmsProvider = (value: unknown, fallback: CmsIntegrationProvider): CmsIntegrationProvider => {
  return value === 'none' || value === 'sanity' || value === 'contentful' || value === 'wordpress'
    ? value
    : fallback;
};

const ensureSetupExperience = (value: unknown, fallback: SetupExperience): SetupExperience => {
  return value === 'local' || value === 'codespaces' || value === 'docker' || value === 'hosted'
    ? value
    : fallback;
};

const ensureSectionFontFamily = (value: unknown, fallback: SectionFontFamily): SectionFontFamily => {
  return value === 'inherit' || value === 'inter' || value === 'manrope' || value === 'serif' || value === 'mono'
    ? value
    : fallback;
};

const ensureHero = (value: unknown): HeroConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    kicker: ensureString(asObj.kicker, defaultSiteConfig.hero.kicker),
    headline: ensureString(asObj.headline, defaultSiteConfig.hero.headline),
    subheading: ensureString(asObj.subheading, defaultSiteConfig.hero.subheading),
    primaryCtaLabel: ensureString(asObj.primaryCtaLabel, defaultSiteConfig.hero.primaryCtaLabel),
    secondaryCtaLabel: ensureString(asObj.secondaryCtaLabel, defaultSiteConfig.hero.secondaryCtaLabel),
    layoutPreset: ensureHeroLayoutPreset(asObj.layoutPreset, defaultSiteConfig.hero.layoutPreset),
    imageUrl: ensureString(asObj.imageUrl, defaultSiteConfig.hero.imageUrl),
    imageAlt: ensureString(asObj.imageAlt, defaultSiteConfig.hero.imageAlt),
  };
};

const ensureContact = (value: unknown): ContactConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    intro: ensureString(asObj.intro, defaultSiteConfig.contact.intro),
    serviceLabel: ensureString(asObj.serviceLabel, defaultSiteConfig.contact.serviceLabel),
    submitLabel: ensureString(asObj.submitLabel, defaultSiteConfig.contact.submitLabel),
    successMessage: ensureString(asObj.successMessage, defaultSiteConfig.contact.successMessage),
    privacyNote: ensureString(asObj.privacyNote, defaultSiteConfig.contact.privacyNote),
  };
};

const ensureFinalCta = (value: unknown): FinalCtaConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    eyebrow: ensureString(asObj.eyebrow, defaultSiteConfig.finalCta.eyebrow),
    headline: ensureString(asObj.headline, defaultSiteConfig.finalCta.headline),
    text: ensureString(asObj.text, defaultSiteConfig.finalCta.text),
    buttonLabel: ensureString(asObj.buttonLabel, defaultSiteConfig.finalCta.buttonLabel),
  };
};

const ensureTheme = (value: unknown): ThemeConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    preset: ensureThemePreset(asObj.preset, defaultSiteConfig.theme.preset),
    density: ensureDensity(asObj.density, defaultSiteConfig.theme.density),
    mode: ensureThemeMode(asObj.mode, defaultSiteConfig.theme.mode),
    enableMotion: ensureBoolean(asObj.enableMotion, defaultSiteConfig.theme.enableMotion),
    layoutPreset: ensureThemeLayoutPreset(asObj.layoutPreset, defaultSiteConfig.theme.layoutPreset),
  };
};

const ensureHeader = (value: unknown): HeaderConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    showLogo: ensureBoolean(asObj.showLogo, defaultSiteConfig.header.showLogo),
    showTagline: ensureBoolean(asObj.showTagline, defaultSiteConfig.header.showTagline),
    showNavigation: ensureBoolean(asObj.showNavigation, defaultSiteConfig.header.showNavigation),
    hiddenNavigationAnchors: ensureArray(asObj.hiddenNavigationAnchors, defaultSiteConfig.header.hiddenNavigationAnchors)
      .map((item) => ensureSlug(ensureString(item, '')))
      .filter(Boolean),
    visiblePageSlugs: ensureArray(asObj.visiblePageSlugs, defaultSiteConfig.header.visiblePageSlugs)
      .map((item) => ensureSlug(ensureString(item, '')))
      .filter(Boolean),
    showCta: ensureBoolean(asObj.showCta, defaultSiteConfig.header.showCta),
    ctaLabel: ensureString(asObj.ctaLabel, defaultSiteConfig.header.ctaLabel),
    logoPreset: ensureHeaderLogoPreset(asObj.logoPreset, defaultSiteConfig.header.logoPreset),
    fullWidth: ensureBoolean(asObj.fullWidth, defaultSiteConfig.header.fullWidth),
    styleSettings: ensureSectionStyle(asObj.styleSettings),
  };
};

const ensureFooter = (value: unknown): FooterConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    description: ensureString(asObj.description, defaultSiteConfig.footer.description),
    showNavigation: ensureBoolean(asObj.showNavigation, defaultSiteConfig.footer.showNavigation),
    showSocialLinks: ensureBoolean(asObj.showSocialLinks, defaultSiteConfig.footer.showSocialLinks),
    showContactEmail: ensureBoolean(asObj.showContactEmail, defaultSiteConfig.footer.showContactEmail),
    showCta: ensureBoolean(asObj.showCta, defaultSiteConfig.footer.showCta),
    ctaLabel: ensureString(asObj.ctaLabel, defaultSiteConfig.footer.ctaLabel),
    copyrightText: ensureString(asObj.copyrightText, defaultSiteConfig.footer.copyrightText),
    releaseText: ensureString(asObj.releaseText, defaultSiteConfig.footer.releaseText),
    fullWidth: ensureBoolean(asObj.fullWidth, defaultSiteConfig.footer.fullWidth),
    styleSettings: ensureSectionStyle(asObj.styleSettings),
  };
};

const ensureSideMenuItem = (value: unknown): SideMenuItem => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('side-menu')),
    label: ensureString(asObj.label, 'Menu item'),
    anchor: ensureSlug(ensureString(asObj.anchor, '')),
  };
};

const ensureSideMenu = (value: unknown): SideMenuConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    show: ensureBoolean(asObj.show, defaultSiteConfig.sideMenu.show),
    eyebrow: ensureString(asObj.eyebrow, defaultSiteConfig.sideMenu.eyebrow),
    title: ensureString(asObj.title, defaultSiteConfig.sideMenu.title),
    description: ensureString(asObj.description, defaultSiteConfig.sideMenu.description),
    layoutPreset: ensureSideMenuLayoutPreset(asObj.layoutPreset, defaultSiteConfig.sideMenu.layoutPreset),
    width: Math.min(24, Math.max(10, ensureNumber(asObj.width, defaultSiteConfig.sideMenu.width))),
    fontSize: Math.min(1.25, Math.max(0.72, ensureNumber(asObj.fontSize, defaultSiteConfig.sideMenu.fontSize))),
    styleSettings: ensureSectionStyle(asObj.styleSettings),
    items: ensureArray(asObj.items, defaultSiteConfig.sideMenu.items).map((item) => ensureSideMenuItem(item)),
  };
};

const ensureSeo = (value: unknown): SeoConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    title: ensureString(asObj.title, defaultSiteConfig.seo.title),
    description: ensureString(asObj.description, defaultSiteConfig.seo.description),
  };
};

const ensureAnalytics = (value: unknown): AnalyticsSettings => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const provider = ensureString(asObj.provider, defaultSiteConfig.analytics.provider);
  const safeProvider =
    provider === 'ga4' || provider === 'plausible' || provider === 'metaPixel' || provider === 'none'
      ? provider
      : 'none';

  return {
    provider: safeProvider,
    ga4MeasurementId: ensureString(asObj.ga4MeasurementId, ''),
    plausibleDomain: ensureString(asObj.plausibleDomain, ''),
    metaPixelId: ensureString(asObj.metaPixelId, ''),
  };
};

const ensureIntegrations = (value: unknown): IntegrationSettings => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    backendProvider: ensureBackendProvider(asObj.backendProvider, defaultSiteConfig.integrations.backendProvider),
    cmsProvider: ensureCmsProvider(asObj.cmsProvider, defaultSiteConfig.integrations.cmsProvider),
    setupExperience: ensureSetupExperience(asObj.setupExperience, defaultSiteConfig.integrations.setupExperience),
    projectUrl: ensureString(asObj.projectUrl, ''),
    publicApiKey: ensureString(asObj.publicApiKey, ''),
    cmsProjectId: ensureString(asObj.cmsProjectId, ''),
    cmsDataset: ensureString(asObj.cmsDataset, ''),
    configId: ensureString(asObj.configId, defaultSiteConfig.integrations.configId || DEFAULT_CONFIG_ID),
    collectionName: ensureString(asObj.collectionName, defaultSiteConfig.integrations.collectionName || DEFAULT_COLLECTION_NAME),
    apiEndpoint: ensureString(asObj.apiEndpoint, defaultSiteConfig.integrations.apiEndpoint),
    webhookUrl: ensureString(asObj.webhookUrl, ''),
    enableOneClickSetup: ensureBoolean(asObj.enableOneClickSetup, defaultSiteConfig.integrations.enableOneClickSetup),
  };
};

const ensureSocialLink = (value: unknown): SocialLink => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('social')),
    label: ensureString(asObj.label, 'Social'),
    url: ensureString(asObj.url, ''),
  };
};

const ensureService = (value: unknown): ServiceItem => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('service')),
    title: ensureString(asObj.title, 'Service title'),
    description: ensureString(asObj.description, 'Describe this service briefly.'),
  };
};

const ensureTestimonial = (value: unknown): Testimonial => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('testimonial')),
    name: ensureString(asObj.name, 'Customer Name'),
    role: ensureString(asObj.role, 'Client role'),
    quote: ensureString(asObj.quote, 'Add a short testimonial quote.'),
  };
};

const ensureFaq = (value: unknown): FaqItem => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('faq')),
    question: ensureString(asObj.question, 'Question'),
    answer: ensureString(asObj.answer, 'Answer text.'),
  };
};

const ensureProcessStep = (value: unknown): ProcessStep => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    id: ensureString(asObj.id, createId('step')),
    title: ensureString(asObj.title, 'Step title'),
    description: ensureString(asObj.description, 'Step description.'),
    outcome: ensureString(asObj.outcome, ''),
  };
};

const ensureCustomContent = (value: unknown) => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    title: ensureString(asObj.title, ''),
    body: ensureString(asObj.body, ''),
    buttonLabel: ensureString(asObj.buttonLabel, ''),
    buttonHref: ensureString(asObj.buttonHref, ''),
  };
};

const ensureSectionStyle = (value: unknown): SectionStyleConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    backgroundColor: ensureString(asObj.backgroundColor, defaultSectionStyle.backgroundColor),
    textColor: ensureString(asObj.textColor, defaultSectionStyle.textColor),
    mutedTextColor: ensureString(asObj.mutedTextColor, defaultSectionStyle.mutedTextColor),
    accentColor: ensureString(asObj.accentColor, defaultSectionStyle.accentColor),
    cardBackgroundColor: ensureString(asObj.cardBackgroundColor, defaultSectionStyle.cardBackgroundColor),
    cardBorderColor: ensureString(asObj.cardBorderColor, defaultSectionStyle.cardBorderColor),
    fontFamily: ensureSectionFontFamily(asObj.fontFamily, defaultSectionStyle.fontFamily),
  };
};

const ensurePageSection = (value: unknown, fallback: PageSectionConfig): PageSectionConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const sectionType = ensureSectionType(asObj.sectionType, fallback.sectionType);
  const anchorFallback = sectionAnchorFallback[sectionType];
  return {
    id: ensureString(asObj.id, fallback.id || createId('section')),
    label: ensureString(asObj.label, fallback.label),
    anchor: ensureString(asObj.anchor, ensureSlug(anchorFallback || fallback.anchor)),
    enabled: ensureBoolean(asObj.enabled, fallback.enabled),
    showKicker: ensureBoolean(asObj.showKicker, fallback.showKicker ?? true),
    sectionType,
    headingTitle: ensureString(asObj.headingTitle, ''),
    headingDescription: ensureString(asObj.headingDescription, ''),
    styleSettings: ensureSectionStyle(asObj.styleSettings),
    customContent: sectionType === 'custom' ? ensureCustomContent(asObj.customContent) : undefined,
  };
};

const ensurePageSections = (value: unknown, fallback: PageSectionConfig[]): PageSectionConfig[] => {
  const raw = ensureArray(value, fallback);
  const fallbackDefault = fallback[0] ?? defaultSiteConfig.pageSections[0];

  const normalized = raw.map((entry) => {
    const sectionFallback = fallback.find((section) => section.id === (entry as { id?: unknown })?.id) ?? fallbackDefault;
    return ensurePageSection(entry, sectionFallback);
  });

  const seen = new Set<string>();
  const sections = normalized.map((section, index) => {
    let id = section.id || createId('section');
    if (seen.has(id)) {
      id = `${id}-${index + 1}`;
    }

    const finalSection = {
      ...section,
      id,
    };
    seen.add(id);
    return finalSection;
  });

  const next: PageSectionConfig[] = [];
  const usedAnchors = new Set<string>();

  for (const section of sections) {
    const anchor = ensureUniqueSlug(section.anchor, section.anchor || sectionLabelFallback(section.sectionType), usedAnchors);
    next.push({
      ...section,
      anchor,
    });
  }

  return next.length > 0 ? next : [...fallback];
};

const sectionLabelFallback = (sectionType: SectionType): string => sectionTypeLabel[sectionType];

const ensureContentPage = (
  value: unknown,
  fallback: ContentPageConfig,
  usedIds: Set<string>,
  usedSlugs: Set<string>,
): ContentPageConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const initialId = ensureString(asObj.id, createId('page'));
  let nextId = initialId;
  let idIndex = 1;
  while (usedIds.has(nextId)) {
    idIndex += 1;
    nextId = `${initialId}-${idIndex}`;
  }
  const rawLabel = ensureString(asObj.label, fallback.label);
  const nextSlug = ensureUniqueSlug(ensureSlug(ensureString(asObj.slug, rawLabel)), fallback.slug, usedSlugs);

  usedIds.add(nextId);

  const sectionFallback = fallback.sections || defaultSiteConfig.pages[0]?.sections || defaultSiteConfig.pageSections;
  const rawSections = ensureArray(asObj.sections, sectionFallback);
  const nextSections = ensurePageSections(rawSections, sectionFallback);

  return {
    id: nextId,
    label: rawLabel,
    slug: nextSlug,
    enabled: ensureBoolean(asObj.enabled, fallback.enabled),
    sections: nextSections,
  };
};

const ensurePages = (value: unknown, fallback: ContentPageConfig[]): ContentPageConfig[] => {
  const raw = ensureArray(value, fallback);
  const usedIds = new Set<string>();
  const usedSlugs = new Set<string>();

  if (!raw || raw.length === 0) {
    return fallback.map((page, index) =>
      ensureContentPage(page, fallback[index] ?? fallback[0], usedIds, usedSlugs),
    );
  }

  return raw.map((page, index) => {
    const fallbackPage = fallback[index] ?? fallback[fallback.length - 1] ?? defaultSiteConfig.pages[0];
    return ensureContentPage(page, fallbackPage, usedIds, usedSlugs);
  });
};

const migrateLegacySectionsToDefaultPage = (rawLegacySections: unknown): ContentPageConfig => ({
  id: 'home',
  label: 'Home',
  slug: 'home',
  enabled: true,
  sections: ensurePageSections(rawLegacySections, defaultSiteConfig.pageSections),
});

export const normalizeConfig = (raw: unknown): SiteConfig => {
  const input = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const legacySectionInput = input.pageSections;
  const legacyHasPages = Object.prototype.hasOwnProperty.call(input, 'pages');
  const hasLegacySections = Array.isArray(legacySectionInput) && legacySectionInput.length > 0;

  const legacySections = ensurePageSections(
    hasLegacySections ? legacySectionInput : defaultSiteConfig.pageSections,
    defaultSiteConfig.pageSections,
  );
  const migratedPageFallback: ContentPageConfig[] = [migrateLegacySectionsToDefaultPage(legacySections)];

  const pages = legacyHasPages
    ? ensurePages(input.pages, migratedPageFallback)
    : ensurePages([migrateLegacySectionsToDefaultPage(legacySections)], migratedPageFallback);

  return {
    siteVersion: 2,
    businessName: ensureString(input.businessName, defaultSiteConfig.businessName),
    tagline: ensureString(input.tagline, defaultSiteConfig.tagline),
    logoUrl: ensureString(input.logoUrl, defaultSiteConfig.logoUrl),
    hero: ensureHero(input.hero),
    services: ensureArray(input.services, defaultSiteConfig.services).map((item) => ensureService(item)),
    about: ensureSectionText(input.about),
    finalCta: ensureFinalCta(input.finalCta),
    testimonials: ensureArray(input.testimonials, defaultSiteConfig.testimonials).map((item) => ensureTestimonial(item)),
    process: ensureArray(input.process, defaultSiteConfig.process).map((item) => ensureProcessStep(item)),
    faq: ensureArray(input.faq, defaultSiteConfig.faq).map((item) => ensureFaq(item)),
    contactEmail: ensureString(input.contactEmail, defaultSiteConfig.contactEmail),
    contact: ensureContact(input.contact),
    socialLinks: ensureArray(input.socialLinks, defaultSiteConfig.socialLinks).map((item) => ensureSocialLink(item)),
    pageSections: legacySections,
    pages,
    theme: ensureTheme(input.theme),
    sideMenu: ensureSideMenu(input.sideMenu),
    header: ensureHeader(input.header),
    footer: ensureFooter(input.footer),
    seo: ensureSeo(input.seo),
    analytics: ensureAnalytics(input.analytics),
    integrations: ensureIntegrations(input.integrations),
  };
};

const ensureSectionText = (value: unknown): AboutSectionConfig => {
  const asObj = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    title: ensureString(asObj.title, defaultSiteConfig.about.title),
    description: ensureString(asObj.description, defaultSiteConfig.about.description),
    highlights: ensureArray(asObj.highlights, defaultSiteConfig.about.highlights).map((item) =>
      ensureString(item, ''),
    ),
    stats: ensureArray(asObj.stats, defaultSiteConfig.about.stats).map((item) => ensureString(item, '')),
  };
};

type StorageConnectionResult = {
  ok: boolean;
  message: string;
};

const envValue = (key: string): string => {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[key] || '';
};

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/+$/, '');

const encodePathSegment = (value: string): string => encodeURIComponent(value.trim());

const getResolvedIntegrations = (config: SiteConfig): IntegrationSettings => {
  const current = { ...defaultSiteConfig.integrations, ...config.integrations };
  const envProvider = ensureBackendProvider(envValue('VITE_REAKT_BACKEND_PROVIDER'), current.backendProvider);
  const backendProvider = envValue('VITE_REAKT_BACKEND_PROVIDER') ? envProvider : current.backendProvider;

  const providerUrl =
    backendProvider === 'supabase'
      ? envValue('VITE_SUPABASE_URL')
      : backendProvider === 'strapi'
      ? envValue('VITE_STRAPI_URL')
      : '';
  const providerKey =
    backendProvider === 'supabase'
      ? envValue('VITE_SUPABASE_ANON_KEY')
      : backendProvider === 'firebase'
      ? envValue('VITE_FIREBASE_API_KEY')
      : backendProvider === 'strapi'
      ? envValue('VITE_STRAPI_PUBLIC_TOKEN')
      : '';

  return {
    ...current,
    backendProvider,
    projectUrl: current.projectUrl || providerUrl,
    publicApiKey: current.publicApiKey || providerKey,
    cmsProjectId:
      current.cmsProjectId ||
      (backendProvider === 'firebase' ? envValue('VITE_FIREBASE_PROJECT_ID') : ''),
    configId: current.configId || envValue('VITE_REAKT_CONFIG_ID') || DEFAULT_CONFIG_ID,
    collectionName:
      current.collectionName ||
      (backendProvider === 'supabase'
        ? envValue('VITE_SUPABASE_TABLE')
        : backendProvider === 'firebase'
        ? envValue('VITE_FIREBASE_COLLECTION')
        : '') ||
      DEFAULT_COLLECTION_NAME,
    apiEndpoint:
      current.apiEndpoint ||
      (backendProvider === 'strapi' ? envValue('VITE_STRAPI_CONFIG_ENDPOINT') : '') ||
      DEFAULT_STRAPI_ENDPOINT,
  };
};

const mergeRemoteWithLocalConnection = (remote: SiteConfig, local: SiteConfig): SiteConfig => ({
  ...remote,
  integrations: {
    ...remote.integrations,
    ...local.integrations,
  },
});

const requireIntegrationValue = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`${label} is required for this backend provider.`);
  }
};

const parseJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('Backend returned invalid JSON.');
  }
};

const assertResponse = async (response: Response, action: string) => {
  if (response.ok) {
    return;
  }

  const text = await response.text();
  throw new Error(`${action} failed (${response.status}). ${text || response.statusText}`);
};

const loadSupabaseConfig = async (settings: IntegrationSettings): Promise<SiteConfig | null> => {
  const baseUrl = normalizeBaseUrl(settings.projectUrl);
  const table = settings.collectionName || DEFAULT_COLLECTION_NAME;
  const configId = settings.configId || DEFAULT_CONFIG_ID;

  requireIntegrationValue(baseUrl, 'Supabase URL');
  requireIntegrationValue(settings.publicApiKey, 'Supabase anon key');

  const response = await fetch(
    `${baseUrl}/rest/v1/${encodePathSegment(table)}?id=eq.${encodeURIComponent(configId)}&select=config&limit=1`,
    {
      headers: {
        apikey: settings.publicApiKey,
        Authorization: `Bearer ${settings.publicApiKey}`,
      },
    },
  );
  await assertResponse(response, 'Supabase load');
  const payload = await parseJsonResponse(response);
  const rows = Array.isArray(payload) ? payload : [];
  const first = rows[0] as { config?: unknown } | undefined;
  return first?.config ? normalizeConfig(first.config) : null;
};

const saveSupabaseConfig = async (settings: IntegrationSettings, config: SiteConfig) => {
  const baseUrl = normalizeBaseUrl(settings.projectUrl);
  const table = settings.collectionName || DEFAULT_COLLECTION_NAME;
  const configId = settings.configId || DEFAULT_CONFIG_ID;

  requireIntegrationValue(baseUrl, 'Supabase URL');
  requireIntegrationValue(settings.publicApiKey, 'Supabase anon key');

  const response = await fetch(`${baseUrl}/rest/v1/${encodePathSegment(table)}?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: settings.publicApiKey,
      Authorization: `Bearer ${settings.publicApiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify([
      {
        id: configId,
        config,
        updated_at: new Date().toISOString(),
      },
    ]),
  });
  await assertResponse(response, 'Supabase save');
};

const firebaseDocumentUrl = (settings: IntegrationSettings) => {
  const projectId = settings.cmsProjectId;
  const collection = settings.collectionName || 'reakt_webkit';
  const documentId = settings.configId || DEFAULT_CONFIG_ID;

  requireIntegrationValue(projectId, 'Firebase project ID');
  requireIntegrationValue(settings.publicApiKey, 'Firebase API key');

  return `https://firestore.googleapis.com/v1/projects/${encodePathSegment(projectId)}/databases/(default)/documents/${encodePathSegment(collection)}/${encodePathSegment(documentId)}?key=${encodeURIComponent(settings.publicApiKey)}`;
};

const loadFirebaseConfig = async (settings: IntegrationSettings): Promise<SiteConfig | null> => {
  const response = await fetch(firebaseDocumentUrl(settings));
  if (response.status === 404) {
    return null;
  }
  await assertResponse(response, 'Firebase load');
  const payload = (await parseJsonResponse(response)) as
    | { fields?: { configJson?: { stringValue?: string } } }
    | null;
  const configJson = payload?.fields?.configJson?.stringValue;
  return configJson ? normalizeConfig(JSON.parse(configJson) as unknown) : null;
};

const saveFirebaseConfig = async (settings: IntegrationSettings, config: SiteConfig) => {
  const baseUrl = firebaseDocumentUrl(settings);
  const separator = baseUrl.includes('?') ? '&' : '?';
  const response = await fetch(
    `${baseUrl}${separator}updateMask.fieldPaths=configJson&updateMask.fieldPaths=updatedAt`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          configJson: { stringValue: JSON.stringify(config) },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    },
  );
  await assertResponse(response, 'Firebase save');
};

const strapiEndpointUrl = (settings: IntegrationSettings) => {
  const baseUrl = normalizeBaseUrl(settings.projectUrl);
  const endpoint = settings.apiEndpoint || DEFAULT_STRAPI_ENDPOINT;
  requireIntegrationValue(baseUrl, 'Strapi URL');
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

const strapiHeaders = (settings: IntegrationSettings) => ({
  ...(settings.publicApiKey
    ? {
        Authorization: `Bearer ${settings.publicApiKey}`,
      }
    : {}),
  'Content-Type': 'application/json',
});

const extractStrapiConfig = (payload: unknown): unknown => {
  const asObj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data = asObj.data && typeof asObj.data === 'object' ? (asObj.data as Record<string, unknown>) : undefined;
  const attributes = data?.attributes && typeof data.attributes === 'object'
    ? (data.attributes as Record<string, unknown>)
    : undefined;

  return attributes?.config ?? data?.config ?? asObj.config;
};

const loadStrapiConfig = async (settings: IntegrationSettings): Promise<SiteConfig | null> => {
  const response = await fetch(strapiEndpointUrl(settings), {
    headers: strapiHeaders(settings),
  });
  if (response.status === 404) {
    return null;
  }
  await assertResponse(response, 'Strapi load');
  const payload = await parseJsonResponse(response);
  const remoteConfig = extractStrapiConfig(payload);
  return remoteConfig ? normalizeConfig(remoteConfig) : null;
};

const saveStrapiConfig = async (settings: IntegrationSettings, config: SiteConfig) => {
  const url = strapiEndpointUrl(settings);
  const request = {
    method: 'PUT',
    headers: strapiHeaders(settings),
    body: JSON.stringify({ data: { config } }),
  };
  let response = await fetch(url, request);

  if (response.status === 404) {
    response = await fetch(url, { ...request, method: 'POST' });
  }

  await assertResponse(response, 'Strapi save');
};

const loadRemoteConfig = async (config: SiteConfig): Promise<SiteConfig | null> => {
  const settings = getResolvedIntegrations(config);

  switch (settings.backendProvider) {
    case 'supabase':
      return loadSupabaseConfig(settings);
    case 'firebase':
      return loadFirebaseConfig(settings);
    case 'strapi':
      return loadStrapiConfig(settings);
    default:
      return null;
  }
};

const saveRemoteConfig = async (config: SiteConfig) => {
  const settings = getResolvedIntegrations(config);

  switch (settings.backendProvider) {
    case 'supabase':
      await saveSupabaseConfig(settings, config);
      break;
    case 'firebase':
      await saveFirebaseConfig(settings, config);
      break;
    case 'strapi':
      await saveStrapiConfig(settings, config);
      break;
    default:
      break;
  }
};

export const loadConfig = (): SiteConfig => {
  if (typeof window === 'undefined') {
    return defaultSiteConfig;
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      return defaultSiteConfig;
    }
    const parsed = JSON.parse(value) as unknown;
    return normalizeConfig(parsed);
  } catch {
    return defaultSiteConfig;
  }
};

export const loadConfigFromStorage = async (): Promise<SiteConfig> => {
  const localConfig = loadConfig();
  const settings = getResolvedIntegrations(localConfig);

  if (settings.backendProvider === 'local') {
    return localConfig;
  }

  const remoteConfig = await loadRemoteConfig(localConfig);

  if (!remoteConfig) {
    return localConfig;
  }

  const mergedConfig = mergeRemoteWithLocalConnection(remoteConfig, localConfig);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfig));
  }

  return mergedConfig;
};

export const persistConfig = async (config: SiteConfig): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  const settings = getResolvedIntegrations(config);
  if (settings.backendProvider !== 'local') {
    await saveRemoteConfig(config);
  }
};

export const clearStoredConfig = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const pullConfigFromStorage = async (currentConfig: SiteConfig): Promise<SiteConfig> => {
  const remoteConfig = await loadRemoteConfig(currentConfig);

  if (!remoteConfig) {
    throw new Error('No remote config was found for the selected backend.');
  }

  const mergedConfig = mergeRemoteWithLocalConnection(remoteConfig, currentConfig);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfig));
  }

  return mergedConfig;
};

export const pushConfigToStorage = async (config: SiteConfig): Promise<void> => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  await saveRemoteConfig(config);
};

export const testStorageConnection = async (config: SiteConfig): Promise<StorageConnectionResult> => {
  const settings = getResolvedIntegrations(config);

  if (settings.backendProvider === 'local') {
    return {
      ok: true,
      message: 'Local browser storage is active.',
    };
  }

  await loadRemoteConfig(config);

  return {
    ok: true,
    message: `${settings.backendProvider} connection is reachable.`,
  };
};
