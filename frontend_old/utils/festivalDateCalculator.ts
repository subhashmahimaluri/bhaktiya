/**
 * Utility to calculate festival display dates based on tithi boundaries
 * This determines which calendar date to display the festival on, based on when the tithi
 * is present at a specific time of day (sunrise, sunset, midnight, pradosha, etc.)
 *
 * Similar logic to getCalendarTithi - finds the date where tithi is present at calculation time
 */

export type CalculationType =
  | 'Sunrise'
  | 'Sunset'
  | 'Pradosha'
  | 'Moonrise'
  | 'Shivaratri'
  | 'AfterSunrise';

interface TithiBoundary {
  startTime: Date;
  endTime: Date;
}

/**
 * Calculate the festival display date based on when the tithi is present at the calculation time
 *
 * Logic (similar to getCalendarTithi):
 * - Check if tithi is present at the calculation time (sunrise/sunset/etc) for the start date
 * - If not, check the next day's calculation time
 * - Return the date where the tithi is present at that time
 * - Handles cases where tithi may span multiple days
 *
 * @param boundary - The tithi boundary with start and end times
 * @param calculationType - When to check for tithi presence (sunrise/sunset/etc)
 * @param calculationTime - The actual time of calculation for the start date (e.g., sunrise on start date)
 * @param nextDayCalculationTime - The calculation time for the next day (optional)
 * @returns The date to display the festival on
 */
export function getFestivalDisplayDate(
  boundary: TithiBoundary,
  calculationType: CalculationType,
  calculationTime: Date | null,
  nextDayCalculationTime?: Date | null
): Date {
  const { startTime, endTime } = boundary;

  // For moonrise: if no moonrise on first day, check if next day's moonrise is within tithi
  if (calculationType === 'Moonrise' && !calculationTime) {
    if (
      nextDayCalculationTime &&
      nextDayCalculationTime >= startTime &&
      nextDayCalculationTime < endTime
    ) {
      // Next day's moonrise is within tithi - use next day
      return new Date(
        Date.UTC(
          nextDayCalculationTime.getUTCFullYear(),
          nextDayCalculationTime.getUTCMonth(),
          nextDayCalculationTime.getUTCDate()
        )
      );
    }
    // No moonrise during tithi period - check which date has more tithi coverage
    // If tithi starts late (after 12 PM), the next date has more coverage
    const tithiStartHour = startTime.getUTCHours();
    if (tithiStartHour >= 12) {
      const nextDay = new Date(startTime);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      return new Date(
        Date.UTC(nextDay.getUTCFullYear(), nextDay.getUTCMonth(), nextDay.getUTCDate())
      );
    }
    return new Date(
      Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate())
    );
  }

  // If no calculation time provided for other types, fall back to tithi start date
  if (!calculationTime) {
    return new Date(
      Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate())
    );
  }

  // For Sunrise calculation: Check starting day sunrise, then next day sunrise, fallback to starting day
  if (calculationType === 'Sunrise') {
    // Case 1: Check if tithi is present at starting day sunrise
    if (calculationTime && calculationTime >= startTime && calculationTime < endTime) {
      // Tithi is present at starting day's sunrise - use starting day
      // Use UTC components to avoid timezone issues
      return new Date(
        Date.UTC(
          calculationTime.getUTCFullYear(),
          calculationTime.getUTCMonth(),
          calculationTime.getUTCDate()
        )
      );
    }

    // Case 2: Tithi is NOT present at starting day sunrise, check next day sunrise
    if (
      nextDayCalculationTime &&
      nextDayCalculationTime >= startTime &&
      nextDayCalculationTime < endTime
    ) {
      // Tithi is present at next day's sunrise - use next day
      // Use UTC components to avoid timezone issues
      return new Date(
        Date.UTC(
          nextDayCalculationTime.getUTCFullYear(),
          nextDayCalculationTime.getUTCMonth(),
          nextDayCalculationTime.getUTCDate()
        )
      );
    }

    // Case 3: Tithi is not present at either sunrise - fallback to starting day
    return new Date(
      Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate())
    );
  }

  // For other calculation types (Pradosha, etc.): check if tithi is present at calculation time
  // The tithi is present if: startTime <= calculationTime < endTime
  if (calculationTime >= startTime && calculationTime < endTime) {
    // Tithi is present at this calculation time - use this date
    // Use UTC components to avoid timezone issues
    return new Date(
      Date.UTC(
        calculationTime.getUTCFullYear(),
        calculationTime.getUTCMonth(),
        calculationTime.getUTCDate()
      )
    );
  }

  // If tithi is NOT present at start date's calculation time, check next day
  if (
    nextDayCalculationTime &&
    nextDayCalculationTime >= startTime &&
    nextDayCalculationTime < endTime
  ) {
    // Tithi is present at next day's calculation time - use next day
    // Use UTC components to avoid timezone issues
    return new Date(
      Date.UTC(
        nextDayCalculationTime.getUTCFullYear(),
        nextDayCalculationTime.getUTCMonth(),
        nextDayCalculationTime.getUTCDate()
      )
    );
  }

  // If tithi is not present at either calculation time, fall back to tithi start date
  // This handles edge cases (rare but possible)
  return new Date(
    Date.UTC(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate())
  );
}

/**
 * Check if a tithi is present at a specific time
 * @param boundary - The tithi boundary
 * @param checkTime - The time to check
 * @returns true if tithi is present at checkTime
 */
export function isTithiPresentAt(boundary: TithiBoundary, checkTime: Date): boolean {
  return checkTime >= boundary.startTime && checkTime < boundary.endTime;
}
