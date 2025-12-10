import { CATEGORY_IDS } from '@/constants/stotras';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface StotraTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  stotra: string;
  stotraMeaning: string;
  body?: string | null;
}

interface RelatedStotra {
  canonicalSlug: string;
  contentType: string;
  stotraTitle: string;
  status: string;
  imageUrl?: string | null;
  categories?: {
    typeIds?: string[];
    devaIds?: string[];
    byNumberIds?: string[];
  };
  translations: {
    [key: string]: StotraTranslation;
  };
  createdAt: string;
  updatedAt: string;
}

interface RelatedStotrasProps {
  currentSlug: string;
  categoryIds: string[];
  title?: string;
  showItems?: number;
  currentCategory?: string; // Add current category for the "Explore More" link
}

const RelatedStotras: React.FC<RelatedStotrasProps> = ({
  currentSlug,
  categoryIds,
  title,
  showItems = 5,
  currentCategory = '/stotras', // Default to stotras if not specified
}) => {
  const { t, locale } = useTranslation();
  const [relatedStotras, setRelatedStotras] = useState<RelatedStotra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedStotras();
  }, [locale, currentSlug, categoryIds]);

  const fetchRelatedStotras = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!categoryIds || categoryIds.length === 0) {
        setRelatedStotras([]);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';

      // Fetch stotras from the same categories, excluding the current one
      const categoryParams = categoryIds.map(id => `categoryId=${id}`).join('&');
      const apiUrl = `${backendUrl}/rest/stotras?lang=${locale}&page=1&limit=${showItems + 1}&${categoryParams}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch related stotras`);
      }

      const data = await response.json();

      // Filter out the current stotra and limit to requested number
      const filtered = data.stotras
        .filter((stotra: RelatedStotra) => stotra.canonicalSlug !== currentSlug)
        .slice(0, showItems);

      setRelatedStotras(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching related stotras:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get translation for current locale with fallback
  const getTranslation = (stotra: RelatedStotra) => {
    return (
      stotra.translations[locale] ||
      stotra.translations.en ||
      stotra.translations.te ||
      stotra.translations.hi ||
      stotra.translations.kn
    );
  };

  // Get display title for stotra
  const getDisplayTitle = (stotra: RelatedStotra) => {
    const translation = getTranslation(stotra);
    return translation?.title || stotra.stotraTitle || 'Untitled';
  };

  // Get category label for display based on content type and categories
  const getCategoryLabel = (stotra: RelatedStotra): string => {
    const contentType = stotra.contentType;

    // For articles, always show "Article"
    if (contentType?.toLowerCase() === 'article') {
      return 'Article';
    }

    // For stotras, determine the specific category based on category IDs
    const categories = stotra.categories?.typeIds || [];

    if (categories.includes(CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI)) {
      return 'Ashtottara';
    } else if (categories.includes(CATEGORY_IDS.SAHASRANAMAVALI)) {
      return 'Sahasranamavali';
    } else if (categories.includes(CATEGORY_IDS.SAHASRANAMAM)) {
      return 'Sahasranamam';
    } else if (categories.includes(CATEGORY_IDS.BHAJANS)) {
      return 'Bhajans';
    } else if (categories.includes(CATEGORY_IDS.BHAKTHI_SONGS)) {
      return 'Bhakthi Songs';
    }

    // Fallback: Check slug patterns for category identification
    const slug = stotra.canonicalSlug?.toLowerCase() || '';
    if (slug.includes('ashtottara') || slug.includes('ashtothram')) {
      return 'Ashtottara';
    }
    if (slug.includes('sahasranamavali') && !slug.includes('sahasranamam')) {
      return 'Sahasranamavali';
    }
    if (slug.includes('sahasranamam') || slug.includes('sahasranama-stotram')) {
      return 'Sahasranamam';
    }

    // Default fallback for stotras
    return 'Stotra';
  };

  // Get the correct path based on category ID or content type
  const getStotraPath = (stotra: RelatedStotra) => {
    const categories = stotra.categories?.typeIds || [];
    const contentType = stotra.contentType?.toLowerCase();

    // If categories exist, use category ID to determine path
    if (categories.length > 0) {
      if (categories.includes(CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI)) {
        return '/ashtothram';
      } else if (categories.includes(CATEGORY_IDS.SAHASRANAMAVALI)) {
        return '/sahasranamavali';
      } else if (categories.includes(CATEGORY_IDS.SAHASRANAMAM)) {
        return '/sahasranamam';
      } else if (categories.includes(CATEGORY_IDS.BHAJANS)) {
        return '/bhajans';
      } else if (categories.includes(CATEGORY_IDS.BHAKTHI_SONGS)) {
        return '/bhakthi-songs';
      }
    }

    // Fall back to content type if no categories or no specific match
    if (contentType === 'article') {
      return '/articles';
    } else {
      return '/stotras'; // Default for stotras
    }
  };

  // Get the base URL for the "Explore More" link based on the category
  const getExploreMoreUrl = () => {
    return currentCategory;
  };

  if (loading) {
    return (
      <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>{title || t.nav.related_stotras}</h2>
        </div>
        <div className="py-3 text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || relatedStotras.length === 0) {
    return null; // Don't render anything if there are no related stotras or there's an error
  }

  return (
    <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
      <div className="d-flex align-items-end justify-content-center">
        <h2 className="gr-text-7 fw-bold mb-0">{title || t.nav.related_stotras}</h2>
      </div>

      <ul className="card-list list-style-border mx-3 mb-3 mt-6 ps-0">
        {relatedStotras.map(stotra => {
          const translation = getTranslation(stotra);
          const path = getStotraPath(stotra);

          if (!translation) return null;

          return (
            <li
              className="gr-text-8 border-bottom border-gray-3 d-block mb-0 py-3 text-black"
              key={stotra.canonicalSlug}
            >
              <Link
                href={`${path}/${stotra.canonicalSlug}`}
                className="gr-hover-text-orange text-black"
              >
                {getDisplayTitle(stotra)}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="text-center">
        <Link
          href={getExploreMoreUrl()}
          className="btn-link with-icon gr-text-blue gr-text-9 fw-bold float-right mb-3 text-right text-end"
        >
          {t.panchangam.explore_more} →
        </Link>
      </div>
    </div>
  );
};

export default RelatedStotras;
