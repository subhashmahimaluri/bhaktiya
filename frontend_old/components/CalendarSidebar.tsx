import { getFirstSevenDaysSunsetData, getWeekdayNameFromIndex } from '@/utils/monthlyCalendarUtils';
import { getRahuKalam } from '@/utils/timeData';
import { useEffect, useState } from 'react';

interface CalendarSidebarProps {
  weekday: { en: string; te: string };
  weekdayIndex: number;
  locale: string;
  currentDate: any;
  lat: number;
  lng: number;
}

export default function CalendarSidebar({
  weekday,
  weekdayIndex,
  locale,
  currentDate,
  lat,
  lng,
}: CalendarSidebarProps) {
  const [sunData, setSunData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSunriseData = async () => {
      try {
        setLoading(true);
        const data = getFirstSevenDaysSunsetData(currentDate, lat, lng);
        setSunData(data);
      } catch (error) {
        console.error('Error fetching sunrise data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentDate && lat && lng) {
      fetchSunriseData();
    }
  }, [currentDate, lat, lng]);

  // Find the sun data for the current weekdayIndex
  const todaySunData = sunData.find(data => data.weekdayIndex === weekdayIndex);
  const sunriseTime = todaySunData ? todaySunData.sunrise : '--:--';
  const sunsetTime = todaySunData ? todaySunData.sunset : '--:--';

  // Get English weekday name for Rahu Kalam and Dur Muhurth calculations
  const englishWeekdayName = getWeekdayNameFromIndex(weekdayIndex);

  // Memoize calculations to prevent unnecessary re-calculations
  const rahuKalam = todaySunData ? getRahuKalam(sunriseTime, sunsetTime, englishWeekdayName) : null;

  return (
    <td className={`sidebar-cell ${weekdayIndex === 0 ? 'red-text' : ''}`}>
      <div className="week-day">{locale === 'te' ? weekday.te : weekday.en}</div>
      <div className="mt-1 text-xs font-normal text-gray-700">
        {/* Timing information for each day from API */}
        {(() => {
          const rahuDisplay = rahuKalam ? rahuKalam.rahu : '';

          if (locale === 'te') {
            return (
              <>
                <div>రా {rahuDisplay}</div>
              </>
            );
          } else {
            return (
              <>
                <div>R {rahuDisplay}</div>
              </>
            );
          }
        })()}
      </div>
    </td>
  );
}
