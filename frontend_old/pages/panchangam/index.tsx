'use client';
import Layout from '@/components/Layout/Layout';
import PanchangamTable from '@/components/PanchangamTable';
import SocialShareButtons from '@/components/SocialShareButtons';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useTranslation } from '@/hooks/useTranslation';
import { getMetaDataByPath } from '@/utils/seo';
import { Col, Row } from 'react-bootstrap';

export default function PanchangamPage() {
  const { locale } = useTranslation();
  const { title, description } = getMetaDataByPath('/panchangam', locale);

  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="panchangam-container">
            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={title}
              description={description}
            />

            <PanchangamTable />
          </div>
        </Col>
        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
            <UpcomingEventsV2 isHomePage={true} maxHeight={500} maxEvents={10} />
          </div>
        </Col>
      </Row>
    </Layout>
  );
}
