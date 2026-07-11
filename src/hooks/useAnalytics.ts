import { useEffect } from 'react';
import type { AnalyticsSettings } from '../types/site';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    plausible: (event: string, props?: Record<string, string | number | boolean>) => void;
    fbq: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const useAnalytics = (settings: AnalyticsSettings) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const provider = settings.provider;

    if (provider === 'none') {
      return;
    }

    if (provider === 'ga4' && settings.ga4MeasurementId) {
      const id = settings.ga4MeasurementId;
      const existing = document.querySelector(`script[data-sitekit-ga4="${id}"]`);
      if (!existing) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        script.setAttribute('data-sitekit-ga4', id);
        document.head.appendChild(script);
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', id);
    }

    if (provider === 'plausible' && settings.plausibleDomain) {
      const domain = settings.plausibleDomain;
      const existing = document.querySelector(`script[data-sitekit-plausible="${domain}"]`);
      if (!existing) {
        const script = document.createElement('script');
        script.defer = true;
        script.src = 'https://plausible.io/js/script.js';
        script.setAttribute('data-domain', domain);
        script.setAttribute('data-sitekit-plausible', domain);
        document.head.appendChild(script);
      }
    }

    if (provider === 'metaPixel' && settings.metaPixelId) {
      const pixel = settings.metaPixelId;
      const existing = document.querySelector(`script[data-sitekit-pixel="${pixel}"]`);
      if (!existing) {
        const script = document.createElement('script');
        script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixel}');
          fbq('track', 'PageView');`;
        script.setAttribute('data-sitekit-pixel', pixel);
        document.head.appendChild(script);
      }
    }
  }, [
    settings.provider,
    settings.ga4MeasurementId,
    settings.plausibleDomain,
    settings.metaPixelId,
  ]);

  const trackEvent = (eventName: string, payload?: Record<string, string | number | boolean>) => {
    if (settings.provider === 'none' || typeof window === 'undefined') {
      return;
    }

    if (settings.provider === 'ga4' && window.gtag) {
      window.gtag('event', eventName, payload);
      return;
    }

    if (settings.provider === 'plausible' && window.plausible) {
      window.plausible(eventName, payload);
      return;
    }

    if (settings.provider === 'metaPixel' && window.fbq) {
      window.fbq('track', eventName, payload);
    }
  };

  return { trackEvent };
};
