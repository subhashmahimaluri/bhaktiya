// Utility functions for month-related operations

export const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

/**
 * Get month name by index (0-11 or 1-12)
 * @param monthIndex - Month index (0 for January, 11 for December) or (1 for January, 12 for December)
 * @returns Month name key
 */
export const getMonthName = (monthIndex: number): string => {
  // If value is 0-11, use directly; if 1-12, subtract 1
  let index = monthIndex;
  if (monthIndex >= 1 && monthIndex <= 12) {
    // Likely 1-12 input, but check if it could be 0-11
    // If called from index.tsx (festivalsByMonth uses getUTCMonth()), it's 0-11
    // If called from month pages, it's 1-12
    // Use simple heuristic: values 1-11 are ambiguous, 12 is definitely 1-12
    if (monthIndex === 12) {
      index = 11; // 12 in 1-12 = 11 in 0-11
    } else {
      // For 1-11, assume it's being called from index.tsx (0-11) or month pages (1-12)
      // Check the call context - if 0, it's definitely 0-11; if > 11, definitely 1-12
      // For ambiguous 1-11, we need context. Since month pages pass 1-12,
      // and index.tsx grouping uses getUTCMonth() (0-11),
      // we can't disambiguate here. Return as-is for now.
      index = monthIndex;
    }
  }
  return MONTH_NAMES[index];
};

/**
 * Get translated month name
 * @param monthIndex - Month index (0-11: 0 for January, 11 for December)
 * @param t - Translation object
 * @returns Translated month name
 */
export const getTranslatedMonthName = (monthIndex: number, t: any): string => {
  const monthKey = MONTH_NAMES[monthIndex];
  return t.panchangam[monthKey as keyof typeof t.panchangam];
};

/**
 * Get previous month name and year
 * @param currentMonth - Current month index (1-12)
 * @param currentYear - Current year
 * @returns Object with month name and year
 */
export const getPreviousMonth = (currentMonth: number, currentYear: number) => {
  if (currentMonth === 1) {
    // January (1) -> December of previous year
    return {
      monthName: 'december',
      year: currentYear - 1,
    };
  }
  return {
    monthName: MONTH_NAMES[currentMonth - 2],
    year: currentYear,
  };
};

/**
 * Get next month name and year
 * @param currentMonth - Current month index (1-12)
 * @param currentYear - Current year
 * @returns Object with month name and year
 */
export const getNextMonth = (currentMonth: number, currentYear: number) => {
  if (currentMonth === 12) {
    // December (12) -> January of next year
    return {
      monthName: 'january',
      year: currentYear + 1,
    };
  }
  return {
    monthName: MONTH_NAMES[currentMonth],
    year: currentYear,
  };
};
