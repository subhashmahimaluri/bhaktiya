import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
export interface VrathaInfo {
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

export interface VrathasResponse {
  start_date: string;
  end_date: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  language: string;
  vratha_name?: string;
  vrathas: VrathaInfo[];
  total_vrathas: number;
}

interface UseVrathasApiReturn {
  data: VrathasResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseVrathasApiOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
  startDate?: Date;
  endDate?: Date;
  vrathaName?: string;
}

export function useVrathasApi(options: UseVrathasApiOptions = {}): UseVrathasApiReturn {
  const {
    enabled = true,
    retryOnMount = true,
    startDate = new Date(),
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default: next year
    vrathaName,
  } = options;

  const [data, setData] = useState<VrathasResponse | null>(null);
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

  // Map frontend slugs to backend vratha names
  const vrathaNameMapping: { [key: string]: string } = {
    'pradosha-vrat': 'pradosham',
    amavasya: 'amavasya',
    ekadashi: 'ekadhashi',
    'sankashti-chaturthi': 'sankatahara_chathurthi',
    kaalashtami: 'kaalashtami',
    pournami: 'pournami',
    'masa-shivaratri': 'shivarathri',
    'skanda-sashti': 'sashti',
    'satyanarayana-swamy-puja': 'sathyanarayana_puja',
    'masik-durgashtami': 'durgashtami',
    'masik-sankranti': 'sankranti',
    'chandra-darshan': 'chandra_dharshan',
  };

  const backendVrathaName = useMemo(() => {
    if (!vrathaName) return undefined;
    return vrathaNameMapping[vrathaName] || vrathaName;
  }, [vrathaName]);

  const fetchVrathasData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/vrathas`;

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
        vratha_name: backendVrathaName,
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
          `Vrathas API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vrathas data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, locationData, formattedStartDate, formattedEndDate, backendVrathaName, locale]);

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
        fetchVrathasData();
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
    backendVrathaName,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchVrathasData,
  };
}
