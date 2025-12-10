'use client';
import DayDetailsPanel from '@/components/DayDetailsPanel';
import Layout from '@/components/Layout/Layout';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import SocialShareButtons from '@/components/SocialShareButtons';
import { useLocation } from '@/context/LocationContext';
import { useFestivalsApi } from '@/hooks/useFestivalsApi';
import { useTranslation } from '@/hooks/useTranslation';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function CalendarPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, locale } = useTranslation();
  const { lat, lng, city, country } = useLocation();
  const router = useRouter();

  // Parse the slug to get the initial date, or use current date as fallback
  const getInitialDate = () => {
    if (slug) {
      try {
        // Check if it's a date format (DD-MM-YYYY)
        if (slug.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = slug.split('-').map(Number);
          const date = new Date(year, month - 1, day);

          // Validate the date
          if (
            isNaN(date.getTime()) ||
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year
          ) {
            console.error('Invalid date in slug, using current date');
            return new Date();
          }

          return date;
        }

        // Parse the slug in monthName-YYYY format (e.g., "september-2025")
        const [monthName, year] = slug.split('-');
        const monthNames = [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ];
        const monthIndex = monthNames.indexOf(monthName.toLowerCase());

        if (monthIndex === -1) {
          console.error('Invalid month name in slug, using current date');
          return new Date();
        }

        // Create a date with the first day of the specified month
        const date = new Date(Number(year), monthIndex, 1);
        return date;
      } catch (error) {
        console.error('Invalid slug format, using current date:', error);
        return new Date();
      }
    }
    return new Date();
  };

  const initialDate = getInitialDate();
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Check if the initial month is the current month
  const today = new Date();
  const isCurrentMonth =
    initialDate.getMonth() === today.getMonth() &&
    initialDate.getFullYear() === today.getFullYear();

  // Set selected date to today if it's the current month, otherwise to 1st of the month
  const [selectedDate, setSelectedDate] = useState(
    isCurrentMonth ? today : startOfMonth(initialDate)
  );

  // Update the currentDate when slug changes
  useEffect(() => {
    if (slug) {
      const newDate = getInitialDate();
      setCurrentDate(newDate);

      // Check if the new month is the current month
      const isCurrentMonth =
        newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear();

      // Set selected date to today if it's the current month, otherwise to 1st of the month
      setSelectedDate(isCurrentMonth ? today : startOfMonth(newDate));
    }
  }, [slug]);

  // Use the new festivals API hook for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const {
    data: festivalsData,
    isLoading: festivalsLoading,
    isError: festivalsError,
    error: festivalsApiError,
  } = useFestivalsApi({
    startDate: monthStart,
    endDate: monthEnd,
  });

  // Redirect date-specific slugs to the day route
  if (slug && slug.match(/^\d{2}-\d{2}-\d{4}$/)) {
    if (typeof window !== 'undefined') {
      window.location.href = `/calendar/day/${slug}`;
    }
    return <div>Redirecting...</div>;
  }

  // Show loading state while slug is being processed
  if (slug && !currentDate) return <div>Loading...</div>;

  // Handle date change from MonthlyCalendar component
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle month change from MonthlyCalendar component
  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);

    // Check if the new month is the current month
    const isCurrentMonth =
      date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    // Set selected date to today if it's the current month, otherwise to 1st of the month
    setSelectedDate(isCurrentMonth ? today : startOfMonth(date));

    // Don't navigate to a new URL - stay on the current slug page
    // The calendar will show the data for the selected month
  };

  return (
    <Layout>
      <Row className="mt-25 inner-page py-5">
        <div className="container-fluid mt-10 py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <Row className="monthly-calendar g-4 mt-25 py-5">
                {/* Calendar Grid - Left Side */}
                <Col xl={8} lg={8} md={12}>
                  <div className="calendar-grid telugu-calendar-v2 rounded bg-white p-4 shadow">
                    {/* Title */}
                    <div className="mb-4 text-center">
                      <h1>
                        {slug?.match(/^\d{2}-\d{2}-\d{4}$/)
                          ? currentDate.toLocaleDateString(locale === 'te' ? 'te-IN' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : currentDate.toLocaleDateString(locale === 'te' ? 'te-IN' : 'en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                      </h1>
                      <p className="text-muted">
                        {slug?.match(/^\d{2}-\d{2}-\d{4}$/)
                          ? 'Daily view of Telugu Panchangam'
                          : 'Monthly view of Telugu Panchangam'}
                      </p>

                      {/* Social Share Buttons */}
                      <SocialShareButtons
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        title={`Calendar ${currentDate.getFullYear()}`}
                        description={
                          slug?.match(/^\d{2}-\d{2}-\d{4}$/)
                            ? 'Daily view of Telugu Panchangam with detailed astronomical information'
                            : 'Monthly view of Telugu Panchangam with daily astronomical information'
                        }
                      />
                    </div>

                    <MonthlyCalendar
                      currentDate={currentDate}
                      selectedDate={selectedDate}
                      festivalsData={festivalsData}
                      festivalsLoading={festivalsLoading}
                      festivalsError={festivalsError}
                      lat={lat}
                      lng={lng}
                      city={city}
                      country={country}
                      locale={locale}
                      t={t}
                      onDateChange={handleDateChange}
                      onMonthChange={handleMonthChange}
                      navigateToDate={true}
                    />
                  </div>
                </Col>

                {/* Day Details Panel - Right Side */}
                <Col xl={4} lg={4} md={12}>
                  <DayDetailsPanel selectedDate={selectedDate} locale={locale} t={t} />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Row>
    </Layout>
  );
}
