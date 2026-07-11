import { useState } from 'react';
import type { FaqItem } from '../../types/site';
import SectionHeading from './SectionHeading';

export default function FAQSection({
  faqs,
  sectionId = 'faq',
  headingTitle,
  headingDescription,
  showKicker = true,
}: {
  faqs: FaqItem[];
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}) {
  const [openId, setOpenId] = useState<string | undefined>(faqs[0]?.id);
  const resolvedHeadingTitle = headingTitle || 'FAQ';
  const resolvedHeadingDescription =
    headingDescription || 'Questions from owners';

  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-4xl px-4 lg:px-8'>
        <SectionHeading
          eyebrow={showKicker ? resolvedHeadingTitle : undefined}
          title={resolvedHeadingTitle}
          description={resolvedHeadingDescription}
        />

        <div className='space-y-3'>
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className='rounded-2xl border border-[var(--sitekit-card-border)] bg-[var(--sitekit-surface-soft)] p-4'>
                <button
                  type='button'
                  className='flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-[var(--sitekit-text-primary)]'
                  onClick={() => setOpenId(isOpen ? undefined : faq.id)}
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <span className='text-lg'>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p className='mt-3 text-sm site-text-muted'>{faq.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
