import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useOptimizedPanchangam } from '@/hooks/useOptimizedPanchangam';
import { useTranslation } from '@/hooks/useTranslation';
import { getSankrantisForCalendarYear } from '@/lib/panchangam/getSankrantisForCalendarYear';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { getLocalizedWeekday } from '@/utils/calendarUtils';
import { getLocalizedText } from '@/utils/panchangamUtils';
import { formatDay, formatMonth } from '@/utils/utils';
import React, { useEffect, useMemo, useState } from 'react';
import PanchangSlide_V2 from './PanchangSlide_V2';
import PanchangamError from './PanchangamError';
import PanchangamHeader from './PanchangamHeader';
import TithiListTable from './TithiListTable';

import { ServerPanchangamResult } from '@/lib/panchangam/serverPanchangam';
import { FestivalDate } from './UpcomingEvents';

interface PanchangamProps {
  date?: string | Date;
  showViewMore?: boolean;
  initialData?: {
    calendar: any;
    calculated: any;
  } | null;
  initialTithiData?: ServerPanchangamResult | null;
  initialFestivals?: FestivalDate[] | null;
}

export default function PanchangamTable({
  date,
  showViewMore = false,
  initialData = null,
  initialTithiData = null,
  initialFestivals = null,
}: PanchangamProps) {
  const { t, locale } = useTranslation();
  const { lat, lng, city, country, timezone, offset } = useLocation();

  const panchangamDate = useMemo(() => {
    if (!date) return new Date();

    try {
      const inputDate = new Date(date);

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

  // Determine if we should use initialData
  // Only use if we have it AND location matches default Hyderabad coordinates
  const shouldUseInitialData = !!initialData && lat === 17.385044 && lng === 78.486671;

  // Use the optimized YexaaPanchang hook with caching
  const { calendar, calculated, isLoading, error } = useOptimizedPanchangam({
    date: panchangamDate,
    lat,
    lng,
    enabled: Boolean(lat && lng), // Fetch whenever we have location
    initialData: shouldUseInitialData ? initialData : null,
  });

  // Use the all festivals hook to get all festivals for the year
  const year = useMemo(() => panchangamDate.getFullYear(), [panchangamDate]);

  // Only use initialFestivals if we have them AND location is default
  const shouldUseInitialFestivals = !!initialFestivals && lat === 17.385044 && lng === 78.486671;
  const skipFestivalCalculation = shouldUseInitialFestivals;

  const { allFestivals, loading: isFestivalsLoading } = useAllFestivalsV2(
    year,
    undefined,
    undefined,
    undefined,
    undefined,
    skipFestivalCalculation
  );

  // Filter festivals for the current panchangamDate
  const festivals = useMemo(() => {
    // Only use initialFestivals if shouldUseInitialFestivals is true
    if (shouldUseInitialFestivals) {
      const dateStr = panchangamDate.toISOString().split('T')[0];
      const matchingInitialFestival = initialFestivals!.find(
        f => new Date(f.date).toISOString().split('T')[0] === dateStr
      );

      if (matchingInitialFestival) {
        return matchingInitialFestival.festivals;
      }
    }

    // Fall back to using allFestivals if no initialFestivals match or shouldUseInitialFestivals is false
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
  }, [allFestivals, panchangamDate, locale, initialFestivals, shouldUseInitialFestivals]);

  // State for sankranti data
  const [sankrantiData, setSankrantiData] = useState<any>(null);
  const [sankrantiLoading, setSankrantiLoading] = useState(false);

  // Load sankranti data asynchronously
  useEffect(() => {
    const loadSankrantiData = async () => {
      setSankrantiLoading(true);
      try {
        const yexaaConstant = new YexaaLocalConstant();
        const panchangImpl = new YexaaPanchangImpl(yexaaConstant);
        const sankrantis2027 = await getSankrantisForCalendarYear(
          panchangImpl,
          2027,
          'Asia/Calcutta',
          { tolSec: 1, tzOffsetMinutes: 330 /* optional: sunriseLookup */ }
        );
      } finally {
        setSankrantiLoading(false);
      }
    };
    loadSankrantiData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <PanchangamHeader panchangamDate={panchangamDate} />
      </>
    );
  }

  return (
    <>
      <PanchangamHeader panchangamDate={panchangamDate} />

      {/* Show error state if API failed */}
      {error && <PanchangamError error={error.message || 'Failed to load Panchangam data'} />}

      <div className="panchang-secondary-header px-lg-14 px-md-12 overflow-hidden">
        <PanchangSlide_V2
          sunrise={sunrise || ''}
          sunset={sunset || ''}
          moonrise={moonrise || ''}
          moonset={moonset || ''}
          ayana={locale === 'te' ? calendar?.Ayana?.name_TE || '' : calendar?.Ayana?.name || ''}
          ritu={
            locale === 'te' ? calendar?.DrikRitu?.name_TE || '' : calendar?.DrikRitu?.name || ''
          }
        />
      </div>

      <div className="pricing-card gr-hover-shadow-1 gr-text-color border bg-white px-4 py-2">
        <div className="panchang-date pt-3">
          <ul className="list-unstyled gr-text-8 border-bottom pb-3">
            <li>
              <span className="fw-bold">{t.panchangam.date}</span> :{' '}
              <span>
                {(t.panchangam as any)[formatMonth(panchangamDate)] || formatMonth(panchangamDate)}{' '}
                {formatDay(panchangamDate)}
              </span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.week_day}</span> :{' '}
              <span>{getLocalizedWeekday(panchangamDate, locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.tithi}</span> :{' '}
              <span>{getLocalizedText(calendar?.Tithi, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.month}</span> :{' '}
              <span>{getLocalizedText(calendar?.Masa, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.month}</span> :{' '}
              <span>
                {getLocalizedText(calendar?.MoonMasa, 'name_TE', 'name', locale)} (
                {t.panchangam.punimantha})
              </span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.nakshatra}</span> :{' '}
              <span>{getLocalizedText(calendar?.Nakshatra, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.paksha}</span> :{' '}
              <span>{getLocalizedText(calendar?.Paksha, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.lunar_year}</span> :{' '}
              <span>{getLocalizedText(calendar?.TeluguYear, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.ruthu}</span> :{' '}
              <span>{getLocalizedText(calendar?.DrikRitu, 'name_TE', 'name', locale)}</span>
            </li>
            <li>
              <span className="fw-bold">{t.panchangam.ayana}</span> :{' '}
              <span>{getLocalizedText(calendar?.Ayana, 'name_TE', 'name', locale)}</span>
            </li>
            {isFestivalsLoading || festivals.length > 0 ? (
              <li>
                <span className="fw-bold">{t.panchangam.festivals}</span> :{' '}
                <span>
                  {isFestivalsLoading ? (
                    <span
                      className="skeleton-text skeleton-text-sm"
                      style={{ width: '150px', display: 'inline-block' }}
                    ></span>
                  ) : (
                    festivals.map((festival, idx) => (
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
                    ))
                  )}
                </span>
              </li>
            ) : null}
          </ul>
        </div>

        <TithiListTable date={date} showViewMore={showViewMore} initialData={initialTithiData} />
      </div>

      <style jsx>{`
        .skeleton-text {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          height: 14px;
        }

        .skeleton-text-sm {
          height: 14px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
