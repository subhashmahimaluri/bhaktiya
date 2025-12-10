'use client';

import CommentSection from '@/components/comments/CommentSection';
import Layout from '@/components/Layout/Layout';
import LazyYouTubeEmbed from '@/components/LazyYouTubeEmbed';
import RelatedArticles from '@/components/RelatedArticles';
import SocialShareButtons from '@/components/SocialShareButtons';
import { useTranslation } from '@/hooks/useTranslation';
import { getArticleDetailMetaData } from '@/utils/seo';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

interface ArticleTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  imageUrl?: string | null;
  body?: string | null;
}

interface ArticleDetail {
  canonicalSlug: string;
  contentType: string;
  status: string;
  imageUrl?: string | null;
  categories?: any;
  translations: {
    [key: string]: ArticleTranslation;
  };
  meta: {
    requestedLanguage: string;
    availableLanguages: string[];
    translation: ArticleTranslation;
  };
  createdAt: string;
  updatedAt: string;
}



export default function ArticlePage({ canonicalUrl }: { canonicalUrl?: string }) {
  const { t, locale } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const { slug } = router.query;
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasRedirectedRef = useRef(false);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute title once to avoid recalculation
  const pageTitle = useMemo(() => {
    if (article?.meta?.translation?.seoTitle) {
      const { title } = getArticleDetailMetaData(article.meta.translation.seoTitle);
      return title;
    }
    // Use slug for better SEO during loading
    if (slug && typeof slug === 'string') {
      const formattedSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedSlug} | SS Bhakthi`;
    }
    return 'Article | SS Bhakthi';
  }, [article?.meta?.translation?.seoTitle, slug]);

  // Memoized function to prevent unnecessary re-renders
  const fetchArticle = useCallback(async () => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      return;
    }

    // Basic slug validation
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      hasRedirectedRef.current = true;
      router.push('/404');
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
      const apiUrl = `${backendUrl}/rest/articles/${slug}?lang=${locale}`;

      const response = await fetch(apiUrl, {
        signal: abortControllerRef.current.signal,
      });

      // If article not found (404), redirect to 404 page
      if (response.status === 404) {
        hasRedirectedRef.current = true;
        router.push('/404');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ArticleDetail = await response.json();

      // Only update state if component is still mounted and request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setArticle(data);
        setError(null);
      }
    } catch (err) {
      // Don't handle aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Error fetching article:', err);

      // For network errors or other issues, set error state instead of redirecting
      if (!hasRedirectedRef.current && !abortControllerRef.current?.signal.aborted) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching the article'
        );
      }
    } finally {
      // Only set loading to false if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [slug, locale, router]);

  useEffect(() => {
    // Reset redirect flag when dependencies change
    hasRedirectedRef.current = false;

    // Only proceed if router is ready and we have both slug and locale
    if (router.isReady && slug && locale && typeof slug === 'string') {
      fetchArticle();
    }
  }, [router.isReady, slug, locale, fetchArticle]);

  // Cleanup function to abort ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Show loading state while router is not ready or while fetching
  if (!router.isReady || loading) {
    return (
      <Layout title={pageTitle}>
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
              <h2>Sidebar</h2>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  // Show error state only if there's an actual error and we're not loading
  if (error && !loading) {
    return (
      <Layout title="Error Loading Article | SS Bhakthi">
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
                    fetchArticle();
                  }}
                >
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                  Go Back
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>Sidebar</h2>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  // If no article data and no error, something went wrong
  if (!article && !loading && !error) {
    return (
      <Layout title="Article Not Found | SS Bhakthi">
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="alert alert-warning" role="alert">
                Article not found or failed to load.
              </div>
              <div className="mt-3 text-center">
                <button className="btn btn-primary me-2" onClick={() => fetchArticle()}>
                  Retry
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => router.push(`/${locale}/articles`)}
                >
                  Browse Articles
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>Sidebar</h2>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  const translation = article?.meta?.translation;

  // Additional safety check for translation data
  if (!translation) {
    return (
      <Layout title="Translation Not Available | SS Bhakthi">
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
              <div className="alert alert-warning" role="alert">
                Translation data not available for this article.
              </div>
              <div className="mt-3 text-center">
                <button className="btn btn-primary me-2" onClick={() => fetchArticle()}>
                  Retry
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => router.push(`/${locale}/articles`)}
                >
                  Browse Articles
                </button>
              </div>
            </div>
          </Col>
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <h2>Sidebar</h2>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  const canonicalUrl_computed =
    canonicalUrl ||
    (slug
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com'}/articles/${slug}`
      : undefined);

  return (
    <Layout title={pageTitle} canonicalUrl={canonicalUrl_computed}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 px-md-10 bg-white px-5 py-5 text-black">
            {/* Title */}
            <h1 className="text-primary mb-4 text-center">{translation.title}</h1>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={
                canonicalUrl_computed || (typeof window !== 'undefined' ? window.location.href : '')
              }
              title={translation.title}
              description={`Share this article: ${translation.title}`}
            />

            {/* Admin Edit Button - Only show for admin users */}
            {session?.user?.roles?.some((role: string) =>
              ['admin', 'editor', 'author'].includes(role)
            ) && (
              <div className="d-flex justify-content-end mb-3">
                <Link href={`/admin/articles/${article.canonicalSlug}/edit`} passHref>
                  <Button variant="outline-primary" size="sm">
                    <i className="bi bi-pencil me-1"></i>
                    Edit Article
                  </Button>
                </Link>
              </div>
            )}

            {/* Media Section - Video first preference, translation imageUrl second, global imageUrl third */}
            {translation.videoId ? (
              <div className="d-flex justify-content-center mb-4">
                <div style={{ width: '100%', maxWidth: '800px' }}>
                  <LazyYouTubeEmbed videoId={translation.videoId} title={translation.title} />
                </div>
              </div>
            ) : translation.imageUrl ? (
              <div className="d-flex justify-content-center mb-4">
                <Image
                  src={translation.imageUrl}
                  alt={translation.title}
                  className="img-fluid rounded"
                  width={800}
                  height={400}
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            ) : null}

            {/* Article Body Content */}
            {translation.body && (
              <div className="mb-4">
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: translation.body }}
                />
              </div>
            )}

            {/* Metadata */}
            <div className="border-top mt-5 pt-3">
              <small className="text-muted">
                <strong>Available Languages:</strong> {article.meta.availableLanguages.join(', ')}
                <br />
                <strong>Canonical ID:</strong> {article.canonicalSlug}
              </small>
            </div>

            {/* Comments Section */}
            <CommentSection contentType="article" canonicalSlug={article.canonicalSlug} />
          </div>
        </Col>
        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <RelatedArticles
            currentSlug={article.canonicalSlug}
            categoryIds={article.categories?.typeIds || []}
            title={t.stotra.recent_articles}
            showItems={5}
            currentCategory="/articles"
          />
        </Col>
      </Row>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/articles/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
