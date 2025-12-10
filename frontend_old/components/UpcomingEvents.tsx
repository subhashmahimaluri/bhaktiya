'use client';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { addDays, format } from 'date-fns';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

interface Festival {
  festival_name: string;
  tithi: string;
  nakshatra: string;
  telugu_month: string;
  adhik_maasa: string;
  festival_en: string;
  festival_te: string;
  vratha_name: string;
  calendar_type: string;
  telugu_en_priority: string;
}

export interface FestivalDate {
  date: Date;
  festivals: Array<{ name: string; url?: string }>;
}

interface UpcomingEventsV2Props {
  isHomePage?: boolean;
  maxHeight?: number;
  maxEvents?: number;
  initialFestivals?: FestivalDate[];
}

const UpcomingEventsV2: React.FC<UpcomingEventsV2Props> = ({
  isHomePage = false,
  maxHeight = 500,
  maxEvents = 10,
  initialFestivals,
}) => {
  const { locale, t } = useTranslation();
  const { lat, lng } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showViewMore, setShowViewMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState('');

  // Get current date and 30 days ahead
  // Set time to beginning of day to ensure today's festivals are included
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const year = useMemo(() => today.getFullYear(), [today]);
  const endDate = useMemo(() => addDays(today, 30), [today]);

  // Only use initialFestivals if we have them AND location is default
  const shouldUseInitialData = !!initialFestivals && lat === 17.385044 && lng === 78.486671;
  const skipFestivalFetch = shouldUseInitialData;

  // Use the all festivals hook
  const { allFestivals, loading: hookLoading } = useAllFestivalsV2(
    year,
    undefined,
    undefined,
    undefined,
    undefined,
    skipFestivalFetch
  );

  const isLoading = !initialFestivals && hookLoading;

  // Filter and process festivals for upcoming 30 days
  const festivalDates = useMemo(() => {
    if (initialFestivals && shouldUseInitialData) {
      return initialFestivals.map(f => ({
        ...f,
        date: typeof f.date === 'string' ? new Date(f.date) : f.date,
      }));
    }

    if (!allFestivals.length) return [];

    const festivalMap = new Map<string, Array<{ name: string; url?: string }>>();

    // Filter festivals within the next 30 days
    allFestivals.forEach(festival => {
      if (festival.date >= today && festival.date <= endDate) {
        const dateKey = festival.date.toISOString().split('T')[0];
        const festivalName =
          locale === 'te' ? festival.festival.festival_te : festival.festival.festival_en;

        if (!festivalMap.has(dateKey)) {
          festivalMap.set(dateKey, []);
        }
        festivalMap.get(dateKey)!.push({
          name: festivalName,
          url: festival.festival.festival_url,
        });
      }
    });

    // Convert to sorted array and limit to maxEvents
    const results: FestivalDate[] = [];
    festivalMap.forEach((festivals, dateKey) => {
      results.push({
        date: new Date(dateKey),
        festivals,
      });
    });

    results.sort((a, b) => a.date.getTime() - b.date.getTime());
    return results.slice(0, maxEvents);
  }, [allFestivals, today, endDate, locale, maxEvents, initialFestivals, shouldUseInitialData]);

  // Check content height and show/hide view more button
  const getLocalizedDayName = (date: Date): string => {
    const dayIndex = date.getDay();
    if (locale === 'te') {
      const teluguDays = [
        (t as any).upcomingEvents?.days?.sunday,
        (t as any).upcomingEvents?.days?.monday,
        (t as any).upcomingEvents?.days?.tuesday,
        (t as any).upcomingEvents?.days?.wednesday,
        (t as any).upcomingEvents?.days?.thursday,
        (t as any).upcomingEvents?.days?.friday,
        (t as any).upcomingEvents?.days?.saturday,
      ];
      return teluguDays[dayIndex] || format(date, 'EEEE');
    }
    return format(date, 'EEEE');
  };

  // Get localized month name
  const getLocalizedMonthName = (date: Date): string => {
    const monthIndex = date.getMonth();
    if (locale === 'te') {
      const teluguMonths = [
        (t as any).upcomingEvents?.months?.january,
        (t as any).upcomingEvents?.months?.february,
        (t as any).upcomingEvents?.months?.march,
        (t as any).upcomingEvents?.months?.april,
        (t as any).upcomingEvents?.months?.may,
        (t as any).upcomingEvents?.months?.june,
        (t as any).upcomingEvents?.months?.july,
        (t as any).upcomingEvents?.months?.august,
        (t as any).upcomingEvents?.months?.september,
        (t as any).upcomingEvents?.months?.october,
        (t as any).upcomingEvents?.months?.november,
        (t as any).upcomingEvents?.months?.december,
      ];
      return teluguMonths[monthIndex] || format(date, 'MMM');
    }
    return format(date, 'MMM');
  };

  // Check content height and show/hide view more button
  useEffect(() => {
    if (isHomePage && contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setShowViewMore(height > maxHeight);
    }
  }, [festivalDates, isHomePage, maxHeight]);

  const handleViewMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="px-4 py-3">
      <h3 className="mb-3" style={{ contentVisibility: 'visible' }}>
        {t.upcomingEvents.festivals_vrathas}
      </h3>
      <div
        ref={contentRef}
        style={{
          maxHeight: isHomePage && !isExpanded ? `${maxHeight}px` : 'none',
          overflow: isHomePage && !isExpanded ? 'hidden' : 'visible',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        {isLoading ? (
          <div className="py-3">
            {/* Render skeleton content immediately to avoid LCP delay */}
            <ul className="list-unstyled placeholder-glow">
              {[...Array(5)].map((_, idx) => (
                <li key={idx} className="border-bottom mb-2 pb-2">
                  <div className="d-flex flex-column">
                    <span className="placeholder col-4 mb-1"></span>
                    <span className="placeholder col-8"></span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : festivalDates.length === 0 ? (
          <p className="text-muted">{(t as any).upcomingEvents?.noFestivals}</p>
        ) : (
          <ul className="list-unstyled">
            {festivalDates.map((group, index) => (
              <li key={index} className="border-bottom festival-name mb-2 pb-2">
                <div className="d-flex flex-column">
                  <span className="fw-bold text-primary">
                    {locale === 'te' ? (
                      <>
                        {getLocalizedMonthName(group.date)} {format(group.date, 'dd')},{' '}
                        {getLocalizedDayName(group.date)}
                      </>
                    ) : (
                      <>
                        {format(group.date, 'MMM dd')}, {format(group.date, 'EEEE')}
                      </>
                    )}
                  </span>
                  <span className="mt-1">
                    {group.festivals.map((festival, idx) => (
                      <React.Fragment key={idx}>
                        {festival.url ? (
                          <a href={festival.url} className="text-decoration-none">
                            {festival.name}
                          </a>
                        ) : (
                          <span>{festival.name}</span>
                        )}
                        {idx < group.festivals.length - 1 && <span> / </span>}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isHomePage && showViewMore && !isExpanded && (
        <div className="mt-3 text-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewMoreClick}
            className="px-4"
          >
            {(t as any).upcomingEvents?.viewMore}
          </Button>
        </div>
      )}
      {isHomePage && showViewMore && isExpanded && (
        <div className="mt-3 text-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewMoreClick}
            className="px-4"
          >
            {(t as any).upcomingEvents?.showLess}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsV2;
