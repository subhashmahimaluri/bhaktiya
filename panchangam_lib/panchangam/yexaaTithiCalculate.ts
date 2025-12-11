import { YexaaCalculateFunc } from './yexaaCalculateFunc';
import { YexaaCalendar } from './yexaaCalendar';
import { YexaaLocalConstant } from './yexaaLocalConstant';
import { YexaaPanchangImpl } from './yexaaPanchangImpl';
import { YexaaSunMoonTimer } from './yexaaSunMoonTimer';

/**
 * YexaaTithiCalculate - Reverse Tithi Calculation
 *
 * Given: tithiIno, masaIno, lat, lng, year
 * Returns: Start and end times of that specific tithi in that specific masa
 *
 * Algorithm:
 * 1. Find the new moon (Amavasya) that begins the specified masa
 * 2. Use binary search + iterative refinement to find tithi phase boundaries
 * 3. Convert JD boundaries to calendar dates with proper timezone handling
 */
export class YexaaTithiCalculate {
  private yexaaConstant: YexaaLocalConstant;
  private yexaaPanchangImpl: YexaaPanchangImpl;
  private yexaaCalculateFunc: YexaaCalculateFunc;
  private yexaaSunMoonTimer: YexaaSunMoonTimer;
  private yexaaCalendar: YexaaCalendar;

  // Constants for convergence
  private readonly PHASE_PRECISION = 0.00001; // ~0.86 seconds
  private readonly JD_REFINEMENT_ITERATIONS = 20;

  constructor() {
    this.yexaaConstant = new YexaaLocalConstant();
    this.yexaaPanchangImpl = new YexaaPanchangImpl(this.yexaaConstant);
    this.yexaaCalculateFunc = new YexaaCalculateFunc();
    this.yexaaSunMoonTimer = new YexaaSunMoonTimer();
    this.yexaaCalendar = new YexaaCalendar();
  }

  /**
   * Calculate tithi start and end times for a given tithi in a given masa
   *
   * @param tithiIno - Tithi number (0-29, where 0-14 = Shukla, 15-29 = Krishna)
   * @param masaIno - Masa number (0-11, Amanta system)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param year - Gregorian year (used as reference for finding the masa)
   * @param height - Optional elevation in meters
   * @returns Object with startTime and endTime as Date objects
   */
  /**
   * Calculate tithi start and end times for a given tithi in a given masa
   *
   * @param tithiIno - Tithi number (0-29, where 0-14 = Shukla, 15-29 = Krishna)
   * @param masaIno - Masa number (0-11, Amanta system)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param year - Gregorian year (used as reference for finding the masa)
   * @param height - Optional elevation in meters
   * @param preferLeapMonth - Whether to prefer leap month when multiple options exist
   * @param tzone - Timezone offset in hours (e.g., 5.5 for IST, -5 for EST). If not provided, calculated from Date object timezone
   * @returns Object with startTime and endTime as Date objects
   */
  calculateTithiBoundaries(
    tithiIno: number,
    masaIno: number,
    lat: number,
    lng: number,
    year: number,
    height: number = 0,
    preferLeapMonth: boolean = false,
    tzone?: number
  ): { startTime: Date; endTime: Date; masaIno: number; isLeapMonth: boolean } | null {
    try {
      // Each tithi represents 12 degrees of lunar phase
      const targetTithi = tithiIno + 1; // Convert to 1-30
      const startPhase = (targetTithi - 1) * 12;
      let endPhase = targetTithi * 12;

      // Special handling for tithi 30 (Amavasya)
      // Phase goes from 348° to 360° which wraps to 0°
      if (targetTithi === 30) {
        endPhase = 0; // Wrap to 0 instead of 360
      }

      const isLastTithi = targetTithi === 30;

      // Find the new moon that corresponds to this masa
      const newMoonResult = this.findNewMoonForMasa(
        masaIno,
        lat,
        lng,
        year,
        height,
        preferLeapMonth
      );
      if (!newMoonResult) {
        console.error('Could not find new moon for masa', masaIno);
        return null;
      }

      const newMoonJd = newMoonResult.jd;
      const isLeapMonth = newMoonResult.isLeapMonth;
      // Search for tithi boundaries starting from the new moon
      // For Shukla paksha (tithi 1-15): search forward from new moon
      // For Krishna paksha (tithi 16-30): search forward from full moon
      let searchStartJd = newMoonJd;

      if (targetTithi > 15) {
        // Krishna paksha - start from full moon (about 14.75 days after new moon)
        searchStartJd = newMoonJd + 14.75;
      }

      // Find start boundary
      const startJd = this.findPhaseCrossing(
        searchStartJd - 1,
        searchStartJd + 20,
        startPhase,
        true,
        targetTithi === 1 || isLastTithi
      );

      if (!startJd) {
        console.error('Could not find start boundary for phase', startPhase);
        return null;
      }

      // Find end boundary
      const endJd = this.findPhaseCrossing(startJd, startJd + 2, endPhase, false, isLastTithi);

      if (!endJd) {
        console.error('Could not find end boundary for phase', endPhase);
        return null;
      }

      // Validate: endJd must be after startJd
      if (endJd <= startJd) {
        console.error('Invalid boundary: endJd <= startJd', { startJd, endJd });
        return null;
      }

      // Convert to dates with timezone
      // If tzone not provided, calculate from a sample date at this location
      // Using Date.getTimezoneOffset() approach similar to yexaaCalculateFunc.ts
      let timezoneOffset = tzone;
      if (timezoneOffset === undefined) {
        // Create a sample date to get the timezone offset
        const sampleDate = new Date(year, 0, 1);
        timezoneOffset = (sampleDate.getTimezoneOffset() / 60) * -1;
      }

      const dtStart = this.yexaaPanchangImpl.dTime(startJd);
      const dtEnd = this.yexaaPanchangImpl.dTime(endJd);

      return {
        startTime: this.yexaaPanchangImpl.calData(startJd + (timezoneOffset - dtStart) / 24),
        endTime: this.yexaaPanchangImpl.calData(endJd + (timezoneOffset - dtEnd) / 24),
        masaIno,
        isLeapMonth,
      };
    } catch (error) {
      console.error('Error in calculateTithiBoundaries:', error);
      return null;
    }
  }

  /**
   * Find the new moon (Amavasya) JD that begins the specified masa
   *
   * CRITICAL: masaIno is 0-based (0=Chaitra, 7=Karthika)
   * But getMasa() returns n_maasa which is 1-based (1-12)
   * To get Amanta Masa index: n_maasa - 1 (as per yexaaCalendar.ts line 94)
   *
   * @param masaIno - Masa index (0-11, where 0=Chaitra, 7=Karthika, etc.)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param year - Gregorian year
   * @param height - Optional elevation
   * @returns Object with jd and isLeapMonth, or null if not found
   */
  private findNewMoonForMasa(
    masaIno: number,
    lat: number,
    lng: number,
    year: number,
    height: number,
    preferLeapMonth: boolean = false
  ): { jd: number; isLeapMonth: boolean } | null {
    // In Amanta system: Masa is determined by getMasa() calculation
    // which returns n_maasa (1-based). We use Amanta Masa = n_maasa - 1 to match masaIno

    const newMoons: Array<{ jd: number; masaIndex: number; date: Date; isLeapMonth: boolean }> = [];

    // Search from beginning of year through first quarter of next year
    const searchStartJd = this.yexaaPanchangImpl.mdy2julian(1, 1, year);
    const searchEndJd = this.yexaaPanchangImpl.mdy2julian(4, 1, year + 1);

    let prevPhase = this.yexaaPanchangImpl.lunarPhase(searchStartJd);

    // Find all new moons in the search window
    for (let jd = searchStartJd; jd < searchEndJd; jd += 1) {
      const phase = this.yexaaPanchangImpl.lunarPhase(jd);

      // Detect new moon transition (phase crosses from ~350+ to ~0-10)
      if (prevPhase > 200 && phase < 100) {
        // Refine to get exact new moon
        const refinedJd = this.findExactNewMoon(jd - 1, jd + 1);

        // Use getMasa() to get the correct masa index at this new moon
        const masaResult = this.getMasaForNewMoon(refinedJd);

        // Amanta Masa calculation: n_maasa - 1 (as per yexaaCalendar.ts)
        let amantaMasaIndex = masaResult.n_maasa - 1;
        if (amantaMasaIndex < 0) {
          amantaMasaIndex += 12;
        }
        amantaMasaIndex = amantaMasaIndex % 12;

        const date = this.yexaaPanchangImpl.calData(refinedJd);
        newMoons.push({
          jd: refinedJd,
          masaIndex: amantaMasaIndex,
          date,
          isLeapMonth: masaResult.is_leap_month,
        });
      }

      prevPhase = phase;
    }

    // Filter for matching masa index
    const matchingByMasa = newMoons.filter(nm => nm.masaIndex === masaIno);

    if (matchingByMasa.length === 0) {
      console.error('No new moon found with masaIno', masaIno);
      return null;
    }

    // Strategy: Pick the new moon that falls in the target Gregorian year
    // For masas that span year boundary, prefer the one closer to mid-year

    // First, try to find one that's strictly in the target year
    const inTargetYear = matchingByMasa.filter(nm => nm.date.getFullYear() === year);

    if (inTargetYear.length > 0) {
      // If multiple in target year, prefer based on preferLeapMonth parameter
      if (preferLeapMonth) {
        // Prefer LEAP month if requested
        const leapMonths = inTargetYear.filter(nm => nm.isLeapMonth);
        if (leapMonths.length > 0) {
          leapMonths.sort((a, b) => a.jd - b.jd);
          return { jd: leapMonths[0].jd, isLeapMonth: leapMonths[0].isLeapMonth };
        }
      }

      // Default: prefer NON-LEAP month (regular masa)
      const nonLeap = inTargetYear.filter(nm => !nm.isLeapMonth);
      if (nonLeap.length > 0) {
        nonLeap.sort((a, b) => a.jd - b.jd);
        return { jd: nonLeap[0].jd, isLeapMonth: nonLeap[0].isLeapMonth };
      }

      // If all are leap months (or no non-leap found), pick the first one (chronologically)
      inTargetYear.sort((a, b) => a.jd - b.jd);
      return { jd: inTargetYear[0].jd, isLeapMonth: inTargetYear[0].isLeapMonth };
    }

    // If none in target year, check early next year (Jan-Mar only)
    const earlyNextYear = matchingByMasa.filter(
      nm => nm.date.getFullYear() === year + 1 && nm.date.getMonth() <= 2
    );

    if (earlyNextYear.length > 0) {
      // Prefer non-leap months
      const nonLeap = earlyNextYear.filter(nm => !nm.isLeapMonth);
      if (nonLeap.length > 0) {
        nonLeap.sort((a, b) => a.jd - b.jd);
        return { jd: nonLeap[0].jd, isLeapMonth: nonLeap[0].isLeapMonth };
      }

      earlyNextYear.sort((a, b) => a.jd - b.jd);
      return { jd: earlyNextYear[0].jd, isLeapMonth: earlyNextYear[0].isLeapMonth };
    }

    // Fallback: just return the first non-leap match, or first match
    const nonLeap = matchingByMasa.filter(nm => !nm.isLeapMonth);
    if (nonLeap.length > 0) {
      return { jd: nonLeap[0].jd, isLeapMonth: nonLeap[0].isLeapMonth };
    }
    return { jd: matchingByMasa[0].jd, isLeapMonth: matchingByMasa[0].isLeapMonth };
  }

  /**
   * Find exact new moon JD using binary search
   * New moon is when lunar phase = 0°
   *
   * @param startJd - Lower bound JD
   * @param endJd - Upper bound JD
   * @returns JD of new moon
   */
  private findExactNewMoon(startJd: number, endJd: number): number {
    let jdLow = startJd;
    let jdHigh = endJd;

    // Binary search for phase = 0
    while (jdHigh - jdLow > 0.0001) {
      const mid = (jdLow + jdHigh) / 2;
      const phase = this.yexaaPanchangImpl.lunarPhase(mid);

      // Handle phase wrapping at 0/360
      if (phase > 180) {
        jdLow = mid;
      } else {
        jdHigh = mid;
      }
    }

    return (jdLow + jdHigh) / 2;
  }

  /**
   * Get masa using solar month comparison between consecutive new moons
   *
   * @param newMoonJd - JD of the new moon (start of masa)
   * @returns Masa result with n_maasa (1-based) and is_leap_month
   */
  private getMasaForNewMoon(newMoonJd: number): { n_maasa: number; is_leap_month: boolean } {
    // Use EXACTLY the same algorithm as yexaaCalculateFunc.getMasa()
    // At new moon, tithi = 1
    const tithi = 1;
    const lastNewMoon = newMoonJd - (tithi - 1); // = newMoonJd - 0 = newMoonJd
    const nextNewMoon = newMoonJd + (29 - (tithi - 1)); // = newMoonJd + 29

    const currentSolarMonth = this.getCalendarRaasi(
      this.yexaaPanchangImpl.sun(lastNewMoon),
      this.yexaaPanchangImpl.calcayan(lastNewMoon)
    );
    const nextSolarMonth = this.getCalendarRaasi(
      this.yexaaPanchangImpl.sun(nextNewMoon),
      this.yexaaPanchangImpl.calcayan(nextNewMoon)
    );

    const is_leap_month = currentSolarMonth === nextSolarMonth;
    // For leap months: use currentSolarMonth + 1 (the masa it's adhika to)
    // For regular months: use currentSolarMonth + 1 (the next masa)
    // This ensures leap month has same masaIno as the following regular month
    let n_maasa = currentSolarMonth + 1;
    if (n_maasa > 12) {
      n_maasa = n_maasa % 12;
    }

    return { n_maasa, is_leap_month };
  }

  /**
   * Get calendar raasi (solar month) from sun longitude
   * Returns 1-12 (same as getMasa logic)
   */
  private getCalendarRaasi(sunLong: number, ayanamsa: number): number {
    const solar_nirayana = this.yexaaPanchangImpl.fix360(sunLong + ayanamsa);
    return Math.ceil(solar_nirayana / 30);
  }

  /**
   * Find phase crossing using forward search and binary refinement
   * Based on the proven algorithm from getTithiDates.ts
   */
  private findPhaseCrossing(
    startJd: number,
    endJd: number,
    targetPhase: number,
    isStart: boolean,
    isWrapping: boolean
  ): number | null {
    // First pass: coarse search with 0.01 day steps
    for (let jd = startJd; jd < endJd; jd += 0.01) {
      const prevPhase = this.yexaaPanchangImpl.lunarPhase(jd) % 360;
      const currPhase = this.yexaaPanchangImpl.lunarPhase(jd + 0.01) % 360;

      let crossed = false;

      if (isWrapping && targetPhase === 0) {
        // Handle wrap from 348+ to 0-12 (new moon)
        crossed = prevPhase > 348 && currPhase < 12;
      } else if (isWrapping && targetPhase === 348) {
        // Handle approaching new moon
        crossed = prevPhase < 348 && currPhase >= 348;
      } else if (targetPhase === 0 && prevPhase > 340) {
        // Handle tithi 1 start (wrap from 359 to 0)
        crossed = currPhase < 12;
      } else {
        // Normal crossing
        crossed = prevPhase < targetPhase && currPhase >= targetPhase;
      }

      if (crossed) {
        // Refine using binary search
        return this.refinePhaseBoundary(jd, jd + 0.01, targetPhase, isStart, isWrapping);
      }
    }

    return null;
  }

  /**
   * Binary search to refine phase boundary to high precision
   * Based on refineTithiBoundary from getTithiDates.ts
   */
  private refinePhaseBoundary(
    startJd: number,
    endJd: number,
    targetPhase: number,
    isStart: boolean,
    isWrapping: boolean
  ): number {
    while (endJd - startJd > 0.00001) {
      const mid = (startJd + endJd) / 2;
      const phase = this.yexaaPanchangImpl.lunarPhase(mid) % 360;

      if (isWrapping && targetPhase === 0) {
        // For wrap point to new moon
        if (phase > 180) {
          startJd = mid;
        } else {
          endJd = mid;
        }
      } else if (isWrapping && targetPhase === 348) {
        // For approaching new moon
        if (phase < 348) {
          startJd = mid;
        } else {
          endJd = mid;
        }
      } else if (isStart) {
        // For start boundary, phase should be just under target
        if (phase < targetPhase) {
          startJd = mid;
        } else {
          endJd = mid;
        }
      } else {
        // For end boundary, phase should be just under target
        if (phase < targetPhase) {
          startJd = mid;
        } else {
          endJd = mid;
        }
      }
    }

    return isStart ? endJd : startJd;
  }

  /**
   * Fast calculation of all tithi boundaries in a calendar year
   * Uses intelligent date sampling instead of masa iteration
   *
   * @param year - Calendar year (Jan 1 to Dec 31)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param tzone - Timezone offset in hours (optional)
   * @returns Array of all tithi boundaries in the year
   */
  getAllTithiBoundariesInYear(
    year: number,
    lat: number,
    lng: number,
    tzone?: number
  ): Array<{
    tithiIno: number;
    startTime: Date;
    endTime: Date;
    masaIno: number;
    isLeapMonth: boolean;
  }> {
    const results: Array<{
      tithiIno: number;
      startTime: Date;
      endTime: Date;
      masaIno: number;
      isLeapMonth: boolean;
    }> = [];

    // Start from Dec 15 of previous year to catch tithis that start before Jan 1
    const searchStart = this.yexaaPanchangImpl.mdy2julian(12, 15, year - 1);
    const searchEnd = this.yexaaPanchangImpl.mdy2julian(1, 15, year + 1);

    const yearStart = new Date(year, 0, 1, 0, 0, 0);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    let currentJd = searchStart;
    let prevPhase = this.yexaaPanchangImpl.lunarPhase(currentJd);

    // Step through with 6-hour intervals to catch all phase crossings
    const step = 0.25; // 6 hours

    while (currentJd < searchEnd) {
      currentJd += step;
      const currentPhase = this.yexaaPanchangImpl.lunarPhase(currentJd);

      // Check if we crossed a 12-degree boundary (tithi boundary)
      // Tithis are at 0°, 12°, 24°, 36°, ..., 348°
      const prevTithi = Math.floor(prevPhase / 12);
      const currTithi = Math.floor(currentPhase / 12);

      // Handle phase wrap-around at 360°/0°
      const wrappedAround = prevPhase > 300 && currentPhase < 60;

      if (prevTithi !== currTithi || wrappedAround) {
        // We crossed a tithi boundary, find the exact crossing
        const targetPhase = wrappedAround ? 0 : currTithi * 12;
        const exactJd = this.findExactPhaseCrossing(
          currentJd - step,
          currentJd,
          targetPhase,
          wrappedAround
        );

        if (exactJd) {
          // This is the START of a new tithi
          // The tithi that just started
          let tithiIno = Math.floor(this.yexaaPanchangImpl.lunarPhase(exactJd + 0.001) / 12);
          if (tithiIno >= 30) tithiIno = 0; // Wrap around

          // Find the END of this tithi (next boundary)
          const nextTithiIno = (tithiIno + 1) % 30;
          const endPhase = (nextTithiIno * 12) % 360;
          const endJd = this.findExactPhaseCrossing(
            exactJd,
            exactJd + 2, // Tithi lasts ~1 day, search 2 days ahead
            endPhase,
            nextTithiIno === 0 // Wrap if going to tithi 0
          );

          if (endJd) {
            // If tzone not provided, calculate from a sample date
            let timezoneOffset = tzone;
            if (timezoneOffset === undefined) {
              const sampleDate = new Date(year, 0, 1);
              timezoneOffset = (sampleDate.getTimezoneOffset() / 60) * -1;
            }

            const dtStart = this.yexaaPanchangImpl.dTime(exactJd);
            const dtEnd = this.yexaaPanchangImpl.dTime(endJd);

            const startTime = this.yexaaPanchangImpl.calData(
              exactJd + (timezoneOffset - dtStart) / 24
            );
            const endTime = this.yexaaPanchangImpl.calData(endJd + (timezoneOffset - dtEnd) / 24);

            // Only include if it overlaps with the target year
            if (startTime <= yearEnd && endTime >= yearStart) {
              // Calculate masa for the NEW MOON of this lunar month
              // Find the new moon (tithi 0/30) that started this lunar month
              // The new moon is the beginning of the month (when tithi transitions from 29 to 0)

              // Find the new moon JD for this lunar month
              // We know this tithi's exact JD, so we can find the previous new moon
              let newMoonJd = exactJd;

              // If tithiIno is 0 (Padyami/new moon), this IS the new moon
              if (tithiIno !== 0) {
                // Search backwards from this tithi to find the new moon (phase = 0)
                // Tithis are ~1 day each, so search back at most 30 days
                for (let searchJd = exactJd - 1; searchJd > exactJd - 32; searchJd -= 0.25) {
                  const phase = this.yexaaPanchangImpl.lunarPhase(searchJd);
                  const nextPhase = this.yexaaPanchangImpl.lunarPhase(searchJd + 0.25);

                  // Detect new moon crossing (phase goes from ~350+ to ~0-10)
                  if (phase > 350 && nextPhase < 10) {
                    // Refine to exact new moon
                    newMoonJd =
                      this.findExactPhaseCrossing(searchJd, searchJd + 0.25, 0, true) || searchJd;
                    break;
                  }
                }
              }

              // Now calculate masa using the new moon JD (tithi = 1 at new moon)
              const masaResult = this.getMasaForNewMoon(newMoonJd);

              // Convert n_maasa (1-based) to Amanta masaIno (0-based)
              let masaIno = masaResult.n_maasa - 1;
              if (masaIno < 0) {
                masaIno += 12;
              }
              masaIno = masaIno % 12;
              const isLeapMonth = masaResult.is_leap_month;

              results.push({
                tithiIno,
                startTime,
                endTime,
                masaIno,
                isLeapMonth,
              });
            }
          }
        }
      }

      prevPhase = currentPhase;
    }

    // Sort by start time
    results.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return results;
  }

  /**
   * Find exact JD where lunar phase crosses a target value
   */
  private findExactPhaseCrossing(
    startJd: number,
    endJd: number,
    targetPhase: number,
    isWrapping: boolean
  ): number | null {
    let low = startJd;
    let high = endJd;

    // Binary search for exact crossing
    while (high - low > 0.00001) {
      // ~0.86 seconds precision
      const mid = (low + high) / 2;
      const phase = this.yexaaPanchangImpl.lunarPhase(mid);

      if (isWrapping && targetPhase === 0) {
        // Crossing from 359° to 0°
        if (phase > 180) {
          low = mid;
        } else {
          high = mid;
        }
      } else {
        // Normal crossing
        if (phase < targetPhase) {
          low = mid;
        } else {
          high = mid;
        }
      }
    }

    return (low + high) / 2;
  }

  /**
   * Calculate tithi boundaries for an entire year
   * Returns all occurrences of a specific tithi in a specific masa for the year
   *
   * @param year - Gregorian year
   * @param tithiIno - Tithi index (0-29)
   * @param masaIno - Masa index (0-11)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param height - Optional elevation
   * @param tzone - Timezone offset in hours (optional)
   * @returns Array of tithi occurrences with start/end times
   */
  findTithiOccurrencesInYear(
    year: number,
    tithiIno: number,
    masaIno: number,
    lat: number,
    lng: number,
    height: number = 0,
    tzone?: number
  ): Array<{ startTime: Date; endTime: Date }> {
    const results: Array<{ startTime: Date; endTime: Date }> = [];

    // A tithi occurs once per lunar cycle (~29.5 days)
    // There are roughly 12.4 cycles per year, so max 13 occurrences possible
    for (let i = 0; i < 13; i++) {
      const boundaries = this.calculateTithiBoundaries(
        tithiIno,
        masaIno,
        lat,
        lng,
        year + i / 12, // Distribute search across year
        height,
        false,
        tzone
      );

      if (boundaries) {
        // Check if date is within target year
        if (boundaries.startTime.getFullYear() === year) {
          results.push(boundaries);
        }
      }
    }

    return results;
  }
}
