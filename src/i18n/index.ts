import es from './es.json';
import en from './en.json';

export type Language = 'es' | 'en';

const translations = { es, en };

export function getTranslations(lang: Language) {
  return translations[lang] || translations.es;
}

export function getLangFromUrl(url: URL): Language {
  const pathname = url.pathname;
  if (pathname.startsWith('/en/')) return 'en';
  if (pathname === '/en') return 'en';
  return 'es';
}

export function getAlternateLangUrl(url: URL, currentLang: Language): string {
  const pathname = url.pathname;

  if (currentLang === 'es') {
    // Spanish to English: /es/about -> /en/about
    if (pathname === '/es/' || pathname === '/es') return '/en/';
    return pathname.replace('/es/', '/en/').replace('/es', '/en');
  } else {
    // English to Spanish: /en/about -> /es/about
    if (pathname === '/en/' || pathname === '/en') return '/es/';
    return pathname.replace('/en/', '/es/').replace('/en', '/es');
  }
}

export function getLocalizedPath(path: string, lang: Language): string {
  if (lang === 'en') {
    if (path === '/') return '/en/';
    return `/en${path}`;
  }
  if (path === '/') return '/es/';
  return `/es${path}`;
}
