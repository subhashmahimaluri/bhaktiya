import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { YexaaPanchang } from '@/lib/panchangam';
import festivalsData from '@/public/telugu_festivals.json';
import { getMatchingFestivals } from '@/utils/festivalMatcher';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Types for hook
export interface FestivalInfo {
  date: string;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  tithi?: string | null;
  nakshatra?: string | null;
  month?: string | null;
  day?: string | null;
}

export interface FestivalsResponse {
  start_date: string;
  end_date: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  language: string;
  festival_name?: string;
  festivals: FestivalInfo[];
  total_festivals: number;
}

interface UseFindFestivalReturn {
  data: FestivalsResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFindFestivalOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
  startDate?: Date;
  endDate?: Date;
  festivalName?: string;
}

// Interface for festival data from JSON
interface FestivalData {
  festival_name: string;
  tithi: string;
  nakshatra: string;
  telugu_month: string;
  vaara: string;
  adhik_maasa: string;
  festival_type: string;
  vratha_name: string;
  calendar_type: string;
  festival_en: string;
  festival_te: string;
  telugu_en_priority: string;
  festival_based_on: string;
}

// Map festival slugs to festival names from JSON
const getFestivalBySlug = (slug: string): FestivalData | null => {
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');

  // Try to find exact match first
  let festival = (festivalsData as FestivalData[]).find(
    f =>
      f.festival_name.toLowerCase() === normalizedSlug ||
      f.festival_en.toLowerCase() === normalizedSlug ||
      f.festival_te.toLowerCase() === normalizedSlug
  );

  // If not found, try partial match
  if (!festival) {
    festival = (festivalsData as FestivalData[]).find(
      f =>
        f.festival_name.toLowerCase().includes(normalizedSlug) ||
        f.festival_en.toLowerCase().includes(normalizedSlug) ||
        f.festival_te.toLowerCase().includes(normalizedSlug)
    );
  }

  return festival || null;
};

// Wrapper function to convert YexaaPanchang objects to festivalMatcher types
const getMatchingFestivalsForDate = (
  tithi: any,
  masa: any,
  nakshatra: any,
  currentDate: Date,
  panchang: any,
  latitude: number,
  longitude: number
): any[] => {
  if (!tithi || !masa) {
    return [];
  }

  // Convert to expected format for festivalMatcher
  const tithiData = {
    name: tithi.name || '',
    name_TE: tithi.name_TE || '',
    ino: tithi.ino || 0,
  };

  const masaData = {
    ino: masa.ino || 0,
    name: masa.name || '',
    name_TE: masa.name_TE || '',
    isLeapMonth: masa.isLeapMonth || false,
  };

  const nakshatraData = nakshatra
    ? {
        name: nakshatra.name || '',
        name_TE: nakshatra.name_TE || '',
        ino: nakshatra.ino || 0,
      }
    : null;

  return getMatchingFestivals(tithiData, masaData, nakshatraData);
};

// Helper function to check if Pradosha time falls within Amavasya tithi period
const isPradoshaInAmavasya = (tithiTimings: any, pradoshaTimeStr: string): boolean => {
  if (!tithiTimings || !pradoshaTimeStr) {
    return false;
  }

  try {
    // Parse Pradosha time to get hours
    const pradoshaTime = new Date(`2000-01-01 ${pradoshaTimeStr}`);
    const pradoshaHour = pradoshaTime.getHours();

    // Check if tithiTimings is an array (multiple tithis)
    if (Array.isArray(tithiTimings)) {
      // Find Amavasya (tithi 30) in the timings
      const amavasyaTiming = tithiTimings.find(
        (timing: any) => timing && (timing.ino === 29 || timing.ino === 59) // 29 or 59 corresponds to tithi 30
      );

      if (amavasyaTiming && amavasyaTiming.start) {
        const startTime = new Date(amavasyaTiming.start);
        const startHour = startTime.getHours();

        // If Pradosha time is after Amavasya starts, it falls within Amavasya period
        return pradoshaHour >= startHour;
      }
    } else if (tithiTimings.start && tithiTimings.end) {
      // Single tithi object with start/end times
      const startTime = new Date(tithiTimings.start);
      const startHour = startTime.getHours();

      // If Pradosha time is after Amavasya starts, it falls within Amavasya period
      return pradoshaHour >= startHour;
    }

    return false;
  } catch (error) {
    console.error('Error checking Pradosha in Amavasya:', error);
    return false;
  }
};

export function useFindFestival(options: UseFindFestivalOptions = {}): UseFindFestivalReturn {
  const {
    enabled = true,
    retryOnMount = true,
    startDate = new Date(),
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default: next year
    festivalName,
  } = options;

  const [data, setData] = useState<FestivalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize formatted dates to prevent unnecessary re-renders
  const formattedStartDate = useMemo(() => {
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [startDate]);

  const formattedEndDate = useMemo(() => {
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [endDate]);

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  const fetchFestivalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      if (!festivalName) {
        throw new Error('Festival name is required');
      }

      // Get festival data from JSON
      const festivalData = getFestivalBySlug(festivalName);
      if (!festivalData) {
        throw new Error(`Festival "${festivalName}" not found in festival data`);
      }

      // Initialize YexaaPanchang
      const panchang = new YexaaPanchang();

      // Default to Hyderabad coordinates if location not available
      const latitude = locationData.lat || 17.385;
      const longitude = locationData.lng || 78.4867;

      // Calculate festival dates for year range
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const festivalDates: FestivalInfo[] = [];

      // For each year in the range, find festival date
      // Use same approach as all-festivals page - iterate through each day
      for (let year = startYear; year <= endYear; year++) {
        try {
          // Iterate through each day of the year
          const yearStartDate = new Date(year, 0, 1);
          const yearEndDate = new Date(year + 1, 0, 1);
          const currentDate = new Date(yearStartDate);

          while (currentDate < yearEndDate) {
            try {
              const calendar = panchang.calendar(currentDate, latitude, longitude);
              const calculated = panchang.calculate(currentDate);

              // Get matching festivals for this date using our wrapper function
              // Use MoonMasa instead of Masa for accurate festival matching
              const matchingFestivals = getMatchingFestivalsForDate(
                calendar.Tithi,
                calendar.MoonMasa,
                calendar.Nakshatra,
                currentDate,
                panchang,
                latitude,
                longitude
              );

              // Check if our target festival is in the matching festivals
              const targetFestival = matchingFestivals.find(
                (f: any) =>
                  f.festival_name.toLowerCase() === festivalData.festival_name.toLowerCase() ||
                  f.festival_en.toLowerCase() === festivalData.festival_name.toLowerCase() ||
                  f.festival_te.toLowerCase() === festivalData.festival_name.toLowerCase()
              );

              if (targetFestival) {
                // Check if date is within our requested range
                if (currentDate >= startDate && currentDate <= endDate) {
                  const festivalInfo: FestivalInfo = {
                    date: currentDate.toISOString().split('T')[0],
                    name: locale === 'te' ? targetFestival.festival_te : targetFestival.festival_en,
                    description:
                      locale === 'te' ? targetFestival.festival_te : targetFestival.festival_en,
                    tithi: targetFestival.tithi,
                    month: targetFestival.telugu_month,
                  };

                  festivalDates.push(festivalInfo);
                }
              }
            } catch (error) {
              console.error(`Error calculating panchangam for date ${currentDate}:`, error);
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } catch (error) {
          console.error(`Error calculating festival date for year ${year}:`, error);
        }
      }

      // Sort dates
      festivalDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Create response object
      const responseData: FestivalsResponse = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        location: {
          name: `${locationData.city}, ${locationData.country}`,
          latitude: locationData.lat,
          longitude: locationData.lng,
          timezone: locationData.offset,
        },
        language: locale === 'te' ? 'Telugu' : 'English',
        festival_name: festivalName,
        festivals: festivalDates,
        total_festivals: festivalDates.length,
      };

      setData(responseData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch festival data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    locationData,
    formattedStartDate,
    formattedEndDate,
    festivalName,
    locale,
    startDate,
    endDate,
  ]);

  // Auto-fetch on mount and dependencies change
  useEffect(() => {
    if (retryOnMount && enabled && locationData.lat && locationData.lng && festivalName) {
      fetchFestivalData();
    }
  }, [
    enabled,
    retryOnMount,
    locationData.lat,
    locationData.lng,
    locationData.city,
    locationData.country,
    formattedStartDate,
    formattedEndDate,
    festivalName,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchFestivalData,
  };
}
