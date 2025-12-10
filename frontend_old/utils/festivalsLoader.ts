import { YexaaPanchang } from '@/lib/panchangam/yexaaPanchang';
import { getMatchingFestivals } from '@/utils/festivalMatcher';
import { endOfMonth, startOfMonth } from 'date-fns';

interface Festival {
  festival_name: string;
  tithi: string;
  nakshatra: string;
  telugu_month?: string;
  adhik_maasa: string;
  festival_en: string;
  festival_te: string;
  vratha_name: string;
  calendar_type: string;
  telugu_en_priority: string;
  festival_based_on?: string;
}

interface FestivalWithDate extends Festival {
  date: string;
}

// Load festivals from JSON file
let festivalsCache: Festival[] | null = null;

async function loadFestivals(): Promise<Festival[]> {
  if (festivalsCache) {
    return festivalsCache;
  }

  try {
    const response = await fetch('/telugu_festivals.json');
    if (!response.ok) {
      throw new Error('Failed to load festivals data');
    }
    const festivals = await response.json();
    festivalsCache = festivals;
    return festivals;
  } catch (error) {
    console.error('Error loading festivals:', error);
    return [];
  }
}

// Calculate festivals for a given month using YexaaPanchang
export async function calculateMonthlyFestivals(
  date: Date,
  lat: number,
  lng: number,
  priority: string = '1'
): Promise<{ festivals: FestivalWithDate[] }> {
  try {
    // Load all festivals from JSON
    const allFestivals = await loadFestivals();

    // Initialize YexaaPanchang
    const panchang = new YexaaPanchang();

    // Get start and end of month
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Array to store festivals with dates
    const festivalsWithDates: FestivalWithDate[] = [];

    // Check each day of month
    const currentDate = new Date(monthStart);
    while (currentDate <= monthEnd) {
      try {
        // Check all festivals to see which calculation method to use
        // Group festivals by calculation type for efficiency
        const sunriseFestivals: Festival[] = [];
        const pradoshaFestivals: Festival[] = [];

        allFestivals.forEach(festival => {
          const calculationType = festival.festival_based_on?.toLowerCase();
          if (calculationType === 'pradosha') {
            pradoshaFestivals.push(festival);
          } else {
            sunriseFestivals.push(festival);
          }
        });

        // Calculate both sunrise and pradosha calendars for this date
        const calendarSunrise = panchang.calendar(currentDate, lat, lng);
        const calendarPradosha = panchang.calendarAtPradosha(currentDate, lat, lng);
        const calculated = panchang.calculate(currentDate);

        const allMatchingFestivals: Festival[] = [];

        // Check sunrise-based festivals using common utility
        if (sunriseFestivals.length > 0) {
          const matchingSunrise = getMatchingFestivals(
            calendarSunrise.Tithi as any,
            calendarSunrise.Masa as any,
            calendarSunrise.Nakshatra as any
          );
          // Filter by calculation type
          const sunriseMatches = matchingSunrise.filter(f => {
            const calculationType = f.festival_based_on?.toLowerCase();
            return calculationType !== 'pradosha';
          });
          allMatchingFestivals.push(...(sunriseMatches as any));
        }

        // Check pradosha-based festivals using common utility
        if (pradoshaFestivals.length > 0) {
          const matchingPradosha = getMatchingFestivals(
            calendarPradosha.Tithi as any,
            calendarPradosha.Masa as any,
            calendarPradosha.Nakshatra as any
          );
          // Filter by calculation type
          const pradoshaMatches = matchingPradosha.filter(f => {
            const calculationType = f.festival_based_on?.toLowerCase();
            return calculationType === 'pradosha';
          });
          allMatchingFestivals.push(...(pradoshaMatches as any));
        }

        // Sort by priority (lower number = higher priority)
        allMatchingFestivals.sort((a, b) => {
          const priorityA = parseInt(a.telugu_en_priority) || 999;
          const priorityB = parseInt(b.telugu_en_priority) || 999;
          return priorityA - priorityB;
        });

        // Filter by priority and add date
        allMatchingFestivals
          .filter(festival => festival.telugu_en_priority === priority)
          .forEach(festival => {
            const festivalDate = currentDate.toISOString().split('T')[0];
            festivalsWithDates.push({
              ...festival,
              date: festivalDate,
            });
          });
      } catch (err) {
        console.error('Error processing date:', currentDate, err);
      }

      // Move to next day - create new date object to avoid mutation issues
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      currentDate.setTime(nextDay.getTime());
    }

    return { festivals: festivalsWithDates };
  } catch (error) {
    console.error('Error calculating monthly festivals:', error);
    return { festivals: [] };
  }
}
