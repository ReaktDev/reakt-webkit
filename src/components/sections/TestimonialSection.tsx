import type { Testimonial } from '../../types/site';
import SectionHeading from './SectionHeading';

export default function TestimonialSection({
  testimonials,
  sectionId = 'testimonials',
  headingTitle,
  headingDescription,
  showKicker = true,
}: {
  testimonials: Testimonial[];
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}) {
  const resolvedTitle = headingTitle || 'Testimonials';
  const resolvedDescription =
    headingDescription || 'Replace these with your real customer voices as soon as you get feedback.';
  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-7xl px-4 lg:px-8'>
        <SectionHeading
          eyebrow={showKicker ? resolvedTitle : undefined}
          title={resolvedTitle}
          description={resolvedDescription}
        />

        <div className='grid gap-4 md:grid-cols-2'>
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className='sitekit-card rounded-3xl p-6'
            >
              <p className='mb-4 text-sm leading-relaxed text-[var(--sitekit-text-muted)]'>{`“${testimonial.quote}”`}</p>
              <p className='text-sm font-semibold text-[var(--sitekit-text-primary)]'>{testimonial.name}</p>
              <p className='text-xs site-text-subtle'>{testimonial.role}</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
