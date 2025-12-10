import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
export interface EclipseContactInfo {
  first_contact?: string;
  second_contact?: string;
  third_contact?: string;
  fourth_contact?: string;
}

export interface EclipseVisibilityInfo {
  visible_at_location: boolean;
  visibility_description: string;
  local_timings: {
    first_contact?: string;
    second_contact?: string;
    third_contact?: string;
    fourth_contact?: string;
  };
}

export interface EclipseInfo {
  type: string;
  eclipse_type: string;
  eclipse_type_label:
    | 'solar_eclipse'
    | 'total_solar_eclipse'
    | 'lunar_eclipse'
    | 'total_lunar_eclipse'
    | 'partial_lunar_eclipse'
    | 'eclipses'; // Constrained to valid translation keys
  jd: number;
  datetime_utc: string;
  datetime_local: string;
  magnitude?: number;
  obscuration?: number;
  umbral_magnitude?: number;
  penumbral_magnitude?: number;
  saros_series?: number;
  saros_member?: number;
  contacts: EclipseContactInfo;
  sun_altitude?: number;
  sun_azimuth?: number;
  visibility: EclipseVisibilityInfo;
  // Additional properties for detailed eclipse information
  moonrise?: string;
  moonset?: string;
  duration_total?: string;
  duration_partial?: string;
  duration_penumbral?: string;
  sutak_begin?: string;
  sutak_end?: string;
  sutak_kids_begin?: string;
  sutak_kids_end?: string;
}

export interface EclipseResponse {
  start_date: string;
  end_date: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  eclipse_type: string;
  eclipses: EclipseInfo[];
  total_eclipses: number;
}

interface UseEclipseDetailsOptions {
  jd: number;
  eclipseType: 'solar' | 'lunar';
  enabled?: boolean;
}

interface UseEclipseDetailsReturn {
  data: EclipseInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseEclipsesApiReturn {
  data: EclipseResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseEclipsesApiOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
  startDate?: Date;
  endDate?: Date;
  eclipseType?: 'solar' | 'lunar' | 'both';
}

export function useEclipsesApi(options: UseEclipsesApiOptions = {}): UseEclipsesApiReturn {
  const {
    enabled = true,
    retryOnMount = true,
    startDate = new Date(),
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default: next 365 days
    eclipseType = 'both',
  } = options;

  const [data, setData] = useState<EclipseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize the formatted dates to prevent unnecessary re-renders
  const formattedDates = useMemo(
    () => ({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    }),
    [startDate, endDate]
  );

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  // Memoize request body to prevent unnecessary re-renders
  const requestBody = useMemo(() => {
    const locationName = `${locationData.city}, ${locationData.country}`;
    return {
      start_date: formattedDates.startDate,
      end_date: formattedDates.endDate,
      location: {
        name: locationName,
        latitude: locationData.lat,
        longitude: locationData.lng,
        timezone: locationData.offset, // Will be calculated server-side with DST awareness
      },
      eclipse_type: eclipseType,
    };
  }, [enabled, locationData, formattedDates, eclipseType]);

  const fetchEclipsesData = useCallback(async () => {
    // Early return if not enabled or missing location data
    if (!requestBody) {
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/eclipse-list`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Eclipses API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch eclipses data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [requestBody, formattedDates, locationData]);

  // Auto-fetch on mount and dependencies change with debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have the required data
    if (retryOnMount && enabled && locationData.lat && locationData.lng && requestBody) {
      // Debounce API calls to prevent rapid successive requests
      timeoutRef.current = setTimeout(() => {
        fetchEclipsesData();
      }, 300); // 300ms debounce
    } else {
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, retryOnMount, locationData.lat, locationData.lng, requestBody, fetchEclipsesData]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchEclipsesData,
  };
}

export function useEclipseDetails(options: UseEclipseDetailsOptions): UseEclipseDetailsReturn {
  const { jd, eclipseType, enabled = true } = options;

  const [data, setData] = useState<EclipseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country } = useLocation();

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(() => ({ lat, lng, city, country }), [lat, lng, city, country]);

  // Memoize request body to prevent unnecessary re-renders
  const requestBody = useMemo(() => {
    if (
      !enabled ||
      !locationData.lat ||
      !locationData.lng ||
      !locationData.city ||
      !locationData.country
    ) {
      return null;
    }

    const locationName = `${locationData.city}, ${locationData.country}`;
    return {
      jd,
      eclipse_type: eclipseType,
      location: {
        name: locationName,
        latitude: locationData.lat,
        longitude: locationData.lng,
        timezone: 0, // Will be calculated server-side with DST awareness
      },
    };
  }, [enabled, jd, eclipseType, locationData]);

  const fetchEclipseDetails = useCallback(async () => {
    // Early return if not enabled or missing location data
    if (
      !enabled ||
      !locationData.lat ||
      !locationData.lng ||
      !locationData.city ||
      !locationData.country
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/eclipse-details`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Eclipse Details API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch eclipse details';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, jd, eclipseType, locationData, requestBody]);

  // Auto-fetch on mount and dependencies change with debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have the required data
    if (enabled && jd && eclipseType && locationData.lat && locationData.lng && requestBody) {
      // Debounce API calls to prevent rapid successive requests
      timeoutRef.current = setTimeout(() => {
        fetchEclipseDetails();
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
    jd,
    eclipseType,
    locationData.lat,
    locationData.lng,
    requestBody,
    fetchEclipseDetails,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchEclipseDetails,
  };
}

// New hook to fetch eclipse details by slug (simplified approach)
interface UseEclipseDetailsBySlugOptions {
  slug: string;
  enabled?: boolean;
}

interface UseEclipseDetailsBySlugReturn {
  data: EclipseInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEclipseDetailsBySlug(
  options: UseEclipseDetailsBySlugOptions
): UseEclipseDetailsBySlugReturn {
  const { slug, enabled = true } = options;

  const [data, setData] = useState<EclipseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country } = useLocation();

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(() => ({ lat, lng, city, country }), [lat, lng, city, country]);

  // Memoize request body to prevent unnecessary re-renders
  const requestBody = useMemo(() => {
    if (
      !enabled ||
      !locationData.lat ||
      !locationData.lng ||
      !locationData.city ||
      !locationData.country ||
      !slug
    ) {
      return null;
    }

    const locationName = `${locationData.city}, ${locationData.country}`;
    return {
      slug,
      location: {
        name: locationName,
        latitude: locationData.lat,
        longitude: locationData.lng,
        timezone: 0, // Will be calculated server-side with DST awareness
      },
    };
  }, [enabled, slug, locationData]);

  const fetchEclipseDetailsBySlug = useCallback(async () => {
    // Early return if not enabled or missing data
    if (
      !enabled ||
      !locationData.lat ||
      !locationData.lng ||
      !locationData.city ||
      !locationData.country ||
      !slug
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/eclipse-by-slug`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Eclipse Details By Slug API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch eclipse details by slug';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, slug, locationData, requestBody]);

  // Auto-fetch on mount and dependencies change with debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only fetch if we have the required data
    if (enabled && slug && locationData.lat && locationData.lng && requestBody) {
      // Debounce API calls to prevent rapid successive requests
      timeoutRef.current = setTimeout(() => {
        fetchEclipseDetailsBySlug();
      }, 300); // 300ms debounce
    } else {
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, slug, locationData.lat, locationData.lng, requestBody, fetchEclipseDetailsBySlug]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchEclipseDetailsBySlug,
  };
}
