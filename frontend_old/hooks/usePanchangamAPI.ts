import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
interface PanchangamAPIData {
  // Core panchangam data
  weekday?: string;
  tithi?: any;
  tithi_purnimantha?: string;
  lunar_month_type?: 'amanta' | 'purnimantha';
  masa_amantha?: string;
  masa_purnimantha?: string;
  nakshatra?: string;
  paksha?: string;
  samvatsara?: string;
  ritu?: string;
  ayana?: string;

  // Time data
  sunrise?: string;
  sunset?: string;
  moonrise_display?: string;
  moonset_display?: string;

  // Additional data arrays
  festivals?: any[];
  varjyam?: any[];
  day_tithis?: any;
  day_nakshatras?: any;
  day_yogas?: any;
  day_karanas?: any;

  // Auspicious and Inauspicious Times
  rahu?: string[];
  gulika?: string[];
  yamaganda?: string[];
  abhijit_muhurth?: string[];
  dhur_muhurth?: string[];
  brahma_muhurtha?: string[];
  nishitha_muhurth?: string[];
  amritha_kaal?: string[];
  aarjyam?: string[];
  pradosha_time?: string[];

  // Other fields that might be present
  [key: string]: any;
}

interface UsePanchangamAPIReturn {
  data: PanchangamAPIData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePanchangamAPIOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
}

export function usePanchangamAPI(
  date: Date,
  options: UsePanchangamAPIOptions = {}
): UsePanchangamAPIReturn {
  const { enabled = true, retryOnMount = true } = options;

  const [data, setData] = useState<PanchangamAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize the formatted date to prevent unnecessary re-renders
  const formattedDate = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  const fetchPanchangamData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/comprehensive-panchangam`;

      const locationName = `${locationData.city}, ${locationData.country}`;

      const requestBody = {
        date: formattedDate,
        time: '06:00:00',
        location: {
          name: locationName,
          latitude: locationData.lat,
          longitude: locationData.lng,
          timezone: locationData.offset,
        },
        language: locale === 'en' ? 'English' : 'Telugu',
        include_overlaps: true, // Request overlap data for enhanced functionality
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Panchangam data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, locationData.lat, formattedDate, locale]);

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
        fetchPanchangamData();
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
    formattedDate,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchPanchangamData,
  };
}
