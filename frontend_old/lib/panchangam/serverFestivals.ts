import { getSankrantisForCalendarYear } from '@/lib/panchangam/getSankrantisForCalendarYear';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { YexaaTithiCalculate } from '@/lib/panchangam/yexaaTithiCalculate';
import gregorianFestivalsData from '@/public/gregorian_festivals.json';
import festivalsData from '@/public/telugu_festivals.json';
import { getFestivalDisplayDate } from '@/utils/festivalDateCalculator';
import { createMoon } from 'astronomy-bundle/moon';
import { createSun } from 'astronomy-bundle/sun';
import { createTimeOfInterest } from 'astronomy-bundle/time';

// Duplicate interfaces to avoid circular deps or just for simplicity
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

export async function calculateFestivalsServerSide(
  year: number,
  lat: number,
  lng: number,
  tzone: number
): Promise<FestivalOccurrence[]> {
  const tithiCalculator = new YexaaTithiCalculate();
  const festivalOccurrences: FestivalOccurrence[] = [];

  // Helper function to convert JD to local Date
  const jdToLocalDate = (jd: number): Date | null => {
    try {
      const utcDate = new Date((jd - 2440587.5) * 86400000);
      if (isNaN(utcDate.getTime())) {
        return null;
      }
      return utcDate;
    } catch (err) {
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
      const noonDate = new Date(date);
      noonDate.setHours(12, 0, 0, 0);
      const toi = createTimeOfInterest.fromDate(noonDate);
      const sun = createSun(toi);
      const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
      if (!sunset || !sunset.jd) return null;
      const sunsetTime = jdToLocalDate(sunset.jd);
      if (!sunsetTime) return null;

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(12, 0, 0, 0);
      const toiNextDay = createTimeOfInterest.fromDate(nextDay);
      const sunNextDay = createSun(toiNextDay);
      const sunrise = await sunNextDay.getRise({ lat, lon: lng, elevation: 0 });
      if (!sunrise || !sunrise.jd) return null;
      const sunriseTime = jdToLocalDate(sunrise.jd);
      if (!sunriseTime) return null;

      const nightDuration = sunriseTime.getTime() - sunsetTime.getTime();
      const muhuртaDuration = nightDuration / 30;
      const trueLocalMidnight = new Date(sunsetTime.getTime() + nightDuration / 2);
      const muhurtaIndex = Math.floor(
        (trueLocalMidnight.getTime() - sunsetTime.getTime()) / muhuртaDuration
      );

      const nishitaStart = new Date(sunsetTime.getTime() + muhurtaIndex * muhuртaDuration);
      const nishitaEnd = new Date(sunsetTime.getTime() + (muhurtaIndex + 1) * muhuртaDuration);

      return {
        nishita_muhurta_start: nishitaStart,
        nishita_muhurta_end: nishitaEnd,
      };
    } catch (err) {
      return null;
    }
  };

  const getCalculationTime = async (
    date: Date,
    calculationType: string
  ): Promise<Date | null> => {
    try {
      const localYear = date.getFullYear();
      const localMonth = date.getMonth();
      const localDate = date.getDate();
      const noonDate = new Date(localYear, localMonth, localDate, 12, 0, 0, 0);
      const toi = createTimeOfInterest.fromDate(noonDate);

      switch (calculationType) {
        case 'Sunrise': {
          const sun = createSun(toi);
          const sunrise = await sun.getRise({ lat, lon: lng, elevation: 0 });
          if (sunrise && sunrise.jd) {
            const sunriseDate = jdToLocalDate(sunrise.jd);
            if (sunriseDate) {
              return new Date(sunriseDate.getTime() + 150 * 60 * 1000);
            }
          }
          return null;
        }
        case 'Sunset': {
          const sun = createSun(toi);
          const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
          if (sunset && sunset.jd) return jdToLocalDate(sunset.jd);
          return null;
        }
        case 'Pradosha': {
          const sun = createSun(toi);
          const sunset = await sun.getSet({ lat, lon: lng, elevation: 0 });
          if (sunset && sunset.jd) {
            const sunsetDate = jdToLocalDate(sunset.jd);
            if (sunsetDate) return new Date(sunsetDate.getTime() + 90 * 60 * 1000);
          }
          return null;
        }
        case 'Moonrise': {
          const moon = createMoon(toi);
          const moonrise = await moon.getRise({ lat, lon: lng, elevation: 0 });
          if (moonrise && moonrise.jd) return jdToLocalDate(moonrise.jd);
          return null;
        }
        case 'AfterSunrise': {
          const sun = createSun(toi);
          const sunrise = await sun.getRise({ lat, lon: lng, elevation: 0 });
          if (sunrise && sunrise.jd) return jdToLocalDate(sunrise.jd);
          return null;
        }
        default:
          return null;
      }
    } catch (err) {
      return null;
    }
  };

  // Get Sankrantis
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
        masaIno: -1,
        isLeapMonth: false,
      });

      if (sankranti.signName === 'Makara') {
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
          masaIno: -1,
          isLeapMonth: false,
        });

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
          masaIno: -1,
          isLeapMonth: false,
        });
      }
    });
  } catch (err) {
    console.error('Error fetching sankrantis:', err);
  }

  // Gregorian Festivals
  try {
    for (const gregorianFestival of gregorianFestivalsData as Array<any>) {
      const festivalDate = new Date(
        Date.UTC(year, gregorianFestival.month - 1, gregorianFestival.date)
      );
      if (festivalDate.getUTCFullYear() === year) {
        festivalOccurrences.push({
          date: festivalDate,
          festival: {
            ...gregorianFestival,
            tithi: '',
            nakshatra: '',
            telugu_month: '',
            vaara: '',
            adhik_maasa: '',
          },
          calculationType: 'Sunrise',
          masaIno: -1,
          isLeapMonth: false,
        });
      }
    }
  } catch (err) {
    console.error('Error processing gregorian festivals:', err);
  }

  // Tithi-based Festivals
  const allTithiBoundaries = tithiCalculator.getAllTithiBoundariesInYear(year, lat, lng, tzone);
  const boundaryMap = new Map<string, Array<(typeof allTithiBoundaries)[0]>>();
  allTithiBoundaries.forEach(boundary => {
    const key = `${boundary.tithiIno}-${boundary.masaIno}-${boundary.isLeapMonth}`;
    if (!boundaryMap.has(key)) boundaryMap.set(key, []);
    boundaryMap.get(key)!.push(boundary);
  });

  for (const festival of festivalsData as Festival[]) {
    if (!festival.tithi || festival.tithi === '') continue;

    const tithiIndex = parseInt(festival.tithi) - 1;
    const masaIndex = festival.telugu_month ? parseInt(festival.telugu_month) - 1 : -1;
    const isAdhikMaasaFestival = festival.adhik_maasa === '1';

    const getCalculationType = (f: Festival) => {
        if (f.festival_based_on) {
            const type = f.festival_based_on.toLowerCase();
            if (type === 'sunset') return 'Sunset';
            if (type === 'pradosha') return 'Pradosha';
            if (type === 'moonrise') return 'Moonrise';
            if (type === 'shivaratri') return 'Shivaratri';
            if (type === 'aftersunrise') return 'AfterSunrise';
        }
        return 'Sunrise';
    };

    const processBoundaries = async (boundaries: any[]) => {
      for (const boundary of boundaries) {
        if (
          boundary.startTime.getFullYear() === year &&
          boundary.startTime >= new Date(year, 0, 1) &&
          boundary.endTime <= new Date(year + 1, 0, 1)
        ) {
          const calcType = getCalculationType(festival);
          const startDate = new Date(
            Date.UTC(
              boundary.startTime.getUTCFullYear(),
              boundary.startTime.getUTCMonth(),
              boundary.startTime.getUTCDate(),
              0, 0, 0, 0
            )
          );
          const nextDate = new Date(startDate);
          nextDate.setUTCDate(nextDate.getUTCDate() + 1);
          const calcTime = await getCalculationTime(startDate, calcType);

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
            if (shivaratriMuhurta) {
              if (boundary.startTime < shivaratriMuhurta.nishita_muhurta_start) {
                displayDate = startDate;
              } else {
                const nextDay = new Date(startDate);
                nextDay.setUTCDate(nextDay.getUTCDate() + 1);
                displayDate = nextDay;
              }
            } else {
              displayDate = startDate;
            }
          } else if (calcType === 'AfterSunrise') {
             const shashthiStartInstant = boundary.startTime;
             if (!shashthiStartInstant) {
                displayDate = startDate;
             } else {
                const shYear = shashthiStartInstant.getUTCFullYear();
                const shMonth = shashthiStartInstant.getUTCMonth();
                const shDate = shashthiStartInstant.getUTCDate();
                const shashthiDayMidnight = new Date(Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0));
                const sunsetOfShashthiDay = await getCalculationTime(shashthiDayMidnight, 'Sunset');
                displayDate = new Date(Date.UTC(shYear, shMonth, shDate, 0, 0, 0, 0));
                if (sunsetOfShashthiDay && shashthiStartInstant.getTime() > sunsetOfShashthiDay.getTime()) {
                    displayDate.setUTCDate(displayDate.getUTCDate() + 1);
                } else if (!sunsetOfShashthiDay) {
                    displayDate = startDate;
                }
             }
          } else if (calcType === 'Moonrise') {
            if (!calcTime || calcTime < boundary.startTime) {
              const nextDay = new Date(boundary.startTime);
              nextDay.setUTCDate(nextDay.getUTCDate() + 1);
              displayDate = new Date(
                Date.UTC(nextDay.getUTCFullYear(), nextDay.getUTCMonth(), nextDay.getUTCDate())
              );
            } else {
              displayDate = new Date(
                Date.UTC(calcTime.getUTCFullYear(), calcTime.getUTCMonth(), calcTime.getUTCDate())
              );
            }
          } else {
            const nextDayCalcTime = await getCalculationTime(nextDate, calcType);
            displayDate = getFestivalDisplayDate(
              boundary,
              calcType as any,
              calcTime,
              nextDayCalcTime
            );
          }

          festivalOccurrences.push({
            date: displayDate,
            festival: {
              ...festival,
              festival_en: replaceMasaPlaceholder(festival.festival_en, boundary.masaIno, 'en'),
              festival_te: replaceMasaPlaceholder(festival.festival_te, boundary.masaIno, 'te'),
              tithiStarts: boundary.startTime,
              tithiEnds: boundary.endTime,
            },
            calculationType: calcType as any,
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
    };

    if (masaIndex >= 0) {
      const key = `${tithiIndex}-${masaIndex}-${isAdhikMaasaFestival}`;
      const boundaries = boundaryMap.get(key) || [];
      await processBoundaries(boundaries);
    } else {
      for (let masa = 0; masa < 12; masa++) {
        const key = `${tithiIndex}-${masa}-${isAdhikMaasaFestival}`;
        const boundaries = boundaryMap.get(key) || [];
        await processBoundaries(boundaries);
      }
    }
  }

  festivalOccurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
  return festivalOccurrences;
}
