import { formatDate as formatDateUtil } from './vrathaDateUtils';

/**
 * Formats a date with locale support (English/Telugu)
 * @param date - Date object to format
 * @param locale - Current locale ('te' for Telugu, 'en' for English)
 * @param t - Translation object containing locale-specific translations
 * @returns Formatted date string
 */
export const formatDateLocalized = (date: Date, locale: string, t: any): string => {
  // Convert Date to string format expected by vrathaDateUtils formatDate function
  const dateStr = date.toISOString().split('T')[0];
  return formatDateUtil(dateStr, locale, t);
};

/**
 * Formats time for display
 * @param date - Date object to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats short date for display
 * @param date - Date object to format
 * @returns Formatted short date string
 */
export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
