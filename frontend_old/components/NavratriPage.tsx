'use client';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateLocalized, formatShortDate, formatTime } from '@/utils/dateFormatUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { NAVRATRI } from '@/utils/navratri';
import { interpolate } from '@/utils/utils';
import { getLocalizedVrathaName } from '@/utils/vrathas';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';

// Custom festival names for specific Navratri types
const CUSTOM_FESTIVAL_NAMES: Record<string, { en: string[]; te: string[] }> = {
  varahi_navratri: {
    en: [
      'Ghatasthapana',
      'Unmatta Varahi Puja',
      'Brihad Varahi Puja',
      'Sapna Varahi Puja',
      'Kirata Varahi Puja',
      'Swetha Varahi Puja',
      'Dhoomra Varahi Puja',
      'Maha Varahi Puja',
      'Varthali Varahi Puja',
      'Dandini Varahi Puja',
      'Parana',
    ],
    te: [
      'ఘటస్థాపన',
      'ఉన్మత్త వారాహి పూజ',
      'బృహత్ వారాహి పూజ',
      'స్వప్నవారాహీ పూజ',
      'కిరాతవారాహి పూజ',
      'శ్వేత వారాహి పూజ',
      'ధూమ్రవారాహి పూజ',
      'మహావారాహి పూజ',
      'వార్తాలి వారాహి పూజ',
      'దండిని వారాహి పూజ',
      'ఉద్యాపన',
    ],
  },
  shyamala_navratri: {
    en: [
      'Ghatasthapana',
      'Laghu Śyāmala',
      'Vāgvādinī Śyāmala',
      'Nakulī Śyāmala',
      'Hasanti Śyāmala',
      'Sarvasiddhi Mātaṅgi',
      'Vaśya Mātaṅgi',
      'Sārikā Śyāmala',
      'Śuka Śyāmala',
      'Rāja Mātaṅgi',
      'Parana',
    ],
    te: [
      'ఘటస్థాపన',
      'లఘు శ్యామల',
      'వాగ్వాధిని శ్యామల',
      'నకుల శ్యామల',
      'హసంతి శ్యామల',
      'సర్వసిద్ది మాతంగి',
      'వాస్య మాతంగి',
      'సారిక శ్యామల',
      'శుక శ్యామల',
      'రాజ శ్యామల',
      'ఉద్యాపన',
    ],
  },
};

// Custom display names for Navratri types
const CUSTOM_DISPLAY_NAMES: Record<string, { en: string; te: string }> = {
  varahi_navratri: {
    en: 'Varahi Navratri',
    te: 'వారాహి నవరాత్రులు',
  },
  shyamala_navratri: {
    en: 'Shyamala Navratri',
    te: 'శ్యామలా నవరాత్రులు',
  },
};

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

interface VrathaPageProps {
  vrathaPath: string;
  vrathaName: string;
}

export default function NavratriPage({ vrathaPath, vrathaName }: VrathaPageProps) {
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country, lat, lng } = useLocation();

  const festivalDisplayName = useMemo(() => {
    // Check if there's a custom display name based on path
    if (vrathaPath === '/calendar/navratri/varahi-navratri') {
      return locale === 'te'
        ? CUSTOM_DISPLAY_NAMES.varahi_navratri.te
        : CUSTOM_DISPLAY_NAMES.varahi_navratri.en;
    }
    if (vrathaPath === '/calendar/navratri/shyamala-navratri') {
      return locale === 'te'
        ? CUSTOM_DISPLAY_NAMES.shyamala_navratri.te
        : CUSTOM_DISPLAY_NAMES.shyamala_navratri.en;
    }

    const navratri = NAVRATRI.find(navratri => navratri.path === vrathaPath);

    if (navratri) {
      return locale === 'te' ? navratri.name_te : navratri.name;
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

  // Determine which vratha to fetch from (varahi and shyamala use magha_navratri data)
  const vraathaNameToFetch =
    vrathaName === 'varahi_navratri' || vrathaName === 'shyamala_navratri'
      ? 'magha_navratri'
      : vrathaName;

  // Fetch festivals using useAllFestivalsV2 hook
  const {
    festivals,
    loading: festivalLoading,
    error: festivalErrorMessage,
  } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    undefined, // priorityFilter
    vraathaNameToFetch, // vrathaNameFilter - fetch from magha_navratri for varahi/shyamala
    undefined // calculationTypeFilter
  );

  const festivalError = Boolean(festivalErrorMessage);

  // Format festival display data with panchang details
  const festivalData = useMemo(() => {
    if (!festivals?.length || !lat || !lng) return [];

    // Get custom festival names based on path (varahi and shyamala use custom names)
    const isVarahi = vrathaPath === '/calendar/navratri/varahi-navratri';
    const isShyamala = vrathaPath === '/calendar/navratri/shyamala-navratri';
    const customNames = isVarahi
      ? CUSTOM_FESTIVAL_NAMES.varahi_navratri
      : isShyamala
        ? CUSTOM_FESTIVAL_NAMES.shyamala_navratri
        : null;

    // First, map all festivals to include tithi information
    const allFestivalsWithTithi = festivals
      .map((festivalOcc, index) => {
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

          // Use custom name if available, otherwise use original festival name
          const customNameEn = customNames?.en[index];
          const customNameTe = customNames?.te[index];

          return {
            date: festivalOcc.date,
            name_en: customNameEn || festivalOcc.festival.festival_en,
            name_te: customNameTe || festivalOcc.festival.festival_te,
            masa: matchedTithi.masa,
            masa_te: matchedTithi.masa_te,
            tithiName: matchedTithi.name,
            paksha: matchedTithi.paksha,
            tithiStart: matchedTithi.start,
            tithiEnd: matchedTithi.end,
            originalIndex: index, // Track original index for custom names
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
  }, [festivals, lat, lng, locale, vrathaPath]);

  // Loading and error states
  const isLoading = festivalLoading;
  const isError = festivalError;
  const error = festivalErrorMessage;

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/calendar/navratri" className="text-decoration-none">
                    {t.nav.navratri_dates}
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
