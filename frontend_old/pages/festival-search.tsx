import Layout from '@/components/Layout/Layout';
import { useLocation } from '@/context/LocationContext';
import { getFestivalDates } from '@/lib/panchangam/getFestivalDates';
import { getFestivalInfo } from '@/lib/panchangam/getTithiDates';
import { NextPage } from 'next';
import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';

interface FestivalInfo {
  Festival_name: string;
  Tithi: string;
  Nakshatra: string;
  tamil_month: number;
  tamil_day: string;
  vaara: string;
  adhik_maasa: string;
  calendar_type: number;
  icon_file: string;
  Festival_en: string;
  Festival_ta: string;
  Festival_te: string;
  Festival_ka: string;
  Festival_hi: string;
  Festival_ml: string;
  Telugu_En_Prioarity: number;
  Festival_based_on: string;
}

const FestivalSearchPage: NextPage = () => {
  const { lat, lng, city, timezone, country } = useLocation();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [festivalInfo, setFestivalInfo] = useState<FestivalInfo | null>(null);
  const [festivalDates, setFestivalDates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);

  // Generate year options from 2020 to 2035
  const yearOptions = [];
  for (let year = 2020; year <= 2035; year++) {
    yearOptions.push(year);
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError('Please enter a festival name');
      return;
    }

    setLoading(true);
    setError('');
    setFestivalInfo(null);
    setFestivalDates([]);

    try {
      // Get festival information
      const info = getFestivalInfo(searchTerm);

      if (!info) {
        setError(`Festival "${searchTerm}" not found`);
        setSearched(true);
        setLoading(false);
        return;
      }

      setFestivalInfo(info as FestivalInfo);
      setSearched(true);

      // If festival has tithi information, get the dates
      if ('Tithi' in info && 'tamil_month' in info && info.Tithi && info.tamil_month) {
        const tithiIno = parseInt(String(info.Tithi));
        const lunarMonth = Number(info.tamil_month);

        if (!isNaN(tithiIno) && tithiIno > 0 && tithiIno <= 30) {
          // Use tithiIno directly as it's already 0-based in the JSON
          const dates = getFestivalDates(selectedYear, lunarMonth, tithiIno - 1, lat, lng);
          setFestivalDates(dates);
        }
      }
    } catch (err) {
      setError('An error occurred while searching for the festival');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Layout title="Festival Search" description="Search for Hindu festivals and their dates">
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <h1 className="mb-4">Festival Search</h1>

            {/* Search Form */}
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Form.Group className="mb-3">
                    <Form.Label>Festival Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter festival name (e.g., Diwali)"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Search in English, Tamil, Telugu, Kannada, Hindi, or Malayalam
                    </Form.Text>
                  </Form.Group>

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
                        <span className="ms-2">Searching...</span>
                      </>
                    ) : (
                      'Search Festival'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Error Message */}
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Festival Information */}
            {festivalInfo && (
              <Card className="mb-4">
                <Card.Header as="h5">Festival Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Festival Name:</strong> {festivalInfo.Festival_en}
                      </p>
                      <p>
                        <strong>Tamil:</strong> {festivalInfo.Festival_ta}
                      </p>
                      <p>
                        <strong>Telugu:</strong> {festivalInfo.Festival_te}
                      </p>
                      <p>
                        <strong>Kannada:</strong> {festivalInfo.Festival_ka}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Hindi:</strong> {festivalInfo.Festival_hi}
                      </p>
                      <p>
                        <strong>Malayalam:</strong> {festivalInfo.Festival_ml}
                      </p>
                      <p>
                        <strong>Tamil Month:</strong> {festivalInfo.tamil_month}
                      </p>
                      <p>
                        <strong>Tithi:</strong> {festivalInfo.Tithi}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Festival Dates */}
            {festivalDates.length > 0 && (
              <Card className="mb-4">
                <Card.Header as="h5">Festival Dates for {selectedYear}</Card.Header>
                <Card.Body>
                  {festivalDates.map((date, index) => (
                    <div key={index} className="mb-3 rounded border p-3">
                      <h6>{date.tithi.name_TE}</h6>
                      <p>
                        <strong>Date:</strong> {formatDate(new Date(date.tithi.start))}
                      </p>
                      <p>
                        <strong>Start:</strong> {new Date(date.tithi.start).toLocaleString()}
                      </p>
                      <p>
                        <strong>End:</strong> {new Date(date.tithi.end).toLocaleString()}
                      </p>
                      <p>
                        <strong>Paksha:</strong> {date.paksha.name_TE}
                      </p>
                      <p>
                        <strong>Masa:</strong> {date.masa.name_TE}
                      </p>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* No Results */}
            {searched && !loading && !error && !festivalInfo && (
              <Alert variant="info">
                No festival found matching your search. Please try a different name.
              </Alert>
            )}
          </Col>

          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            <Card>
              <Card.Header as="h5">Location</Card.Header>
              <Card.Body>
                <p>
                  <strong>City:</strong> {city}
                </p>
                <p>
                  <strong>Country:</strong> {country}
                </p>
                <p>
                  <strong>Latitude:</strong> {lat.toFixed(4)}
                </p>
                <p>
                  <strong>Longitude:</strong> {lng.toFixed(4)}
                </p>
                <p>
                  <strong>Timezone:</strong> {timezone}
                </p>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header as="h5">Search Tips</Card.Header>
              <Card.Body>
                <ul>
                  <li>You can search in multiple languages</li>
                  <li>Try different spellings of the festival name</li>
                  <li>Select a year to find specific dates</li>
                  <li>Location affects the calculation of festival dates</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default FestivalSearchPage;
