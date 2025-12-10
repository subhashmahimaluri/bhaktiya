import EclipseCard from '@/components/EclipseCard';
import EclipseDetailSidebar from '@/components/EclipseDetailSidebar';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import { useLocation } from '@/context/LocationContext';
import { EclipseInfo, useEclipsesApi } from '@/hooks/useEclipsesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { isYearNavigationDisabled } from '@/utils/eclipseUtils';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap';

interface EclipseYearPageProps {
  year: number;
}

export default function EclipseYearPage({ year: initialYear }: EclipseYearPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { city, country, timezone, lat, lng } = useLocation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(initialYear);
  const [selectedEclipse, setSelectedEclipse] = useState<EclipseInfo | null>(null);

  // Use the eclipse API hook
  const { data, isLoading, isError, error, refetch } = useEclipsesApi({
    startDate: new Date(year, 0, 1), // January 1st of the year
    endDate: new Date(year, 11, 31), // December 31st of the year
    eclipseType: 'both',
    enabled: true,
    retryOnMount: true,
  });

  // Update year when route changes
  useEffect(() => {
    if (router.query.year && typeof router.query.year === 'string') {
      const routeYear = parseInt(router.query.year);
      if (!isNaN(routeYear) && routeYear !== year) {
        setYear(routeYear);
      }
    }
  }, [router.query.year]);

  // Use the original EclipseInfo objects directly from the API
  const eclipses: EclipseInfo[] = data?.eclipses || [];

  return (
    <Layout>
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
            <LocationAccordion city={city} country={country} />
          </div>

          {/* Eclipse Detail Sidebar */}
          <EclipseDetailSidebar
            selectedEclipse={selectedEclipse}
            timezone={timezone}
            city={city}
            country={country}
          />
        </Col>
      </Row>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { year } = context.params!;
  const parsedYear = parseInt(year as string);

  // Validate year
  if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      year: parsedYear,
    },
  };
};
