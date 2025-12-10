import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
export interface FestivalInfo {
  date: string;
  name: string;
  description?: string;
  tithi?: string;
  nakshatra?: string;
  month?: string;
  day?: string;
  te_en_prioarity?: string;
  festival_based_on?: string;
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
  festivals: FestivalInfo[];
  total_festivals: number;
}

interface UseFestivalsApiReturn {
  data: FestivalsResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFestivalsApiOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
  startDate?: Date;
  endDate?: Date;
  festivalNameContains?: string;
}

export function useFestivalsApi(options: UseFestivalsApiOptions = {}): UseFestivalsApiReturn {
  const {
    enabled = true,
    retryOnMount = true,
    startDate = new Date(),
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: next 30 days
    festivalNameContains,
  } = options;

  const [data, setData] = useState<FestivalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize the formatted dates to prevent unnecessary re-renders
  const formattedStartDate = useMemo(() => format(startDate, 'yyyy-MM-dd'), [startDate]);
  const formattedEndDate = useMemo(() => format(endDate, 'yyyy-MM-dd'), [endDate]);

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  const fetchFestivalsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/en_te_festivals`;

      const locationName = `${locationData.city}, ${locationData.country}`;

      const requestBody = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        location: {
          name: locationName,
          latitude: locationData.lat,
          longitude: locationData.lng,
          timezone: locationData.offset,
        },
        language: locale === 'en' ? 'English' : 'Telugu',
        festival_name_contains: festivalNameContains,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Festivals API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch festivals data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, locationData, formattedStartDate, formattedEndDate, locale, festivalNameContains]);

  // Auto-fetch on mount and dependencies change with debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have the required data
    if (retryOnMount && enabled && locationData.lat && locationData.lng) {
      // Debounce API calls to prevent rapid successive requests
      timeoutRef.current = setTimeout(() => {
        fetchFestivalsData();
      }, 300); // 300ms debounce
    } else {
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    enabled,
    retryOnMount,
    locationData.lat,
    locationData.lng,
    locationData.city,
    locationData.country,
    formattedStartDate,
    formattedEndDate,
    locale,
    festivalNameContains,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchFestivalsData,
  };
}
