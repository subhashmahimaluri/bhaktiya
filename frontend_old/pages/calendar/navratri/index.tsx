import FestivalCard from '@/components/FestivalCard';
import Layout from '@/components/Layout/Layout';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { NAVRATRI } from '@/utils/navratri';
import { getMetaDataByPath } from '@/utils/seo';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

export default function Vrathas() {
  const { t, locale } = useTranslation();
  const { title: defaultTitle, description: defaultDescription } = getMetaDataByPath(
    '/calendar/vrathas',
    locale
  );
  const router = useRouter();
  const { year: yearParam } = router.query;

  const currentYear = new Date().getFullYear();
  const year = yearParam ? parseInt(yearParam as string, 10) : currentYear;

  const seoTitle = useMemo(() => {
    return `${t.panchangam.navratri} ${year}`;
  }, [t.panchangam.navratri, year]);

  const seoDescription = useMemo(() => {
    return `${defaultDescription} for ${year}`;
  }, [defaultDescription, year]);

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0 mt-2 text-center">
                  {t.panchangam.navratri} {currentYear}
                </h1>
                <p className="text-center">{t.panchangam.navratri_sub_title}</p>
              </div>
            </div>
            <Row className="mt-4">
              {NAVRATRI.map(navratri => (
                <FestivalCard key={navratri.name} festival={navratri} locale={locale} />
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
