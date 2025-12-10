// hooks/useTranslation.ts - Updated for multi-instance
import { dictionaries, type Locale } from '@/locales';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

// Domain/port mapping for each language
// Use environment variables in production, fallback to localhost for development
const LANGUAGE_DOMAINS = {
  te: process.env['NEXT_PUBLIC_FRONTEND_TE_URL'] || 'http://localhost:3000',
  en: process.env['NEXT_PUBLIC_FRONTEND_EN_URL'] || 'http://localhost:3000',
  hi: process.env['NEXT_PUBLIC_FRONTEND_HI_URL'] || 'http://localhost:3001',
  kn: process.env['NEXT_PUBLIC_FRONTEND_KN_URL'] || 'http://localhost:3002',
};

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale as Locale) || 'te';
  const t = dictionaries[locale];

  const switchLanguage = useCallback(
    (newLocale: Locale) => {
      const { pathname, query } = router;

      // Check if both current and target locales are on the same domain (port 3000 for te/en)
      const currentDomain = LANGUAGE_DOMAINS[locale];
      const targetDomain = LANGUAGE_DOMAINS[newLocale];

      if (currentDomain === targetDomain) {
        // Same domain switch - use Next.js router
        router.push({ pathname, query }, router.asPath, { locale: newLocale });
      } else {
        // Cross-domain switch - redirect to different port/domain
        const currentPath = pathname === '/' ? '' : pathname;
        const queryString =
          Object.keys(query).length > 0
            ? '?' + new URLSearchParams(query as Record<string, string>).toString()
            : '';

        window.location.href = `${targetDomain}${currentPath}${queryString}`;
      }
    },
    [locale, router]
  );

  const getLanguageUrl = useCallback(
    (targetLocale: Locale) => {
      const { pathname, query } = router;
      const currentPath = pathname === '/' ? '' : pathname;
      const queryString =
        Object.keys(query).length > 0
          ? '?' + new URLSearchParams(query as Record<string, string>).toString()
          : '';

      return `${LANGUAGE_DOMAINS[targetLocale]}${currentPath}${queryString}`;
    },
    [router]
  );

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      t,
      locale,
      switchLanguage,
      getLanguageUrl,
      isLoading: router.isFallback,
      availableLocales: Object.keys(LANGUAGE_DOMAINS) as Locale[],
    }),
    [t, locale, switchLanguage, getLanguageUrl, router.isFallback]
  );
}
