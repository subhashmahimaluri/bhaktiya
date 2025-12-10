import { calculateMonthPanchangamData } from '@/utils/calendarPanchangamData';
import { useEffect, useState } from 'react';

interface UseCalendarPanchangamOptions {
  year: number;
  month: number; // 1-12
  lat: number;
  lng: number;
  enabled?: boolean;
}

interface UseCalendarPanchangamResult {
  data: Map<string, any>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch panchangam data for all days in a month
 * Useful for preloading calendar data without making individual API calls
 */
export function useCalendarPanchangam({
  year,
  month,
  lat,
  lng,
  enabled = true,
}: UseCalendarPanchangamOptions): UseCalendarPanchangamResult {
  const [data, setData] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    if (!enabled || !year || !month || !lat || !lng) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const panchangamData = calculateMonthPanchangamData(year, month, lat, lng);
      setData(panchangamData);
    } catch (err) {
      console.error('Failed to calculate calendar panchangam data:', err);
      setError('Failed to calculate calendar panchangam data');
      setData(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month, lat, lng, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
