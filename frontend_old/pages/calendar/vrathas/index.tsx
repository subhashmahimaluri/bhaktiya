import FestivalCard from '@/components/FestivalCard';
import Layout from '@/components/Layout/Layout';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import { VRATAS } from '@/utils/vratas';
import { Col, Row } from 'react-bootstrap';

export default function Vrathas() {
  const { t, locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/calendar/vrathas', locale);

  const currentYear = new Date().getFullYear();

  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-0 mt-2 text-center">
                  {t.panchangam.telugu_vrathas} {currentYear}
                </h1>
                <p className="text-center">{t.panchangam.telugu_vrathas_sub_title}</p>
              </div>
            </div>
            <Row className="mt-4">
              {VRATAS.map(vrata => (
                <FestivalCard key={vrata.name} festival={vrata} locale={locale} />
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
