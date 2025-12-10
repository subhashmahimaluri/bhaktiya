// components/Layout/Layout.tsx
import { useTranslation } from '@/hooks/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { Container } from 'react-bootstrap';
import Footer from './Footer';
import Header from './Header/Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: any[];
  type?: 'website' | 'article';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  canonicalUrl,
  imageUrl,
  publishedTime,
  modifiedTime,
  structuredData,
  type = 'website',
}) => {
  const router = useRouter();
  const { locale } = useTranslation();
  const langPath = locale === 'en' ? '/en' : '';

  // Construct the proper canonical URL
  const getCanonicalUrl = () => {
    // If canonicalUrl is provided as a prop, use it directly
    if (canonicalUrl) {
      return canonicalUrl;
    }

    // For dynamic routes, construct URL using router.pathname + query params
    if (router.isReady && router.pathname) {
      let actualPath = router.pathname;

      // Replace dynamic route parameters with their actual values from router.query
      Object.keys(router.query).forEach(key => {
        if (typeof router.query[key] === 'string') {
          actualPath = actualPath.replace(`[${key}]`, router.query[key] as string);
        }
      });

      // If we successfully replaced parameters, use this path
      if (!actualPath.includes('[') && actualPath !== '/') {
        return `https://www.ssbhakthi.com${langPath}${actualPath}`;
      }
    }

    // Fallback: use asPath for static pages
    let actualPath = router.asPath || router.pathname || '/';

    // Remove query parameters and hash
    const queryIndex = actualPath.indexOf('?');
    if (queryIndex !== -1) {
      actualPath = actualPath.substring(0, queryIndex);
    }
    const hashIndex = actualPath.indexOf('#');
    if (hashIndex !== -1) {
      actualPath = actualPath.substring(0, hashIndex);
    }

    // Remove language prefix if present
    const langPrefixes = ['/en', '/te', '/hi', '/kn'];
    for (const prefix of langPrefixes) {
      if (actualPath.startsWith(prefix + '/')) {
        actualPath = actualPath.substring(prefix.length);
        break;
      } else if (actualPath === prefix) {
        actualPath = '/';
        break;
      }
    }

    // Return canonical URL
    return `https://www.ssbhakthi.com${langPath}${actualPath}`;
  };

  const currentPath = getCanonicalUrl();
  const pageTitle = title || 'SS Bhakthi - Hindu Devotional Information';
  const pageDescription =
    description ||
    'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide';
  const pageImage = imageUrl || 'https://www.ssbhakthi.com/images/default-og-image.jpg';

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href={currentPath} />

        {/* Hreflang Tags for Multilingual SEO */}
        <link rel="alternate" hrefLang="te" href={getCanonicalUrl().replace('/en', '').replace('/hi', '').replace('/kn', '')} />
        <link
          rel="alternate"
          hrefLang="en"
          href={
            getCanonicalUrl().includes('/en')
              ? getCanonicalUrl()
              : `https://www.ssbhakthi.com/en${getCanonicalUrl().replace('https://www.ssbhakthi.com', '')}`
          }
        />
        <link
          rel="alternate"
          hrefLang="hi"
          href={
            getCanonicalUrl().includes('/hi')
              ? getCanonicalUrl()
              : `https://www.ssbhakthi.com/hi${getCanonicalUrl().replace('https://www.ssbhakthi.com', '').replace('/en', '').replace('/kn', '')}`
          }
        />
        <link
          rel="alternate"
          hrefLang="kn"
          href={
            getCanonicalUrl().includes('/kn')
              ? getCanonicalUrl()
              : `https://www.ssbhakthi.com/kn${getCanonicalUrl().replace('https://www.ssbhakthi.com', '').replace('/en', '').replace('/hi', '')}`
          }
        />
        <link rel="alternate" hrefLang="x-default" href={getCanonicalUrl().replace('/en', '').replace('/hi', '').replace('/kn', '')} />

        {/* Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={currentPath} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="SS Bhakthi" />
        <meta property="og:locale" content={locale === 'en' ? 'en_US' : locale === 'hi' ? 'hi_IN' : locale === 'kn' ? 'kn_IN' : 'te_IN'} />

        {/* Article-specific Open Graph Tags */}
        {type === 'article' && publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {type === 'article' && modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {type === 'article' && (
          <>
            <meta property="article:author" content="SS Bhakthi" />
            <meta property="article:section" content="Hindu Devotional" />
          </>
        )}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <meta name="twitter:site" content="@ssbhakthi" />
        <meta name="twitter:creator" content="@ssbhakthi" />

        {/* Additional SEO Meta Tags */}
        <meta name="author" content="SS Bhakthi" />
        <meta name="publisher" content="SS Bhakthi" />

        {/* Google Verification */}
        <meta
          name="google-site-verification"
          content="E7Fj9ePz3dqvg91IwO3M615ZprepadY0wb-ns82WpVY"
        />

        {/* Structured Data (JSON-LD) */}
        {structuredData && structuredData.length > 0 && (
          <>
            {structuredData.map((data, index) => (
              <script
                key={`structured-data-${index}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
              />
            ))}
          </>
        )}

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9489965739484926"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <div className="d-flex flex-column min-vh-100">
        <Header />

        <main className="flex-grow-1">
          <Container>{children}</Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
