import { CATEGORY_IDS } from '@/constants/stotras';
import { useTranslation } from '@/hooks/useTranslation';
import { CONTENT_TYPE_ROUTES, SearchResult } from '@/types/search';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface SearchResultCardProps {
  result: SearchResult;
  locale: string;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, locale }) => {
  const { t } = useTranslation();
  // Helper function to determine the correct route path based on category ID or content type
  const getCategoryContext = (
    result: SearchResult
  ):
    | 'ashtothram'
    | 'sahasranamavali'
    | 'sahasranamam'
    | 'bhajans'
    | 'bhakthi-songs'
    | 'default' => {
    const contentType = result.type || result.contentType;

    // For articles, always use default route
    if (contentType?.toLowerCase() === 'article') {
      return 'default';
    }

    // For stotras, check category IDs first
    if (result.categories && Array.isArray(result.categories)) {
      for (const category of result.categories) {
        const categoryId = typeof category === 'string' ? category : '';

        // Check for specific category IDs
        if (categoryId === CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI) {
          return 'ashtothram';
        }
        if (categoryId === CATEGORY_IDS.SAHASRANAMAVALI) {
          return 'sahasranamavali';
        }
        if (categoryId === CATEGORY_IDS.SAHASRANAMAM) {
          return 'sahasranamam';
        }
        if (categoryId === CATEGORY_IDS.BHAJANS) {
          return 'bhajans';
        }
        if (categoryId === CATEGORY_IDS.BHAKTHI_SONGS) {
          return 'bhakthi-songs';
        }
      }
    }

    // Fallback: Check slug patterns
    const slug = result.canonicalSlug?.toLowerCase() || '';

    if (slug.includes('ashtottara') || slug.includes('ashtothram')) {
      return 'ashtothram';
    }

    if (slug.includes('sahasranamavali') && !slug.includes('sahasranamam')) {
      return 'sahasranamavali';
    }

    if (slug.includes('sahasranamam') || slug.includes('sahasranama-stotram')) {
      return 'sahasranamam';
    }

    if (slug.includes('bhajans') || slug.includes('bhajans')) {
      return 'bhajans';
    }

    if (slug.includes('bhakthisongs') || slug.includes('bhakthi-songs')) {
      return 'bhakthi-songs';
    }

    // Default for Hymns/Prayers and articles
    return 'default';
  };

  // Helper function to determine the correct route path
  const getContentPath = (): string => {
    const contentType = result.type || result.contentType;

    // Handle legacy API structure
    if (result.view_node) {
      const path = locale === 'en' ? result.view_node.slice(3) : result.view_node;
      return `/${CONTENT_TYPE_ROUTES[contentType] || 'articles'}${path}`;
    }

    // Determine route based on category context
    const categoryContext = getCategoryContext(result);

    let routeBase: string;
    switch (categoryContext) {
      case 'ashtothram':
        routeBase = 'ashtothram';
        break;
      case 'sahasranamavali':
        routeBase = 'sahasranamavali';
        break;
      case 'sahasranamam':
        routeBase = 'sahasranamam';
        break;
      case 'bhajans':
        routeBase = 'bhajans';
        break;
      case 'bhakthi-songs':
        routeBase = 'bhakthi-songs';
        break;
      default:
        if (contentType?.toLowerCase() === 'article') {
          routeBase = 'articles';
        } else {
          routeBase = 'stotras'; // Default for general stotras
        }
        break;
    }

    return `/${routeBase}/${result.canonicalSlug}`;
  };

  // Get display title (supports both old and new API structure)
  const getDisplayTitle = (): string => {
    return result.field_display_title || result.title || 'Untitled';
  };

  const ytImage = result.videoId ? `https://i.ytimg.com/vi/${result.videoId}/hq720.jpg` : null;

  const stotraImage = result.imageUrl ? result.imageUrl : ytImage;

  // Get category label for display based on content type and category IDs
  const getCategoryLabel = (): string => {
    const contentType = result.type || result.contentType;

    // For articles, always show "Article"
    if (contentType?.toLowerCase() === 'article') {
      return 'articles';
    }

    // For stotras, determine the specific category based on category IDs
    if (result.categories && Array.isArray(result.categories)) {
      for (const category of result.categories) {
        const categoryId = typeof category === 'string' ? category : '';
        // Check for specific category IDs
        if (categoryId === CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI) {
          return 'ashtottara_shatanamavali';
        }
        if (categoryId === CATEGORY_IDS.SAHASRANAMAVALI) {
          return 'sahasranamavali';
        }
        if (categoryId === CATEGORY_IDS.SAHASRANAMAM) {
          return 'sahasranamam';
        }
        if (categoryId === CATEGORY_IDS.BHAJANS) {
          return 'bhajans';
        }
        if (categoryId === CATEGORY_IDS.BHAKTHI_SONGS) {
          return 'bhakthi_songs';
        }
      }
    }

    // Fallback: Check slug patterns for category identification
    const slug = result.canonicalSlug?.toLowerCase() || '';
    if (slug.includes('ashtottara') || slug.includes('ashtothram')) {
      return 'ashtottara_shatanamavali';
    }
    if (slug.includes('sahasranamavali') && !slug.includes('sahasranamam')) {
      return 'sahasranamavali';
    }
    if (slug.includes('sahasranamam') || slug.includes('sahasranama-stotram')) {
      return 'sahasranamam';
    }

    // Default fallback for stotras
    return 'stotras';
  };

  return (
    <>
      <div className="position-relative">
        <Link
          href={getContentPath()}
          className="position-relative d-flex align-items-center rounded-10 pl-lg-13 pr-lg-11 py-lg-6 job-card-hover gr-hover-shadow-5 mb-3 bg-white py-3"
        >
          <div className="square-50 mr-6 ms-3">
            {stotraImage ? (
              <Image
                className="rounded object-cover"
                src={stotraImage}
                alt={getDisplayTitle()}
                width={140}
                height={79}
              />
            ) : (
              <div className="video-placeholder d-flex align-items-center justify-content-center position-relative">
                <div className="video-title-overlay position-absolute end-0 start-0 p-3">
                  <span className="fw-bold text-white">{getDisplayTitle()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="texts left-container px-3">
            <h3 className="text-primary gr-text-6 fw-bold">{getDisplayTitle()}</h3>
            <p className="text-dark mb-0">
              {(t.nav as any)[getCategoryLabel()] || getCategoryLabel()}
            </p>
          </div>
          <div className="card-icon text-dark">
            <i className="fas fa-arrow-right gr-text-8 text-storm my-2"></i>
          </div>
        </Link>
      </div>
    </>
  );
};

export default SearchResultCard;
