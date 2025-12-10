import { getAyana, getDrikRitu, getTeluguYearName } from './getCalendarExtras';
import { YexaaCalculateFunc } from './yexaaCalculateFunc';
import { YexaaLocalConstant } from './yexaaLocalConstant';
import { YexaaPanchangImpl } from './yexaaPanchangImpl';
import { YexaaSunMoonTimer } from './yexaaSunMoonTimer';

export class YexaaCalendar {
  calendar(yexaaConstant: YexaaLocalConstant, dt: Date, lat: number, lng: number, height?: number) {
    const Tithi: Record<string, string | number> = {};
    const Nakshatra: Record<string, string | number> = {};
    const Yoga: Record<string, string | number> = {};
    const Karna: Record<string, string | number> = {};
    const Masa: Record<string, string | number> = {};
    const MoonMasa: Record<string, string | number | boolean> = {};
    const Raasi: Record<string, string | number> = {};
    const Ritu: Record<string, string | number> = {};
    const Paksha: Record<string, string | number> = {};
    const Gana: Record<string, string | number> = {};
    const Guna: Record<string, string | number> = {};
    const Trinity: Record<string, string | number> = {};
    const yexaaPanchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const yexaaCalculateFunc = new YexaaCalculateFunc();
    const yexaaSunMoonTimer = new YexaaSunMoonTimer();
    const sunRise = yexaaSunMoonTimer.getSunRiseJd(dt, lat, lng, height);
    const nn_tithi = this.getCalendarTithi(sunRise, yexaaPanchangImpl);
    const nn_paksha = yexaaCalculateFunc.getPaksha(nn_tithi);
    const ayanamsaAtRise = yexaaPanchangImpl.calcayan(sunRise);
    const nn_naksh = this.getCalendarNakshatra(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      ayanamsaAtRise,
      sunRise
    );
    const nn_yoga = this.getCalendarYoga(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      sunRise,
      ayanamsaAtRise
    );
    const nn_karana = yexaaCalculateFunc.getKarana(
      yexaaPanchangImpl.moon(sunRise),
      yexaaPanchangImpl.sun(sunRise)
    )[0];
    const nn_raasi = this.getCalendarRaasi(
      yexaaPanchangImpl,
      yexaaPanchangImpl.sun(sunRise),
      ayanamsaAtRise
    );

    const masa: { n_maasa: number; is_leap_month: boolean } = this.getMasa(
      yexaaPanchangImpl,
      nn_tithi,
      sunRise
    );

    const ritu = this.getRitu(masa.n_maasa);

    Raasi.ino = nn_raasi - 1;
    Raasi.name_TE = yexaaConstant.Raasi.name_TE[nn_raasi - 1];
    Raasi.name = yexaaConstant.Raasi.name[nn_raasi - 1];
    Guna.ino = yexaaCalculateFunc.getRaasiGuna(Raasi.ino);
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name = yexaaConstant.Guna.name[Guna.ino];

    Tithi.name = yexaaConstant.Tithi.name[nn_tithi - 1];
    Tithi.name_TE = yexaaConstant.Tithi.name_TE[nn_tithi - 1];
    Tithi.ino = nn_tithi - 1;
    Paksha.ino = nn_paksha;
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name_TE = yexaaConstant.Paksha.name_TE[nn_paksha];

    Nakshatra.name = yexaaConstant.Nakshatra.name[nn_naksh];
    Nakshatra.name_TE = yexaaConstant.Nakshatra.name_TE[nn_naksh];
    Nakshatra.ino = nn_naksh;
    Trinity.ino = yexaaCalculateFunc.getTrinityByNakshatra(Nakshatra.ino);
    Trinity.name_TE = yexaaConstant.Trinity.name_TE[Trinity.ino];
    Trinity.name = yexaaConstant.Trinity.name[Trinity.ino];
    Gana.ino = yexaaCalculateFunc.getGanaViaNakshatra(Nakshatra.ino);
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name = yexaaConstant.Gana.name[Gana.ino];

    Yoga.name = yexaaConstant.Yoga.name[nn_yoga];
    Yoga.name_TE = yexaaConstant.Yoga.name_TE[nn_yoga];
    Yoga.ino = nn_yoga;
    Karna.name = yexaaConstant.Karna.name[nn_karana];
    Karna.name_TE = yexaaConstant.Karna.name_TE[nn_karana];
    Karna.ino = nn_karana;

    // Masa uses Amanta system (changes at Amavasya - new moon, tithi 29→0)
    // masa.n_maasa is 1-based (1-12), convert to 0-based index (0-11)
    let amantaMasaIndex = masa.n_maasa - 1;

    // Handle negative indices by wrapping around (12 months)
    if (amantaMasaIndex < 0) {
      amantaMasaIndex += 12;
    }

    // Ensure index is within valid range (0-11)
    amantaMasaIndex = amantaMasaIndex % 12;

    Masa.ino = amantaMasaIndex;
    Masa.name = yexaaConstant.Masa.name[amantaMasaIndex] || '';
    Masa.name_TE = yexaaConstant.Masa.name_TE[amantaMasaIndex] || '';

    // MoonMasa uses Purnimanta system (changes at Pournami - full moon, tithi 14→15)
    // In Purnimanta, when tithi > 15 (Krishna Paksha), we're already in the NEXT lunar month
    let purnimantaMasaIndex = amantaMasaIndex;
    if (nn_tithi > 15) {
      // After Pournami (Krishna Paksha), advance to next month
      purnimantaMasaIndex = (amantaMasaIndex + 1) % 12;
    }

    MoonMasa.ino = purnimantaMasaIndex;
    MoonMasa.isLeapMonth = masa.is_leap_month;
    MoonMasa.name = yexaaConstant.Masa.name[purnimantaMasaIndex] || '';
    MoonMasa.name_TE = yexaaConstant.Masa.name_TE[purnimantaMasaIndex] || '';
    Ritu.ino = ritu;
    Ritu.name = yexaaConstant.Ritu.name[ritu];
    Ritu.name_TE = yexaaConstant.Ritu.name_TE[ritu];

    const solarLongitude = yexaaPanchangImpl.fix360(
      yexaaPanchangImpl.sun(sunRise) + ayanamsaAtRise
    );

    // Get extras
    const ayana = getAyana(solarLongitude);
    const drikRitu = getDrikRitu(solarLongitude);

    // Calculate Telugu year based on Chaitra Shukla Padyami date for the year
    const teluguYear = this.getTeluguYearForDate(dt, lat, lng);

    // Convert string values to indices for array access
    const ayanaIndex = ayana === 'uttarayana' ? 0 : 1;
    const drikRituIndex = ['vasanta', 'grishma', 'varsha', 'sharad', 'hemanta', 'shishira'].indexOf(
      drikRitu
    );
    const teluguYearIndex = this.getTeluguYearIndex(new Date(dt).getFullYear(), true);

    return {
      Tithi,
      Paksha,
      Nakshatra,
      Yoga,
      Karna,
      Masa,
      MoonMasa,
      Raasi,
      Ritu,
      Gana,
      Guna,
      Trinity,
      Ayana: {
        name: yexaaConstant.Ayana.name[ayanaIndex],
        name_TE: yexaaConstant.Ayana.name_TE[ayanaIndex],
      },
      DrikRitu: {
        name: yexaaConstant.DrikRitu.name[drikRituIndex],
        name_TE: yexaaConstant.DrikRitu.name_TE[drikRituIndex],
      },
      TeluguYear: {
        name: yexaaConstant.TeluguYear.name[teluguYearIndex],
        name_TE: yexaaConstant.TeluguYear.name_TE[teluguYearIndex],
      },
    };
  }

  /**
   * Get sunset Julian Date for a given date
   * @param dt - The date
   * @param lat - Latitude
   * @param lng - Longitude
   * @param height - Height (optional)
   * @returns Sunset Julian Date
   */
  getSunSetJd(dt: Date, lat: number, lng: number, height?: number): number {
    const yexaaSunMoonTimer = new YexaaSunMoonTimer();
    const calS = yexaaSunMoonTimer.calculatSunTimer(dt, lat, lng, height);
    const time = yexaaSunMoonTimer.times[0]; // sunRise/sunSet angle
    const h0 = (time[0] + calS.dh) * yexaaSunMoonTimer.rad;
    const Jset = yexaaSunMoonTimer.getSetJ(h0, calS.lw, calS.phi, calS.dec, calS.n, calS.M, calS.L);
    return Jset;
  }

  /**
   * Calculate Pradosha time in Julian Date
   * Pradosha time is 1/5th of the time period between sunset and next sunrise
   * @param dt - The date
   * @param lat - Latitude
   * @param lng - Longitude
   * @param height - Height (optional)
   * @returns Pradosha time in Julian Date
   */
  getPradoshaTimeJd(dt: Date, lat: number, lng: number, height?: number): number {
    const yexaaSunMoonTimer = new YexaaSunMoonTimer();
    const sunSet = this.getSunSetJd(dt, lat, lng, height);

    // Get next day's sunrise
    const nextDay = new Date(dt);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextSunRise = yexaaSunMoonTimer.getSunRiseJd(nextDay, lat, lng, height);

    // Calculate pradosha time: sunset + (1/5 of time between sunset and next sunrise)
    const totalInterval = nextSunRise - sunSet;
    const pradoshaTime = sunSet + totalInterval / 5;

    return pradoshaTime;
  }

  /**
   * Calculate calendar data at Sunset time instead of sunrise
   * @param yexaaConstant - Local constant
   * @param dt - The date
   * @param lat - Latitude
   * @param lng - Longitude
   * @param height - Height (optional)
   * @returns Calendar data at Sunset time
   */
  calendarAtSunset(
    yexaaConstant: YexaaLocalConstant,
    dt: Date,
    lat: number,
    lng: number,
    height?: number
  ) {
    const Tithi: Record<string, string | number> = {};
    const Nakshatra: Record<string, string | number> = {};
    const Yoga: Record<string, string | number> = {};
    const Karna: Record<string, string | number> = {};
    const Masa: Record<string, string | number> = {};
    const MoonMasa: Record<string, string | number | boolean> = {};
    const Raasi: Record<string, string | number> = {};
    const Ritu: Record<string, string | number> = {};
    const Paksha: Record<string, string | number> = {};
    const Gana: Record<string, string | number> = {};
    const Guna: Record<string, string | number> = {};
    const Trinity: Record<string, string | number> = {};
    const yexaaPanchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const yexaaCalculateFunc = new YexaaCalculateFunc();

    // Calculate at Sunset time - simply get tithi at sunset
    const sunsetTime = this.getSunSetJd(dt, lat, lng, height);

    // For sunset-based festivals, get the raw tithi at sunset (no skipped tithi logic)
    const moonPhaseAtSunset = yexaaPanchangImpl.lunarPhase(sunsetTime);
    const nn_tithi = Math.ceil(moonPhaseAtSunset / 12);

    const nn_paksha = yexaaCalculateFunc.getPaksha(nn_tithi);
    const ayanamsaAtSunset = yexaaPanchangImpl.calcayan(sunsetTime);
    const nn_naksh = this.getCalendarNakshatra(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      ayanamsaAtSunset,
      sunsetTime
    );
    const nn_yoga = this.getCalendarYoga(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      sunsetTime,
      ayanamsaAtSunset
    );
    const nn_karana = yexaaCalculateFunc.getKarana(
      yexaaPanchangImpl.moon(sunsetTime),
      yexaaPanchangImpl.sun(sunsetTime)
    )[0];
    const nn_raasi = this.getCalendarRaasi(
      yexaaPanchangImpl,
      yexaaPanchangImpl.sun(sunsetTime),
      ayanamsaAtSunset
    );

    const masa: { n_maasa: number; is_leap_month: boolean } = this.getMasa(
      yexaaPanchangImpl,
      nn_tithi,
      sunsetTime
    );

    const ritu = this.getRitu(masa.n_maasa);

    Raasi.ino = nn_raasi - 1;
    Raasi.name_TE = yexaaConstant.Raasi.name_TE[nn_raasi - 1];
    Raasi.name = yexaaConstant.Raasi.name[nn_raasi - 1];
    Guna.ino = yexaaCalculateFunc.getRaasiGuna(Raasi.ino);
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name = yexaaConstant.Guna.name[Guna.ino];

    Tithi.name = yexaaConstant.Tithi.name[nn_tithi - 1];
    Tithi.name_TE = yexaaConstant.Tithi.name_TE[nn_tithi - 1];
    Tithi.ino = nn_tithi - 1;
    Paksha.ino = nn_paksha;
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name_TE = yexaaConstant.Paksha.name_TE[nn_paksha];

    Nakshatra.name = yexaaConstant.Nakshatra.name[nn_naksh];
    Nakshatra.name_TE = yexaaConstant.Nakshatra.name_TE[nn_naksh];
    Nakshatra.ino = nn_naksh;
    Trinity.ino = yexaaCalculateFunc.getTrinityByNakshatra(Nakshatra.ino);
    Trinity.name_TE = yexaaConstant.Trinity.name_TE[Trinity.ino];
    Trinity.name = yexaaConstant.Trinity.name[Trinity.ino];
    Gana.ino = yexaaCalculateFunc.getGanaViaNakshatra(Nakshatra.ino);
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name = yexaaConstant.Gana.name[Gana.ino];

    Yoga.name = yexaaConstant.Yoga.name[nn_yoga];
    Yoga.name_TE = yexaaConstant.Yoga.name_TE[nn_yoga];
    Yoga.ino = nn_yoga;
    Karna.name = yexaaConstant.Karna.name[nn_karana];
    Karna.name_TE = yexaaConstant.Karna.name_TE[nn_karana];
    Karna.ino = nn_karana;

    // Masa uses Amanta system (changes at Amavasya - new moon, tithi 29→0)
    // masa.n_maasa is 1-based (1-12), convert to 0-based index (0-11)
    let amantaMasaIndex = masa.n_maasa - 1;

    // Handle negative indices by wrapping around (12 months)
    if (amantaMasaIndex < 0) {
      amantaMasaIndex += 12;
    }

    // Ensure index is within valid range (0-11)
    amantaMasaIndex = amantaMasaIndex % 12;

    Masa.ino = amantaMasaIndex;
    Masa.name = yexaaConstant.Masa.name[amantaMasaIndex] || '';
    Masa.name_TE = yexaaConstant.Masa.name_TE[amantaMasaIndex] || '';

    // MoonMasa uses Purnimanta system (changes at Pournami - full moon, tithi 14→15)
    // In Purnimanta, when tithi > 15 (Krishna Paksha), we're already in the NEXT lunar month
    let purnimantaMasaIndex = amantaMasaIndex;
    if (nn_tithi > 15) {
      // After Pournami (Krishna Paksha), advance to next month
      purnimantaMasaIndex = (amantaMasaIndex + 1) % 12;
    }

    MoonMasa.ino = purnimantaMasaIndex;
    MoonMasa.isLeapMonth = masa.is_leap_month;
    MoonMasa.name = yexaaConstant.Masa.name[purnimantaMasaIndex] || '';
    MoonMasa.name_TE = yexaaConstant.Masa.name_TE[purnimantaMasaIndex] || '';
    Ritu.ino = ritu;
    Ritu.name = yexaaConstant.Ritu.name[ritu];
    Ritu.name_TE = yexaaConstant.Ritu.name_TE[ritu];

    const solarLongitude = yexaaPanchangImpl.fix360(
      yexaaPanchangImpl.sun(sunsetTime) + ayanamsaAtSunset
    );

    // Get extras
    const ayana = getAyana(solarLongitude);
    const drikRitu = getDrikRitu(solarLongitude);

    // Calculate Telugu year based on Chaitra Shukla Padyami date for the year
    const teluguYear = this.getTeluguYearForDate(dt, lat, lng);

    // Convert string values to indices for array access
    const ayanaIndex = ayana === 'uttarayana' ? 0 : 1;
    const drikRituIndex = ['vasanta', 'grishma', 'varsha', 'sharad', 'hemanta', 'shishira'].indexOf(
      drikRitu
    );
    const teluguYearIndex = this.getTeluguYearIndex(new Date(dt).getFullYear(), true);

    return {
      Tithi,
      Paksha,
      Nakshatra,
      Yoga,
      Karna,
      Masa,
      MoonMasa,
      Raasi,
      Ritu,
      Gana,
      Guna,
      Trinity,
      ayana,
      drikRitu,
      teluguYear,
      ayanaIndex,
      drikRituIndex,
      teluguYearIndex,
    };
  }

  /**
   * Calculate calendar data at Pradosha time instead of sunrise
   * @param yexaaConstant - Local constant
   * @param dt - The date
   * @param lat - Latitude
   * @param lng - Longitude
   * @param height - Height (optional)
   * @returns Calendar data at Pradosha time
   */
  calendarAtPradosha(
    yexaaConstant: YexaaLocalConstant,
    dt: Date,
    lat: number,
    lng: number,
    height?: number
  ) {
    const Tithi: Record<string, string | number> = {};
    const Nakshatra: Record<string, string | number> = {};
    const Yoga: Record<string, string | number> = {};
    const Karna: Record<string, string | number> = {};
    const Masa: Record<string, string | number> = {};
    const MoonMasa: Record<string, string | number | boolean> = {};
    const Raasi: Record<string, string | number> = {};
    const Ritu: Record<string, string | number> = {};
    const Paksha: Record<string, string | number> = {};
    const Gana: Record<string, string | number> = {};
    const Guna: Record<string, string | number> = {};
    const Trinity: Record<string, string | number> = {};
    const yexaaPanchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const yexaaCalculateFunc = new YexaaCalculateFunc();

    // Calculate at Pradosha time instead of sunrise
    const pradoshaTime = this.getPradoshaTimeJd(dt, lat, lng, height);
    const nn_tithi = this.getCalendarTithi(pradoshaTime, yexaaPanchangImpl);
    const nn_paksha = yexaaCalculateFunc.getPaksha(nn_tithi);
    const ayanamsaAtPradosha = yexaaPanchangImpl.calcayan(pradoshaTime);
    const nn_naksh = this.getCalendarNakshatra(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      ayanamsaAtPradosha,
      pradoshaTime
    );
    const nn_yoga = this.getCalendarYoga(
      yexaaCalculateFunc,
      yexaaPanchangImpl,
      pradoshaTime,
      ayanamsaAtPradosha
    );
    const nn_karana = yexaaCalculateFunc.getKarana(
      yexaaPanchangImpl.moon(pradoshaTime),
      yexaaPanchangImpl.sun(pradoshaTime)
    )[0];
    const nn_raasi = this.getCalendarRaasi(
      yexaaPanchangImpl,
      yexaaPanchangImpl.sun(pradoshaTime),
      ayanamsaAtPradosha
    );

    const masa: { n_maasa: number; is_leap_month: boolean } = this.getMasa(
      yexaaPanchangImpl,
      nn_tithi,
      pradoshaTime
    );

    const ritu = this.getRitu(masa.n_maasa);

    Raasi.ino = nn_raasi - 1;
    Raasi.name_TE = yexaaConstant.Raasi.name_TE[nn_raasi - 1];
    Raasi.name = yexaaConstant.Raasi.name[nn_raasi - 1];
    Guna.ino = yexaaCalculateFunc.getRaasiGuna(Raasi.ino);
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name = yexaaConstant.Guna.name[Guna.ino];

    Tithi.name = yexaaConstant.Tithi.name[nn_tithi - 1];
    Tithi.name_TE = yexaaConstant.Tithi.name_TE[nn_tithi - 1];
    Tithi.ino = nn_tithi - 1;
    Paksha.ino = nn_paksha;
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name = yexaaConstant.Paksha.name[nn_paksha];
    Paksha.name_TE = yexaaConstant.Paksha.name_TE[nn_paksha];

    Nakshatra.name = yexaaConstant.Nakshatra.name[nn_naksh];
    Nakshatra.name_TE = yexaaConstant.Nakshatra.name_TE[nn_naksh];
    Nakshatra.ino = nn_naksh;
    Trinity.ino = yexaaCalculateFunc.getTrinityByNakshatra(Nakshatra.ino);
    Trinity.name_TE = yexaaConstant.Trinity.name_TE[Trinity.ino];
    Trinity.name = yexaaConstant.Trinity.name[Trinity.ino];
    Gana.ino = yexaaCalculateFunc.getGanaViaNakshatra(Nakshatra.ino);
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name = yexaaConstant.Gana.name[Gana.ino];

    Yoga.name = yexaaConstant.Yoga.name[nn_yoga];
    Yoga.name_TE = yexaaConstant.Yoga.name_TE[nn_yoga];
    Yoga.ino = nn_yoga;
    Karna.name = yexaaConstant.Karna.name[nn_karana];
    Karna.name_TE = yexaaConstant.Karna.name_TE[nn_karana];
    Karna.ino = nn_karana;

    // Masa uses Amanta system (changes at Amavasya - new moon, tithi 29→0)
    // masa.n_maasa is 1-based (1-12), convert to 0-based index (0-11)
    let amantaMasaIndex = masa.n_maasa - 1;

    // Handle negative indices by wrapping around (12 months)
    if (amantaMasaIndex < 0) {
      amantaMasaIndex += 12;
    }

    // Ensure index is within valid range (0-11)
    amantaMasaIndex = amantaMasaIndex % 12;

    Masa.ino = amantaMasaIndex;
    Masa.name = yexaaConstant.Masa.name[amantaMasaIndex] || '';
    Masa.name_TE = yexaaConstant.Masa.name_TE[amantaMasaIndex] || '';

    // MoonMasa uses Purnimanta system (changes at Pournami - full moon, tithi 14→15)
    // In Purnimanta, when tithi > 15 (Krishna Paksha), we're already in the NEXT lunar month
    let purnimantaMasaIndex = amantaMasaIndex;
    if (nn_tithi > 15) {
      // After Pournami (Krishna Paksha), advance to next month
      purnimantaMasaIndex = (amantaMasaIndex + 1) % 12;
    }

    MoonMasa.ino = purnimantaMasaIndex;
    MoonMasa.isLeapMonth = masa.is_leap_month;
    MoonMasa.name = yexaaConstant.Masa.name[purnimantaMasaIndex] || '';
    MoonMasa.name_TE = yexaaConstant.Masa.name_TE[purnimantaMasaIndex] || '';
    Ritu.ino = ritu;
    Ritu.name = yexaaConstant.Ritu.name[ritu];
    Ritu.name_TE = yexaaConstant.Ritu.name_TE[ritu];

    const solarLongitude = yexaaPanchangImpl.fix360(
      yexaaPanchangImpl.sun(pradoshaTime) + ayanamsaAtPradosha
    );

    // Get extras
    const ayana = getAyana(solarLongitude);
    const drikRitu = getDrikRitu(solarLongitude);

    // Calculate Telugu year based on Chaitra Shukla Padyami date for the year
    const teluguYear = this.getTeluguYearForDate(dt, lat, lng);

    // Convert string values to indices for array access
    const ayanaIndex = ayana === 'uttarayana' ? 0 : 1;
    const drikRituIndex = ['vasanta', 'grishma', 'varsha', 'sharad', 'hemanta', 'shishira'].indexOf(
      drikRitu
    );
    const teluguYearIndex = this.getTeluguYearIndex(new Date(dt).getFullYear(), true);

    return {
      Tithi,
      Paksha,
      Nakshatra,
      Yoga,
      Karna,
      Masa,
      MoonMasa,
      Raasi,
      Ritu,
      Gana,
      Guna,
      Trinity,
      Ayana: {
        name: yexaaConstant.Ayana.name[ayanaIndex],
        name_TE: yexaaConstant.Ayana.name_TE[ayanaIndex],
      },
      DrikRitu: {
        name: yexaaConstant.DrikRitu.name[drikRituIndex],
        name_TE: yexaaConstant.DrikRitu.name_TE[drikRituIndex],
      },
      TeluguYear: {
        name: yexaaConstant.TeluguYear.name[teluguYearIndex],
        name_TE: yexaaConstant.TeluguYear.name_TE[teluguYearIndex],
      },
    };
  }

  getSakaYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Saka calendar starts on March 22 (or March 21 in leap years)
    const isBeforeSakaStart = month < 3 || (month === 3 && day < 22);

    return isBeforeSakaStart ? year - 79 - 1 : year - 79;
  }

  getTeluguYearIndex(currentYear: number, isNewYearStarted: boolean): number {
    const baseYear = 1867;
    const offset = isNewYearStarted ? 0 : -1;
    return (currentYear + offset - baseYear + 60) % 60;
  }

  /**
   * Get Telugu year name for a given date using sunrise-based panchangam calculation
   * @param date - The date to get Telugu year for
   * @param lat - Latitude for sunrise calculation
   * @param lng - Longitude for sunrise calculation
   * @returns Telugu year name
   */
  getTeluguYearForDate(date: Date, lat: number = 17.385, lng: number = 78.4867): string {
    const currentYear = date.getFullYear();

    // Use the same sunrise-based approach as the main calendar method
    const yexaaConstant = new YexaaLocalConstant();
    const yexaaPanchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const yexaaSunMoonTimer = new YexaaSunMoonTimer();

    // Get sunrise for the input date
    const sunRise = yexaaSunMoonTimer.getSunRiseJd(date, lat, lng);
    const nn_tithi = this.getCalendarTithi(sunRise, yexaaPanchangImpl);
    const masa = this.getMasa(yexaaPanchangImpl, nn_tithi, sunRise);

    // Fix negative index issue for masa calculation
    let moonMasaIndex = masa.n_maasa - 2;
    if (moonMasaIndex < 0) {
      moonMasaIndex += 12;
    }
    moonMasaIndex = moonMasaIndex % 12;

    // Check if today's sunrise shows Chaitra Shukla Padyami or later
    const isChaitraMasa = moonMasaIndex === 11; // Chaitra is at index 11
    const isShuklaPackha = nn_tithi >= 1 && nn_tithi <= 15; // Shukla paksha
    const isPadyami = nn_tithi === 1; // Padyami is the first tithi

    // Check if we're on or after the start of Telugu new year
    let teluguCalendarYear;
    if (isChaitraMasa && isShuklaPackha && isPadyami) {
      // Today is exactly Chaitra Shukla Padyami - new year starts today
      teluguCalendarYear = currentYear;
    } else if (isChaitraMasa && isShuklaPackha && nn_tithi > 1) {
      // We're in Chaitra Shukla but after Padyami - new year has already started
      teluguCalendarYear = currentYear;
    } else {
      // Check if this year's Chaitra Shukla Padyami has already passed
      const thisYearPadyami = this.findTeluguNewYearStart(currentYear);
      const inputDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const padyamiDateOnly = new Date(
        thisYearPadyami.getFullYear(),
        thisYearPadyami.getMonth(),
        thisYearPadyami.getDate()
      );

      if (inputDateOnly >= padyamiDateOnly) {
        teluguCalendarYear = currentYear;
      } else {
        teluguCalendarYear = currentYear - 1;
      }
    }

    return getTeluguYearName(teluguCalendarYear);
  }

  /**
   * Find the date when Telugu New Year starts (Chaitra Shukla Padyami) for a given Gregorian year
   * @param year - Gregorian year
   * @returns Date object for Chaitra Shukla Padyami (Telugu New Year start)
   */
  findTeluguNewYearStart(year: number): Date {
    // Search in March-May range for Chaitra Shukla Padyami
    // Start from March 1st and check each day
    const startDate = new Date(year, 2, 1); // March 1st
    const endDate = new Date(year, 4, 31); // May 31st

    const yexaaConstant = new YexaaLocalConstant();
    const yexaaPanchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const yexaaCalculateFunc = new YexaaCalculateFunc();
    const yexaaSunMoonTimer = new YexaaSunMoonTimer();

    // Default coordinates (Hyderabad) if not specified
    const lat = 17.385;
    const lng = 78.4867;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      try {
        const sunRise = yexaaSunMoonTimer.getSunRiseJd(d, lat, lng);
        const nn_tithi = this.getCalendarTithi(sunRise, yexaaPanchangImpl);
        const masa = this.getMasa(yexaaPanchangImpl, nn_tithi, sunRise);

        // Fix negative index issue for masa calculation
        let moonMasaIndex = masa.n_maasa - 2;
        if (moonMasaIndex < 0) {
          moonMasaIndex += 12;
        }
        moonMasaIndex = moonMasaIndex % 12;

        // Check if this is Chaitra Shukla Padyami (Telugu New Year)
        const isChaitraMasa = moonMasaIndex === 11; // Chaitra is at index 11
        const isShuklaPackha = nn_tithi >= 1 && nn_tithi <= 15; // Shukla paksha
        const isPadyami = nn_tithi === 1; // Padyami is the first tithi

        if (isChaitraMasa && isShuklaPackha && isPadyami) {
          return new Date(d);
        }
      } catch (error) {
        // Continue searching if there's an error with this date
        continue;
      }
    }

    // Fallback: if not found, estimate based on previous patterns
    // Typically occurs in late March or early April
    const fallbackDate = new Date(year, 2, 30); // March 30th as fallback

    return fallbackDate;
  }

  // get tithi in (1-15) Sukla and (16-30) Krushna
  getCalendarTithi(sunRise: number, yexaaPanchangImpl: YexaaPanchangImpl) {
    const moonPhaseToday = yexaaPanchangImpl.lunarPhase(sunRise);
    const today = Math.ceil(moonPhaseToday / 12);
    let tithi = today;
    //check for skipped tithi
    const moonPhaseTommorow = yexaaPanchangImpl.lunarPhase(sunRise + 1);
    const tommorow = Math.ceil(moonPhaseTommorow / 12);
    const isSkipped = (tommorow - today) % 30 > 1;
    if (isSkipped) {
      tithi = today + 1;
    }
    return tithi;
  }

  getCalendarNakshatra(
    yexaaCalculateFunc: YexaaCalculateFunc,
    yexaaPanchangImpl: YexaaPanchangImpl,
    ayanamsa: number,
    sunRise: number
  ) {
    const nak_today = yexaaCalculateFunc.getNakshatra(
      yexaaPanchangImpl,
      yexaaPanchangImpl.moon(sunRise),
      ayanamsa
    );
    const nak_tmrw = yexaaCalculateFunc.getNakshatra(
      yexaaPanchangImpl,
      yexaaPanchangImpl.moon(sunRise + 1),
      yexaaPanchangImpl.calcayan(sunRise + 1)
    );
    let n_nak = nak_today;
    const isSkipped = (nak_tmrw - nak_today) % 27 > 1;
    if (isSkipped) {
      n_nak = nak_today + 1;
    }
    return n_nak;
  }

  getCalendarYoga(
    yexaaCalculateFunc: YexaaCalculateFunc,
    yexaaPanchangImpl: YexaaPanchangImpl,
    sunRise: number,
    ayanamsa: number
  ) {
    const todayYoga = yexaaCalculateFunc.getYoga(
      yexaaCalculateFunc.getZYoga(yexaaPanchangImpl, ayanamsa, sunRise)
    );
    const tmorowYoga = yexaaCalculateFunc.getYoga(
      yexaaCalculateFunc.getZYoga(
        yexaaPanchangImpl,
        yexaaPanchangImpl.calcayan(sunRise + 1),
        sunRise + 1
      )
    );
    let n_yoga = todayYoga;
    const isSkipped = (tmorowYoga - todayYoga) % 27 > 1;
    if (isSkipped) {
      n_yoga = todayYoga + 1;
    }
    return n_yoga;
  }

  getCalendarRaasi(yexaaPanchangImpl: YexaaPanchangImpl, Lsun: number, ayanamsa: number) {
    const solar_nirayana = yexaaPanchangImpl.fix360(Lsun + ayanamsa);
    return Math.ceil(solar_nirayana / 30);
  }

  getMasa(yexaaPanchangImpl: YexaaPanchangImpl, tithi: number, sunrise: number) {
    const lastNewMoon = sunrise - (tithi - 1);
    const nextNewMoon = sunrise + (29 - (tithi - 1));
    const currentSolarMonth = this.getCalendarRaasi(
      yexaaPanchangImpl,
      yexaaPanchangImpl.sun(lastNewMoon),
      yexaaPanchangImpl.calcayan(lastNewMoon)
    );
    const nextSolarMonth = this.getCalendarRaasi(
      yexaaPanchangImpl,
      yexaaPanchangImpl.sun(nextNewMoon),
      yexaaPanchangImpl.calcayan(nextNewMoon)
    );

    const is_leap_month = currentSolarMonth === nextSolarMonth;
    let n_maasa = is_leap_month ? currentSolarMonth : currentSolarMonth + 1;
    if (n_maasa > 12) {
      n_maasa = n_maasa % 12;
    }

    return { n_maasa, is_leap_month };
  }

  getRitu(masa_num: number): number {
    return Math.floor((masa_num - 1) / 2);
  }
}
