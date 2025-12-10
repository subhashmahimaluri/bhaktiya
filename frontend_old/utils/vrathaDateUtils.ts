export const formatTime = (time: string | number): string => {
  if (!time) return 'N/A';

  // If time is a number (hours), convert to time string
  if (typeof time === 'number') {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return time;
};

export const formatDate = (dateStr: string, locale: string, t: any): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // For Telugu locale, use custom translation
  if (locale === 'te') {
    const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
    const monthIndex = date.getMonth(); // 0 = January, 11 = December

    // Get Telugu translations for days and months
    const days = [
      t.panchangam.sunday,
      t.panchangam.monday,
      t.panchangam.tuesday,
      t.panchangam.wednesday,
      t.panchangam.thursday,
      t.panchangam.friday,
      t.panchangam.saturday,
    ];

    const months = [
      t.panchangam.january,
      t.panchangam.february,
      t.panchangam.march,
      t.panchangam.april,
      t.panchangam.may,
      t.panchangam.june,
      t.panchangam.july,
      t.panchangam.august,
      t.panchangam.september,
      t.panchangam.october,
      t.panchangam.november,
      t.panchangam.december,
    ];

    return `${days[weekday]}, ${months[monthIndex]} ${day}, ${year}`;
  }

  // For other locales, use built-in localization
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (
  dateStr: string,
  timeStr: string | number,
  locale: string
): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  let date = new Date(year, month - 1, day);

  // Always use English month names (Jan, Feb, etc.) regardless of locale
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Handle time formatting - convert 24h to 12h AM/PM and remove seconds
  let formattedTime = 'N/A';
  let dateIncrement = 0;

  if (timeStr) {
    if (typeof timeStr === 'number') {
      // Handle numeric time (hours as decimal)
      const hours = Math.floor(timeStr);
      const minutes = Math.round((timeStr - hours) * 60);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else if (typeof timeStr === 'string') {
      // Check for "+1" suffix and increment date
      const hasDateIncrement = timeStr.includes('(+1)');
      if (hasDateIncrement) {
        dateIncrement = 1;
      }

      // Remove any "+1" suffix and convert 24h to 12h AM/PM
      let cleanTimeStr = timeStr.replace(/\s*\(\+\d+\)\s*/, '').trim();

      // Handle HH:MM:SS format
      if (cleanTimeStr.includes(':')) {
        const timeParts = cleanTimeStr.split(':').map(part => parseInt(part, 10));
        let hours = timeParts[0];
        const minutes = timeParts[1];

        // Handle date rollover (hours >= 24)
        if (hours >= 24) {
          hours = hours - 24;
          dateIncrement += 1; // Also increment date for hours >= 24
        }

        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      } else {
        // Fallback to original formatTime for other string formats
        formattedTime = formatTime(timeStr);
      }
    }
  }

  // Apply date increment if needed
  if (dateIncrement > 0) {
    date = new Date(date.getTime() + dateIncrement * 24 * 60 * 60 * 1000);
  }

  const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;
  return `${formattedDate}, ${formattedTime}`;
};
