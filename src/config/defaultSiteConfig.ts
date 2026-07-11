import { createId } from '../lib/utils';
import type { SectionStyleConfig, SiteConfig } from '../types/site';

export const defaultSectionStyle: SectionStyleConfig = {
  backgroundColor: '',
  textColor: '',
  mutedTextColor: '',
  accentColor: '',
  cardBackgroundColor: '',
  cardBorderColor: '',
  fontFamily: 'inherit',
};

const defaultPageSections = [
  { id: 'hero', sectionType: 'hero', label: 'Hero', anchor: 'hero', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  { id: 'services', sectionType: 'services', label: 'Services', anchor: 'services', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  { id: 'about', sectionType: 'about', label: 'About', anchor: 'about', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  {
    id: 'testimonials',
    sectionType: 'testimonials',
    label: 'Testimonials',
    anchor: 'testimonials',
    enabled: true,
    showKicker: true,
    styleSettings: defaultSectionStyle,
  },
  { id: 'process', sectionType: 'process', label: 'Process', anchor: 'process', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  { id: 'faq', sectionType: 'faq', label: 'FAQ', anchor: 'faq', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  { id: 'contact', sectionType: 'contact', label: 'Contact', anchor: 'contact', enabled: true, showKicker: true, styleSettings: defaultSectionStyle },
  {
    id: 'finalCta',
    sectionType: 'finalCta',
    label: 'Final CTA',
    anchor: 'final-cta',
    enabled: true,
    showKicker: true,
    styleSettings: defaultSectionStyle,
  },
] as const;

export const defaultSiteConfig: SiteConfig = {
  siteVersion: 2,
  businessName: 'Northline Consulting',
  tagline: 'Premium service systems for growth-minded teams.',
  logoUrl: '',
  hero: {
    kicker: 'Service website starter · Open source',
    headline: 'Premium service execution with measurable results for growing businesses',
    subheading:
      'From operations to client delivery, we give your team a modern website that reflects trust, speed, and expertise.',
    primaryCtaLabel: 'Get a free quote',
    secondaryCtaLabel: 'See services',
    layoutPreset: 'spotlight',
    imageUrl: '',
    imageAlt: 'Team working on a service website',
  },
  services: [
    {
      id: createId('service'),
      title: 'Strategy & Growth Planning',
      description:
        'A practical, data-informed roadmap that aligns messaging, positioning, and conversion.',
    },
    {
      id: createId('service'),
      title: 'Operational Setup',
      description:
        'Turn messy procedures into repeatable workflows that improve customer experience and team handoff.',
    },
    {
      id: createId('service'),
      title: 'Client Experience Design',
      description:
        'Refined service journeys with clear discovery, reporting, and transparent progress updates.',
    },
  ],
  about: {
    title: 'Built for service teams that care about quality',
    description:
      'This starter helps agencies, consultants, clinics, contractors, and local firms launch a professional web presence in minutes while preserving your voice and trust. Replace the demo content with your own business details and publish.',
    highlights: [
      'Senior team on every project',
      'Transparent communication and progress updates',
      'No complicated toolchain required',
    ],
    stats: ['15+ years experience', '4.8 / 5 client satisfaction', '45+ projects launched'],
  },
  finalCta: {
    eyebrow: 'Built for action',
    headline: 'Ready to launch your premium service website quickly?',
    text: 'Use this dashboard to replace every section with your own business voice and publish confidently.',
    buttonLabel: 'Start building in dashboard',
  },
  testimonials: [
    {
      id: createId('testimonial'),
      name: 'Maya L.',
      role: 'Operations Director, Local Fitness Studio',
      quote:
        'The structure and visual polish helped us look credible right away. We started collecting leads on day 1.',
    },
    {
      id: createId('testimonial'),
      name: 'Daniel R.',
      role: 'Founder, Home Services Team',
      quote:
        'Fast to launch, easy to adjust. I changed the quote button and service cards myself before lunch.',
    },
  ],
  process: [
    {
      id: createId('step'),
      title: 'Discover',
      description: 'We map your current offer, audience, and proof points into simple website priorities.',
      outcome: 'Clear positioning and prioritized service messaging.',
    },
    {
      id: createId('step'),
      title: 'Build',
      description: 'We wire clean sections, CMS-like form fields, and SEO foundation in a starter that ships fast.',
      outcome: 'A premium website shell with conversion-first sections.',
    },
    {
      id: createId('step'),
      title: 'Launch',
      description: 'You review copy and branding directly from the dashboard and publish on Vercel, Netlify, or your host.',
      outcome: 'An editable live site your team can own.',
    },
  ],
  faq: [
    {
      id: createId('faq'),
      question: 'Can a non-developer edit the website?',
      answer:
        'Yes. The dashboard is built for non-technical owners with form-based editing, live preview, and one-click save.',
    },
    {
      id: createId('faq'),
      question: 'Do I need a separate backend?',
      answer:
        'Not for the starter mode. Content is stored locally in the browser. You can later connect Firebase, Supabase, or CMS easily.',
    },
    {
      id: createId('faq'),
      question: 'Can I use this for clinics or consultants?',
      answer:
        'Absolutely. The section set is neutral and works well for agencies, coaches, contractors, clinics, and local service firms.',
    },
  ],
  contactEmail: 'hello@northline.example',
  contact: {
    intro: 'Tell us what you need, and we will reply with a practical plan in one business day.',
    serviceLabel: 'Service needed',
    submitLabel: 'Request a quote',
    successMessage: "Thanks, we'll reach out within one business day.",
    privacyNote: 'We only use your email to reply. We do not share your data.',
  },
  socialLinks: [
    { id: createId('social'), label: 'LinkedIn', url: 'https://linkedin.com' },
    { id: createId('social'), label: 'Instagram', url: 'https://instagram.com' },
    { id: createId('social'), label: 'X', url: 'https://x.com' },
  ],
  pageSections: [
    ...defaultPageSections.map((section) => ({ ...section })),
  ],
  pages: [
    {
      id: 'home',
      label: 'Home',
      slug: 'home',
      enabled: true,
      sections: defaultPageSections.map((section) => ({ ...section })),
    },
  ],
  theme: {
    preset: 'midnight',
    density: 'spacious',
    mode: 'light',
    enableMotion: true,
    layoutPreset: 'classic',
  },
  sideMenu: {
    show: true,
    eyebrow: 'Guide',
    title: 'Side menu',
    description: 'Navigate the page story.',
    layoutPreset: 'panel',
    width: 15,
    fontSize: 0.9,
    styleSettings: defaultSectionStyle,
    items: [
      { id: createId('side-menu'), label: 'Hero', anchor: 'hero' },
      { id: createId('side-menu'), label: 'About', anchor: 'about' },
      { id: createId('side-menu'), label: 'Process', anchor: 'process' },
      { id: createId('side-menu'), label: 'Services', anchor: 'services' },
      { id: createId('side-menu'), label: 'Contact', anchor: 'contact' },
    ],
  },
  header: {
    showLogo: true,
    showTagline: true,
    showNavigation: true,
    hiddenNavigationAnchors: [],
    visiblePageSlugs: [],
    showCta: true,
    ctaLabel: 'Get a free quote',
    logoPreset: 'badge',
    fullWidth: true,
    styleSettings: defaultSectionStyle,
  },
  footer: {
    description: 'Built with Reakt WebKit for premium service businesses.',
    showNavigation: true,
    showSocialLinks: true,
    showContactEmail: true,
    showCta: true,
    ctaLabel: 'See services',
    copyrightText: 'All rights reserved.',
    releaseText: 'Reakt WebKit starter release.',
    fullWidth: true,
    styleSettings: defaultSectionStyle,
  },
  seo: {
    title: 'Reakt WebKit for Service Businesses',
    description:
      'A production-ready, configurable website for service teams with a simple admin dashboard.',
  },
  analytics: {
    provider: 'none',
    ga4MeasurementId: '',
    plausibleDomain: '',
    metaPixelId: '',
  },
  integrations: {
    backendProvider: 'local',
    cmsProvider: 'none',
    setupExperience: 'codespaces',
    projectUrl: '',
    publicApiKey: '',
    cmsProjectId: '',
    cmsDataset: '',
    configId: 'site',
    collectionName: 'site_config',
    apiEndpoint: '',
    webhookUrl: '',
    enableOneClickSetup: true,
  },
};
