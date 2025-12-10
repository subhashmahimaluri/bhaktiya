import { YexaaPanchang } from '@/lib/panchangam';

interface AngaEntry {
  name: string;
  start: Date;
  end: Date;
  ino: number;
  paksha?: string; // For tithi entries
  masa?: string | Number; // For tithi entries
  masa_te?: string; // For tithi entries
}

export const getAllAngasForDay = (
  date: Date,
  lat: number,
  lng: number,
  angaType: 'tithi' | 'nakshatra' | 'yoga' | 'karana'
): AngaEntry[] => {
  const panchang = new YexaaPanchang();
  const angas: AngaEntry[] = [];

  // Calculate angas for a 48-hour window to catch overlapping angas
  const startDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  // Check every 6 hours to catch all possible angas
  for (
    let checkDate = startDate;
    checkDate <= endDate;
    checkDate.setHours(checkDate.getHours() + 6)
  ) {
    try {
      const calculated = panchang.calculate(new Date(checkDate));
      let angaData;
      switch (angaType) {
        case 'tithi':
          angaData = calculated.Tithi;
          break;
        case 'nakshatra':
          angaData = calculated.Nakshatra;
          break;
        case 'yoga':
          angaData = calculated.Yoga;
          break;
        case 'karana':
          angaData = calculated.Karna;
          break;
        default:
          continue;
      }

      if (angaData) {
        const angaEntry: AngaEntry = {
          name: String(angaData.name || ''),
          start: new Date(angaData.start),
          end: new Date(angaData.end),
          ino: Number(angaData.ino),
        };

        // Validate anga duration - filter out unreasonably long angas (likely calculation errors)
        // Tithis normally last ~19-26 hours, nakshatras ~23-27 hours
        // Allow up to 3 days (72 hours) as maximum reasonable duration
        const durationMs = angaEntry.end.getTime() - angaEntry.start.getTime();
        const maxDurationMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationMs > maxDurationMs) {
          // Skip this anga - likely has incorrect end time from calculation bug
          console.log(
            `Skipping ${angaType} "${angaEntry.name}" - duration too long: ${durationHours.toFixed(1)} hours (${angaEntry.start.toLocaleString()} to ${angaEntry.end.toLocaleString()})`
          );
          continue;
        }

        // Add paksha information for tithi
        if (angaType === 'tithi' && calculated.Paksha) {
          angaEntry.paksha = String(calculated.Paksha.name || '');
        }

        if (angaType === 'tithi' && calculated.Masa) {
          angaEntry.masa = calculated.Masa.name || '';
          angaEntry.masa_te = String(calculated.Masa.name_TE) || '';
        }

        // Avoid duplicates by checking if we already have this exact anga
        const isDuplicate = angas.some(
          existing =>
            existing.ino === angaEntry.ino &&
            Math.abs(existing.start.getTime() - angaEntry.start.getTime()) < 60000 // within 1 minute
        );

        if (!isDuplicate) {
          angas.push(angaEntry);
        }
      }
    } catch (err) {}
  }

  // Sort by start time
  return angas.sort((a, b) => a.start.getTime() - b.start.getTime());
};
