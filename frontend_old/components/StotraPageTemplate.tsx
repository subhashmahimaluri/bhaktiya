'use client';

import CommentSection from '@/components/comments/CommentSection';
import Layout from '@/components/Layout/Layout';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import RelatedStotras from '@/components/RelatedStotras';
import SocialShareButtons from '@/components/SocialShareButtons';
import { useAvailableLanguages } from '@/context/AvailableLanguagesContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Locale } from '@/locales';
import { generateStotraStructuredData, getStotraDetailMetaData } from '@/utils/seo';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

export interface StotraTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  stotra: string;
  stotraMeaning: string;
  body?: string | null;
  imageUrl?: string | null;
  faq?: string | null;
}

export interface StotraDetail {
  canonicalSlug: string;
  contentType: string;
  status: string;
  imageUrl?: string | null;
  categories?: any;
  stotraTitle?: string;
  translations: {
    [key: string]: StotraTranslation;
  };
  meta: {
    requestedLanguage: string;
    availableLanguages: string[];
    translation: StotraTranslation;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StotraPageConfig {
  categoryName: string; // Display name (e.g., "Sahasranamavali")
  basePath: string; // URL path (e.g., "/sahasranamavali")
  categoryDescription: string; // Description text
  categoryIds?: string[]; // CATEGORY_IDS to validate against
  aboutText?: string; // About section text
  sidebarDescription?: string; // Sidebar description
}

// YouTube embed component with lazy loading
const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasError(false);

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load when video is 100px away from viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [videoId]);

  if (!videoId || hasError) {
    return (
      <div className="alert alert-warning" role="alert">
        Unable to load video. Invalid YouTube video ID.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="ratio ratio-16x9 mb-4">
      {isInView ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onError={() => setHasError(true)}
        ></iframe>
      ) : (
        <div className="d-flex align-items-center justify-content-center bg-light">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading video...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
const MemoizedYouTubeEmbed = React.memo(YouTubeEmbed);

interface StotraPageTemplateProps {
  config: StotraPageConfig;
  canonicalUrl?: string;
}

export default function StotraPageTemplate({
  config,
  canonicalUrl: canonicalUrlProp,
}: StotraPageTemplateProps) {
  const { t, locale } = useTranslation();
  const { data: userSession } = useSession();
  const { setAvailableLanguages, resetAvailableLanguages } = useAvailableLanguages();
  const router = useRouter();
  const { slug } = router.query;
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasRedirectedRef = useRef(false);

  const [stotra, setStotra] = useState<StotraDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackLanguage, setIsFallbackLanguage] = useState(false);

  // Compute SEO metadata once to avoid recalculation
  const seoMetadata = useMemo(() => {
    if (stotra?.meta?.translation?.seoTitle) {
      const { title, description } = getStotraDetailMetaData(
        stotra.meta.translation.seoTitle,
        stotra.meta.translation?.stotra || undefined,
        locale
      );
      return { title, description };
    }
    // Use slug for better SEO during loading
    if (slug && typeof slug === 'string') {
      const formattedSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return {
        title: `${formattedSlug} | SS Bhakthi`,
        description: `Read ${formattedSlug} with lyrics, meaning and benefits. Complete stotra text with translations.`,
      };
    }
    return {
      title: `${config.categoryName} | SS Bhakthi`,
      description: config.categoryDescription,
    };
  }, [stotra?.meta?.translation, slug, config.categoryName, config.categoryDescription, locale]);

  const pageTitle = seoMetadata.title;
  const pageDescription = seoMetadata.description;

  // Compute canonical URL
  const canonicalUrl_computed = useMemo(() => {
    return (
      canonicalUrlProp ||
      (slug && typeof slug === 'string'
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ssbhakthi.com'}${config.basePath}/${slug}`
        : undefined)
    );
  }, [canonicalUrlProp, slug, config.basePath]);

  // Generate structured data for SEO
  const structuredData = useMemo(() => {
    if (!stotra || !canonicalUrl_computed) return [];

    const translation = stotra?.meta?.translation;
    return generateStotraStructuredData({
      title: translation?.title || pageTitle,
      description: pageDescription,
      canonicalUrl: canonicalUrl_computed,
      imageUrl: translation?.imageUrl || stotra.imageUrl || undefined,
      publishedTime: stotra.createdAt,
      modifiedTime: stotra.updatedAt,
      categoryName: config.categoryName,
      basePath: config.basePath,
      locale,
    });
  }, [stotra, canonicalUrl_computed, pageTitle, pageDescription, config, locale]);

  const fetchStotra = useCallback(async () => {
    if (hasRedirectedRef.current) {
      return;
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      hasRedirectedRef.current = true;
      router.push('/404');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setIsFallbackLanguage(false);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
      const apiUrl = `${backendUrl}/rest/stotras/${slug}?lang=${locale}`;

      const response = await fetch(apiUrl, {
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 404) {
        try {
          const errorData = await response.json();

          if (
            errorData.error?.code === 'TRANSLATION_NOT_FOUND' &&
            errorData.error?.availableLanguages
          ) {
            setAvailableLanguages(errorData.error.availableLanguages as Locale[]);

            if (!errorData.error.availableLanguages.includes(locale)) {
              const fallbackLang = errorData.error.availableLanguages[0];
              const fallbackUrl = `${backendUrl}/rest/stotras/${slug}?lang=${fallbackLang}`;

              const fallbackResponse = await fetch(fallbackUrl, {
                signal: abortControllerRef.current.signal,
              });

              if (fallbackResponse.ok) {
                const fallbackData: StotraDetail = await fallbackResponse.json();

                if (!abortControllerRef.current?.signal.aborted) {
                  setStotra(fallbackData);
                  setIsFallbackLanguage(true);
                  setError(null);
                }
                return;
              }
            }
          }
        } catch (jsonError) {
          console.warn('Could not parse 404 error response:', jsonError);
        }

        hasRedirectedRef.current = true;
        router.push('/404');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StotraDetail = await response.json();

      if (!abortControllerRef.current?.signal.aborted) {
        // Validate category if categoryIds provided
        if (config.categoryIds && data.categories?.typeIds?.length) {
          const { CATEGORY_IDS } = await import('@/constants/stotras');
          const categoryMap: { [key: string]: string } = {
            [CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI]: '/ashtothram',
            [CATEGORY_IDS.SAHASRANAMAVALI]: '/sahasranamavali',
            [CATEGORY_IDS.SAHASRANAMAM]: '/sahasranamam',
            [CATEGORY_IDS.BHAJANS]: '/bhajans',
            [CATEGORY_IDS.BHAKTHI_SONGS]: '/bhakthi-songs',
          };

          // Find the correct path for this content
          let correctPath = null;
          for (const categoryId of data.categories.typeIds) {
            if (categoryMap[categoryId]) {
              correctPath = categoryMap[categoryId];
              break;
            }
          }

          // If content doesn't belong to this category, redirect
          if (!data.categories.typeIds.some((id: string) => config.categoryIds?.includes(id))) {
            hasRedirectedRef.current = true;
            const redirectPath = correctPath || '/stotras';
            router.replace(`${redirectPath}/${slug}`);
            return;
          }
        }

        setStotra(data);

        if (data.meta?.availableLanguages) {
          setAvailableLanguages(data.meta.availableLanguages as Locale[]);
        }

        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error(`Error fetching ${config.categoryName} stotra:`, err);

      if (!hasRedirectedRef.current && !abortControllerRef.current?.signal.aborted) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching the stotra'
        );
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [slug, locale, router, config]);

  useEffect(() => {
    hasRedirectedRef.current = false;

    if (router.isReady && slug && locale && typeof slug === 'string') {
      fetchStotra();
    }
  }, [router.isReady, slug, locale, fetchStotra]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      resetAvailableLanguages();
    };
  }, [resetAvailableLanguages]);

  // Loading state
  if (!router.isReady || loading) {
    return (
      <Layout title={pageTitle} description={pageDescription}>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="py-4 text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>About {config.categoryName}</h2>
              <p className="text-muted small">
                {config.sidebarDescription || config.categoryDescription}
              </p>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <Layout
        title={`Error Loading ${config.categoryName} | SS Bhakthi`}
        description={pageDescription}
      >
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
              <div className="mt-3 text-center">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => {
                    setError(null);
                    fetchStotra();
                  }}
                >
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={() => router.push(config.basePath)}>
                  Back to {config.categoryName} Collection
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>About {config.categoryName}</h2>
              <p className="text-muted small">
                {config.sidebarDescription || config.categoryDescription}
              </p>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  // Not found state
  if (!stotra && !loading && !error) {
    return (
      <Layout title={`${config.categoryName} Not Found | SS Bhakthi`} description={pageDescription}>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="alert alert-warning" role="alert">
                {config.categoryName} not found or failed to load.
              </div>
              <div className="mt-3 text-center">
                <button className="btn btn-primary me-2" onClick={() => fetchStotra()}>
                  Retry
                </button>
                <button className="btn btn-secondary" onClick={() => router.push(config.basePath)}>
                  Browse {config.categoryName} Collection
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>About {config.categoryName}</h2>
              <p className="text-muted small">
                {config.sidebarDescription || config.categoryDescription}
                {config.sidebarDescription || config.categoryDescription}
              </p>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  const translation = stotra?.meta?.translation;

  const userRoles = (userSession?.user?.roles as string[]) || [];
  const hasAdminAccess = userRoles.some(role => ['admin', 'editor', 'author'].includes(role));

  // Translation not available state
  if (!translation) {
    return (
      <Layout title="Translation Not Available | SS Bhakthi" description={pageDescription}>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="alert alert-warning" role="alert">
                Translation data not available for this {config.categoryName}.
              </div>
              <div className="mt-3 text-center">
                <button className="btn btn-primary me-2" onClick={() => fetchStotra()}>
                  Retry
                </button>
                <button className="btn btn-secondary" onClick={() => router.push(config.basePath)}>
                  Browse {config.categoryName} Collection
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>About {config.categoryName}</h2>
              <p className="text-muted small">
                {config.sidebarDescription || config.categoryDescription}
              </p>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  return (
    <Layout
      title={pageTitle}
      description={pageDescription}
      canonicalUrl={canonicalUrl_computed}
      imageUrl={translation?.imageUrl || stotra?.imageUrl || undefined}
      publishedTime={stotra?.createdAt}
      modifiedTime={stotra?.updatedAt}
      structuredData={structuredData}
      type="article"
    >
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <article className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href={config.basePath} className="text-decoration-none">
                    {config.categoryName}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {translation.title}
                </li>
              </ol>
            </nav>

            {/* Title and Edit Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary mb-0">{translation.title}</h1>
              {hasAdminAccess && (
                <Link href={`/admin/stotras/${stotra.canonicalSlug}/edit`}>
                  <Button variant="outline-primary" size="sm">
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                </Link>
              )}
            </div>

            {/* Fallback Language Warning */}
            {isFallbackLanguage && (
              <div className="alert alert-info mb-4" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                This content is not available in{' '}
                {locale === 'en' ? 'English' : 'your selected language'}. Showing in{' '}
                {translation.title && stotra.meta?.requestedLanguage
                  ? stotra.meta.requestedLanguage === 'te'
                    ? 'Telugu'
                    : stotra.meta.requestedLanguage === 'en'
                      ? 'English'
                      : stotra.meta.requestedLanguage === 'hi'
                        ? 'Hindi'
                        : stotra.meta.requestedLanguage === 'kn'
                          ? 'Kannada'
                          : stotra.meta.requestedLanguage
                  : 'available language'}{' '}
                instead.
              </div>
            )}

            {/* YouTube Video Embed (lazy load) */}
            {translation.videoId ? (
              <div className="mb-4">
                <MemoizedYouTubeEmbed videoId={translation.videoId} />
              </div>
            ) : translation.imageUrl ? (
              <div className="mb-4">
                <Image
                  src={translation.imageUrl}
                  alt={`${translation.title} - Hindu devotional stotra with lyrics and meaning`}
                  className="img-fluid rounded"
                  width={800}
                  height={400}
                  style={{ maxWidth: '100%', height: 'auto' }}
                  priority
                />
              </div>
            ) : null}

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={canonicalUrlProp || (typeof window !== 'undefined' ? window.location.href : '')}
              title={stotra.stotraTitle || pageTitle}
              description={`Share this ${stotra.stotraTitle || pageTitle}`}
            />

            {/* PDF Download Button */}
            <PdfDownloadButton
              slug={stotra.canonicalSlug}
              title={stotra.stotraTitle || pageTitle}
              language={locale}
            />

            {/* Stotra Text Section */}
            {translation.stotra && (
              <div className="mb-4">
                <div
                  className="stotra-content"
                  dangerouslySetInnerHTML={{ __html: translation.stotra }}
                />
              </div>
            )}

            {/* Stotra Meaning */}
            {translation.stotraMeaning && (
              <div className="mb-4 pt-5">
                <h2 className="h4 text-secondary mb-3">Meaning</h2>
                <div
                  className="stotra-meaning"
                  dangerouslySetInnerHTML={{ __html: translation.stotraMeaning }}
                />
              </div>
            )}

            {/* FAQ Section */}
            {translation.faq && (
              <div className="mb-4 pt-5">
                <h2 className="h4 text-secondary mb-3">FAQ</h2>
                <div className="stotra-faq" dangerouslySetInnerHTML={{ __html: translation.faq }} />
              </div>
            )}

            {/* Additional Body Content (if available) */}
            {translation.body && (
              <div className="mb-4">
                <div
                  className="stotra-body"
                  dangerouslySetInnerHTML={{ __html: translation.body }}
                />
              </div>
            )}

            {/* PDF Download Button */}
            <PdfDownloadButton
              slug={stotra.canonicalSlug}
              title={stotra.stotraTitle || pageTitle}
              language={locale}
            />

            {/* Metadata */}
            <div className="border-top mt-5 pt-3">
              <small className="text-muted">
                <strong>Available Languages:</strong> {stotra.meta.availableLanguages.join(', ')}
              </small>
            </div>

            {/* Comments Section */}
            <CommentSection contentType="stotra" canonicalSlug={stotra.canonicalSlug} />
          </article>
        </Col>
        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <RelatedStotras
            currentSlug={stotra.canonicalSlug}
            categoryIds={stotra.categories?.typeIds || []}
            title={t.nav.related_stotras}
            showItems={5}
            currentCategory={config.basePath}
          />
        </Col>
      </Row>
    </Layout>
  );
}
