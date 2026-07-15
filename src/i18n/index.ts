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
    // Spanish to English
    if (pathname === '/') return '/en/';
    return `/en${pathname}`;
  } else {
    // English to Spanish
    if (pathname === '/en/') return '/';
    return pathname.replace('/en', '');
  }
}

export function getLocalizedPath(path: string, lang: Language): string {
  if (lang === 'en') {
    if (path === '/') return '/en/';
    return `/en${path}`;
  }
  return path;
}
