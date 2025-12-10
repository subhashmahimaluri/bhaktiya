import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateLocalized } from '@/utils/dateFormatUtils';
import { getLocalizedImagePath } from '@/utils/festivalUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { getNextMonth, getPreviousMonth, getTranslatedMonthName } from '@/utils/monthUtils';
import { getMetaDataByPath } from '@/utils/seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

interface FestivalsMonthTemplateProps {
  month: number; // 0-11 (January-December)
  monthName: string;
  metaPath?: string;
  priorityFilter?: number | number[]; // Optional priority filter
}

export default function FestivalsMonthTemplate({
  month,
  monthName,
  metaPath = '/calendar/festivals',
  priorityFilter,
}: FestivalsMonthTemplateProps) {
  const router = useRouter();
  const { year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country, lat, lng } = useLocation();
  const { title: defaultTitle, description: defaultDescription } = getMetaDataByPath(
    metaPath,
    locale
  );

  const getInitialYear = () => {
    if (yearParam && typeof yearParam === 'string') {
      const parsedYear = parseInt(yearParam);
      if (!isNaN(parsedYear)) {
        return parsedYear;
      }
    }
    return 2025; // Default to 2025
  };

  const [year, setYear] = useState(getInitialYear());

  useMemo(() => {
    if (yearParam && typeof yearParam === 'string') {
      const parsedYear = parseInt(yearParam);
      if (!isNaN(parsedYear) && parsedYear !== year) {
        setYear(parsedYear);
      }
    }
  }, [yearParam, year]);

  const {
    festivals,
    loading: festivalLoading,
    error: festivalErrorMessage,
  } = useAllFestivalsV2(
    year,
    month, // monthFilter
    priorityFilter, // priorityFilter
    undefined, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  const festivalError = Boolean(festivalErrorMessage);

  // Apply priority filter if provided
  const filteredFestivals = useMemo(() => {
    if (priorityFilter !== undefined) {
      const priorityArray = Array.isArray(priorityFilter) ? priorityFilter : [priorityFilter];
      return festivals.filter(festivalOcc => {
        const festivalPriority = parseInt(festivalOcc.festival.telugu_en_priority || '999');
        return priorityArray.includes(festivalPriority);
      });
    }
    return festivals;
  }, [festivals, priorityFilter]);

  const displayMonthName = getTranslatedMonthName(month - 1, t);

  const seoTitle = useMemo(() => {
    return `${displayMonthName} ${t.festivals.title} ${year}`;
  }, [displayMonthName, t.festivals.title, year]);

  const seoDescription = useMemo(() => {
    return `${defaultDescription} for ${displayMonthName} ${year}`;
  }, [defaultDescription, displayMonthName, year]);

  // Get Tithi information for a festival
  const getFestivalTithiInfo = (festivalOcc: any) => {
    if (!lat || !lng) return null;

    try {
      // Get all tithis for the festival date
      const allTithis = getAllAngasForDay(festivalOcc.date, lat, lng, 'tithi');

      // Find matching tithi by index number (tithi - 1 for Chaturdashi)
      const festivalTithiIno = parseInt(festivalOcc.festival.tithi) - 1;
      const matchedTithi = allTithis.find(t => t.ino === festivalTithiIno);

      if (!matchedTithi) {
        console.warn(
          `No tithi found for festival ${festivalOcc.festival.festival_name} with tithi index ${festivalTithiIno}`
        );
        return null;
      }

      return {
        masa: matchedTithi.masa,
        masa_te: matchedTithi.masa_te,
        tithiName: matchedTithi.name,
        paksha: matchedTithi.paksha,
        tithiStart: matchedTithi.start,
        tithiEnd: matchedTithi.end,
      };
    } catch (err) {
      console.error('Error calculating panchang for festival:', festivalOcc, err);
      return null;
    }
  };

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 festivals-page bg-white px-4 py-3 text-black">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb py-3">
                <li className="breadcrumb-item">
                  <Link href="/calendar/festivals" className="text-decoration-none">
                    {t.nav.festivals}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {displayMonthName} {t.festivals.title} {year}
                </li>
              </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0 mt-2 text-center">
                  {displayMonthName} {t.festivals.title} {year}
                </h1>
                <p className="text-center">{t.panchangam.telugu_festivals_sub_title}</p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${displayMonthName} ${t.festivals.title} ${year}`}
              description={`${displayMonthName} festivals and celebrations for ${year}`}
            />
            <Row className="align-items-center py-3">
              <Col lg="6" md="6" sm="12" className="mb-md-0 mb-4">
                <LocationAccordion city={city} country={country} />
              </Col>
              <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
                <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
                  <Link
                    href={`/calendar/festivals/${monthName.toLowerCase()}?year=${year - 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ← {year - 1}
                  </Link>
                  <span className="fw-bold px-3">{year}</span>
                  <Link
                    href={`/calendar/festivals/${monthName.toLowerCase()}?year=${year + 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {year + 1} →
                  </Link>
                </div>
              </Col>
            </Row>
            {/* Display festivals for the specific month */}
            <div className="festival-grid-container">
              {filteredFestivals.length > 0 ? (
                <section className="festival-month-section">
                  <h2 className="month-title">
                    {displayMonthName} {year}
                  </h2>
                  <div className="festival-month-container">
                    <div className="festival-grid">
                      {filteredFestivals.map((festivalOcc, idx) => {
                        const tithiInfo = getFestivalTithiInfo(festivalOcc);
                        const hasUrl =
                          festivalOcc.festival.festival_url &&
                          festivalOcc.festival.festival_url.trim() !== '';

                        const festivalContent = (
                          <>
                            {festivalOcc.festival.image ? (
                              <img
                                alt=""
                                className="festival-image"
                                src={getLocalizedImagePath(festivalOcc.festival.image, locale)}
                              />
                            ) : (
                              <img
                                alt=""
                                className="festival-image"
                                src="/images/festivals/festival_placeholder.png"
                              />
                            )}
                            <div className="festival-details">
                              <h3
                                className={`festival-name ${hasUrl ? 'festival-name-link' : 'festival-name-no-link'}`}
                              >
                                {locale === 'te'
                                  ? festivalOcc.festival.festival_te
                                  : festivalOcc.festival.festival_en}
                              </h3>
                              <p className="festival-date">
                                {formatDateLocalized(festivalOcc.date, locale, t)}
                              </p>
                              {tithiInfo && (
                                <p className="festival-tithi">
                                  {locale === 'te' ? tithiInfo.masa_te : `${tithiInfo.masa} `}{' '}
                                  {tithiInfo.tithiName !== 'Amavasya' &&
                                    tithiInfo.tithiName !== 'Pournami' && (
                                      <>
                                        {
                                          t.panchangam[
                                            tithiInfo.paksha as keyof typeof t.panchangam
                                          ]
                                        }{' '}
                                      </>
                                    )}
                                  {t.panchangam[tithiInfo.tithiName as keyof typeof t.panchangam]}
                                </p>
                              )}
                            </div>
                          </>
                        );

                        return hasUrl ? (
                          <a
                            key={idx}
                            className="festival-item festival-item-link"
                            href={festivalOcc.festival.festival_url}
                          >
                            {festivalContent}
                          </a>
                        ) : (
                          <div key={idx} className="festival-item">
                            {festivalContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ) : (
                // Add Pagination
                <Row className="mt-4">
                  <Col className="py-5 text-center">
                    <p className="text-muted">
                      {festivalLoading
                        ? 'Loading festivals...'
                        : `No festivals found for ${monthName} ${year}.`}
                    </p>
                  </Col>
                </Row>
              )}

              {/* Pagination Navigation */}
              {filteredFestivals.length > 0 && (
                <Row className="mt-4">
                  <Col className="py-3">
                    <nav aria-label="Month navigation">
                      <ul className="pagination d-flex justify-content-between">
                        <li className="page-item me-auto">
                          <a
                            className="page-link btn-outline-primary"
                            href={`/calendar/festivals/${getPreviousMonth(month, year).monthName}?year=${getPreviousMonth(month, year).year}`}
                            aria-label="Previous month"
                          >
                            «{' '}
                            {
                              t.panchangam[
                                getPreviousMonth(month, year).monthName as keyof typeof t.panchangam
                              ]
                            }{' '}
                            {t.festivals.title}
                          </a>
                        </li>

                        <li className="page-item ms-auto">
                          <a
                            className="page-link btn-outline-primary"
                            href={`/calendar/festivals/${getNextMonth(month, year).monthName}?year=${getNextMonth(month, year).year}`}
                            aria-label="Next month"
                          >
                            {
                              t.panchangam[
                                getNextMonth(month, year).monthName as keyof typeof t.panchangam
                              ]
                            }{' '}
                            {t.festivals.title} »
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </Col>
                </Row>
              )}
            </div>
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
