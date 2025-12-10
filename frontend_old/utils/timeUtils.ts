/**
 * Time formatting utilities for Panchangam display
 */

/**
 * Formats time string to 12-hour format with AM/PM
 * Rounds up if seconds >= 45
 * @param timeString - Time in format "HH:MM:SS" or "HH:MM"
 * @returns Formatted time like "6:12 AM"
 */
export function formatTimeWithRounding(timeString: string): string {
  if (!timeString) return '';

  try {
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);
    const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

    // Round up if seconds >= 45
    if (seconds >= 45) {
      minutes += 1;
      if (minutes >= 60) {
        minutes = 0;
        hours += 1;
        if (hours >= 24) {
          hours = 0;
        }
      }
    }

    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    // Format minutes with leading zero if needed
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
}

/**
 * Extracts and formats time from moonrise/moonset display format
 * Handles format like "Oct 06 5:32 PM" or "Oct 07 6:05 AM"
 * @param displayString - Display string from API
 * @param currentDate - Current date to check if it's next day
 * @returns Object with formatted time and nextDay indicator
 */
export function formatMoonTime(
  displayString: string,
  currentDate: string
): {
  time: string;
  nextDay: boolean;
} {
  if (!displayString) return { time: '', nextDay: false };

  try {
    // Extract date and time from format like "Oct 06 5:32 PM"
    const match = displayString.match(/(\w{3} \d{2}) (\d{1,2}:\d{2} [AP]M)/);
    if (!match) {
      return { time: displayString, nextDay: false };
    }

    const dateStr = match[1]; // "Oct 06"
    const timeStr = match[2]; // "5:32 PM"

    // Check if it's next day by comparing with current date
    const currentDateObj = new Date(currentDate);
    const currentMonth = currentDateObj.toLocaleDateString('en-US', { month: 'short' });
    const currentDay = currentDateObj.getDate().toString().padStart(2, '0');
    const currentDateStr = `${currentMonth} ${currentDay}`;

    const nextDay = dateStr !== currentDateStr;

    return {
      time: timeStr,
      nextDay,
    };
  } catch (error) {
    console.error('Error parsing moon time:', error);
    return { time: displayString, nextDay: false };
  }
}
