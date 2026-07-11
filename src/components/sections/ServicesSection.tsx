import SectionHeading from './SectionHeading';
import Card from '../ui/Card';
import type { ServiceItem } from '../../types/site';

export default function ServicesSection({
  services,
  sectionId = 'services',
  headingTitle,
  headingDescription,
  showKicker = true,
}: {
  services: ServiceItem[];
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}) {
  const resolvedTitle = headingTitle || 'Services';
  const resolvedDescription =
    headingDescription ||
    'Practical offers your clients can trust. Keep this short and conversion-focused.';

  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-7xl px-4 lg:px-8'>
        <SectionHeading eyebrow={showKicker ? resolvedTitle : undefined} title={resolvedTitle} description={resolvedDescription} />

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service) => (
            <Card key={service.id} className='sitekit-card section-shell' title={service.title}>
              <p className='mb-2 inline-flex rounded-full border border-accent-500/40 bg-accent-600/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-200'>
                Offer
              </p>
              <p className='mt-2 text-sm site-text-muted'>{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
