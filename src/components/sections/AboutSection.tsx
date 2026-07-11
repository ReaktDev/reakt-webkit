import SectionHeading from './SectionHeading';
import type { AboutSectionConfig } from '../../types/site';

export default function AboutSection({
  config,
  sectionId = 'about',
  headingTitle,
  headingDescription,
  showKicker = true,
}: {
  config: AboutSectionConfig;
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}) {
  const resolvedHeadingTitle = headingTitle || 'About';
  const resolvedHeadingDescription = headingDescription || 'Built for service businesses that want trust and clarity.';

  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-7xl px-4 lg:px-8'>
        <div className='grid items-start gap-8 lg:grid-cols-2'>
          <div>
            <SectionHeading
              eyebrow={showKicker ? resolvedHeadingTitle : undefined}
              title={resolvedHeadingTitle}
              description={resolvedHeadingDescription}
            />
            <p className='site-text-muted'>{config.description}</p>
            <ul className='mt-6 space-y-2 text-sm site-text-muted'>
              {config.highlights.map((item) => (
                <li key={item} className='rounded-xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] px-4 py-3'>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {config.stats.map((item) => (
              <div
                key={item}
                className='sitekit-card rounded-3xl border-[var(--sitekit-card-border)] p-5'
              >
                <p className='text-xs uppercase tracking-[0.16em] text-[var(--sitekit-text-subtle)]'>Credibility signal</p>
                <p className='mt-3 text-xl font-semibold text-[var(--sitekit-text-primary)]'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
