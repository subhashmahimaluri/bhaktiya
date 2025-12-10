// sankrantiWithPanchangImpl.tz.ts
// Frontend-friendly: no native modules. Uses your panchangImpl (mhah-panchang) to compute sankranti instants.
// Key: supports IANA timeZone and tzOffsetMinutes; brackets & membership use the requested timezone.

export type PanchangImplLike = {
  mdy2julian: (m: number, dayFrac: number, y: number) => number;
  dTime: (jdut: number) => number;
  calcayan: (jd: number) => number; // returns ayanamsa degrees
  sun: (jd: number) => number; // returns Sun longitude (as your impl expects)
};

const SIGN_NAMES = [
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
];

const SIGN_NAMES_TE = [
  'మేష',
  'వృషభ',
  'మిథున',
  'కర్క',
  'సింహ',
  'కన్య',
  'తుల',
  'వృశ్చిక',
  'ధనుస్సు',
  'మకర',
  'కుంభ',
  'మీన',
];

function fix360(x: number) {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

function normalize180(angle: number) {
  let a = ((angle + 180) % 360) - 180;
  if (a < -180) a += 360;
  return a;
}

// ------------ timezone helpers ------------

// Convert a local date/time in target timezone to a JS Date (UTC instant).
// We build the UTC ms by taking Date.UTC(localParts) and subtracting tzOffsetMinutes.
// If tzOffsetMinutes is not provided but timeZone is provided, we compute tzOffsetMinutes for a sample date.
function localPartsToUTCDate(
  local: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
  },
  tzOffsetMinutes: number
) {
  const h = local.hour ?? 0;
  const m = local.minute ?? 0;
  const s = local.second ?? 0;
  // Date.UTC treats input as UTC; to get UTC instant for local time we subtract the offset (in minutes).
  const utcMs =
    Date.UTC(local.year, local.month - 1, local.day, h, m, s) - tzOffsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

// Compute tz offset in minutes (east of UTC) for a timezone at a sample UTC date.
// Strategy: given utcDate, format it into parts in target timezone (Intl), then Date.UTC(localParts) - utcDate = offset (ms).
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
    obj.year!,
    obj.month! - 1,
    obj.day!,
    obj.hour ?? 0,
    obj.minute ?? 0,
    obj.second ?? 0
  );
  const offsetMinutes = (localUtcMs - sampleUtcDate.getTime()) / (60 * 1000);
  // round to nearest minute
  return Math.round(offsetMinutes);
}

// Build a JS Date (UTC instant) representing the TARGET local date/time (in given timezone or tzOffsetMinutes).
// If timeZone provided but tzOffsetMinutes is not, we compute offset from sample date (mid-year) to handle DST correctly.
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
    // use a sample UTC date roughly at the local date to compute offset (use noon UTC on that day)
    const sampleUtc = new Date(Date.UTC(year, month - 1, Math.max(1, day), 12, 0, 0));
    offset = getOffsetMinutesForTimeZoneAtDate(timeZone, sampleUtc);
  }
  if (typeof offset !== 'number') {
    // fallback to system local offset (minutes east) if nothing provided
    offset = -new Date().getTimezoneOffset();
  }
  return localPartsToUTCDate({ year, month, day, hour, minute, second: 0 }, offset);
}

// helper to format a UTC date into local str for timeZone using Intl
function formatUtcDateToTimeZone(utcDate: Date, timeZone?: string) {
  if (!timeZone) return utcDate.toString();
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(utcDate);
}

// helper to get local-year of a UTC date in the target timezone
function getLocalYearForUtcDate(utcDate: Date, timeZone?: string) {
  if (!timeZone) return utcDate.getFullYear();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(utcDate);
  const y = parts.find(p => p.type === 'year');
  return y ? parseInt(y.value, 10) : utcDate.getFullYear();
}

// ------------ julian / panchang helpers (replicate your earlier behaviour) ------------

// Convert a JS Date that represents a LOCAL date/time (in target timezone) into JD UT using panchangImpl pipeline.
// Note: We call dateToJulianUT with a Date that was created by makeDateForTargetLocal (so getHours() etc will match local parts).
function dateToJulianUT(panchangImpl: PanchangImplLike, localDateObj: Date): number {
  // replicate your earlier logic in YexaaCalculateFunc.calculate
  const localDay = localDateObj.getDate();
  const localMon = localDateObj.getMonth() + 1;
  const localYear = localDateObj.getFullYear();
  const localHr =
    localDateObj.getHours() +
    localDateObj.getMinutes() / 60 +
    localDateObj.getSeconds() / 3600 +
    localDateObj.getMilliseconds() / 3600000;
  const tzone = (localDateObj.getTimezoneOffset() / 60) * -1; // NOTE: localDateObj is a JS Date whose getTimezoneOffset is system's tz - but we built the Date such that localParts match desired local time; using this getTimezoneOffset is harmless because we build dates with offset already applied.
  const jd0 = panchangImpl.mdy2julian(localMon, localDay, localYear);
  const jdut = jd0 + (localHr - tzone) / 24;
  const dt = panchangImpl.dTime(jdut);
  const jd = jdut + dt / 24;
  return jd;
}

// sidereal sun lon (match your panchang impl choice): SIDEREAL = Lsun + ayanamsa (as your panchangImpl uses).
function siderealSunLonDeg(panchangImpl: PanchangImplLike, jdUT: number): number {
  const Lsun = panchangImpl.sun(jdUT);
  const ay = panchangImpl.calcayan(jdUT);
  const sid = fix360(Lsun + ay);
  return sid;
}

// bisection root-finder over JD between two local-date bracket endpoints (converted to JD UT)
export async function findSankrantiJDWithPanchangImpl(
  panchangImpl: PanchangImplLike,
  targetAngleSidereal: number,
  bracketStartLocal: Date, // JS Date representing the *target local* date/time in the target timezone (created via makeDateForTargetLocal)
  bracketEndLocal: Date,
  opts?: { tolSec?: number; maxIter?: number }
): Promise<{ jd: number; debug: any }> {
  const tolSec = opts?.tolSec ?? 1;
  const maxIter = opts?.maxIter ?? 80;

  const jdA = dateToJulianUT(panchangImpl, bracketStartLocal);
  const jdB = dateToJulianUT(panchangImpl, bracketEndLocal);

  const f = (jd: number) => {
    const sid = siderealSunLonDeg(panchangImpl, jd);
    return normalize180(sid - targetAngleSidereal);
  };

  let fa = f(jdA);
  let fb = f(jdB);

  if (Math.sign(fa) === Math.sign(fb)) {
    // try wrap shifts
    let changed = false;
    for (const shift of [-360, 360, -720, 720]) {
      const fbShift = fb + shift;
      if (Math.sign(fa) !== Math.sign(fbShift)) {
        fb = fbShift;
        changed = true;
        break;
      }
    }
    if (!changed) {
      // expand bracket ±3 days (local)
      const extra = 3 * 24 * 3600 * 1000;
      const altA = new Date(bracketStartLocal.getTime() - extra);
      const altB = new Date(bracketEndLocal.getTime() + extra);
      const jdAltA = dateToJulianUT(panchangImpl, altA);
      const jdAltB = dateToJulianUT(panchangImpl, altB);
      fa = f(jdAltA);
      fb = f(jdAltB);
      if (Math.sign(fa) === Math.sign(fb)) {
        throw new Error('No sign change in bracket — expand bracket or validate inputs.');
      } else {
        return await findSankrantiJDWithPanchangImpl(
          panchangImpl,
          targetAngleSidereal,
          altA,
          altB,
          opts
        );
      }
    }
  }

  let a = jdA;
  let b = jdB;
  let faVal = fa;
  let iter = 0;
  while ((b - a) * 86400 > tolSec && iter++ < maxIter) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (Math.sign(faVal) === Math.sign(fm)) {
      a = m;
      faVal = fm;
    } else {
      b = m;
    }
  }
  return { jd: (a + b) / 2, debug: { fa, fb, iterations: iter } };
}

// ---------- bracket helper (creates bracket Date objects in target timezone) ----------
// Uses the windows we discussed (conservative) and builds JS Date objects (UTC instants) representing those local times.
export function bracketForSignLocalTZ(
  signIndex: number,
  year: number,
  timeZone?: string,
  tzOffsetMinutes?: number
) {
  const windows = [
    { start: { y: year, m: 4, d: 12 }, end: { y: year, m: 5, d: 14 } }, // Mesha Apr12- May14
    { start: { y: year, m: 5, d: 12 }, end: { y: year, m: 6, d: 14 } }, // Vrishabha
    { start: { y: year, m: 6, d: 13 }, end: { y: year, m: 7, d: 16 } }, // Mithuna
    { start: { y: year, m: 7, d: 14 }, end: { y: year, m: 8, d: 17 } }, // Karka
    { start: { y: year, m: 8, d: 15 }, end: { y: year, m: 9, d: 18 } }, // Simha
    { start: { y: year, m: 9, d: 16 }, end: { y: year, m: 10, d: 18 } }, // Kanya
    { start: { y: year, m: 10, d: 17 }, end: { y: year, m: 11, d: 17 } }, // Tula
    { start: { y: year, m: 11, d: 16 }, end: { y: year, m: 12, d: 16 } }, // Vrishchika
    { start: { y: year, m: 12, d: 15 }, end: { y: year + 1, m: 1, d: 15 } }, // Dhanu
    { start: { y: year + 1, m: 1, d: 12 }, end: { y: year + 1, m: 2, d: 14 } }, // Makara (Jan)
    { start: { y: year + 1, m: 2, d: 11 }, end: { y: year + 1, m: 3, d: 14 } }, // Kumbha (Feb)
    { start: { y: year + 1, m: 3, d: 11 }, end: { y: year + 1, m: 4, d: 14 } }, // Meena (Mar)
  ];
  const w = windows[signIndex];
  // create Date objects that represent local midnight at start & end in target timezone, but expressed as JS Date (UTC instant)
  const startLocalDate = makeDateForTargetLocal(
    w.start.y,
    w.start.m,
    w.start.d,
    0,
    0,
    timeZone,
    tzOffsetMinutes
  );
  const endLocalDate = makeDateForTargetLocal(
    w.end.y,
    w.end.m,
    w.end.d,
    23,
    59,
    timeZone,
    tzOffsetMinutes
  );
  return { startLocalDate, endLocalDate };
}

// JD -> UTC Date converter
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

// ---------- Public: find sankranti for sign using panchangImpl (timeZone aware) ----------
export async function findSankrantiForSignWithPanchangImplTZ(
  panchangImpl: PanchangImplLike,
  signIndex: number,
  year: number,
  timeZone?: string,
  tzOffsetMinutes?: number,
  opts?: { tolSec?: number }
) {
  const { startLocalDate, endLocalDate } = bracketForSignLocalTZ(
    signIndex,
    year,
    timeZone,
    tzOffsetMinutes
  );
  const targetAngle = (signIndex % 12) * 30;
  const { jd, debug } = await findSankrantiJDWithPanchangImpl(
    panchangImpl,
    targetAngle,
    startLocalDate,
    endLocalDate,
    { tolSec: opts?.tolSec ?? 1 }
  );

  const utcDate = julianDayToUTCDate(jd);
  const ay = panchangImpl.calcayan(jd);
  const fmtLocal = formatUtcDateToTimeZone(utcDate, timeZone); // formatted string in target timezone
  const localYear = getLocalYearForUtcDate(utcDate, timeZone);

  return {
    signIndex,
    signName: SIGN_NAMES[signIndex],
    signNameTe: SIGN_NAMES_TE[signIndex],
    jdUTC: jd,
    utcDate,
    localYear,
    localTimeFormatted: fmtLocal,
    ayanamsaDeg: ay,
    debug,
  };
}

// ---------- Public: get sankrantis that fall inside a Gregorian calendar year for a timezone ----------
export async function getSankrantisForCalendarYear(
  panchangImpl: PanchangImplLike,
  year: number,
  timeZone?: string, // IANA tz e.g. "Asia/Calcutta"
  opts?: { tzOffsetMinutes?: number; tolSec?: number }
) {
  const tzOffsetMinutes = opts?.tzOffsetMinutes;
  const tolSec = opts?.tolSec ?? 1;

  // Search candidate events for sign-year combos (year-1..year+1) and keep those whose localYear === year
  const candidates: any[] = [];
  for (let sign = 0; sign < 12; sign++) {
    for (const y of [year - 1, year, year + 1]) {
      try {
        const res = await findSankrantiForSignWithPanchangImplTZ(
          panchangImpl,
          sign,
          y,
          timeZone,
          tzOffsetMinutes,
          { tolSec }
        );
        // res.localYear holds the year in target timezone when the event occurred
        if (res && res.localYear === year) candidates.push(res);
      } catch (err) {
        // ignore — some sign-year combos may fail if bracket miss; that's fine
      }
    }
  }

  // keep one per sign (if duplicates) — prefer earliest local time
  const bySign = new Map<number, any>();
  for (const c of candidates) {
    const s = c.signIndex;
    if (!bySign.has(s)) bySign.set(s, c);
    else {
      const prev = bySign.get(s);
      // compare UTC time
      if (c.utcDate.getTime() < prev.utcDate.getTime()) bySign.set(s, c);
    }
  }

  const results = Array.from(bySign.values()).sort(
    (a, b) => a.utcDate.getTime() - b.utcDate.getTime()
  );
  return results;
}
