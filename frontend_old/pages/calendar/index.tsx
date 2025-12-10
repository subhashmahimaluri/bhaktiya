'use client';
import DayDetailsPanel from '@/components/DayDetailsPanel';
import Layout from '@/components/Layout/Layout';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import SocialShareButtons from '@/components/SocialShareButtons';
import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateMonthlyFestivals } from '@/utils/festivalsLoader';
import { getMetaDataByPath } from '@/utils/seo';
import { startOfMonth } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function Calendar() {
  const { t, locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/calendar', locale) as {
    title: string;
    description: string;
  };
  const { lat, lng, city, country } = useLocation();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  // Set today's date as the default selected date for the current month
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Don't redirect - show the current month on the index page
  // The calendar will display the current month data without changing URL

  // Calculate festivals for the current month using JavaScript only
  const [festivalsData, setFestivalsData] = useState<any>({ festivals: [] });
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [festivalsError, setFestivalsError] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchFestivals = async () => {
      setFestivalsLoading(true);
      setFestivalsError(false);

      try {
        const data = await calculateMonthlyFestivals(currentDate, lat, lng, '1');
        setFestivalsData(data);
      } catch (error) {
        console.error('Error fetching festivals:', error);
        setFestivalsError(true);
      } finally {
        setFestivalsLoading(false);
      }
    };

    fetchFestivals();
  }, [currentDate, lat, lng]);

  // Use the panchangam API for the selected date

  // Handle date change from MonthlyCalendar component
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle month change from MonthlyCalendar component
  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);

    // Check if the new month is the current month
    const today = new Date();
    const isCurrentMonth =
      date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    // Set selected date to today if it's the current month, otherwise to 1st of the month
    setSelectedDate(isCurrentMonth ? today : startOfMonth(date));

    // Don't navigate to a new URL - stay on the current page
    // The calendar will show the data for the selected month
  };

  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <div className="container-fluid mt-10 py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <Row className="monthly-calendar g-4 mt-25 pt-5">
                {/* Calendar Grid - Left Side */}
                <Col xl={8} lg={8} md={12}>
                  <div className="calendar-grid telugu-calendar-v2 rounded bg-white p-4 shadow">
                    <div className="row justify-content-center">
                      <div className="col-12">
                        <div className="mb-4 text-center">
                          <h1>
                            {t.panchangam.calendar || 'Calendar'} {new Date().getFullYear()}
                          </h1>
                          <p className="text-muted">
                            {t.panchangam.calender_desc ||
                              'Monthly view of Telugu Panchangam with daily astronomical information'}
                          </p>

                          {/* Social Share Buttons */}
                          <SocialShareButtons
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            title={`Calendar ${new Date().getFullYear()}`}
                            description="Monthly view of Telugu Panchangam with daily astronomical information"
                          />
                        </div>
                      </div>
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
