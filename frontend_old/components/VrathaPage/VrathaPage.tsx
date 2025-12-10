'use client';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { getSankrantisForCalendarYear } from '@/lib/panchangam/getSankrantisForCalendarYear';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { formatDateLocalized, formatShortDate, formatTime } from '@/utils/dateFormatUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { formatTimeWithRounding } from '@/utils/timeUtils';
import { interpolate } from '@/utils/utils';
import { VRATAS } from '@/utils/vratas';
import { getLocalizedVrathaName } from '@/utils/vrathas';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';

// Reusable component for displaying tithi information
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
      <div className="tithi-start">
        {t.festivals.begins} - {formatTime(festival.tithiStart)} ,{' '}
        {formatShortDate(festival.tithiStart)}
      </div>
      <div className="tithi-end">
        {t.festivals.ends} - {formatTime(festival.tithiEnd)} , {formatShortDate(festival.tithiEnd)}
      </div>
    </div>
  );
};

interface SankrantiData {
  signIndex: number;
  signName: string;
  signNameTe: string;
  jdUTC: number;
  utcDate: string;
  localYear: number;
  localTimeFormatted: string;
  ayanamsaDeg: number;
  debug: {
    fa: number;
    fb: number;
    iterations: number;
  };
}

interface VrathaPageProps {
  vrathaPath: string;
  vrathaName: string;
  pageType?: 'festival' | 'sankranti';
}

export default function VrathaPage({
  vrathaPath,
  vrathaName,
  pageType = 'festival',
}: VrathaPageProps) {
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country, lat, lng } = useLocation();

  const festivalDisplayName = useMemo(() => {
    const vrata = VRATAS.find(vrata => vrata.path === vrathaPath);

    if (vrata) {
      return locale === 'te' ? vrata.name_te : vrata.name;
    }

    // Fallback to original method if not found
    if (!slug) return '';
    return getLocalizedVrathaName(slug as string, locale, 'festivals');
  }, [locale, slug, vrathaPath]);

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

  // Update year when URL query parameter changes
  useMemo(() => {
    if (yearParam && typeof yearParam === 'string') {
      const parsedYear = parseInt(yearParam);
      if (!isNaN(parsedYear) && parsedYear !== year) {
        setYear(parsedYear);
      }
    }
  }, [yearParam, year]);

  const seoTitle = useMemo(() => {
    return `${festivalDisplayName} ${year}`;
  }, [festivalDisplayName, year]);

  const seoDescription = useMemo(() => {
    return `${festivalDisplayName} ${year} - Hindu festival date, time, tithi, and muhurta information`;
  }, [festivalDisplayName, year]);

  // State for sankranti data (only used for sankranti page type)
  const [sankrantiData, setSankrantiData] = useState<SankrantiData[]>([]);
  const [sankrantiLoading, setSankrantiLoading] = useState(false);

  // Fetch festivals using useAllFestivalsV2 hook (only for festival page type)
  const {
    festivals,
    loading: festivalLoading,
    error: festivalErrorMessage,
  } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    undefined, // priorityFilter
    vrathaName, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  const festivalError = Boolean(festivalErrorMessage);
  const shouldFetchFestivals = pageType === 'festival';

  // Load sankranti data asynchronously (only for sankranti page type)
  useEffect(() => {
    if (pageType !== 'sankranti' || !year) return;

    const loadSankrantiData = async () => {
      setSankrantiLoading(true);
      try {
        const yexaaConstant = new YexaaLocalConstant();
        const panchangImpl = new YexaaPanchangImpl(yexaaConstant);
        const sankrantis = await getSankrantisForCalendarYear(
          panchangImpl,
          year,
          timezone || 'Asia/Calcutta',
          { tolSec: 1, tzOffsetMinutes: 330 }
        );
        setSankrantiData(sankrantis);
      } catch (error) {
        console.error('Error loading sankranti data:', error);
      } finally {
        setSankrantiLoading(false);
      }
    };

    loadSankrantiData();
  }, [year, timezone, pageType]);

  // Format festival display data with panchang details (only for festival page type)
  const festivalData = useMemo(() => {
    if (pageType !== 'festival' || !festivals?.length || !lat || !lng) return [];

    const yexaaConstant = new YexaaLocalConstant();

    // First, map all festivals to include tithi information
    const allFestivalsWithTithi = festivals
      .map(festivalOcc => {
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
            date: festivalOcc.date,
            name_en: festivalOcc.festival.festival_en,
            name_te: festivalOcc.festival.festival_te,
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
      })
      .filter(Boolean);

    // Group festivals by date
    const groupedByDate = new Map<string, typeof allFestivalsWithTithi>();
    allFestivalsWithTithi.forEach(festival => {
      if (!festival) return;
      const dateKey = festival.date.toISOString().split('T')[0];
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(festival);
    });

    // Convert grouped map to array of grouped festival data
    return Array.from(groupedByDate.entries())
      .map(([dateKey, festivalsOnDate]) => {
        const firstFestival = festivalsOnDate[0];
        if (!firstFestival) return null;
        return {
          date: firstFestival.date,
          festivals: festivalsOnDate,
          // Use first festival's tithi info for the group (they should all have same tithi)
          masa: firstFestival.masa,
          masa_te: firstFestival.masa_te,
          tithiName: firstFestival.tithiName,
          paksha: firstFestival.paksha,
          tithiStart: firstFestival.tithiStart,
          tithiEnd: firstFestival.tithiEnd,
        };
      })
      .filter(Boolean);
  }, [festivals, lat, lng, locale, pageType]);

  // Function to extract date and time from localTimeFormatted (only for sankranti page type)
  const formatSankrantiDateTime = useCallback((localTimeFormatted: string) => {
    // Example format: "14 Jan 2027, 09:13:20 pm"
    const parts = localTimeFormatted.split(', ');
    const datePart = parts[0]; // "14 Jan 2027"
    const timePart = parts[1]; // "09:13:20 pm"

    // Convert time to 24-hour format for formatTimeWithRounding
    // Example: "09:13:20 pm" -> "21:13:20"
    let timeForFormatting = timePart;
    if (timePart.includes('am') || timePart.includes('pm')) {
      const [time, period] = timePart.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);

      let hours24 = hours;
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours24 = hours + 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hours24 = 0;
      }

      timeForFormatting = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds || '00'}`;
    }

    // Format time using utility function
    const formattedTime = formatTimeWithRounding(timeForFormatting);

    return { date: datePart, time: formattedTime };
  }, []);

  // Determine loading and error states based on page type
  const isLoading = pageType === 'festival' ? festivalLoading : sankrantiLoading;
  const isError = pageType === 'festival' ? festivalError : false;
  const error = pageType === 'festival' ? festivalErrorMessage : null;

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/calendar/vrathas" className="text-decoration-none">
                    {t.nav.vrathas_upavas}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {festivalDisplayName}
                </li>
              </ol>
            </nav>
            <h1 className="mb-2 text-xl font-bold">
              {festivalDisplayName} {t.festivals.dates} {year}
            </h1>
            <p className="mb-4">
              {interpolate(t.festivals.vratha_list_desc, {
                year,
                tithiName: festivalDisplayName,
                city,
                country,
              })}
            </p>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${festivalDisplayName} ${year}`}
              description={`${festivalDisplayName} dates, times, and panchang information for ${year}`}
            />
            <Row className="align-items-center py-3">
              <Col lg="6" md="6" sm="12" className="mb-md-0 mb-4">
                <LocationAccordion city={city} country={country} />
              </Col>
              <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
                <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
                  <Link
                    href={`${vrathaPath}?year=${year - 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ← {year - 1}
                  </Link>
                  <span className="fw-bold px-3">{year}</span>
                  <Link
                    href={`${vrathaPath}?year=${year + 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {year + 1} →
                  </Link>
                </div>
              </Col>
            </Row>
            {isLoading ? (
              <div className="py-5 text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading {festivalDisplayName} dates...</p>
              </div>
            ) : isError ? (
              <Alert variant="danger" className="mt-3">
                <Alert.Heading>Error Loading Festivals</Alert.Heading>
                <p>{error || 'Failed to load festival data. Please try again later.'}</p>
              </Alert>
            ) : pageType === 'sankranti' ? (
              <div className="table-responsive">
                <table className="table-tith table-bordered border-gray mt-3 table">
                  <tbody>
                    {sankrantiLoading ? (
                      <tr>
                        <td colSpan={2} className="py-3 text-center">
                          Loading sankranti data...
                        </td>
                      </tr>
                    ) : sankrantiData.length > 0 ? (
                      sankrantiData.map((sankranti, index) => {
                        const { date, time } = formatSankrantiDateTime(
                          sankranti.localTimeFormatted
                        );
                        // Convert date string "14 Jan 2027" to Date object
                        const dateObj = new Date(date);
                        return (
                          <tr key={index}>
                            <td className="d-none d-xl-table-cell d-lg-table-cell d-md-table-cell">
                              <h6 className="px-3">{formatDateLocalized(dateObj, locale, t)}</h6>
                              <div className="px-3">
                                {locale === 'te' ? sankranti.signNameTe : sankranti.signName}{' '}
                                {t.festivals.sankranti}
                              </div>
                            </td>
                            <td className="d-none d-xl-table-cell d-lg-table-cell d-md-table-cell text-center">
                              <div className="d-flex flex-column align-items-center justify-content-center">
                                <img
                                  src="/images/icons/sun.png"
                                  alt="Sankranti Moment"
                                  width={20}
                                  height={20}
                                  style={{
                                    objectFit: 'contain',
                                    marginBottom: '4px',
                                  }}
                                />
                                <div>{time}</div>
                              </div>
                            </td>
                            {/* Mobile view - stacked vertically */}
                            <td className="d-block d-xl-none d-lg-none d-md-none w-100">
                              <div className="px-3 py-2">
                                <h6>{formatDateLocalized(dateObj, locale, t)}</h6>
                                <div className="mb-2">
                                  {locale === 'te' ? sankranti.signNameTe : sankranti.signName}{' '}
                                  {t.festivals.sankranti}
                                </div>
                                <div className="text-center">
                                  <div className="d-flex flex-column align-items-center justify-content-center">
                                    <img
                                      src="/images/icons/sun.png"
                                      alt="Sankranti Moment"
                                      width={20}
                                      height={20}
                                      style={{
                                        objectFit: 'contain',
                                        marginBottom: '4px',
                                      }}
                                    />
                                    <div>{time}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-3 text-center">
                          No sankranti data available for {year}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-tith table-bordered border-gray mt-3 table">
                  <tbody>
                    {festivalData.map((groupedFestival: any, index: number) => (
                      <tr key={index}>
                        <td className="d-none d-xl-table-cell d-lg-table-cell d-md-table-cell">
                          <h6 className="px-3">
                            {formatDateLocalized(groupedFestival.date, locale, t)}
                          </h6>
                          <div className="px-3">
                            {groupedFestival.festivals
                              .map((festival: any) =>
                                locale === 'te' ? festival.name_te : festival.name_en
                              )
                              .join(', ')}
                          </div>
                        </td>
                        <td className="tithi-info d-none d-xl-table-cell d-lg-table-cell d-md-table-cell">
                          <div className="d-flex flex-column ps-3">
                            <TithiInfo festival={groupedFestival} locale={locale} t={t} />
                          </div>
                        </td>
                        {/* Mobile view - stacked vertically */}
                        <td className="d-block d-xl-none d-lg-none d-md-none w-100">
                          <div className="px-3 py-2">
                            <h6>{formatDateLocalized(groupedFestival.date, locale, t)}</h6>
                            <div className="mb-2">
                              {groupedFestival.festivals
                                .map((festival: any) =>
                                  locale === 'te' ? festival.name_te : festival.name_en
                                )
                                .join(', ')}
                            </div>
                            <TithiInfo festival={groupedFestival} locale={locale} t={t} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
