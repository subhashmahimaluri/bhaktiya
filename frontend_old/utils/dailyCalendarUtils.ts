/**
 * Daily Calendar Utilities
 * Helper functions for date parsing, formatting, and calculations
 */

import { YexaaPanchang } from '@/lib/panchangam';
import { formatToDateTimeIST } from './utils';

export interface AngaEntry {
  name: string;
  start: Date;
  end: Date;
  ino: number;
  paksha?: string;
}

export interface DisplayAnga {
  label: string;
  time: string;
}

/**
 * Parse date string in various formats
 * Handles YYYY-MM-DD format and standard Date formats
 */
export function parseDate(date: string | Date | undefined): Date {
  if (!date) return new Date();

  try {
    let inputDate: Date;

    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Handle YYYY-MM-DD format from URL
      const [year, month, day] = date.split('-').map(Number);
      inputDate = new Date(year, month - 1, day);
    } else if (typeof date === 'string') {
      inputDate = new Date(date);
    } else {
      inputDate = date;
    }

    // Check if the date is valid
    if (isNaN(inputDate.getTime())) {
      console.error('Invalid date provided:', date);
      return new Date();
    }

    return inputDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
}

/**
 * Create UTC date at noon to avoid timezone issues
 */
export function createUTCDate(date: string | Date | undefined): Date {
  const parsedDate = parseDate(date);

  try {
    const utcDate = new Date(
      Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0)
    );

    if (isNaN(utcDate.getTime())) {
      console.error('Failed to create valid UTC date from:', date);
      return new Date();
    }

    return utcDate;
  } catch (error) {
    console.error('Error creating UTC date:', error);
    return new Date();
  }
}

/**
 * Format date for display based on locale
 */
export function formatDateForDisplay(date: Date, locale: string): string {
  try {
    if (locale === 'te') {
      return date.toLocaleDateString('te-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toDateString();
  }
}

/**
 * Format date as DD-MM-YYYY with separate components
 */
export function formatDateComponents(date: Date): {
  day: string;
  month: string;
  year: number;
} {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return { day, month, year };
}

/**
 * Get sunrise time for a given date and location
 */
export function getSunriseDate(date: Date, lat: number, lng: number): Date {
  try {
    const panchang = new YexaaPanchang();
    const sun = panchang.sunTimer(date, lat, lng);
    return new Date(sun.sunRise || date);
  } catch (error) {
    console.error('Error getting sunrise date:', error);
    return date;
  }
}

/**
 * Calculate day angas according to Telugu Panchangam rules
 */
export function getDayAngas(
  entries: AngaEntry[],
  sunRise: Date,
  angaType: 'tithi' | 'nakshatra' | 'yoga' | 'karana',
  timezone?: string
): DisplayAnga[] {
  const nextSunrise = new Date(sunRise.getTime() + 24 * 60 * 60 * 1000);
  const results: DisplayAnga[] = [];

  for (const anga of entries) {
    const start = new Date(anga.start);
    const end = new Date(anga.end);

    // Check if this anga is relevant for the day (intersects with sunrise to next sunrise)
    if (end <= sunRise || start >= nextSunrise) {
      continue;
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
        // Anga ends exactly at sunrise - skip
        continue;
      }
    }

    const pakshaPrefix = anga.paksha ? `${anga.paksha} ` : '';
    const label = `${pakshaPrefix}${anga.name}${tag}`;

    results.push({
      label,
      time,
    });
  }

  return results;
}

/**
 * Format date for URL (YYYY-MM-DD)
 */
export function formatDateForUrl(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate if a date object is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
