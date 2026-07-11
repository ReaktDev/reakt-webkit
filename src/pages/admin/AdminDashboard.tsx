import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { createId } from '../../lib/utils';
import { clearAdminSession, verifyAdminSession } from '../../lib/adminAuth';
import { normalizeConfig, pullConfigFromStorage, pushConfigToStorage, testStorageConnection } from '../../lib/configStorage';
import { defaultSectionStyle, defaultSiteConfig } from '../../config/defaultSiteConfig';
import type {
  BuiltInSectionType,
  BackendIntegrationProvider,
  CmsIntegrationProvider,
  ContentPageConfig,
  HeaderLogoPreset,
  HeroLayoutPreset,
  PageSectionConfig,
  SectionFontFamily,
  SectionStyleConfig,
  SideMenuLayoutPreset,
  SetupExperience,
  ThemeMode,
  ThemeDensity,
  ThemeLayoutPreset,
  ThemePreset,
} from '../../types/site';
import SitePageContent from '../../components/site/SitePageContent';

type DashboardTab =
  | 'Overview'
  | 'Brand'
  | 'Header'
  | 'Footer'
  | 'Social'
  | 'SEO & Analytics'
  | 'Page Content'
  | 'Structure'
  | 'Integrations'
  | 'Setup Help'
  | 'Publish workflow'
  | 'Theme'
  | 'Security';

type WorkspaceSectionId = 'identity' | 'pages' | 'pageContent' | 'settings';

type WorkspaceGroup = {
  title: string;
  id: WorkspaceSectionId;
  tabs: DashboardTab[];
};

const sectionTypeOptions: { value: BuiltInSectionType; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'services', label: 'Services' },
  { value: 'about', label: 'About' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'process', label: 'Process' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Contact' },
  { value: 'finalCta', label: 'Final CTA' },
  { value: 'custom', label: 'Custom' },
];

const themePresetLabel: Record<ThemePreset, string> = {
  midnight: 'Midnight',
  aurora: 'Aurora',
  graphite: 'Graphite',
};

const densityLabel: Record<ThemeDensity, string> = {
  cozy: 'Compact',
  spacious: 'Spacious',
};

const layoutPresetLabel: Record<ThemeLayoutPreset, string> = {
  classic: 'Classic service',
  conversion: 'Conversion funnel',
  editorial: 'Editorial story',
};

const layoutPresetDescription: Record<ThemeLayoutPreset, string> = {
  classic: 'Stacked sections with a familiar top-to-bottom service flow.',
  conversion: 'Stacked campaign bands for offer, CTA, proof, and support.',
  editorial: 'Magazine-style story frame with a sticky section rail.',
};

type LayoutSectionGroup = {
  id: string;
  title: string;
  description: string;
  sections: PageSectionConfig[];
};

const layoutSectionGroupDefinitions: Record<
  Exclude<ThemeLayoutPreset, 'classic'>,
  Array<{
    id: string;
    title: string;
    description: string;
    sectionTypes: PageSectionConfig['sectionType'][];
  }>
> = {
  conversion: [
    {
      id: 'conversion-lead',
      title: 'Lead section',
      description: 'First impression and primary action.',
      sectionTypes: ['hero'],
    },
    {
      id: 'conversion-offer',
      title: 'Offer band',
      description: 'Services and conversion CTA.',
      sectionTypes: ['services', 'finalCta'],
    },
    {
      id: 'conversion-proof',
      title: 'Proof band',
      description: 'Process and trust-building proof.',
      sectionTypes: ['process', 'testimonials'],
    },
    {
      id: 'conversion-support',
      title: 'Support band',
      description: 'Objections, contact, and company context.',
      sectionTypes: ['faq', 'contact', 'about'],
    },
  ],
  editorial: [
    {
      id: 'editorial-opening',
      title: 'Opening',
      description: 'The headline and page entry.',
      sectionTypes: ['hero'],
    },
    {
      id: 'editorial-story',
      title: 'Story',
      description: 'Context, credibility, and how it works.',
      sectionTypes: ['about', 'process'],
    },
    {
      id: 'editorial-offer',
      title: 'Offer and proof',
      description: 'What you sell and why it works.',
      sectionTypes: ['services', 'testimonials'],
    },
    {
      id: 'editorial-close',
      title: 'Close',
      description: 'Questions, CTA, and contact.',
      sectionTypes: ['faq', 'finalCta', 'contact'],
    },
  ],
};

const getLayoutSectionGroups = (
  sections: PageSectionConfig[],
  layoutPreset: ThemeLayoutPreset,
): LayoutSectionGroup[] => {
  if (layoutPreset === 'classic') {
    return [
      {
        id: 'classic-flow',
        title: 'Page flow',
        description: 'Saved section order.',
        sections,
      },
    ];
  }

  const usedSectionIds = new Set<string>();
  const groups = layoutSectionGroupDefinitions[layoutPreset].map((group) => {
    const groupSections = sections.filter((section) => {
      if (usedSectionIds.has(section.id) || !group.sectionTypes.includes(section.sectionType)) {
        return false;
      }

      usedSectionIds.add(section.id);
      return true;
    });

    return { ...group, sections: groupSections };
  });
  const remainingSections = sections.filter((section) => !usedSectionIds.has(section.id));

  if (remainingSections.length) {
    groups.push({
      id: `${layoutPreset}-additional`,
      title: 'Additional sections',
      description: 'Custom or unmatched blocks.',
      sectionTypes: ['custom'],
      sections: remainingSections,
    });
  }

  return groups.filter((group) => group.sections.length > 0);
};

const heroLayoutPresetLabel: Record<HeroLayoutPreset, string> = {
  spotlight: 'Spotlight',
  splitProof: 'Split proof',
  centeredLaunch: 'Centered launch',
  imageSplit: 'Image split',
};

const heroLayoutPresetDescription: Record<HeroLayoutPreset, string> = {
  spotlight: 'Classic left-led hero with supporting proof below.',
  splitProof: 'Two-column layout with a proof card beside the headline.',
  centeredLaunch: 'Centered campaign-style hero with CTA focus.',
  imageSplit: 'Text on one side with a large image on the other.',
};

const headerLogoPresetLabel: Record<HeaderLogoPreset, string> = {
  badge: 'Badge',
  wordmark: 'Wordmark',
  framed: 'Framed',
};

const headerLogoPresetDescription: Record<HeaderLogoPreset, string> = {
  badge: 'Circular logo mark beside the business name.',
  wordmark: 'Compact initial mark with a lighter brand lockup.',
  framed: 'Squared logo container for sharper brand marks.',
};

const sideMenuLayoutPresetLabel: Record<SideMenuLayoutPreset, string> = {
  panel: 'Panel',
  timeline: 'Timeline',
  minimal: 'Minimal',
};

const sideMenuLayoutPresetDescription: Record<SideMenuLayoutPreset, string> = {
  panel: 'Contained menu card with numbered links.',
  timeline: 'Vertical story line with connected steps.',
  minimal: 'Quiet text menu with a slim accent rule.',
};

const themeModeLabel: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
};

const sectionFontFamilyLabel: Record<SectionFontFamily, string> = {
  inherit: 'Use site default',
  inter: 'Inter',
  manrope: 'Manrope',
  serif: 'Editorial serif',
  mono: 'Mono',
};

const sectionStyleColorDefaults: Omit<SectionStyleConfig, 'fontFamily'> = {
  backgroundColor: '#ffffff',
  textColor: '#1d2327',
  mutedTextColor: '#646970',
  accentColor: '#4f8cff',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#d7dce0',
};

const sectionStyleColorFields: Array<{
  key: keyof Omit<SectionStyleConfig, 'fontFamily'>;
  label: string;
}> = [
  { key: 'backgroundColor', label: 'Background' },
  { key: 'textColor', label: 'Primary text' },
  { key: 'mutedTextColor', label: 'Muted text' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'cardBackgroundColor', label: 'Card background' },
  { key: 'cardBorderColor', label: 'Card border' },
];

type IntegrationOption<T extends string> = {
  id: T;
  title: string;
  description: string;
  envKeys: string[];
  status: string;
};

const backendIntegrationOptions: Array<IntegrationOption<BackendIntegrationProvider>> = [
  {
    id: 'local',
    title: 'Local starter',
    description: 'Browser storage with backup import/export. Best for demos, trials, and solo editing.',
    envKeys: [],
    status: 'Ready now',
  },
  {
    id: 'supabase',
    title: 'Supabase',
    description: 'Hosted Postgres, auth, storage, and edge functions for production editing workflows.',
    envKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    status: 'Recommended backend',
  },
  {
    id: 'firebase',
    title: 'Firebase',
    description: 'Firestore and Firebase Auth for teams already using Google Cloud tooling.',
    envKeys: ['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_API_KEY'],
    status: 'Adapter-ready',
  },
  {
    id: 'strapi',
    title: 'Strapi',
    description: 'Self-hosted Node CMS API for teams that want full control over content models.',
    envKeys: ['VITE_STRAPI_URL', 'VITE_STRAPI_PUBLIC_TOKEN'],
    status: 'API-ready',
  },
];

const cmsIntegrationOptions: Array<IntegrationOption<CmsIntegrationProvider>> = [
  {
    id: 'none',
    title: 'No external CMS',
    description: 'Use the built-in dashboard and JSON backup workflow.',
    envKeys: [],
    status: 'Default',
  },
  {
    id: 'sanity',
    title: 'Sanity',
    description: 'Structured content studio with live previews and flexible schemas.',
    envKeys: ['VITE_SANITY_PROJECT_ID', 'VITE_SANITY_DATASET'],
    status: 'Content studio',
  },
  {
    id: 'contentful',
    title: 'Contentful',
    description: 'Hosted content platform for larger teams and multi-channel publishing.',
    envKeys: ['VITE_CONTENTFUL_SPACE_ID', 'VITE_CONTENTFUL_ACCESS_TOKEN'],
    status: 'Enterprise CMS',
  },
  {
    id: 'wordpress',
    title: 'WordPress API',
    description: 'Connect to an existing WordPress site through its REST API.',
    envKeys: ['VITE_WORDPRESS_API_URL'],
    status: 'Existing CMS',
  },
];

const setupExperienceOptions: Array<IntegrationOption<SetupExperience>> = [
  {
    id: 'codespaces',
    title: 'GitHub Codespaces',
    description: 'One-click cloud development from GitHub. No Node, npm, or editor setup on the user computer.',
    envKeys: [],
    status: 'Best for beginners',
  },
  {
    id: 'docker',
    title: 'Docker',
    description: 'Run the project in a container with one command after Docker Desktop is installed.',
    envKeys: [],
    status: 'Clean local runtime',
  },
  {
    id: 'hosted',
    title: 'Hosted deploy',
    description: 'Use Vercel or Netlify after importing the GitHub repository.',
    envKeys: [],
    status: 'Fastest launch',
  },
  {
    id: 'local',
    title: 'Local Node install',
    description: 'Traditional setup for developers with Node 18+ and npm installed.',
    envKeys: [],
    status: 'Developer path',
  },
];

const dashboardGroups: WorkspaceGroup[] = [
  {
    id: 'identity',
    title: 'Website basics',
    tabs: ['Brand', 'Header', 'Footer', 'Social', 'SEO & Analytics', 'Theme'],
  },
  {
    id: 'pageContent',
    title: 'Page Content',
    tabs: ['Page Content'],
  },
  {
    id: 'pages',
    title: 'Pages',
    tabs: ['Structure'],
  },
  {
    id: 'settings',
    title: 'Launch tools',
    tabs: ['Integrations', 'Setup Help', 'Publish workflow', 'Security'],
  },
];

const tabHints: Record<DashboardTab, string> = {
  Overview: 'Health and key actions for the current workspace.',
  Brand: 'Business name, logo, and identity.',
  Header: 'Top navigation, logo visibility, and primary CTA.',
  Footer: 'Footer copy, links, contact visibility, and CTA.',
  Social: 'Profile links and external platforms.',
  'SEO & Analytics': 'Search metadata and tracking IDs.',
  'Page Content': 'Edit sections and content per page.',
  Structure: 'Manage pages and route structure.',
  Integrations: 'Choose backend/CMS paths and generate environment setup.',
  'Setup Help': 'Beginner-friendly install, cloud editor, and deployment options.',
  'Publish workflow': 'Backup and restore your workspace configuration.',
  Theme: 'Visual theme controls.',
  Security: 'Dashboard access and secrets.',
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

const uniqueValue = (value: string, used: Set<string>) => {
  let current = value || 'section';
  let counter = 2;
  while (used.has(current)) {
    current = `${value}-${counter}`;
    counter += 1;
  }
  used.add(current);
  return current;
};

const getIntegrationEnvSnippet = (
  backendProvider: BackendIntegrationProvider,
  cmsProvider: CmsIntegrationProvider,
  projectUrl: string,
  publicApiKey: string,
  cmsProjectId: string,
  cmsDataset: string,
  configId: string,
  collectionName: string,
  apiEndpoint: string,
  webhookUrl: string,
) => {
  const lines = ['ADMIN_PASSWORD=change-this-password', 'ADMIN_SESSION_SECRET=change-this-long-random-secret'];

  lines.push(`VITE_REAKT_BACKEND_PROVIDER=${backendProvider}`);
  lines.push(`VITE_REAKT_CONFIG_ID=${configId || 'site'}`);

  if (backendProvider === 'supabase') {
    lines.push(`VITE_SUPABASE_URL=${projectUrl || 'https://your-project.supabase.co'}`);
    lines.push(`VITE_SUPABASE_ANON_KEY=${publicApiKey || 'your-public-anon-key'}`);
    lines.push(`VITE_SUPABASE_TABLE=${collectionName || 'site_config'}`);
  }

  if (backendProvider === 'firebase') {
    lines.push(`VITE_FIREBASE_PROJECT_ID=${cmsProjectId || 'your-firebase-project-id'}`);
    lines.push(`VITE_FIREBASE_API_KEY=${publicApiKey || 'your-public-firebase-api-key'}`);
    lines.push(`VITE_FIREBASE_COLLECTION=${collectionName || 'site_config'}`);
  }

  if (backendProvider === 'strapi') {
    lines.push(`VITE_STRAPI_URL=${projectUrl || 'https://cms.yourdomain.com'}`);
    lines.push(`VITE_STRAPI_PUBLIC_TOKEN=${publicApiKey || 'your-public-read-token'}`);
    lines.push(`VITE_STRAPI_CONFIG_ENDPOINT=${apiEndpoint || '/api/reakt-webkit-config'}`);
  }

  if (cmsProvider === 'sanity') {
    lines.push(`VITE_SANITY_PROJECT_ID=${cmsProjectId || 'your-sanity-project-id'}`);
    lines.push(`VITE_SANITY_DATASET=${cmsDataset || 'production'}`);
  }

  if (cmsProvider === 'contentful') {
    lines.push(`VITE_CONTENTFUL_SPACE_ID=${cmsProjectId || 'your-contentful-space-id'}`);
    lines.push(`VITE_CONTENTFUL_ACCESS_TOKEN=${publicApiKey || 'your-contentful-delivery-token'}`);
  }

  if (cmsProvider === 'wordpress') {
    lines.push(`VITE_WORDPRESS_API_URL=${projectUrl || 'https://your-site.com/wp-json/wp/v2'}`);
  }

  if (webhookUrl) {
    lines.push(`VITE_DEPLOY_WEBHOOK_URL=${webhookUrl}`);
  }

  return `${lines.join('\n')}\n`;
};

export default function AdminDashboard() {
  const {
    config,
    setConfig,
    saveConfigChanges,
    resetToDefaults,
    reloadConfigFromStorage,
    hasUnsavedChanges,
    isConfigLoading,
    isConfigSaving,
    storageError,
  } = useSiteConfig();

  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewPage, setPreviewPage] = useState<ContentPageConfig | null>(null);
  const [selectedPageId, setSelectedPageId] = useState(config.pages[0]?.id ?? '');
  const [importError, setImportError] = useState('');
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [restoreProgressText, setRestoreProgressText] = useState('');
  const [newSectionType, setNewSectionType] = useState<BuiltInSectionType>('custom');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminSessionSecret, setAdminSessionSecret] = useState('');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPagesNavPageId, setSelectedPagesNavPageId] = useState('');
  const [isSectionEditFocus, setIsSectionEditFocus] = useState(false);
  const [openWorkspaceGroups, setOpenWorkspaceGroups] = useState<Record<WorkspaceSectionId, boolean>>({
    identity: false,
    pages: false,
    pageContent: false,
    settings: false,
  });
  const [isHomeSectionsOpen, setIsHomeSectionsOpen] = useState(true);
  const [isWorkspaceBusy, setIsWorkspaceBusy] = useState(false);
  const [integrationStatusMessage, setIntegrationStatusMessage] = useState('');

  const importInputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = authStatus === 'authenticated';

  const selectedPage = useMemo(() => {
    return config.pages.find((page) => page.id === selectedPageId) ?? config.pages[0];
  }, [config.pages, selectedPageId]);
  const selectedPageLayoutGroups = useMemo(
    () => getLayoutSectionGroups(selectedPage?.sections ?? [], config.theme.layoutPreset),
    [selectedPage?.sections, config.theme.layoutPreset],
  );
  const integrationEnvSnippet = useMemo(
    () =>
      getIntegrationEnvSnippet(
        config.integrations.backendProvider,
        config.integrations.cmsProvider,
        config.integrations.projectUrl,
        config.integrations.publicApiKey,
        config.integrations.cmsProjectId,
        config.integrations.cmsDataset,
        config.integrations.configId,
        config.integrations.collectionName,
        config.integrations.apiEndpoint,
        config.integrations.webhookUrl,
      ),
    [config.integrations],
  );

  useEffect(() => {
    if (!selectedPage) {
      setSelectedPageId(config.pages[0]?.id ?? '');
    }
    if (selectedPagesNavPageId && !config.pages.some((page) => page.id === selectedPagesNavPageId)) {
      setSelectedPagesNavPageId('');
    }
  }, [selectedPage, selectedPagesNavPageId, config.pages]);

  useEffect(() => {
    let isMounted = true;

    verifyAdminSession().then((valid) => {
      if (isMounted) {
        setAuthStatus(valid ? 'authenticated' : 'anonymous');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPage) {
      setSelectedSectionId('');
      setIsSectionEditFocus(false);
      return;
    }

    if (!selectedSectionId) {
      setIsSectionEditFocus(false);
      return;
    }

    const selectedSectionExists = selectedPage.sections.some((section) => section.id === selectedSectionId);
    if (!selectedSectionExists) {
      setSelectedSectionId(selectedPage.sections[0]?.id ?? '');
      setIsSectionEditFocus(false);
    }
  }, [selectedSectionId, selectedPage?.id, selectedPage?.sections.length]);

  const getGroupForActiveTab = (tab: DashboardTab): WorkspaceGroup | undefined =>
    dashboardGroups.find((group) => group.tabs.includes(tab));

  useEffect(() => {
    const activeGroup = getGroupForActiveTab(activeTab);
    if (activeGroup) {
      setOpenWorkspaceGroups((previous) => ({
        ...previous,
        [activeGroup.id]: true,
      }));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'Page Content') {
      setIsSectionEditFocus(false);
    }
  }, [activeTab]);

  const toggleWorkspaceGroup = (groupId: WorkspaceSectionId) => {
    setOpenWorkspaceGroups((previous) => ({
      ...previous,
      [groupId]: !previous[groupId],
    }));
  };

  const touchStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2400);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      clearAdminSession();
      window.location.assign('/admin/login');
    }
  };

  const updateCurrentPage = (updater: (page: ContentPageConfig) => ContentPageConfig) => {
    if (!selectedPage) {
      return;
    }
    setConfig((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === selectedPage.id ? updater(page) : page,
      ),
    }));
  };

  const updateSelectedSections = (updater: (sections: ContentPageConfig['sections']) => ContentPageConfig['sections']) => {
    updateCurrentPage((page) => ({
      ...page,
      sections: updater(page.sections),
    }));
  };

  const selectPageById = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedSectionId('');
    setIsSectionEditFocus(false);
    setIsHomeSectionsOpen(true);
  };

  const selectPageFromPagesNav = (pageId: string) => {
    setSelectedPagesNavPageId(pageId);
    selectPageById(pageId);
    setActiveTab('Structure');
  };

  const addPage = () => {
    const usedSlugs = new Set(config.pages.map((page) => page.slug));
    const label = `Page ${config.pages.length + 1}`;
    const slug = uniqueValue(toSlug(label), usedSlugs);
    const firstPage = config.pages[0] ?? defaultSiteConfig.pages[0];
    const copySections = firstPage.sections.map((section) => ({
      ...section,
      id: createId('section'),
      anchor: uniqueValue(section.anchor, new Set()),
      styleSettings: { ...defaultSectionStyle, ...section.styleSettings },
    }));
    const newPage: ContentPageConfig = {
      id: createId('page'),
      label,
      slug,
      enabled: true,
      sections: copySections,
    };

    setConfig((current) => ({
      ...current,
      pages: [...current.pages, newPage],
    }));
    selectPageById(newPage.id);
    setSelectedPagesNavPageId(newPage.id);
    setActiveTab('Structure');
    touchStatus(`Added page: ${label}`);
  };

  const removePage = (pageId: string) => {
    if (config.pages.length <= 1) {
      touchStatus('At least one page is required.');
      return;
    }

    const nextPages = config.pages.filter((page) => page.id !== pageId);
    setConfig((current) => ({ ...current, pages: nextPages }));
    selectPageById(nextPages[0]?.id ?? '');
    setSelectedPagesNavPageId((current) => (current === pageId ? '' : current));
    touchStatus('Page deleted.');
  };

  const addSectionInternal = (options?: { sectionType?: BuiltInSectionType; label?: string }) => {
    if (!selectedPage) {
      return;
    }

    const sectionType = options?.sectionType ?? newSectionType;
    const usedAnchors = new Set(selectedPage.sections.map((section) => section.anchor));
    const source = sectionTypeOptions.find((item) => item.value === sectionType);
    const fallbackLabel = source?.label ?? 'Custom';
    const rawLabel = (options?.label ?? newSectionLabel).trim() || fallbackLabel;
    const normalizedLabel = rawLabel === fallbackLabel ? `${fallbackLabel} block` : rawLabel;
    const section = {
      id: createId('section'),
      label: normalizedLabel,
      anchor: uniqueValue(toSlug(normalizedLabel), usedAnchors),
      enabled: true,
      showKicker: true,
      sectionType,
      headingTitle: '',
      headingDescription: '',
      styleSettings: { ...defaultSectionStyle },
      customContent:
        sectionType === 'custom'
          ? {
              title: fallbackLabel,
              body: 'Write your section copy in the dashboard.',
              buttonLabel: '',
              buttonHref: '',
                  }
          : undefined,
    };

    updateSelectedSections((sections) => [...sections, section]);
    setNewSectionLabel('');
    setSelectedSectionId(section.id);
    setIsSectionEditFocus(true);
    setActiveTab('Page Content');
    touchStatus(`Added ${fallbackLabel} section.`);
    return section.id;
  };

  const addSection = () => {
    addSectionInternal();
  };

  const addSectionFromQuickNav = () => {
    addSectionInternal({
      sectionType: 'custom',
      label: 'Custom section',
    });
  };

  const openContentSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsSectionEditFocus(true);
    setIsHomeSectionsOpen(false);
    setActiveTab('Page Content');
  };

  const deleteSection = (sectionId: string) => {
    updateSelectedSections((sections) => {
      const nextSections = sections.filter((section) => section.id !== sectionId);
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(nextSections[0]?.id ?? '');
      }
      return nextSections;
    });
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    updateSelectedSections((sections) => {
      const index = sections.findIndex((item) => item.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= sections.length) {
        return sections;
      }
      const next = [...sections];
      const item = next[index];
      next[index] = next[target];
      next[target] = item;
      return next;
    });
  };

  const updateSection = (sectionId: string, patch: Partial<PageSectionConfig>) => {
    updateSelectedSections((sections) =>
      sections.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
    );
  };

  const updateSectionStyle = (sectionId: string, patch: Partial<SectionStyleConfig>) => {
    updateSelectedSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              styleSettings: {
                ...defaultSectionStyle,
                ...section.styleSettings,
                ...patch,
              },
            }
          : section,
      ),
    );
  };

  const updateSectionCustomField = (
    sectionId: string,
    updates: {
      body?: string;
      buttonLabel?: string;
      buttonHref?: string;
      title?: string;
    },
  ) => {
    updateSelectedSections((sections) =>
      sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          customContent: {
            ...section.customContent,
            title: section.customContent?.title ?? section.label,
            body: section.customContent?.body ?? '',
            buttonLabel: section.customContent?.buttonLabel ?? '',
            buttonHref: section.customContent?.buttonHref ?? '',
            ...updates,
          },
        };
      }),
    );
  };

  const setHeaderNavigationLinkVisible = (anchor: string, visible: boolean) => {
    const normalizedAnchor = toSlug(anchor);
    setConfig((current) => {
      const hiddenNavigationAnchors = new Set(current.header.hiddenNavigationAnchors);

      if (visible) {
        hiddenNavigationAnchors.delete(normalizedAnchor);
      } else {
        hiddenNavigationAnchors.add(normalizedAnchor);
      }

      return {
        ...current,
        header: {
          ...current.header,
          hiddenNavigationAnchors: Array.from(hiddenNavigationAnchors),
        },
      };
    });
  };

  const setHeaderPageLinkVisible = (slug: string, visible: boolean) => {
    const normalizedSlug = toSlug(slug);
    setConfig((current) => {
      const visiblePageSlugs = new Set(current.header.visiblePageSlugs);

      if (visible) {
        visiblePageSlugs.add(normalizedSlug);
      } else {
        visiblePageSlugs.delete(normalizedSlug);
      }

      return {
        ...current,
        header: {
          ...current.header,
          visiblePageSlugs: Array.from(visiblePageSlugs),
        },
      };
    });
  };

  const handleCopyJson = async () => {
    setIsWorkspaceBusy(true);
    setRestoreProgressText('Preparing backup copy...');
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      touchStatus('Backup copied to clipboard.');
      setRestoreProgressText('Backup copied.');
    } catch {
      touchStatus('Copy failed.');
      setRestoreProgressText('Copy failed.');
    } finally {
      setIsWorkspaceBusy(false);
      setRestoreProgressText('');
    }
  };

  const handleExport = () => {
    setIsWorkspaceBusy(true);
    setRestoreProgressText('Preparing backup download...');
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reakt-webkit-content.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setIsWorkspaceBusy(false);
    setRestoreProgressText('');
    touchStatus('Config exported.');
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsText(file);
    });
  };

  const applyImportedConfig = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      const next = normalizeConfig(parsed);
      if (!Array.isArray(next.pages) || next.pages.length === 0) {
        throw new Error('Backup file does not include any pages.');
      }
      setConfig(next);
      setImportError('');
      touchStatus('Workspace restored.');
      setRestoreProgressText('Restore complete.');
      setSelectedSectionId('');
      setIsSectionEditFocus(false);
      setIsHomeSectionsOpen(true);
      setSelectedPageId(next.pages[0]?.id ?? '');
      setSelectedPagesNavPageId('');
      return true;
    } catch {
      setImportError('Restore failed: invalid JSON.');
      touchStatus('Restore failed: invalid JSON.');
      return false;
    }
  };

  const restoreFromFile = async (file?: File) => {
    if (!file) {
      return;
    }

    setIsRestoringBackup(true);
    setIsWorkspaceBusy(true);
    setRestoreProgressText('Reading backup file...');
    setImportError('');
    setActiveTab('Page Content');

    try {
      const content = await readTextFile(file);
      await new Promise((resolve) => {
        window.setTimeout(resolve, 260);
      });
      setRestoreProgressText('Validating backup...');
      await new Promise((resolve) => {
        window.setTimeout(resolve, 260);
      });
      setRestoreProgressText('Applying workspace restore...');
      const restored = applyImportedConfig(content);
      if (!restored) {
        setRestoreProgressText('Restore failed. Check this is a valid workspace backup file.');
        return;
      }
      setRestoreProgressText('Restore complete.');
      await new Promise((resolve) => {
        window.setTimeout(resolve, 500);
      });
      setRestoreProgressText('Workspace restored. Closing...');
      await new Promise((resolve) => {
        window.setTimeout(resolve, 300);
      });
    } catch {
      setImportError('Restore failed. Check this is a valid workspace backup file.');
      touchStatus('Restore failed. Check this is a valid workspace backup file.');
      setRestoreProgressText('Restore failed.');
    } finally {
      setIsRestoringBackup(false);
      setIsWorkspaceBusy(false);
      window.setTimeout(() => {
        setRestoreProgressText('');
      }, 1200);
    }
  };

  const generateAdminSecret = () => {
    if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
      return 'replace-with-a-long-random-secret';
    }

    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    const secret = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setAdminSessionSecret(secret);
    touchStatus('Session secret generated.');
    return secret;
  };

  const downloadEnvFile = () => {
    if (typeof window === 'undefined' || !newPassword.trim()) {
      touchStatus('Set an admin password to generate env file.');
      return;
    }

    const secret = adminSessionSecret.trim() || generateAdminSecret();
    const content = `ADMIN_PASSWORD=${newPassword.trim()}\nADMIN_SESSION_SECRET=${secret}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '.env';
    link.click();
    URL.revokeObjectURL(link.href);
    touchStatus('Downloaded server env file.');
  };

  const testIntegrationConnection = async () => {
    setIsWorkspaceBusy(true);
    setIntegrationStatusMessage('Testing connection...');
    try {
      const result = await testStorageConnection(config);
      setIntegrationStatusMessage(result.message);
      touchStatus(result.ok ? 'Integration connection works.' : 'Integration connection failed.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Integration connection failed.';
      setIntegrationStatusMessage(message);
      touchStatus('Integration connection failed.');
    } finally {
      setIsWorkspaceBusy(false);
    }
  };

  const pushIntegrationConfig = async () => {
    setIsWorkspaceBusy(true);
    setIntegrationStatusMessage('Pushing current workspace to backend...');
    try {
      await pushConfigToStorage(config);
      setIntegrationStatusMessage('Current workspace pushed to the selected backend.');
      touchStatus('Workspace pushed to backend.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not push workspace to backend.';
      setIntegrationStatusMessage(message);
      touchStatus('Backend push failed.');
    } finally {
      setIsWorkspaceBusy(false);
    }
  };

  const pullIntegrationConfig = async () => {
    setIsWorkspaceBusy(true);
    setIntegrationStatusMessage('Pulling workspace from backend...');
    try {
      const nextConfig = await pullConfigFromStorage(config);
      setConfig(nextConfig);
      await reloadConfigFromStorage();
      setIntegrationStatusMessage('Workspace pulled from the selected backend.');
      touchStatus('Workspace pulled from backend.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not pull workspace from backend.';
      setIntegrationStatusMessage(message);
      touchStatus('Backend pull failed.');
    } finally {
      setIsWorkspaceBusy(false);
    }
  };

  const updateLogoFromFile = (file?: File) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setConfig((current) => ({
        ...current,
        logoUrl: String(reader.result ?? ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const renderDesignControls = ({
    styleSettings,
    onUpdate,
    onReset,
  }: {
    styleSettings?: SectionStyleConfig;
    onUpdate: (patch: Partial<SectionStyleConfig>) => void;
    onReset: () => void;
  }) => {
    const currentStyle = { ...defaultSectionStyle, ...styleSettings };

    return (
      <div className='admin-editor-setting-fields'>
        <div className='admin-editor-color-grid'>
          {sectionStyleColorFields.map((field) => (
            <label key={field.key} className='admin-editor-color-field'>
              <span>{field.label}</span>
              <span className='admin-editor-color-control'>
                <input
                  type='color'
                  value={currentStyle[field.key] || sectionStyleColorDefaults[field.key]}
                  onChange={(event) =>
                    onUpdate({
                      [field.key]: event.target.value,
                    })
                  }
                />
                <input
                  type='text'
                  value={currentStyle[field.key]}
                  placeholder={sectionStyleColorDefaults[field.key]}
                  onChange={(event) =>
                    onUpdate({
                      [field.key]: event.target.value,
                    })
                  }
                />
              </span>
            </label>
          ))}
        </div>

        <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
          <label className='admin-editor-select-field'>
            <span>Font family</span>
            <select
              className='admin-editor-select'
              value={currentStyle.fontFamily}
              onChange={(event) =>
                onUpdate({
                  fontFamily: event.target.value as SectionFontFamily,
                })
              }
            >
              {(Object.keys(sectionFontFamilyLabel) as SectionFontFamily[]).map((font) => (
                <option key={font} value={font}>
                  {sectionFontFamilyLabel[font]}
                </option>
              ))}
            </select>
          </label>

          <div className='admin-editor-setting-actions admin-editor-setting-actions--align-end'>
            <Button variant='outline' onClick={onReset}>
              <span className='admin-editor-button-content'>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                  <path d='M3 12a9 9 0 1 0 3-6.7' />
                  <path d='M3 3v6h6' />
                </svg>
                Reset design
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const sectionEditor = useMemo(() => {
    if (!selectedPage) {
      return null;
    }

    return (
      <section className='admin-editor-settings-surface'>
        <div className='admin-editor-settings-list'>
          <div className='admin-editor-setting-row'>
            <div className='admin-editor-setting-copy'>
              <p>Page identity</p>
              <span>Label, route slug, and publication state for the selected page.</span>
            </div>
            <div className='admin-editor-setting-fields'>
              <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                <Input
                  label='Page label'
                  value={selectedPage.label}
                  onChange={(event) =>
                    updateCurrentPage((page) => ({ ...page, label: event.target.value }))
                  }
                />
                <Input
                  label='Page slug'
                  value={selectedPage.slug}
                  helperText='Used at /{slug} for route path'
                  onChange={(event) =>
                    updateCurrentPage((page) => ({ ...page, slug: toSlug(event.target.value) }))
                  }
                />
              </div>
              <div className='admin-editor-page-status-row'>
                <label className='admin-editor-toggle-row'>
                  <input
                    type='checkbox'
                    checked={selectedPage.enabled}
                    onChange={(event) =>
                      updateCurrentPage((page) => ({ ...page, enabled: event.target.checked }))
                    }
                  />
                  <span className='admin-editor-toggle-track' aria-hidden='true'>
                    <span />
                  </span>
                  <span className='admin-editor-toggle-copy'>
                    <strong>Published on public site</strong>
                    <small>{selectedPage.enabled ? 'This page is visible.' : 'This page is hidden.'}</small>
                  </span>
                </label>
                <code className='admin-editor-code-snippet admin-editor-code-snippet--compact'>
                  /page/{selectedPage.slug}
                </code>
              </div>
            </div>
          </div>

          <div className='admin-editor-setting-row'>
            <div className='admin-editor-setting-copy'>
              <p>Pages in project</p>
              <span>Select a page to edit, add a new page, or remove the current one.</span>
            </div>
            <div className='admin-editor-setting-fields'>
              <div className='admin-editor-page-list'>
                {config.pages.map((page) => (
                  <button
                    key={page.id}
                    type='button'
                    onClick={() => selectPageById(page.id)}
                    className='admin-editor-page-list-item'
                    aria-current={page.id === selectedPageId ? 'page' : undefined}
                  >
                    <span>
                      <strong>{page.label}</strong>
                      <small>{page.slug}</small>
                    </span>
                    {page.id === selectedPageId ? <em>Editing</em> : null}
                  </button>
                ))}
              </div>

              <div className='admin-editor-setting-actions'>
                <Button variant='outline' onClick={addPage}>
                  <span className='admin-editor-button-content'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                      <path d='M12 5v14' />
                      <path d='M5 12h14' />
                    </svg>
                    Add page
                  </span>
                </Button>
                <Button variant='outline' onClick={() => removePage(selectedPageId)}>
                  <span className='admin-editor-button-content'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                      <path d='M3 6h18' />
                      <path d='M8 6V4h8v2' />
                      <path d='M19 6l-1 14H6L5 6' />
                    </svg>
                    Delete page
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {config.theme.layoutPreset === 'editorial' ? (
            <div className='admin-editor-setting-row'>
              <div className='admin-editor-setting-copy'>
                <p>Side menu</p>
                <span>Customize the editorial side navigation shown on the website.</span>
              </div>
              <div className='admin-editor-setting-fields'>
                <label className='admin-editor-toggle-row'>
                  <input
                    type='checkbox'
                    checked={config.sideMenu.show}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: { ...current.sideMenu, show: event.target.checked },
                      }))
                    }
                  />
                  <span className='admin-editor-toggle-track' aria-hidden='true'>
                    <span />
                  </span>
                  <span className='admin-editor-toggle-copy'>
                    <strong>Show side menu</strong>
                    <small>{config.sideMenu.show ? 'Side menu is visible on the website.' : 'Side menu is hidden.'}</small>
                  </span>
                </label>

                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <Input
                    label='Eyebrow'
                    value={config.sideMenu.eyebrow}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: { ...current.sideMenu, eyebrow: event.target.value },
                      }))
                    }
                  />
                  <Input
                    label='Title'
                    value={config.sideMenu.title}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: { ...current.sideMenu, title: event.target.value },
                      }))
                    }
                  />
                </div>

                <Textarea
                  label='Description'
                  rows={2}
                  value={config.sideMenu.description}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      sideMenu: { ...current.sideMenu, description: event.target.value },
                    }))
                  }
                />

                <label className='admin-editor-select-field'>
                  <span>Side menu layout</span>
                  <select
                    className='admin-editor-select'
                    value={config.sideMenu.layoutPreset}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: {
                          ...current.sideMenu,
                          layoutPreset: event.target.value as SideMenuLayoutPreset,
                        },
                      }))
                    }
                  >
                    {(Object.keys(sideMenuLayoutPresetLabel) as SideMenuLayoutPreset[]).map((preset) => (
                      <option key={preset} value={preset}>
                        {sideMenuLayoutPresetLabel[preset]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className='admin-editor-layout-preview-list'>
                  {(Object.keys(sideMenuLayoutPresetLabel) as SideMenuLayoutPreset[]).map((preset) => (
                    <button
                      key={preset}
                      type='button'
                      className='admin-editor-layout-preview'
                      aria-current={config.sideMenu.layoutPreset === preset ? 'true' : undefined}
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          sideMenu: { ...current.sideMenu, layoutPreset: preset },
                        }))
                      }
                    >
                      <span>{sideMenuLayoutPresetLabel[preset]}</span>
                      <small>{sideMenuLayoutPresetDescription[preset]}</small>
                    </button>
                  ))}
                </div>

                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <Input
                    label='Menu width'
                    type='number'
                    value={String(config.sideMenu.width)}
                    helperText='Desktop width in rem'
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: {
                          ...current.sideMenu,
                          width: Math.min(24, Math.max(10, Number(event.target.value) || 15)),
                        },
                      }))
                    }
                  />
                  <Input
                    label='Font size'
                    type='number'
                    value={String(config.sideMenu.fontSize)}
                    helperText='Link size in rem'
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: {
                          ...current.sideMenu,
                          fontSize: Math.min(1.25, Math.max(0.72, Number(event.target.value) || 0.9)),
                        },
                      }))
                    }
                  />
                </div>

                <div className='admin-editor-section-content-block'>
                  <div className='admin-editor-section-content-heading'>
                    <p>Menu items</p>
                    <span>Edit link text and target anchors. Use anchors from this page, without the # symbol.</span>
                  </div>
                  <div className='admin-editor-repeat-list'>
                    {config.sideMenu.items.map((item, index) => (
                      <div key={item.id} className='admin-editor-repeat-item'>
                        <span className='admin-editor-repeat-marker'>{index + 1}</span>
                        <div className='admin-editor-repeat-fields'>
                          <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                            <Input
                              label='Label'
                              value={item.label}
                              onChange={(event) =>
                                setConfig((current) => ({
                                  ...current,
                                  sideMenu: {
                                    ...current.sideMenu,
                                    items: current.sideMenu.items.map((entry) =>
                                      entry.id === item.id ? { ...entry, label: event.target.value } : entry,
                                    ),
                                  },
                                }))
                              }
                            />
                            <Input
                              label='Anchor'
                              value={item.anchor}
                              helperText={selectedPage.sections.map((section) => section.anchor).join(', ')}
                              onChange={(event) =>
                                setConfig((current) => ({
                                  ...current,
                                  sideMenu: {
                                    ...current.sideMenu,
                                    items: current.sideMenu.items.map((entry) =>
                                      entry.id === item.id ? { ...entry, anchor: toSlug(event.target.value) } : entry,
                                    ),
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className='admin-editor-setting-actions admin-editor-setting-actions--end'>
                            <Button
                              variant='outline'
                              onClick={() =>
                                setConfig((current) => ({
                                  ...current,
                                  sideMenu: {
                                    ...current.sideMenu,
                                    items: current.sideMenu.items.filter((entry) => entry.id !== item.id),
                                  },
                                }))
                              }
                              disabled={config.sideMenu.items.length <= 1}
                            >
                              <span className='admin-editor-button-content'>
                                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                                  <path d='M3 6h18' />
                                  <path d='M8 6V4h8v2' />
                                  <path d='M19 6l-1 14H6L5 6' />
                                </svg>
                                Delete item
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          sideMenu: {
                            ...current.sideMenu,
                            items: [
                              ...current.sideMenu.items,
                              {
                                id: createId('side-menu'),
                                label: 'New menu item',
                                anchor: selectedPage.sections[0]?.anchor ?? 'hero',
                              },
                            ],
                          },
                        }))
                      }
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 5v14' />
                          <path d='M5 12h14' />
                        </svg>
                        Add menu item
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          sideMenu: {
                            ...current.sideMenu,
                            items: selectedPage.sections
                              .filter((section) => section.enabled)
                              .map((section) => ({
                                id: createId('side-menu'),
                                label: section.label,
                                anchor: section.anchor,
                              })),
                          },
                        }))
                      }
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M3 12a9 9 0 1 0 3-6.7' />
                          <path d='M3 3v6h6' />
                        </svg>
                        Use page sections
                      </span>
                    </Button>
                  </div>
                </div>

                <div className='admin-editor-section-content-block'>
                  <div className='admin-editor-section-content-heading'>
                    <p>Side menu design</p>
                    <span>Customize colors and typography for the side menu.</span>
                  </div>
                  {renderDesignControls({
                    styleSettings: config.sideMenu.styleSettings,
                    onUpdate: (patch) =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: {
                          ...current.sideMenu,
                          styleSettings: { ...current.sideMenu.styleSettings, ...patch },
                        },
                      })),
                    onReset: () =>
                      setConfig((current) => ({
                        ...current,
                        sideMenu: { ...current.sideMenu, styleSettings: { ...defaultSectionStyle } },
                      })),
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div className='admin-editor-setting-row'>
            <div className='admin-editor-setting-copy'>
              <p>Section builder</p>
              <span>Add, rename, hide, and reorder blocks on the selected page.</span>
            </div>
            <div className='admin-editor-setting-fields'>
              <div className='admin-editor-section-builder-form'>
                <Input
                  label='New section label'
                  value={newSectionLabel}
                  helperText='Leave empty to auto use selected section type'
                  onChange={(event) => setNewSectionLabel(event.target.value)}
                />
                <label className='admin-editor-select-field'>
                  <span>Section type</span>
                  <select
                    className='admin-editor-select'
                    value={newSectionType}
                    onChange={(event) => setNewSectionType(event.target.value as BuiltInSectionType)}
                  >
                    {sectionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className='admin-editor-section-builder-actions'>
                  <Button onClick={addSection} variant='outline'>
                    <span className='admin-editor-button-content'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M12 5v14' />
                        <path d='M5 12h14' />
                      </svg>
                      Add section
                    </span>
                  </Button>
                  <Button variant='outline' onClick={() => setNewSectionLabel('')}>
                    <span className='admin-editor-button-content'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M3 12a9 9 0 1 0 3-6.7' />
                        <path d='M3 3v6h6' />
                      </svg>
                      Reset
                    </span>
                  </Button>
                </div>
              </div>

              <div className='admin-editor-layout-context'>
                <span>{layoutPresetLabel[config.theme.layoutPreset]}</span>
                <p>{layoutPresetDescription[config.theme.layoutPreset]}</p>
              </div>

              <div className='admin-editor-section-edit-list'>
                {selectedPageLayoutGroups.map((layoutGroup) => (
                  <div key={layoutGroup.id} className='admin-editor-section-layout-group'>
                    <div className='admin-editor-section-layout-heading'>
                      <span>{layoutGroup.title}</span>
                      <p>{layoutGroup.description}</p>
                    </div>
                    {layoutGroup.sections.map((section) => {
                      const sectionIndex = selectedPage.sections.findIndex((entry) => entry.id === section.id);
                      return (
                  <div key={section.id} className='admin-editor-section-edit-row'>
                    <div className='admin-editor-section-edit-header'>
                      <div className='admin-editor-section-edit-title'>
                        <span>{sectionIndex + 1}</span>
                        <div>
                          <p>{section.label || 'Untitled section'}</p>
                          <small>Anchor: {section.anchor}</small>
                        </div>
                      </div>
                      <label className='admin-editor-toggle-row admin-editor-toggle-row--compact'>
                        <input
                          type='checkbox'
                          checked={section.enabled}
                          onChange={(event) => updateSection(section.id, { enabled: event.target.checked })}
                        />
                        <span className='admin-editor-toggle-track' aria-hidden='true'>
                          <span />
                        </span>
                        <span className='admin-editor-toggle-copy'>
                          <strong>Visible</strong>
                        </span>
                      </label>
                    </div>

                    <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                      <Input
                        label='Section label'
                        value={section.label}
                        onChange={(event) => {
                          const label = event.target.value;
                          updateSection(section.id, {
                            label,
                            customContent:
                              section.sectionType === 'custom'
                                ? {
                                    title: label,
                                    body: section.customContent?.body ?? '',
                                    buttonLabel: section.customContent?.buttonLabel ?? '',
                                    buttonHref: section.customContent?.buttonHref ?? '',
                                  }
                                : section.customContent,
                          });
                        }}
                      />

                      <Input
                        label='Section anchor'
                        helperText='Only letters, numbers and dashes'
                        value={section.anchor}
                        onChange={(event) =>
                          updateSection(section.id, { anchor: toSlug(event.target.value) })
                        }
                      />
                    </div>

                    <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                      <Input
                        label='Section heading title'
                        value={section.headingTitle || ''}
                        onChange={(event) => updateSection(section.id, { headingTitle: event.target.value })}
                      />
                      <label className='admin-editor-select-field'>
                        <span>Section type</span>
                        <select
                          className='admin-editor-select'
                          value={section.sectionType}
                          onChange={(event) => {
                            const sectionType = event.target.value as BuiltInSectionType;
                            updateSection(section.id, {
                              sectionType,
                              customContent:
                                sectionType === 'custom'
                                  ? {
                                      title: section.label,
                                      body: section.customContent?.body || '',
                                      buttonLabel: section.customContent?.buttonLabel || '',
                                      buttonHref: section.customContent?.buttonHref || '',
                                    }
                                  : undefined,
                            });
                          }}
                        >
                          {sectionTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <Textarea
                      label='Section intro / heading description'
                      rows={2}
                      value={section.headingDescription || ''}
                      onChange={(event) =>
                        updateSection(section.id, {
                          headingDescription: event.target.value,
                        })
                      }
                    />

                    {section.sectionType === 'custom' ? (
                      <div className='admin-editor-section-content-block'>
                        <div className='admin-editor-section-content-heading'>
                          <p>Custom content</p>
                          <span>Fields rendered inside this custom page block.</span>
                        </div>
                        <div className='admin-editor-setting-fields'>
                          <Textarea
                            label='Section body'
                            rows={3}
                            value={section.customContent?.body || ''}
                            onChange={(event) =>
                              updateSectionCustomField(section.id, {
                                body: event.target.value,
                              })
                            }
                          />
                          <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                            <Input
                              label='Button label'
                              value={section.customContent?.buttonLabel || ''}
                              onChange={(event) =>
                                updateSectionCustomField(section.id, {
                                  buttonLabel: event.target.value,
                                })
                              }
                            />
                            <Input
                              label='Button href'
                              value={section.customContent?.buttonHref || ''}
                              onChange={(event) =>
                                updateSectionCustomField(section.id, {
                                  buttonHref: event.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className='admin-editor-setting-actions admin-editor-setting-actions--end'>
                      <Button
                        variant='outline'
                        onClick={() => moveSection(section.id, -1)}
                        disabled={sectionIndex <= 0}
                      >
                        <span className='admin-editor-button-content'>
                          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                            <path d='m18 15-6-6-6 6' />
                          </svg>
                          Move up
                        </span>
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => moveSection(section.id, 1)}
                        disabled={sectionIndex === selectedPage.sections.length - 1}
                      >
                        <span className='admin-editor-button-content'>
                          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                            <path d='m6 9 6 6 6-6' />
                          </svg>
                          Move down
                        </span>
                      </Button>
                      <Button
                        variant='danger'
                        onClick={() => deleteSection(section.id)}
                        disabled={selectedPage.sections.length <= 1}
                      >
                        <span className='admin-editor-button-content'>
                          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                            <path d='M3 6h18' />
                            <path d='M8 6V4h8v2' />
                            <path d='M19 6l-1 14H6L5 6' />
                          </svg>
                          Delete
                        </span>
                      </Button>
                    </div>
                  </div>
                      );
                    })}
                  </div>
                ))}

                {selectedPage.sections.length === 0 ? (
                  <div className='admin-editor-empty-state'>
                    No sections on this page yet. Add your first section to start building.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }, [
    selectedPage,
    selectedPageId,
    selectedPageLayoutGroups,
    config.pages,
    config.sideMenu,
    config.theme.layoutPreset,
    newSectionLabel,
    newSectionType,
  ]);

  const sectionParametersEditor = useMemo(() => {
    if (!selectedPage) {
      return <p>Loading section editor…</p>;
    }

    const sectionIndex = selectedPage.sections.findIndex((section) => section.id === selectedSectionId);
    const section = sectionIndex >= 0 ? selectedPage.sections[sectionIndex] : null;

    if (!section) {
      return (
        <div className='admin-editor-empty-state'>
          No content section selected. Use the left side list to pick a section.
        </div>
      );
    }

    const sectionStyle = { ...defaultSectionStyle, ...section.styleSettings };

      return (
        <section className='admin-editor-settings-surface'>
          <div className='admin-editor-settings-list'>
            <div className='admin-editor-setting-row'>
              <div className='admin-editor-setting-copy'>
                <p>Section identity</p>
                <span>Core metadata and visibility for this page section.</span>
              </div>
              <div className='admin-editor-setting-fields'>
                <div className='admin-editor-section-edit-header'>
                  <div className='admin-editor-section-edit-title'>
                    <span>{sectionIndex + 1}</span>
                    <div>
                      <p>{section.label || 'Untitled section'}</p>
                      <small>Anchor: {section.anchor}</small>
                    </div>
                  </div>
                  <div className='admin-editor-setting-actions'>
                    <label className='admin-editor-toggle-row admin-editor-toggle-row--compact'>
                      <input
                        type='checkbox'
                        checked={section.enabled}
                        onChange={(event) => updateSection(section.id, { enabled: event.target.checked })}
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'>
                        <span />
                      </span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Visible</strong>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row admin-editor-toggle-row--compact'>
                      <input
                        type='checkbox'
                        checked={section.showKicker}
                        onChange={(event) => updateSection(section.id, { showKicker: event.target.checked })}
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'>
                        <span />
                      </span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Kicker</strong>
                      </span>
                    </label>
                    <Button
                      variant='outline'
                      className='shrink-0 text-xs py-1.5'
                      onClick={() => {
                        setIsSectionEditFocus(false);
                        setSelectedSectionId('');
                        setIsHomeSectionsOpen(true);
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M19 12H5' />
                          <path d='m12 19-7-7 7-7' />
                        </svg>
                        Section list
                      </span>
                    </Button>
                  </div>
                </div>

                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <Input
                    label='Section label'
                    value={section.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      updateSection(section.id, {
                        label,
                        customContent:
                          section.sectionType === 'custom'
                            ? {
                                title: label,
                                body: section.customContent?.body ?? '',
                                buttonLabel: section.customContent?.buttonLabel ?? '',
                                buttonHref: section.customContent?.buttonHref ?? '',
                              }
                            : section.customContent,
                      });
                    }}
                  />
                  <Input
                    label='Section anchor'
                    helperText='Only letters, numbers and dashes'
                    value={section.anchor}
                    onChange={(event) =>
                      updateSection(section.id, { anchor: toSlug(event.target.value) })
                    }
                  />
                </div>

                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <Input
                    label='Section heading title'
                    value={section.headingTitle || ''}
                    onChange={(event) =>
                      updateSection(section.id, { headingTitle: event.target.value })
                    }
                  />
                  <label className='admin-editor-select-field'>
                    <span>Section type</span>
                    <select
                      className='admin-editor-select'
                      value={section.sectionType}
                      onChange={(event) => {
                        const sectionType = event.target.value as BuiltInSectionType;
                        updateSection(section.id, {
                          sectionType,
                          customContent:
                            sectionType === 'custom'
                              ? {
                                  title: section.label,
                                  body: section.customContent?.body || '',
                                  buttonLabel: section.customContent?.buttonLabel || '',
                                  buttonHref: section.customContent?.buttonHref || '',
                                }
                              : undefined,
                        });
                      }}
                    >
                      {sectionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <Textarea
                  label='Section intro / heading description'
                  rows={2}
                  value={section.headingDescription || ''}
                  onChange={(event) =>
                    updateSection(section.id, {
                      headingDescription: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className='admin-editor-setting-row'>
              <div className='admin-editor-setting-copy'>
                <p>Section design</p>
                <span>Customize colors and typography for this section only.</span>
              </div>
              <div className='admin-editor-setting-fields'>
                <div className='admin-editor-color-grid'>
                  {sectionStyleColorFields.map((field) => (
                    <label key={field.key} className='admin-editor-color-field'>
                      <span>{field.label}</span>
                      <span className='admin-editor-color-control'>
                        <input
                          type='color'
                          value={sectionStyle[field.key] || sectionStyleColorDefaults[field.key]}
                          onChange={(event) =>
                            updateSectionStyle(section.id, {
                              [field.key]: event.target.value,
                            })
                          }
                        />
                        <input
                          type='text'
                          value={sectionStyle[field.key]}
                          placeholder={sectionStyleColorDefaults[field.key]}
                          onChange={(event) =>
                            updateSectionStyle(section.id, {
                              [field.key]: event.target.value,
                            })
                          }
                        />
                      </span>
                    </label>
                  ))}
                </div>

                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <label className='admin-editor-select-field'>
                    <span>Font family</span>
                    <select
                      className='admin-editor-select'
                      value={sectionStyle.fontFamily}
                      onChange={(event) =>
                        updateSectionStyle(section.id, {
                          fontFamily: event.target.value as SectionFontFamily,
                        })
                      }
                    >
                      {(Object.keys(sectionFontFamilyLabel) as SectionFontFamily[]).map((font) => (
                        <option key={font} value={font}>
                          {sectionFontFamilyLabel[font]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className='admin-editor-setting-actions admin-editor-setting-actions--align-end'>
                    <Button
                      variant='outline'
                      onClick={() => updateSection(section.id, { styleSettings: { ...defaultSectionStyle } })}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M3 12a9 9 0 1 0 3-6.7' />
                          <path d='M3 3v6h6' />
                        </svg>
                        Reset design
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className='admin-editor-setting-row'>
              <div className='admin-editor-setting-copy'>
                <p>{section.label || 'Section'} content</p>
                <span>Content fields for the selected section type.</span>
              </div>
              <div className='admin-editor-setting-fields admin-editor-section-type-fields'>

              {section.sectionType === 'hero' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Hero content</h3>
                  <div className='admin-editor-setting-fields'>
                    <label className='admin-editor-select-field'>
                      <span>Hero layout preset</span>
                      <select
                        className='admin-editor-select'
                        value={config.hero.layoutPreset}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            hero: { ...current.hero, layoutPreset: event.target.value as HeroLayoutPreset },
                          }))
                        }
                      >
                        {(Object.keys(heroLayoutPresetLabel) as HeroLayoutPreset[]).map((preset) => (
                          <option key={preset} value={preset}>
                            {heroLayoutPresetLabel[preset]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className='admin-editor-layout-preview-list'>
                      {(Object.keys(heroLayoutPresetLabel) as HeroLayoutPreset[]).map((preset) => (
                        <button
                          key={preset}
                          type='button'
                          className='admin-editor-layout-preview'
                          aria-current={config.hero.layoutPreset === preset ? 'true' : undefined}
                          onClick={() =>
                            setConfig((current) => ({
                              ...current,
                              hero: { ...current.hero, layoutPreset: preset },
                            }))
                          }
                        >
                          <span>{heroLayoutPresetLabel[preset]}</span>
                          <small>{heroLayoutPresetDescription[preset]}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <Input
                      label='Kicker'
                      value={config.hero.kicker}
                      onChange={(event) =>
                        setConfig((current) => ({ ...current, hero: { ...current.hero, kicker: event.target.value } }))
                      }
                    />
                    <Input
                      label='Primary CTA'
                      value={config.hero.primaryCtaLabel}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          hero: { ...current.hero, primaryCtaLabel: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <Textarea
                    label='Headline'
                    value={config.hero.headline}
                    rows={3}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, hero: { ...current.hero, headline: event.target.value } }))
                    }
                  />
                  <Input
                    label='Subheading'
                    value={config.hero.subheading}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, hero: { ...current.hero, subheading: event.target.value } }))
                    }
                  />
                  <Input
                    label='Secondary CTA'
                    value={config.hero.secondaryCtaLabel}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        hero: { ...current.hero, secondaryCtaLabel: event.target.value },
                      }))
                    }
                  />
                  <div className='grid gap-3 md:grid-cols-2'>
                    <Input
                      label='Hero image URL'
                      value={config.hero.imageUrl}
                      helperText='Used by the Image split hero preset'
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          hero: { ...current.hero, imageUrl: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label='Hero image alt text'
                      value={config.hero.imageAlt}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          hero: { ...current.hero, imageAlt: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'about' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>About content</h3>
                  <Input
                    label='About title'
                    value={config.about.title}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        about: { ...current.about, title: event.target.value },
                      }))
                    }
                  />
                  <Textarea
                    label='About description'
                    rows={3}
                    value={config.about.description}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        about: { ...current.about, description: event.target.value },
                      }))
                    }
                  />
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='rounded-xl border border-white/10 bg-slate-950/20 p-3'>
                      <h4 className='text-sm font-semibold'>Highlights</h4>
                      {config.about.highlights.map((item, index) => (
                        <Input
                          className='mt-2'
                          key={`${item}-${index}`}
                          value={item}
                          onChange={(event) =>
                            setConfig((current) => {
                              const next = [...current.about.highlights];
                              next[index] = event.target.value;
                              return { ...current, about: { ...current.about, highlights: next } };
                            })
                          }
                          label={`Item ${index + 1}`}
                        />
                      ))}
                      <div className='mt-2 flex gap-2'>
                        <Button
                          variant='outline'
                          onClick={() =>
                            setConfig((current) => ({
                              ...current,
                              about: { ...current.about, highlights: [...current.about.highlights, 'New highlight'] },
                            }))
                          }
                        >
                          Add highlight
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() =>
                            setConfig((current) => ({
                              ...current,
                              about: {
                                ...current.about,
                                highlights: current.about.highlights.slice(0, -1),
                              },
                            }))
                          }
                          disabled={config.about.highlights.length <= 1}
                        >
                          Remove last
                        </Button>
                      </div>
                    </div>
                    <div className='rounded-xl border border-white/10 bg-slate-950/20 p-3'>
                      <h4 className='text-sm font-semibold'>Stats</h4>
                      {config.about.stats.map((item, index) => (
                        <Input
                          className='mt-2'
                          key={`${item}-${index}`}
                          value={item}
                          onChange={(event) =>
                            setConfig((current) => {
                              const next = [...current.about.stats];
                              next[index] = event.target.value;
                              return { ...current, about: { ...current.about, stats: next } };
                            })
                          }
                          label={`Stat ${index + 1}`}
                        />
                      ))}
                      <div className='mt-2 flex gap-2'>
                        <Button
                          variant='outline'
                          onClick={() =>
                            setConfig((current) => ({
                              ...current,
                              about: { ...current.about, stats: [...current.about.stats, 'New stat'] },
                            }))
                          }
                        >
                          Add stat
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() =>
                            setConfig((current) => ({
                              ...current,
                              about: { ...current.about, stats: current.about.stats.slice(0, -1) },
                            }))
                          }
                          disabled={config.about.stats.length <= 1}
                        >
                          Remove last
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'services' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Services content</h3>
                  {config.services.map((service, index) => (
                    <div key={service.id} className='rounded-xl border border-white/10 bg-slate-900/20 p-3'>
                      <Input
                        label='Title'
                        value={service.title}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.services];
                            next[index] = { ...next[index], title: event.target.value };
                            return { ...current, services: next };
                          })
                        }
                      />
                      <Textarea
                        className='mt-2'
                        label='Description'
                        rows={3}
                        value={service.description}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.services];
                            next[index] = { ...next[index], description: event.target.value };
                            return { ...current, services: next };
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className='flex gap-2'>
                    <Button
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          services: [...current.services, { id: createId('service'), title: 'New service', description: '' }],
                        }))
                      }
                    >
                      Add service
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          services: current.services.slice(0, -1),
                        }))
                      }
                      disabled={config.services.length <= 1}
                    >
                      Remove last
                    </Button>
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'testimonials' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Testimonials content</h3>
                  {config.testimonials.map((entry, index) => (
                    <div key={entry.id} className='rounded-xl border border-white/10 bg-slate-900/20 p-3'>
                      <Input
                        label='Name'
                        value={entry.name}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.testimonials];
                            next[index] = { ...next[index], name: event.target.value };
                            return { ...current, testimonials: next };
                          })
                        }
                      />
                      <Input
                        className='mt-2'
                        label='Role'
                        value={entry.role}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.testimonials];
                            next[index] = { ...next[index], role: event.target.value };
                            return { ...current, testimonials: next };
                          })
                        }
                      />
                      <Textarea
                        className='mt-2'
                        label='Quote'
                        rows={3}
                        value={entry.quote}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.testimonials];
                            next[index] = { ...next[index], quote: event.target.value };
                            return { ...current, testimonials: next };
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className='flex gap-2'>
                    <Button
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          testimonials: [
                            ...current.testimonials,
                            { id: createId('testimonial'), name: 'New client', role: 'Role', quote: 'Testimonial...' },
                          ],
                        }))
                      }
                    >
                      Add testimonial
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          testimonials: current.testimonials.slice(0, -1),
                        }))
                      }
                      disabled={config.testimonials.length <= 1}
                    >
                      Remove last
                    </Button>
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'process' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Process content</h3>
                  {config.process.map((entry, index) => (
                    <div key={entry.id} className='rounded-xl border border-white/10 bg-slate-900/20 p-3'>
                      <Input
                        label='Title'
                        value={entry.title}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.process];
                            next[index] = { ...next[index], title: event.target.value };
                            return { ...current, process: next };
                          })
                        }
                      />
                      <Textarea
                        className='mt-2'
                        label='Description'
                        rows={2}
                        value={entry.description}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.process];
                            next[index] = { ...next[index], description: event.target.value };
                            return { ...current, process: next };
                          })
                        }
                      />
                      <Textarea
                        className='mt-2'
                        label='Outcome'
                        rows={2}
                        value={entry.outcome || ''}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.process];
                            next[index] = { ...next[index], outcome: event.target.value };
                            return { ...current, process: next };
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className='flex gap-2'>
                    <Button
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          process: [
                            ...current.process,
                            { id: createId('step'), title: 'Step', description: 'Description', outcome: 'Outcome' },
                          ],
                        }))
                      }
                    >
                      Add step
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          process: current.process.slice(0, -1),
                        }))
                      }
                      disabled={config.process.length <= 1}
                    >
                      Remove last
                    </Button>
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'faq' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>FAQ content</h3>
                  {config.faq.map((entry, index) => (
                    <div key={entry.id} className='rounded-xl border border-white/10 bg-slate-900/20 p-3'>
                      <Input
                        label='Question'
                        value={entry.question}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.faq];
                            next[index] = { ...next[index], question: event.target.value };
                            return { ...current, faq: next };
                          })
                        }
                      />
                      <Textarea
                        className='mt-2'
                        label='Answer'
                        rows={3}
                        value={entry.answer}
                        onChange={(event) =>
                          setConfig((current) => {
                            const next = [...current.faq];
                            next[index] = { ...next[index], answer: event.target.value };
                            return { ...current, faq: next };
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className='flex gap-2'>
                    <Button
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          faq: [...current.faq, { id: createId('faq'), question: 'New question', answer: 'New answer' }],
                        }))
                      }
                    >
                      Add FAQ
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          faq: current.faq.slice(0, -1),
                        }))
                      }
                      disabled={config.faq.length <= 1}
                    >
                      Remove last
                    </Button>
                  </div>
                </div>
              ) : null}

              {section.sectionType === 'contact' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Contact content</h3>
                  <Input
                    label='Contact email'
                    value={config.contactEmail}
                    onChange={(event) => setConfig((current) => ({ ...current, contactEmail: event.target.value }))}
                  />
                  <Input
                    label='Form service label'
                    value={config.contact.serviceLabel}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, contact: { ...current.contact, serviceLabel: event.target.value } }))
                    }
                  />
                  <Input
                    label='Submit button'
                    value={config.contact.submitLabel}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, contact: { ...current.contact, submitLabel: event.target.value } }))
                    }
                  />
                  <Textarea
                    label='Intro'
                    rows={3}
                    value={config.contact.intro}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, contact: { ...current.contact, intro: event.target.value } }))
                    }
                  />
                  <Textarea
                    label='Success message'
                    rows={2}
                    value={config.contact.successMessage}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        contact: { ...current.contact, successMessage: event.target.value },
                      }))
                    }
                  />
                  <Textarea
                    label='Privacy note'
                    rows={2}
                    value={config.contact.privacyNote}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        contact: { ...current.contact, privacyNote: event.target.value },
                      }))
                    }
                  />
                </div>
              ) : null}

              {section.sectionType === 'finalCta' ? (
                <div className='space-y-4 rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <h3 className='text-sm font-medium'>Final CTA content</h3>
                  <Input
                    label='Eyebrow'
                    value={config.finalCta.eyebrow}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        finalCta: { ...current.finalCta, eyebrow: event.target.value },
                      }))
                    }
                  />
                  <Input
                    label='Headline'
                    value={config.finalCta.headline}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, finalCta: { ...current.finalCta, headline: event.target.value } }))
                    }
                  />
                  <Textarea
                    label='Description'
                    rows={3}
                    value={config.finalCta.text}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, finalCta: { ...current.finalCta, text: event.target.value } }))
                    }
                  />
                  <Input
                    label='Button label'
                    value={config.finalCta.buttonLabel}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        finalCta: { ...current.finalCta, buttonLabel: event.target.value },
                      }))
                    }
                  />
                </div>
              ) : null}

              {section.sectionType === 'custom' ? (
                <div className='rounded-xl border border-white/12 bg-slate-900/15 p-3'>
                  <p className='mb-2 text-sm font-medium'>Custom content</p>
                  <div className='space-y-2'>
                    <Textarea
                      label='Section body'
                      rows={3}
                      value={section.customContent?.body || ''}
                      onChange={(event) =>
                        updateSectionCustomField(section.id, {
                          body: event.target.value,
                        })
                      }
                    />
                    <Input
                      label='Button label'
                      value={section.customContent?.buttonLabel || ''}
                      onChange={(event) =>
                        updateSectionCustomField(section.id, {
                          buttonLabel: event.target.value,
                        })
                      }
                    />
                    <Input
                      label='Button href'
                      value={section.customContent?.buttonHref || ''}
                      onChange={(event) =>
                        updateSectionCustomField(section.id, {
                          buttonHref: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}

              </div>
            </div>

            <div className='admin-editor-setting-row'>
              <div className='admin-editor-setting-copy'>
                <p>Section controls</p>
                <span>Reorder this block or remove it from the selected page.</span>
              </div>
              <div className='admin-editor-setting-actions admin-editor-setting-actions--end'>
                <Button
                  variant='outline'
                  onClick={() => moveSection(section.id, -1)}
                  disabled={sectionIndex <= 0}
                >
                  <span className='admin-editor-button-content'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                      <path d='m18 15-6-6-6 6' />
                    </svg>
                    Move up
                  </span>
                </Button>
                <Button
                  variant='outline'
                  onClick={() => moveSection(section.id, 1)}
                  disabled={sectionIndex === selectedPage.sections.length - 1}
                >
                  <span className='admin-editor-button-content'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                      <path d='m6 9 6 6 6-6' />
                    </svg>
                    Move down
                  </span>
                </Button>
                <Button
                  variant='danger'
                  onClick={() => {
                    deleteSection(section.id);
                    setIsSectionEditFocus(false);
                  }}
                  disabled={selectedPage.sections.length <= 1}
                >
                  <span className='admin-editor-button-content'>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                      <path d='M3 6h18' />
                      <path d='M8 6V4h8v2' />
                      <path d='M19 6l-1 14H6L5 6' />
                    </svg>
                    Delete
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      );
  }, [selectedSectionId, selectedPage, updateSectionCustomField, updateSection, deleteSection, moveSection, config]);

  const editor = useMemo(() => {
    if (!selectedPage) {
      return <p>Loading page editor…</p>;
    }

    switch (activeTab) {
	      case 'Brand': {
	        return (
	          <section className='admin-editor-settings-surface'>
	            <div className='admin-editor-settings-list'>
	              <div className='admin-editor-setting-row'>
	                <div className='admin-editor-setting-copy'>
	                  <p>Business identity</p>
	                  <span>Name and positioning copy shown throughout the site.</span>
	                </div>
	                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
	                  <Input
	                    label='Business name'
	                    value={config.businessName}
	                    onChange={(event) =>
	                      setConfig((current) => ({ ...current, businessName: event.target.value }))
	                    }
	                  />
	                  <Input
	                    label='Tagline'
	                    value={config.tagline}
	                    onChange={(event) =>
	                      setConfig((current) => ({ ...current, tagline: event.target.value }))
	                    }
	                  />
	                </div>
	              </div>

	              <div className='admin-editor-setting-row'>
	                <div className='admin-editor-setting-copy'>
	                  <p>Logo asset</p>
	                  <span>Use a hosted image URL or upload a local logo file.</span>
	                </div>
	                <div className='admin-editor-setting-fields'>
	                  <div className='admin-editor-logo-layout'>
	                    <div className='admin-editor-logo-preview'>
	                      {config.logoUrl ? (
	                        <img src={config.logoUrl} alt={`${config.businessName} logo preview`} />
	                      ) : (
	                        <span>No logo</span>
	                      )}
	                    </div>
	                    <div className='admin-editor-logo-controls'>
	                      <Input
	                        label='Logo URL'
	                        value={config.logoUrl}
	                        onChange={(event) =>
	                          setConfig((current) => ({ ...current, logoUrl: event.target.value }))
	                        }
	                      />
	                      <label className='admin-editor-file-upload'>
	                        <input
	                          type='file'
	                          accept='image/*'
	                          onChange={(event) => updateLogoFromFile(event.target.files?.[0])}
	                        />
	                        <span className='admin-editor-file-upload-button'>
	                          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
	                            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
	                            <path d='M17 8 12 3 7 8' />
	                            <path d='M12 3v12' />
	                          </svg>
	                          Upload image
	                        </span>
	                        <span className='admin-editor-file-upload-meta'>PNG, JPG, SVG, or WebP</span>
	                      </label>
	                    </div>
	                  </div>
	                </div>
	              </div>
	            </div>
	          </section>
	        );
	      }

      case 'Header':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Header content</p>
                  <span>Controls the logo lockup, tagline, and primary call-to-action in the top bar.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <Input
                    label='Header CTA label'
                    value={config.header.ctaLabel}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        header: { ...current.header, ctaLabel: event.target.value },
                      }))
                    }
                  />
                  <div className='admin-editor-toggle-grid'>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.header.showLogo}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            header: { ...current.header, showLogo: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show logo</strong>
                        <small>Uses the logo from Brand.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.header.showTagline}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            header: { ...current.header, showTagline: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show tagline</strong>
                        <small>Displays the Brand tagline under the business name.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.header.showNavigation}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            header: { ...current.header, showNavigation: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show navigation</strong>
                        <small>Lists selected section and page links.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.header.showCta}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            header: { ...current.header, showCta: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show CTA</strong>
                        <small>Displays the primary button on desktop.</small>
                      </span>
                    </label>
                  </div>
              </div>
            </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Logo style</p>
                  <span>Choose how the logo mark appears in the header lockup.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <label className='admin-editor-select-field'>
                    <span>Logo preset</span>
                    <select
                      className='admin-editor-select'
                      value={config.header.logoPreset}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          header: { ...current.header, logoPreset: event.target.value as HeaderLogoPreset },
                        }))
                      }
                    >
                      {(Object.keys(headerLogoPresetLabel) as HeaderLogoPreset[]).map((preset) => (
                        <option key={preset} value={preset}>
                          {headerLogoPresetLabel[preset]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className='admin-editor-layout-preview-list'>
                    {(Object.keys(headerLogoPresetLabel) as HeaderLogoPreset[]).map((preset) => (
                      <button
                        key={preset}
                        type='button'
                        className='admin-editor-layout-preview'
                        aria-current={config.header.logoPreset === preset ? 'true' : undefined}
                        onClick={() =>
                          setConfig((current) => ({
                            ...current,
                            header: { ...current.header, logoPreset: preset },
                          }))
                        }
                      >
                        <span>{headerLogoPresetLabel[preset]}</span>
                        <small>{headerLogoPresetDescription[preset]}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Header links</p>
                  <span>Choose which section and page links appear in the header navigation.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-section-content-block'>
                    <div className='admin-editor-section-content-heading'>
                      <p>Section links</p>
                      <span>Links scroll to sections on the current page.</span>
                    </div>
                  <div className='admin-editor-toggle-grid'>
                    {selectedPage.sections
                      .filter((section) => section.sectionType !== 'finalCta')
                      .map((section) => {
                        const isVisible =
                          section.enabled && !config.header.hiddenNavigationAnchors.includes(section.anchor);

                        return (
                          <label key={`header-link-${section.id}`} className='admin-editor-toggle-row'>
                            <input
                              type='checkbox'
                              checked={isVisible}
                              disabled={!section.enabled}
                              onChange={(event) =>
                                setHeaderNavigationLinkVisible(section.anchor, event.target.checked)
                              }
                            />
                            <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                            <span className='admin-editor-toggle-copy'>
                              <strong>{section.label || 'Untitled section'}</strong>
                              <small>
                                {section.enabled ? `Links to #${section.anchor}` : 'Section is hidden.'}
                              </small>
                            </span>
                          </label>
                        );
                      })}
                  </div>
                  </div>

                  <div className='admin-editor-section-content-block'>
                    <div className='admin-editor-section-content-heading'>
                      <p>Page links</p>
                      <span>Links open pages created in the Pages section.</span>
                    </div>
                    <div className='admin-editor-toggle-grid'>
                      {config.pages.map((page) => (
                        <label key={`header-page-${page.id}`} className='admin-editor-toggle-row'>
                          <input
                            type='checkbox'
                            checked={page.enabled && config.header.visiblePageSlugs.includes(page.slug)}
                            disabled={!page.enabled}
                            onChange={(event) => setHeaderPageLinkVisible(page.slug, event.target.checked)}
                          />
                          <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                          <span className='admin-editor-toggle-copy'>
                            <strong>{page.label || 'Untitled page'}</strong>
                            <small>{page.enabled ? `/page/${page.slug}` : 'Page is hidden.'}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Header design</p>
                  <span>Customize header background, text, accent, border, and font.</span>
                </div>
                {renderDesignControls({
                  styleSettings: config.header.styleSettings,
                  onUpdate: (patch) =>
                    setConfig((current) => ({
                      ...current,
                      header: {
                        ...current.header,
                        styleSettings: {
                          ...defaultSectionStyle,
                          ...current.header.styleSettings,
                          ...patch,
                        },
                      },
                    })),
                  onReset: () =>
                    setConfig((current) => ({
                      ...current,
                      header: { ...current.header, styleSettings: { ...defaultSectionStyle } },
                    })),
                })}
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Header layout</p>
                  <span>Choose whether the header uses the full viewport width or a contained layout.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <label className='admin-editor-toggle-row'>
                    <input
                      type='checkbox'
                      checked={config.header.fullWidth}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          header: { ...current.header, fullWidth: event.target.checked },
                        }))
                      }
                    />
                    <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                    <span className='admin-editor-toggle-copy'>
                      <strong>Full-width header</strong>
                      <small>{config.header.fullWidth ? 'Header spans the screen.' : 'Header content is contained.'}</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Footer':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Footer content</p>
                  <span>Business summary, footer CTA, and legal/supporting text.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <Textarea
                    label='Footer description'
                    rows={3}
                    value={config.footer.description}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        footer: { ...current.footer, description: event.target.value },
                      }))
                    }
                  />
                  <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                    <Input
                      label='Footer CTA label'
                      value={config.footer.ctaLabel}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, ctaLabel: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label='Copyright text'
                      value={config.footer.copyrightText}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, copyrightText: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <Input
                    label='Release text'
                    value={config.footer.releaseText}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        footer: { ...current.footer, releaseText: event.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Footer visibility</p>
                  <span>Toggle the main footer modules on or off.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-toggle-grid'>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.footer.showNavigation}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            footer: { ...current.footer, showNavigation: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show navigation</strong>
                        <small>Lists enabled page sections.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.footer.showSocialLinks}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            footer: { ...current.footer, showSocialLinks: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show social links</strong>
                        <small>Uses links from Social.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.footer.showContactEmail}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            footer: { ...current.footer, showContactEmail: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show email</strong>
                        <small>Uses the contact email.</small>
                      </span>
                    </label>
                    <label className='admin-editor-toggle-row'>
                      <input
                        type='checkbox'
                        checked={config.footer.showCta}
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            footer: { ...current.footer, showCta: event.target.checked },
                          }))
                        }
                      />
                      <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                      <span className='admin-editor-toggle-copy'>
                        <strong>Show CTA</strong>
                        <small>Displays the footer button.</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Footer design</p>
                  <span>Customize footer background, text, accent, border, and font.</span>
                </div>
                {renderDesignControls({
                  styleSettings: config.footer.styleSettings,
                  onUpdate: (patch) =>
                    setConfig((current) => ({
                      ...current,
                      footer: {
                        ...current.footer,
                        styleSettings: {
                          ...defaultSectionStyle,
                          ...current.footer.styleSettings,
                          ...patch,
                        },
                      },
                    })),
                  onReset: () =>
                    setConfig((current) => ({
                      ...current,
                      footer: { ...current.footer, styleSettings: { ...defaultSectionStyle } },
                    })),
                })}
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Footer layout</p>
                  <span>Choose whether the footer uses the full viewport width or a contained layout.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <label className='admin-editor-toggle-row'>
                    <input
                      type='checkbox'
                      checked={config.footer.fullWidth}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, fullWidth: event.target.checked },
                        }))
                      }
                    />
                    <span className='admin-editor-toggle-track' aria-hidden='true'><span /></span>
                    <span className='admin-editor-toggle-copy'>
                      <strong>Full-width footer</strong>
                      <small>{config.footer.fullWidth ? 'Footer spans the screen.' : 'Footer content is contained.'}</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Social':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Profile links</p>
                  <span>External platforms shown in site navigation and footer surfaces.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-repeat-list'>
                    {config.socialLinks.map((link, index) => (
                      <div key={link.id} className='admin-editor-repeat-item'>
                        <div className='admin-editor-repeat-marker'>{index + 1}</div>
                        <div className='admin-editor-repeat-fields admin-editor-setting-fields--two'>
                          <Input
                            label='Label'
                            value={link.label}
                            onChange={(event) =>
                              setConfig((current) => {
                                const next = [...current.socialLinks];
                                next[index] = { ...next[index], label: event.target.value };
                                return { ...current, socialLinks: next };
                              })
                            }
                          />
                          <Input
                            label='URL'
                            value={link.url}
                            onChange={(event) =>
                              setConfig((current) => {
                                const next = [...current.socialLinks];
                                next[index] = { ...next[index], url: event.target.value };
                                return { ...current, socialLinks: next };
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          socialLinks: [
                            ...current.socialLinks,
                            { id: createId('social'), label: 'New link', url: 'https://' },
                          ],
                        }))
                      }
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 5v14' />
                          <path d='M5 12h14' />
                        </svg>
                        Add link
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          socialLinks: current.socialLinks.slice(0, -1),
                        }))
                      }
                      disabled={config.socialLinks.length <= 1}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M5 12h14' />
                        </svg>
                        Remove last
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'SEO & Analytics':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Search appearance</p>
                  <span>Title and description used for search results and shared links.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <Input
                    label='SEO title'
                    value={config.seo.title}
                    onChange={(event) =>
                      setConfig((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))
                    }
                  />
                  <Textarea
                    label='SEO description'
                    rows={3}
                    value={config.seo.description}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        seo: { ...current.seo, description: event.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Analytics tracking</p>
                  <span>Provider and tracking IDs injected into the public site.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <label className='admin-editor-select-field'>
                    <span>Analytics provider</span>
                    <select
                      className='admin-editor-select'
                      value={config.analytics.provider}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          analytics: {
                            ...current.analytics,
                            provider: event.target.value as 'none' | 'ga4' | 'plausible' | 'metaPixel',
                          },
                        }))
                      }
                    >
                      <option value='none'>None</option>
                      <option value='ga4'>GA4</option>
                      <option value='plausible'>Plausible</option>
                      <option value='metaPixel'>Meta Pixel</option>
                    </select>
                  </label>
                  <div className='admin-editor-setting-fields admin-editor-setting-fields--three'>
                    <Input
                      label='GA4 Measurement ID'
                      value={config.analytics.ga4MeasurementId}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          analytics: { ...current.analytics, ga4MeasurementId: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label='Plausible domain'
                      value={config.analytics.plausibleDomain}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          analytics: { ...current.analytics, plausibleDomain: event.target.value },
                        }))
                      }
                    />
                    <Input
                      label='Meta Pixel ID'
                      value={config.analytics.metaPixelId}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          analytics: { ...current.analytics, metaPixelId: event.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Theme':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Visual system</p>
                  <span>Theme mode, visual preset, spacing density, and layout structure for the public site.</span>
                </div>
                <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                  <label className='admin-editor-select-field'>
                    <span>Mode</span>
                    <select
                      className='admin-editor-select'
                      value={config.theme.mode}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          theme: {
                            ...current.theme,
                            mode: event.target.value as ThemeMode,
                          },
                        }))
                      }
                    >
                      {(Object.keys(themeModeLabel) as ThemeMode[]).map((mode) => (
                        <option key={mode} value={mode}>
                          {themeModeLabel[mode]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='admin-editor-select-field'>
                    <span>Visual preset</span>
                    <select
                      className='admin-editor-select'
                      value={config.theme.preset}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          theme: { ...current.theme, preset: event.target.value as ThemePreset },
                        }))
                      }
                    >
                      {(Object.keys(themePresetLabel) as ThemePreset[]).map((preset) => (
                        <option key={preset} value={preset}>
                          {themePresetLabel[preset]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='admin-editor-select-field'>
                    <span>Density</span>
                    <select
                      className='admin-editor-select'
                      value={config.theme.density}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          theme: { ...current.theme, density: event.target.value as ThemeDensity },
                        }))
                      }
                    >
                      {(Object.keys(densityLabel) as ThemeDensity[]).map((density) => (
                        <option key={density} value={density}>
                          {densityLabel[density]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='admin-editor-select-field'>
                    <span>Layout preset</span>
                    <select
                      className='admin-editor-select'
                      value={config.theme.layoutPreset}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          theme: {
                            ...current.theme,
                            layoutPreset: event.target.value as ThemeLayoutPreset,
                          },
                        }))
                      }
                    >
                      {(Object.keys(layoutPresetLabel) as ThemeLayoutPreset[]).map((preset) => (
                        <option key={preset} value={preset}>
                          {layoutPresetLabel[preset]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Layout behavior</p>
                  <span>{layoutPresetDescription[config.theme.layoutPreset]}</span>
                </div>
                <div className='admin-editor-layout-preview-list'>
                  {(Object.keys(layoutPresetLabel) as ThemeLayoutPreset[]).map((preset) => (
                    <button
                      key={preset}
                      type='button'
                      className='admin-editor-layout-preview'
                      aria-current={config.theme.layoutPreset === preset ? 'true' : undefined}
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          theme: { ...current.theme, layoutPreset: preset },
                        }))
                      }
                    >
                      <span>{layoutPresetLabel[preset]}</span>
                      <small>{layoutPresetDescription[preset]}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Motion</p>
                  <span>Controls interface animation on the public-facing website.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <label className='admin-editor-toggle-row'>
                    <input
                      type='checkbox'
                      checked={config.theme.enableMotion}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          theme: { ...current.theme, enableMotion: event.target.checked },
                        }))
                      }
                    />
                    <span className='admin-editor-toggle-track' aria-hidden='true'>
                      <span />
                    </span>
                    <span className='admin-editor-toggle-copy'>
                      <strong>Enable motion</strong>
                      <small>{config.theme.enableMotion ? 'Animations are active.' : 'Animations are disabled.'}</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Integrations':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Backend provider</p>
                  <span>Choose where saved website content should live when you move beyond browser storage.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-integration-grid'>
                    {backendIntegrationOptions.map((option) => (
                      <button
                        key={option.id}
                        type='button'
                        className='admin-editor-integration-card'
                        aria-current={config.integrations.backendProvider === option.id ? 'true' : undefined}
                        onClick={() =>
                          setConfig((current) => ({
                            ...current,
                            integrations: {
                              ...current.integrations,
                              backendProvider: option.id,
                            },
                          }))
                        }
                      >
                        <span className='admin-editor-integration-card-top'>
                          <span className='admin-editor-integration-icon' aria-hidden>
                            {option.id === 'local' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M4 7h16' />
                                <path d='M4 12h16' />
                                <path d='M4 17h10' />
                              </svg>
                            ) : option.id === 'supabase' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M13 2 4 14h7l-1 8 10-14h-7l0-6z' />
                              </svg>
                            ) : option.id === 'firebase' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M8 14 12 3l4 11' />
                                <path d='m5 21 7-5 7 5' />
                                <path d='M5 21 8 8l4 8 4-8 3 13' />
                              </svg>
                            ) : (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M4 4h16v16H4z' />
                                <path d='M8 8h8v8H8z' />
                              </svg>
                            )}
                          </span>
                          <span>{option.status}</span>
                        </span>
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                        {option.envKeys.length ? <em>{option.envKeys.join(' + ')}</em> : <em>No env required</em>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>CMS provider</p>
                  <span>Optionally connect a content platform while keeping this dashboard as the control center.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-integration-grid'>
                    {cmsIntegrationOptions.map((option) => (
                      <button
                        key={option.id}
                        type='button'
                        className='admin-editor-integration-card'
                        aria-current={config.integrations.cmsProvider === option.id ? 'true' : undefined}
                        onClick={() =>
                          setConfig((current) => ({
                            ...current,
                            integrations: {
                              ...current.integrations,
                              cmsProvider: option.id,
                            },
                          }))
                        }
                      >
                        <span className='admin-editor-integration-card-top'>
                          <span className='admin-editor-integration-icon' aria-hidden>
                            {option.id === 'none' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M12 3v18' />
                                <path d='M5 8h14' />
                                <path d='M7 16h10' />
                              </svg>
                            ) : option.id === 'sanity' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M4 8c2-4 14-4 16 0' />
                                <path d='M4 16c2 4 14 4 16 0' />
                                <path d='M7 12h10' />
                              </svg>
                            ) : option.id === 'contentful' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <circle cx='8' cy='8' r='4' />
                                <circle cx='16' cy='16' r='4' />
                                <path d='M11 11 13 13' />
                              </svg>
                            ) : (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M4 4h16v16H4z' />
                                <path d='M8 9h8' />
                                <path d='M8 13h8' />
                                <path d='M8 17h5' />
                              </svg>
                            )}
                          </span>
                          <span>{option.status}</span>
                        </span>
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                        {option.envKeys.length ? <em>{option.envKeys.join(' + ')}</em> : <em>No env required</em>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Connection details</p>
                  <span>Only the fields needed for the selected backend provider are shown.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  {config.integrations.backendProvider === 'local' ? (
                    <div className='admin-editor-adapter-empty'>
                      <strong>Local browser storage is active.</strong>
                      <span>No backend credentials are needed. Use backup export/import to move content between devices.</span>
                    </div>
                  ) : null}

                  {config.integrations.backendProvider === 'supabase' ? (
                    <>
                      <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                        <Input
                          label='Supabase project URL'
                          value={config.integrations.projectUrl}
                          placeholder='https://your-project.supabase.co'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, projectUrl: event.target.value },
                            }))
                          }
                        />
                        <Input
                          label='Supabase anon key'
                          value={config.integrations.publicApiKey}
                          placeholder='Public anon key'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, publicApiKey: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                        <Input
                          label='Table name'
                          value={config.integrations.collectionName}
                          placeholder='site_config'
                          helperText='Table with id, config JSONB, and updated_at'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, collectionName: event.target.value },
                            }))
                          }
                        />
                        <Input
                          label='Row ID'
                          value={config.integrations.configId}
                          placeholder='site'
                          helperText='The row used for this website config'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, configId: event.target.value },
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  {config.integrations.backendProvider === 'firebase' ? (
                    <>
                      <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                        <Input
                          label='Firebase project ID'
                          value={config.integrations.cmsProjectId}
                          placeholder='your-firebase-project-id'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, cmsProjectId: event.target.value },
                            }))
                          }
                        />
                        <Input
                          label='Firebase API key'
                          value={config.integrations.publicApiKey}
                          placeholder='Public Firebase API key'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, publicApiKey: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                        <Input
                          label='Firestore collection'
                          value={config.integrations.collectionName}
                          placeholder='site_config'
                          helperText='Collection where configJson is stored'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, collectionName: event.target.value },
                            }))
                          }
                        />
                        <Input
                          label='Document ID'
                          value={config.integrations.configId}
                          placeholder='site'
                          helperText='Document used for this website config'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, configId: event.target.value },
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  {config.integrations.backendProvider === 'strapi' ? (
                    <>
                      <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                        <Input
                          label='Strapi URL'
                          value={config.integrations.projectUrl}
                          placeholder='https://cms.yourdomain.com'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, projectUrl: event.target.value },
                            }))
                          }
                        />
                        <Input
                          label='Strapi token'
                          value={config.integrations.publicApiKey}
                          placeholder='Public or editor API token'
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              integrations: { ...current.integrations, publicApiKey: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <Input
                        label='Config endpoint'
                        value={config.integrations.apiEndpoint}
                        placeholder='/api/reakt-webkit-config'
                        helperText='Single type endpoint with a JSON config field'
                        onChange={(event) =>
                          setConfig((current) => ({
                            ...current,
                            integrations: { ...current.integrations, apiEndpoint: event.target.value },
                          }))
                        }
                      />
                    </>
                  ) : null}
                  <label className='admin-editor-toggle-row'>
                    <input
                      type='checkbox'
                      checked={config.integrations.enableOneClickSetup}
                      onChange={(event) =>
                        setConfig((current) => ({
                          ...current,
                          integrations: {
                            ...current.integrations,
                            enableOneClickSetup: event.target.checked,
                          },
                        }))
                      }
                    />
                    <span className='admin-editor-toggle-track' aria-hidden='true'>
                      <span />
                    </span>
                    <span className='admin-editor-toggle-copy'>
                      <strong>Show one-click setup guidance</strong>
                      <small>
                        {config.integrations.enableOneClickSetup
                          ? 'Beginner setup cards are enabled.'
                          : 'Setup guidance is hidden from launch flows.'}
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Deployment automation</p>
                  <span>Optional build hook for Vercel or Netlify after content changes.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <Input
                    label='Deploy webhook URL'
                    value={config.integrations.webhookUrl}
                    placeholder='Optional Vercel or Netlify build hook'
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        integrations: { ...current.integrations, webhookUrl: event.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Generated environment</p>
                  <span>Copy this into `.env.local` or the environment variables area of your host.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <pre className='admin-editor-code-block'>{integrationEnvSnippet}</pre>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={async () => {
                        await navigator.clipboard.writeText(integrationEnvSnippet);
                        touchStatus('Integration env copied.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <rect x='9' y='9' width='13' height='13' rx='2' />
                          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                        </svg>
                        Copy env
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        const blob = new Blob([integrationEnvSnippet], { type: 'text/plain' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = '.env.local';
                        link.click();
                        URL.revokeObjectURL(link.href);
                        touchStatus('Integration .env downloaded.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 3v12' />
                          <path d='m7 10 5 5 5-5' />
                          <path d='M5 21h14' />
                        </svg>
                        Download .env
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Backend management</p>
                  <span>Test the selected adapter, push this workspace, or pull the latest remote config.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={testIntegrationConnection}
                      disabled={isWorkspaceBusy || isConfigLoading || isConfigSaving}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M20 6 9 17l-5-5' />
                        </svg>
                        Test connection
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={pushIntegrationConfig}
                      disabled={isWorkspaceBusy || isConfigLoading || isConfigSaving || config.integrations.backendProvider === 'local'}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 19V5' />
                          <path d='m5 12 7-7 7 7' />
                          <path d='M5 21h14' />
                        </svg>
                        Push to backend
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={pullIntegrationConfig}
                      disabled={isWorkspaceBusy || isConfigLoading || isConfigSaving || config.integrations.backendProvider === 'local'}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 5v14' />
                          <path d='m19 12-7 7-7-7' />
                          <path d='M5 3h14' />
                        </svg>
                        Pull from backend
                      </span>
                    </Button>
                  </div>
                  {integrationStatusMessage || storageError ? (
                    <p className={storageError ? 'admin-editor-inline-error' : 'admin-editor-inline-success'}>
                      {storageError || integrationStatusMessage}
                    </p>
                  ) : null}
                  <p className='admin-editor-muted-note'>
                    Supabase expects a table with `id`, `config` JSONB, and `updated_at`. Firebase stores a
                    `configJson` field in Firestore. Strapi expects a single type with a JSON `config` field.
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Setup Help':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Setup path</p>
                  <span>Select the easiest way for the user to run or deploy Reakt WebKit.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-integration-grid admin-editor-integration-grid--setup'>
                    {setupExperienceOptions.map((option) => (
                      <button
                        key={option.id}
                        type='button'
                        className='admin-editor-integration-card'
                        aria-current={config.integrations.setupExperience === option.id ? 'true' : undefined}
                        onClick={() =>
                          setConfig((current) => ({
                            ...current,
                            integrations: {
                              ...current.integrations,
                              setupExperience: option.id,
                            },
                          }))
                        }
                      >
                        <span className='admin-editor-integration-card-top'>
                          <span className='admin-editor-integration-icon' aria-hidden>
                            {option.id === 'codespaces' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M4 17 10 5l4 8 2-4 4 8' />
                                <path d='M3 20h18' />
                              </svg>
                            ) : option.id === 'docker' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M3 13h18' />
                                <path d='M5 13v5h12a4 4 0 0 0 4-4v-1' />
                                <path d='M7 8h4v5H7z' />
                                <path d='M11 8h4v5h-4z' />
                              </svg>
                            ) : option.id === 'hosted' ? (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M12 2v20' />
                                <path d='m5 9 7-7 7 7' />
                                <path d='M5 22h14' />
                              </svg>
                            ) : (
                              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                <rect x='3' y='4' width='18' height='14' rx='2' />
                                <path d='M8 22h8' />
                                <path d='M12 18v4' />
                              </svg>
                            )}
                          </span>
                          <span>{option.status}</span>
                        </span>
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Beginner launch checklist</p>
                  <span>Use this as the plain-English install path for users who do not have React tooling.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-launch-checklist'>
                    <div>
                      <span>1</span>
                      <p>Open the GitHub repository and choose Codespaces for a browser-based editor.</p>
                    </div>
                    <div>
                      <span>2</span>
                      <p>Run `npm run dev` in the built-in terminal, then open the forwarded port.</p>
                    </div>
                    <div>
                      <span>3</span>
                      <p>Sign into `/admin/login`, edit the website, and export a backup before deploying.</p>
                    </div>
                    <div>
                      <span>4</span>
                      <p>Deploy through Vercel or Netlify by importing the GitHub repository.</p>
                    </div>
                  </div>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          'Open GitHub > Code > Codespaces > Create codespace. Then run npm run dev, open the forwarded port, and edit from /admin/login.',
                        );
                        touchStatus('Beginner setup copied.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <rect x='9' y='9' width='13' height='13' rx='2' />
                          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                        </svg>
                        Copy instructions
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        const content = [
                          'Reakt WebKit beginner setup',
                          '',
                          '1. Open the repository on GitHub.',
                          '2. Click Code, then Codespaces, then Create codespace.',
                          '3. In the terminal, run npm run dev.',
                          '4. Open the forwarded website URL and visit /admin/login.',
                          '5. Deploy through Vercel or Netlify when ready.',
                        ].join('\n');
                        const blob = new Blob([`${content}\n`], { type: 'text/plain' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'reakt-webkit-beginner-setup.txt';
                        link.click();
                        URL.revokeObjectURL(link.href);
                        touchStatus('Setup guide downloaded.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <path d='M14 2v6h6' />
                        </svg>
                        Download guide
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'Publish workflow':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Page preview</p>
                  <span>Open the selected page in a focused full-width preview before sharing.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={() => setPreviewPage(selectedPage ?? null)}
                      disabled={isWorkspaceBusy}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M2.07 12c1.22-4.44 5.29-7.5 9.93-7.5s8.71 3.06 9.93 7.5c-1.22 4.44-5.29 7.5-9.93 7.5s-8.71-3.06-9.93-7.5z' />
                          <circle cx='12' cy='12' r='3' />
                        </svg>
                        Open preview
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Backup export</p>
                  <span>Copy or download the current workspace configuration for transfer or rollback.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-setting-actions'>
                    <Button variant='outline' onClick={handleCopyJson} disabled={isWorkspaceBusy}>
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <rect x='9' y='9' width='13' height='13' rx='2' />
                          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                        </svg>
                        Copy JSON
                      </span>
                    </Button>
                    <Button variant='outline' onClick={handleExport} disabled={isWorkspaceBusy}>
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 3v12' />
                          <path d='m7 10 5 5 5-5' />
                          <path d='M5 21h14' />
                        </svg>
                        Download backup
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Backup restore</p>
                  <span>Upload a saved backup file to replace the current workspace setup.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        importInputRef.current?.click();
                      }}
                      disabled={isWorkspaceBusy}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                          <path d='M17 8 12 3 7 8' />
                          <path d='M12 3v12' />
                        </svg>
                        Upload backup
                      </span>
                    </Button>
                  </div>
                  {importError ? <p className='admin-editor-inline-error'>{importError}</p> : null}
                </div>
              </div>
            </div>
          </section>
        );

      case 'Security':
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Production admin password</p>
                  <span>Generate server-only environment variables for Vercel, Netlify, or your Node host.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <div className='admin-editor-setting-fields admin-editor-setting-fields--two'>
                    <Input
                      label='ADMIN_PASSWORD'
                      value={newPassword}
                      placeholder='Choose a strong password'
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                    <Input
                      label='ADMIN_SESSION_SECRET'
                      value={adminSessionSecret}
                      placeholder='Generated signing secret'
                      onChange={(event) => setAdminSessionSecret(event.target.value)}
                    />
                  </div>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={generateAdminSecret}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 3v18' />
                          <path d='M5 8h14' />
                          <path d='M7 16h10' />
                        </svg>
                        Generate secret
                      </span>
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setNewPassword('');
                        setAdminSessionSecret('');
                        touchStatus('Security fields cleared.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M3 6h18' />
                          <path d='M8 6V4h8v2' />
                          <path d='M19 6l-1 14H6L5 6' />
                        </svg>
                        Clear password
                      </span>
                    </Button>
                  </div>
                  <p className='admin-editor-muted-note'>
                    These values belong in your host environment variables. They are not prefixed with `VITE_`, so they
                    are not bundled into the public website.
                  </p>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Environment snippet</p>
                  <span>Copy these into your host environment variables. Local Vite dev keeps using `demo`.</span>
                </div>
                <div className='admin-editor-setting-fields'>
                  <pre className='admin-editor-code-block'>
                    {`ADMIN_PASSWORD=${newPassword.trim() || 'change-this-password'}\nADMIN_SESSION_SECRET=${
                      adminSessionSecret.trim() || 'change-this-long-random-secret'
                    }`}
                  </pre>
                  <div className='admin-editor-setting-actions'>
                    <Button
                      variant='outline'
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `ADMIN_PASSWORD=${newPassword.trim() || 'change-this-password'}\nADMIN_SESSION_SECRET=${
                            adminSessionSecret.trim() || 'change-this-long-random-secret'
                          }`,
                        );
                        touchStatus('Snippet copied.');
                      }}
                    >
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <rect x='9' y='9' width='13' height='13' rx='2' />
                          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                        </svg>
                        Copy snippet
                      </span>
                    </Button>
                    <Button variant='outline' onClick={downloadEnvFile}>
                      <span className='admin-editor-button-content'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                          <path d='M12 3v12' />
                          <path d='m7 10 5 5 5-5' />
                          <path d='M5 21h14' />
                        </svg>
                        Download file
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
      case 'Overview': {
        const enabledSections = selectedPage.sections.filter((section) => section.enabled).length;
        return (
          <section className='admin-editor-settings-surface'>
            <div className='admin-editor-settings-list'>
              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Workspace health</p>
                  <span>Snapshot of the page currently selected in the admin workspace.</span>
                </div>
                <div className='admin-editor-metric-grid'>
                  <div className='admin-editor-metric'>
                    <span>Current page</span>
                    <strong>{selectedPage.label}</strong>
                  </div>
                  <div className='admin-editor-metric'>
                    <span>Visible sections</span>
                    <strong>{enabledSections} / {selectedPage.sections.length}</strong>
                  </div>
                  <div className='admin-editor-metric'>
                    <span>Total pages</span>
                    <strong>{config.pages.length}</strong>
                  </div>
                  <div className='admin-editor-metric'>
                    <span>Unsaved changes</span>
                    <strong>{hasUnsavedChanges ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              </div>

              <div className='admin-editor-setting-row'>
                <div className='admin-editor-setting-copy'>
                  <p>Next actions</p>
                  <span>Jump into page structure or open a focused preview of the selected page.</span>
                </div>
                <div className='admin-editor-setting-actions'>
                  <Button onClick={() => setActiveTab('Structure')} variant='outline'>
                    <span className='admin-editor-button-content'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M3 4h18' />
                        <path d='M5 8h14' />
                        <path d='M7 12h10' />
                        <path d='M9 16h6' />
                      </svg>
                      Page structure
                    </span>
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setPreviewPage(selectedPage ?? null)}
                    disabled={!selectedPage}
                  >
                    <span className='admin-editor-button-content'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                        <path d='M2.07 12c1.22-4.44 5.29-7.5 9.93-7.5s8.71 3.06 9.93 7.5c-1.22 4.44-5.29 7.5-9.93 7.5s-8.71-3.06-9.93-7.5z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                      Preview page
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      }
    }
  }, [
    activeTab,
    config,
    importError,
    integrationEnvSnippet,
    integrationStatusMessage,
    isConfigLoading,
    isConfigSaving,
    isWorkspaceBusy,
    adminSessionSecret,
    newPassword,
    selectedPage,
    storageError,
    handleCopyJson,
    handleExport,
    hasUnsavedChanges,
  ]);

  if (authStatus === 'checking') {
    return (
      <main className='admin-auth-shell'>
        <section className='admin-auth-card sitekit-glow rounded-3xl border border-white/20 bg-slate-950/90 p-6 md:p-8'>
          <p className='admin-auth-kicker'>Editor session</p>
          <h1 className='mt-3 text-3xl font-semibold leading-tight'>Checking access</h1>
          <p className='mt-3 text-sm text-slate-300'>Verifying your signed admin session.</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/admin/login' replace />;
  }

  const focusedSection = selectedPage?.sections.find((section) => section.id === selectedSectionId) ?? null;
  const isPageContentActive = activeTab === 'Page Content' || activeTab === 'Structure';
  const pageContentNavigationItemCount = config.pages.length;
  const pagesNavigationItemCount = config.pages.length;

  const getGroupItemCount = (group: WorkspaceGroup) => {
    if (group.id === 'pageContent') {
      return pageContentNavigationItemCount;
    }
    if (group.id === 'pages') {
      return pagesNavigationItemCount;
    }
    return group.tabs.length;
  };

  return (
    <div className='admin-editor-shell min-h-screen'>
      <div className='admin-editor-wrap mx-auto flex min-h-screen max-w-[1720px] flex-col gap-5 px-4 py-5 lg:px-6'>
        <div className='admin-editor-main-grid lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]'>
          <aside className='admin-editor-sidebar space-y-4'>

            <div className='admin-editor-panel rounded-2xl p-3'>
              <div className='flex items-center'>
                <p className='text-sm font-semibold text-white'>Editor navigation</p>
                <div className='ml-auto flex items-center gap-0.5'>
                  <button
                    type='button'
                    aria-label='Back to overview'
                    aria-current={activeTab === 'Overview' ? 'page' : undefined}
                    onClick={() => {
                      setActiveTab('Overview');
                    }}
                    className='inline-flex h-8 w-8 items-center justify-center rounded border-0 bg-transparent p-0 text-xl text-[#2b343f] transition-none hover:bg-transparent hover:text-[#2b343f] focus-visible:outline-none focus-visible:ring-0'
                  >
                    <svg
                      aria-hidden='true'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M3 11.5L12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V11.5z' />
                    </svg>
                    <span className='sr-only'>Overview</span>
                  </button>
                  <button
                    type='button'
                    aria-label='Open website preview'
                    title='Open website preview'
                    className='inline-flex h-8 w-8 items-center justify-center rounded border-0 bg-transparent p-0 text-xl text-[#2b343f] transition-none hover:bg-transparent hover:text-[#2b343f] focus-visible:outline-none focus-visible:ring-0'
                    onClick={() => setPreviewPage(selectedPage ?? null)}
                  >
                    <svg
                      aria-hidden='true'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M2.07 12c1.22-4.44 5.29-7.5 9.93-7.5s8.71 3.06 9.93 7.5c-1.22 4.44-5.29 7.5-9.93 7.5s-8.71-3.06-9.93-7.5z' />
                      <circle cx='12' cy='12' r='3' />
                    </svg>
                    <span className='sr-only'>Website preview</span>
                  </button>
                </div>
              </div>
              <div className='admin-editor-nav mt-2 space-y-2'>
                {dashboardGroups.map((group) => (
                  <div key={group.id} className='admin-editor-nav-group'>
                    <button
                      type='button'
                      onClick={() => {
                        toggleWorkspaceGroup(group.id);
                        if (group.tabs.length === 1) {
                          const nextTab = group.tabs[0] as DashboardTab;
                          setSelectedSectionId('');
                          setIsSectionEditFocus(false);
                          setActiveTab(nextTab);
                          if (nextTab === 'Page Content') {
                            setIsHomeSectionsOpen(true);
                          } else if (nextTab === 'Structure') {
                            setIsHomeSectionsOpen(false);
                          }
                        }
                      }}
                      aria-expanded={openWorkspaceGroups[group.id]}
                      aria-controls={`workspace-group-${group.id}`}
                      className='admin-editor-nav-group-toggle'
                    >
                      <span>
                        <span className='admin-editor-nav-group-title'>{group.title}</span>
                        <span className='admin-editor-nav-group-subtitle'>
                          {getGroupItemCount(group)} item{getGroupItemCount(group) === 1 ? '' : 's'}
                        </span>
                      </span>
                    <span aria-hidden>{openWorkspaceGroups[group.id] ? '−' : '+'}</span>
                    </button>
                    {openWorkspaceGroups[group.id] ? (
                      <div id={`workspace-group-${group.id}`} className='admin-editor-nav-group-content'>
                        {group.id === 'pageContent' || group.id === 'pages'
                          ? null
                          : group.tabs.map((tab) => (
                              <button
                                key={tab}
                                type='button'
                                onClick={() => {
                                  setSelectedSectionId('');
                                  setIsSectionEditFocus(false);
                                  setActiveTab(tab);
                                  if (tab === 'Page Content') {
                                    setIsHomeSectionsOpen(true);
                                  } else if (tab === 'Structure') {
                                    setIsHomeSectionsOpen(false);
                                  }
                                }}
                                className='admin-editor-nav-item'
                                aria-current={activeTab === tab ? 'page' : undefined}
                              >
                                <p className='text-[0.73rem] font-medium'>{tab}</p>
                                <p className='mt-0.5 text-[10px] text-slate-300 leading-snug'>{tabHints[tab]}</p>
                              </button>
                            ))}

                    {activeTab === 'Page Content' && group.id === 'pageContent' ? (
                      <div className='admin-editor-group-subpanel admin-editor-group-subpanel--content'>
                        {isHomeSectionsOpen ? (
                          <>
	                            {config.pages.length ? (
	                              config.pages.map((page) => (
	                                <div key={page.id} className='admin-editor-nav-item admin-editor-content-section-row'>
	                                  <button
	                                    type='button'
	                                    onClick={() => {
	                                      setSelectedPageId(page.id);
	                                      setSelectedSectionId('');
	                                      setIsSectionEditFocus(false);
	                                      setIsHomeSectionsOpen(false);
	                                    }}
	                                    className='admin-editor-content-section-link'
	                                  >
                                    <p className='text-[0.73rem] font-medium'>{page.label}</p>
                                    <p className='mt-0.5 text-[10px] text-slate-300 leading-snug'>/{page.slug}</p>
                                  </button>
                                  <button
                                    type='button'
                                    aria-label={`Delete ${page.label || 'page'}`}
                                    title='Delete page'
                                    onClick={() => removePage(page.id)}
                                    className='admin-editor-section-delete-btn'
                                    disabled={config.pages.length <= 1}
                                  >
                                    <svg
                                      viewBox='0 0 24 24'
                                      fill='none'
                                      stroke='currentColor'
                                      strokeWidth='2'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      aria-hidden='true'
                                    >
                                      <path d='M3 6h18' />
                                      <path d='M8 6v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1' />
                                      <path d='M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6' />
                                      <line x1='10' y1='11' x2='10' y2='17' />
                                      <line x1='14' y1='11' x2='14' y2='17' />
                                    </svg>
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className='px-2 py-1 text-[10px] leading-snug text-slate-300'>No pages yet.</p>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              type='button'
                              onClick={() => {
                                setIsHomeSectionsOpen(true);
                                setIsSectionEditFocus(false);
                                setSelectedSectionId('');
                              }}
                              className='admin-editor-nav-item'
                            >
                                <span className='flex w-full items-start justify-between gap-2'>
                                  <span className='min-w-0'>
                                    <p className='text-[0.73rem] font-medium'>Back to pages</p>
                                    <p className='mt-0.5 text-[10px] leading-snug text-slate-300'>
                                      {selectedPage?.label ?? 'Select page'}
                                    </p>
                                  </span>
                                  <span
                                    aria-hidden
                                    className='mt-0.5 shrink-0 text-[0.73rem] font-medium leading-none text-slate-300'
                                  >
                                    ←
                                  </span>
                                </span>
                              </button>

	                            {selectedPage?.sections.length ? (
                                selectedPageLayoutGroups.map((layoutGroup) => (
                                  <div key={`nav-${layoutGroup.id}`} className='admin-editor-content-layout-group'>
                                    <div className='admin-editor-content-layout-heading'>
                                      <span>{layoutGroup.title}</span>
                                      <small>{layoutGroup.sections.length}</small>
                                    </div>
                                    {layoutGroup.sections.map((section) => (
                                      <div
                                        key={section.id}
                                        className='admin-editor-nav-item admin-editor-content-section-row'
                                        aria-current={
                                          isSectionEditFocus && section.id === selectedSectionId ? 'page' : undefined
                                        }
                                      >
                                        <button
                                          type='button'
                                          onClick={() => {
                                            openContentSection(section.id);
                                          }}
                                          className='admin-editor-content-section-link'
                                        >
                                          <p className='text-[0.73rem] font-medium'>{section.label || 'Untitled section'}</p>
                                          <p className='mt-0.5 text-[10px] text-slate-300 leading-snug'>/{section.anchor}</p>
                                        </button>
                                        <button
                                          type='button'
                                          aria-label={`Delete ${section.label || 'content section'}`}
                                          title='Delete section'
                                          onClick={() => {
                                            deleteSection(section.id);
                                          }}
                                          className='admin-editor-section-delete-btn'
                                        >
                                          <svg
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            aria-hidden='true'
                                          >
                                            <path d='M3 6h18' />
                                            <path d='M8 6v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1' />
                                            <path d='M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6' />
                                            <line x1='10' y1='11' x2='10' y2='17' />
                                            <line x1='14' y1='11' x2='14' y2='17' />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ))
                            ) : (
                              <p className='px-2 py-1 text-[10px] leading-snug text-slate-300'>No sections on this page yet.</p>
                            )}
                          </>
                        )}

                        {isSectionEditFocus || isHomeSectionsOpen ? null : (
                          <div className='admin-editor-content-add-row'>
                            <button
                              type='button'
                              aria-label='Add content section'
                              title='Add content section'
                              onClick={() => addSectionFromQuickNav()}
                              className='admin-editor-content-add-btn'
                            >
                              <span className='inline-flex items-center gap-1'>
                                <svg
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='h-3.5 w-3.5'
                                  aria-hidden='true'
                                >
                                  <path d='M12 5v14' />
                                  <path d='M5 12h14' />
                                </svg>
                              </span>
                            </button>
                            <button
                              type='button'
                              aria-label='Open section editor'
                              title='Open section editor'
                              onClick={() => {
                                setIsSectionEditFocus(false);
                                setSelectedSectionId('');
                                setActiveTab('Page Content');
                              }}
                              className='admin-editor-content-add-btn'
                            >
                              <span className='inline-flex items-center gap-1'>
                                <svg
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='h-3.5 w-3.5'
                                  aria-hidden='true'
                                >
                                  <path d='M1 12h22' />
                                  <path d='M12 5l7 7-7 7' />
                                  <path d='M5 12h2' />
                                </svg>
                                <span className='admin-editor-content-add-label'>View</span>
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {activeTab === 'Structure' && group.id === 'pages' ? (
                      <div className='admin-editor-group-subpanel admin-editor-group-subpanel--content'>
                        {config.pages.length ? (
                          config.pages.map((page) => (
                            <div
                              key={page.id}
                              className='admin-editor-nav-item admin-editor-content-section-row'
                              aria-current={page.id === selectedPagesNavPageId ? 'page' : undefined}
                            >
                              <button
                                type='button'
                                onClick={() => selectPageFromPagesNav(page.id)}
                                className='admin-editor-content-section-link'
                              >
                                <p className='text-[0.73rem] font-medium'>{page.label}</p>
                                <p className='mt-0.5 text-[10px] leading-snug text-slate-300'>/{page.slug}</p>
                              </button>
                              <button
                                type='button'
                                aria-label={`Delete ${page.label || 'page'}`}
                                title='Delete page'
                                onClick={() => removePage(page.id)}
                                className='admin-editor-section-delete-btn'
                                disabled={config.pages.length <= 1}
                              >
                                <svg
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  aria-hidden='true'
                                >
                                  <path d='M3 6h18' />
                                  <path d='M8 6v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1' />
                                  <path d='M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6' />
                                  <line x1='10' y1='11' x2='10' y2='17' />
                                  <line x1='14' y1='11' x2='14' y2='17' />
                                </svg>
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className='px-2 py-1 text-[10px] leading-snug text-slate-300'>No pages yet.</p>
                        )}

                        {isSectionEditFocus ? null : (
                          <div className='admin-editor-content-add-row'>
                            <button
                              type='button'
                              aria-label='Add page'
                              title='Add page'
                              onClick={() => addPage()}
                              className='admin-editor-content-add-btn'
                            >
                              <span className='inline-flex items-center gap-1'>
                                <svg
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='h-3.5 w-3.5'
                                  aria-hidden='true'
                                >
                                  <path d='M12 5v14' />
                                  <path d='M5 12h14' />
                                </svg>
                              </span>
                            </button>
                            <button
                              type='button'
                              aria-label='Open page editor'
                              title='Open page editor'
                              onClick={() => {
                                setActiveTab('Page Content');
                                setIsHomeSectionsOpen(true);
                              }}
                              className='admin-editor-content-add-btn'
                            >
                              <span className='inline-flex items-center gap-1'>
                                <svg
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='h-3.5 w-3.5'
                                  aria-hidden='true'
                                >
                                  <path d='M1 12h22' />
                                  <path d='M12 5l7 7-7 7' />
                                  <path d='M12 8v8' />
                                </svg>
                                <span className='admin-editor-content-add-label'>View</span>
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                    </div>
                  ) : null}
                </div>
                ))}
              </div>
            </div>

	            <div className='admin-editor-panel admin-editor-actions-panel rounded-3xl p-4'>
	              <div className='admin-editor-actions-header'>
	                <p className='text-sm font-semibold text-white'>Workspace actions</p>
	                <span
	                  className={`admin-editor-actions-status ${
	                    hasUnsavedChanges ? 'admin-editor-actions-status--dirty' : 'admin-editor-actions-status--saved'
	                  }`}
	                >
	                  {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
	                </span>
	              </div>

	              <button
	                type='button'
	                onClick={async () => {
                    try {
	                    await saveConfigChanges();
	                    touchStatus('Workspace saved.');
                    } catch {
                      touchStatus('Save failed.');
                    }
	                }}
	                disabled={!hasUnsavedChanges || isConfigSaving}
	                className='admin-editor-action-primary'
	              >
	                <span className='admin-editor-action-icon admin-editor-action-icon--primary' aria-hidden>
	                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
	                    <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
	                    <path d='M17 21v-8H7v8' />
	                    <path d='M7 3v5h8' />
	                  </svg>
	                </span>
	                <span className='admin-editor-action-copy'>
	                  <span className='admin-editor-action-label'>Save changes</span>
	                  <span className='admin-editor-action-note'>
	                    {isConfigSaving ? 'Saving workspace' : hasUnsavedChanges ? 'Store your current edits' : 'No changes to save'}
	                  </span>
	                </span>
	              </button>

	              <Link to='/' className='admin-editor-action-row admin-editor-action-row--featured'>
	                <span className='admin-editor-action-icon' aria-hidden>
	                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
	                    <path d='M14 3h7v7' />
	                    <path d='M10 14 21 3' />
	                    <path d='M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5' />
	                  </svg>
	                </span>
	                <span className='admin-editor-action-copy'>
	                  <span className='admin-editor-action-label'>Public site</span>
	                  <span className='admin-editor-action-note'>Preview the live page</span>
	                </span>
	              </Link>

	              <div className='admin-editor-actions-divider' />

	              <div className='admin-editor-actions-grid admin-editor-actions-grid--compact'>
	                <button
	                  type='button'
	                  onClick={() => {
	                    void resetToDefaults().then(() => {
	                      setSelectedPagesNavPageId('');
	                      touchStatus('Demo content reset.');
	                    }).catch(() => {
                        touchStatus('Reset failed.');
                      });
	                  }}
	                  className='admin-editor-action-tile'
	                >
	                  <span className='admin-editor-action-icon' aria-hidden>
	                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
	                      <path d='M3 12a9 9 0 0 1 15.2-6.5L21 8' />
	                      <path d='M21 3v5h-5' />
	                      <path d='M21 12a9 9 0 0 1-15.2 6.5L3 16' />
	                      <path d='M3 21v-5h5' />
	                    </svg>
	                  </span>
	                  <span>Reset demo</span>
	                </button>
	                <button type='button' onClick={logout} className='admin-editor-action-tile admin-editor-action-tile--danger'>
	                  <span className='admin-editor-action-icon' aria-hidden>
	                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
	                      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
	                      <path d='M16 17l5-5-5-5' />
	                      <path d='M21 12H9' />
	                    </svg>
	                  </span>
	                  <span>Sign out</span>
	                </button>
	              </div>
	            </div>
          </aside>

	          <main className='space-y-4'>
	            <section className='admin-editor-panel admin-editor-panel--content rounded-3xl p-4 md:p-5'>
	              <header className='admin-editor-editor-header'>
	                <div className='admin-editor-editor-heading'>
	                  <p className='admin-editor-eyebrow'>Workspace focus</p>
	                  <h2>Editing {activeTab}</h2>
	                  <p>
	                    {isPageContentActive && isSectionEditFocus && focusedSection
	                      ? `Update ${focusedSection.label || 'this section'} parameters directly.`
	                      : isPageContentActive
	                      ? `Editing ${selectedPage?.label || 'selected page'} page structure and content.`
	                      : tabHints[activeTab]}
	                  </p>
	                </div>
	                <div className='admin-editor-status-pill'>{hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}</div>
	              </header>
	              {isPageContentActive
	                ? isSectionEditFocus
                  ? sectionParametersEditor
                  : sectionEditor
                : editor}
            </section>
          </main>
        </div>
      </div>

      {isRestoringBackup ? (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm'>
          <div className='sitekit-card min-w-[280px] max-w-sm rounded-2xl border border-white/15 bg-white p-5 text-slate-900 shadow-xl'>
            <p className='text-sm font-semibold'>Restoring workspace</p>
            <p className='mt-1 text-sm text-slate-600'>{restoreProgressText || 'Applying backup...'}</p>
            <div className='mt-4 h-1.5 rounded-full bg-slate-200 overflow-hidden'>
              <div className='h-full w-2/3 animate-pulse rounded-full bg-accent-500' />
            </div>
          </div>
        </div>
      ) : null}

      {previewPage ? (
        <div className='admin-editor-preview fixed inset-0 z-50'>
          <div className='flex h-full w-full flex-col'>
            <div className='flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3'>
              <div>
                <p className='text-sm'>Previewing page: {previewPage.label}</p>
                <p className='text-xs text-slate-300'>URL: /page/{previewPage.slug}</p>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setPreviewPage(null)} className='text-sm'>
                  Close preview
                </Button>
              </div>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto p-2'>
              <SitePageContent config={config} pageSlug={previewPage.slug} compact trackEvent={() => {}} />
            </div>
          </div>
        </div>
      ) : null}

      <input
        ref={importInputRef}
        type='file'
        accept='application/json'
        className='hidden'
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          restoreFromFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
