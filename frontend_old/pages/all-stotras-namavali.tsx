import Layout from '@/components/Layout/Layout';
import StotraCard from '@/components/StotraCard';
import StotrasPageSidebar from '@/components/StotrasPageSidebar';
import { CATEGORY_IDS, ITEMS_PER_PAGE } from '@/constants/stotras';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import { useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

// Response interface for API
interface StotrasResponse {
  stotras: Array<{
    canonicalSlug: string;
    contentType: string;
    status: string;
    imageUrl?: string | null;
    categories?: Array<{
      _id: string;
      name: string;
      slug: string;
    }>;
    translations: {
      en?: any;
      te?: any;
      hi?: any;
      kn?: any;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    language: string;
    contentType: string;
  };
}

// Helper function to determine category context based on stotra categories or slug patterns
const getCategoryContext = (
  stotra: any
): 'ashtothram' | 'sahasranamavali' | 'sahasranamam' | 'bhajans' | 'bhakthisongs' | 'default' => {
  // First try to detect based on categories if available
  if (stotra.categories) {
    const { typeIds = [], devaIds = [], byNumberIds = [] } = stotra.categories;

    // Check all category ID arrays for specific category IDs
    const allCategoryIds = [...typeIds, ...devaIds, ...byNumberIds];

    // Check for Ashtottara Shatanamavali category
    if (allCategoryIds.includes(CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI)) {
      return 'ashtothram';
    }

    // Check for Sahasranamavali category
    if (allCategoryIds.includes(CATEGORY_IDS.SAHASRANAMAVALI)) {
      return 'sahasranamavali';
    }

    // Check for Sahasranamam category
    if (allCategoryIds.includes(CATEGORY_IDS.SAHASRANAMAM)) {
      return 'sahasranamam';
    }

    // Check for Sahasranamam category
    if (allCategoryIds.includes(CATEGORY_IDS.BHAJANS)) {
      return 'bhajans';
    }

    // Check for Sahasranamam category
    if (allCategoryIds.includes(CATEGORY_IDS.BHAKTHI_SONGS)) {
      return 'bhakthisongs';
    }
  }

  // Fallback: Detect based on canonicalSlug patterns when categories is null/empty
  const slug = stotra.canonicalSlug?.toLowerCase() || '';

  // Check for Ashtottara patterns in slug
  if (slug.includes('ashtottara') || slug.includes('ashtothram')) {
    return 'ashtothram';
  }

  // Check for Sahasranamavali patterns in slug (but not sahasranamam)
  if (slug.includes('sahasranamavali') && !slug.includes('sahasranamam')) {
    return 'sahasranamavali';
  }

  // Check for Sahasranamam patterns in slug
  if (slug.includes('sahasranamam') || slug.includes('sahasranama-stotram')) {
    return 'sahasranamam';
  }

  // Default to 'default' for Hymns/Prayers or other categories (routes to /stotras/[slug])
  return 'default';
};

export default function AllStotras() {
  const { t, locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/all-stotras-namavali', locale);

  const [stotras, setStotras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    fetchStotras(1, true);
  }, [locale]); // Re-fetch when locale changes

  const fetchStotras = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
      const apiUrl = `${backendUrl}/rest/stotras?lang=${locale}&page=${page}&limit=${ITEMS_PER_PAGE}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch stotras');
      }
      const data: StotrasResponse = await response.json();

      if (reset) {
        setStotras(data.stotras);
      } else {
        // Only add new items that don't already exist
        setStotras(prev => {
          const existingSlugs = new Set(prev.map(s => s.canonicalSlug));
          const newStotras = data.stotras.filter(s => !existingSlugs.has(s.canonicalSlug));
          return [...prev, ...newStotras];
        });
      }

      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchStotras(nextPage, false);
  };
  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <h1 className="text-center">{t.stotra.stotras}</h1>
            <p className="text-muted text-center">{t.stotra.all_stotras_desc}</p>

            {loading && (
              <div className="py-4 text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <>
                <Row className="g-4 mt-3">
                  {stotras.map(stotra => {
                    const categoryContext = getCategoryContext(stotra);
                    return (
                      <StotraCard
                        key={stotra.canonicalSlug}
                        stotra={stotra}
                        locale={locale}
                        showCanonicalSlug={true}
                        categoryContext={categoryContext}
                      />
                    );
                  })}
                </Row>

                {pagination && pagination.hasNext && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="primary"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-4 py-2"
                    >
                      {loadingMore ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                    {pagination && (
                      <div className="text-muted small mt-2">
                        Showing {stotras.length} of {pagination.total} results
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!loading && !error && stotras.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-muted">No stotras available at the moment.</p>
              </div>
            )}
          </div>
        </Col>
        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <StotrasPageSidebar
            pagination={pagination}
            stotrasLength={stotras.length}
            currentPage={currentPage}
          />
        </Col>
      </Row>
    </Layout>
  );
}
