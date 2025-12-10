import { YexaaPanchang } from '@/lib/panchangam/yexaaPanchang';
import festivalsData from '@/public/telugu_festivals.json';
import { useEffect, useState } from 'react';

interface Festival {
  festival_name: string;
  tithi: string;
  nakshatra: string;
  telugu_month: string;
  adhik_maasa: string;
  festival_en: string;
  festival_te: string;
  vratha_name: string;
  calendar_type?: string;
  telugu_en_priority: string;
  festival_based_on?: string;
  vaara?: string;
}

interface TithiData {
  name: string;
  name_TE: string;
  ino: number;
}

interface MasaData {
  ino: number;
  name: string;
  name_TE: string;
  isLeapMonth?: boolean;
}

interface NakshatraData {
  name: string;
  name_TE: string;
  ino: number;
}

interface UseFestivalLoaderOptions {
  tithi: TithiData | null;
  masa: MasaData | null;
  nakshatra?: NakshatraData | null;
  locale: string;
  tithiTimings?: any;
  enabled?: boolean;
  date?: Date; // Add date parameter
  lat?: number; // Add location parameters
  lng?: number;
}

export function useFestivalLoader({
  tithi,
  masa,
  nakshatra = null,
  locale,
  tithiTimings = null,
  enabled = true,
  date,
  lat,
  lng,
}: UseFestivalLoaderOptions) {
  const [festivals, setFestivals] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!enabled || !tithi || !masa) {
      setFestivals(locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Use requestIdleCallback for non-blocking execution
    const scheduleWork = (callback: () => void) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout: 100 });
      } else {
        setTimeout(callback, 0);
      }
    };

    scheduleWork(() => {
      try {
        const result = getFestivalsForDateV2(
          tithi,
          masa,
          nakshatra,
          locale,
          tithiTimings,
          date,
          lat,
          lng
        );
        setFestivals(result);
      } catch (error) {
        console.error('Error loading festivals:', error);
        setFestivals(locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals');
      } finally {
        setIsLoading(false);
      }
    });
  }, [tithi, masa, nakshatra, locale, tithiTimings, enabled, date, lat, lng]);

  return { festivals, isLoading };
}

/**
 * Get festivals for a specific date considering both sunrise and pradosha calculations
 */
function getFestivalsForDateV2(
  tithi: TithiData | null,
  masa: MasaData | null,
  nakshatra: NakshatraData | null,
  locale: string,
  tithiTimings: any,
  date?: Date,
  lat?: number,
  lng?: number
): string {
  if (!tithi || !masa) {
    return locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals';
  }

  // If date and location are not provided, use the old simple matching
  if (!date || !lat || !lng) {
    return getSimpleFestivalsForDate(tithi, masa, nakshatra, locale, tithiTimings);
  }

  try {
    const panchang = new YexaaPanchang();

    // Group festivals by type
    const sunriseFestivals: Festival[] = [];
    const pradoshaFestivals: Festival[] = [];
    const ekadashiFestivals: Festival[] = [];

    (festivalsData as Festival[]).forEach(festival => {
      if (festival.vratha_name === 'ekadashi') {
        ekadashiFestivals.push(festival);
      } else {
        const calculationType = festival.festival_based_on?.toLowerCase();
        if (calculationType === 'pradosha') {
          pradoshaFestivals.push(festival);
        } else {
          sunriseFestivals.push(festival);
        }
      }
    });

    // Calculate both sunrise and pradosha calendars
    const calendarSunrise = panchang.calendar(date, lat, lng);
    const calendarPradosha = panchang.calendarAtPradosha(date, lat, lng);
    const calculated = panchang.calculate(date);

    const allMatchingFestivals: Festival[] = [];

    // For Ekadashi festivals: Calculate which tithi has majority daytime
    let predominantDaytimeTithi: string | null = null;

    if (calculated.Tithi && calculated.Tithi.start && calculated.Tithi.end) {
      const sunTimer = panchang.sunTimer(date, lat, lng);
      const sunrise = sunTimer.sunRise;
      const sunset = sunTimer.sunSet;

      if (!sunrise || !sunset) {
        predominantDaytimeTithi = String(Number(calculated.Tithi.ino) + 1);
      } else {
        const tithiStart = new Date(calculated.Tithi.start);
        const tithiEnd = new Date(calculated.Tithi.end);

        // Convert to timestamps
        const sunriseTime = sunrise.getTime();
        const sunsetTime = sunset.getTime();
        const tithiStartTime = tithiStart.getTime();
        const tithiEndTime = tithiEnd.getTime();
        // Check if current tithi is present during daytime
        const currentTithiDuringDay = tithiStartTime < sunsetTime && tithiEndTime > sunriseTime;

        // Check if tithi ends on the same day
        const isSameDay =
          tithiEnd.getDate() === date.getDate() &&
          tithiEnd.getMonth() === date.getMonth() &&
          tithiEnd.getFullYear() === date.getFullYear();

        if (currentTithiDuringDay && isSameDay) {
          // Calculate daytime coverage for current tithi
          const daytimeStart = Math.max(sunriseTime, tithiStartTime);
          const daytimeEnd = Math.min(sunsetTime, tithiEndTime);
          const currentTithiDuration = daytimeEnd - daytimeStart;

          // Calculate daytime coverage for next tithi (if it starts today)
          const nextTithiIndex = (Number(calculated.Tithi.ino) + 1) % 30;
          const nextTithiStart = tithiEndTime;
          const nextTithiEnd = sunsetTime;
          const nextTithiDuration = Math.max(0, nextTithiEnd - nextTithiStart);

          // Determine which tithi has majority
          if (nextTithiDuration > currentTithiDuration) {
            predominantDaytimeTithi = String(nextTithiIndex + 1); // 1-based
          } else {
            predominantDaytimeTithi = String(Number(calculated.Tithi.ino) + 1); // 1-based
          }
        } else {
          predominantDaytimeTithi = String(Number(calculated.Tithi.ino) + 1); // 1-based
        }
      }
    }

    // Check Ekadashi festivals based on predominant daytime tithi
    if (ekadashiFestivals.length > 0 && predominantDaytimeTithi) {
      const matchingEkadashi = ekadashiFestivals.filter(festival => {
        // Match by predominant tithi
        if (festival.tithi !== predominantDaytimeTithi) {
          return false;
        }

        // Check masa if specified
        const masaIndex = String(Number(calendarSunrise.MoonMasa.ino) + 1);
        if (festival.telugu_month !== '' && festival.telugu_month !== masaIndex) {
          return false;
        }

        // Check adhik masa
        const festivalIsAdhikMasa = festival.adhik_maasa === '1';
        const isLeapMonth = calendarSunrise.MoonMasa.isLeapMonth || false;
        if (festivalIsAdhikMasa && !isLeapMonth) {
          return false;
        }
        if (!festivalIsAdhikMasa && isLeapMonth) {
          return false;
        }

        return true;
      });

      allMatchingFestivals.push(...matchingEkadashi);
    }

    // Check sunrise-based festivals (non-Ekadashi)
    if (sunriseFestivals.length > 0) {
      const matchingSunrise = getMatchingFestivalsHelper(
        calendarSunrise.Tithi,
        calendarSunrise.MoonMasa,
        calendarSunrise.Nakshatra,
        tithiTimings,
        sunriseFestivals,
        false, // No special Ekadashi handling
        null
      );
      allMatchingFestivals.push(...matchingSunrise);
    }

    // Check pradosha-based festivals
    if (pradoshaFestivals.length > 0) {
      const matchingPradosha = getMatchingFestivalsHelper(
        calendarPradosha.Tithi,
        calendarPradosha.MoonMasa,
        calendarPradosha.Nakshatra,
        tithiTimings,
        pradoshaFestivals
      );
      allMatchingFestivals.push(...matchingPradosha);
    }

    if (allMatchingFestivals.length === 0) {
      return locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals';
    }

    // Sort by priority
    allMatchingFestivals.sort((a, b) => {
      const priorityA = parseInt(a.telugu_en_priority) || 999;
      const priorityB = parseInt(b.telugu_en_priority) || 999;
      return priorityA - priorityB;
    });

    // Get festival names
    const festivalNames = allMatchingFestivals.map(festival =>
      locale === 'te' ? festival.festival_te : festival.festival_en
    );

    return festivalNames.join(', ');
  } catch (error) {
    console.error('Error in getFestivalsForDateV2:', error);
    // Fallback to simple matching
    return getSimpleFestivalsForDate(tithi, masa, nakshatra, locale, tithiTimings);
  }
}

/**
 * Simple festival matching without pradosha support (fallback)
 */
function getSimpleFestivalsForDate(
  tithi: TithiData,
  masa: MasaData,
  nakshatra: NakshatraData | null,
  locale: string,
  tithiTimings: any
): string {
  const tithiIndex = String(tithi.ino + 1);
  const masaIndex = String(masa.ino + 1);
  const isLeapMonth = masa.isLeapMonth || false;

  let ekadashiStartsToday = false;
  let ekadashiTithiThatStartsToday: string | null = null;

  // Ekadashi detection logic
  if (Array.isArray(tithiTimings) && tithiTimings.length > 0) {
    tithiTimings.forEach((timing, index) => {
      if (typeof timing === 'object' && timing !== null && 'start' in timing) {
        const overlappingTithiIndex = String(tithi.ino + index + 1);
        if ((timing as any).start && overlappingTithiIndex !== tithiIndex) {
          if (overlappingTithiIndex === '11' || overlappingTithiIndex === '26') {
            ekadashiStartsToday = true;
            ekadashiTithiThatStartsToday = overlappingTithiIndex;
          }
        }
      }
    });
  } else if (tithiTimings && typeof tithiTimings === 'object') {
    const tithiEnd = tithiTimings.end;
    if (tithiEnd && tithiEnd instanceof Date) {
      // Check if tithi ends on the SAME DAY (not next day)
      // We don't have access to the original date here, but tithiTimings
      // should have been validated before reaching this point
      const tithiStart = tithiTimings.start;
      if (tithiStart && tithiStart instanceof Date) {
        const isSameDay =
          tithiEnd.getDate() === tithiStart.getDate() &&
          tithiEnd.getMonth() === tithiStart.getMonth() &&
          tithiEnd.getFullYear() === tithiStart.getFullYear();

        if (isSameDay) {
          const nextTithiIndex = String(((tithi.ino + 1) % 30) + 1);
          if (nextTithiIndex !== tithiIndex) {
            if (nextTithiIndex === '11' || nextTithiIndex === '26') {
              ekadashiStartsToday = true;
              ekadashiTithiThatStartsToday = nextTithiIndex;
            }
          }
        }
      }
    }
  }

  const matchingFestivals = getMatchingFestivalsHelper(
    tithi,
    masa,
    nakshatra,
    tithiTimings,
    festivalsData as Festival[],
    ekadashiStartsToday,
    ekadashiTithiThatStartsToday,
    isLeapMonth
  );

  if (matchingFestivals.length === 0) {
    return locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals';
  }

  matchingFestivals.sort((a, b) => {
    const priorityA = parseInt(a.telugu_en_priority) || 999;
    const priorityB = parseInt(b.telugu_en_priority) || 999;
    return priorityA - priorityB;
  });

  const festivalNames = matchingFestivals.map(festival =>
    locale === 'te' ? festival.festival_te : festival.festival_en
  );

  return festivalNames.join(', ');
}

/**
 * Helper function to match festivals
 */
function getMatchingFestivalsHelper(
  tithi: any,
  masa: any,
  nakshatra: any,
  tithiTimings: any,
  festivalsToCheck: Festival[],
  ekadashiStartsToday: boolean = false,
  ekadashiTithiThatStartsToday: string | null = null,
  isLeapMonth: boolean = false
): Festival[] {
  if (!tithi || !masa) {
    return [];
  }

  const tithiIndex = String(tithi.ino + 1);
  const masaIndex = String(masa.ino + 1);
  const nakshatraIndex = nakshatra ? String(nakshatra.ino + 1) : '';

  // If leap month info not provided, get from masa
  if (masa.isLeapMonth !== undefined) {
    isLeapMonth = masa.isLeapMonth;
  }

  return festivalsToCheck.filter(festival => {
    // Filter by calendar type
    if (festival.calendar_type !== '0' && festival.calendar_type !== '2') {
      return false;
    }

    const festivalIsAdhikMasa = festival.adhik_maasa === '1';

    // Check adhik masa
    if (festivalIsAdhikMasa && !isLeapMonth) {
      return false;
    }
    if (!festivalIsAdhikMasa && isLeapMonth) {
      return false;
    }

    // Special Ekadashi handling
    if (
      festival.vratha_name === 'ekadashi' &&
      ekadashiStartsToday &&
      ekadashiTithiThatStartsToday
    ) {
      if (festival.tithi === ekadashiTithiThatStartsToday) {
        if (festival.telugu_month !== '' && festival.telugu_month !== masaIndex) {
          return false;
        }
        return true;
      } else {
      }
    }

    // Match by nakshatra if specified
    if (festival.nakshatra !== '') {
      if (festival.nakshatra !== nakshatraIndex) {
        return false;
      }
      if (festival.telugu_month !== '' && festival.telugu_month !== masaIndex) {
        return false;
      }
      return true;
    }

    // Match by tithi
    const festivalTithiMatch = festival.tithi === '' || festival.tithi === tithiIndex;

    if (festival.tithi !== '' && festival.telugu_month !== '') {
      return festivalTithiMatch && festival.telugu_month === masaIndex;
    }

    if (festival.tithi !== '' && festival.telugu_month === '') {
      return festivalTithiMatch;
    }

    if (festival.tithi === '' && festival.telugu_month !== '') {
      return festival.telugu_month === masaIndex;
    }

    return false;
  });
}
