import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for the hook
interface MonthlyBasicPanchangamDay {
  date: string;
  weekday: string;
  tithi: {
    name: string;
    start: string;
    end: string;
    number: number;
    paksha: string;
  };
  nakshatra: {
    name: string;
    start: string;
    end: string;
    number: number;
    pada: number;
  };
  varjyam: string[];
}

interface MonthlyBasicPanchangamData {
  start_date: string;
  end_date: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  language: string;
  days: MonthlyBasicPanchangamDay[];
  total_days: number;
}

interface UseMonthlyPanchangamAPIReturn {
  data: MonthlyBasicPanchangamData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMonthlyPanchangamAPIOptions {
  enabled?: boolean;
  retryOnMount?: boolean;
}

export function useMonthlyPanchangamAPI(
  month: Date, // Date object representing the month (any day in the month)
  options: UseMonthlyPanchangamAPIOptions = {}
): UseMonthlyPanchangamAPIReturn {
  const { enabled = true, retryOnMount = true } = options;

  const [data, setData] = useState<MonthlyBasicPanchangamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lat, lng, city, country, offset } = useLocation();
  const { locale } = useTranslation();

  // Memoize the formatted month to prevent unnecessary re-renders
  const formattedMonth = useMemo(() => format(month, 'yyyy-MM'), [month]);

  // Memoize location data to prevent unnecessary re-renders
  const locationData = useMemo(
    () => ({ lat, lng, city, country, offset }),
    [lat, lng, city, country, offset]
  );

  const fetchMonthlyPanchangamData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001';
      const apiUrl = `${pythonApiUrl}/api/date-range-basic-panchangam`;

      // Calculate start and end dates for the entire calendar view (including previous/next month filler dates)
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;

      // Get first day of the month and its weekday (0=Sunday, 6=Saturday)
      const firstDayOfMonth = new Date(year, monthNum - 1, 1);
      const firstWeekday = firstDayOfMonth.getDay();

      // Get last day of the month
      const lastDayOfMonth = new Date(year, monthNum, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      // Calculate total cells needed (5 or 6 weeks * 7 days)
      const totalNeeded = firstWeekday + daysInMonth;
      const rows = totalNeeded <= 35 ? 5 : 6;
      const totalCells = rows * 7;

      // Calculate start date (first Sunday of the calendar grid)
      const startDateObj = new Date(firstDayOfMonth);
      startDateObj.setDate(firstDayOfMonth.getDate() - firstWeekday);

      // Calculate end date (last Saturday of the calendar grid)
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + totalCells - 1);

      // Format dates for API
      const startDate = format(startDateObj, 'yyyy-MM-dd');
      const endDate = format(endDateObj, 'yyyy-MM-dd');

      const locationName = `${locationData.city}, ${locationData.country}`;

      const requestBody = {
        start_date: startDate,
        end_date: endDate,
        location: {
          name: locationName,
          latitude: locationData.lat,
          longitude: locationData.lng,
          timezone: locationData.offset, // Let the API calculate DST-aware timezone
        },
        language: locale === 'en' ? 'English' : 'Telugu',
        ayanamsa_mode: 'LAHIRI',
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
          `Monthly API responded with status ${response.status}: ${response.statusText}`
        );
      }

      const apiData = await response.json();

      // Log first few days for debugging
      if (apiData.days && apiData.days.length > 0) {
      }

      setData(apiData);
      setIsError(false);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch Monthly Panchangam data';

      setIsError(true);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, locationData, formattedMonth, locale]);

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
        fetchMonthlyPanchangamData();
      }, 500); // 500ms debounce for monthly data
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
    formattedMonth,
    locale,
  ]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchMonthlyPanchangamData,
  };
}

// Helper function to get day data by date
export function getDayDataByDate(
  monthlyData: MonthlyBasicPanchangamData | null,
  date: string
): MonthlyBasicPanchangamDay | null {
  if (!monthlyData || !monthlyData.days) {
    return null;
  }

  return monthlyData.days.find(day => day.date === date) || null;
}

// Helper function to check if data is for current month
export function isDataForMonth(
  monthlyData: MonthlyBasicPanchangamData | null,
  month: string
): boolean {
  if (!monthlyData) return false;

  // Extract year and month from start_date
  const dataMonth = monthlyData.start_date.substring(0, 7); // YYYY-MM
  return dataMonth === month;
}

export default useMonthlyPanchangamAPI;
