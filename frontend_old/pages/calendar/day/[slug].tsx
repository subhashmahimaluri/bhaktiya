import DailyCalendarRefactored from '@/components/DailyCalendarRefactored';
import Layout from '@/components/Layout/Layout';
import { useRouter } from 'next/router';
import { Row } from 'react-bootstrap';

export default function DayCalendarPage() {
  const router = useRouter();
  const slug = router.query.slug as string;

  // Show loading state while router is not ready
  if (!router.isReady) {
    return (
      <Layout>
        <Row className="mt-25 inner-page py-5">
          <div className="container-fluid mt-10 py-5">
            <div className="py-4 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </Row>
      </Layout>
    );
  }

  // Validate slug format (YYYY-MM-DD)
  if (!slug || !slug.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return (
      <Layout>
        <Row className="mt-25 inner-page py-5">
          <div className="container-fluid mt-10 py-5">
            <div className="py-4 text-center">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Invalid Date Format</h4>
                <p>Please provide a valid date in YYYY-MM-DD format.</p>
              </div>
            </div>
          </div>
        </Row>
      </Layout>
    );
  }

  return (
    <Layout>
      <Row className="mt-25 inner-page py-5">
        <div className="container-fluid mt-10 py-5">
          <div className="row">
            <div className="col-12">
              <DailyCalendarRefactored date={slug} />
            </div>
          </div>
        </div>
      </Row>
    </Layout>
  );
}
