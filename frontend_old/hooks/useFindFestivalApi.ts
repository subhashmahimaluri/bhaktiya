import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
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

interface UseFindFestivalApiReturn {
  data: FestivalsResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFindFestivalApiOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
  startDate?: Date;
  endDate?: Date;
  festivalName?: string;
}

export function useFindFestivalApi(
  options: UseFindFestivalApiOptions = {}
): UseFindFestivalApiReturn {
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

  // Memoize the formatted dates to prevent unnecessary re-renders
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

  // Map frontend slugs to backend festival names
  const festivalNameMapping: { [key: string]: string } = {
    diwali: 'diwali',
    dussehra: 'dussehra',
    'ganesh-chaturthi': 'ganesh_chaturthi',
    navratri: 'navratri',
    holi: 'holi',
    'raksha-bandhan': 'raksha_bandhan',
    janmashtami: 'janmashtami',
    'ram-navami': 'ram_navami',
    'makar-sankranti': 'makar_sankranti',
    baisakhi: 'baisakhi',
    onam: 'onam',
    pongalfestival: 'pongal',
    ugadi: 'ugadi',
    'gudi-padwa': 'gudi_padwa',
    'bhai-dooj': 'bhai_dooj',
    'karva-chauth': 'karva_chauth',
    mahashivratri: 'mahashivratri',
    'chhath-puja': 'chhath_puja',
  };

  const backendFestivalName = useMemo(() => {
    if (!festivalName) return undefined;

    // First check if the festival name is in our mapping
    const mappedName = festivalNameMapping[festivalName];
    if (mappedName) return mappedName;

    // If not in mapping, convert hyphens to spaces for the backend
    return festivalName.replace(/-/g, ' ');
  }, [festivalName]);

  const fetchFestivalsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/findFestival`;

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
        language: locale === 'te' ? 'Telugu' : 'English',
        festival_name: backendFestivalName,
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
  }, [enabled, locationData, formattedStartDate, formattedEndDate, backendFestivalName, locale]);

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
    backendFestivalName,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchFestivalsData,
  };
}
