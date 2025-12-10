import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
interface DayMuhurthasInfo {
  date: string;
  weekday: string;
  rahu: string[];
  dhur_muhurth: string[];
}

interface UseFirstWeekMuhurthasAPIReturn {
  data: DayMuhurthasInfo[] | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseFirstWeekMuhurthasAPIOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
}

export function useFirstWeekMuhurthasAPI(
  month: string, // Format: YYYY-MM (e.g., "2025-10")
  options: UseFirstWeekMuhurthasAPIOptions = {}
): UseFirstWeekMuhurthasAPIReturn {
  const { enabled = true, retryOnMount = true } = options;

  const [data, setData] = useState<DayMuhurthasInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  const fetchFirstWeekMuhurthas = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/first-week-muhurthas-list`;

      const locationName = `${locationData.city}, ${locationData.country}`;

      const requestBody = {
        month: month,
        location: {
          name: locationName,
          latitude: locationData.lat,
          longitude: locationData.lng,
          timezone: locationData.offset,
        },
        language: locale === 'en' ? 'English' : 'Telugu',
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch First Week Muhurthas data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, locationData, month, locale]);

  // Auto-fetch on mount and dependencies change with debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have the required data
    if (retryOnMount && enabled && locationData.lat && locationData.lng && month) {
      // Debounce API calls to prevent rapid successive requests
      timeoutRef.current = setTimeout(() => {
        fetchFirstWeekMuhurthas();
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
    month,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchFirstWeekMuhurthas,
  };
}
