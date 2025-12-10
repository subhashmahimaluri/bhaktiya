import { format, parseISO } from 'date-fns';

/**
 * Formats a date string according to the locale
 * @param dateStr - Date string in "October 01, 2025" format
 * @param locale - Current locale ('te' for Telugu, 'en' for English)
 * @param t - Translation object containing locale-specific month names
 * @returns Formatted date string
 */
export const formatDateByLocale = (
  dateStr: string, 
  locale: string, 
  t: any
): string => {
  // Parse "October 01, 2025" format
  const match = dateStr.match(/(\w+) (\d+), (\d+)/);
  if (match) {
    const [, monthName, day, year] = match;
    const months: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
      'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const monthNum = months[monthName];
    const date = parseISO(`${year}-${monthNum}-${day.padStart(2, '0')}`);
    
    if (locale === 'te') {
      return `${format(date, 'dd')} ${(t.panchangam as any)[format(date, 'MMMM').toLowerCase()] || format(date, 'MMMM')} ${format(date, 'yyyy')}`;
    } else {
      return format(date, 'dd MMMM yyyy');
    }
  }
  return dateStr;
};

/**
 * Formats a weekday name according to the locale
 * @param weekday - Weekday name
 * @param locale - Current locale ('te' for Telugu, 'en' for English)
 * @param t - Translation object containing locale-specific weekday names
 * @returns Localized weekday name
 */
export const formatWeekdayByLocale = (
  weekday: string, 
  locale: string, 
  t: any
): string => {
  if (locale === 'te' && weekday && (t.panchangam as any)[weekday.toLowerCase()]) {
    return (t.panchangam as any)[weekday.toLowerCase()];
  }
  return weekday || '';
};

/**
 * Formats a Date object according to the locale
 * @param date - Date object
 * @param locale - Current locale ('te' for Telugu, 'en' for English)
 * @param t - Translation object containing locale-specific month names
 * @returns Formatted date string
 */
export const formatDateObjectByLocale = (
  date: Date, 
  locale: string, 
  t: any
): string => {
  if (locale === 'te') {
    return `${format(date, 'd')} ${(t.panchangam as any)[format(date, 'MMMM').toLowerCase()] || format(date, 'MMMM')} ${format(date, 'yyyy')}`;
  } else {
    return format(date, 'dd MMMM yyyy');
  }
};