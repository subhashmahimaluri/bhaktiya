'use client';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getSankrantisForCalendarYear } from '@/lib/panchangam/getSankrantisForCalendarYear';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { formatDateLocalized } from '@/utils/dateFormatUtils';
import { formatTimeWithRounding } from '@/utils/timeUtils';
import { interpolate } from '@/utils/utils';
import { VRATAS } from '@/utils/vratas';
import { getLocalizedVrathaName } from '@/utils/vrathas';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

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

export default function MasikSankrantiPage() {
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country } = useLocation();

  // State for sankranti data
  const [sankrantiData, setSankrantiData] = useState<SankrantiData[]>([]);
  const [sankrantiLoading, setSankrantiLoading] = useState(false);

  const festivalDisplayName = useMemo(() => {
    // Find the sankranti data from VRATAS
    const sankrantiVrata = VRATAS.find(vrata => vrata.path === '/calendar/vrathas/masa-sankranti');

    if (sankrantiVrata) {
      // Return localized name based on locale
      return locale === 'te' ? sankrantiVrata.name_te : sankrantiVrata.name;
    }

    // Fallback to original method if not found
    if (!slug) return '';
    return getLocalizedVrathaName(slug as string, locale, 'festivals');
  }, [locale, slug]);

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

  // Load sankranti data asynchronously
  useEffect(() => {
    if (!year) return;

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
  }, [year, timezone]);

  // Function to extract date and time from localTimeFormatted
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

    // Format time using the utility function
    const formattedTime = formatTimeWithRounding(timeForFormatting);

    return { date: datePart, time: formattedTime };
  }, []);

  return (
    <Layout>
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
            <Row className="align-items-center py-3">
              <Col lg="6" md="6" sm="12" className="mb-md-0 mb-4">
                <LocationAccordion city={city} country={country} />
              </Col>
              <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
                <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
                  <Link
                    href={`/calendar/vrathas/masa-sankranti?year=${year - 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ← {year - 1}
                  </Link>
                  <span className="fw-bold px-3">{year}</span>
                  <Link
                    href={`/calendar/vrathas/masa-sankranti?year=${year + 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {year + 1} →
                  </Link>
                </div>
              </Col>
            </Row>
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
                      const { date, time } = formatSankrantiDateTime(sankranti.localTimeFormatted);
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
                              <Image
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
                                  <Image
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
