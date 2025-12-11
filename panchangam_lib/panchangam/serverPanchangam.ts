import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { formatToDateTimeIST } from '@/utils/utils';
import { YexaaPanchang } from './yexaaPanchang';

// Types for anga display
export interface AngaEntry {
  name: string;
  start: Date;
  end: Date;
  ino: number;
  paksha?: string; // For tithi entries
}

export interface DisplayAnga {
  label: string;
  time: string;
}

export interface ServerPanchangamData {
  tithi: string;
  tithiTime: string;
  nakshatra: string;
  nakshatraTime: string;
  yoga: string;
  yogaTime: string;
  karana: string;
  karanaTime: string;
  moonMasa: string;
  masa: string;
  paksha: string;
  day: string;
  ayana: string;
  ritu: string;
  teluguYear: string;
}

export interface ServerPanchangamResult {
  panchangamData: ServerPanchangamData;
  displayTithis: DisplayAnga[];
  displayNakshatras: DisplayAnga[];
  displayYogas: DisplayAnga[];
  displayKaranas: DisplayAnga[];
}

// Helper function to get sunrise time as Date object
const getSunriseDate = (date: Date, lat: number, lng: number): Date => {
  const panchang = new YexaaPanchang();
  const sun = panchang.sunTimer(date, lat, lng);
  return new Date(sun.sunRise || date);
};

// Helper function to calculate all angas for the day according to Telugu Panchangam rules
const getDayAngas = (
  entries: AngaEntry[],
  sunRise: Date,
  angaType: 'tithi' | 'nakshatra' | 'yoga' | 'karana',
  timezone: string
): DisplayAnga[] => {
  const nextSunrise = new Date(sunRise.getTime() + 24 * 60 * 60 * 1000);
  const results: DisplayAnga[] = [];

  for (const anga of entries) {
    const start = new Date(anga.start);
    const end = new Date(anga.end);

    // Check if this anga is relevant for the day (intersects with sunrise to next sunrise)
    if (end <= sunRise || start >= nextSunrise) {
      continue; // Skip angas that don't intersect with our day
    }

    let tag = '';
    const time = `${formatToDateTimeIST(start, timezone)} – ${formatToDateTimeIST(end, timezone)}`;

    // Apply Telugu Panchangam rules - only for Tithi entries
    if (angaType === 'tithi') {
      if (start > sunRise && end < nextSunrise) {
        // Anga begins and ends between two sunrises
        tag = ' [Kshaya]';
      } else if (start < sunRise && end > nextSunrise) {
        // Anga spans across two consecutive sunrises
        tag = ' [Vriddhi]';
      } else if (end.getTime() === sunRise.getTime()) {
        // Anga ends exactly at sunrise - next anga is official (normal case, no tag)
        // This anga should not be displayed as it's not the day's main anga
        continue;
      }
    }
    // else: normal display (anga present at sunrise)

    const pakshaPrefix = anga.paksha ? `${anga.paksha} ` : '';
    const label = `${pakshaPrefix}${anga.name}${tag}`;

    results.push({
      label,
      time,
    });
  }

  return results;
};

export function calculatePanchangamServerSide(
  date: Date,
  lat: number,
  lng: number,
  timezone: string = 'Asia/Kolkata'
): ServerPanchangamResult {
  const panchang = new YexaaPanchang();
  const calendar = panchang.calendar(date, lat, lng);
  const calculated = panchang.calculate(date);

  const startEndDateFormat = (start: Date | string | number, end: Date | string | number) => {
    return `${formatToDateTimeIST(new Date(start), timezone)} – ${formatToDateTimeIST(new Date(end), timezone)}`;
  };

  const panchangamData: ServerPanchangamData = {
    tithi: String(calculated.Tithi?.name || ''),
    tithiTime: startEndDateFormat(calculated.Tithi.start, calculated.Tithi.end),
    nakshatra: String(calculated.Nakshatra?.name_TE || ''),
    nakshatraTime: startEndDateFormat(calculated.Nakshatra.start, calculated.Nakshatra.end),
    yoga: String(calculated.Yoga?.name_TE || ''),
    yogaTime: startEndDateFormat(calculated.Yoga.start, calculated.Yoga.end),
    karana: String(calculated.Karna?.name_TE || ''),
    karanaTime: startEndDateFormat(calculated.Karna.start, calculated.Karna.end),
    moonMasa: String(calendar.MoonMasa?.name_TE || ''),
    masa: String(calendar.Masa?.name_TE || ''),
    paksha: String(calculated.Paksha?.name || ''),
    day: String(calculated.Day?.name_TE || ''),
    ayana: String(calendar?.Ayana.name_TE || ''),
    ritu: String(calendar?.DrikRitu.name_TE || ''),
    teluguYear: String(calendar?.TeluguYear.name_TE || ''),
  };

  const sunriseTime = getSunriseDate(date, lat, lng);

  const allTithis = getAllAngasForDay(date, lat, lng, 'tithi');
  const displayTithis = getDayAngas(allTithis, sunriseTime, 'tithi', timezone);

  const allNakshatras = getAllAngasForDay(date, lat, lng, 'nakshatra');
  const displayNakshatras = getDayAngas(allNakshatras, sunriseTime, 'nakshatra', timezone);

  const allYogas = getAllAngasForDay(date, lat, lng, 'yoga');
  const displayYogas = getDayAngas(allYogas, sunriseTime, 'yoga', timezone);

  const allKaranas = getAllAngasForDay(date, lat, lng, 'karana');
  const displayKaranas = getDayAngas(allKaranas, sunriseTime, 'karana', timezone);

  return {
    panchangamData,
    displayTithis,
    displayNakshatras,
    displayYogas,
    displayKaranas,
  };
}
