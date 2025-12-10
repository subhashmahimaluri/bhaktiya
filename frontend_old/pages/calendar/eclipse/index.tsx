import EclipseCard from '@/components/EclipseCard';
import EclipseDetailSidebar from '@/components/EclipseDetailSidebar';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import { useLocation } from '@/context/LocationContext';
import { EclipseInfo, useEclipsesApi } from '@/hooks/useEclipsesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { isYearNavigationDisabled } from '@/utils/eclipseUtils';
import { getMetaDataByPath } from '@/utils/seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap';

export default function Eclipse() {
  const { t, locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/calendar/eclipse', locale);
  const router = useRouter();
  const { city, country, timezone, lat, lng } = useLocation();
  const defaultYear = 2025; // Default to 2025 instead of current year
  const [year, setYear] = useState(defaultYear);
  const [selectedEclipse, setSelectedEclipse] = useState<EclipseInfo | null>(null);

  // Calculate date range for the selected year
  const startDate = useMemo(() => new Date(year, 0, 1), [year]);
  const endDate = useMemo(() => new Date(year, 11, 31), [year]);

  // Use the eclipse API hook
  const { data, isLoading, isError, error, refetch } = useEclipsesApi({
    startDate,
    endDate,
    eclipseType: 'both',
    enabled: true,
    retryOnMount: true,
  });

  const eclipses = data?.eclipses || [];

  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            {/* Header with Year Navigation and Location Info */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-0">
                  {t.eclipse.eclipses} {year}
                </h1>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  href={`/calendar/eclipse/${year - 1}`}
                  className={`btn btn-outline-primary btn-sm ${isYearNavigationDisabled(year - 1, isLoading) ? 'disabled' : ''}`}
                  aria-disabled={isYearNavigationDisabled(year - 1, isLoading)}
                >
                  ← {year - 1}
                </Link>
                <span className="fw-bold px-3">{year}</span>
                <Link
                  href={`/calendar/eclipse/${year + 1}`}
                  className={`btn btn-outline-primary btn-sm ${isYearNavigationDisabled(year + 1, isLoading) ? 'disabled' : ''}`}
                  aria-disabled={isYearNavigationDisabled(year + 1, isLoading)}
                >
                  {year + 1} →
                </Link>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="py-4 text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading eclipses...</span>
                </Spinner>
                <p className="mt-2">Loading eclipses for {year}...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => refetch()}>
                  Try Again
                </Button>
              </Alert>
            )}

            {/* Eclipse List */}
            {!isLoading && !isError && (
              <>
                {eclipses.length === 0 ? (
                  <Alert variant="info">
                    <Alert.Heading>No Eclipses Found</Alert.Heading>
                    <p>No solar or lunar eclipses were found for the year {year}.</p>
                  </Alert>
                ) : (
                  <div className="eclipse-list">
                    <p className="text-muted mb-3">
                      {t.eclipse.found_eclipses
                        .replace('{count}', eclipses.length.toString())
                        .replace('{year}', year.toString())
                        .replace('{plural}', eclipses.length !== 1 ? 's' : '')}
                    </p>

                    <Row>
                      {eclipses.map((eclipse: EclipseInfo, index: number) => (
                        <EclipseCard
                          key={`${eclipse.type}-${eclipse.jd}-${index}`}
                          eclipse={eclipse}
                          locale={router.locale || 'en'}
                          timezone={timezone}
                        />
                      ))}
                    </Row>
                  </div>
                )}
              </>
            )}
          </div>
        </Col>

        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          {/* Location Selection */}
          <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
            <LocationAccordion city={city || 'Hyderabad'} country={country || 'India'} />
          </div>

          {/* Eclipse Detail Sidebar */}
          <EclipseDetailSidebar
            selectedEclipse={selectedEclipse}
            timezone={timezone || 'Asia/Calcutta'}
            city={city || 'Hyderabad'}
            country={country || 'India'}
          />
        </Col>
      </Row>
    </Layout>
  );
}
