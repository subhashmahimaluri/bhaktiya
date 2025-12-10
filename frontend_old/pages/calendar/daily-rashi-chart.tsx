import DayRulerCard from '@/components/DayRulerCard';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useYexaaPanchang } from '@/hooks/useYexaaPanchang';
import {
  formatGrahaDebug,
  getPlanetNameTelugu,
  GridCell,
  PlanetName,
  RashiChart,
  RashiGridResult,
  SnapshotOption,
} from '@/lib/panchangam/RashiChart';
import { makeAstronomyPanchangAdapter } from '@/lib/panchangam/panchangAstronomyAdapter';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import { getMetaDataByPath } from '@/utils/seo';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';

/**
 * Daily Rashi Chart Page
 * Shows 12-cell grid with planet placements based on selected date/time/location
 */
export default function DailyRashiChartPage() {
  const { t, locale } = useTranslation();
  const { lat, lng, timezone, city, country } = useLocation();
  const { title, description } = getMetaDataByPath('/calendar/daily-rashi-chart', locale);

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [snapshotType, setSnapshotType] = useState<'sunrise' | 'midnight' | 'noon' | 'custom'>(
    'sunrise'
  );
  const [customHour, setCustomHour] = useState<number>(12);
  const [customMinute, setCustomMinute] = useState<number>(0);
  const [gridResult, setGridResult] = useState<RashiGridResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [predictionMode, setPredictionMode] = useState<'singleWord' | 'fullMessage'>('singleWord');

  const {
    calendar: yexaaCalendar,
    calculated: yexaaCalculated,
    isLoading: yexaaIsLoading,
    error: yexaaError,
  } = useYexaaPanchang({
    date: selectedDate,
    lat,
    lng,
    enabled: Boolean(lat && lng),
  });

  console.log('calendar', yexaaCalendar);

  // Initialize panchang implementation with astronomy adapter
  const panchangImpl = useMemo(() => {
    const constant = new YexaaLocalConstant();
    const base = new YexaaPanchangImpl(constant);
    return makeAstronomyPanchangAdapter(base);
  }, []);

  // Initialize RashiChart
  const rashiChart = useMemo(() => {
    return new RashiChart(panchangImpl, { ayanamsaMode: 'lahiri' });
  }, [panchangImpl]);

  // Default mapping (can be customized)
  const mapping = useMemo(() => RashiChart.getDefaultMapping(), []);

  /**
   * Compute rashi chart for selected date/time/location
   */
  const computeChart = useCallback(async () => {
    if (!lat || !lng || !timezone) {
      setError('Location not available. Please select a location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Determine snapshot option
      let snapshot: SnapshotOption;
      if (snapshotType === 'custom') {
        snapshot = { hour: customHour, minute: customMinute };
      } else {
        snapshot = snapshotType as 'sunrise' | 'midnight' | 'noon';
      }

      // Compute grid
      const result = await rashiChart.computeGridForDate(
        selectedDate,
        lat,
        lng,
        timezone,
        mapping,
        snapshot
      );

      setGridResult(result);
    } catch (err: any) {
      console.error('Error computing rashi chart:', err);
      setError(err.message || 'Failed to compute rashi chart');
    } finally {
      setLoading(false);
    }
  }, [
    selectedDate,
    snapshotType,
    customHour,
    customMinute,
    lat,
    lng,
    timezone,
    rashiChart,
    mapping,
  ]);

  // Auto-compute on mount and when dependencies change
  useEffect(() => {
    computeChart();
  }, [computeChart]);

  /**
   * Get planet CSS class for coloring
   */
  const getPlanetClass = (planet: PlanetName): string => {
    const classMap: Record<PlanetName, string> = {
      Sun: 'sun',
      Moon: 'moon',
      Mars: 'mars',
      Mercury: 'mercury',
      Jupiter: 'jupiter',
      Venus: 'venus',
      Saturn: 'saturn',
      Rahu: 'rahu',
      Ketu: 'ketu',
    };
    return classMap[planet] || '';
  };

  /**
   * Render a grid cell
   */
  const renderCell = (cell: GridCell, isCenterCell: boolean = false) => {
    if (isCenterCell) {
      // Center cell shows date and branding
      return (
        <div className="center-content">
          <div className="center-date">{selectedDate.toLocaleDateString('en-IN')}</div>
          <div className="center-brand">ssbhakthi.com</div>
        </div>
      );
    }

    const rashiIndex = cell.rashiIndex;

    return (
      <>
        <span className="rashi-label">{rashiIndex >= 0 ? `${rashiIndex + 1}` : ''}</span>
        <div className="planets-list">
          {cell.planets.map((planet, idx) => (
            <div
              key={idx}
              className={`planet-row ${cell.planets.length > 1 ? 'multiple-planets' : ''}`}
            >
              <span className={`planet-name ${getPlanetClass(planet)}`}>
                {getPlanetNameTelugu(planet)}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };

  /**
   * Render debug information
   */
  const renderDebugInfo = () => {
    if (!gridResult || !debugMode) return null;

    return (
      <div className="debug-panel bg-light mt-3 rounded border p-3">
        <h5>Debug Information</h5>
        <div>
          <strong>Julian Day:</strong> {gridResult.debug?.jd.toFixed(6)}
        </div>
        <div>
          <strong>Snapshot:</strong> {gridResult.dateLocal.toString()}
        </div>
        {gridResult.debug?.sunriseLocal && (
          <div>
            <strong>Sunrise Local:</strong> {gridResult.debug.sunriseLocal.toString()}
          </div>
        )}
        <div className="mt-2">
          <strong>Planet Details:</strong>
          <ul className="small">
            {gridResult.grahas.map((graha, idx) => (
              <li key={idx}>{formatGrahaDebug(graha)}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Layout title={title} description={description}>
      <Row className="mt-25 inner-page py-5">
        <div className="container-fluid mt-10 py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <Row className="daily-rashi-chart mt-25 inner-page py-5">
                <Col xl="8" lg="8" md="12">
                  <div className="daily-rashi-chart rounded bg-white p-4 shadow-sm">
                    <Row className="g-4 mt-25 pt-5">
                      <Col md={12}>
                        <h1 className="h3 mb-1">Daily Rashi Chart</h1>
                        <p className="text-muted small">
                          View planetary positions in the 12 rashi (zodiac sign) chart
                        </p>
                      </Col>
                    </Row>

                    {/* Location Selector */}
                    <Row className="mb-4">
                      <Col md={12}>
                        <LocationAccordion
                          city={city || 'Hyderabad'}
                          country={country || 'India'}
                        />
                      </Col>
                    </Row>

                    {/* Date and Time Controls */}
                    <Row className="mb-4">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small">
                            <i className="fas fa-calendar me-2"></i>Select Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={e => setSelectedDate(new Date(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold small">
                            <i className="fas fa-clock me-2"></i>Snapshot Time
                          </Form.Label>
                          <Form.Select
                            value={snapshotType}
                            onChange={e => setSnapshotType(e.target.value as any)}
                          >
                            <option value="sunrise">Sunrise</option>
                            <option value="midnight">Midnight</option>
                            <option value="noon">Noon</option>
                            <option value="custom">Custom Time</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      {snapshotType === 'custom' && (
                        <>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="fw-semibold small">Hour</Form.Label>
                              <Form.Control
                                type="number"
                                min={0}
                                max={23}
                                value={customHour}
                                onChange={e => setCustomHour(parseInt(e.target.value) || 0)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="fw-semibold small">Minute</Form.Label>
                              <Form.Control
                                type="number"
                                min={0}
                                max={59}
                                value={customMinute}
                                onChange={e => setCustomMinute(parseInt(e.target.value) || 0)}
                              />
                            </Form.Group>
                          </Col>
                        </>
                      )}
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Button
                          variant="primary"
                          onClick={computeChart}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sync-alt me-2"></i>
                              Calculate Chart
                            </>
                          )}
                        </Button>
                        <Form.Check
                          type="checkbox"
                          label="Show Debug Info"
                          checked={debugMode}
                          onChange={e => setDebugMode(e.target.checked)}
                          className="d-inline-block ms-3"
                        />
                        <Form.Check
                          type="switch"
                          id="prediction-mode-switch"
                          label={predictionMode === 'singleWord' ? 'Single Word' : 'Full Message'}
                          checked={predictionMode === 'fullMessage'}
                          onChange={e =>
                            setPredictionMode(e.target.checked ? 'fullMessage' : 'singleWord')
                          }
                          className="d-inline-block ms-3"
                        />
                      </Col>
                    </Row>

                    {error && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <div className="alert alert-danger">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                          </div>
                        </Col>
                      </Row>
                    )}

                    {/* Grid Display */}
                    {gridResult && (
                      <Row>
                        <Col md={12}>
                          <div className="rashi-grid-container">
                            <div className="rashi-grid">
                              {/* Row 1: cells 11, 0, 1, 2 (houses 12, 1, 2, 3) */}
                              <div className="grid-cell border-right border-bottom">
                                {renderCell(gridResult.grid[11])}
                              </div>
                              <div className="grid-cell border-right border-bottom">
                                {renderCell(gridResult.grid[0])}
                              </div>
                              <div className="grid-cell border-right border-bottom">
                                {renderCell(gridResult.grid[1])}
                              </div>
                              <div className="grid-cell border-bottom">
                                {renderCell(gridResult.grid[2])}
                              </div>

                              {/* Row 2: cell 10, CENTER (2x2), cell 3 (houses 11, center, 4) */}
                              <div className="grid-cell border-right border-bottom">
                                {renderCell(gridResult.grid[10])}
                              </div>
                              <div className="grid-cell center-cell border-right">
                                {renderCell({ cellIndex: -1, rashiIndex: -1, planets: [] }, true)}
                              </div>
                              <div className="grid-cell border-bottom">
                                {renderCell(gridResult.grid[3])}
                              </div>

                              {/* Row 3: cell 9, CENTER (continues), cell 4 (houses 10, center, 5) */}
                              <div className="grid-cell border-right">
                                {renderCell(gridResult.grid[9])}
                              </div>
                              <div className="grid-cell">{renderCell(gridResult.grid[4])}</div>

                              {/* Row 4: cells 8, 7, 6, 5 (houses 9, 8, 7, 6) */}
                              <div className="grid-cell border-right border-top">
                                {renderCell(gridResult.grid[8])}
                              </div>
                              <div className="grid-cell border-right border-top">
                                {renderCell(gridResult.grid[7])}
                              </div>
                              <div className="grid-cell border-right border-top">
                                {renderCell(gridResult.grid[6])}
                              </div>
                              <div className="grid-cell border-top">
                                {renderCell(gridResult.grid[5])}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <strong>Planet Details:</strong>
                            <ul className="small">
                              {gridResult.grahas.map((graha, idx) => (
                                <li key={idx}>{formatGrahaDebug(graha)}</li>
                              ))}
                            </ul>
                          </div>
                        </Col>
                      </Row>
                    )}

                    {yexaaCalendar && (
                      <DayRulerCard
                        endNak={yexaaCalendar.Nakshatra.ino}
                        tithi={yexaaCalendar.Tithi.ino}
                        date={selectedDate}
                        method="main"
                        grahas={gridResult?.grahas}
                        predictionMode={predictionMode}
                      />
                    )}

                    {/* Debug Info */}
                    {renderDebugInfo()}
                  </div>
                </Col>

                {/* Sidebar */}
                <Col xl="4" lg="4" md="12" className="mt-xl-0 mt-4">
                  <div className="sidebar-content rounded bg-white p-4 shadow-sm">
                    <h5 className="mb-3">
                      <i className="fas fa-info-circle me-2"></i>About Rashi Chart
                    </h5>
                    <p className="small text-muted">
                      The Rashi Chart shows the positions of planets in the 12 zodiac signs at a
                      specific date and time.
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Row>
    </Layout>
  );
}
