import { useLocation } from '@/context/LocationContext';
import { useEffect, useState } from 'react';

// Types for astronomy-bundle (lazy loaded)
type TimeOfInterest = any;
type Sun = any;
type Moon = any;
type MomentTimezone = any;

export function useAstronomyBundle(date?: Date): {
  sunrise?: string;
  sunset?: string;
  nextDaySunrise?: string;
  moonrise?: string;
  moonset?: string;
  moonriseFull?: string;
  moonsetFull?: string;
  isLoading: boolean;
  error?: string;
} {
  const { lat, lng, timezone } = useLocation();
  const [sunrise, setSunrise] = useState<string>('');
  const [sunset, setSunset] = useState<string>('');
  const [nextDaySunrise, setNextDaySunrise] = useState<string>('');
  const [moonrise, setMoonrise] = useState<string>('');
  const [moonset, setMoonset] = useState<string>('');
  const [moonriseFull, setMoonriseFull] = useState<string>('');
  const [moonsetFull, setMoonsetFull] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const calculateAstronomyData = async () => {
      if (!lat || !lng || !timezone || !date) {
        setIsLoading(false);
        setError('Missing location or date data');
        return;
      }

      try {
        setIsLoading(true);
        setError(undefined);

        // Lazy load astronomy-bundle and moment-timezone only when needed
        const [{ createTimeOfInterest }, { createSun }, { createMoon }, moment] = await Promise.all(
          [
            import('astronomy-bundle/time'),
            import('astronomy-bundle/sun'),
            import('astronomy-bundle/moon'),
            import('moment-timezone'),
          ]
        );

        // Use the provided date
        const toi = createTimeOfInterest.fromDate(date);
        const sun = createSun(toi);

        // Get sunrise and sunset from astronomy-bundle
        const astronomyBundleSunrise = await sun.getRise({ lat, lon: lng, elevation: 0 });
        const astronomyBundleSunset = await sun.getSet({ lat, lon: lng, elevation: 0 });

        // Get next day's sunrise for pradosha time calculation
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayToi = createTimeOfInterest.fromDate(nextDay);
        const nextDaySun = createSun(nextDayToi);
        const astronomyBundleNextDaySunrise = await nextDaySun.getRise({
          lat,
          lon: lng,
          elevation: 0,
        });

        // Get moon data from astronomy-bundle
        // Handle edge cases where moon doesn't rise/set on the given day
        let moonRise = null;
        let moonSet = null;
        let moonRiseDate = date;
        let moonSetDate = date;

        // Try to get moonrise - check current day and previous day
        try {
          const moon = createMoon(toi);
          moonRise = await moon.getRise({ lat, lon: lng, elevation: 0 });
        } catch (err) {
          // Moon might not rise on this day, try previous day
          console.warn('Moon did not rise on current day, trying previous day:', err);
          try {
            const prevDayForMoon = new Date(date);
            prevDayForMoon.setDate(prevDayForMoon.getDate() - 1);
            const prevDayToiMoon = createTimeOfInterest.fromDate(prevDayForMoon);
            const moon = createMoon(prevDayToiMoon);
            const prevDayRise = await moon.getRise({ lat, lon: lng, elevation: 0 });

            // Check if this rise time is actually visible on our target day
            // (i.e., occurred late enough that it's still relevant)
            const riseJD = prevDayRise.jd;
            const riseDate = new Date((riseJD - 2440587.5) * 86400000);
            const riseMoment = moment.default.utc(riseDate).tz(timezone);

            // If the rise is within 24 hours before our target date, use it
            const hoursDiff = (date.getTime() - riseMoment.toDate().getTime()) / (1000 * 60 * 60);
            if (hoursDiff >= 0 && hoursDiff < 24) {
              moonRise = prevDayRise;
              moonRiseDate = prevDayForMoon;
            }
          } catch (prevErr) {
            console.warn('Moon did not rise on previous day either:', prevErr);
          }
        }

        // Try to get moonset - check current day and next day
        try {
          const moon = createMoon(toi);
          moonSet = await moon.getSet({ lat, lon: lng, elevation: 0 });
        } catch (err) {
          // Moon might not set on this day, try next day
          console.warn('Moon did not set on current day, trying next day:', err);
          try {
            const nextDayForMoon = new Date(date);
            nextDayForMoon.setDate(nextDayForMoon.getDate() + 1);
            const nextDayToiMoon = createTimeOfInterest.fromDate(nextDayForMoon);
            const moon = createMoon(nextDayToiMoon);
            moonSet = await moon.getSet({ lat, lon: lng, elevation: 0 });
            moonSetDate = nextDayForMoon;
          } catch (nextErr) {
            console.warn('Moon did not set on next day either:', nextErr);
          }
        }

        // Convert astronomy-bundle UTC results to the selected timezone
        const convertToTimezone = (utcDate: any) => {
          try {
            if (timezone && utcDate && utcDate.jd) {
              // Convert JD to Date object (UTC)
              const jd = utcDate.jd;
              const utcDateObj = new Date((jd - 2440587.5) * 86400000);

              // Validate the created date
              if (isNaN(utcDateObj.getTime())) {
                console.error('Invalid date created from JD:', jd);
                return null;
              }

              // Use moment to convert to the target timezone
              const converted = moment.default.utc(utcDateObj).tz(timezone);

              // Validate the moment object
              if (!converted || !converted.isValid()) {
                console.error(
                  'Invalid moment created from date:',
                  utcDateObj,
                  'timezone:',
                  timezone
                );
                return null;
              }

              // Return a formatted string showing the time in the selected timezone
              return converted;
            }
            return null;
          } catch (error) {
            console.error('Error in convertToTimezone:', error);
            return null;
          }
        };

        const sunriseMoment = convertToTimezone(astronomyBundleSunrise);
        const sunsetMoment = convertToTimezone(astronomyBundleSunset);
        const nextDaySunriseMoment = convertToTimezone(astronomyBundleNextDaySunrise);
        const moonriseMoment = convertToTimezone(moonRise);
        const moonsetMoment = convertToTimezone(moonSet);

        // Check if moonrise/moonset are on different days than requested
        const isRequestedDay = (checkDate: Date, momentObj: any) => {
          if (!momentObj || !momentObj.isValid()) return true;
          const momentDate = momentObj.toDate();
          return (
            momentDate.getFullYear() === checkDate.getFullYear() &&
            momentDate.getMonth() === checkDate.getMonth() &&
            momentDate.getDate() === checkDate.getDate()
          );
        };

        const moonriseOnSameDay = isRequestedDay(date, moonriseMoment);
        const moonsetOnSameDay = isRequestedDay(date, moonsetMoment);

        // Format basic time (h:mm A) with validation
        const sunriseStr =
          sunriseMoment && sunriseMoment.isValid() ? sunriseMoment.format('h:mm A') : '';
        const sunsetStr =
          sunsetMoment && sunsetMoment.isValid() ? sunsetMoment.format('h:mm A') : '';
        const nextDaySunriseStr =
          nextDaySunriseMoment && nextDaySunriseMoment.isValid()
            ? nextDaySunriseMoment.format('h:mm A')
            : '';

        // For moonrise/moonset, include date indicator if not on same day
        const moonRiseTime =
          moonriseMoment && moonriseMoment.isValid()
            ? moonriseOnSameDay
              ? moonriseMoment.format('h:mm A')
              : moonriseMoment.format('MMM D h:mm A')
            : '';
        const moonSetTime =
          moonsetMoment && moonsetMoment.isValid()
            ? moonsetOnSameDay
              ? moonsetMoment.format('h:mm A')
              : moonsetMoment.format('MMM D h:mm A')
            : '';

        // Format full time (MMM D h:mm A) with validation - always include date
        const moonriseFull =
          moonriseMoment && moonriseMoment.isValid() ? moonriseMoment.format('MMM D h:mm A') : '';
        const moonsetFull =
          moonsetMoment && moonsetMoment.isValid() ? moonsetMoment.format('MMM D h:mm A') : '';

        setSunrise(sunriseStr);
        setSunset(sunsetStr);
        setNextDaySunrise(nextDaySunriseStr);
        setMoonrise(moonRiseTime);
        setMoonset(moonSetTime);
        setMoonriseFull(moonriseFull);
        setMoonsetFull(moonsetFull);

        // Debug logging to help identify moon phase issues
        console.log('🌙 Moon times calculated:', {
          date: date.toISOString(),
          moonrise: moonRiseTime,
          moonset: moonSetTime,
          moonriseFull,
          moonsetFull,
          moonriseOnSameDay,
          moonsetOnSameDay,
          info:
            moonriseOnSameDay && moonsetOnSameDay
              ? 'Both on same day'
              : !moonriseOnSameDay && !moonsetOnSameDay
                ? 'Both on different days'
                : 'Mixed - check lunar phase',
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error with astronomy-bundle:', err);
        // Set empty values if calculation failed
        setSunrise('');
        setSunset('');
        setNextDaySunrise('');
        setMoonrise('');
        setMoonset('');
        setMoonriseFull('');
        setMoonsetFull('');
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to calculate astronomy data');
      }
    };

    calculateAstronomyData();
  }, [lat, lng, timezone, date]);

  return {
    sunrise,
    sunset,
    nextDaySunrise,
    moonrise,
    moonset,
    moonriseFull,
    moonsetFull,
    isLoading,
    error,
  };
}
