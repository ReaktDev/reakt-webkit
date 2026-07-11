import { useEffect } from 'react';

export default function SEO({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;

    const existingDescription = document.querySelector('meta[name="description"]');
    if (existingDescription) {
      existingDescription.setAttribute('content', description);
    } else {
      const tag = document.createElement('meta');
      tag.name = 'description';
      tag.content = description;
      document.head.appendChild(tag);
    }

    const existingOgTitle = document.querySelector('meta[property="og:title"]');
    if (existingOgTitle) {
      existingOgTitle.setAttribute('content', title);
    } else {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'og:title');
      tag.setAttribute('content', title);
      document.head.appendChild(tag);
    }

    const existingOgDesc = document.querySelector('meta[property="og:description"]');
    if (existingOgDesc) {
      existingOgDesc.setAttribute('content', description);
    } else {
      const tag = document.createElement('meta');
      tag.setAttribute('property', 'og:description');
      tag.setAttribute('content', description);
      document.head.appendChild(tag);
    }
  }, [title, description]);

  return null;
}
