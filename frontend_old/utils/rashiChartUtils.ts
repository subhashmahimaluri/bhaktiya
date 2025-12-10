/**
 * Rashi Chart Utilities
 * Helper functions for Rashi chart operations
 */

import { getPlanetNameTelugu, PlanetName, RashiGridResult } from '@/lib/panchangam/RashiChart';

/**
 * Get CSS class for planet coloring
 */
export function getPlanetClass(planet: PlanetName): string {
  const classMap: Record<PlanetName, string> = {
    Sun: 'sun',
    Moon: 'moon',
    Mars: 'mars',
    Mercury: 'mercury',
    Jupiter: 'jupiter',
    Venus: 'venus',
    Saturn: 'saturn',
    Rahu: 'rahu',
    Ketu: 'ketu',
  };
  return classMap[planet] || '';
}

/**
 * Get localized planet name based on locale
 */
export function getLocalizedPlanetName(planet: PlanetName, locale: string): string {
  return locale === 'te' ? getPlanetNameTelugu(planet) : planet;
}

/**
 * Get Sun's rashi name from grid result
 */
export function getSunRashi(gridResult: RashiGridResult | null, locale: string): string {
  if (!gridResult || !gridResult.grahas) return 'N/A';

  const sunGraha = gridResult.grahas.find(g => g.planet === 'Sun');
  if (!sunGraha) return 'N/A';

  return locale === 'te' ? sunGraha.rashiNameTelugu : sunGraha.rashiName;
}

/**
 * Get Moon's rashi name from grid result
 */
export function getMoonRashi(gridResult: RashiGridResult | null, locale: string): string {
  if (!gridResult || !gridResult.grahas) return 'N/A';

  const moonGraha = gridResult.grahas.find(g => g.planet === 'Moon');
  if (!moonGraha) return 'N/A';

  return locale === 'te' ? moonGraha.rashiNameTelugu : moonGraha.rashiName;
}

/**
 * Get planet rashi by planet name
 */
export function getPlanetRashi(
  gridResult: RashiGridResult | null,
  planetName: PlanetName,
  locale: string
): string {
  if (!gridResult || !gridResult.grahas) return 'N/A';

  const graha = gridResult.grahas.find(g => g.planet === planetName);
  if (!graha) return 'N/A';

  return locale === 'te' ? graha.rashiNameTelugu : graha.rashiName;
}
