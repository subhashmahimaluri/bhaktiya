import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { format } from 'date-fns';

/**
 * Utility functions for Festival page rendering and data processing
 */

interface FestivalData {
  date?: Date;
  festival?: {
    telugu_month?: string;
    tithi?: string;
    tithiStarts?: Date;
    tithiEnds?: Date;
    image?: string;
  };
}

/**
 * Get masa name based on masa index and locale
 * @param masaIno - Masa index number
 * @param locale - Current locale ('en' or 'te')
 * @returns Masa name
 */
export const getMasaNameForPage = (masaIno: number, locale: string): string => {
  if (masaIno === -1) return 'N/A';

  const localConstant = new YexaaLocalConstant();
  return locale === 'te'
    ? localConstant.Masa.name_TE[masaIno - 1]
    : localConstant.Masa.name[masaIno - 1] || `Masa ${masaIno - 1}`;
};

/**
 * Get tithi name based on tithi index and locale
 * @param tithiIno - Tithi index number
 * @param locale - Current locale ('en' or 'te')
 * @returns Tithi name
 */
export const getTithiNameForPage = (tithiIno: number, locale: string): string => {
  if (tithiIno === -1) return 'N/A';

  const localConstant = new YexaaLocalConstant();
  return locale === 'te'
    ? localConstant.Tithi.name_TE[tithiIno - 1]
    : localConstant.Tithi.name[tithiIno - 1] || `Tithi ${tithiIno - 1}`;
};

/**
 * Parse numeric string safely with validation
 * @param value - Value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default value
 */
export const parseNumericString = (
  value: string | undefined | null,
  defaultValue: number = 0
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Check if data is valid and ready for display
 * @param data - Festival data to validate
 * @returns true if data is valid
 */
export const isValidFestivalData = (data: FestivalData | undefined): data is FestivalData => {
  return !!data && !!data.festival && !!data.date;
};

/**
 * Format festival muhurta times
 * @param startTime - Start time
 * @param endTime - End time
 * @returns Formatted time string
 */
export const formatMuhurtaTimes = (
  startTime: Date | undefined,
  endTime: Date | undefined
): string => {
  if (!startTime || !endTime) return 'N/A';

  try {
    return `${format(startTime, 'MMM dd hh:mm a')}`;
  } catch (error) {
    console.error('Error formatting muhurta times:', error);
    return 'N/A';
  }
};

/**
 * Get initial year from URL params or default
 * @param yearParam - Year parameter from URL
 * @returns Initial year
 */
export const getInitialYearFromParam = (yearParam: string | string[] | undefined): number => {
  if (yearParam && typeof yearParam === 'string') {
    const parsed = parseInt(yearParam);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return new Date().getFullYear();
};
