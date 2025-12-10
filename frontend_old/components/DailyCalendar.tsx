import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useTranslation } from '@/hooks/useTranslation';
import { useYexaaPanchang } from '@/hooks/useYexaaPanchang';
import { YexaaPanchang } from '@/lib/panchangam';
import {
  formatGrahaDebug,
  getPlanetNameTelugu,
  GridCell,
  PlanetName,
  RashiChart,
  RashiGridResult,
} from '@/lib/panchangam/RashiChart';
import { makeAstronomyPanchangAdapter } from '@/lib/panchangam/panchangAstronomyAdapter';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { getLocalizedWeekday } from '@/utils/calendarUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { getSpecialKaalForDay } from '@/utils/getSpecialKaal';
import { getLocalizedText } from '@/utils/panchangamUtils';
import { durMuhurtham, getRahuKalam } from '@/utils/timeData';
import {
  formatMonth,
  formatTime24Hrs,
  formatToDateTimeIST,
  formatToLocalTimeZone,
} from '@/utils/utils';
import { addDays, format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import LocationAccordion from './LocationAccordion';
import SocialShareButtons from './SocialShareButtons';

interface DailyCalendarProps {
  date?: string | Date;
}

interface DisplayAnga {
  label: string;
  time: string;
}

interface AngaEntry {
  name: string;
  start: Date;
  end: Date;
  ino: number;
  paksha?: string; // For tithi entries
}

export default function DailyCalendar({ date }: DailyCalendarProps) {
  const { t, locale } = useTranslation();
  const { lat, lng, city, country, timezone, offset } = useLocation();
  const router = useRouter();
  const [displayNakshatras, setDisplayNakshatras] = useState<DisplayAnga[]>([]);
  const [gridResult, setGridResult] = useState<RashiGridResult | null>(null);
  const [rashiLoading, setRashiLoading] = useState<boolean>(false);

  // Initialize selectedDate from date prop or current date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (!date) return new Date();

    try {
      let inputDate: Date;

      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Handle YYYY-MM-DD format from URL
        const [year, month, day] = date.split('-').map(Number);
        inputDate = new Date(year, month - 1, day);
      } else {
        // Handle regular date formats
        inputDate = new Date(date);
      }

      // Check if the date is valid
      if (isNaN(inputDate.getTime())) {
        console.error('Invalid date provided to selectedDate:', date);
        return new Date();
      }

      return inputDate;
    } catch (error) {
      console.error('Error creating selectedDate:', error);
      return new Date();
    }
  });

  // Update selectedDate when date prop changes
  useEffect(() => {
    if (!date) return;

    try {
      let inputDate: Date;

      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        inputDate = new Date(year, month - 1, day);
      } else {
        inputDate = new Date(date);
      }

      if (!isNaN(inputDate.getTime())) {
        setSelectedDate(inputDate);
      }
    } catch (error) {
      console.error('Error updating selectedDate:', error);
    }
  }, [date]);

  const panchangamDate = useMemo(() => {
    if (!date) return new Date();

    try {
      let inputDate: Date;

      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Handle YYYY-MM-DD format from URL
        const [year, month, day] = date.split('-').map(Number);
        inputDate = new Date(year, month - 1, day);
      } else {
        // Handle regular date formats
        inputDate = new Date(date);
      }

      // Check if the date is valid
      if (isNaN(inputDate.getTime())) {
        console.error('Invalid date provided to PanchangamTable:', date);
        return new Date();
      }

      // Create a UTC date at noon to avoid timezone issues
      const utcDate = new Date(
        Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 12, 0, 0)
      );

      // Validate the created date
      if (isNaN(utcDate.getTime())) {
        console.error('Failed to create valid UTC date from:', date);
        return new Date();
      }

      return utcDate;
    } catch (error) {
      console.error('Error creating panchangam date:', error);
      return new Date();
    }
  }, [date]);

  // Use the astronomy-bundle hook
  const { sunrise, sunset, nextDaySunrise, moonrise, moonset, moonriseFull, moonsetFull } =
    useAstronomyBundle(panchangamDate);

  // Initialize panchang implementation with astronomy adapter for Rashi Chart
  const panchangImpl = useMemo(() => {
    const constant = new YexaaLocalConstant();
    const base = new YexaaPanchangImpl(constant);
    return makeAstronomyPanchangAdapter(base);
  }, []);

  // Initialize RashiChart
  const rashiChart = useMemo(() => {
    return new RashiChart(panchangImpl, { ayanamsaMode: 'lahiri' });
  }, [panchangImpl]);

  // Default mapping for Rashi Chart
  const mapping = useMemo(() => RashiChart.getDefaultMapping(), []);

  // Use the YexaaPanchang hook
  const { calendar, calculated, isLoading, error } = useYexaaPanchang({
    date: panchangamDate,
    lat,
    lng,
    enabled: Boolean(lat && lng),
  });

  // Use the all festivals hook to get all festivals for the year
  const year = useMemo(() => panchangamDate.getFullYear(), [panchangamDate]);
  const { allFestivals, loading: isFestivalsLoading } = useAllFestivalsV2(
    year,
    undefined,
    undefined,
    undefined,
    undefined
  );

  // Filter festivals for the current panchangamDate
  const festivals = useMemo(() => {
    if (!allFestivals.length) return [];

    // Get festivals that match the panchangamDate
    const dateStr = panchangamDate.toISOString().split('T')[0];
    const matchingFestivals = allFestivals.filter(
      festival => festival.date.toISOString().split('T')[0] === dateStr
    );

    if (matchingFestivals.length === 0) return [];

    // Format festival names based on locale and include URL
    return matchingFestivals.map(f => ({
      name: locale === 'te' ? f.festival.festival_te : f.festival.festival_en,
      url: f.festival.festival_url,
    }));
  }, [allFestivals, panchangamDate, locale]);

  const getSunriseDate = (date: Date, lat: number, lng: number): Date => {
    const panchang = new YexaaPanchang();
    const sun = panchang.sunTimer(date, lat, lng);
    return new Date(sun.sunRise || date);
  };

  const getDayAngas = (
    entries: AngaEntry[],
    sunRise: Date,
    angaType: 'tithi' | 'nakshatra' | 'yoga' | 'karana'
  ): DisplayAnga[] => {
    const nextSunrise = new Date(sunRise.getTime() + 24 * 60 * 60 * 1000);
    const results: DisplayAnga[] = [];

    for (const anga of entries) {
      const start = new Date(anga.start);
      const end = new Date(anga.end);

      // Check if this anga is relevant for the day (intersects with sunrise to next sunrise)
      if (end <= sunRise || start >= nextSunrise) {
        continue; // Skip angas that don't intersect with our day
      }

      let tag = '';
      const time = `${formatToDateTimeIST(start, timezone)} – ${formatToDateTimeIST(end, timezone)}`;

      // Apply Telugu Panchangam rules - only for Tithi entries
      if (angaType === 'tithi') {
        if (start > sunRise && end < nextSunrise) {
          // Anga begins and ends between two sunrises
          tag = ' [Kshaya]';
        } else if (start < sunRise && end > nextSunrise) {
          // Anga spans across two consecutive sunrises
          tag = ' [Vriddhi]';
        } else if (end.getTime() === sunRise.getTime()) {
          // Anga ends exactly at sunrise - next anga is official (normal case, no tag)
          // This anga should not be displayed as it's not the day's main anga
          continue;
        }
      }
      // else: normal display (anga present at sunrise)

      const pakshaPrefix = anga.paksha ? `${anga.paksha} ` : '';
      const label = `${pakshaPrefix}${anga.name}${tag}`;

      results.push({
        label,
        time,
      });
    }

    return results;
  };

  useEffect(() => {
    if (!calendar || !calculated) {
      setDisplayNakshatras([]);
      return;
    }
    try {
      // Calculate display angas according to Telugu Panchangam rules
      const sunriseTime = getSunriseDate(panchangamDate, lat, lng);
      const allNakshatras = getAllAngasForDay(panchangamDate, lat, lng, 'nakshatra');
      const dayNakshatras = getDayAngas(allNakshatras, sunriseTime, 'nakshatra');
      setDisplayNakshatras(dayNakshatras);
    } catch (err) {
      setDisplayNakshatras([]);
    }
  }, [calendar, calculated, lat, lng, date]);

  // Compute Rashi Chart using sunrise time
  const computeRashiChart = useCallback(async () => {
    if (!lat || !lng || !timezone) {
      return;
    }

    setRashiLoading(true);

    try {
      // Use sunrise as snapshot time for the chart
      const result = await rashiChart.computeGridForDate(
        panchangamDate,
        lat,
        lng,
        timezone,
        mapping,
        'sunrise'
      );

      setGridResult(result);
    } catch (err: any) {
      console.error('Error computing rashi chart:', err);
      setGridResult(null);
    } finally {
      setRashiLoading(false);
    }
  }, [panchangamDate, lat, lng, timezone, rashiChart, mapping]);

  // Auto-compute Rashi chart when dependencies change
  useEffect(() => {
    computeRashiChart();
  }, [computeRashiChart]);

  // Navigate to new date when selectedDate changes (but not on initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip navigation on initial mount to prevent loops
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (selectedDate && !isNaN(selectedDate.getTime())) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateSlug = `${year}-${month}-${day}`;

      // Only navigate if the current URL doesn't match the selected date
      if (router.query.slug !== dateSlug) {
        router.push(`/calendar/day/${dateSlug}`);
      }
    }
  }, [selectedDate]);

  // Parse and validate date for display
  const getDisplayDate = () => {
    let dateObj: Date;

    if (!date) {
      dateObj = new Date();
    } else if (typeof date === 'string') {
      // Handle YYYY-MM-DD format from URL
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        // Try regular date parsing
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    // Validate the date
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    return dateObj;
  };

  // Format date for display based on locale
  const formatDateDisplay = () => {
    const dateObj = getDisplayDate();

    if (locale === 'te') {
      // Telugu format only
      const teluguFormat = dateObj.toLocaleDateString('te-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return teluguFormat;
    } else {
      // English format only
      const englishFormat = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return englishFormat;
    }
  };

  const formatDateDisplay2 = () => {
    const dateObj = getDisplayDate();

    // Always show in DD-MM-YYYY format with spans for styling
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    return (
      <>
        <span className="date-day">{day}</span>
        <span className="date-separator">-</span>
        <span className="date-month">{month}</span>
        <span className="date-separator">-</span>
        <span className="date-year">{year}</span>
      </>
    );
  };

  const displayDate = getDisplayDate();

  const sunData = { sunrise: sunrise, sunset: sunset, nextDaySunrise: nextDaySunrise };
  const amrits = getSpecialKaalForDay('amrit', displayNakshatras, panchangamDate, sunData);
  const varjyams = getSpecialKaalForDay('varjyam', displayNakshatras, panchangamDate, sunData);
  const weekday = getLocalizedWeekday(panchangamDate, 'en').toLowerCase();
  const getUrlDate = (offset: number) => format(addDays(displayDate, offset), 'yyyy-MM-dd');
  const getLabelDate = (offset: number) => format(addDays(displayDate, offset), 'MMM d');

  // Helper function to get planet CSS class for coloring
  const getPlanetClass = (planet: PlanetName): string => {
    const classMap: Record<PlanetName, string> = {
      Sun: 'sun',
      Moon: 'moon',
      Mars: 'mars',
      Mercury: 'mercury',
      Jupiter: 'jupiter',
      Venus: 'venus',
      Saturn: 'saturn',
      Rahu: 'rahu',
      Ketu: 'ketu',
    };
    return classMap[planet] || '';
  };

  // Helper function to get localized planet name
  const getLocalizedPlanetName = (planet: PlanetName): string => {
    return locale === 'te' ? getPlanetNameTelugu(planet) : planet;
  };

  // Helper function to get Sun rashi name
  const getSunRashi = (): string => {
    if (!gridResult || !gridResult.grahas) return 'N/A';
    const sunGraha = gridResult.grahas.find(g => g.planet === 'Sun');
    if (!sunGraha) return 'N/A';
    return locale === 'te' ? sunGraha.rashiNameTelugu : sunGraha.rashiName;
  };

  // Helper function to get Moon rashi name
  const getMoonRashi = (): string => {
    if (!gridResult || !gridResult.grahas) return 'N/A';
    const moonGraha = gridResult.grahas.find(g => g.planet === 'Moon');
    if (!moonGraha) return 'N/A';
    return locale === 'te' ? moonGraha.rashiNameTelugu : moonGraha.rashiName;
  };

  // Helper function to render a rashi grid cell
  const renderRashiCell = (cell: GridCell, isCenterCell: boolean = false) => {
    if (isCenterCell) {
      // Center cell shows date
      return (
        <div className="center-content">
          <div className="center-date">{panchangamDate.toLocaleDateString('en-IN')}</div>
          <div className="center-brand">ssbhakthi.com</div>
        </div>
      );
    }

    const rashiIndex = cell.rashiIndex;

    return (
      <>
        <span className="rashi-label">{rashiIndex >= 0 ? `${rashiIndex + 1}` : ''}</span>
        <div
          className="planets-list"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2px',
            justifyContent: 'center',
            maxWidth: '100%',
          }}
        >
          {cell.planets.map((planet, idx) => (
            <span key={idx} style={{ whiteSpace: 'nowrap' }}>
              <span className={`planet-name ${getPlanetClass(planet)}`}>
                {getLocalizedPlanetName(planet)}
              </span>
              {idx < cell.planets.length - 1 && <span>, </span>}
            </span>
          ))}
        </div>
      </>
    );
  };

  return (
    <Row className="monthly-calendar g-4 mt-25 pt-5">
      {/* Calendar Grid - Left Side */}
      <Col xl={8} lg={8} md={12}>
        <div className="calendar-grid Daily-calendar rounded bg-white p-3 shadow">
          <div className="day-calendar pt-3">
            <h1>{`${t.panchangam.calendar} : ${formatDateDisplay()}`}</h1>
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`Calendar ${displayDate.toLocaleDateString()}`}
              description="Daily Calendar with panchangam information"
            />
            <div className="location-nav my-3">
              <Row>
                <Col xs={12} sm={12} md={7} lg={7} className="location py-2">
                  <LocationAccordion city={city} country={country} />
                </Col>
                <Col xs={12} sm={12} md={5} lg={5} className="select-date py-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <Form.Label className="fw-semibold small mb-0 me-2 flex-shrink-0">
                      <i className="fas fa-calendar me-2"></i>Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={
                        selectedDate && !isNaN(selectedDate.getTime())
                          ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
                          : new Date().toISOString().split('T')[0]
                      }
                      onChange={e => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) {
                          setSelectedDate(newDate);
                        }
                      }}
                      className="flex-grow-1"
                    />
                  </div>
                </Col>
                <div className="calendar-nav pt-4">
                  <ul className="list-unstyled d-flex justify-content-between align-items-center">
                    <li className="nav-prev">
                      <Link
                        href={`/calendar/day/${getUrlDate(-1)}`}
                        className="d-flex align-items-center text-decoration-none text-primary rounded-pill nav-link-custom px-3 py-2"
                      >
                        <i className="fa fa-angle-left me-2" />
                        <span className="fw-medium">{getLabelDate(-1)}</span>
                      </Link>
                    </li>
                    <li className="nav-today">
                      <Link
                        href={`/calendar/day/${format(new Date(), 'yyyy-MM-dd')}`}
                        className="text-decoration-none rounded-pill nav-today-custom px-4 py-2"
                      >
                        <span className="fw-bold">Today</span>
                      </Link>
                    </li>
                    <li className="nav-next">
                      <Link
                        href={`/calendar/day/${getUrlDate(1)}`}
                        className="d-flex align-items-center text-decoration-none text-primary rounded-pill nav-link-custom px-3 py-2"
                      >
                        <span className="fw-medium">{getLabelDate(1)}</span>
                        <i className="fa fa-angle-right ms-2" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </Row>
            </div>
            <div className="calendar border-secondary3">
              <Row className="justify-content-center align-items-center calendar-header my-2">
                <Col xs={12} sm={12} md={3} lg={3} className="col-1 py-2 text-center">
                  <Image
                    src="/logo.png"
                    width="130"
                    height="51"
                    alt="SS Bhakthi"
                    priority
                    quality={90}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} className="col-2 py-3 text-center">
                  <h2 className="date-display">{formatDateDisplay2()}</h2>
                </Col>
                <Col xs={12} sm={12} md={4} lg={3} className="col-3 py-2 text-center">
                  <div className="calendar-icon pt-4">
                    <p className="lang mt-2">{locale === 'te' ? 'తెలుగు' : 'Hindu'}</p>
                    <p className="cal">{locale === 'te' ? 'క్యాలెండర్' : 'Calendar'}</p>
                    <p className="year">{displayDate.getFullYear()}</p>
                  </div>
                </Col>
              </Row>

              {calendar && (
                <Row className="border-primary2 panchangam-top mx-2 my-3">
                  <Col xs={12} sm={12} md={3} lg={3} className="col-1 text-center">
                    <p className="lunar-masa">
                      {getLocalizedText(calendar?.Masa, 'name_TE', 'name', locale)}
                      {locale === 'te' ? ' మాసం' : ' Masam'}
                    </p>
                    <p className="lunar-year">
                      {getLocalizedText(calendar?.TeluguYear, 'name_TE', 'name', locale)}
                      {locale === 'te' ? ' నామ సంవత్సరం' : ' Nama Samvatsaram'}
                    </p>
                  </Col>
                  <Col xs={12} sm={12} md={4} lg={4} className="col-2 text-center">
                    <p className="month-data">
                      {(t.panchangam as any)[formatMonth(panchangamDate)]}
                    </p>
                    <p className="week-day">{getLocalizedWeekday(panchangamDate, locale)}</p>
                    <p className="week-data">{(t.vasara as any)[weekday]}</p>
                  </Col>
                  <Col xs={12} sm={12} md={5} lg={5} className="col-3 sunmoon-data">
                    <p>
                      <span className="lable">{t.panchangam.sunrise}</span>
                      <span className="value">{sunrise || 'N/A'}</span>
                    </p>
                    <p>
                      <span className="lable">{t.panchangam.sunset}</span>
                      <span className="value">{sunset || 'N/A'}</span>
                    </p>
                    <p>
                      <span className="lable">{t.panchangam.moonrise}</span>
                      <span className="value">{moonrise || 'N/A'}</span>
                    </p>
                    <p>
                      <span className="lable">{t.panchangam.moonset}</span>
                      <span className="value">{moonsetFull || 'N/A'}</span>
                    </p>
                  </Col>
                </Row>
              )}
              {festivals && festivals.length > 0 && (
                <Row className="panchangam-festivals mx-2 my-3">
                  <Col xs={12} sm={12} md={12} lg={12} className="col-3 festivals text-center">
                    <h4>{t.panchangam.festivals}</h4>
                    {festivals.map((festival, idx) => (
                      <React.Fragment key={idx}>
                        {festival.url ? (
                          <a href={festival.url} className="text-decoration-none">
                            {festival.name}
                          </a>
                        ) : (
                          <span>{festival.name}</span>
                        )}
                        {idx < festivals.length - 1 && <span>, </span>}
                      </React.Fragment>
                    ))}
                  </Col>
                </Row>
              )}

              {festivals && festivals.length === 0 && (
                <Row className="panchangam-festivals mx-2 my-3">
                  <Col xs={12} sm={12} md={12} lg={12} className="col-3 festivals text-center">
                    <h4>{t.panchangam.festivals}</h4>
                    <p>
                      {locale === 'te' ? 'ఈ రోజు ప్రధాన పండుగలు లేవు' : 'No major festivals today'}
                    </p>
                  </Col>
                </Row>
              )}
              {calendar && (
                <Row className="border-primary2 panchangam-bottom mx-2 my-3">
                  <Col xs={12} sm={12} md={3} lg={3} className="col-1 panchanga-info">
                    <p className="tithi-data">
                      <span className="lable">{t.panchangam.tithi}</span>
                      <span className="value">
                        {getLocalizedText(calculated?.Tithi, 'name_TE', 'name', locale)}{' '}
                        {formatTime24Hrs(calculated?.Tithi.end, timezone)}
                      </span>
                    </p>
                    <p className="nakshatra-data">
                      <span className="lable">{t.panchangam.nakshatra}</span>
                      <span className="value">
                        {getLocalizedText(calculated?.Nakshatra, 'name_TE', 'name', locale)}{' '}
                        {formatTime24Hrs(calculated?.Nakshatra.end, timezone)}
                      </span>
                    </p>
                    <p className="nakshatra-data">
                      <span className="lable">{t.panchangam.yoga}</span>
                      <span className="value">
                        {getLocalizedText(calculated?.Yoga, 'name_TE', 'name', locale)}{' '}
                        {formatTime24Hrs(calculated?.Yoga.end, timezone)}
                      </span>
                    </p>
                    <p className="nakshatra-data">
                      <span className="lable">{t.panchangam.karana}</span>
                      <span className="value">
                        {getLocalizedText(calculated?.Karna, 'name_TE', 'name', locale)}{' '}
                        {formatTime24Hrs(calculated?.Karna.end, timezone)}
                      </span>
                    </p>
                    <p className="nakshatra-data">
                      <span className="lable">{t.panchangam.month}</span>
                      <span className="value">
                        {getLocalizedText(calendar?.Masa, 'name_TE', 'name', locale)}
                      </span>
                    </p>
                    <p className="nakshatra-data">
                      <span className="lable">
                        {t.panchangam.punimantha} {t.panchangam.month}
                      </span>
                      <span className="value">
                        {getLocalizedText(calendar?.MoonMasa, 'name_TE', 'name', locale)}
                      </span>
                    </p>
                    <p className="paksha-data">
                      <span className="lable">{t.panchangam.paksha}</span>
                      <span className="value">
                        {getLocalizedText(calendar?.Paksha, 'name_TE', 'name', locale)}
                      </span>
                    </p>
                    <p className="ayana-data">
                      <span className="lable">{t.panchangam.ayana}</span>
                      <span className="value">
                        {getLocalizedText(calendar?.Ayana, 'name_TE', 'name', locale)}
                      </span>
                    </p>
                    <p className="ruthu-data">
                      <span className="lable">{t.panchangam.ruthu}</span>
                      <span className="value">
                        {getLocalizedText(calendar?.DrikRitu, 'name_TE', 'name', locale)}
                      </span>
                    </p>
                  </Col>
                  <Col xs={12} sm={12} md={4} lg={4} className="col-2 muhurtha-info text-center">
                    <p className="rahu-kalam">
                      <span className="lable">{t.panchangam.rahu}</span>
                      <span className="value">
                        {sunrise && sunset
                          ? getRahuKalam(
                              sunrise,
                              sunset,
                              getLocalizedWeekday(panchangamDate, 'en'),
                              timezone
                            )?.rahu
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="rahu-kalam">
                      <span className="lable">{t.panchangam.gulika}</span>
                      <span className="value">
                        {sunrise && sunset
                          ? getRahuKalam(
                              sunrise,
                              sunset,
                              getLocalizedWeekday(panchangamDate, 'en'),
                              timezone
                            )?.gulika
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="rahu-kalam">
                      <span className="lable">{t.panchangam.yamaganda}</span>
                      <span className="value">
                        {sunrise && sunset
                          ? getRahuKalam(
                              sunrise,
                              sunset,
                              getLocalizedWeekday(panchangamDate, 'en'),
                              timezone
                            )?.yamaganda
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="radurmuhurathu-kalam">
                      <span className="lable">{t.panchangam.dur_muhurat}</span>
                      <span className="value">
                        {sunrise &&
                          sunset &&
                          durMuhurtham(sunrise, sunset, getLocalizedWeekday(panchangamDate, 'en'))}
                      </span>
                    </p>
                    <p className="varjyam-kalam">
                      <span className="lable">{t.panchangam.amrit_kaal}</span>
                      <span className="value">
                        {amrits.length > 0
                          ? amrits.map((amrit, index) => (
                              <span key={index}>
                                {formatToLocalTimeZone(amrit.rawStart, timezone)} -{' '}
                                {formatToLocalTimeZone(amrit.rawEnd, timezone)}
                                {index < amrits.length - 1 && ', '}
                              </span>
                            ))
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="varjyam-kalam">
                      <span className="lable">{t.panchangam.varjyam}</span>
                      <span className="value">
                        {varjyams.length > 0
                          ? varjyams.map((varjyam, index) => (
                              <span key={index}>
                                {formatToLocalTimeZone(varjyam.rawStart, timezone)} -{' '}
                                {formatToLocalTimeZone(varjyam.rawEnd, timezone)}
                                {index < varjyams.length - 1 && ', '}
                              </span>
                            ))
                          : 'N/A'}
                      </span>
                    </p>
                    <p className="sun-sign">
                      <span className="lable">{t.panchangam.sun_sign}</span>
                      <span className="value">{getSunRashi()}</span>
                    </p>
                    <p className="moon-sign">
                      <span className="lable">{t.panchangam.moon_sign}</span>
                      <span className="value">{getMoonRashi()}</span>
                    </p>
                  </Col>
                  <Col xs={12} sm={12} md={5} lg={5} className="col-3 rashi-table text-center">
                    {rashiLoading ? (
                      <div className="py-4">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="small mt-2">Calculating Rashi Chart...</p>
                      </div>
                    ) : gridResult ? (
                      <div className="rashi-grid-container py-2">
                        <div className="rashi-grid">
                          {/* Row 1: cells 11, 0, 1, 2 (houses 12, 1, 2, 3) */}
                          <div className="grid-cell border-right border-bottom">
                            {renderRashiCell(gridResult.grid[11])}
                          </div>
                          <div className="grid-cell border-right border-bottom">
                            {renderRashiCell(gridResult.grid[0])}
                          </div>
                          <div className="grid-cell border-right border-bottom">
                            {renderRashiCell(gridResult.grid[1])}
                          </div>
                          <div className="grid-cell border-bottom">
                            {renderRashiCell(gridResult.grid[2])}
                          </div>

                          {/* Row 2: cell 10, CENTER (2x2), cell 3 (houses 11, center, 4) */}
                          <div className="grid-cell border-right border-bottom">
                            {renderRashiCell(gridResult.grid[10])}
                          </div>
                          <div className="grid-cell center-cell border-right">
                            {renderRashiCell({ cellIndex: -1, rashiIndex: -1, planets: [] }, true)}
                          </div>
                          <div className="grid-cell border-bottom">
                            {renderRashiCell(gridResult.grid[3])}
                          </div>

                          {/* Row 3: cell 9, CENTER (continues), cell 4 (houses 10, center, 5) */}
                          <div className="grid-cell border-right">
                            {renderRashiCell(gridResult.grid[9])}
                          </div>
                          <div className="grid-cell">{renderRashiCell(gridResult.grid[4])}</div>

                          {/* Row 4: cells 8, 7, 6, 5 (houses 9, 8, 7, 6) */}
                          <div className="grid-cell border-right border-top">
                            {renderRashiCell(gridResult.grid[8])}
                          </div>
                          <div className="grid-cell border-right border-top">
                            {renderRashiCell(gridResult.grid[7])}
                          </div>
                          <div className="grid-cell border-right border-top">
                            {renderRashiCell(gridResult.grid[6])}
                          </div>
                          <div className="grid-cell border-top">
                            {renderRashiCell(gridResult.grid[5])}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted small">Rashi chart not available</p>
                    )}
                  </Col>
                </Row>
              )}
            </div>
          </div>
        </div>
      </Col>

      {/* Planet Details Sidebar - Right Side */}
      <Col xl={4} lg={4} md={12}>
        <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
          <h2 className="mb-3 mt-2">
            {locale === 'te' ? 'గ్రహాల స్థానాలు మరియు కదలికలు' : 'Planetary Positions'}
          </h2>
          {rashiLoading ? (
            <div className="py-4 text-center">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="small mt-2">Calculating...</p>
            </div>
          ) : gridResult && gridResult.grahas ? (
            <ul className="list-unstyled small planetary-positions">
              {gridResult.grahas.map((graha, idx) => (
                <li key={idx} className="mb-2">
                  {formatGrahaDebug(graha, locale)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted small">Planet details not available</p>
          )}
        </div>
      </Col>
    </Row>
  );
}
