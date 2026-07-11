import SEO from '../lib/seo';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useParams } from 'react-router-dom';
import SitePageContent from '../components/site/SitePageContent';

export default function HomePage() {
  const { pageSlug } = useParams<'pageSlug'>();
  const { config } = useSiteConfig();
  const { trackEvent } = useAnalytics(config.analytics);

  return (
    <>
      <SEO title={config.seo.title} description={config.seo.description} />
      <SitePageContent
        config={config}
        pageSlug={pageSlug}
        trackEvent={(eventName, value) => trackEvent(eventName, { value })}
      />
    </>
  );
}
