import festivalsData from '@/public/telugu_festivals.json';

interface Festival {
  festival_name: string;
  tithi: string;
  nakshatra: string;
  tamil_month: string;
  telugu_month?: string;
  vaara: string;
  adhik_maasa: string;
  festival_en: string;
  festival_te: string;
  telugu_en_priority: string;
  festival_based_on: string;
  festival_type: string;
  vratha_name: string;
}

interface TithiData {
  name: string;
  name_TE: string;
  ino: number;
}

interface MasaData {
  ino: number;
  name: string;
  name_TE: string;
  isLeapMonth?: boolean;
}

interface NakshatraData {
  name: string;
  name_TE: string;
  ino: number;
}

/**
 * Get festivals matching the given tithi, masa, and nakshatra
 * @param tithi - Tithi object with ino, name, and name_TE properties
 * @param masa - Masa object with ino, name, and name_TE properties
 * @param nakshatra - Nakshatra object with ino, name, and name_TE properties
 * @param locale - Language locale ('en' or 'te')
 * @returns Formatted festival string
 */
export function getFestivalsForDate(
  tithi: TithiData | null,
  masa: MasaData | null,
  nakshatra: NakshatraData | null = null,
  locale: string = 'en'
): string {
  if (!tithi || !masa) {
    return locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals';
  }

  const tithiIndex = String(tithi.ino + 1);
  const masaIndex = String(masa.ino + 1);
  const isLeapMonth = masa.isLeapMonth || false;

  // Find matching festivals from the JSON data
  const matchingFestivals = (festivalsData as Festival[]).filter(festival => {
    // Check if festival tithi matches today's tithi
    const festivalTithiMatch = festival.tithi === '' || festival.tithi === tithiIndex;

    // Check adhik masa (leap month) match
    const festivalIsAdhikMasa = festival.adhik_maasa === '1';

    // If festival requires adhik masa but current month is not adhik masa, skip
    if (festivalIsAdhikMasa && !isLeapMonth) {
      return false;
    }

    // If festival is for regular month but current month is adhik masa, skip
    if (!festivalIsAdhikMasa && isLeapMonth) {
      return false;
    }

    // Both tithi and masa must match (if they are specified in the festival data)
    if (festival.tithi !== '' && festival.telugu_month !== '') {
      return festivalTithiMatch && festival.telugu_month === masaIndex;
    }

    // If only tithi is specified (matches any month)
    if (festival.tithi !== '' && festival.telugu_month === '') {
      return festivalTithiMatch;
    }

    // If only masa is specified (matches any tithi)
    if (festival.tithi === '' && festival.telugu_month !== '') {
      return festival.telugu_month === masaIndex;
    }

    return false;
  });

  // Sort by priority (lower number = higher priority)
  matchingFestivals.sort((a, b) => {
    const priorityA = parseInt(a.telugu_en_priority) || 999;
    const priorityB = parseInt(b.telugu_en_priority) || 999;
    return priorityA - priorityB;
  });

  if (matchingFestivals.length === 0) {
    return locale === 'te' ? 'ప్రధాన పండుగలు లేవు' : 'No Major Festivals';
  }

  // Get festival names based on locale
  const festivalNames = matchingFestivals.map(festival => {
    if (locale === 'te') {
      return festival.festival_te;
    } else {
      return festival.festival_en;
    }
  });

  // Return comma-separated festival names
  return festivalNames.join(', ');
}

/**
 * Get all matching festivals with full details
 * @param tithi - Tithi object with ino property (sunrise tithi)
 * @param masa - Masa object with ino property
 * @param nakshatra - Nakshatra object with ino property
 * @param calculatedTithi - Optional calculated tithi for fallback matching
 * @param useFallback - If true, use calculated tithi as fallback when sunrise doesn't match
 * @returns Array of matching festivals
 */
export function getMatchingFestivals(
  tithi: TithiData | null,
  masa: MasaData | null,
  nakshatra: NakshatraData | null = null,
  calculatedTithi: TithiData | null = null,
  useFallback: boolean = false
): Festival[] {
  // Check if both tithi and nakshatra are empty
  if ((!tithi || !masa) && !nakshatra) {
    return [];
  }

  const tithiIndex = tithi ? String(tithi.ino + 1) : '';
  const calculatedTithiIndex = calculatedTithi ? String(calculatedTithi.ino + 1) : '';
  const masaIndex = masa ? String(masa.ino + 1) : '';
  const nakshatraIndex = nakshatra ? String(nakshatra.ino + 1) : '';
  const isLeapMonth = masa?.isLeapMonth || false;

  return (festivalsData as Festival[]).filter(festival => {
    // Check adhik masa (leap month) match first
    const festivalIsAdhikMasa = festival.adhik_maasa === '1';

    // If festival requires adhik masa but current month is not adhik masa, skip
    if (festivalIsAdhikMasa && !isLeapMonth) {
      return false;
    }

    // If festival is for regular month but current month is adhik masa, skip
    if (!festivalIsAdhikMasa && isLeapMonth) {
      return false;
    }

    // Match by nakshatra if specified (takes priority)
    if (festival.nakshatra !== '') {
      if (festival.nakshatra !== nakshatraIndex) {
        return false;
      }
      // Check masa if specified
      if (festival.telugu_month !== '' && festival.telugu_month !== masaIndex) {
        return false;
      }
      return true;
    }

    // Match by tithi
    // Primary: Match on sunrise tithi
    // Fallback: If useFallback is true, also match on calculated tithi
    let festivalTithiMatch = false;
    
    if (festival.tithi === '') {
      festivalTithiMatch = true; // Empty tithi means any tithi
    } else if (festival.tithi === tithiIndex) {
      festivalTithiMatch = true; // Sunrise tithi matches (primary)
    } else if (useFallback && calculatedTithiIndex !== '' && festival.tithi === calculatedTithiIndex) {
      festivalTithiMatch = true; // Calculated tithi matches (fallback only if enabled)
    }

    // Match by tithi and masa (both must match if both are specified)
    if (festival.tithi !== '' && festival.telugu_month !== '') {
      return festivalTithiMatch && festival.telugu_month === masaIndex;
    }

    // Match by tithi only (any month)
    if (festival.tithi !== '' && festival.telugu_month === '') {
      return festivalTithiMatch;
    }

    // Match by masa only (any tithi)
    if (festival.tithi === '' && festival.telugu_month !== '') {
      return festival.telugu_month === masaIndex;
    }

    return false;
  });
}
