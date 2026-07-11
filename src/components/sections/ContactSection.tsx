import { useState, type FormEvent } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import SectionHeading from './SectionHeading';

interface ContactSectionProps {
  businessEmail: string;
  intro: string;
  serviceLabel: string;
  submitLabel: string;
  successMessage: string;
  privacyNote: string;
  trackSubmit?: (label: string, value: string) => void;
  sectionId?: string;
  headingTitle?: string;
  headingDescription?: string;
  showKicker?: boolean;
}

export default function ContactSection({
  businessEmail,
  intro,
  serviceLabel,
  submitLabel,
  successMessage,
  privacyNote,
  trackSubmit,
  sectionId = 'contact',
  headingTitle,
  headingDescription,
  showKicker = true,
}: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (formData.message.trim().length < 8) {
      nextErrors.message = 'Message should have at least 8 characters';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsSubmitting(false);
    setStatus(successMessage);
    setFormData({ name: '', email: '', service: '', message: '' });
    trackSubmit?.('contact_form_submit', formData.email);
  };

  return (
    <section id={sectionId} className='py-16'>
      <div className='mx-auto max-w-6xl px-4 lg:px-8'>
        <SectionHeading
          eyebrow={showKicker ? headingTitle || 'Contact' : undefined}
          title={headingTitle || 'Tell us how we can help'}
          description={
            headingDescription || `${intro} We will reply quickly to ${businessEmail}.`
          }
        />

        <form onSubmit={handleSubmit} className='mx-auto grid max-w-2xl gap-4'>
          <Input
            label='Full name'
            value={formData.name}
            onChange={(event) => handleChange('name', event.target.value)}
            type='text'
            aria-invalid={Boolean(errors.name)}
            error={errors.name}
          />

          <Input
            label='Email'
            value={formData.email}
            onChange={(event) => handleChange('email', event.target.value)}
            type='email'
            aria-invalid={Boolean(errors.email)}
            error={errors.email}
          />

          <Input
            label={serviceLabel}
            value={formData.service}
            onChange={(event) => handleChange('service', event.target.value)}
            type='text'
          />

          <Textarea
            label='Message'
            value={formData.message}
            onChange={(event) => handleChange('message', event.target.value)}
            rows={5}
            aria-invalid={Boolean(errors.message)}
            error={errors.message}
          />

          <Button type='submit' disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>

          <p className='text-xs site-text-subtle'>{privacyNote}</p>
          {status ? <p className='text-sm text-[var(--sitekit-accent)]'>{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
