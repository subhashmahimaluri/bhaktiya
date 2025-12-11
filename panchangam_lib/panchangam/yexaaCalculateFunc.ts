import { YexaaLocalConstant } from './yexaaLocalConstant';
import { YexaaPanchangImpl } from './yexaaPanchangImpl';

export class YexaaCalculateFunc {
  calculate(d: Date, yexaaConstant: YexaaLocalConstant) {
    const panchangImpl = new YexaaPanchangImpl(yexaaConstant);
    const Day: Record<string, string | number> = {};
    const Masa: Record<string, string | number> = {};
    const Tithi: Record<string, string | number | Date> = {};
    const Paksha: Record<string, string | number> = {};
    const Nakshatra: Record<string, string | number | Date> = {};
    const Karna: Record<string, string | number | Date> = {};
    const Yoga: Record<string, string | number | Date> = {};
    const Ayanamsa: Record<string, string | number> = {};
    const Raasi: Record<string, string | number> = {};
    const Julian: Record<string, number> = {};
    const Gana: Record<string, string | number> = {};
    const Guna: Record<string, string | number> = {};
    const Trinity: Record<string, string | number> = {};

    let n_tithi = 1,
      n_naksh = 1,
      n_karana = 0;
    //const yexaaPanchangImpl = new YexaaPanchangImpl();

    const day = d.getDate();
    const mon = d.getMonth() + 1;
    const year = d.getFullYear();
    let hr = d.getHours();
    hr += d.getMinutes() / 60;
    const tzone = (d.getTimezoneOffset() / 60) * -1;

    let inpmin: number | string = Math.floor(d.getMinutes());
    if (inpmin < 10) inpmin = '0' + inpmin;

    // Julian date in local p. LT:
    const dayhr = day + hr / 24;
    const jdlt = panchangImpl.mdy2julian(mon, dayhr, year);

    // Day:
    const n_wday = panchangImpl.weekDay(jdlt);
    Day.ino = n_wday;
    Day.name = yexaaConstant.Day.name[n_wday];
    Day.name_TE = yexaaConstant.Day.name_TE[n_wday];

    // julian day at the begining of the day
    const jd0 = panchangImpl.mdy2julian(mon, day, year);
    const jdut = jd0 + (hr - tzone) / 24;
    panchangImpl.dt = panchangImpl.dTime(jdut);
    const jd = jdut + panchangImpl.dt / 24;

    //ayyanamsa
    panchangImpl.ayanamsa = panchangImpl.calcayan(jd);

    // Logitudinal Moon
    panchangImpl.Lmoon = panchangImpl.moon(jd);

    // Logitudinal Sun
    panchangImpl.Lsun = panchangImpl.sun(jd);

    // yoga:
    const zyoga = this.getZYoga(panchangImpl, panchangImpl.ayanamsa, jd);
    const n_yoga = this.getYoga(zyoga);
    const s_yoga = panchangImpl.yoga(jd, zyoga, tzone);

    // Nakstra
    n_naksh = this.getNakshatra(panchangImpl, panchangImpl.Lmoon, panchangImpl.ayanamsa);
    const s_naksh = panchangImpl.nakshatra(jd, n_naksh, tzone);

    // tithi
    n_tithi = this.getTithi(panchangImpl.Lmoon, panchangImpl.Lsun);
    const s_tithi = panchangImpl.tithi(jd, n_tithi, tzone, 12);

    // paksha
    const n_paksha = this.getPaksha(n_tithi + 1);

    // Karana
    const KaranaArray = this.getKarana(panchangImpl.Lmoon, panchangImpl.Lsun);
    n_karana = KaranaArray[0];
    const nk = KaranaArray[1];
    const s_karana = panchangImpl.tithi(jd, nk, tzone, 6);

    const z = this.getRaasi(panchangImpl, panchangImpl.Lmoon, panchangImpl.ayanamsa);

    Ayanamsa.name = panchangImpl.lon2dms(panchangImpl.ayanamsa);
    Raasi.name = yexaaConstant.Raasi.name[z];
    Raasi.ino = z;
    Raasi.name_TE = yexaaConstant.Raasi.name_TE[z];

    Guna.ino = this.getRaasiGuna(Raasi.ino);
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name_TE = yexaaConstant.Guna.name_TE[Guna.ino];
    Guna.name = yexaaConstant.Guna.name[Guna.ino];

    Nakshatra.name = yexaaConstant.Nakshatra.name[n_naksh];
    Nakshatra.name_TE = yexaaConstant.Nakshatra.name_TE[n_naksh];
    Nakshatra.ino = n_naksh;
    Nakshatra.start = s_naksh.start;
    Nakshatra.end = s_naksh.end;

    Trinity.ino = this.getTrinityByNakshatra(Nakshatra.ino);
    Trinity.name_TE = yexaaConstant.Trinity.name_TE[Trinity.ino];
    Trinity.name = yexaaConstant.Trinity.name[Trinity.ino];
    Gana.ino = this.getGanaViaNakshatra(Nakshatra.ino);
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name_TE = yexaaConstant.Gana.name_TE[Gana.ino];
    Gana.name = yexaaConstant.Gana.name[Gana.ino];

    Karna.name = yexaaConstant.Karna.name[n_karana];
    Karna.name_TE = yexaaConstant.Karna.name_TE[n_karana];
    Karna.ino = n_karana;
    Karna.start = s_karana.start;
    Karna.end = s_karana.end;
    Yoga.name = yexaaConstant.Yoga.name[n_yoga];
    Yoga.name_TE = yexaaConstant.Yoga.name_TE[n_yoga];
    Yoga.ino = n_yoga;
    Yoga.start = s_yoga.start;
    Yoga.end = s_yoga.end;
    Tithi.name = yexaaConstant.Tithi.name[n_tithi];
    Tithi.name_TE = yexaaConstant.Tithi.name_TE[n_tithi];
    Tithi.ino = n_tithi;
    Tithi.start = s_tithi.start;
    Tithi.end = s_tithi.end;

    Paksha.ino = n_paksha;
    Paksha.name = yexaaConstant.Paksha.name[n_paksha];
    Paksha.name = yexaaConstant.Paksha.name[n_paksha];
    Paksha.name_TE = yexaaConstant.Paksha.name_TE[n_paksha];

    Julian.date = jd;
    Julian.day = Math.floor(jd);

    // Calculate Masa (lunar month)
    const masaResult = this.getMasa(panchangImpl, n_tithi + 1, jd);
    let amantaMasaIndex = masaResult.n_maasa - 1;

    // Handle negative indices by wrapping around (12 months)
    if (amantaMasaIndex < 0) {
      amantaMasaIndex += 12;
    }

    // Ensure index is within valid range (0-11)
    amantaMasaIndex = amantaMasaIndex % 12;

    Masa.ino = amantaMasaIndex;
    Masa.name = yexaaConstant.Masa.name[amantaMasaIndex] || '';
    Masa.name_TE = yexaaConstant.Masa.name_TE[amantaMasaIndex] || '';

    return {
      Day,
      Tithi,
      Paksha,
      Nakshatra,
      Karna,
      Yoga,
      Ayanamsa,
      Raasi,
      Julian,
      Gana,
      Guna,
      Trinity,
      Masa,
    };
  }

  getTithi(Lmoon: number, Lsun: number) {
    if (Lmoon < Lsun) Lmoon += 360;
    return Math.floor((Lmoon - Lsun) / 12);
  }

  getNakshatra(yexaaPanchangImpl: YexaaPanchangImpl, Lmoon: number, ayanamsa: number) {
    const Lmoon0 = yexaaPanchangImpl.fix360(Lmoon + ayanamsa);
    return Math.floor((Lmoon0 * 6) / 80);
  }

  getZYoga(yexaaPanchangImpl: YexaaPanchangImpl, ayanamsa: number, jd: number) {
    yexaaPanchangImpl.moon(jd);
    yexaaPanchangImpl.sun(jd);
    const dmoonYoga = yexaaPanchangImpl.LmoonYoga + ayanamsa - 491143.07698973856;
    const dsunYoga = yexaaPanchangImpl.LsunYoga + ayanamsa - 36976.91240579201;

    return dmoonYoga + dsunYoga;
  }

  getYoga(zyoga: number) {
    let n_yoga = (zyoga * 6) / 80;
    while (n_yoga < 0) n_yoga += 27;
    while (n_yoga > 27) n_yoga -= 27;

    return Math.floor(n_yoga);
  }

  getKarana(Lmoon0: number, Lsun0: number) {
    let n_karana = 0,
      nk = 0;
    if (Lmoon0 < Lsun0) Lmoon0 += 360;
    nk = Math.floor((Lmoon0 - Lsun0) / 6);
    if (nk === 0) n_karana = 10;
    if (nk >= 57) n_karana = nk - 50;
    if (nk > 0 && nk < 57) n_karana = nk - 1 - Math.floor((nk - 1) / 7) * 7;
    return [n_karana, nk];
  }

  getRaasi(yexaaPanchangImpl: YexaaPanchangImpl, Lmoon: number, ayanamsa: number) {
    return Math.floor(Math.abs(yexaaPanchangImpl.fix360(Lmoon + ayanamsa)) / 30);
  }

  getPaksha(n_tithi: number): number {
    return n_tithi > 15 ? 1 : 0;
  }

  getRaasiGuna(raasiIndex: number) {
    return raasiIndex % 3;
  }

  getTrinityByNakshatra(raasiIndex: number) {
    return Math.floor(raasiIndex / 9);
  }

  getGanaViaNakshatra(raasiIndex: number) {
    const ganaPostions = [
      0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0,
    ];
    return ganaPostions[raasiIndex];
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

  getCalendarRaasi(yexaaPanchangImpl: YexaaPanchangImpl, Lsun: number, ayanamsa: number) {
    const solar_nirayana = yexaaPanchangImpl.fix360(Lsun + ayanamsa);
    return Math.ceil(solar_nirayana / 30);
  }
}
