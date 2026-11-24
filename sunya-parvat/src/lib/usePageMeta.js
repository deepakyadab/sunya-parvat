import { useEffect } from 'react';

const SITE = 'Sunya Parvat';
export const SITE_URL = 'https://sunyaparvat.vercel.app';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-page <title>, description, canonical and Open Graph tags.
 * The build also pre-renders these into static HTML (scripts/prerender.js)
 * so crawlers see them without running JavaScript.
 */
export default function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    const full = title ? `${title} · ${SITE}` : `${SITE} — Himalayan trek guide`;
    document.title = full;
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'robots', noindex ? 'noindex' : 'index,follow');
    if (path != null) {
      setCanonical(SITE_URL + path);
      setMeta('property', 'og:url', SITE_URL + path);
    }
  }, [title, description, path, noindex]);
}
