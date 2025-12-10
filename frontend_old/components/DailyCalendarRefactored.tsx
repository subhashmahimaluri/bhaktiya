/**
 * DailyCalendarRefactored Component
 * Refactored version using utility functions and custom hooks
 * This is a cleaner, more maintainable implementation
 */

import { useLocation } from '@/context/LocationContext';
import { useDailyCalendarData } from '@/hooks/useDailyCalendarData';
import { useRashiChart } from '@/hooks/useRashiChart';
import { useTranslation } from '@/hooks/useTranslation';
import { formatGrahaDebug, GridCell } from '@/lib/panchangam/RashiChart';
import { getLocalizedWeekday } from '@/utils/calendarUtils';
import {
  createUTCDate,
  formatDateComponents,
  formatDateForDisplay,
  formatDateForUrl,
  isValidDate,
  parseDate,
} from '@/utils/dailyCalendarUtils';
import { getLocalizedText } from '@/utils/panchangamUtils';
import {
  getLocalizedPlanetName,
  getMoonRashi,
  getPlanetClass,
  getSunRashi,
} from '@/utils/rashiChartUtils';
import { durMuhurtham, getRahuKalam } from '@/utils/timeData';
import { formatMonth, formatTime24Hrs, formatToLocalTimeZone } from '@/utils/utils';
import { addDays, format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import LocationAccordion from './LocationAccordion';
import SocialShareButtons from './SocialShareButtons';

interface DailyCalendarRefactoredProps {
  date?: string | Date;
}

export default function DailyCalendarRefactored({ date }: DailyCalendarRefactoredProps) {
  const { t, locale } = useTranslation();
  const { lat, lng, city, country, timezone } = useLocation();
  const router = useRouter();

  // Parse and memoize dates
  const selectedDate = useMemo(() => parseDate(date), [date]);
  const panchangamDate = useMemo(() => createUTCDate(date), [date]);
  const displayDate = useMemo(() => parseDate(date), [date]);

  // State for date picker
  const [localSelectedDate, setLocalSelectedDate] = useState<Date>(selectedDate);

  // Sync local state with prop
  useEffect(() => {
    if (isValidDate(selectedDate)) {
      setLocalSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  // Fetch all calendar data using custom hook
  const {
    calendar,
    calculated,
    isLoading,
    error,
    sunrise,
    sunset,
    nextDaySunrise,
    moonrise,
    moonset,
    moonriseFull,
    moonsetFull,
    festivals,
    festivalsLoading,
    amrits,
    varjyams,
  } = useDailyCalendarData({
    date: panchangamDate,
    lat,
    lng,
    timezone,
    locale,
  });

  // Fetch Rashi chart data using custom hook
  const {
    gridResult,
    loading: rashiLoading,
    error: rashiError,
  } = useRashiChart({
    date: panchangamDate,
    lat,
    lng,
    timezone,
    enabled: Boolean(lat && lng),
  });

  // Navigation handler - prevent loops
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (localSelectedDate && isValidDate(localSelectedDate)) {
      const dateSlug = formatDateForUrl(localSelectedDate);
      if (router.query.slug !== dateSlug) {
        router.push(`/calendar/day/${dateSlug}`);
      }
    }
  }, [localSelectedDate]); // Remove router from dependencies

  // Memoized calculations
  const weekday = useMemo(
    () => getLocalizedWeekday(panchangamDate, 'en').toLowerCase(),
    [panchangamDate]
  );

  const getUrlDate = useCallback(
    (offset: number) => formatDateForUrl(addDays(displayDate, offset)),
    [displayDate]
  );

  const getLabelDate = useCallback(
    (offset: number) => format(addDays(displayDate, offset), 'MMM d'),
    [displayDate]
  );

  // Format date displays
  const formattedDateDisplay = useMemo(
    () => formatDateForDisplay(displayDate, locale),
    [displayDate, locale]
  );

  const dateComponents = useMemo(() => formatDateComponents(displayDate), [displayDate]);

  // Render formatted date with components
  const renderFormattedDate = useCallback(() => {
    const { day, month, year } = dateComponents;
    return (
      <>
        <span className="date-day">{day}</span>
        <span className="date-separator">-</span>
        <span className="date-month">{month}</span>
        <span className="date-separator">-</span>
        <span className="date-year">{year}</span>
      </>
    );
  }, [dateComponents]);

  // Render Rashi cell - memoized
  const renderRashiCell = useCallback(
    (cell: GridCell, isCenterCell: boolean = false) => {
      if (isCenterCell) {
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
                  {getLocalizedPlanetName(planet, locale)}
                </span>
                {idx < cell.planets.length - 1 && <span>, </span>}
              </span>
            ))}
          </div>
        </>
      );
    },
    [panchangamDate, locale]
  );

  // Handle date picker change
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (isValidDate(newDate)) {
      setLocalSelectedDate(newDate);
    }
  }, []);

  // Error handling
  if (error) {
    return (
      <Row className="monthly-calendar g-4 mt-25 pt-5">
        <Col xs={12}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error loading calendar data</h4>
            <p>{error.message || 'An unexpected error occurred'}</p>
            <button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </Col>
      </Row>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Row className="monthly-calendar g-4 mt-25 pt-5">
        <Col xs={12} className="py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading calendar data...</span>
          </div>
          <p className="mt-3">Loading calendar data...</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="monthly-calendar g-4 mt-25 pt-5">
      {/* Calendar Grid - Left Side */}
      <Col xl={8} lg={8} md={12}>
        <div className="calendar-grid Daily-calendar rounded bg-white p-3 shadow">
          <div className="day-calendar pt-3">
            <h1>{`${t.panchangam.calendar} : ${formattedDateDisplay}`}</h1>
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`Calendar ${displayDate.toLocaleDateString()}`}
              description="Daily Calendar with panchangam information"
            />

            {/* Location and Date Navigation */}
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
                      value={formatDateForUrl(localSelectedDate)}
                      onChange={handleDateChange}
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

            {/* Calendar Content */}
            <div className="calendar border-secondary3">
              {/* Header */}
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
                  <h2 className="date-display">{renderFormattedDate()}</h2>
                </Col>
                <Col xs={12} sm={12} md={4} lg={3} className="col-3 py-2 text-center">
                  <div className="calendar-icon pt-4">
                    <p className="lang mt-2">{locale === 'te' ? 'తెలుగు' : 'Hindu'}</p>
                    <p className="cal">{locale === 'te' ? 'క్యాలెండర్' : 'Calendar'}</p>
                    <p className="year">{displayDate.getFullYear()}</p>
                  </div>
                </Col>
              </Row>

              {/* Panchangam Top Section */}
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

              {/* Festivals Section */}
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

              {/* Panchangam Bottom Section */}
              {calendar && (
                <Row className="border-primary2 panchangam-bottom mx-2 my-3">
                  {/* Column 1: Panchanga Info */}
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

                  {/* Column 2: Muhurtha Info */}
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
                          ? amrits.map((amrit: any, index: number) => (
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
                          ? varjyams.map((varjyam: any, index: number) => (
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
                      <span className="value">{getSunRashi(gridResult, locale)}</span>
                    </p>
                    <p className="moon-sign">
                      <span className="lable">{t.panchangam.moon_sign}</span>
                      <span className="value">{getMoonRashi(gridResult, locale)}</span>
                    </p>
                  </Col>

                  {/* Column 3: Rashi Chart */}
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
                    ) : rashiError ? (
                      <p className="text-muted small">Error loading Rashi chart</p>
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
          ) : rashiError ? (
            <p className="text-muted small">Error loading planet details</p>
          ) : (
            <p className="text-muted small">Planet details not available</p>
          )}
        </div>
      </Col>
    </Row>
  );
}
