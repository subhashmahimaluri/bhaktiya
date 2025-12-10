import * as Astronomy from 'astronomy-engine';
import type { PanchangImplLike } from './RashiChart';
import type { YexaaPanchangImpl } from './yexaaPanchangImpl';

/**
 * Convert Julian Day to AstroTime
 */
function jdToAstroTime(jd: number): Astronomy.AstroTime {
  // astronomy-engine uses J2000 epoch (JD 2451545.0 = 2000-01-01 12:00 TT)
  const J2000 = 2451545.0;
  const daysSinceJ2000 = jd - J2000;
  // Convert to milliseconds and create Date
  const msPerDay = 86400000;
  const j2000Date = new Date('2000-01-01T12:00:00Z');
  const date = new Date(j2000Date.getTime() + daysSinceJ2000 * msPerDay);
  return Astronomy.MakeTime(date);
}

/**
 * Get tropical longitude for a planet
 */
function getLon(body: Astronomy.Body, jd: number): number {
  const time = jdToAstroTime(jd);

  if (body === Astronomy.Body.Sun) {
    const pos = Astronomy.SunPosition(time);
    return ((pos.elon % 360) + 360) % 360;
  } else {
    // For all planets including Moon, use GeoVector and convert to ecliptic
    const vec = Astronomy.GeoVector(body, time, false);
    const ecl = Astronomy.Ecliptic(vec);
    return ((ecl.elon % 360) + 360) % 360;
  }
}

/**
 * Get Rahu (Moon's North Node) longitude
 */
function getRahu(jd: number): number {
  const time = jdToAstroTime(jd);
  // Get Moon's node using SearchMoonNode or approximation
  // Approximate using lunar node calculation
  // Mean longitude of ascending node: 125.04 - 0.0529539 * T (in degrees)
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000
  const omega = 125.04 - 1934.136 * T; // Mean longitude of ascending node
  return ((omega % 360) + 360) % 360;
}

export function makeAstronomyPanchangAdapter(base: YexaaPanchangImpl): PanchangImplLike {
  return {
    mdy2julian: (m, d, y) => base.mdy2julian(m, d, y),
    dTime: jd => base.dTime(jd),
    calcayan: jd => base.calcayan(jd),

    sun: jd => base.sun(jd), // keep your original for Sankranti

    moon: jd => getLon(Astronomy.Body.Moon, jd),
    mars: jd => getLon(Astronomy.Body.Mars, jd),
    mercury: jd => getLon(Astronomy.Body.Mercury, jd),
    jupiter: jd => getLon(Astronomy.Body.Jupiter, jd),
    venus: jd => getLon(Astronomy.Body.Venus, jd),
    saturn: jd => getLon(Astronomy.Body.Saturn, jd),

    rahuLongitude: jd => getRahu(jd),

    fix360: deg => ((deg % 360) + 360) % 360,
  };
}
