/**
 * RashiChart - Daily Rashi (Zodiac Sign) Chart Calculator
 *
 * Patched version with timezone-safe snapshot creation, extended ephemeris usage,
 * sidereal conversion toggle, better debug, and mapping helpers.
 *
 * NOTE: This class expects the provided `panchangImpl` to expose planetary functions:
 *   sun, moon, mars, mercury, venus, jupiter, saturn, rahuLongitude (optional)
 *
 * If your current impl lacks those, either:
 *  - add adapters that call astronomy-engine / swisseph and expose these methods, OR
 *  - provide a panchangImpl wrapper that implements these methods by calling a lib.
 */

import { YexaaSunMoonTimer } from './yexaaSunMoonTimer';

export type PanchangImplLike = {
  mdy2julian: (month: number, dayFrac: number, year: number) => number;
  dTime: (jdut: number) => number;
  calcayan: (jd: number) => number; // ayanamsa degrees
  sun: (jd: number) => number;
  moon?: (jd: number) => number;
  mars?: (jd: number) => number;
  mercury?: (jd: number) => number;
  venus?: (jd: number) => number;
  jupiter?: (jd: number) => number;
  saturn?: (jd: number) => number;
  rahuLongitude?: (jd: number) => number; // optional: true node longitude (deg)
  fix360?: (deg: number) => number;
};

export const PLANET_NAMES = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;
export type PlanetName = (typeof PLANET_NAMES)[number];

export const RASHI_NAMES = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrishchika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
] as const;

export const RASHI_NAMES_TELUGU = [
  'మేష',
  'వృషభ',
  'మిథున',
  'కర్కాటక',
  'సింహ',
  'కన్య',
  'తుల',
  'వృశ్చిక',
  'ధనుస్సు',
  'మకర',
  'కుంభ',
  'మీనా',
] as const;

export const PLANET_NAMES_TELUGU: Record<PlanetName, string> = {
  Sun: 'రవి',
  Moon: 'చంద్ర',
  Mars: 'కుజ',
  Mercury: 'బుధ',
  Jupiter: 'గురు',
  Venus: 'శుక్ర',
  Saturn: 'శని',
  Rahu: 'రాహు',
  Ketu: 'కేతు',
};

export type SnapshotOption = 'sunrise' | 'midnight' | 'noon' | { hour: number; minute: number };

export interface GrahaRashiInfo {
  planet: PlanetName;
  tropicalLon: number; // deg 0..360
  ayanamsaDeg: number; // deg
  siderealLon: number; // deg 0..360
  rashiIndex: number; // 0..11
  rashiName: string;
  rashiNameTelugu: string;
  degreeInRashi: number; // 0..30
}

export interface GridCell {
  cellIndex: number;
  rashiIndex: number; // -1 if unknown
  planets: PlanetName[];
}

export interface RashiGridResult {
  dateLocal: Date;
  snapshotType: string;
  grid: GridCell[];
  grahas: GrahaRashiInfo[];
  location: { lat: number; lng: number; timezone: string };
  debug?: { jd: number; sunriseLocal?: Date; missingPlanets?: string[]; siderealModeUsed?: string };
}

export interface RashiChartOptions {
  ayanamsaMode?: 'lahiri' | 'rama' | string;
  siderealSign?: 'plus' | 'minus'; // +ayanamsa or -ayanamsa conversion. Default 'plus' to match your sankranti code; test both.
}

/**
 * Utility: get offset minutes east-of-UTC for a timeZone at a sample UTC date
 */
function getOffsetMinutesForTimeZoneAtDate(timeZone: string, sampleUtcDate: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(sampleUtcDate);
  const obj: Record<string, number> = {};
  for (const p of parts) {
    if (p.type === 'year') obj.year = parseInt(p.value, 10);
    if (p.type === 'month') obj.month = parseInt(p.value, 10);
    if (p.type === 'day') obj.day = parseInt(p.value, 10);
    if (p.type === 'hour') obj.hour = parseInt(p.value, 10);
    if (p.type === 'minute') obj.minute = parseInt(p.value, 10);
    if (p.type === 'second') obj.second = parseInt(p.value, 10);
  }
  const localUtcMs = Date.UTC(
    obj.year ?? sampleUtcDate.getUTCFullYear(),
    (obj.month ?? sampleUtcDate.getUTCMonth() + 1) - 1,
    obj.day ?? sampleUtcDate.getUTCDate(),
    obj.hour ?? 0,
    obj.minute ?? 0,
    obj.second ?? 0
  );
  const offsetMinutes = (localUtcMs - sampleUtcDate.getTime()) / (60 * 1000);
  return Math.round(offsetMinutes);
}

/**
 * Construct a JS Date (UTC instant) representing the target local date/time in timeZone.
 * month is 1-based (1..12)
 */
function makeDateForTargetLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone?: string,
  tzOffsetMinutes?: number
): Date {
  let offset = tzOffsetMinutes;
  if (typeof offset !== 'number' && timeZone) {
    const sampleUtc = new Date(Date.UTC(year, month - 1, Math.max(1, day), 12, 0, 0));
    offset = getOffsetMinutesForTimeZoneAtDate(timeZone, sampleUtc);
  }
  if (typeof offset !== 'number') {
    offset = -new Date().getTimezoneOffset();
  }
  // JS Date.UTC treats arguments as UTC; subtract offset (minutes east) to get UTC instant for local time
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offset * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Julian Day => UTC Date converter (utility)
 */
function julianDayToUTCDate(jd: number): Date {
  const J = jd + 0.5;
  const Z = Math.floor(J);
  const F = J - Z;
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const dayInt = Math.floor(day);
  const dayFrac = day - dayInt;
  const hours = Math.floor(dayFrac * 24);
  const minutes = Math.floor((dayFrac * 24 - hours) * 60);
  const seconds = Math.round(((dayFrac * 24 - hours) * 60 - minutes) * 60);
  return new Date(Date.UTC(year, month - 1, dayInt, hours, minutes, seconds));
}

/**
 * Helper: normalize 0..360
 */
function fix360Local(deg: number): number {
  let v = deg % 360;
  if (v < 0) v += 360;
  return v;
}

/**
 * RashiChart class
 */
export class RashiChart {
  private panchangImpl: PanchangImplLike;
  private options: RashiChartOptions;
  private sunMoonTimer: YexaaSunMoonTimer;

  constructor(panchangImpl: PanchangImplLike, options?: RashiChartOptions) {
    this.panchangImpl = panchangImpl;
    this.options = options || { siderealSign: 'plus', ayanamsaMode: 'lahiri' };
    this.sunMoonTimer = new YexaaSunMoonTimer();
  }

  private fix360(deg: number) {
    if (this.panchangImpl.fix360) return this.panchangImpl.fix360(deg);
    return fix360Local(deg);
  }

  /**
   * Compute snapshot instant for given local calendar date + location.
   * Returns a JS Date (UTC instant) that corresponds to the requested local time in timeZone.
   */
  async computeSnapshotLocalDate(
    date: Date,
    lat: number,
    lon: number,
    timeZone: string,
    snapshot: SnapshotOption = 'sunrise'
  ): Promise<Date> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-based month
    const day = date.getDate();

    if (snapshot === 'sunrise') {
      try {
        // Use YexaaSunMoonTimer to get accurate sunrise time
        const sunTimes = this.sunMoonTimer.sunTimer(date, lat, lon);
        return sunTimes.sunRise;
      } catch (err) {
        console.warn('Failed to compute sunrise, using 6:20 AM local:', err);
        return makeDateForTargetLocal(year, month, day, 6, 20, timeZone);
      }
    } else if (snapshot === 'midnight') {
      return makeDateForTargetLocal(year, month, day, 0, 0, timeZone);
    } else if (snapshot === 'noon') {
      return makeDateForTargetLocal(year, month, day, 12, 0, timeZone);
    } else {
      // custom
      return makeDateForTargetLocal(year, month, day, snapshot.hour, snapshot.minute, timeZone);
    }
  }

  /**
   * convert JS Date (which is an UTC instant representing local requested time produced by makeDateForTargetLocal)
   * to Julian Day UT using panchangImpl.mdy2julian + dTime - same logic you used in sankranti code.
   */
  private dateToJulianUT(localDateObj: Date): number {
    const localDay = localDateObj.getUTCDate();
    const localMon = localDateObj.getUTCMonth() + 1;
    const localYear = localDateObj.getUTCFullYear();
    const localHr =
      localDateObj.getUTCHours() +
      localDateObj.getUTCMinutes() / 60 +
      localDateObj.getUTCSeconds() / 3600 +
      localDateObj.getUTCMilliseconds() / 3600000;

    // NOTE: Because we create the Date such that it represents the target local time as an UTC instant,
    // we should not apply system timezone offsets here. JD computation uses the local date number,
    // so we must reconstruct as if the local date portions correspond to the target local time.
    // For compatibility with your earlier pipeline, compute jd0 for the local date components
    const jd0 = this.panchangImpl.mdy2julian(localMon, Math.floor(localDay), localYear);
    // tzone variable: we want the timezone offset in hours for the target local date.
    // Since our Date is already corrected we can compute tzone using getTimezoneOffset on a Date created from the same local parts in system tz,
    // but that is fragile. Instead, assume our Date was created via makeDateForTargetLocal so:
    const tzone = 0; // since localDateObj is already aligned, use 0 here.
    const jdut = jd0 + (localHr - tzone) / 24;
    const dt = this.panchangImpl.dTime(jdut);
    const jd = jdut + dt / 24;
    return jd;
  }

  /**
   * Compute tropical longitude for a planet by delegating to panchangImpl.
   * Returns null if not available.
   */
  private computeTropicalLongitude(planet: PlanetName, jdUT: number): number | null {
    const p = this.panchangImpl as any;
    switch (planet) {
      case 'Sun':
        return this.panchangImpl.sun(jdUT);
      case 'Moon':
        if (typeof p.moon === 'function') return p.moon(jdUT);
        return null;
      case 'Mars':
        if (typeof p.mars === 'function') return p.mars(jdUT);
        return null;
      case 'Mercury':
        if (typeof p.mercury === 'function') return p.mercury(jdUT);
        return null;
      case 'Jupiter':
        if (typeof p.jupiter === 'function') return p.jupiter(jdUT);
        return null;
      case 'Venus':
        if (typeof p.venus === 'function') return p.venus(jdUT);
        return null;
      case 'Saturn':
        if (typeof p.saturn === 'function') return p.saturn(jdUT);
        return null;
      case 'Rahu':
        if (typeof p.rahuLongitude === 'function') return p.rahuLongitude(jdUT);
        return null;
      case 'Ketu':
        if (typeof p.rahuLongitude === 'function') {
          return this.fix360((p.rahuLongitude(jdUT) + 180) % 360);
        }
        return null;
      default:
        return null;
    }
  }

  /**
   * Convert tropical long -> sidereal using ayanamsa. Mode can be 'plus' or 'minus'.
   * Use the same convention as your sankranti code. Default is 'plus' to match earlier code.
   */
  private toSidereal(tropicalLon: number, ayanamsaDeg: number): number {
    const mode = this.options.siderealSign || 'plus';
    const sid = mode === 'plus' ? tropicalLon + ayanamsaDeg : tropicalLon - ayanamsaDeg;
    return this.fix360(sid);
  }

  private rashiIndexFromSidereal(siderealLon: number): number {
    return Math.floor(siderealLon / 30) % 12;
  }

  /**
   * Compute graha rashi info for all planets at the given local snapshot Date (UTC instant representing target local time)
   */
  async computeGrahaRashi(dateLocalSnapshot: Date): Promise<GrahaRashiInfo[]> {
    const jd = this.dateToJulianUT(dateLocalSnapshot);
    const ayanamsaDeg = this.panchangImpl.calcayan(jd);

    const results: GrahaRashiInfo[] = [];
    const missing: string[] = [];

    for (const planet of PLANET_NAMES) {
      const trop = this.computeTropicalLongitude(planet as PlanetName, jd);
      if (trop === null || typeof trop !== 'number' || Number.isNaN(trop)) {
        missing.push(planet);
        continue;
      }
      const sid = this.toSidereal(trop, ayanamsaDeg);
      const rashiIndex = this.rashiIndexFromSidereal(sid);
      const degreeInRashi = sid - rashiIndex * 30;
      results.push({
        planet: planet as PlanetName,
        tropicalLon: trop,
        ayanamsaDeg,
        siderealLon: sid,
        rashiIndex,
        rashiName: RASHI_NAMES[rashiIndex],
        rashiNameTelugu: RASHI_NAMES_TELUGU[rashiIndex],
        degreeInRashi,
      });
    }

    if (missing.length) {
      console.warn('RashiChart: missing ephemeris for planets:', missing);
    }

    return results;
  }

  /**
   * Map rashi indices -> grid cells using mapping array (rashiIndex -> cellIndex).
   * Cells with no rashi assigned will keep rashiIndex -1.
   */
  mapRashiToGrid(grahas: GrahaRashiInfo[], mapping: number[]): GridCell[] {
    const cells: GridCell[] = [];
    for (let i = 0; i < 12; i++) {
      cells.push({ cellIndex: i, rashiIndex: -1, planets: [] });
    }

    const rashiToCell: Record<number, number> = {};
    for (let r = 0; r < 12; r++) {
      const c = mapping[r];
      if (typeof c === 'number' && c >= 0 && c < 12) {
        rashiToCell[r] = c;
        cells[c].rashiIndex = r;
      }
    }

    for (const g of grahas) {
      const c = rashiToCell[g.rashiIndex];
      if (typeof c === 'number') {
        cells[c].planets.push(g.planet);
      } else {
        // fallback: push into center (5) for visibility
        cells[5].planets.push(g.planet);
      }
    }

    return cells;
  }

  /**
   * Main convenience method for UI: compute grid for a date + location + mapping.
   */
  async computeGridForDate(
    date: Date,
    lat: number,
    lon: number,
    timeZone: string,
    mapping: number[],
    snapshotOpt: SnapshotOption = 'sunrise'
  ): Promise<RashiGridResult> {
    const snapshotLocal = await this.computeSnapshotLocalDate(
      date,
      lat,
      lon,
      timeZone,
      snapshotOpt
    );
    const grahas = await this.computeGrahaRashi(snapshotLocal);
    const grid = this.mapRashiToGrid(grahas, mapping);
    const jd = this.dateToJulianUT(snapshotLocal);
    // include missing planet names in debug
    const missing = PLANET_NAMES.filter(p => !grahas.find(g => g.planet === p));
    return {
      dateLocal: snapshotLocal,
      snapshotType: typeof snapshotOpt === 'string' ? snapshotOpt : 'custom',
      grid,
      grahas,
      location: { lat, lng: lon, timezone: timeZone },
      debug: {
        jd,
        sunriseLocal: snapshotLocal,
        missingPlanets: missing,
        siderealModeUsed: this.options.siderealSign,
      },
    };
  }

  /**
   * Default mapping guess: rashiIndex -> cellIndex
   * North Indian style layout: all 12 houses mapped to their respective cells (0-11)
   */
  static getDefaultMapping(): number[] {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }

  /**
   * Infer mapping from labeled samples. Each sample should be:
   * { dateLocal: Date (UTC instant for target local time), observed: { PlanetName: cellIndex } }
   *
   * This uses frequency counts to pick the best cell for each rashi.
   */
  static inferMappingFromSamples(
    panchangImpl: PanchangImplLike,
    samples: Array<{ dateLocal: Date; observed: Record<string, number> }>
  ): { mapping: number[]; conflicts: any[] } {
    // Build temporary RashiChart to compute rashi indices for sample dates
    const rc = new RashiChart(panchangImpl);
    // mappingCounts[rashi][cell] = count
    const mappingCounts: number[][] = Array.from({ length: 12 }, () => Array(12).fill(0));
    const conflicts: any[] = [];

    // synchronous helper to compute rashi index for a sample (we assume panchangImpl synchronous methods)
    for (const s of samples) {
      const jd = rc.dateToJulianUT(s.dateLocal);
      const ay = panchangImpl.calcayan(jd);
      for (const planetKey of Object.keys(s.observed)) {
        const obsCell = s.observed[planetKey];
        const planet = planetKey as PlanetName;
        // compute tropical lon
        const pfn = (panchangImpl as any)[planet.toLowerCase()];
        let trop: number | null = null;
        if (planet === 'Sun') trop = panchangImpl.sun(jd);
        else if (typeof (panchangImpl as any)[planet.toLowerCase()] === 'function')
          trop = (panchangImpl as any)[planet.toLowerCase()](jd);
        else if (planet === 'Rahu' && typeof (panchangImpl as any).rahuLongitude === 'function')
          trop = (panchangImpl as any).rahuLongitude(jd);
        else if (planet === 'Ketu' && typeof (panchangImpl as any).rahuLongitude === 'function')
          trop = fix360Local((panchangImpl as any).rahuLongitude(jd) + 180);
        if (trop === null || trop === undefined) continue;
        const sid = rc.toSidereal(trop, ay);
        const rashi = Math.floor(sid / 30) % 12;
        mappingCounts[rashi][obsCell] += 1;
      }
    }

    const mapping: number[] = new Array(12).fill(-1);
    for (let r = 0; r < 12; r++) {
      let bestCell = -1;
      let bestCnt = 0;
      for (let c = 0; c < 12; c++) {
        if (mappingCounts[r][c] > bestCnt) {
          bestCnt = mappingCounts[r][c];
          bestCell = c;
        }
      }
      mapping[r] = bestCell;
    }

    // detect cell conflicts (multiple rashis mapping to same cell)
    const cell2r: Record<number, number[]> = {};
    for (let r = 0; r < 12; r++) {
      const c = mapping[r];
      if (c >= 0) {
        cell2r[c] = cell2r[c] || [];
        cell2r[c].push(r);
      }
    }
    for (const [cStr, rs] of Object.entries(cell2r)) {
      if ((rs as number[]).length > 1) {
        conflicts.push({ cell: parseInt(cStr, 10), rashis: rs });
      }
    }

    return { mapping, conflicts };
  }
}

export function formatGrahaDebug(g: GrahaRashiInfo, locale?: string) {
  const isTelugu = locale === 'te';
  const planetName = isTelugu ? PLANET_NAMES_TELUGU[g.planet] : g.planet;
  const rashiName = isTelugu ? g.rashiNameTelugu : g.rashiName;
  return `${planetName}: ${rashiName} (${g.rashiIndex + 1}) @ ${g.siderealLon.toFixed(3)}° (+${g.degreeInRashi.toFixed(3)}°)`;
}

// Helper function to get planet name in Kannada (abbreviated)
export function getPlanetNameTelugu(planet: PlanetName): string {
  const shortNames: Record<PlanetName, string> = {
    Sun: 'రవి',
    Moon: 'చంద్ర',
    Mars: 'కుజ',
    Mercury: 'బుధ',
    Jupiter: 'గురు',
    Venus: 'శుక్ర',
    Saturn: 'శని',
    Rahu: 'రాహు',
    Ketu: 'కేతు',
  };
  return shortNames[planet] || planet;
}
