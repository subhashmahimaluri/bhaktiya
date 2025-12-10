import { format } from 'date-fns';

/**
 * Formats Shivaratri muhurta times for display
 * @param startTime - Start time in ISO format or Date object
 * @param endTime - End time in ISO format or Date object
 * @param locale - Current locale ('en' or 'te')
 * @returns Formatted time string
 */
export const formatShivaratriMuhurta = (
  startTime: string | Date,
  endTime: string | Date,
  locale: string
): { start: string; end: string } => {
  if (!startTime || !endTime) {
    return { start: 'N/A', end: 'N/A' };
  }

  try {
    const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

    // Format as "MMM dd hh:mm a"
    const startFormatted = format(startDate, 'MMM dd hh:mm a');
    const endFormatted = format(endDate, 'MMM dd hh:mm a');

    return {
      start: startFormatted,
      end: endFormatted,
    };
  } catch (error) {
    console.error('Error formatting Shivaratri muhurta:', error);
    return { start: 'N/A', end: 'N/A' };
  }
};

/**
 * Gets locale-specific image path
 * For Telugu locale, appends _te before .png extension
 * @param imagePath - Original image path
 * @param locale - Current locale ('en' or 'te')
 * @returns Localized image path or undefined if no image
 */
export const getLocalizedImagePath = (
  imagePath: string | undefined,
  locale: string
): string | undefined => {
  if (!imagePath) return undefined;
  if (locale === 'te') {
    return imagePath.replace(/\.png$/, '_te.png');
  }
  return imagePath;
};

/**
 * Gets the appropriate festival name based on locale
 * @param festival - Festival object
 * @param locale - Current locale ('en' or 'te')
 * @returns Localized festival name
 */
export const getLocalizedFestivalName = (festival: any, locale: string): string => {
  if (!festival) return '';

  if (locale === 'te') {
    return festival.festival_te || festival.festival_name || '';
  }

  return festival.festival_en || festival.festival_name || '';
};

/**
 * Formats date for panchangam link
 * @param date - Date object
 * @returns Formatted date string (yyyy-MM-dd)
 */
export const formatDateForPanchangam = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Gets ordinal suffix for dates (1st, 2nd, 3rd, 4th, etc.)
 * @param day - Day of the month
 * @returns Ordinal suffix
 */
export const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

/**
 * Formats month and year for display with locale support
 * @param date - Date object
 * @param locale - Current locale ('en' or 'te')
 * @returns Formatted month and year string
 */
export const formatMonthYear = (date: Date, locale: string = 'en'): string => {
  const englishMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const teluguMonths = [
    'జనవరి',
    'ఫిబ్రవరి',
    'మార్చి',
    'ఏప్రిల్',
    'మే',
    'జూన్',
    'జూలై',
    'ఆగస్ట్',
    'సెప్టెంబర్',
    'అక్టోబర్',
    'నవంబర్',
    'డిసెంబర్',
  ];

  const monthIndex = date.getMonth();
  const monthName = locale === 'te' ? teluguMonths[monthIndex] : englishMonths[monthIndex];
  return `${monthName} ${date.getFullYear()}`;
};

/**
 * Formats weekday with Telugu translation
 * @param date - Date object
 * @param locale - Current locale ('en' or 'te')
 * @returns Formatted weekday string
 */
export const formatWeekDay = (date: Date, locale: string): string => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const teluguWeekdays = [
    'ఆదివారం',
    'సోమవారం',
    'మంగళవారం',
    'బుధవారం',
    'గురువారం',
    'శుక్రవారం',
    'శనివారం',
  ];
  if (locale === 'te') {
    return teluguWeekdays[date.getDay()];
  }
  return weekdays[date.getDay()];
};

/**
 * Formats full date with locale support including month name and day of week
 * @param date - Date object
 * @param locale - Current locale ('en' or 'te')
 * @returns Formatted full date string (e.g., "జనవరి 13, 2025, సోమవారం")
 */
export const formatLocalizedFullDate = (date: Date, locale: string = 'en'): string => {
  const englishMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const teluguMonths = [
    'జనవరి',
    'ఫిబ్రవరి',
    'మార్చి',
    'ఏప్రిల్',
    'మే',
    'జూన్',
    'జూలై',
    'ఆగస్ట్',
    'సెప్టెంబర్',
    'అక్టోబర్',
    'నవంబర్',
    'డిసెంబర్',
  ];
  const englishWeekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const teluguWeekdays = [
    'ఆదివారం',
    'సోమవారం',
    'మంగళవారం',
    'బుధవారం',
    'గురువారం',
    'శుక్రవారం',
    'శనివారం',
  ];

  const monthIndex = date.getMonth();
  const weekdayIndex = date.getDay();
  const day = date.getDate();
  const year = date.getFullYear();

  if (locale === 'te') {
    const monthName = teluguMonths[monthIndex];
    const weekday = teluguWeekdays[weekdayIndex];
    return `${monthName} ${day}, ${year}, ${weekday}`;
  } else {
    const monthName = englishMonths[monthIndex];
    const weekday = englishWeekdays[weekdayIndex];
    return `${monthName} ${day}, ${year}, ${weekday}`;
  }
};

/**
 * Gets masa name from masa index
 * @param masaIno - Masa index number
 * @param localConstant - YexaaLocalConstant instance
 * @returns Masa name
 */
export const getMasaName = (masaIno: number, localConstant: any): string => {
  if (masaIno === -1 || isNaN(masaIno) || masaIno === undefined || masaIno === null) return 'N/A'; // For sankrantis and invalid values
  return localConstant.Masa.name_TE[masaIno] || `Masa ${masaIno + 1}`;
};

/**
 * Gets tithi name from tithi index
 * @param tithiIno - Tithi index number (0-based)
 * @param localConstant - YexaaLocalConstant instance
 * @param locale - Current locale ('en' or 'te')
 * @returns Tithi name
 */
export const getTithiName = (tithiIno: number, localConstant: any, locale: string): string => {
  if (tithiIno < 0 || tithiIno >= 30) return 'N/A';

  if (locale === 'te') {
    return localConstant.Tithi.name_TE[tithiIno] || `తిథి ${tithiIno + 1}`;
  } else {
    return localConstant.Tithi.name[tithiIno] || `Tithi ${tithiIno + 1}`;
  }
};

/**
 * Gets paksha name from tithi number
 * @param tithiNo - Tithi number (1-30, where 1-15 = Shukla, 16-30 = Krishna)
 * @param locale - Current locale ('en' or 'te')
 * @returns Paksha name or null for special tithis
 */
export const getPakshaName = (tithiNo: number): { name: string; name_TE: string } | null => {
  // Amavasya (30) and Pournami (15) don't have paksha
  if (tithiNo === 15 || tithiNo === 30) return null;

  if (tithiNo >= 1 && tithiNo <= 14) {
    return {
      name: 'Shukla',
      name_TE: 'శుక్ల',
    };
  } else if (tithiNo >= 16 && tithiNo <= 29) {
    return {
      name: 'Krishna',
      name_TE: 'కృష్ణ',
    };
  }

  return null;
};
