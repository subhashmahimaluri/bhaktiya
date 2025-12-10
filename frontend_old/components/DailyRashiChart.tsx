'use client';

import { useLocation } from '@/context/LocationContext';
import {
  formatGrahaDebug,
  getPlanetNameTelugu,
  GridCell,
  RashiChart,
  RashiGridResult,
  SnapshotOption,
} from '@/lib/panchangam/RashiChart';
import { makeAstronomyPanchangAdapter } from '@/lib/panchangam/panchangAstronomyAdapter';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaPanchangImpl } from '@/lib/panchangam/yexaaPanchangImpl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';

/**
 * DailyRashiChart - React component for displaying daily rashi chart
 * Shows 12-cell grid with planet placements based on selected date/time/location
 */
export const DailyRashiChart: React.FC = () => {
  const { lat, lng, timezone, city, country } = useLocation();

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
   * Render a grid cell
   */
  const renderCell = (cell: GridCell, isCenterCell: boolean = false) => {
    if (isCenterCell) {
      // Center cell shows date/time
      return (
        <div className="rashi-cell center-cell">
          <div className="date-display">
            <div className="date-day">{selectedDate.getDate()}</div>
            <div className="date-month">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <div className="snapshot-time">
              {gridResult?.dateLocal.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    }

    const rashiIndex = cell.rashiIndex;
    const hasContent = cell.planets.length > 0;

    return (
      <div className={`rashi-cell ${hasContent ? 'has-planets' : ''}`}>
        <div className="rashi-label">{rashiIndex >= 0 ? `${rashiIndex + 1}` : ''}</div>
        <div className="planets-list">
          {cell.planets.map((planet, idx) => (
            <div key={idx} className="planet-name">
              {getPlanetNameTelugu(planet)}
            </div>
          ))}
        </div>
      </div>
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
    <div className="daily-rashi-chart">
      <Row className="mb-4">
        <Col md={12}>
          <h3>
            Daily Rashi Chart - {city}, {country}
          </h3>
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={e => setSelectedDate(new Date(e.target.value))}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Snapshot Time</Form.Label>
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
                <Form.Label>Hour</Form.Label>
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
                <Form.Label>Minute</Form.Label>
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
          <Button variant="primary" onClick={computeChart} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Calculate Chart'}
          </Button>
          <Form.Check
            type="checkbox"
            label="Show Debug Info"
            checked={debugMode}
            onChange={e => setDebugMode(e.target.checked)}
            className="d-inline-block ms-3"
          />
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col md={12}>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* Grid Display */}
      {gridResult && (
        <Row>
          <Col md={12}>
            <div className="rashi-grid-container">
              <div className="rashi-grid">
                {/* Row 1: cells 0-3 */}
                {gridResult.grid.slice(0, 4).map((cell, idx) => (
                  <div key={idx} className="grid-cell">
                    {renderCell(cell)}
                  </div>
                ))}

                {/* Row 2: cell 4, CENTER, cell 6, cell 7 */}
                <div className="grid-cell">{renderCell(gridResult.grid[4])}</div>
                <div className="grid-cell center">
                  {renderCell(
                    gridResult.grid[5] || { cellIndex: 5, rashiIndex: -1, planets: [] },
                    true
                  )}
                </div>
                <div className="grid-cell">{renderCell(gridResult.grid[6])}</div>
                <div className="grid-cell">{renderCell(gridResult.grid[7])}</div>

                {/* Row 3: cells 8-11 */}
                {gridResult.grid.slice(8, 12).map((cell, idx) => (
                  <div key={idx + 8} className="grid-cell">
                    {renderCell(cell)}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Debug Info */}
      {renderDebugInfo()}

      {/* Inline Styles */}
      <style jsx>{`
        .rashi-grid-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .rashi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
        }

        .grid-cell {
          aspect-ratio: 1;
        }

        .rashi-cell {
          border: 2px solid #6c757d;
          background: white;
          padding: 8px;
          border-radius: 4px;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .rashi-cell.center-cell {
          background: #e7f3ff;
          border-color: #007bff;
          font-weight: bold;
        }

        .rashi-cell.has-planets {
          background: #fff8e1;
          border-color: #ff6f00;
        }

        .rashi-label {
          position: absolute;
          top: 4px;
          left: 4px;
          font-size: 10px;
          color: #6c757d;
          font-weight: bold;
        }

        .planets-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #d84315;
        }

        .planet-name {
          text-align: center;
        }

        .date-display {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .date-day {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
        }

        .date-month {
          font-size: 12px;
          color: #6c757d;
        }

        .snapshot-time {
          font-size: 11px;
          color: #28a745;
          margin-top: 4px;
        }

        .debug-panel ul {
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default DailyRashiChart;
