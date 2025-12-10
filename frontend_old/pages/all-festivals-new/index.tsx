'use client';
import Layout from '@/components/Layout/Layout';
import { NextPage } from 'next';
import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';

const AllFestivalsNewIndexPage: NextPage = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  return (
    <Layout>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-5">
                <div className="mb-4 text-center">
                  <h1 className="display-5 mb-3">Hindu Festivals Calendar V2</h1>
                  <p className="text-muted lead">
                    High-performance festival calendar with advanced filtering
                  </p>
                </div>

                <div className="text-center">
                  <h5 className="mb-4">Select a Year</h5>
                  <div className="d-grid gap-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    {years.map(year => (
                      <Link
                        key={year}
                        href={`/all-festivals-new/${year}`}
                        className={`btn ${year === currentYear ? 'btn-primary' : 'btn-outline-primary'} btn-lg`}
                      >
                        {year} {year === currentYear && '(Current Year)'}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-light mt-5 rounded p-4">
                  <h6 className="mb-3">Features:</h6>
                  <ul className="mb-0">
                    <li>⚡ High-performance direct tithi lookup (no iterations)</li>
                    <li>🔍 Advanced filtering by month, priority, vratha type</li>
                    <li>🌅 Sunrise/Sunset/Moonrise based calculations</li>
                    <li>📅 Includes Sankranthi, Bhogi, Kanuma</li>
                    <li>🌙 Adhik Masa (leap month) support</li>
                    <li>📍 Location-based accurate timings</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AllFestivalsNewIndexPage;
