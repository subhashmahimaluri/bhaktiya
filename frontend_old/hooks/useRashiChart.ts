/**
 * useRashiChart Hook
 * Handles Rashi chart computation with error handling and loading states
 */

import { RashiChart, RashiGridResult } from '@/lib/panchangam/RashiChart';
import { makeAstronomyPanchangAdapter } from '@/lib/panchangam/panchangAstronomyAdapter';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseRashiChartParams {
  date: Date;
  lat: number | undefined;
  lng: number | undefined;
  timezone: string | undefined;
  enabled?: boolean;
}

interface UseRashiChartReturn {
  gridResult: RashiGridResult | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRashiChart({
  date,
  lat,
  lng,
  timezone,
  enabled = true,
}: UseRashiChartParams): UseRashiChartReturn {
  const [gridResult, setGridResult] = useState<RashiGridResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize panchang implementation with astronomy adapter
  const panchangImpl = useMemo(() => {
    try {
      const constant = new YexaaLocalConstant();
      const base = new YexaaPanchangImpl(constant);
      return makeAstronomyPanchangAdapter(base);
    } catch (err) {
      console.error('Error initializing panchang implementation:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Initialize RashiChart
  const rashiChart = useMemo(() => {
    if (!panchangImpl) return null;
    try {
      return new RashiChart(panchangImpl, { ayanamsaMode: 'lahiri' });
    } catch (err) {
      console.error('Error initializing RashiChart:', err);
      setError(err as Error);
      return null;
    }
  }, [panchangImpl]);

  // Default mapping
  const mapping = useMemo(() => RashiChart.getDefaultMapping(), []);

  // Compute Rashi Chart
  const computeRashiChart = useCallback(async () => {
    if (!enabled || !lat || !lng || !timezone || !rashiChart) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await rashiChart.computeGridForDate(
        date,
        lat,
        lng,
        timezone,
        mapping,
        'sunrise'
      );

      setGridResult(result);
    } catch (err: any) {
      console.error('Error computing rashi chart:', err);
      setError(err);
      setGridResult(null);
    } finally {
      setLoading(false);
    }
  }, [date, lat, lng, timezone, rashiChart, mapping, enabled]);

  // Auto-compute when dependencies change
  useEffect(() => {
    computeRashiChart();
  }, [computeRashiChart]);

  return {
    gridResult,
    loading,
    error,
    refetch: computeRashiChart,
  };
}
