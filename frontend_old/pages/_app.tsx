// Import all CSS synchronously (required for proper styling)
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'nprogress/nprogress.css';
import '../styles/globals.scss';
import '../styles/home-tailwind.css';

import SessionExpirationMonitor from '@/components/SessionExpirationMonitor';
import { AvailableLanguagesProvider } from '@/context/AvailableLanguagesContext';
import { LocationProvider } from '@/context/LocationContext';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Hind_Guntur, Nunito_Sans } from 'next/font/google';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { useEffect } from 'react';

// Configure NProgress for minimal reflow impact
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false, // Disable spinner to reduce DOM manipulation
  trickle: true,
  trickleSpeed: 200,
});

const hindGuntur = Hind_Guntur({
  subsets: ['latin'],
  variable: '--font-hind-guntur',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Lazy load Bootstrap JavaScript only (CSS loaded synchronously above)
  useEffect(() => {
    // Use requestIdleCallback for non-critical Bootstrap JS initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          // @ts-expect-error: Bootstrap JS module doesn't have type definitions
          import('bootstrap/dist/js/bootstrap.bundle.min.js');
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        // @ts-expect-error: Bootstrap JS module doesn't have type definitions
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
      }, 1);
    }
  }, []);

  // Handle locale-specific font classes with minimal DOM manipulation
  useEffect(() => {
    const locale = router.locale || 'te';
    const bodyClassList = document.body.classList;

    // Batch DOM updates using requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      // Remove all instance classes in one operation
      bodyClassList.remove('instance-te', 'instance-en', 'instance-hi', 'instance-kn');
      bodyClassList.remove(hindGuntur.variable, nunitoSans.variable);

      // Add new classes based on locale
      if (locale === 'te') {
        bodyClassList.add('instance-te', hindGuntur.variable);
      } else {
        bodyClassList.add('instance-en', nunitoSans.variable);
      }
    });
  }, [router.locale]); // Only run when locale changes, not on every router change

  // Handle route change progress indicator
  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.events]);

  return (
    <SessionProvider session={pageProps.session}>
      <SessionExpirationMonitor />
      <LocationProvider>
        <AvailableLanguagesProvider>
          <Component {...pageProps} />
        </AvailableLanguagesProvider>
      </LocationProvider>
    </SessionProvider>
  );
}
