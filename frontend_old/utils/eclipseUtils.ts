import { EclipseInfo } from '@/hooks/useEclipsesApi';

/**
 * Format eclipse time for display
 */
export const formatEclipseTime = (
  eclipse: EclipseInfo,
  timezone: string = 'Asia/Calcutta'
): string => {
  const date = new Date(eclipse.datetime_local);
  return date.toLocaleTimeString('en-IN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format eclipse date and time for display
 */
export const formatEclipseDateTime = (
  eclipse: EclipseInfo,
  timezone: string = 'Asia/Calcutta'
): string => {
  const date = new Date(eclipse.datetime_local);
  return date.toLocaleDateString('en-IN', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get eclipse icon based on type
 */
export const getEclipseIcon = (eclipse: EclipseInfo): string => {
  return eclipse.type === 'solar' ? '☀️' : '🌙';
};

/**
 * Get eclipse type color for badges
 */
export const getEclipseTypeColor = (eclipse: EclipseInfo): string => {
  const eclipseType = eclipse.eclipse_type.toLowerCase();
  if (eclipse.type === 'solar') {
    return eclipseType.includes('total')
      ? 'danger'
      : eclipseType.includes('annular')
        ? 'warning'
        : 'secondary';
  } else {
    return eclipseType.includes('total')
      ? 'danger'
      : eclipseType.includes('partial')
        ? 'warning'
        : 'info';
  }
};

/**
 * Get eclipse type display name
 */
export const getEclipseTypeDisplayName = (eclipse: EclipseInfo): string => {
  return eclipse.eclipse_type_label || eclipse.eclipse_type;
};

/**
 * Get eclipse visibility information
 */
export const getEclipseVisibilityInfo = (eclipse: EclipseInfo) => {
  return {
    note: eclipse.visibility.visibility_description,
  };
};

/**
 * Get quick navigation years for eclipse pages
 */
export const getQuickNavigationYears = (currentYear: number): number[] => {
  return [currentYear - 1, currentYear, currentYear + 1];
};

/**
 * Check if year navigation should be disabled
 */
export const isYearNavigationDisabled = (year: number, isLoading: boolean): boolean => {
  return isLoading || year <= 1900 || year >= 2100;
};
