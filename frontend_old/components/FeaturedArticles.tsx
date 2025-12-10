import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

interface ArticleTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  body: string;
  summary?: string | null;
  imageUrl?: string | null;
}

export interface Article {
  canonicalSlug: string;
  contentType: string;
  status: string;
  imageUrl?: string | null;
  translations: {
    en?: ArticleTranslation;
    te?: ArticleTranslation;
    hi?: ArticleTranslation;
    kn?: ArticleTranslation;
  };
  createdAt: string;
  updatedAt: string;
}

interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface FeaturedArticlesProps {
  showItems?: number;
  initialArticles?: Article[];
}

const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({
  showItems = 4,
  initialArticles,
}) => {
  const { t, locale } = useTranslation();
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [loading, setLoading] = useState<boolean>(!initialArticles);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      if (initialArticles && articles.length > 0) {
        return;
      }

      try {
        setLoading(true);
        const currentLocale = locale || 'en';
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL;
        const apiUrl = `${backendUrl}/rest/articles?lang=${currentLocale}&status=published&page=1&limit=${showItems}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch featured articles');
        }
        const data: ArticlesResponse = await response.json();
        setArticles(data.articles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, [locale, showItems]);

  if (loading) {
    return (
      <div className="job-site-page feature-section bg-default-6 bg-pattern pattern-5 pb-8 pt-3">
        <Container>
          <div className="py-4 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading featured articles...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-site-page feature-section bg-default-6 bg-pattern pattern-5 pb-8 pt-3">
        <Container>
          <div className="alert alert-danger text-center" role="alert">
            Error loading featured articles: {error}
          </div>
        </Container>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="job-site-page feature-section bg-default-6 bg-pattern pattern-5 pb-8 pt-3">
        <Container>
          <div className="py-4 text-center">
            <p className="text-muted">No featured articles available at the moment.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      {/* Featured Articles section */}
      <div className="job-site-page feature-section bg-default-6 bg-pattern pattern-5 pb-8 pt-3">
        <Container>
          <Row className="justify-content-center">
            <Col className="text-center">
              <div className="section-title mb-sm-13 mb-lg-8 mb-6">
                <h2 className="title gr-text-5 text-primary mx-2 mb-6 mt-3 text-left">
                  {t.panchangam.recent_articles}
                </h2>
              </div>
            </Col>
          </Row>
          <Row className="g-4">
            {articles.map((article, index) => {
              // Prioritize current locale translation, then fallback to available translations
              const translation =
                article.translations[locale as keyof typeof article.translations] ||
                article.translations.en ||
                article.translations.te ||
                article.translations.hi ||
                article.translations.kn;

              if (!translation) return null;

              const tyImage = translation.videoId
                ? `https://i.ytimg.com/vi/${translation.videoId}/hq720.jpg`
                : null;

              // Use the image URL directly - it already contains the /api/images path
              // which is proxied by frontend to backend
              const articleImage = translation.imageUrl ? translation.imageUrl : tyImage;

              return (
                <Col xs={12} sm={6} md={4} lg={3} key={article.canonicalSlug || index}>
                  <Link
                    href={`/articles/${article.canonicalSlug}`}
                    className="feature-widget focus-reset d-flex flex-column min-height-px-350 gr-hover-shadow-1 h-100 border bg-white p-3 text-center"
                  >
                    <div className="mb-auto">
                      {articleImage ? (
                        <Image
                          className="img-fluid text-center"
                          src={articleImage}
                          alt={translation.title}
                          width={320}
                          height={180}
                          quality={75}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+"
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="video-placeholder d-flex align-items-center justify-content-center position-relative">
                          <div className="video-title-overlay position-absolute end-0 start-0 p-3">
                            <span className="fw-bold text-white">{translation.title}</span>
                          </div>
                        </div>
                      )}
                      <h3 className="gr-text-7 text-blackish-blue py-3 text-left">
                        {translation.title}
                      </h3>
                      <span className="btn-link with-icon gr-text-blue gr-text-9 fw-bold float-right text-right text-end">
                        {t.stotra.read_more} <i className="icon icon-tail-right fw-bold"></i>
                      </span>
                    </div>
                  </Link>
                </Col>
              );
            })}
          </Row>
          <Row>
            <Col className="text-center">
              <Link href="/articles">
                <Button className="gr-hover-y gr-text-9 btn mx-auto my-4 px-4 py-2">
                  {t.panchangam?.explore_more || 'Explore More'}
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default FeaturedArticles;
