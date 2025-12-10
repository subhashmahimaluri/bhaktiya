// frontend/lib/panchangam/dayRuler.ts
// formerly dinaAdhipati.ts — lightweight adjustments: optional startNak and optional weekday.
// Keeps Telugu output strings intact.

/* exported types & functions:
   - PlanetKey
   - DinaAdhipatiResult
   - computeDinaAdhipati(startNak?, endNak, tithi, weekday?, method?)
   - helpers: countNakshatraInclusive and exported maps
*/

export type PlanetKey =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export interface DinaAdhipatiResult {
  remainder: number; // 1..9
  planet: PlanetKey;
  planetTelugu: string;
  outcomeTelugu: string;
  method: 'main' | 'sulabha' | 'mathantara';
  debugValue?: number;
}

/** Telugu names for planets */
export const PLANET_TELUGU: Record<PlanetKey, string> = {
  Sun: 'రవి',
  Moon: 'చంద్ర',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
  Rahu: 'రాహువు',
  Ketu: 'కేతువు',
};

/** Outcome strings for main mapping (1..9) */
export const OUTCOME_BY_REMAINDER_MAIN: Record<number, { planet: PlanetKey; text: string }> = {
  1: { planet: 'Sun', text: 'విచారము' },
  2: { planet: 'Moon', text: 'శుభము' },
  3: { planet: 'Mars', text: 'మరణము' },
  4: { planet: 'Mercury', text: 'ప్రజ్ఞాపాటవములు' },
  5: { planet: 'Jupiter', text: 'ధనలాభము' },
  6: { planet: 'Venus', text: 'సౌఖ్యం' },
  7: { planet: 'Saturn', text: 'మహాభయము' },
  8: { planet: 'Rahu', text: 'శత్రుభయము' },
  9: { planet: 'Ketu', text: 'ప్రాణభయము' },
};

/** Sulabha map (simple method) */
export const SULABHA_MAP: Record<number, PlanetKey> = {
  1: 'Saturn',
  2: 'Jupiter',
  3: 'Mars',
  4: 'Sun',
  5: 'Rahu',
  6: 'Venus',
  7: 'Mercury',
  8: 'Moon',
  9: 'Ketu',
};

/** Mathantara (alternate) map */
export const MATHANTARAMAP: Record<number, PlanetKey> = {
  1: 'Sun',
  2: 'Mercury',
  3: 'Rahu',
  4: 'Jupiter',
  5: 'Ketu',
  6: 'Moon',
  7: 'Saturn',
  8: 'Venus',
  9: 'Mars',
};

/** Count inclusive nakshatra (0..26 indices). Returns 1..27 */
export function countNakshatraInclusive(startNak: number, endNak: number): number {
  const diff = (endNak - startNak + 27) % 27;
  return diff + 1;
}

/**
 * computeDinaAdhipati
 * - startNak optional: if missing we use 0 (calendar mode default).
 * - weekday optional: if missing the function will use current local weekday (new Date().getDay()).
 *
 * Parameters:
 *  startNak?: number (0..26)  // optional fallback for calendar-only mode
 *  endNak: number (0..26)
 *  tithi: number (1..30)
 *  weekday?: number (0..6) // optional
 *  method: 'main'|'sulabha'|'mathantara'  // default 'main'
 */
export function computeDinaAdhipati(
  startNak: number | undefined,
  endNak: number,
  tithi: number,
  weekday?: number,
  method: 'main' | 'sulabha' | 'mathantara' = 'main'
): DinaAdhipatiResult {
  // normalize and validate endNak & tithi
  if (endNak < 0 || endNak > 26) {
    throw new Error('endNak must be in 0..26 (27 nakshatras)');
  }
  if (!Number.isFinite(tithi)) tithi = 1;
  tithi = Math.max(1, Math.min(30, Math.floor(tithi)));

  // if startNak is not provided, default to 0 so calendar mode works without birth data
  const sNak = typeof startNak === 'number' ? Math.max(0, Math.min(26, Math.floor(startNak))) : 0;

  // if weekday not provided, use today's weekday (local)
  const wd = typeof weekday === 'number' ? Math.floor(weekday) : new Date().getDay(); // 0..6

  // compute inclusive count (1..27)
  const count = countNakshatraInclusive(sNak, endNak);

  if (method === 'sulabha') {
    let rem = count % 9;
    if (rem === 0) rem = 9;
    const planet = SULABHA_MAP[rem];
    return {
      remainder: rem,
      planet,
      planetTelugu: PLANET_TELUGU[planet],
      outcomeTelugu: OUTCOME_BY_REMAINDER_MAIN[rem]?.text ?? '',
      method: 'sulabha',
      debugValue: count,
    };
  }

  if (method === 'mathantara') {
    let rem = count % 9;
    if (rem === 0) rem = 9;
    const planet = MATHANTARAMAP[rem];
    return {
      remainder: rem,
      planet,
      planetTelugu: PLANET_TELUGU[planet],
      outcomeTelugu: OUTCOME_BY_REMAINDER_MAIN[rem]?.text ?? '',
      method: 'mathantara',
      debugValue: count,
    };
  }

  // main method
  const raw = count * 4 + tithi + wd;
  let rem = raw % 9;
  if (rem === 0) rem = 9;
  const entry = OUTCOME_BY_REMAINDER_MAIN[rem];
  const planet = entry ? entry.planet : 'Sun';
  return {
    remainder: rem,
    planet,
    planetTelugu: PLANET_TELUGU[planet],
    outcomeTelugu: entry?.text ?? '',
    method: 'main',
    debugValue: raw,
  };
}
