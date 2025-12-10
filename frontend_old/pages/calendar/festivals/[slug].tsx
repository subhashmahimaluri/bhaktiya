import CommentSection from '@/components/comments/CommentSection';
import ErrorBoundary from '@/components/ErrorBoundary';
import FestivalDetails from '@/components/FestivalDetails';
import FestivalHeader from '@/components/FestivalHeader';
import FestivalInfoBlock from '@/components/FestivalInfoBlock';
import FestivalYearNav from '@/components/FestivalYearNav';
import Layout from '@/components/Layout/Layout';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useFestivalInfoBlock } from '@/hooks/useFestivalInfoBlock';
import { useTranslation } from '@/hooks/useTranslation';
import { getInitialYearFromParam, isValidFestivalData } from '@/utils/festivalPageUtils';
import { formatDateForPanchangam } from '@/utils/festivalUtils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

interface FestivalsPageProps {
  initialData?: any;
  initialError?: string;
}

/**
 * Festival Page Content Component
 * Displays detailed festival information with year navigation and localized content
 */
function FestivalPageContent({ initialData, initialError }: FestivalsPageProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { city, country } = useLocation();

  // State management
  const [year, setYear] = useState(() => getInitialYearFromParam(yearParam));
  const [currentLanguage, setCurrentLanguage] = useState<string>(router.locale || 'en');

  // Sync year with URL parameter
  useEffect(() => {
    const newYear = getInitialYearFromParam(yearParam);
    if (newYear !== year) {
      setYear(newYear);
    }
  }, [yearParam, year]);

  // Sync language with router
  useEffect(() => {
    if (router.isReady) {
      setCurrentLanguage(router.locale || 'en');
    }
  }, [router.isReady, router.locale]);

  // Fetch festival data
  const {
    festivals,
    loading: festivalLoading,
    error: festivalError,
  } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    undefined, // priorityFilter
    typeof slug === 'string' ? slug : undefined, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  // Fetch info block
  const { infoBlock, loading: blockLoading, error: blockError } = useFestivalInfoBlock(slug);

  // Memoized values
  const filteredFestival = festivals[0];

  const festivalDisplayName = useMemo(() => {
    if (!slug || !filteredFestival) return '';
    return locale === 'te'
      ? filteredFestival.festival.festival_te
      : filteredFestival.festival.festival_en;
  }, [slug, locale, filteredFestival]);

  const seoTitle = useMemo(() => {
    return `${festivalDisplayName} ${year} ${t.festivals.seo_title_sufix}`;
  }, [festivalDisplayName, year]);

  const seoDescription = useMemo(() => {
    return `${festivalDisplayName} ${year} - Hindu festival date, time, tithi, and muhurta information with panchangam`;
  }, [festivalDisplayName, year]);

  // ... existing code ...// Render loading state while router is loading or slug is not yet available
  if (!router.isReady || !slug || festivalLoading) {
    return (
      <Layout>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 panchangam-block festival-page px-md-10 bg-white px-5 py-3 text-black">
              <div className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  // Render error state if API failed
  if (
    festivalError ||
    !filteredFestival ||
    (filteredFestival && !filteredFestival.festival.festival_url)
  ) {
    return (
      <Layout>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 panchangam-block festival-page px-md-10 bg-white px-5 py-3 text-black">
              <div className="alert alert-danger mt-3" role="alert">
                <h5 className="alert-heading">Unable to load festival data</h5>
                <p>{festivalError}</p>
              </div>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block festival-page px-md-10 bg-white px-5 py-3 text-black">
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb py-3">
                <li className="breadcrumb-item">
                  <Link href="/calendar/festivals" className="text-decoration-none">
                    {t.nav.festivals}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {festivalDisplayName}
                </li>
              </ol>
            </nav>

            {/* Page Title */}
            <div className="mb-3">
              <h1 className="mb-0">
                {festivalDisplayName} {year}
              </h1>
            </div>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${festivalDisplayName} ${year}`}
              description={`${festivalDisplayName} dates, times, and panchang information for ${year}`}
            />

            {/* Year Navigation and Location */}
            <FestivalYearNav
              slug={slug}
              year={year}
              city={city}
              country={country}
              isLoading={festivalLoading}
            />

            {/* Festival Header with Date and Image */}
            <FestivalHeader
              festivalName={festivalDisplayName}
              city={city}
              country={country}
              date={filteredFestival?.date}
              image={filteredFestival?.festival?.image}
              locale={currentLanguage}
            />

            {/* Festival Details */}
            {isValidFestivalData(filteredFestival) && (
              <FestivalDetails
                festivalName={festivalDisplayName}
                date={filteredFestival.date}
                locale={currentLanguage}
                tithiData={{
                  masaNumber: filteredFestival.festival.telugu_month,
                  tithiNumber: filteredFestival.festival.tithi,
                  tithiStarts: filteredFestival.festival.tithiStarts,
                  tithiEnds: filteredFestival.festival.tithiEnds,
                }}
                muhurthaStart={
                  filteredFestival.muhurta_start
                    ? new Date(filteredFestival.muhurta_start)
                    : undefined
                }
                muhurthaEnd={
                  filteredFestival.muhurta_end ? new Date(filteredFestival.muhurta_end) : undefined
                }
                calculationType={filteredFestival.calculationType}
                translationKeys={{
                  tithi_start: t.calendar.tithi_start,
                  tithi_end: t.calendar.tithi_end,
                  start: t.festivals.begins,
                  end: t.festivals.ends,
                  muhurtha: t.festivals.muhurtha,
                  shivratri_muhurtha: t.festivals.shivratri_muhurtha,
                }}
              />
            )}

            {filteredFestival?.date && (
              <div className="pull-right pt-3 text-center">
                <Link
                  href={`/panchangam/${formatDateForPanchangam(filteredFestival?.date)}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  {festivalDisplayName} {t.calendar.day_panchangam} →
                </Link>
              </div>
            )}

            {/* Info Block */}
            {infoBlock && (
              <FestivalInfoBlock
                imageUrl={infoBlock.imageUrl}
                title={infoBlock.title}
                content={infoBlock.content}
                videoId={infoBlock.videoId}
                currentLanguage={currentLanguage}
                error={blockError}
              />
            )}

            {/* Comments Section */}
            {typeof slug === 'string' && (
              <CommentSection contentType="festival" canonicalSlug={slug} />
            )}
          </div>
        </Col>

        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
            <UpcomingEventsV2 />
          </div>
        </Col>
      </Row>
    </Layout>
  );
}

/**
 * Festival Page Component with Error Boundary
 * Wraps content with error handling for graceful failure recovery
 */
export default function FestivalsPage(props: FestivalsPageProps) {
  return (
    <ErrorBoundary>
      <FestivalPageContent {...props} />
    </ErrorBoundary>
  );
}
