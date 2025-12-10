import { useLocation } from '@/context/LocationContext';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateCalendarCellPanchangam } from '@/utils/calendarPanchangamData';
import { CalendarDay, formatTimeForDisplay, getPakshaPrefix } from '@/utils/monthlyCalendarUtils';
import { format, isSameDay } from 'date-fns';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface CalendarCellProps {
  day: CalendarDay | null;
  weekdayIndex: number;
  selectedDate: Date;
  locale: string;
  onDateClick: (date: Date) => void;
  priorityFestivalDates: Set<string>;
}

export default function CalendarCell({
  day,
  weekdayIndex,
  selectedDate,
  locale,
  onDateClick,
  priorityFestivalDates,
}: CalendarCellProps) {
  const { t } = useTranslation();
  const { lat, lng } = useLocation();
  const [enhancedApiPanchangData, setEnhancedApiPanchangData] = useState(day?.apiPanchangData);

  // Check if current day has a priority 1 festival using the passed-in Set
  const hasPriorityFestival = useMemo(() => {
    if (!day) return false;
    const dateStr = format(day.date, 'yyyy-MM-dd');
    return priorityFestivalDates.has(dateStr);
  }, [day, priorityFestivalDates]);

  // Get sunrise/sunset for this specific day
  const { sunrise, sunset } = useAstronomyBundle(day?.date);

  // Recalculate varjyam with correct sunrise/sunset data from useAstronomyBundle
  useEffect(() => {
    if (day?.apiPanchangData && lat && lng && sunrise && sunset) {
      // Recalculate with correct sunrise/sunset
      const updated = calculateCalendarCellPanchangam(day.date, lat, lng);
      if (updated) {
        setEnhancedApiPanchangData(updated);
      }
    } else {
      setEnhancedApiPanchangData(day?.apiPanchangData);
    }
  }, [day?.date, day?.apiPanchangData, lat, lng]);

  // Helper function to get localized text directly from objects like PanchangamTable does
  const getLocalizedText = (obj: any, teProperty: string, defaultProperty: string) => {
    if (!obj) return '';
    return locale === 'te' ? obj[teProperty] || '' : obj[defaultProperty] || '';
  };

  if (!day) {
    return (
      <td className="calendar-cell inactive-day">
        <div className="date-number">&nbsp;</div>
        <div className="date-detail">&nbsp;</div>
      </td>
    );
  }

  // Determine cell classes
  let cellClass = 'calendar-cell';
  if (!day.isCurrentMonth) {
    cellClass += ' previous-month-date inactive-day';
  }
  if (weekdayIndex === 0) {
    // Sunday
    cellClass += ' holiday-sunday';
  }
  // ... existing code ...
  if (hasPriorityFestival) {
    cellClass += ' holiday-imp-festival';
  }
  // Add active-day class if this cell is selected
  if (isSameDay(day.date, selectedDate)) {
    cellClass += ' active-day';
  }

  const handleCellClick = () => {
    onDateClick(day.date);
  };

  // Helper function to convert Date/string to time string for display
  const getEndTime = (endValue: any): string => {
    if (!endValue) return '';
    // If it's a Date object, convert to string first
    if (endValue instanceof Date) {
      const hours = String(endValue.getHours()).padStart(2, '0');
      const minutes = String(endValue.getMinutes()).padStart(2, '0');
      const seconds = String(endValue.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    // Otherwise assume it's already a string
    return String(endValue);
  };

  return (
    <td className={cellClass} onClick={handleCellClick} role="button" aria-haspopup="true">
      {enhancedApiPanchangData.tithi.name && (
        <div className="tithi-icon position-absolute start-0 top-0">
          {enhancedApiPanchangData.tithi.name === 'Pournami' ? (
            <Image
              src="/images/icons/pournami.png"
              alt="Pournami"
              className="tithi-icon-img"
              width={20}
              height={20}
            />
          ) : enhancedApiPanchangData.tithi.name === 'Amavasya' ? (
            <Image
              src="/images/icons/amavasya.png"
              alt="Amavasya"
              className="tithi-icon-img"
              width={20}
              height={20}
            />
          ) : (
            ''
          )}
        </div>
      )}
      <div className="date-number">{format(day.date, 'd')}</div>
      <div className="date-detail">
        {enhancedApiPanchangData ? (
          <>
            {/* Tithi line: S/K prefix + name + end time */}
            <div>
              {getPakshaPrefix(enhancedApiPanchangData.paksha?.name || '', locale)}{' '}
              {getLocalizedText(enhancedApiPanchangData.tithi, 'name_TE', 'name')}{' '}
              {formatTimeForDisplay(getEndTime(enhancedApiPanchangData.tithi?.end))}
            </div>
            {/* Nakshatra line: name + end time */}
            <div>
              {getLocalizedText(enhancedApiPanchangData.nakshatra, 'name_TE', 'name')}{' '}
              {formatTimeForDisplay(getEndTime(enhancedApiPanchangData.nakshatra?.end))}
            </div>
          </>
        ) : (
          <>
            <div>{locale === 'te' ? 'వ' : 'v'}</div>
          </>
        )}
      </div>
    </td>
  );
}
