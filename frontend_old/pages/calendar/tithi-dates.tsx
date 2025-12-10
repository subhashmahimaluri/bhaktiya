'use client';
import Layout from '@/components/Layout/Layout';
import SocialShareButtons from '@/components/SocialShareButtons';
import TithiList from '@/components/TithiList';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import { interpolate } from '@/utils/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function Calendar() {
  const { t, locale } = useTranslation();
  const { title: defaultTitle, description: defaultDescription } = getMetaDataByPath(
    '/calendar',
    locale
  );
  const { lat, lng, city, country } = useLocation();
  const router = useRouter();
  const { slug, year: yearParam } = router.query;

  const getInitialYear = () => {
    if (yearParam && typeof yearParam === 'string') {
      const parsedYear = parseInt(yearParam);
      if (!isNaN(parsedYear)) {
        return parsedYear;
      }
    }
    return 2025; // Default to 2025
  };

  const [year, setYear] = useState(getInitialYear());

  useMemo(() => {
    if (yearParam && typeof yearParam === 'string') {
      const parsedYear = parseInt(yearParam);
      if (!isNaN(parsedYear) && parsedYear !== year) {
        setYear(parsedYear);
      }
    }
  }, [yearParam, year]);

  const seoTitle = useMemo(() => {
    return `${t.panchangam.tithi_list} ${year}`;
  }, [t.panchangam.tithi_list, year]);

  const seoDescription = useMemo(() => {
    return `${defaultDescription} for ${year}`;
  }, [defaultDescription, year]);

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <div className="container-fluid mt-10 py-5">
          <div className="row">
            <div className="col-12">
              <Row className="monthly-calendar g-4 mt-25 pt-5">
                {/* Calendar Grid - Left Side */}
                <Col xl={8} lg={8} md={12}>
                  <div className="calendar-grid telugu-calendar-v2 rounded bg-white p-4 shadow">
                    <div className="row justify-content-center">
                      <div className="col-12">
                        <div className="mb-4 text-center">
                          <h1>
                            {t.panchangam.tithi_list} {year}
                          </h1>
                          <p className="text-muted">
                            {t.panchangam.calender_desc ||
                              'Monthly view of Telugu Panchangam with daily astronomical information'}
                          </p>

                          {/* Social Share Buttons */}
                          <SocialShareButtons
                            url={typeof window !== 'undefined' ? window.location.href : ''}
                            title={`${t.panchangam.tithi_list} ${year}`}
                            description={`Tithi list for ${year}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start my-4 gap-2">
                      <Link
                        href={`/calendar/tithi-dates?year=${year - 1}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        ← {year - 1}
                      </Link>
                      <span className="fw-bold px-3">{year}</span>
                      <Link
                        href={`/calendar/tithi-dates?year=${year + 1}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        {year + 1} →
                      </Link>
                    </div>
                    <TithiList year={year} />
                    <div className="row justify-content-left">
                      <div className="col-12">
                        <div
                          className="mb-4"
                          dangerouslySetInnerHTML={{
                            __html: interpolate(t.calendar.tithi_list_content, { year }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Day Details Panel - Right Side */}
                <Col xl={4} lg={4} md={12}>
                  <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
                    <UpcomingEventsV2 />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Row>
    </Layout>
  );
}
