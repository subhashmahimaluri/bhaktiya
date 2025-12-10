import Layout from '@/components/Layout/Layout';
import SearchBox from '@/components/Layout/SearchBox';
import SearchResultCard from '@/components/SearchResultCard';
import SearchSidebar from '@/components/SearchSidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchPageProps, SearchResult } from '@/types/search';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner } from 'react-bootstrap';

const SearchPage: NextPage<SearchPageProps> = ({
  searchResults = [],
  query = '',
  category = 'All',
  totalCount = 0,
  error,
  metaTitle,
  metaDesc,
}) => {
  const router = useRouter();
  const { locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(searchResults);

  // Handle route change loading states - simplified approach
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };

    const handleComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Update results when props change and ensure loading is cleared
  useEffect(() => {
    setResults(searchResults);
    // Always clear loading when new data arrives
    setLoading(false);
  }, [searchResults, query, category]);

  // Generate page title and description
  const pageTitle = metaTitle || `Search Results for &quot;${query}&quot; - SS Bhakthi`;
  const pageDescription =
    metaDesc ||
    `Search results for ${query} in ${category === 'All' ? 'all categories' : category}. Find Stotras, Sahasranamam, Articles and more devotional content.`;

  // Handle empty state
  const renderEmptyState = () => (
    <div className="text-center">
      <div className="rounded border bg-white py-5 shadow-sm">
        <i className="fas fa-search fa-3x text-muted mb-3"></i>
        <h2 className="h4 text-primary mb-3">No Results Found</h2>
        {query ? (
          <div>
            <p className="text-muted mb-3">
              No results found for &quot;<strong>{query}</strong>&quot; in{' '}
              <strong>{category === 'All' ? 'all categories' : category}</strong>
            </p>
            <div className="search-suggestions">
              <h5 className="text-dark mb-3">Try these suggestions:</h5>
              <ul className="list-unstyled d-inline-block text-start">
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  Check your spelling or try different keywords
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  Use broader search terms
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  Try searching in all categories
                </li>
                <li className="mb-2">
                  <i className="fas fa-lightbulb text-warning me-2"></i>
                  Browse our categories in the sidebar
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-muted">Enter a search term or select a category to find content</p>
        )}
      </div>
    </div>
  );

  // Handle error state
  const renderErrorState = () => (
    <div className="py-5 text-center">
      <Alert variant="danger" className="d-inline-block">
        <i className="fas fa-exclamation-triangle me-2"></i>
        <strong>Search Error:</strong> {error}
      </Alert>
    </div>
  );

  // Handle loading state
  const renderLoadingState = () => (
    <div className="py-5 text-center">
      <Spinner animation="border" variant="primary" className="me-2" />
      <span>Searching...</span>
    </div>
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        {query && (
          <meta
            name="keywords"
            content={`${query}, stotras, bhakthi, devotional, hindu, prayers`}
          />
        )}
      </Head>

      <Layout title={pageTitle} description={pageDescription}>
        <div className="search-page bg-light min-vh-100 py-4">
          <Container className="py-3">
            <Row className="pt-5">
              {/* Search Bar Section */}
              <div className="search-header mb-4 pt-5">
                <div className="rounded bg-white p-4 shadow-sm">
                  <SearchBox layout="horizontal" />
                </div>
              </div>
            </Row>

            {/* Results Header */}
            {(query || category !== 'All') && !error && (
              <div className="results-header mb-4 rounded bg-white p-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="h4 text-primary mb-1">Search Results</h1>
                    <p className="text-muted mb-0">
                      {totalCount} results found
                      {query && (
                        <span>
                          {' '}
                          for &quot;<strong>{query}</strong>&quot;
                        </span>
                      )}
                      {category !== 'All' && (
                        <span>
                          {' '}
                          in <strong>{category}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                  {loading && <Spinner animation="border" size="sm" variant="primary" />}
                </div>
              </div>
            )}

            {/* Main Content */}
            <Row className="g-4">
              {/* Results Column */}
              <Col xl={8} lg={8} md={12}>
                <div className="search-results">
                  {error ? (
                    renderErrorState()
                  ) : loading ? (
                    renderLoadingState()
                  ) : results.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="results-list">
                      {results.map((result, index) => (
                        <SearchResultCard
                          key={result.id || result.nid || index}
                          result={result}
                          locale={locale}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Col>

              {/* Sidebar Column */}
              <Col xl={4} lg={4} md={12}>
                <SearchSidebar query={query} category={category} totalResults={totalCount} />
              </Col>
            </Row>
          </Container>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async context => {
  const { query, locale = 'en' } = context;
  const keyword = (query.keyword as string) || '';
  const category = (query.category as string) || 'All';

  try {
    // Directly perform GraphQL search without HTTP overhead
    const graphqlEndpoint =
      process.env.BACKEND_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL ||
      'http://localhost:4000/graphql';

    const searchQuery = `
      query SearchContent($filters: SearchFilters!, $limit: Int!, $offset: Int!) {
        search(filters: $filters, limit: $limit, offset: $offset) {
          results {
            id
            contentType
            canonicalSlug
            title
            description
            imageUrl
            categories
            createdAt
            updatedAt
          }
          totalCount
          hasMore
        }
      }
    `;

    const variables = {
      filters: {
        keyword: keyword || undefined,
        category: category !== 'All' ? category : undefined,
        lang: locale,
      },
      limit: 20,
      offset: 0,
    };

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL API returned ${response.status}`);
    }

    const responseData = await response.json();

    // Handle Apollo Server response format
    let data;
    if (responseData.body?.singleResult?.data) {
      data = responseData.body.singleResult.data;
    } else if (responseData.data) {
      data = responseData.data;
    } else {
      throw new Error('Invalid GraphQL response format');
    }

    if (!data?.search) {
      throw new Error('No search results returned from GraphQL');
    }

    // Transform GraphQL results to match frontend interface
    const transformedResults: SearchResult[] = data.search.results.map((item: any) => ({
      id: item.id,
      canonicalSlug: item.canonicalSlug,
      contentType: item.contentType.toLowerCase(),
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      categories: item.categories || [],
      status: 'published',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const searchData = {
      results: transformedResults,
      totalCount: data.search.totalCount,
      hasMore: data.search.hasMore,
    };

    // Generate meta information
    const metaTitle = keyword
      ? `Search: &quot;${keyword}&quot; - SS Bhakthi`
      : 'Search - SS Bhakthi';

    const lang = locale === 'en' ? 'English' : 'Telugu';
    const metaDesc = keyword
      ? `Search results for &quot;${keyword}" in ${category === 'All' ? 'all categories' : category}. Find Stotras, Sahasranamam, Ashtottara, Sahasranamavali, and Bhakthi articles in ${lang}.`
      : `Search all Stotras, Sahasranamam, Ashtottara, Sahasranamavali, and Bhakthi articles in ${lang}. Discover devotional content for your spiritual journey.`;

    return {
      props: {
        searchResults: searchData.results,
        query: keyword,
        category,
        totalCount: searchData.totalCount,
        metaTitle,
        metaDesc,
      },
    };
  } catch (error) {
    console.error('Search page error:', error);

    return {
      props: {
        searchResults: [],
        query: keyword,
        category,
        totalCount: 0,
        error: error instanceof Error ? error.message : 'Search failed',
        metaTitle: 'Search Error - SS Bhakthi',
        metaDesc: 'An error occurred while searching. Please try again.',
      },
    };
  }
};

export default SearchPage;
