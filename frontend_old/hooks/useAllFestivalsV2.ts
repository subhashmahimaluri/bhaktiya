import { useLocation } from '@/context/LocationContext';
import { getSankrantisForCalendarYear } from '@/lib/panchangam/getSankrantisForCalendarYear';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { YexaaTithiCalculate } from '@/lib/panchangam/yexaaTithiCalculate';
import gregorianFestivalsData from '@/public/gregorian_festivals.json';
import festivalsData from '@/public/telugu_festivals.json';
import type { CalculationType as FestivalCalculationType } from '@/utils/festivalDateCalculator';
import { getFestivalDisplayDate } from '@/utils/festivalDateCalculator';
import { createMoon } from 'astronomy-bundle/moon';
import { createSun } from 'astronomy-bundle/sun';
import { createTimeOfInterest } from 'astronomy-bundle/time';
import { useEffect, useMemo, useState } from 'react';

// Helper function to replace {{masa}} placeholder with actual masa name
function replaceMasaPlaceholder(
  festivalName: string,
  masaIno: number,
  locale: 'en' | 'te'
): string {
  if (!festivalName.includes('{{masa}}')) {
    return festivalName;
  }

  const yexaaConstant = new YexaaLocalConstant();
  const masaName =
    locale === 'te' ? yexaaConstant.Masa.name_TE[masaIno] : yexaaConstant.Masa.name[masaIno];

  return festivalName.replace('{{masa}}', masaName || '');
}

export interface Festival {
  festival_name: string;
  tithi: string;
  tithiStarts?: Date;
  tithiEnds?: Date;
  nakshatra: string;
  telugu_month: string;
  vaara: string;
  adhik_maasa: string;
  festival_type: string;
  vratha_name: string;
  festival_en: string;
  festival_te: string;
  telugu_en_priority: string;
  festival_based_on: string;
  festival_url?: string;
  image?: string;
}

export interface FestivalOccurrence {
  date: Date;
  festival: Festival;
  calculationType: 'Sunrise' | 'Sunset' | 'Pradosha' | 'Moonrise' | 'Shivaratri' | 'AfterSunrise';
  masaIno: number;
  isLeapMonth: boolean;
  muhurta_start?: Date;
  muhurta_end?: Date;
}

export interface UseAllFestivalsV2Result {
  festivals: FestivalOccurrence[];
  allFestivals: FestivalOccurrence[];
  loading: boolean;
  error: string | null;
}

export function useAllFestivalsV2(
  year: number,
  monthFilter?: number,
  priorityFilter?: number | number[],
  vrathaNameFilter?: string,
  calculationTypeFilter?: string,
  skip: boolean = false
): UseAllFestivalsV2Result {
  const { lat, lng, offset: tzone } = useLocation();
  const [allFestivals, setAllFestivals] = useState<FestivalOccurrence[]>([]);
  const [loading, setLoading] = useState(!skip); // Start as true unless skipping
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function calculateFestivals() {
      if (skip) {
        setLoading(false);
        return;
      }

      if (!lat || !lng) {
        setError('Location not set');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tithiCalculator = new YexaaTithiCalculate();
        const festivalOccurrences: FestivalOccurrence[] = [];

        // Helper function to convert JD to local Date
        const jdToLocalDate = (jd: number): Date | null => {
          try {
            // Convert JD to UTC Date
            const utcDate = new Date((jd - 2440587.5) * 86400000);
            if (isNaN(utcDate.getTime())) {
              console.error('Invalid date created from JD:', jd);
              return null;
            }
            // Return the UTC date - the JD already represents the correct moment in time
            // We'll extract local date components when needed using getFullYear(), getMonth(), getDate()
            return utcDate;
          } catch (err) {
            console.error('Error converting JD to date:', err);
            return null;
          }
        };

        // Helper function to calculate Nishita Muhurta for Shivaratri
        interface ShivaratriMuhurta {
          nishita_muhurta_start: Date;
          nishita_muhurta_end: Date;
        }

        const calculateNishitaMuhurta = async (
          date: Date,
          tithiStart: Date,
          tithiEnd: Date
        ): Promise<ShivaratriMuhurta | null> => {
          try {
            // Get sunset on the given date
            const noonDate = new Date(date);
            noonDate.setHours(12, 0, 0, 0);
            const toi = createTimeOfInterest.fromDate(noonDate);
            const sun = createSun(toi);
            const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
            if (!sunset || !sunset.jd) {
              return null;
            }
            const sunsetTime = jdToLocalDate(sunset.jd);
            if (!sunsetTime) {
              return null;
            }

            // Get next day's sunrise
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(12, 0, 0, 0);
            const toiNextDay = createTimeOfInterest.fromDate(nextDay);
            const sunNextDay = createSun(toiNextDay);
            const sunrise = await sunNextDay.getRise({ lat, lon: lng, elevation: 0 });
            if (!sunrise || !sunrise.jd) {
              return null;
            }
            const sunriseTime = jdToLocalDate(sunrise.jd);
            if (!sunriseTime) {
              return null;
            }

            // Calculate total night duration in milliseconds
            const nightDuration = sunriseTime.getTime() - sunsetTime.getTime();

            // Divide night into 30 equal parts (muhurtas)
            const muhuртaDuration = nightDuration / 30;

            // Find true local midnight (midpoint between sunset and sunrise)
            const trueLocalMidnight = new Date(sunsetTime.getTime() + nightDuration / 2);

            // Find which muhurta contains the true local midnight
            // Muhurtas are numbered 1-30, starting from sunset
            const muhurtaIndex = Math.floor(
              (trueLocalMidnight.getTime() - sunsetTime.getTime()) / muhuртaDuration
            );

            // Calculate Nishita Muhurta start and end
            const nishitaStart = new Date(sunsetTime.getTime() + muhurtaIndex * muhuртaDuration);
            const nishitaEnd = new Date(
              sunsetTime.getTime() + (muhurtaIndex + 1) * muhuртaDuration
            );

            return {
              nishita_muhurta_start: nishitaStart,
              nishita_muhurta_end: nishitaEnd,
            };
          } catch (err) {
            console.error('Error calculating Nishita Muhurta:', err);
            return null;
          }
        };

        // Helper function to get calculation time for a specific date and type
        const getCalculationTime = async (
          date: Date,
          calculationType: FestivalCalculationType
        ): Promise<Date | null> => {
          try {
            // Force local-noon construction to avoid timezone edge cases
            // Extract local calendar date components first
            const localYear = date.getFullYear();
            const localMonth = date.getMonth();
            const localDate = date.getDate();

            // Create fresh Date at local noon (12:00:00.000)
            const noonDate = new Date(localYear, localMonth, localDate, 12, 0, 0, 0);
            const toi = createTimeOfInterest.fromDate(noonDate);

            switch (calculationType) {
              case 'Sunrise': {
                const sun = createSun(toi);
                const sunrise = await sun.getRise({ lat, lon: lng, elevation: 0 });
                if (sunrise && sunrise.jd) {
                  const sunriseDate = jdToLocalDate(sunrise.jd);
                  if (sunriseDate) {
                    // Add offset of 2.5 hours (150 minutes) after sunrise for tithi determination
                    // This matches traditional panchang calculation (3 muhurtas)
                    const adjustedTime = new Date(sunriseDate.getTime() + 150 * 60 * 1000);
                    return adjustedTime;
                  }
                }
                return null;
              }
              case 'Sunset': {
                const sun = createSun(toi);
                const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
                if (sunset && sunset.jd) {
                  return jdToLocalDate(sunset.jd);
                }
                return null;
              }
              case 'Pradosha': {
                // Pradosha is ~1.5 hours after sunset
                const sun = createSun(toi);
                const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
                if (sunset && sunset.jd) {
                  const sunsetDate = jdToLocalDate(sunset.jd);
                  if (sunsetDate) {
                    // Add 1.5 hours (90 minutes)
                    return new Date(sunsetDate.getTime() + 90 * 60 * 1000);
                  }
                }
                return null;
              }
              case 'Moonrise': {
                // Calculate moonrise from noon of the given date
                const moon = createMoon(toi);
                const moonrise = await moon.getRise({ lat, lon: lng, elevation: 0 });
                if (moonrise && moonrise.jd) {
                  return jdToLocalDate(moonrise.jd);
                }
                return null;
              }
              case 'AfterSunrise': {
                // AfterSunrise returns sunrise time for checking if tithi starts after it
                const sun = createSun(toi);
                const sunrise = await sun.getRise({ lat, lon: lng, elevation: 0 });
                if (sunrise && sunrise.jd) {
                  return jdToLocalDate(sunrise.jd);
                }
                return null;
              }
              default:
                return null;
            }
          } catch (err) {
            console.warn(`Could not calculate ${calculationType} for ${date}:`, err);
            return null;
          }
        };

        // Get Sankrantis first
        try {
          const yexaaConstant = new YexaaLocalConstant();
          const panchangImpl = new YexaaPanchangImpl(yexaaConstant);
          const sankrantisData = await getSankrantisForCalendarYear(panchangImpl, year, 'UTC', {
            tolSec: 1,
          });

          sankrantisData.forEach(sankranti => {
            const utcDate = sankranti.utcDate;
            const sankYear = utcDate.getUTCFullYear();
            const month = utcDate.getUTCMonth();
            const day = utcDate.getUTCDate();
            const dateObj = new Date(Date.UTC(sankYear, month, day));

            // Only Makara Sankranti has priority 1, others have priority 3
            const priority = sankranti.signName === 'Makara' ? '1' : '3';

            festivalOccurrences.push({
              date: dateObj,
              festival: {
                festival_name: `${sankranti.signName} Sankranti`,
                tithi: '',
                nakshatra: '',
                telugu_month: '',
                vaara: '',
                adhik_maasa: '',
                festival_type: 'vratha',
                vratha_name: 'masa_sankranti',
                festival_en: `${sankranti.signName} Sankranti`,
                festival_te: `${sankranti.signNameTe} సంక్రాంతి`,
                telugu_en_priority: priority,
                festival_based_on: 'sunrise',
                festival_url: `/calendar/festivals/${sankranti.signName.toLowerCase()}-sankranti`,
                image: '/images/festivals/makara-sankranthi.png',
              },
              calculationType: 'Sunrise',
              masaIno: -1, // Sankrantis are solar, not lunar
              isLeapMonth: false,
            });

            // Add Bhogi (day before Makara Sankranti) and Kanuma (day after Makara Sankranti)
            if (sankranti.signName === 'Makara') {
              // Bhogi - day before Makara Sankranti
              const bhogiDate = new Date(Date.UTC(sankYear, month, day - 1));
              festivalOccurrences.push({
                date: bhogiDate,
                festival: {
                  festival_name: 'Bhogi',
                  tithi: '',
                  nakshatra: '',
                  telugu_month: '',
                  vaara: '',
                  adhik_maasa: '',
                  festival_type: 'Festival',
                  vratha_name: 'bhogi',
                  festival_en: 'Bhogi',
                  festival_te: 'భోగి',
                  telugu_en_priority: '1',
                  festival_based_on: 'sunrise',
                  festival_url: `/calendar/festivals/bhogi`,
                  image: '/images/festivals/bhogi.png',
                },
                calculationType: 'Sunrise',
                masaIno: -1, // Not lunar
                isLeapMonth: false,
              });

              // Kanuma - day after Makara Sankranti
              const kanumaDate = new Date(Date.UTC(sankYear, month, day + 1));
              festivalOccurrences.push({
                date: kanumaDate,
                festival: {
                  festival_name: 'Kanuma',
                  tithi: '',
                  nakshatra: '',
                  telugu_month: '',
                  vaara: '',
                  adhik_maasa: '',
                  festival_type: 'Festival',
                  vratha_name: 'kanuma',
                  festival_en: 'Kanuma',
                  festival_te: 'కనుమ',
                  telugu_en_priority: '1',
                  festival_based_on: 'sunrise',
                  festival_url: `/calendar/festivals/kanuma`,
                  image: '/images/festivals/kanuma.png',
                },
                calculationType: 'Sunrise',
                masaIno: -1, // Not lunar
                isLeapMonth: false,
              });
            }
          });
        } catch (err) {
          console.error('Error fetching sankrantis:', err);
        }

        // Add Gregorian date-based festivals
        try {
          for (const gregorianFestival of gregorianFestivalsData as Array<{
            festival_name: string;
            month: number;
            date: number;
            festival_en: string;
            festival_te: string;
            festival_type: string;
            vratha_name: string;
            telugu_en_priority: string;
            festival_based_on: string;
          }>) {
            // Create a date for this festival in the given year
            const festivalDate = new Date(
              Date.UTC(year, gregorianFestival.month - 1, gregorianFestival.date)
            );

            // Only include if it's within the calendar year
            if (festivalDate.getUTCFullYear() === year) {
              festivalOccurrences.push({
                date: festivalDate,
                festival: {
                  festival_name: gregorianFestival.festival_name,
                  tithi: '',
                  nakshatra: '',
                  telugu_month: '',
                  vaara: '',
                  adhik_maasa: '',
                  festival_type: gregorianFestival.festival_type,
                  vratha_name: gregorianFestival.vratha_name,
                  festival_en: gregorianFestival.festival_en,
                  festival_te: gregorianFestival.festival_te,
                  telugu_en_priority: gregorianFestival.telugu_en_priority,
                  festival_based_on: gregorianFestival.festival_based_on,
                },
                calculationType: 'Sunrise',
                masaIno: -1, // Gregorian festivals are not lunar
                isLeapMonth: false,
              });
            }
          }
        } catch (err) {
          console.error('Error processing gregorian festivals:', err);
        }

        // OPTIMIZATION: Pre-calculate ALL tithi boundaries for the year once
        // This is much faster than calculating each festival individually
        const allTithiBoundaries = tithiCalculator.getAllTithiBoundariesInYear(year, lat, lng, tzone);

        // Create a lookup map: "tithiIno-masaIno-isLeapMonth" -> array of boundaries
        // Note: Store as array because same tithi can occur multiple times in same masa
        const boundaryMap = new Map<string, Array<(typeof allTithiBoundaries)[0]>>();
        allTithiBoundaries.forEach(boundary => {
          const key = `${boundary.tithiIno}-${boundary.masaIno}-${boundary.isLeapMonth}`;
          if (!boundaryMap.has(key)) {
            boundaryMap.set(key, []);
          }
          boundaryMap.get(key)!.push(boundary);
        });

        // Process each festival from JSON - now just lookup instead of calculate
        for (const festival of festivalsData as Festival[]) {
          if (!festival.tithi || festival.tithi === '') {
            continue;
          }

          const tithiIndex = parseInt(festival.tithi) - 1; // Convert to 0-based (ino)
          const masaIndex = festival.telugu_month ? parseInt(festival.telugu_month) - 1 : -1; // Convert to 0-based (ino)
          const isAdhikMaasaFestival = festival.adhik_maasa === '1';

          // Handle festivals with specific telugu_month
          if (masaIndex >= 0) {
            // Lookup from pre-calculated boundaries
            const key = `${tithiIndex}-${masaIndex}-${isAdhikMaasaFestival}`;
            const boundaries = boundaryMap.get(key) || [];

            // Add all matching boundaries (there may be multiple occurrences)
            for (const boundary of boundaries) {
              // Only include festivals within the calendar year
              if (
                boundary.startTime.getFullYear() === year &&
                boundary.startTime >= new Date(year, 0, 1) &&
                boundary.endTime <= new Date(year + 1, 0, 1)
              ) {
                const calcType = getCalculationType(festival);

                // Extract local date from tithi start using UTC components to avoid timezone shift
                const startDate = new Date(
                  Date.UTC(
                    boundary.startTime.getUTCFullYear(),
                    boundary.startTime.getUTCMonth(),
                    boundary.startTime.getUTCDate(),
                    0,
                    0,
                    0,
                    0
                  )
                );

                const nextDate = new Date(startDate);
                nextDate.setUTCDate(nextDate.getUTCDate() + 1);

                // Get calculation time for start date
                const calcTime = await getCalculationTime(startDate, calcType);

                // For Shivaratri, calculate Nishita Muhurta
                let shivaratriMuhurta: ShivaratriMuhurta | null = null;
                if (calcType === 'Shivaratri') {
                  shivaratriMuhurta = await calculateNishitaMuhurta(
                    startDate,
                    boundary.startTime,
                    boundary.endTime
                  );
                }

                // For moonrise: if moonrise is BEFORE tithi starts or not found, use startTime + 1 day
                let displayDate: Date;
                if (calcType === 'Shivaratri') {
                  // For Shivaratri: check if tithi (Chaturdashi - tithi.ino === 28) starts before Nishita Muhurta
                  if (shivaratriMuhurta) {
                    if (boundary.startTime < shivaratriMuhurta.nishita_muhurta_start) {
                      // Tithi starts before Nishita Muhurta - use start date
                      displayDate = startDate;
                    } else {
                      // Tithi starts after Nishita Muhurta - use next day
                      const nextDay = new Date(startDate);
                      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                      displayDate = nextDay;
                    }
                  } else {
                    // Fallback if calculation fails
                    displayDate = startDate;
                  }
                } else if (calcType === 'AfterSunrise') {
                  // Skanda Sashti: If Shashthi starts after sunset of its own day, observe next day
                  const shashthiStartInstant = boundary.startTime;
                  if (!shashthiStartInstant) {
                    displayDate = startDate;
                  } else {
                    const shYear = shashthiStartInstant.getUTCFullYear();
                    const shMonth = shashthiStartInstant.getUTCMonth();
                    const shDate = shashthiStartInstant.getUTCDate();
                    const shashthiDayMidnight = new Date(
                      Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0)
                    );

                    const sunsetOfShashthiDay = await getCalculationTime(
                      shashthiDayMidnight,
                      'Sunset'
                    );

                    displayDate = new Date(Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0));

                    if (
                      sunsetOfShashthiDay &&
                      shashthiStartInstant.getTime() > sunsetOfShashthiDay.getTime()
                    ) {
                      displayDate.setUTCDate(displayDate.getUTCDate() + 1);
                    } else if (!sunsetOfShashthiDay) {
                      displayDate = startDate;
                    }
                  }
                } else if (calcType === 'Moonrise') {
                  if (!calcTime || calcTime < boundary.startTime) {
                    // Moonrise doesn't exist or happens before tithi starts - use startTime + 1 day
                    const nextDay = new Date(boundary.startTime);
                    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                    displayDate = new Date(
                      Date.UTC(
                        nextDay.getUTCFullYear(),
                        nextDay.getUTCMonth(),
                        nextDay.getUTCDate()
                      )
                    );
                  } else {
                    // Moonrise is valid - use the moonrise date
                    displayDate = new Date(
                      Date.UTC(
                        calcTime.getUTCFullYear(),
                        calcTime.getUTCMonth(),
                        calcTime.getUTCDate()
                      )
                    );
                  }
                } else {
                  // For other calculation types, use the existing logic
                  const nextDayCalcTime = await getCalculationTime(nextDate, calcType);

                  displayDate = getFestivalDisplayDate(
                    boundary,
                    calcType,
                    calcTime,
                    nextDayCalcTime
                  );
                }

                festivalOccurrences.push({
                  date: displayDate,
                  festival: {
                    ...festival,
                    festival_en: replaceMasaPlaceholder(
                      festival.festival_en,
                      boundary.masaIno,
                      'en'
                    ),
                    festival_te: replaceMasaPlaceholder(
                      festival.festival_te,
                      boundary.masaIno,
                      'te'
                    ),
                    tithiStarts: boundary.startTime,
                    tithiEnds: boundary.endTime,
                  },
                  calculationType: calcType,
                  masaIno: boundary.masaIno,
                  isLeapMonth: boundary.isLeapMonth,
                  ...(calcType === 'Shivaratri' && shivaratriMuhurta
                    ? {
                        muhurta_start: shivaratriMuhurta.nishita_muhurta_start,
                        muhurta_end: shivaratriMuhurta.nishita_muhurta_end,
                      }
                    : {}),
                });
              }
            }
          } else {
            // Handle festivals without specific month
            // Look for ALL occurrences of this tithi across all masas
            for (let masa = 0; masa < 12; masa++) {
              const key = `${tithiIndex}-${masa}-${isAdhikMaasaFestival}`;
              const boundaries = boundaryMap.get(key) || [];

              // Add all matching boundaries for this masa
              for (const boundary of boundaries) {
                // Only include festivals within the calendar year
                if (
                  boundary.startTime.getFullYear() === year &&
                  boundary.startTime >= new Date(year, 0, 1) &&
                  boundary.endTime <= new Date(year + 1, 0, 1)
                ) {
                  const calcType = getCalculationType(festival);

                  // Extract local date from tithi start using UTC components to avoid timezone shift
                  const startDate = new Date(
                    Date.UTC(
                      boundary.startTime.getUTCFullYear(),
                      boundary.startTime.getUTCMonth(),
                      boundary.startTime.getUTCDate(),
                      0,
                      0,
                      0,
                      0
                    )
                  );

                  const nextDate = new Date(startDate);
                  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

                  // Get calculation time for start date
                  const calcTime = await getCalculationTime(startDate, calcType);

                  // For Shivaratri, calculate Nishita Muhurta
                  let shivaratriMuhurta: ShivaratriMuhurta | null = null;
                  if (calcType === 'Shivaratri') {
                    shivaratriMuhurta = await calculateNishitaMuhurta(
                      startDate,
                      boundary.startTime,
                      boundary.endTime
                    );
                  }

                  let displayDate: Date;
                  if (calcType === 'Shivaratri') {
                    // For Shivaratri: check if tithi (Chaturdashi - tithi.ino === 28) starts before Nishita Muhurta
                    if (shivaratriMuhurta) {
                      if (boundary.startTime < shivaratriMuhurta.nishita_muhurta_start) {
                        // Tithi starts before Nishita Muhurta - use start date
                        displayDate = startDate;
                      } else {
                        // Tithi starts after Nishita Muhurta - use next day
                        const nextDay = new Date(startDate);
                        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                        displayDate = nextDay;
                      }
                    } else {
                      // Fallback if calculation fails
                      displayDate = startDate;
                    }
                  } else if (calcType === 'AfterSunrise') {
                    // Skanda Sashti: If Shashthi starts after sunset of its own day, observe next day
                    const shashthiStartInstant = boundary.startTime;
                    if (!shashthiStartInstant) {
                      displayDate = startDate;
                    } else {
                      const shYear = shashthiStartInstant.getUTCFullYear();
                      const shMonth = shashthiStartInstant.getUTCMonth();
                      const shDate = shashthiStartInstant.getUTCDate();
                      const shashthiDayMidnight = new Date(
                        Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0)
                      );

                      const sunsetOfShashthiDay = await getCalculationTime(
                        shashthiDayMidnight,
                        'Sunset'
                      );

                      displayDate = new Date(Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0));

                      if (
                        sunsetOfShashthiDay &&
                        shashthiStartInstant.getTime() > sunsetOfShashthiDay.getTime()
                      ) {
                        displayDate.setUTCDate(displayDate.getUTCDate() + 1);
                      } else if (!sunsetOfShashthiDay) {
                        displayDate = startDate;
                      }
                    }
                  } else if (calcType === 'Moonrise') {
                    if (!calcTime || calcTime < boundary.startTime) {
                      // Moonrise doesn't exist or happens before tithi starts - use startTime + 1 day
                      const nextDay = new Date(boundary.startTime);
                      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                      displayDate = new Date(
                        Date.UTC(
                          nextDay.getUTCFullYear(),
                          nextDay.getUTCMonth(),
                          nextDay.getUTCDate()
                        )
                      );
                    } else {
                      // Moonrise is valid - use the moonrise date
                      displayDate = new Date(
                        Date.UTC(
                          calcTime.getUTCFullYear(),
                          calcTime.getUTCMonth(),
                          calcTime.getUTCDate()
                        )
                      );
                    }
                  } else {
                    // For other calculation types, use the existing logic
                    const nextDayCalcTime = await getCalculationTime(nextDate, calcType);

                    displayDate = getFestivalDisplayDate(
                      boundary,
                      calcType,
                      calcTime,
                      nextDayCalcTime
                    );
                  }

                  festivalOccurrences.push({
                    date: displayDate,
                    festival: {
                      ...festival,
                      festival_en: replaceMasaPlaceholder(
                        festival.festival_en,
                        boundary.masaIno,
                        'en'
                      ),
                      festival_te: replaceMasaPlaceholder(
                        festival.festival_te,
                        boundary.masaIno,
                        'te'
                      ),
                    },
                    calculationType: calcType,
                    masaIno: boundary.masaIno,
                    isLeapMonth: boundary.isLeapMonth,
                    ...(calcType === 'Shivaratri' && shivaratriMuhurta
                      ? {
                          shivaratri_muhurta_start: shivaratriMuhurta.nishita_muhurta_start,
                          shivaratri_muhurta_end: shivaratriMuhurta.nishita_muhurta_end,
                        }
                      : {}),
                  });
                }
              }
            }
          }
        }

        // Sort by date
        festivalOccurrences.sort((a, b) => a.date.getTime() - b.date.getTime());

        setAllFestivals(festivalOccurrences);
      } catch (err) {
        console.error('Error calculating festivals:', err);
        setError('Failed to calculate festivals');
      } finally {
        setLoading(false);
      }
    }

    calculateFestivals();
  }, [year, lat, lng]);

  // Apply filters to festivals
  const filteredFestivals = useMemo(() => {
    let filtered = [...allFestivals];

    // Filter by calendar month if specified (1-12)
    if (monthFilter !== undefined) {
      filtered = filtered.filter(f => f.date.getUTCMonth() + 1 === monthFilter);
    }

    // Filter by priority if specified (telugu_en_priority)
    if (priorityFilter !== undefined) {
      const priorityArray = Array.isArray(priorityFilter) ? priorityFilter : [priorityFilter];
      filtered = filtered.filter(f => {
        const festivalPriority = parseInt(f.festival.telugu_en_priority || '999');
        return priorityArray.includes(festivalPriority);
      });
    }

    // Filter by vratha name if specified (vratha_name)
    if (vrathaNameFilter) {
      filtered = filtered.filter(
        f =>
          f.festival.vratha_name === vrathaNameFilter ||
          f.festival.festival_url === `/calendar/festivals/${vrathaNameFilter}` ||
          f.festival.festival_en.toLowerCase().replace(/\s+/g, '-') === vrathaNameFilter
      );
    }

    // Filter by calculation type if specified
    if (calculationTypeFilter) {
      filtered = filtered.filter(f => f.calculationType === calculationTypeFilter);
    }

    return filtered;
  }, [allFestivals, monthFilter, priorityFilter, vrathaNameFilter, calculationTypeFilter]);

  return { festivals: filteredFestivals, allFestivals, loading, error };
}

// Removed getMasaForDate and calculateFestivalDate - using tithi start time directly for now

/**
 * Get the calculation type display name
 */
function getCalculationType(
  festival: Festival
): 'Sunrise' | 'Sunset' | 'Pradosha' | 'Moonrise' | 'Shivaratri' | 'AfterSunrise' {
  const basedOn = festival.festival_based_on.toLowerCase();

  if (basedOn === 'sunrise') return 'Sunrise';
  if (basedOn === 'sunset') return 'Sunset';
  if (basedOn === 'pradosha') return 'Pradosha';
  if (basedOn === 'moonrise') return 'Moonrise';
  if (basedOn === 'shivaratri') return 'Shivaratri';
  if (basedOn === 'skanda_sashti') return 'AfterSunrise';

  return 'Sunrise'; // Default
}
