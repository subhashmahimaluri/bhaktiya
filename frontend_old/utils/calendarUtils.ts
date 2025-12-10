/**
 * Utility functions for calendar-related operations
 */

/**
 * Get localized weekday name based on date and locale
 */
export function getLocalizedWeekday(date: Date, locale: string = 'en'): string {
  const weekdayNames = [
    { en: 'Sunday', te: 'ఆదివారము' },
    { en: 'Monday', te: 'సోమవారము' },
    { en: 'Tuesday', te: 'మంగళవారము' },
    { en: 'Wednesday', te: 'బుధవారము' },
    { en: 'Thursday', te: 'గురువారము' },
    { en: 'Friday', te: 'శుక్రవారము' },
    { en: 'Saturday', te: 'శనివారము' },
  ];

  const dayIndex = date.getDay();
  const weekdayData = weekdayNames[dayIndex];

  return weekdayData ? weekdayData[locale as keyof typeof weekdayData] || weekdayData.en : '';
}

/**
 * Get localized month name based on date and locale
 */
export function getLocalizedMonth(date: Date, locale: string = 'en'): string {
  const monthNames = [
    { en: 'January', te: 'జనవరి' },
    { en: 'February', te: 'ఫిబ్రవరి' },
    { en: 'March', te: 'మార్చి' },
    { en: 'April', te: 'ఏప్రిల్' },
    { en: 'May', te: 'మే' },
    { en: 'June', te: 'జూన్' },
    { en: 'July', te: 'జూలై' },
    { en: 'August', te: 'ఆగస్ట్' },
    { en: 'September', te: 'సెప్టెంబర్' },
    { en: 'October', te: 'అక్టోబర్' },
    { en: 'November', te: 'నవంబర్' },
    { en: 'December', te: 'డిసెంబర్' },
  ];

  const monthIndex = date.getMonth();
  const monthData = monthNames[monthIndex];

  return monthData ? monthData[locale as keyof typeof monthData] || monthData.en : '';
}
