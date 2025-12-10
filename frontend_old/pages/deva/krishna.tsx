import DevaPageHeader from '@/components/DevaPageHeader';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';
import Layout from '@/components/Layout/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadMoreButton from '@/components/LoadMoreButton';
import StotrasGrid from '@/components/StotrasGrid';
import StotrasPageSidebar from '@/components/StotrasPageSidebar';
import { DEVA_IDS } from '@/constants/stotras';
import { useStotras } from '@/hooks/useStotras';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import { Col, Row } from 'react-bootstrap';

export default function AyyappaPage() {
  const { t, locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/deva/krishna', locale);

  const { stotras, loading, loadingMore, error, pagination, currentPage, handleLoadMore } =
    useStotras({ categoryId: DEVA_IDS.KRISHNA, locale });
  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <DevaPageHeader title={t.deva.krishna} subtitle={`${t.deva.krishna} ${t.deva.desc}`} />

            {loading && <LoadingSpinner />}

            {error && <ErrorMessage message={error} />}

            {!loading && !error && (
              <>
                <StotrasGrid stotras={stotras} locale={locale} />

                {pagination && pagination.hasNext && (
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    loading={loadingMore}
                    currentCount={stotras.length}
                    totalCount={pagination.total}
                  />
                )}
              </>
            )}

            {!loading && !error && stotras.length === 0 && <EmptyState />}
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
