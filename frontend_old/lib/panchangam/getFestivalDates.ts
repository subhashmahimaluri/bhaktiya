import { YexaaPanchang } from './yexaaPanchang';

// Function to get festival dates based on festival info
export function getFestivalDates(
  year: number,
  lunarMonth: number,
  tithiIno: number,
  lat: number,
  lng: number
) {
  const results: {
    tithi: {
      name: string;
      name_TE: string;
      ino: number;
      start: Date;
      end: Date;
    };
    paksha: {
      ino: number;
      name: string;
      name_TE: string;
    };
    masa: {
      ino: number;
      name: string;
      name_TE: string;
      isLeapMonth: boolean;
    };
  }[] = [];
  const panchang = new YexaaPanchang();

  // Start from a date that ensures we capture the target Tamil month
  // If we're looking for early Tamil months (1-3), we need to start from previous year
  // to account for the Hindu calendar year starting in March/April
  let currentDate: Date;
  const endDate = new Date(year + 1, 0, 1); // January 1 of next year

  if (lunarMonth >= 1 && lunarMonth <= 3) {
    // For early Tamil months (Chithirai, Vaikasi, Aani), start from previous year
    currentDate = new Date(year - 1, 0, 1); // January 1 of previous year
  } else {
    // For later Tamil months, start from current year
    currentDate = new Date(year, 0, 1); // January 1 of current year
  }

  // Target tithi (0-29)
  const targetTithi = tithiIno;

  // Convert lunar month (1-12) to 0-based index for comparison
  const targetMasaIno = (lunarMonth - 1 + 11) % 12; // Adjust for calendar offset

  while (currentDate < endDate) {
    try {
      // Calculate panchang for the current date
      const calculated = panchang.calculate(currentDate);
      const calendar = panchang.calendar(currentDate, lat, lng);

      // Check if this date has our target tithi
      if (calculated.Tithi && calculated.Tithi.ino === targetTithi) {
        // Check if the masa matches our target lunar month
        if (calendar.MoonMasa && calendar.MoonMasa.ino === targetMasaIno) {
          // Create result object
          const result = {
            tithi: {
              name: String(calculated.Tithi.name),
              name_TE: String(calculated.Tithi.name_TE),
              ino: Number(calculated.Tithi.ino),
              start: new Date(calculated.Tithi.start),
              end: new Date(calculated.Tithi.end),
            },
            paksha: {
              ino: Number(calculated.Paksha.ino),
              name: String(calculated.Paksha.name),
              name_TE: String(calculated.Paksha.name_TE),
            },
            masa: {
              ino: Number(calendar.MoonMasa.ino),
              name: String(calendar.MoonMasa.name),
              name_TE: String(calendar.MoonMasa.name_TE),
              isLeapMonth: Boolean(calendar.MoonMasa.isLeapMonth),
            },
          };

          results.push(result);

          // Skip ahead to avoid duplicates
          currentDate.setDate(currentDate.getDate() + 20);
          continue;
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    } catch (error) {
      // Move to next day on error
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Sort results by date
  results.sort((a, b) => {
    const dateA = new Date(a.tithi.start);
    const dateB = new Date(b.tithi.start);
    return dateA.getTime() - dateB.getTime();
  });

  return results;
}
