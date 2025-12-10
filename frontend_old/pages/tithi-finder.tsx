import Layout from '@/components/Layout/Layout';
import { useLocation } from '@/context/LocationContext';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaTithiCalculate } from '@/lib/panchangam/yexaaTithiCalculate';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';

const localConstant = new YexaaLocalConstant();

const TithiFinder: NextPage = () => {
  const router = useRouter();
  const { lat, lng, city, timezone, country } = useLocation();
  const pageLocale = router.locale || 'en';

  const [selectedTithi, setSelectedTithi] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTime, setSelectedTime] = useState<string>('sunrise'); // Default to sunrise
  const [tithiDetails, setTithiDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);

  // Get all tithi options with paksha prefix
  const tithiOptions: { value: string; label: string; ino: number }[] = [];

  // Add Shukla paksha tithis (0-14)
  for (let i = 0; i < 15; i++) {
    tithiOptions.push({
      value: `shukla_${localConstant.Tithi.name_TE[i]}`,
      label: `Shukla ${localConstant.Tithi.name_TE[i].charAt(0).toUpperCase() + localConstant.Tithi.name_TE[i].slice(1)}`,
      ino: i,
    });
  }

  // Add Krishna paksha tithis (15-29)
  for (let i = 0; i < 14; i++) {
    tithiOptions.push({
      value: `krishna_${localConstant.Tithi.name_TE[i]}`,
      label: `Krishna ${localConstant.Tithi.name_TE[i].charAt(0).toUpperCase() + localConstant.Tithi.name_TE[i].slice(1)}`,
      ino: i + 15,
    });
  }

  // Add Pournami (15) and Amavasya (29) without paksha prefix
  tithiOptions.push({
    value: localConstant.Tithi.name_TE[14], // pournami
    label:
      localConstant.Tithi.name_TE[14].charAt(0).toUpperCase() +
      localConstant.Tithi.name_TE[14].slice(1),
    ino: 14,
  });

  tithiOptions.push({
    value: localConstant.Tithi.name_TE[29], // amavasya
    label:
      localConstant.Tithi.name_TE[29].charAt(0).toUpperCase() +
      localConstant.Tithi.name_TE[29].slice(1),
    ino: 29,
  });

  // Get month options
  const monthOptions = localConstant.Masa.name_TE;

  // Generate year options from 2021 to 2030
  const yearOptions = [];
  for (let year = 2021; year <= 2030; year++) {
    yearOptions.push(year);
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTithi || !selectedMonth) {
      setError('Please select both tithi and month');
      return;
    }

    setLoading(true);
    setError('');
    setTithiDetails(null);
    setSearched(true);

    try {
      // Get tithi index from selected value
      const selectedTithiOption = tithiOptions.find(option => option.value === selectedTithi);
      if (!selectedTithiOption) {
        setError('Invalid tithi selection');
        setLoading(false);
        return;
      }

      const tithiIndex = selectedTithiOption.ino;
      const masaIndex = monthOptions.indexOf(selectedMonth);

      // Use new YexaaTithiCalculate class for reverse tithi calculation
      const tithiCalculate = new YexaaTithiCalculate();
      let boundaries = tithiCalculate.calculateTithiBoundaries(
        tithiIndex,
        masaIndex,
        lat,
        lng,
        selectedYear
      );

      if (!boundaries) {
        console.warn('Trying alternative search methods...');
        // Try searching across multiple years if not found in current year
        for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
          const boundariesAlt = tithiCalculate.calculateTithiBoundaries(
            tithiIndex,
            masaIndex,
            lat,
            lng,
            selectedYear + yearOffset
          );
          if (boundariesAlt) {
            boundaries = boundariesAlt;
            break;
          }
        }
      }

      if (!boundaries) {
        setError('No tithi found for the selected combination. Try different masa or year.');
        setLoading(false);
        return;
      }

      // Build result object
      const result = {
        tithi: {
          ino: tithiIndex,
          name_TE: localConstant.Tithi.name_TE[tithiIndex % 15],
          start: boundaries.startTime.toISOString(),
          end: boundaries.endTime.toISOString(),
        },
        masa: {
          ino: masaIndex,
          name_TE: localConstant.Masa.name_TE[masaIndex],
        },
        paksha: {
          ino: Math.floor(tithiIndex / 15),
          name_TE: tithiIndex < 15 ? 'shukla' : 'krishna',
        },
      };

      setTithiDetails(result);
    } catch (err) {
      setError('Error calculating tithi details');
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <Layout
        title="Get Date by Tithi"
        description="Find dates for specific tithis in Hindu calendar"
      >
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <h1 className="mb-4">Get Date by Tithi</h1>

            {/* Search Form */}
            <Card className="mb-4">
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Tithi</Form.Label>
                    <Form.Select
                      value={selectedTithi}
                      onChange={e => setSelectedTithi(e.target.value)}
                    >
                      <option value="">Select Tithi</option>
                      {tithiOptions.map(tithi => (
                        <option key={tithi.value} value={tithi.value}>
                          {tithi.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Select Month</Form.Label>
                    <Form.Select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                    >
                      <option value="">Select Month</option>
                      {monthOptions.map(month => (
                        <option key={month} value={month}>
                          {month.charAt(0).toUpperCase() + month.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
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
                        <span className="ms-2">Calculating...</span>
                      </>
                    ) : (
                      'Get Tithi Details'
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

            {/* Tithi Details */}
            {tithiDetails && (
              <Card className="mb-4">
                <Card.Header as="h5">Tithi Details</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Date:</strong> {formatDate(new Date(tithiDetails.tithi.start))}
                      </p>
                      <p>
                        <strong>Masa:</strong> {tithiDetails.masa.name_TE}
                      </p>
                      <p>
                        <strong>Tithi Name:</strong>{' '}
                        {/* Special handling for Pournami (14) and Amavasya (29) */}
                        {tithiDetails.tithi.ino === 14 || tithiDetails.tithi.ino === 29 ? (
                          tithiDetails.tithi.name_TE.charAt(0).toUpperCase() +
                          tithiDetails.tithi.name_TE.slice(1)
                        ) : (
                          <>
                            {tithiDetails.paksha.name_TE}{' '}
                            {tithiDetails.tithi.name_TE.charAt(0).toUpperCase() +
                              tithiDetails.tithi.name_TE.slice(1)}
                          </>
                        )}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Tithi Start:</strong> {formatDateTime(tithiDetails.tithi.start)}
                      </p>
                      <p>
                        <strong>Tithi End:</strong> {formatDateTime(tithiDetails.tithi.end)}
                      </p>
                      <p>
                        <strong>Paksha:</strong> {tithiDetails.paksha.name_TE}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* No Results */}
            {searched && !loading && !error && !tithiDetails && (
              <Alert variant="info">
                No tithi found for the selected combination. Please try different options.
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
                  <li>Select a tithi from the dropdown list</li>
                  <li>
                    <strong>Time Selection:</strong>
                    <ul>
                      <li>
                        <strong>Sunrise:</strong> Calculate tithi at sunrise (traditional
                        panchangam)
                      </li>
                      <li>
                        <strong>Pradosha:</strong> Calculate tithi at pradosha time (sunset + 1/5 of
                        night duration)
                      </li>
                    </ul>
                  </li>
                  <li>Choose the lunar month (masa)</li>
                  <li>Select the year for calculation</li>
                  <li>Location affects the calculation of tithi timings</li>
                  <li>
                    <strong>Note:</strong> Tithi at sunrise and pradosha time may differ for the
                    same day
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default TithiFinder;
