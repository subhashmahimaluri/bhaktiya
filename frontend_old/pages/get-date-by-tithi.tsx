import Layout from '@/components/Layout/Layout';
import { useLocation } from '@/context/LocationContext';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchang } from '@/lib/panchangam/yexaaPanchang';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';

const localConstant = new YexaaLocalConstant();

const GetDateByTithiPage: NextPage = () => {
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
  const [infoBlock, setInfoBlock] = useState<any>(null);
  const [blockLoading, setBlockLoading] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<string>(pageLocale);

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

  // Load info block on component mount and when locale changes
  useEffect(() => {
    // Update current language when router.locale or pageLocale changes
    if (router.isReady) {
      setCurrentLanguage(pageLocale);
    }
  }, [router.isReady, pageLocale]);

  // Load info block on component mount
  useEffect(() => {
    const loadInfoBlock = async () => {
      try {
        setBlockLoading(true);
        const response = await fetch('/api/blocks-by-path?blockPath=/get-date-by-tithi');
        if (response.ok) {
          const block = await response.json();
          setInfoBlock(block);
        }
      } catch (err) {
        console.error('Failed to load info block:', err);
      } finally {
        setBlockLoading(false);
      }
    };

    loadInfoBlock();
  }, []);

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
      const panchang = new YexaaPanchang();
      const results: any[] = [];

      // Get tithi index from selected value
      const selectedTithiOption = tithiOptions.find(option => option.value === selectedTithi);
      if (!selectedTithiOption) {
        setError('Invalid tithi selection');
        setLoading(false);
        return;
      }
      const tithiIndex = selectedTithiOption.ino;
      const masaIndex = monthOptions.indexOf(selectedMonth);

      // Convert masa index to Tamil month (1-based)
      // Masa index 0 (vishakam) -> Tamil month 2 (Vaikasi)
      // Masa index 1 (jyesta) -> Tamil month 3 (Aani)
      // Masa index 2 (ashada) -> Tamil month 4 (Aadi)
      // Masa index 3 (sravana) -> Tamil month 5 (Aavani)
      // Masa index 4 (badhrapada) -> Tamil month 6 (Purattasi)
      // Masa index 5 (aswayuja) -> Tamil month 7 (Aippasi)
      // Masa index 6 (karthika) -> Tamil month 8 (Karthigai)
      // Masa index 7 (margasira) -> Tamil month 9 (Margazhi)
      // Masa index 8 (pusya) -> Tamil month 10 (Thai)
      // Masa index 9 (magha) -> Tamil month 11 (Maasi)
      // Masa index 10 (phalguna) -> Tamil month 12 (Panguni)
      // Masa index 11 (chaitra) -> Tamil month 1 (Chithirai)
      const tamilMonth = ((masaIndex + 1) % 12) + 1; // Convert to 1-12 range

      // Start from a date that ensures we capture the target month
      let currentDate: Date;
      const endDate = new Date(selectedYear + 1, 0, 1); // January 1 of next year

      if (tamilMonth >= 1 && tamilMonth <= 3) {
        // For early Tamil months (Chithirai, Vaikasi, Aani), start from previous year
        currentDate = new Date(selectedYear - 1, 0, 1);
      } else {
        // For later Tamil months, start from current year
        currentDate = new Date(selectedYear, 0, 1);
      }

      while (currentDate < endDate) {
        try {
          // Calculate calendar based on selected time
          let calendar;
          if (selectedTime === 'pradosha') {
            calendar = panchang.calendarAtPradosha(currentDate, lat, lng);
          } else {
            calendar = panchang.calendar(currentDate, lat, lng);
          }

          // Check if this date has our target tithi at the selected time
          if (calendar.Tithi && calendar.Tithi.ino === tithiIndex) {
            // Check if the masa matches our target month
            if (calendar.MoonMasa && calendar.MoonMasa.ino === masaIndex) {
              // Get the full calculation to obtain timing information
              const calculated = panchang.calculate(currentDate);

              // If the tithi at selected time matches what we're looking for,
              // but the sunrise tithi is different, we need to find the correct timing
              const tithiStart = calculated.Tithi.start;
              const tithiEnd = calculated.Tithi.end;

              // If calculated tithi doesn't match (different tithi at sunrise vs selected time),
              // we need to use the calendar's tithi name but calculated's timing might be wrong
              if (calculated.Tithi.ino !== calendar.Tithi.ino) {
                console.log(
                  'WARNING: Tithi mismatch - using calendar name but calculated timing may be incorrect'
                );
              }

              // Create result object combining both sources
              const result = {
                date: currentDate,
                tithi: {
                  // Use tithi identity from calendar (correct for selected time)
                  name: calendar.Tithi.name,
                  name_TE: calendar.Tithi.name_TE,
                  ino: calendar.Tithi.ino,
                  // Use timing from calculated (this is the sunrise tithi's timing)
                  start: tithiStart,
                  end: tithiEnd,
                },
                paksha: {
                  ino: calendar.Paksha.ino,
                  name: calendar.Paksha.name,
                  name_TE: calendar.Paksha.name_TE,
                },
                masa: {
                  ino: calendar.MoonMasa.ino,
                  name: calendar.MoonMasa.name,
                  name_TE: calendar.MoonMasa.name_TE,
                  isLeapMonth: calendar.MoonMasa.isLeapMonth || false,
                },
              };

              results.push(result);

              // Skip ahead to avoid duplicates
              currentDate.setDate(currentDate.getDate() + 20);
              continue;
            }
          }

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        } catch (error) {
          // Move to next day on error
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Sort results by date
      results.sort((a, b) => {
        const dateA = new Date(a.tithi.start);
        const dateB = new Date(b.tithi.start);
        return dateA.getTime() - dateB.getTime();
      });

      if (results.length > 0) {
        setTithiDetails(results[0]); // Get the first result
      } else {
        setError('No tithi found for the selected combination');
      }
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
                    <Form.Label>Select Time</Form.Label>
                    <Form.Select
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                    >
                      <option value="sunrise">Sunrise</option>
                      <option value="pradosha">Pradosha</option>
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

            {/* Info Block */}
            {infoBlock && !blockLoading && (
              <Card className="mt-5">
                <Card.Header as="h5">
                  {infoBlock.title[currentLanguage as keyof typeof infoBlock.title] ||
                    infoBlock.title.en}
                </Card.Header>
                <Card.Body>
                  {infoBlock.imageUrl && (
                    <img
                      src={infoBlock.imageUrl}
                      alt={
                        infoBlock.title[currentLanguage as keyof typeof infoBlock.title] ||
                        infoBlock.title.en
                      }
                      className="img-fluid mb-3"
                      style={{ maxHeight: '300px', objectFit: 'cover' }}
                    />
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        infoBlock.content[currentLanguage as keyof typeof infoBlock.content] ||
                        infoBlock.content.en,
                    }}
                  />
                </Card.Body>
              </Card>
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

export default GetDateByTithiPage;
