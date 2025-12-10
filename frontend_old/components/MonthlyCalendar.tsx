import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import {
  CalendarDay,
  generateCalendarDays,
  getMonthYearDisplay,
  getWeekdayNames,
} from '@/utils/monthlyCalendarUtils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import CalendarCell from './CalendarCell';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import LocationAccordion from './LocationAccordion';
import MonthlyFestivalsList from './MonthlyFestivalsList';

interface MonthlyCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  festivalsData: any;
  festivalsLoading: boolean;
  festivalsError: boolean;
  lat: number;
  lng: number;
  city: string;
  country: string;
  locale: string;
  t: any;
  onDateChange: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  navigateToDate?: boolean;
}

export default function MonthlyCalendar({
  currentDate,
  selectedDate,
  festivalsData,
  festivalsLoading,
  festivalsError,
  lat,
  lng,
  city,
  country,
  locale,
  t,
  onDateChange,
  onMonthChange,
  navigateToDate = false,
}: MonthlyCalendarProps) {
  const router = useRouter();
  const [calendarDays, setCalendarDays] = useState<CalendarDay[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get year from current date for festivals
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  // Call useAllFestivalsV2 hook once in parent component with priority 1 filter
  const { festivals: priorityOneFestivals } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    [1], // priorityFilter - Only get priority 1 festivals
    undefined, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  // Create a Set of date strings for quick lookup of priority 1 festival dates
  const priorityFestivalDates = useMemo(() => {
    const dateSet = new Set<string>();
    priorityOneFestivals.forEach(festivalOcc => {
      const dateStr = format(festivalOcc.date, 'yyyy-MM-dd');
      dateSet.add(dateStr);
    });
    return dateSet;
  }, [priorityOneFestivals]);

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);

    // If navigateToDate is true, navigate to the date-specific page
    if (navigateToDate) {
      const year = format(date, 'yyyy');
      const month = format(date, 'MM');
      const day = format(date, 'dd');
      const dateSlug = `${year}-${month}-${day}`;
      router.push(`/calendar/day/${dateSlug}`);
    }
  };

  // Load calendar data when month changes
  useEffect(() => {
    // Ensure we have valid coordinates, use defaults if not available
    const validLat = lat || 17.385044; // Default to Hyderabad
    const validLng = lng || 78.486671;

    setLoading(true);
    setError(null);

    try {
      const days = generateCalendarDays(currentDate, selectedDate, lat, lng);
      // Data is now pre-calculated with lat/lng in generateCalendarDays
      setCalendarDays(days);
    } catch (err) {
      setError('Failed to load calendar data');
      setCalendarDays([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, lat, lng, selectedDate]);

  const weekdays = getWeekdayNames();
  const { monthYear, monthYearTelugu } = getMonthYearDisplay(currentDate, locale, t);
  const maxWeeks = calendarDays.length > 0 ? Math.max(...calendarDays.map(row => row.length)) : 0;

  return (
    <>
      <CalendarHeader
        currentDate={currentDate}
        locale={locale}
        t={t}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        monthYear={monthYear}
        monthYearTelugu={monthYearTelugu}
      />

      {/* Location Accordion */}
      <div className="max-width-400 mb-4">
        <LocationAccordion city={city} country={country} />
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Traditional Telugu Panchangam Calendar (Table with Sidebar) */}
      <div className="calendar-container telugu-font">
        {loading ? (
          <div className="py-5 text-center">
            <div
              className="skeleton-text skeleton-text-lg mx-auto mb-3"
              style={{ width: '200px' }}
            ></div>
            <div
              className="skeleton-text skeleton-text-md mx-auto"
              style={{ width: '150px' }}
            ></div>
          </div>
        ) : (
          <div className="calendar-table-responsive">
            <table className="main-calendar-table">
              <tbody>
                {/* Map through weekdays to create rows */}
                {weekdays.map((weekday: any, weekdayIndex: any) => (
                  <tr key={weekdayIndex}>
                    {/* Sidebar cell with day name */}
                    <CalendarSidebar
                      weekday={weekday}
                      weekdayIndex={weekdayIndex}
                      locale={locale}
                      currentDate={currentDate}
                      lat={lat}
                      lng={lng}
                    />

                    {/* Calendar cells for each week */}
                    {Array.from({ length: maxWeeks }, (_, weekIndex) => (
                      <CalendarCell
                        key={weekIndex}
                        day={calendarDays[weekdayIndex]?.[weekIndex] || null}
                        weekdayIndex={weekdayIndex}
                        selectedDate={selectedDate}
                        locale={locale}
                        onDateClick={handleDateClick}
                        priorityFestivalDates={priorityFestivalDates}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-b py-3">
        <p className="bottom-helper-text">{t.panchangam.calender_guide_text}</p>
      </div>

      <MonthlyFestivalsList currentDate={currentDate} />
    </>
  );
}
