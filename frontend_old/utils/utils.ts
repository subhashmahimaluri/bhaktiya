import { format } from 'date-fns';
import { formatTimeWithRounding } from './timeUtils';

// Get user's actual timezone instead of hardcoded Asia/Kolkata
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'Asia/Kolkata';
  }
};

// Enhanced function to format time using user's actual timezone or UTC timestamps
export const formatTimeWithUserTimezone = (value: Date | string | undefined): string => {
  if (!value) return 'N/A';

  const date = new Date(value);
  const userTimezone = getUserTimezone();

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone, // Use auto-detected timezone
  });
};

// New utility function for displaying times in selected location's timezone
export const formatToLocalTimeZone = (
  value: Date | string | undefined,
  selectedTimezone?: string
): string => {
  if (!value) return 'N/A';

  const date = new Date(value);
  // Use provided timezone (from selected location) or fallback to user's system timezone
  const timezone = selectedTimezone || getUserTimezone();

  try {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone, // Use selected location's timezone (e.g., Europe/London for Coventry)
    });
  } catch (error) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: getUserTimezone(),
    });
  }
};

// Legacy function for backward compatibility - now uses user timezone
export const formatTime24Hrs = (value: Date | string | undefined, timezone?: string): string => {
  if (!value) return 'N/A';

  const date = new Date(value);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Changed to false for 24-hour format
    timeZone: timezone, // Auto-detected instead of hardcoded Asia/Kolkata
  });
};

// Legacy function for backward compatibility - now uses user timezone
export const formatTimeIST = (value: Date | string | undefined, timezone?: string): string => {
  if (!value) return 'N/A';

  const date = new Date(value);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone, // Auto-detected instead of hardcoded Asia/Kolkata
  });
};

export const formatToDateTimeIST = (date: Date | string, timezone?: string): string => {
  const inputDate = new Date(date);

  return inputDate.toLocaleString('en-US', {
    timeZone: timezone, // Auto-detected instead of hardcoded Asia/Kolkata
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const startEndDateFormat = (start: Date | string, end: Date | string): string => {
  return `${formatToDateTimeIST(start)} – ${formatToDateTimeIST(end)}`;
};

export const formatFullDateWithWeekday = (date: Date | string): string => {
  const inputDate = new Date(date);
  const userTimezone = getUserTimezone();

  return inputDate.toLocaleString('en-US', {
    timeZone: userTimezone, // Auto-detected instead of hardcoded Asia/Kolkata
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Function to format time arrays for panchangam display
// Converts HH:MM:SS format to HH:MM AM/PM format
// Handles special case for times that cross midnight (+1)
export const formatPanchangamTimeArray = (
  timeArray: string[] | string | undefined,
  currentDate?: Date
): string => {
  if (!timeArray) {
    return 'N/A';
  }

  const formatSingleTime = (timeStr: string): string => {
    // Remove the (+1) part for parsing if present
    const cleanTimeStr = timeStr.replace('(+1)', '').trim();

    // Use the existing formatTimeWithRounding function
    return formatTimeWithRounding(cleanTimeStr);
  };

  // Handle case where data is a string (might be a single time or a range)
  if (typeof timeArray === 'string') {
    // Check if it's a time range string like "10:38:15 - 12:06:40"
    if (timeArray.includes('-')) {
      const times = timeArray.split('-').map((t: string) => t.trim());
      if (times.length === 2) {
        const startTime = formatSingleTime(times[0]);
        const endTime = formatSingleTime(times[1]);

        // Check if end time is next day
        const hasNextDay = times[1].includes('(+1)');
        if (hasNextDay && currentDate) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const monthName = nextDate.toLocaleDateString('en-US', { month: 'short' });

          return `${startTime} - ${monthName} ${nextDate.getDate()} ${endTime}`;
        }

        return `${startTime} - ${endTime}`;
      }
    }
    // Single time as string
    const result = formatSingleTime(timeArray);
    return result;
  }

  // Handle case where data is an array
  if (Array.isArray(timeArray)) {
    if (timeArray.length === 0) {
      return 'N/A';
    }

    // If we have a time range (2 elements), format as a range
    if (timeArray.length === 2) {
      const startTime = formatSingleTime(timeArray[0]);
      const endTime = formatSingleTime(timeArray[1]);

      // Check if end time is next day
      const hasNextDay = timeArray[1].includes('(+1)');
      if (hasNextDay && currentDate) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const monthName = nextDate.toLocaleDateString('en-US', { month: 'short' });

        return `${startTime} - ${monthName} ${nextDate.getDate()} ${endTime}`;
      }

      return `${startTime} - ${endTime}`;
    }

    // Handle case where array has a single element that contains a time range string
    if (timeArray.length === 1 && typeof timeArray[0] === 'string' && timeArray[0].includes('-')) {
      const timeRangeString = timeArray[0];
      const times = timeRangeString.split('-').map((t: string) => t.trim());

      if (times.length === 2) {
        const startTime = formatSingleTime(times[0]);
        const endTime = formatSingleTime(times[1]);

        // Check if end time is next day
        const hasNextDay = times[1].includes('(+1)');
        if (hasNextDay && currentDate) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const monthName = nextDate.toLocaleDateString('en-US', { month: 'short' });

          return `${startTime} - ${monthName} ${nextDate.getDate()} ${endTime}`;
        }

        return `${startTime} - ${endTime}`;
      }
    }

    // If it's a single time in an array, just format it
    const result = formatSingleTime(timeArray[0]);
    return result;
  }

  return 'N/A';
};

export const formatFullDate = (date: Date | string): string => {
  const inputDate = new Date(date);
  const userTimezone = getUserTimezone();

  return inputDate.toLocaleString('en-US', {
    timeZone: userTimezone, // Auto-detected instead of hardcoded Asia/Kolkata
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
};

export const formatMonth = (date: Date | string): string => {
  const inputDate = new Date(date);
  return inputDate
    .toLocaleString('en-US', {
      month: 'long',
    })
    .toLowerCase();
};

export const formatDay = (date: Date | string): string => {
  const inputDate = new Date(date);
  return inputDate.toLocaleString('en-US', {
    day: '2-digit',
  });
};

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function groupTithiByMonth(tithiResults: any[]): { month: string; tithiData: any[] }[] {
  const monthMap: Record<string, { month: string; tithiData: any[] }> = {};

  for (const item of tithiResults) {
    const startDate = new Date(item.tithi.start);
    const monthName = format(startDate, 'LLLL'); // e.g., 'January'

    if (!monthMap[monthName]) {
      monthMap[monthName] = {
        month: monthName,
        tithiData: [],
      };
    }

    monthMap[monthName].tithiData.push(item);
  }

  // Sort tithiData within each month
  Object.values(monthMap).forEach(monthGroup => {
    monthGroup.tithiData.sort((a, b) => {
      const dateA = new Date(a.tithi.start).getTime();
      const dateB = new Date(b.tithi.start).getTime();
      return dateA - dateB;
    });
  });

  // Return months in correct order
  return Object.values(monthMap).sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );
}

export const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export function interpolate(
  template: string | undefined | null,
  variables: Record<string, string | number | undefined | null> = {}
): string {
  if (typeof template !== 'string') {
    return '';
  }

  return template.replace(/{{(.*?)}}/g, (_, key: string) => {
    const trimmedKey = key.trim();

    const value = variables[trimmedKey];
    return typeof value === 'string' || typeof value === 'number' ? value.toString() : '';
  });
}

export const stotraToHtml = (text: string): string => {
  const paragraphs = text.trim().split('\n\n');
  return (
    '<div>' +
    paragraphs
      .map(block => {
        const lines = block
          .split('\n')
          .map(l => l.trim())
          .join('<br/>');
        return `<p>${lines}</p>`;
      })
      .join('') +
    '</div>'
  );
};
