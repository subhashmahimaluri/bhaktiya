import FestivalCard from '@/components/FestivalCard';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function TopFestivals() {
  const router = useRouter();
  const { slug, year: yearParam } = router.query;
  const { t, locale } = useTranslation();
  const { city, timezone, country } = useLocation();
  const { title: defaultTitle, description: defaultDescription } = getMetaDataByPath(
    '/calendar/festivals',
    locale
  );

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
    return `${t.festivals.top_festivals} ${year}`;
  }, [t.festivals.top_festivals, year]);

  const seoDescription = useMemo(() => {
    return `${defaultDescription} for ${year}`;
  }, [defaultDescription, year]);

  const { festivals: priorityOneFestivals } = useAllFestivalsV2(
    year,
    undefined, // monthFilter
    [1], // priorityFilter - Only get priority 1 festivals
    undefined, // vrathaNameFilter
    undefined // calculationTypeFilter
  );

  console.log('priorityOneFestivals', priorityOneFestivals);

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0 mt-2 text-center">
                  {t.festivals.top_festivals} {year}
                </h1>
                <p className="text-center">{t.panchangam.telugu_festivals_sub_title}</p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${t.festivals.top_festivals} ${year}`}
              description={`Top festivals for ${year}`}
            />
            <Row className="align-items-center py-3">
              <Col lg="6" md="6" sm="12" className="mb-md-0 mb-4">
                <LocationAccordion city={city} country={country} />
              </Col>
              <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
                <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
                  <Link
                    href={`/calendar/festivals?year=${year - 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    ← {year - 1}
                  </Link>
                  <span className="fw-bold px-3">{year}</span>
                  <Link
                    href={`/calendar/festivals?year=${year + 1}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {year + 1} →
                  </Link>
                </div>
              </Col>
            </Row>
            <Row className="mt-4">
              {priorityOneFestivals.map((festivalOcc, idx) => (
                <FestivalCard key={idx} festival={festivalOcc} locale={locale} isDynamic={true} />
              ))}
            </Row>
          </div>
        </Col>

        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
            <UpcomingEventsV2 />
          </div>
        </Col>
      </Row>
    </Layout>
  );
}
