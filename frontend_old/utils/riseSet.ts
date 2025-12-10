/**
 * Default zenith
 */
//original
const DEFAULT_ZENITH = 90.8333;
// Customised
//const DEFAULT_ZENITH = 89.92899;

/**
 * Degrees per hour
 */
const DEGREES_PER_HOUR = 360 / 24;

/**
 * Msec in hour
 */
const MSEC_IN_HOUR = 60 * 60 * 1000;

/**
 * Get day of year
 */
function getDayOfYear(date: Date): number {
  return Math.ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 8.64e7);
}

/**
 * Get sin of value in deg
 */
function sinDeg(deg: number): number {
  return Math.sin((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get acos of value in deg
 */
function acosDeg(x: number): number {
  return (Math.acos(x) * 360.0) / (2 * Math.PI);
}

/**
 * Get asin of value in deg
 */
function asinDeg(x: number): number {
  return (Math.asin(x) * 360.0) / (2 * Math.PI);
}

/**
 * Get tan of value in deg
 */
function tanDeg(deg: number): number {
  return Math.tan((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get cos of value in deg
 */
function cosDeg(deg: number): number {
  return Math.cos((deg * 2.0 * Math.PI) / 360.0);
}

/**
 * Get ramainder
 */
function mod(a: number, b: number): number {
  const result = a % b;

  return result < 0 ? result + b : result;
}

/**
 * Calculate Date for either sunrise or sunset
 */
function calculate(
  latitude: number,
  longitude: number,
  isSunrise: boolean,
  zenith: number,
  date: Date
): Date {
  const dayOfYear = getDayOfYear(date);
  const hoursFromMeridian = longitude / DEGREES_PER_HOUR;
  const approxTimeOfEventInDays = isSunrise
    ? dayOfYear + (6 - hoursFromMeridian) / 24
    : dayOfYear + (18.0 - hoursFromMeridian) / 24;

  const sunMeanAnomaly = 0.9856 * approxTimeOfEventInDays - 3.289;
  const sunTrueLongitude = mod(
    sunMeanAnomaly + 1.916 * sinDeg(sunMeanAnomaly) + 0.02 * sinDeg(2 * sunMeanAnomaly) + 282.634,
    360
  );
  const ascension = 0.91764 * tanDeg(sunTrueLongitude);

  let rightAscension: number;
  rightAscension = (360 / (2 * Math.PI)) * Math.atan(ascension);
  rightAscension = mod(rightAscension, 360);

  const lQuadrant = Math.floor(sunTrueLongitude / 90) * 90;
  const raQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension = rightAscension + (lQuadrant - raQuadrant);
  rightAscension /= DEGREES_PER_HOUR;

  const sinDec = 0.39782 * sinDeg(sunTrueLongitude);
  const cosDec = cosDeg(asinDeg(sinDec));
  const cosLocalHourAngle =
    (cosDeg(zenith) - sinDec * sinDeg(latitude)) / (cosDec * cosDeg(latitude));

  const localHourAngle = isSunrise ? 360 - acosDeg(cosLocalHourAngle) : acosDeg(cosLocalHourAngle);

  const localHour = localHourAngle / DEGREES_PER_HOUR;
  const localMeanTime = localHour + rightAscension - 0.06571 * approxTimeOfEventInDays - 6.622;
  const time = mod(localMeanTime - longitude / DEGREES_PER_HOUR, 24);
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  // Return a proper UTC date
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Math.floor(time),
      Math.floor((time % 1) * 60),
      Math.floor((((time % 1) * 60) % 1) * 60)
    )
  );
}

/**
 * Calculate Sunrise time for given longitude, latitude, zenith and date
 */
export function getSunrise(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezone?: string
): Date {
  const sunriseUTC = calculate(latitude, longitude, true, DEFAULT_ZENITH, date);
  return timezone ? convertToTimezone(sunriseUTC, timezone) : sunriseUTC;
}

/**
 * Calculate Sunset time for given longitude, latitude, zenith and date
 */
export function getSunset(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezone?: string
): Date {
  const sunsetUTC = calculate(latitude, longitude, false, DEFAULT_ZENITH, date);
  return timezone ? convertToTimezone(sunsetUTC, timezone) : sunsetUTC;
}

/**
 * Convert a UTC date to the specified timezone
 */
function convertToTimezone(utcDate: Date, timezone: string): Date {
  try {
    // Create a new Date object that represents the same moment in time
    // but we'll format it to display in the specified timezone
    const adjustedDate = new Date(utcDate.getTime());

    // Add a custom property to store the timezone information
    (adjustedDate as any).timezone = timezone;

    return adjustedDate;
  } catch (error) {
    console.error('Error converting timezone:', error);
    // Fallback to original UTC date if timezone conversion fails
    return utcDate;
  }
}

/**
 * Format a date with timezone information for display
 */
export function formatDateWithTimezone(date: Date): string {
  const timezone = (date as any).timezone;
  if (timezone) {
    // Get the formatted date and time parts separately
    const datePart = date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Get timezone abbreviation
    const tzAbbr = date
      .toLocaleTimeString('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      })
      .split(' ')
      .pop();

    return `${datePart} ${timePart} (${tzAbbr})`;
  }
  return date.toString();
}
