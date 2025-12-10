import { YexaaPanchang } from '@/lib/panchangam';

/**
 * Calendar-specific panchangam data for calendar cell display
 * Contains: Tithi, Nakshatra, Paksha, and Varjyam
 * Stores full objects from YexaaPanchang to preserve name_TE and other properties
 */
export interface CalendarCellPanchangamData {
  tithi: any; // Full YexaaPanchang Tithi object with name, name_TE, start, end
  nakshatra: any; // Full YexaaPanchang Nakshatra object with name, name_TE, start, end
  paksha: any; // Full YexaaPanchang Paksha object with name, name_TE
}

/**
 * Calculate panchangam data for a specific date using JavaScript
 * This replaces the slow Python API call with client-side calculation
 *
 * @param date - The date to calculate panchangam for
 * @param lat - Latitude of location
 * @param lng - Longitude of location
 * @returns Calendar cell panchangam data
 */
export function calculateCalendarCellPanchangam(
  date: Date,
  lat: number,
  lng: number
): CalendarCellPanchangamData | null {
  try {
    const panchang = new YexaaPanchang();

    // Get both calendar (for location-specific names) and calculated (for start/end times)
    const calendarData = panchang.calendar(date, lat, lng);
    const calculatedData = panchang.calculate(date);

    if (!calendarData || !calculatedData) {
      return null;
    }

    // Merge calendar names with calculated times
    // Calendar has the accurate names (name_TE for localization)
    // Calculated has the start/end times
    const tithi = {
      ...calendarData.Tithi,
      ...calculatedData.Tithi,
    };
    const nakshatra = {
      ...calendarData.Nakshatra,
      ...calculatedData.Nakshatra,
    };
    const paksha = calendarData.Paksha;

    // Return merged objects with both names and times
    return {
      tithi,
      nakshatra,
      paksha,
    };
  } catch (error) {
    console.error('Error calculating calendar cell panchangam:', error);
    return null;
  }
}

/**
 * Calculate panchangam data for multiple dates in a month
 * This is optimized for the monthly calendar view
 *
 * @param year - Year
 * @param month - Month (1-12)
 * @param lat - Latitude
 * @param lng - Longitude
 * @param sunrisesMap - Map of date strings to sunrise times from useAstronomyBundle
 * @param sunsetsMap - Map of date strings to sunset times from useAstronomyBundle
 * @returns Map of date strings to panchangam data
 */
export function calculateMonthPanchangamData(
  year: number,
  month: number,
  lat: number,
  lng: number
): Map<string, CalendarCellPanchangamData> {
  const dataMap = new Map<string, CalendarCellPanchangamData>();

  try {
    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Iterate through each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toISOString().split('T')[0];

      const panchangData = calculateCalendarCellPanchangam(currentDate, lat, lng);
      if (panchangData) {
        dataMap.set(dateStr, panchangData);
      }
    }
  } catch (error) {
    console.error('Error calculating month panchangam data:', error);
  }

  return dataMap;
}
