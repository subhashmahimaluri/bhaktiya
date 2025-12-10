import { addDays, endOfMonth, format, isSameDay, isSameMonth, startOfMonth } from 'date-fns';
import { calculateCalendarCellPanchangam } from './calendarPanchangamData';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
  isNextMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  apiPanchangData?: any; // Full YexaaPanchang objects (tithi, nakshatra, paksha)
}

// Generate calendar days for a month
export const generateCalendarDays = (
  month: Date,
  selectedDate: Date,
  lat?: number,
  lng?: number
): CalendarDay[][] => {
  const firstDayOfMonth = startOfMonth(month);
  const lastDayOfMonth = endOfMonth(month);
  const today = new Date();

  // Determine sizing: first weekday and how many rows (5 or 6)
  const firstWeekday = firstDayOfMonth.getDay(); // 0=Sun..6=Sat
  const daysInMonth = lastDayOfMonth.getDate();
  const totalNeeded = firstWeekday + daysInMonth;
  const rows = totalNeeded <= 35 ? 5 : 6;
  const totalCells = rows * 7;

  // prev month info for filler days
  const prevMonthLastDate = new Date(
    firstDayOfMonth.getFullYear(),
    firstDayOfMonth.getMonth(),
    0
  ).getDate();

  // startDate is the Sunday that begins the calendar grid
  const startDate = addDays(firstDayOfMonth, -firstWeekday);

  // Build flat array of day objects by walking totalCells days from startDate
  const weeks: CalendarDay[][] = []; // will hold rows: weeks[weekIndex][weekdayIndex]
  let current = new Date(startDate);

  for (let w = 0; w < rows; w++) {
    const weekRow: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(current); // clone

      const isCurrentMonth = isSameMonth(cellDate, month);
      const isPrevMonth = cellDate < firstDayOfMonth;
      const isNextMonth = cellDate > lastDayOfMonth;
      const isToday = isSameDay(cellDate, today);
      const isSelected = isSameDay(cellDate, selectedDate);

      // Calculate panchangam data using JavaScript if lat/lng are provided
      let apiPanchangData = undefined;
      if (lat !== undefined && lng !== undefined) {
        apiPanchangData = calculateCalendarCellPanchangam(cellDate, lat, lng) || undefined;
      }

      // create base day object (panchang computed as before)
      const dayData: CalendarDay = {
        date: cellDate,
        isCurrentMonth,
        isPrevMonth,
        isNextMonth,
        isToday,
        isSelected,
        apiPanchangData,
      };

      weekRow.push(dayData);

      // advance to next day
      current = addDays(current, 1);
    }
    weeks.push(weekRow);
  }

  // Pivot weeks (rows) into weekdayRows[weekdayIndex][weekIndex]
  const weekdayRows: CalendarDay[][] = [[], [], [], [], [], [], []]; // Sun..Sat

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    const weekRow = weeks[weekIndex];
    for (let weekdayIndex = 0; weekdayIndex < 7; weekdayIndex++) {
      // place weekRow[weekdayIndex] into weekdayRows[weekdayIndex][weekIndex]
      const cell = weekRow[weekdayIndex];
      weekdayRows[weekdayIndex][weekIndex] = cell;
    }
  }

  return weekdayRows;
};

// Check if a date has a festival with priority 1
export const hasPriorityFestival = (date: Date, festivalsData: any): boolean => {
  if (!festivalsData || !festivalsData.festivals) {
    return false;
  }

  const dateStr = format(date, 'yyyy-MM-dd');
  return festivalsData.festivals.some(
    (festival: any) => festival.date === dateStr && festival.te_en_prioarity === '1'
  );
};

// Helper function to get paksha prefix
export const getPakshaPrefix = (paksha: string, locale: string): string => {
  if (paksha === 'Sukla Paksha' || paksha === 'శుక్ల పక్షం') {
    return locale === 'te' ? 'శు' : 'S';
  } else if (paksha === 'Krishna Paksha' || paksha === 'కృష్ణ పక్షం') {
    return locale === 'te' ? 'కృ' : 'K';
  }
  return '';
};

// Format time for display
export const formatTimeForDisplay = (timeStr: string): string => {
  if (!timeStr || timeStr === '--:--') return '--:--';

  try {
    // Remove any (-1) suffix and parse time string like "19:08:17" or "05:47:51 (-1)"
    const cleanTimeStr = timeStr.replace(/ \(\-?\d+\)$/, '');

    // Parse hours, minutes, seconds
    const [hours, minutes, seconds] = cleanTimeStr.split(':');
    let hourNum = parseInt(hours, 10);
    let minuteNum = parseInt(minutes, 10);
    const secondNum = seconds ? parseInt(seconds, 10) : 0;

    // Round up if seconds >= 30 (round to nearest minute)
    if (secondNum >= 30) {
      minuteNum = minuteNum + 1;
      if (minuteNum >= 60) {
        minuteNum = 0;
        hourNum = hourNum === 23 ? 0 : hourNum + 1;
      }
    }

    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    const formattedMinute = minuteNum.toString().padStart(2, '0');

    return `${displayHour}:${formattedMinute} ${period}`;
  } catch {
    return timeStr;
  }
};

// Format varjyam time
export const formatVarjyamTime = (varjyamStr: string): string => {
  if (!varjyamStr) return '';

  // Format "23:27:55 - 00:53:25" to "11:28 PM – 12:53 AM"
  const [startTime, endTime] = varjyamStr.split(' - ');
  if (startTime && endTime) {
    return `${formatTimeForDisplay(startTime)} – ${formatTimeForDisplay(endTime)}`;
  }
  return varjyamStr;
};

// Get API panchang data for a specific date
export const getApiPanchangDataForDate = (date: Date, monthlyPanchangamData: any) => {
  if (!monthlyPanchangamData || !monthlyPanchangamData.days) {
    // Return mock data for the first day of the month for testing
    if (format(date, 'yyyy-MM-dd') === '2025-10-01') {
      return {
        tithi: {
          name: 'నవమి',
          start: '05:47:51 (-1)',
          end: '19:08:17',
          number: 9,
          paksha: 'శుక్ల పక్షం',
        },
        nakshatra: {
          name: 'పూర్వాషాడ',
          start: '06:17:46 (-1)',
          end: '08:06:28',
          number: 20,
          pada: 4,
        },
        varjyam: ['23:27:55 - 00:53:25'],
      };
    }
    return null;
  }

  const dateStr = format(date, 'yyyy-MM-dd');
  return monthlyPanchangamData.days.find((day: any) => day.date === dateStr) || null;
};

// Get muhurthas for a weekday
export const getMuhurthasForWeekday = (weekdayIndex: number, firstWeekMuhurthasData: any) => {
  if (!firstWeekMuhurthasData || firstWeekMuhurthasData.length === 0) {
    return null;
  }

  // Map weekday index to both English and Telugu weekday names
  const weekdayNames = [
    { en: 'Sunday', te: 'ఆదివారము' },
    { en: 'Monday', te: 'సోమవారము' },
    { en: 'Tuesday', te: 'మంగళవారము' },
    { en: 'Wednesday', te: 'బుధవారము' },
    { en: 'Thursday', te: 'గురువారము' },
    { en: 'Friday', te: 'శుక్రవారము' },
    { en: 'Saturday', te: 'శనివారము' },
  ];
  const targetWeekday = weekdayNames[weekdayIndex];

  // Find the first occurrence of this weekday in the first week data
  // Try both English and Telugu names
  const dayData = firstWeekMuhurthasData.find(
    (day: any) => day.weekday === targetWeekday.en || day.weekday === targetWeekday.te
  );

  if (!dayData) return null;

  return {
    rahu: dayData.rahu.length > 0 ? dayData.rahu[0] : '',
    dhur_muhurth: dayData.dhur_muhurth.length > 0 ? dayData.dhur_muhurth[0] : '',
  };
};

// Get month year display text
export const getMonthYearDisplay = (currentDate: Date, locale: string, t: any) => {
  const monthYear =
    locale === 'te'
      ? `${(t.panchangam as any)[format(currentDate, 'MMMM').toLowerCase()] || format(currentDate, 'MMMM')} ${format(currentDate, 'yyyy')}`
      : format(currentDate, 'MMMM yyyy');
  const monthYearTelugu = `${(t.panchangam as any)[format(currentDate, 'MMMM').toLowerCase()] || format(currentDate, 'MMMM')} ${format(currentDate, 'yyyy')}`;

  return { monthYear, monthYearTelugu };
};

// Get weekday names
export const getWeekdayNames = () => [
  { en: 'Sun', te: 'ఆది' },
  { en: 'Mon', te: 'సోమ' },
  { en: 'Tue', te: 'మంగళ' },
  { en: 'Wed', te: 'బుధ' },
  { en: 'Thu', te: 'గురు' },
  { en: 'Fri', te: 'శుక్ర' },
  { en: 'Sat', te: 'శని' },
];

// Get English weekday name from weekdayIndex
export const getWeekdayNameFromIndex = (weekdayIndex: number): string => {
  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return weekdayNames[weekdayIndex] || 'Sunday';
};

// Get sunrise data for the first seven days of the month
export const getFirstSevenDaysSunriseData = (currentDate: Date, lat: number, lng: number) => {
  // Import YexaaPanchang dynamically to avoid SSR issues
  const { YexaaPanchang } = require('@/lib/panchangam');
  const panchang = new YexaaPanchang();
  const sunMoonTimer = panchang.yexaaSunMoonTimer;

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const sunriseData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfMonth);
    date.setDate(firstDayOfMonth.getDate() + i);

    try {
      const sunTimes = sunMoonTimer.sunTimer(date, lat, lng);
      const sunrise = sunTimes.sunRise;

      // Format sunrise time to HH:MM AM/PM
      const hours = sunrise.getHours();
      const minutes = sunrise.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedTime = `${displayHours}:${formattedMinutes} ${ampm}`;

      sunriseData.push({
        date: date,
        weekdayIndex: date.getDay(), // 0=Sunday, 1=Monday, etc.
        sunrise: formattedTime,
      });
    } catch (error) {
      console.error(`Error calculating sunrise for ${date}:`, error);
      sunriseData.push({
        date: date,
        weekdayIndex: date.getDay(),
        sunrise: '--:--',
      });
    }
  }

  return sunriseData;
};

// Get sunrise and sunset data for first seven days of month
export const getFirstSevenDaysSunsetData = (currentDate: Date, lat: number, lng: number) => {
  // Import YexaaPanchang dynamically to avoid SSR issues
  const { YexaaPanchang } = require('@/lib/panchangam');
  const panchang = new YexaaPanchang();
  const sunMoonTimer = panchang.yexaaSunMoonTimer;

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const sunData = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfMonth);
    date.setDate(firstDayOfMonth.getDate() + i);

    try {
      const sunTimes = sunMoonTimer.sunTimer(date, lat, lng);
      const sunrise = sunTimes.sunRise;
      const sunset = sunTimes.sunSet;

      // Format sunrise time to HH:MM AM/PM
      const sunriseHours = sunrise.getHours();
      const sunriseMinutes = sunrise.getMinutes();
      const sunriseAmpm = sunriseHours >= 12 ? 'PM' : 'AM';
      const sunriseDisplayHours = sunriseHours % 12 || 12;
      const sunriseFormattedMinutes = sunriseMinutes.toString().padStart(2, '0');
      const sunriseFormattedTime = `${sunriseDisplayHours}:${sunriseFormattedMinutes} ${sunriseAmpm}`;

      // Format sunset time to HH:MM AM/PM
      const sunsetHours = sunset.getHours();
      const sunsetMinutes = sunset.getMinutes();
      const sunsetAmpm = sunsetHours >= 12 ? 'PM' : 'AM';
      const sunsetDisplayHours = sunsetHours % 12 || 12;
      const sunsetFormattedMinutes = sunsetMinutes.toString().padStart(2, '0');
      const sunsetFormattedTime = `${sunsetDisplayHours}:${sunsetFormattedMinutes} ${sunsetAmpm}`;

      sunData.push({
        date: date,
        weekdayIndex: date.getDay(), // 0=Sunday, 1=Monday, etc.
        sunrise: sunriseFormattedTime,
        sunset: sunsetFormattedTime,
      });
    } catch (error) {
      console.error(`Error calculating sun times for ${date}:`, error);
      sunData.push({
        date: date,
        weekdayIndex: date.getDay(),
        sunrise: '--:--',
        sunset: '--:--',
      });
    }
  }

  return sunData;
};
