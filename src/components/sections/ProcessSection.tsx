import type { ProcessStep } from '../../types/site';
import SectionHeading from './SectionHeading';

export default function ProcessSection({
  steps,
  sectionId = 'process',
  headingTitle,
  headingDescription,
  showKicker = true,
}: {
  steps: ProcessStep[];
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}) {
  const resolvedTitle = headingTitle || 'Process';
  const resolvedDescription = headingDescription || '';
  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-7xl px-4 lg:px-8'>
        <SectionHeading
          eyebrow={showKicker ? resolvedTitle : undefined}
          title={resolvedTitle}
          description={resolvedDescription || undefined}
        />

        <div className='relative grid gap-4 md:grid-cols-3'>
          <span
            aria-hidden='true'
            className='pointer-events-none absolute left-8 top-1 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-transparent via-[var(--sitekit-divider)] to-transparent lg:block'
          />
          {steps.map((step, index) => (
            <div
              key={step.id}
              className='sitekit-card rounded-3xl border border-[var(--sitekit-card-border)] p-5'
            >
              <p className='text-xs uppercase tracking-[0.18em] text-accent-500/85'>Step {index + 1}</p>
              <h3 className='mt-3 text-lg font-semibold text-[var(--sitekit-text-primary)]'>{step.title}</h3>
              <p className='mt-2 text-sm site-text-muted'>{step.description}</p>
              {step.outcome ? (
                <p className='mt-3 text-xs font-medium text-[var(--sitekit-text-muted)]'>
                  Result: {step.outcome}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
