import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

interface ArticleTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  imageUrl?: string | null;
  body?: string | null;
}

interface RelatedArticle {
  canonicalSlug: string;
  contentType: string;
  status: string;
  imageUrl?: string | null;
  categories?: {
    typeIds?: string[];
    devaIds?: string[];
    byNumberIds?: string[];
  };
  translations: {
    [key: string]: ArticleTranslation;
  };
  createdAt: string;
  updatedAt: string;
}

interface RelatedArticlesProps {
  currentSlug: string;
  categoryIds?: string[];
  title?: string;
  showItems?: number;
  currentCategory?: string; // Add current category for the "Explore More" link
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentSlug,
  categoryIds = [],
  title,
  showItems = 5,
  currentCategory = '/articles', // Default to articles if not specified
}) => {
  const { t, locale } = useTranslation();
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedArticles();
  }, [locale, currentSlug, categoryIds]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
      
      // Fetch articles from the same categories if categoryIds are provided, otherwise fetch recent articles
      let apiUrl = `${backendUrl}/rest/articles?lang=${locale}&page=1&limit=${showItems + 1}`;
      
      if (categoryIds && categoryIds.length > 0) {
        const categoryParams = categoryIds.map(id => `categoryId=${id}`).join('&');
        apiUrl = `${backendUrl}/rest/articles?lang=${locale}&page=1&limit=${showItems + 1}&${categoryParams}`;
      }


      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch related articles`);
      }

      const data = await response.json();
      
      // Filter out the current article and limit to requested number
      const filtered = data.articles
        .filter((article: RelatedArticle) => article.canonicalSlug !== currentSlug)
        .slice(0, showItems);

      setRelatedArticles(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching related articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get translation for current locale with fallback
  const getTranslation = (article: RelatedArticle) => {
    return (
      article.translations[locale] ||
      article.translations.en ||
      article.translations.te ||
      article.translations.hi ||
      article.translations.kn
    );
  };

  // Get display title for article
  const getDisplayTitle = (article: RelatedArticle) => {
    const translation = getTranslation(article);
    return translation?.title || 'Untitled';
  };

  // Get the base URL for the "Explore More" link based on the category
  const getExploreMoreUrl = () => {
    return currentCategory;
  };

  if (loading) {
    return (
      <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>{title || t.stotra.recent_articles}</h2>
        </div>
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || relatedArticles.length === 0) {
    return null; // Don't render anything if there are no related articles or there's an error
  }

  return (
    <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
      <div className="d-flex align-items-end justify-content-center">
        <h2 className="gr-text-7 fw-bold mb-0">{title || t.stotra.recent_articles}</h2>
      </div>
      
      <ul className="card-list list-style-border ps-0 mt-6 mb-3 mx-3">
        {relatedArticles.map((article) => {
          const translation = getTranslation(article);

          if (!translation) return null;

          return (
            <li className="text-black gr-text-8 border-bottom border-gray-3 mb-0 py-3 d-block" key={article.canonicalSlug}>
              <Link
                href={`/articles/${article.canonicalSlug}`}
                className="text-black gr-hover-text-orange"
              >
                {getDisplayTitle(article)}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="text-center">
        <Link 
          href={getExploreMoreUrl()} 
          className="float-right text-end text-right btn-link with-icon gr-text-blue gr-text-9 mb-3 fw-bold"
        >
          {t.panchangam.explore_more} →
        </Link>
      </div>
    </div>
  );
};

export default RelatedArticles;