import Layout from '@/components/Layout/Layout';
import { useLocation } from '@/context/LocationContext';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaTithiCalculate } from '@/lib/panchangam/yexaaTithiCalculate';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';

const localConstant = new YexaaLocalConstant();
const tithiCalculator = new YexaaTithiCalculate();

interface TithiBoundary {
  tithiName: string;
  tithiIno: number;
  paksha: string;
  startTime: Date;
  endTime: Date;
  masaName: string;
  masaIno: number;
  isLeapMonth: boolean;
}

const GetAllBoundariesByYear: NextPage = () => {
  const router = useRouter();
  const { lat, lng, city, country, timezone } = useLocation();

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [boundaries, setBoundaries] = useState<TithiBoundary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Generate year options from 2021 to 2030
  const yearOptions = [];
  for (let year = 2021; year <= 2030; year++) {
    yearOptions.push(year);
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setBoundaries([]);

    try {
      // Use the new fast method - single call gets ALL tithis in the year!
      const tithiResults = tithiCalculator.getAllTithiBoundariesInYear(selectedYear, lat, lng);

      const allBoundaries: TithiBoundary[] = tithiResults.map(result => {
        const { tithiIno, startTime, endTime, masaIno, isLeapMonth } = result;

        // Get tithi name with paksha prefix
        const tithiBaseName =
          localConstant.Tithi.name_TE[tithiIno].charAt(0).toUpperCase() +
          localConstant.Tithi.name_TE[tithiIno].slice(1);

        let tithiName = '';
        if (tithiIno === 14) {
          tithiName = tithiBaseName;
        } else if (tithiIno === 29) {
          tithiName = tithiBaseName;
        } else if (tithiIno < 15) {
          tithiName = `Shukla ${tithiBaseName}`;
        } else {
          tithiName = `Krishna ${tithiBaseName}`;
        }

        const paksha = tithiIno < 15 ? 'శుక్ల' : tithiIno > 14 ? 'కృష్ణ' : '';

        // Get masa name
        const masaName = localConstant.Masa.name_TE[masaIno] || 'Unknown';

        return {
          tithiName,
          tithiIno,
          paksha,
          startTime,
          endTime,
          masaName,
          masaIno,
          isLeapMonth,
        };
      });

      setBoundaries(allBoundaries);

      if (allBoundaries.length === 0) {
        setError('No tithis found for the selected year');
      }
    } catch (err) {
      setError('Error calculating tithi boundaries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Get All Tithi Boundaries by Year"
      description="View all tithis in a specific year"
    >
      <Row className="mt-25 inner-page py-5">
        <Col xl="12" lg="12" md="12" className="mt-5 pt-5">
          <h1 className="mb-4">All Tithi Boundaries by Year</h1>

          {/* Search Form */}
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Select
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                      >
                        {yearOptions.map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>&nbsp;</Form.Label>
                      <div>
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                              <span className="ms-2">Calculating...</span>
                            </>
                          ) : (
                            'Get All Tithis'
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Alert variant="info" className="mb-0">
                      <strong>Location:</strong> {city}, {country} (Lat: {lat.toFixed(4)}, Lng:{' '}
                      {lng.toFixed(4)})
                    </Alert>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Results Table */}
          {boundaries.length > 0 && (
            <Card>
              <Card.Header as="h5">
                All Tithis in {selectedYear} (Total: {boundaries.length})
              </Card.Header>
              <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Table striped bordered hover responsive>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                    <tr>
                      <th>#</th>
                      <th>Tithi INO</th>
                      <th>Tithi Name</th>
                      <th>Paksha</th>
                      <th>Masa</th>
                      <th>Leap Month</th>
                      <th>Starts</th>
                      <th>Ends</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boundaries.map((boundary, index) => (
                      <tr
                        key={index}
                        style={{ backgroundColor: boundary.isLeapMonth ? '#fff3cd' : 'inherit' }}
                      >
                        <td>{index + 1}</td>
                        <td>{boundary.tithiIno}</td>
                        <td>{boundary.tithiName}</td>
                        <td>{boundary.paksha}</td>
                        <td>{boundary.masaName}</td>
                        <td>{boundary.isLeapMonth ? '✓ అధిక' : ''}</td>
                        <td>{boundary.startTime.toString()}</td>
                        <td>{boundary.endTime.toString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="my-5 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Calculating all tithis for {selectedYear}...</p>
              <p className="text-muted">This may take a few seconds...</p>
            </div>
          )}
        </Col>
      </Row>
    </Layout>
  );
};

export default GetAllBoundariesByYear;
