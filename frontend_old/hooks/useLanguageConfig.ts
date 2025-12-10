import { Locale } from '@/locales';
import { useRouter } from 'next/router';
import { useMemo, useCallback } from 'react';

export function useLanguageConfig() {
  const router = useRouter();
  const locale = router.locale as Locale;

  // Determine current instance type based on available locales
  const getInstanceType = useCallback(() => {
    const availableLocales = router.locales || [];

    if (availableLocales.includes('te') && availableLocales.includes('en')) {
      return 'te-en'; // Main instance
    } else if (availableLocales.includes('hi')) {
      return 'hi'; // Hindi instance
    } else if (availableLocales.includes('kn')) {
      return 'kn'; // Kannada instance
    }

    return 'te-en'; // Default
  }, [router.locales]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => {
    const instanceType = getInstanceType();
    return {
      locale,
      instanceType,
      availableLocales: router.locales || [],
      isMainInstance: instanceType === 'te-en',
    };
  }, [locale, getInstanceType, router.locales]);
}
