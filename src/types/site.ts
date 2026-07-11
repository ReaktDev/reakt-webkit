export type AnalyticsProvider = 'none' | 'ga4' | 'plausible' | 'metaPixel';
export type ThemePreset = 'midnight' | 'aurora' | 'graphite';
export type ThemeMode = 'light' | 'dark';
export type ThemeDensity = 'cozy' | 'spacious';
export type ThemeLayoutPreset = 'classic' | 'conversion' | 'editorial';
export type HeroLayoutPreset = 'spotlight' | 'splitProof' | 'centeredLaunch' | 'imageSplit';
export type SideMenuLayoutPreset = 'panel' | 'timeline' | 'minimal';
export type HeaderLogoPreset = 'badge' | 'wordmark' | 'framed';
export type BackendIntegrationProvider = 'local' | 'supabase' | 'firebase' | 'strapi';
export type CmsIntegrationProvider = 'none' | 'sanity' | 'contentful' | 'wordpress';
export type SetupExperience = 'local' | 'codespaces' | 'docker' | 'hosted';
export type BuiltInSectionType = 'hero' | 'services' | 'about' | 'testimonials' | 'process' | 'faq' | 'contact' | 'finalCta' | 'custom';
export type SectionType = BuiltInSectionType;

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface HeroConfig {
  kicker: string;
  headline: string;
  subheading: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  layoutPreset: HeroLayoutPreset;
  imageUrl: string;
  imageAlt: string;
}

export interface PageSectionConfig {
  id: string;
  label: string;
  anchor: string;
  enabled: boolean;
  showKicker: boolean;
  sectionType: SectionType;
  headingTitle?: string;
  headingDescription?: string;
  styleSettings?: SectionStyleConfig;
  customContent?: {
    title: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
  };
}

export type SectionFontFamily = 'inherit' | 'inter' | 'manrope' | 'serif' | 'mono';

export interface SectionStyleConfig {
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  fontFamily: SectionFontFamily;
}

export interface ContentPageConfig {
  id: string;
  label: string;
  slug: string;
  enabled: boolean;
  sections: PageSectionConfig[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutSectionConfig {
  title: string;
  description: string;
  highlights: string[];
  stats: string[];
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  outcome?: string;
}

export interface SeoConfig {
  title: string;
  description: string;
}

export interface ContactConfig {
  intro: string;
  serviceLabel: string;
  submitLabel: string;
  successMessage: string;
  privacyNote: string;
}

export interface FinalCtaConfig {
  eyebrow: string;
  headline: string;
  text: string;
  buttonLabel: string;
}

export interface ThemeConfig {
  preset: ThemePreset;
  density: ThemeDensity;
  mode: ThemeMode;
  enableMotion: boolean;
  layoutPreset: ThemeLayoutPreset;
}

export interface SideMenuItem {
  id: string;
  label: string;
  anchor: string;
}

export interface SideMenuConfig {
  show: boolean;
  eyebrow: string;
  title: string;
  description: string;
  layoutPreset: SideMenuLayoutPreset;
  width: number;
  fontSize: number;
  styleSettings: SectionStyleConfig;
  items: SideMenuItem[];
}

export interface HeaderConfig {
  showLogo: boolean;
  showTagline: boolean;
  showNavigation: boolean;
  hiddenNavigationAnchors: string[];
  visiblePageSlugs: string[];
  showCta: boolean;
  ctaLabel: string;
  logoPreset: HeaderLogoPreset;
  fullWidth: boolean;
  styleSettings: SectionStyleConfig;
}

export interface FooterConfig {
  description: string;
  showNavigation: boolean;
  showSocialLinks: boolean;
  showContactEmail: boolean;
  showCta: boolean;
  ctaLabel: string;
  copyrightText: string;
  releaseText: string;
  fullWidth: boolean;
  styleSettings: SectionStyleConfig;
}

export interface AnalyticsSettings {
  provider: AnalyticsProvider;
  ga4MeasurementId: string;
  plausibleDomain: string;
  metaPixelId: string;
}

export interface IntegrationSettings {
  backendProvider: BackendIntegrationProvider;
  cmsProvider: CmsIntegrationProvider;
  setupExperience: SetupExperience;
  projectUrl: string;
  publicApiKey: string;
  cmsProjectId: string;
  cmsDataset: string;
  configId: string;
  collectionName: string;
  apiEndpoint: string;
  webhookUrl: string;
  enableOneClickSetup: boolean;
}

export interface SiteConfig {
  siteVersion: number;
  businessName: string;
  tagline: string;
  logoUrl: string;
  hero: HeroConfig;
  services: ServiceItem[];
  about: AboutSectionConfig;
  finalCta: FinalCtaConfig;
  testimonials: Testimonial[];
  process: ProcessStep[];
  faq: FaqItem[];
  contactEmail: string;
  contact: ContactConfig;
  socialLinks: SocialLink[];
  pageSections: PageSectionConfig[];
  pages: ContentPageConfig[];
  theme: ThemeConfig;
  sideMenu: SideMenuConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  seo: SeoConfig;
  analytics: AnalyticsSettings;
  integrations: IntegrationSettings;
}
