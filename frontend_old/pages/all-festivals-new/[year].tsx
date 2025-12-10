'use client';
import Layout from '@/components/Layout/Layout';
import { useLocation } from '@/context/LocationContext';
import { useAllFestivalsV2 } from '@/hooks/useAllFestivalsV2';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';

const AllFestivalsNewYearPage: NextPage = () => {
  const router = useRouter();
  const { year } = router.query;
  const { lat, lng, city, country } = useLocation();

  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedPriority, setSelectedPriority] = useState<number | undefined>(undefined);
  const [selectedVrathaName, setSelectedVrathaName] = useState<string | undefined>(undefined);
  const [selectedCalculationType, setSelectedCalculationType] = useState<
    'Sunrise' | 'Sunset' | 'Midnight' | 'Pradosha' | undefined
  >(undefined);

  const yearNum = year ? parseInt(year as string) : new Date().getFullYear();

  const { festivals, allFestivals, loading, error } = useAllFestivalsV2(
    yearNum,
    selectedMonth,
    selectedPriority,
    selectedVrathaName,
    selectedCalculationType
  );

  // Get masa names
  const localConstant = useMemo(() => new YexaaLocalConstant(), []);
  const getMasaName = (masaIno: number) => {
    if (masaIno === -1) return 'N/A'; // For sankrantis
    return localConstant.Masa.name_TE[masaIno] || `Masa ${masaIno + 1}`;
  };

  // Get unique vratha names for filter dropdown
  const uniqueVrathaNames = useMemo(() => {
    const names = new Set<string>();
    // Use allFestivals (unfiltered) to always show all available options
    if (allFestivals && allFestivals.length > 0) {
      allFestivals.forEach(f => {
        if (f.festival.vratha_name) {
          names.add(f.festival.vratha_name);
        }
      });
    }
    return Array.from(names).sort();
  }, [allFestivals]);

  // Group festivals by date
  const festivalsByDate = useMemo(() => {
    const grouped = new Map<string, typeof festivals>();
    festivals.forEach(festival => {
      const dateKey = festival.date.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(festival);
    });
    return grouped;
  }, [festivals]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case '1':
        return <Badge bg="danger">1</Badge>;
      case '2':
        return (
          <Badge bg="warning" text="dark">
            2
          </Badge>
        );
      case '3':
        return <Badge bg="info">3</Badge>;
      case '4':
        return <Badge bg="secondary">4</Badge>;
      case '5':
        return (
          <Badge bg="light" text="dark">
            5
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout
      title={`Hindu Festivals ${yearNum}`}
      description={`Comprehensive list of all Hindu festivals and vrathas for ${yearNum}`}
    >
      <Container className="my-5">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Hindu Festivals {yearNum}</h1>
              <div className="text-muted text-end">
                <small>
                  {city}, {country}
                </small>
                <br />
                <small>
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </small>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Filters</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Label>Month</Form.Label>
                    <Form.Select
                      value={selectedMonth || ''}
                      onChange={e =>
                        setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)
                      }
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={selectedPriority || ''}
                      onChange={e =>
                        setSelectedPriority(e.target.value ? Number(e.target.value) : undefined)
                      }
                    >
                      <option value="">All Priorities</option>
                      <option value="1">1 (Highest)</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Label>Vratha Type</Form.Label>
                    <Form.Select
                      value={selectedVrathaName || ''}
                      onChange={e => setSelectedVrathaName(e.target.value || undefined)}
                    >
                      <option value="">All Vrathas</option>
                      {uniqueVrathaNames.map(name => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Label>Calculation Type</Form.Label>
                    <Form.Select
                      value={selectedCalculationType || ''}
                      onChange={e =>
                        setSelectedCalculationType(
                          (e.target.value as 'Sunrise' | 'Sunset' | 'Midnight' | 'Pradosha') ||
                            undefined
                        )
                      }
                    >
                      <option value="">All Types</option>
                      <option value="Sunrise">Sunrise</option>
                      <option value="Sunset">Sunset</option>
                      <option value="Midnight">Midnight</option>
                      <option value="Pradosha">Pradosha</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="my-5 text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Calculating festivals for {yearNum}...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}

            {/* Results */}
            {!loading && !error && festivals.length === 0 && (
              <Alert variant="info">No festivals found matching the selected filters.</Alert>
            )}

            {!loading && !error && festivals.length > 0 && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    Festivals in {yearNum} <Badge bg="primary">{festivals.length}</Badge>
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive className="mb-0">
                      <thead
                        style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}
                      >
                        <tr>
                          <th>Date</th>
                          <th>Festival Name</th>
                          <th>Type</th>
                          <th>Masa</th>
                          <th>Priority</th>
                          <th>Based On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(festivalsByDate.entries()).map(([dateKey, dayFestivals]) =>
                          dayFestivals.map((festivalOcc, idx) => (
                            <tr key={`${dateKey}-${idx}`}>
                              {idx === 0 && (
                                <td rowSpan={dayFestivals.length} className="align-middle">
                                  <strong>{formatDate(festivalOcc.date)}</strong>
                                </td>
                              )}
                              <td>
                                <div>
                                  <strong>{festivalOcc.festival.festival_te}</strong>
                                  {festivalOcc.festival.festival_en && (
                                    <>
                                      <br />
                                      <small className="text-muted">
                                        ({festivalOcc.festival.festival_en})
                                      </small>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td>
                                {festivalOcc.festival.festival_type === 'vratha' ? (
                                  <Badge bg="success">vratha</Badge>
                                ) : (
                                  <Badge bg="primary">festival</Badge>
                                )}
                                {festivalOcc.festival.vratha_name && (
                                  <>
                                    <br />
                                    <small className="text-muted">
                                      {festivalOcc.festival.vratha_name}
                                    </small>
                                  </>
                                )}
                              </td>
                              <td>
                                <div>
                                  {getMasaName(festivalOcc.masaIno)}
                                  {festivalOcc.isLeapMonth && (
                                    <>
                                      <br />
                                      <Badge bg="warning" text="dark" className="mt-1">
                                        Adhik Masa
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td>{getPriorityBadge(festivalOcc.festival.telugu_en_priority)}</td>
                              <td>
                                <Badge bg="info">{festivalOcc.calculationType}</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AllFestivalsNewYearPage;
