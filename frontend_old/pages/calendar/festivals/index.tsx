import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateLocalized } from '@/utils/dateFormatUtils';
import { getLocalizedImagePath } from '@/utils/festivalUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { getMonthName, getTranslatedMonthName } from '@/utils/monthUtils';
import { getMetaDataByPath } from '@/utils/seo';
import { interpolate } from '@/utils/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function Festivals() {
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country, lat, lng } = useLocation();
  const { title: defaultTitle, description: defaultDescription } = getMetaDataByPath(
    '/calendar/festivals',
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
  }, [yearParam, year, t.festivals.title, defaultDescription]);

  const {
    festivals,
    loading: festivalLoading,
    error: festivalErrorMessage,
  } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    [1, 2, 3], // priorityFilter
    undefined, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  const festivalError = Boolean(festivalErrorMessage);

  // Use festivals directly since they're already filtered by priority in the hook
  const filteredFestivals = festivals;

  // Group festivals by month
  const festivalsByMonth = useMemo(() => {
    if (!filteredFestivals || filteredFestivals.length === 0) return {};

    const grouped: { [key: number]: typeof filteredFestivals } = {};

    filteredFestivals.forEach(festivalOcc => {
      const month = festivalOcc.date.getUTCMonth(); // 0-11 (January-December) using UTC to avoid timezone shift
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(festivalOcc);
    });

    return grouped;
  }, [filteredFestivals]);

  const seoTitle = useMemo(() => {
    return `${t.festivals.title} ${year}`;
  }, [t.festivals.title, year]);

  const seoDescription = useMemo(() => {
    return `${defaultDescription} for ${year}`;
  }, [defaultDescription, year]);

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

  // Use existing utility for date formatting

  // Get month name - using utility function

  // Component for displaying Tithi information
  const TithiInfo = ({ festival, locale, t }: { festival: any; locale: string; t: any }) => {
    // Check if paksha should be shown (not for Amavasya and Pournami as they occur only once)
    const shouldShowPaksha = festival.tithiName !== 'Amavasya' && festival.tithiName !== 'Pournami';

    return (
      <div className="tithi-info">
        <div className="tithi-name">
          {locale === 'te' ? festival.masa_te : festival.masa}{' '}
          {shouldShowPaksha && <>{t.panchangam[festival.paksha as keyof typeof t.panchangam]} </>}
          {t.panchangam[festival.tithiName as keyof typeof t.panchangam]}
        </div>
      </div>
    );
  };

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 festivals-page bg-white px-4 py-3 text-black">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0 mt-2 text-center">
                  {t.festivals.title} {year}
                </h1>
                <p className="text-center">{t.panchangam.telugu_festivals_sub_title}</p>
              </div>
            </div>
            <Row className="align-items-center py-3">
              <Col lg="6" md="6" sm="12" className="mb-md-0 mb-4">
                <LocationAccordion city={city} country={country} />
              </Col>
              <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
                <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
                  <Link
                    href={`/calendar/festivals?year=${year - 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ← {year - 1}
                  </Link>
                  <span className="fw-bold px-3">{year}</span>
                  <Link
                    href={`/calendar/festivals?year=${year + 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {year + 1} →
                  </Link>
                </div>
              </Col>
            </Row>
            {/* Display festivals grouped by month */}
            <div className="festival-grid-container">
              {Object.keys(festivalsByMonth).length > 0 ? (
                Object.keys(festivalsByMonth)
                  .sort((a, b) => parseInt(a) - parseInt(b)) // Sort months chronologically
                  .map(monthIndex => {
                    const monthFestivals = festivalsByMonth[parseInt(monthIndex)];
                    const monthName = getTranslatedMonthName(parseInt(monthIndex), t);
                    if (!monthFestivals || monthFestivals.length === 0) return null;

                    return (
                      <section key={monthIndex} id={monthIndex} className="festival-month-section">
                        <h2 className="month-title">
                          {monthName} {year}
                        </h2>
                        <div className="festival-month-container">
                          <div className="festival-grid">
                            {monthFestivals.map((festivalOcc, idx) => {
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
                                      src={getLocalizedImagePath(
                                        festivalOcc.festival.image,
                                        locale
                                      )}
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
                                        {
                                          t.panchangam[
                                            tithiInfo.tithiName as keyof typeof t.panchangam
                                          ]
                                        }
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
                          <a
                            className="more-festivals-link"
                            href={`/calendar/festivals/${getMonthName(parseInt(monthIndex))}?year=${year}`}
                          >
                            {interpolate(t.festivals.more_festivals, { month: monthName })} →
                          </a>
                        </div>
                      </section>
                    );
                  })
              ) : (
                <Row className="mt-4">
                  <Col className="py-5 text-center">
                    <p className="text-muted">
                      {festivalLoading
                        ? 'Loading festivals...'
                        : 'No festivals found for this year.'}
                    </p>
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
