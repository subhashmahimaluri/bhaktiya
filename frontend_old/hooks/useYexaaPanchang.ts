import { YexaaPanchang } from '@/lib/panchangam';
import { useEffect, useMemo, useState } from 'react';

interface UseYexaaPanchangOptions {
  date?: Date | string;
  lat?: number;
  lng?: number;
  enabled?: boolean;
}

interface UseYexaaPanchangResult {
  calendar: any;
  calculated: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useYexaaPanchang({
  date,
  lat,
  lng,
  enabled = true,
}: UseYexaaPanchangOptions = {}): UseYexaaPanchangResult {
  const [calendar, setCalendar] = useState<any>(null);
  const [calculated, setCalculated] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const panchangamDate = useMemo(() => (date ? new Date(date) : new Date()), [date]);

  const fetchData = () => {
    if (!enabled || !lat || !lng) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const panchang = new YexaaPanchang();

      const calendarData = panchang.calendar(panchangamDate, lat, lng);
      const calculatedData = panchang.calculate(panchangamDate);

      setCalendar(calendarData);
      setCalculated(calculatedData);
    } catch (err) {
      console.error('Failed to fetch panchangam data', err);
      setError('Failed to fetch panchangam data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lat, lng, panchangamDate, enabled]);

  return {
    calendar,
    calculated,
    isLoading,
    error,
    refetch: fetchData,
  };
}
