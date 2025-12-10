/**
 * useDailyCalendarData Hook
 * Encapsulates all data fetching and processing logic for Daily Calendar
 */

import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useYexaaPanchang } from '@/hooks/useYexaaPanchang';
import { DisplayAnga, getDayAngas, getSunriseDate } from '@/utils/dailyCalendarUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { getSpecialKaalForDay } from '@/utils/getSpecialKaal';
import { useEffect, useMemo, useState } from 'react';

interface UseDailyCalendarDataParams {
  date: Date;
  lat: number | undefined;
  lng: number | undefined;
  timezone: string | undefined;
  locale: string;
}

interface Festival {
  name: string;
  url: string | undefined;
}

export interface UseDailyCalendarDataReturn {
  // Panchang data
  calendar: any;
  calculated: any;
  isLoading: boolean;
  error: any;

  // Astronomy data
  sunrise: string | undefined;
  sunset: string | undefined;
  nextDaySunrise: string | undefined;
  moonrise: string | undefined;
  moonset: string | undefined;
  moonriseFull: string | undefined;
  moonsetFull: string | undefined;

  // Festival data
  festivals: Festival[];
  festivalsLoading: boolean;

  // Display data
  displayNakshatras: DisplayAnga[];
  amrits: any[];
  varjyams: any[];
}

export function useDailyCalendarData({
  date,
  lat,
  lng,
  timezone,
  locale,
}: UseDailyCalendarDataParams): UseDailyCalendarDataReturn {
  const [displayNakshatras, setDisplayNakshatras] = useState<DisplayAnga[]>([]);

  // Fetch panchang data
  const { calendar, calculated, isLoading, error } = useYexaaPanchang({
    date,
    lat,
    lng,
    enabled: Boolean(lat && lng),
  });

  // Fetch astronomy data
  const { sunrise, sunset, nextDaySunrise, moonrise, moonset, moonriseFull, moonsetFull } =
    useAstronomyBundle(date);

  // Fetch festivals
  const year = useMemo(() => date.getFullYear(), [date]);
  const { allFestivals, loading: festivalsLoading } = useAllFestivalsV2(
    year,
    undefined,
    undefined,
    undefined,
    undefined
  );

  // Process festivals
  const festivals = useMemo(() => {
    if (!allFestivals.length) return [];

    const dateStr = date.toISOString().split('T')[0];
    const matchingFestivals = allFestivals.filter(
      festival => festival.date.toISOString().split('T')[0] === dateStr
    );

    if (matchingFestivals.length === 0) return [];

    return matchingFestivals.map(f => ({
      name: locale === 'te' ? f.festival.festival_te : f.festival.festival_en,
      url: f.festival.festival_url,
    }));
  }, [allFestivals, date, locale]);

  // Calculate display nakshatras
  useEffect(() => {
    if (!calendar || !calculated || !lat || !lng) {
      setDisplayNakshatras([]);
      return;
    }

    try {
      const sunriseTime = getSunriseDate(date, lat, lng);
      const allNakshatras = getAllAngasForDay(date, lat, lng, 'nakshatra');
      const dayNakshatras = getDayAngas(allNakshatras, sunriseTime, 'nakshatra', timezone);
      setDisplayNakshatras(dayNakshatras);
    } catch (err) {
      console.error('Error calculating display nakshatras:', err);
      setDisplayNakshatras([]);
    }
  }, [calendar, calculated, lat, lng, date, timezone]);

  // Calculate special kaals
  const sunData = useMemo(
    () => ({ sunrise, sunset, nextDaySunrise }),
    [sunrise, sunset, nextDaySunrise]
  );

  const amrits = useMemo(() => {
    try {
      return getSpecialKaalForDay('amrit', displayNakshatras, date, sunData);
    } catch (err) {
      console.error('Error calculating amrit kaal:', err);
      return [];
    }
  }, [displayNakshatras, date, sunData]);

  const varjyams = useMemo(() => {
    try {
      return getSpecialKaalForDay('varjyam', displayNakshatras, date, sunData);
    } catch (err) {
      console.error('Error calculating varjyam:', err);
      return [];
    }
  }, [displayNakshatras, date, sunData]);

  return {
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
    displayNakshatras,
    amrits,
    varjyams,
  };
}
