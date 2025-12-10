'use client';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import React, { useMemo } from 'react';
import { Spinner } from 'react-bootstrap';

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

interface FestivalDate {
  date: Date;
  festivals: Array<{ name: string; url?: string }>;
}

interface MonthlyFestivalsListProps {
  currentDate: Date;
}

const MonthlyFestivalsList: React.FC<MonthlyFestivalsListProps> = ({ currentDate }) => {
  const { locale, t } = useTranslation();
  const { lat, lng } = useLocation();

  // Get the month boundaries
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  // Use the all festivals hook
  const { allFestivals, loading: isLoading } = useAllFestivalsV2(
    year,
    undefined,
    undefined,
    undefined,
    undefined
  );

  // Filter festivals for the current month
  const festivalDates = useMemo(() => {
    if (!allFestivals.length) return [];

    const festivalMap = new Map<string, Array<{ name: string; url?: string }>>();

    // Filter festivals within the current month
    allFestivals.forEach(festival => {
      if (festival.date >= monthStart && festival.date <= monthEnd) {
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

    // Convert to sorted array
    const results: FestivalDate[] = [];
    festivalMap.forEach((festivals, dateKey) => {
      results.push({
        date: new Date(dateKey),
        festivals,
      });
    });

    results.sort((a, b) => a.date.getTime() - b.date.getTime());
    return results;
  }, [allFestivals, monthStart, monthEnd, locale]);

  // Get localized day name
  const getLocalizedDayName = (date: Date): string => {
    const dayIndex = date.getDay();
    if (locale === 'te') {
      const teluguDays = [
        (t as any).panchangam?.sunday || (t as any).upcomingEvents?.days?.sunday,
        (t as any).panchangam?.monday || (t as any).upcomingEvents?.days?.monday,
        (t as any).panchangam?.tuesday || (t as any).upcomingEvents?.days?.tuesday,
        (t as any).panchangam?.wednesday || (t as any).upcomingEvents?.days?.wednesday,
        (t as any).panchangam?.thursday || (t as any).upcomingEvents?.days?.thursday,
        (t as any).panchangam?.friday || (t as any).upcomingEvents?.days?.friday,
        (t as any).panchangam?.saturday || (t as any).upcomingEvents?.days?.saturday,
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
        (t as any).panchangam?.january || (t as any).upcomingEvents?.months?.january,
        (t as any).panchangam?.february || (t as any).upcomingEvents?.months?.february,
        (t as any).panchangam?.march || (t as any).upcomingEvents?.months?.march,
        (t as any).panchangam?.april || (t as any).upcomingEvents?.months?.april,
        (t as any).panchangam?.may || (t as any).upcomingEvents?.months?.may,
        (t as any).panchangam?.june || (t as any).upcomingEvents?.months?.june,
        (t as any).panchangam?.july || (t as any).upcomingEvents?.months?.july,
        (t as any).panchangam?.august || (t as any).upcomingEvents?.months?.august,
        (t as any).panchangam?.september || (t as any).upcomingEvents?.months?.september,
        (t as any).panchangam?.october || (t as any).upcomingEvents?.months?.october,
        (t as any).panchangam?.november || (t as any).upcomingEvents?.months?.november,
        (t as any).panchangam?.december || (t as any).upcomingEvents?.months?.december,
      ];
      return teluguMonths[monthIndex] || format(date, 'MMMM');
    }
    return format(date, 'MMMM');
  };

  return (
    <div className="px-4 pb-3">
      <h3 className="mb-3">
        <i className="fas fa-calendar-check text-primary me-2"></i>
        {locale === 'te' ? (
          <>
            {getLocalizedMonthName(currentDate)} {year} {t.nav.festivals}
          </>
        ) : (
          <>
            {getLocalizedMonthName(currentDate)} {year} Festivals
          </>
        )}
      </h3>

      {isLoading ? (
        <div className="py-3 text-center">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted small mt-2">Loading festivals...</p>
        </div>
      ) : festivalDates.length === 0 ? (
        <p className="text-muted small">
          {locale === 'te'
            ? `${getLocalizedMonthName(currentDate)} ${year} మాసంలో పండుగలు లేదా వ్రతాలు లేవు.`
            : `No festivals or vrathas in ${getLocalizedMonthName(currentDate)} ${year}.`}
        </p>
      ) : (
        <ul className="festival-list">
          {festivalDates.map((group, index) => (
            <li key={index} className="event-item festival">
              <span className="event-date">
                {locale === 'te' ? (
                  <>
                    {format(group.date, 'dd')} {getLocalizedDayName(group.date)}
                  </>
                ) : (
                  <>
                    {format(group.date, 'dd')} {format(group.date, 'EEEE')}
                  </>
                )}
              </span>
              <span className="separator"> - </span>
              <span className="event-name">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MonthlyFestivalsList;
