/**
 * Panchangam-specific utility functions
 * Contains utilities for processing Python API data and rendering Panchangam components
 */

// Interface for display format
export interface DisplayAnga {
  label: string;
  time: string;
}

/**
 * Safely renders values that might be objects, strings, numbers, or null/undefined
 * Handles various data types from Python API responses gracefully
 *
 * @param value - Any value that needs to be rendered as string
 * @returns String representation of the value
 */
export const safeRenderValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    // If it's an object, try to extract meaningful data or stringify
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.value) return value.value;
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * Formats time from Python API to proper date format
 * Handles times like "08:47:06 (-1)" or "12:26:04" or "09:23:36 (+1)"
 *
 * @param timeStr - Time string from Python API
 * @param panchangamDate - Base date for calculating offset
 * @returns Formatted time string like "Oct 05 03:04 PM"
 */
export const formatPythonTime = (timeStr: string, panchangamDate: Date): string => {
  try {
    // Handle times like "08:47:06 (-1)" or "12:26:04" or "09:23:36 (+1)"
    const cleanTime = timeStr.replace(/\s*\([+-]\d+\)\s*$/, ''); // Remove (+1) or (-1)
    const dayOffset = timeStr.includes('(-1)') ? -1 : timeStr.includes('(+1)') ? 1 : 0;

    // Parse time parts
    const [hours, minutes] = cleanTime.split(':').map(Number);

    // Create date object for the target date
    const targetDate = new Date(panchangamDate);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(hours, minutes, 0, 0);

    // Format as "Oct 05 03:04 PM"
    const monthAbbr = targetDate.toLocaleDateString('en-US', { month: 'short' });
    const day = targetDate.getDate().toString().padStart(2, '0');
    const timeFormat = targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${monthAbbr} ${day} ${timeFormat}`;
  } catch (error) {
    console.warn('Error formatting Python time:', timeStr, error);
    return timeStr; // Fallback to original
  }
};

/**
 * Converts Python API overlap data to frontend DisplayAnga format with proper date formatting
 * Processes overlapping angas from Python API and formats them for display
 *
 * @param pythonOverlapData - Overlap data from Python API
 * @param angaType - Type of anga (Tithi, Nakshatra, Yoga, Karana)
 * @param panchangamDate - Base date for time formatting
 * @returns Array of DisplayAnga objects for rendering
 */
export const convertPythonOverlapToDisplayFormat = (
  pythonOverlapData: any,
  angaType: string,
  panchangamDate: Date
): DisplayAnga[] => {
  if (!pythonOverlapData || !pythonOverlapData.overlapping_angas) {
    return [];
  }

  const displayAngas: DisplayAnga[] = [];

  // Process overlapping angas from Python API
  pythonOverlapData.overlapping_angas.forEach((anga: any) => {
    let label = anga.name;

    // Format time display with proper date formatting
    const startTime = formatPythonTime(anga.start, panchangamDate);
    const endTime = formatPythonTime(anga.end, panchangamDate);
    const time = `${startTime} – ${endTime}`;

    displayAngas.push({
      label,
      time,
    });
  });

  return displayAngas;
};

/**
 * Processes festival data from Python API for display
 * Handles different festival object structures and extracts meaningful names
 *
 * @param festivals - Festival array from Python API
 * @returns Formatted festival string for display
 */
export const formatFestivalData = (festivals: any[]): string => {
  if (!festivals || festivals.length === 0) {
    return 'No festivals for this date';
  }

  return festivals
    .map((festival: any) => {
      // Handle different festival object structures
      if (typeof festival === 'string') {
        return festival;
      } else if (typeof festival === 'object' && festival !== null) {
        // Extract name from object structure
        let festivalName = festival.name || festival.title || festival.festival || '';

        // If no name field, try to construct from available data
        if (!festivalName && festival.number && festival.pada) {
          festivalName = `Festival ${festival.number}-${festival.pada}`;
        }

        // If still no name, convert object to string representation
        if (!festivalName) {
          festivalName = JSON.stringify(festival);
        }

        return festivalName;
      }

      return String(festival);
    })
    .join(', ');
};

// Helper function to get localized text from calendar object
export const getLocalizedText = (
  obj: any,
  teProperty: string,
  defaultProperty: string,
  locale: string
) => {
  if (!obj) return '';
  return locale === 'te' ? obj[teProperty] || '' : obj[defaultProperty] || '';
};
