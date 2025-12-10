// utils/getSpecialKaal.ts
// Supports two "kinds": 'varjyam' or 'amrit'.
// Uses GHADI tables if present (preferred), otherwise falls back to minute tables.

export type NakshatraSpan = { label: string; time: string };
export type SunData = { sunrise?: string; sunset?: string; nextDaySunrise?: string };

function parseRange(rangeStr: string, year: number): { start: Date; end: Date } {
  const parts = rangeStr.split('–').map(s => s.trim());
  if (parts.length !== 2) {
    const alt = rangeStr.split('-').map(s => s.trim());
    if (alt.length >= 2) parts.splice(0, parts.length, alt[0], alt[1]);
  }
  if (parts.length !== 2) throw new Error('Invalid range: ' + rangeStr);
  const mk = (p: string) => {
    let d = new Date(`${p} ${year}`);
    if (isNaN(d.getTime())) d = new Date(`${p}, ${year}`);
    if (isNaN(d.getTime())) throw new Error('Bad date part: ' + p);
    return d;
  };
  let start = mk(parts[0]);
  let end = mk(parts[1]);
  if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function parseTimeOnDate(baseDate: Date, timeStr?: string, dayOffset = 0): Date {
  const d = new Date(baseDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  if (!timeStr) return d;
  let s = String(timeStr).trim().toUpperCase().replace(/\s+/g, '');
  s = s.replace(/(AM|PM)$/, ' $1');
  const parts = s.split(' ');
  const timePart = parts[0] || '';
  const mer = parts[1] || '';
  const [hhS, mmS = '0'] = timePart.split(':');
  let hh = parseInt(hhS, 10),
    mm = parseInt(mmS, 10);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return d;
  if (mer === 'PM' && hh !== 12) hh += 12;
  if (mer === 'AM' && hh === 12) hh = 0;
  d.setHours(hh, mm, 0, 0);
  return d;
}

function roundDownToMinute(d: Date) {
  return new Date(Math.floor(d.getTime() / 60000) * 60000);
}
function roundUpToMinute(d: Date) {
  return new Date(Math.ceil(d.getTime() / 60000) * 60000);
}
function fmtShortDate(d: Date) {
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ------------------ Base tables ------------------
// If you prefer ghadi entries, fill the GHADI maps.
// Example: ASHWINI amrit = 42 (ghadi) -> 42 * 24 = 1008 minutes -> 16:48
const BASE_AMRIT_GHADI: Record<string, number> = {
  ashwini: 42,
  bharani: 48,
  krithika: 54,
  rohini: 52,
  mrigashirsha: 38,
  ardra: 35,
  punarvasu: 54,
  pushya: 44,
  ashlesha: 56,
  makha: 54,
  purva_phalguni: 44,
  uttara_phalguni: 42,
  hasta: 45,
  chitra: 44,
  swati: 38,
  vishaka: 38,
  anuradha: 34,
  jyeshta: 38,
  moola: 44,
  purva_ashadha: 48,
  uttara_ashadha: 44,
  shravana: 34,
  dhanishta: 34,
  shatabhisha: 42,
  purva_bhadrapada: 40,
  uttara_bhadrapada: 48,
  revati: 54,
};

const BASE_VARJYAM_GHADI: Record<string, number> = {
  ashwini: 50,
  bharani: 24,
  krithika: 30,
  rohini: 40,
  mrigashirsha: 14,
  ardra: 21,
  punarvasu: 30,
  pushya: 20,
  ashlesha: 32,
  makha: 30,
  purva_phalguni: 20,
  uttara_phalguni: 18,
  hasta: 21,
  chitra: 20,
  swati: 14,
  vishaka: 14,
  anuradha: 10,
  jyeshta: 14,
  moola: 56,
  purva_ashadha: 24,
  uttara_ashadha: 20,
  shravana: 10,
  dhanishta: 10,
  shatabhisha: 18,
  purva_bhadrapada: 16,
  uttara_bhadrapada: 24,
  revati: 30,
};

// fallback minutes maps (if you already had hh:mm mapping)
const BASE_AMRIT_MIN: Record<string, number> = {
  ashwini: 16 * 60 + 48,
  bharani: 19 * 60 + 12,
  krithika: 21 * 60 + 36,
  rohini: 20 * 60 + 48,
  mrigashirsha: 15 * 60 + 12,
  ardra: 14 * 60 + 0,
  punarvasu: 21 * 60 + 36,
  pushya: 17 * 60 + 36,
  ashlesha: 22 * 60 + 24,
  makha: 21 * 60 + 36,
  purva_phalguni: 17 * 60 + 36,
  uttara_phalguni: 16 * 60 + 48,
  hasta: 18 * 60 + 0,
  chitra: 17 * 60 + 36,
  swati: 15 * 60 + 12,
  vishaka: 15 * 60 + 12,
  anuradha: 13 * 60 + 36,
  jyeshta: 15 * 60 + 12,
  moola: 17 * 60 + 36,
  purva_ashadha: 19 * 60 + 12,
  uttara_ashadha: 17 * 60 + 36,
  shravana: 13 * 60 + 36,
  dhanishta: 13 * 60 + 36,
  shatabhisha: 16 * 60 + 48,
  purva_bhadrapada: 16 * 60 + 0,
  uttara_bhadrapada: 19 * 60 + 12,
  revati: 21 * 60 + 36,
};

const BASE_VARJYAM_MIN: Record<string, number> = {
  ashwini: 20 * 60 + 0,
  bharani: 9 * 60 + 36,
  krithika: 12 * 60 + 0,
  rohini: 16 * 60 + 0,
  mrigashirsha: 5 * 60 + 36,
  ardra: 8 * 60 + 24,
  punarvasu: 12 * 60 + 0,
  pushya: 8 * 60 + 0,
  ashlesha: 12 * 60 + 48,
  makha: 12 * 60 + 0,
  purva_phalguni: 8 * 60 + 0,
  uttara_phalguni: 7 * 60 + 12,
  hasta: 8 * 60 + 24,
  chitra: 8 * 60 + 0,
  swati: 5 * 60 + 36,
  vishaka: 5 * 60 + 36,
  anuradha: 4 * 60 + 0,
  jyeshta: 5 * 60 + 36,
  moola: 22 * 60 + 24,
  purva_ashadha: 9 * 60 + 36,
  uttara_ashadha: 8 * 60 + 0,
  shravana: 4 * 60 + 0,
  dhanishta: 4 * 60 + 0,
  shatabhisha: 7 * 60 + 12,
  purva_bhadrapada: 6 * 60 + 24,
  uttara_bhadrapada: 9 * 60 + 36,
  revati: 12 * 60 + 0,
};

// constants
const AMRIT_BASE_DURATION_MIN = 96; // 4 ghadi = 1h36m
const VARJYAM_BASE_DURATION_MIN = 96; // same

const MINUTES_IN_24H = 24 * 60;

// ------------------ main unified function ------------------
export function getSpecialKaalForDay(
  kind: 'amrit' | 'varjyam',
  displayNakshatras: NakshatraSpan[] = [],
  panchangamDate?: Date | string,
  sunData?: { sunrise?: string; nextDaySunrise?: string },
  opts?: { roundMinuteOffset?: number }
) {
  const dateObj =
    panchangamDate instanceof Date
      ? panchangamDate
      : panchangamDate
        ? new Date(panchangamDate)
        : null;
  if (!dateObj || isNaN(dateObj.getTime())) return [];

  const year = dateObj.getFullYear();
  const daySunrise = parseTimeOnDate(dateObj, sunData?.sunrise, 0);
  const nextSunrise = sunData?.nextDaySunrise
    ? parseTimeOnDate(dateObj, sunData.nextDaySunrise, 1)
    : new Date(daySunrise.getTime() + 24 * 60 * 60 * 1000);
  const roundOffset = opts?.roundMinuteOffset ?? 0;

  const out: any[] = [];

  for (const item of displayNakshatras) {
    const label = item.label;
    // pick GHADI map first, then fallback to minutes map
    let baseGhadi: number | undefined;
    let baseMin: number | undefined;

    if (kind === 'amrit') {
      baseGhadi = BASE_AMRIT_GHADI[label];
      baseMin = BASE_AMRIT_MIN[label];
    } else {
      baseGhadi = BASE_VARJYAM_GHADI[label];
      baseMin = BASE_VARJYAM_MIN[label];
    }

    // if ghadi provided, use that. else if minutes provided, use that. else skip.
    let baseOffsetMinutes: number | null = null;
    if (typeof baseGhadi === 'number') baseOffsetMinutes = baseGhadi * 24;
    else if (typeof baseMin === 'number') baseOffsetMinutes = baseMin;
    else continue;

    // duration base
    const baseDurationMin = kind === 'amrit' ? AMRIT_BASE_DURATION_MIN : VARJYAM_BASE_DURATION_MIN;

    // parse span
    let span;
    try {
      span = parseRange(item.time, year);
    } catch {
      continue;
    }
    const actualDurationMin = (span.end.getTime() - span.start.getTime()) / (1000 * 60);
    if (!(actualDurationMin > 0)) continue;

    // scale by (actualDuration / 24h)
    const scale = actualDurationMin / MINUTES_IN_24H;
    const actualOffsetMin = baseOffsetMinutes * scale;
    const actualDurationForThisKaalMin = baseDurationMin * scale;

    const rawStart = new Date(span.start.getTime() + actualOffsetMin * 60 * 1000);
    const rawEnd = new Date(rawStart.getTime() + actualDurationForThisKaalMin * 60 * 1000);

    // rounding
    let roundedStart = roundDownToMinute(rawStart);
    let roundedEnd = roundUpToMinute(rawEnd);
    if (roundOffset !== 0) {
      roundedStart = new Date(roundedStart.getTime() + roundOffset * 60 * 1000);
      roundedEnd = new Date(roundedEnd.getTime() + roundOffset * 60 * 1000);
    }

    // clip to sunrise->nextSunrise
    const clippedStart = roundedStart < daySunrise ? daySunrise : roundedStart;
    const clippedEnd = roundedEnd > nextSunrise ? nextSunrise : roundedEnd;
    if (clippedStart.getTime() >= clippedEnd.getTime()) continue;

    const belongs =
      rawStart.getTime() >= daySunrise.getTime() && rawStart.getTime() < nextSunrise.getTime();

    // normalized display date if belongs
    let displayStart = belongs
      ? new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          clippedStart.getHours(),
          clippedStart.getMinutes()
        )
      : clippedStart;
    let displayEnd = belongs
      ? new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          clippedEnd.getHours(),
          clippedEnd.getMinutes()
        )
      : clippedEnd;
    if (displayEnd.getTime() <= displayStart.getTime() && belongs)
      displayEnd = new Date(displayEnd.getTime() + 24 * 60 * 60 * 1000);

    out.push({
      sourceNakshatra: label,
      rawStart,
      rawEnd,
      clippedStart,
      clippedEnd,
      belongsToPanchangamDate: belongs,
      displayStart,
      displayEnd,
      fmtDisplayStart: `${fmtShortDate(displayStart)}, ${fmtTime(displayStart)}`,
      fmtDisplayEnd: `${fmtShortDate(displayEnd)}, ${fmtTime(displayEnd)}`,
      // include debug values
      debug: { baseGhadi, baseOffsetMinutes, scale, actualDurationForThisKaalMin },
    });
  }

  out.sort((a, b) => a.displayStart.getTime() - b.displayStart.getTime());
  return out;
}
