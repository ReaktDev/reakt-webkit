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
    kicker: 'Premium service systems',
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
      'Northline Consulting helps growing service teams refine operations, strengthen client delivery, and present a clear standard of trust from the first conversation.',
    highlights: [
      'Senior team on every project',
      'Transparent communication and progress updates',
      'No complicated toolchain required',
    ],
    stats: ['15+ years experience', '4.8 / 5 client satisfaction', '45+ projects launched'],
  },
  finalCta: {
    eyebrow: 'Next step',
    headline: 'Ready to improve the way your service team operates?',
    text: 'Bring your offer, client journey, and operational priorities into one focused plan your team can execute.',
    buttonLabel: 'Request a consultation',
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
      description: 'We turn service details, proof points, and client needs into a clear conversion path.',
      outcome: 'A polished customer journey with focused calls to action.',
    },
    {
      id: createId('step'),
      title: 'Launch',
      description: 'We finalize messaging, review every touchpoint, and prepare the team for confident handoff.',
      outcome: 'A live service experience your team can keep improving.',
    },
  ],
  faq: [
    {
      id: createId('faq'),
      question: 'How quickly can we get started?',
      answer:
        'Most engagements begin with a focused discovery session where we map priorities, constraints, and the fastest path to measurable improvement.',
    },
    {
      id: createId('faq'),
      question: 'Can you improve an existing service process?',
      answer:
        'Yes. We can refine an existing journey, simplify handoffs, and strengthen the points where prospects and clients need the most clarity.',
    },
    {
      id: createId('faq'),
      question: 'What kinds of teams do you work with?',
      answer:
        'We work with service-led businesses that want sharper positioning, better operational flow, and a more confident client experience.',
    },
  ],
  contactEmail: 'hello@northlineconsulting.com',
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
    description: 'Premium service systems for growth-minded teams.',
    showNavigation: true,
    showSocialLinks: true,
    showContactEmail: true,
    showCta: true,
    ctaLabel: 'See services',
    copyrightText: 'All rights reserved.',
    releaseText: '',
    fullWidth: true,
    styleSettings: defaultSectionStyle,
  },
  seo: {
    title: 'Northline Consulting | Premium Service Systems',
    description:
      'Northline Consulting helps growing service teams refine operations, strengthen client delivery, and build trust through clearer systems.',
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
