import { useEffect } from 'react';
import { SITE_NAME, SITE_URL } from './constants';

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
 * Memperbarui meta SEO per halaman.
 * @param {{title:string, description?:string, path?:string, noindex?:boolean, jsonLd?:object}} opts
 */
export function useSEO({ title, description, path = '/', noindex = false, jsonLd }) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path === '/' ? '' : path}`;
    document.title = fullTitle;
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', fullTitle);
    setCanonical(url);

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.page = 'true';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, path, noindex, jsonLd]);
}
