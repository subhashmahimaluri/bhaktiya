import { computeDinaAdhipati, DinaAdhipatiResult } from '@/lib/panchangam/dayRuler';
import { DAY_RULER_MESSAGES, RASHI_NAMES_TE } from '@/lib/panchangam/dayRulerMessages';
import type { GrahaRashiInfo } from '@/lib/panchangam/RashiChart';
import {
  calculateRashiPredictions,
  PredictionMode,
  RashiPredictionResult,
} from '@/lib/panchangam/rashiPrediction';
import React, { useEffect, useState } from 'react';

export interface DayRulerCardProps {
  endNak: number; // today's nakshatra index (0..26)
  tithi: number; // today's tithi ino (0..29)
  date: Date; // JS date (we use getDay())
  method?: 'main' | 'sulabha' | 'mathantara';
  grahas?: GrahaRashiInfo[]; // Optional: planet positions for prediction
  predictionMode?: PredictionMode; // 'singleWord' or 'fullMessage'
  className?: string;
  showDebug?: boolean;
}

type RashiKeywords = Record<number, string>;

const mapTithiInoToNumber = (ino: number): number => {
  // your mapping:
  // padyami: [0,15] → 1
  const map = (n: number) => (n % 15) + 1; // 0→1, 1→2 ... 14→15, 15→1, 16→2...
  return map(ino);
};

const DayRulerCard: React.FC<DayRulerCardProps> = ({
  endNak,
  tithi,
  date,
  method = 'main',
  grahas,
  predictionMode = 'fullMessage',
  className = '',
  showDebug = false,
}) => {
  const [result, setResult] = useState<DinaAdhipatiResult | null>(null);
  const [keywords, setKeywords] = useState<RashiKeywords | null>(null);
  const [rashiPredictions, setRashiPredictions] = useState<RashiPredictionResult[] | null>(null);

  useEffect(() => {
    const weekday = date.getDay();
    const tithiNumber = mapTithiInoToNumber(tithi);

    // Since you don't use birth nakshatra now → fix startNak=0
    const startNak = 0;

    try {
      const res = computeDinaAdhipati(startNak, endNak, tithiNumber, weekday, method);
      setResult(res);

      // If grahas are provided, use Python-style calculation
      if (grahas && grahas.length > 0) {
        const predictions = calculateRashiPredictions(grahas, predictionMode);
        setRashiPredictions(predictions);
        setKeywords(null); // Clear day ruler keywords
      } else {
        // Otherwise use day ruler keywords
        const planet = res.planet;
        const mapForPlanet = DAY_RULER_MESSAGES[planet];
        if (mapForPlanet) {
          const k: RashiKeywords = {} as any;
          for (let i = 0; i < 12; i++) k[i] = mapForPlanet[i] ?? '';
          setKeywords(k);
        }
        setRashiPredictions(null);
      }
    } catch (e) {
      console.error('DayRulerCard error:', e);
      setResult(null);
      setKeywords(null);
      setRashiPredictions(null);
    }
  }, [endNak, tithi, date, method, grahas, predictionMode]);

  return (
    <div className={`day-ruler-card p-3 ${className}`}>
      <h6 className="fw-bold mb-2">దినాధిపతి (Day Ruler)</h6>

      {!result && <div>Calculating…</div>}

      {result && (
        <div className="mb-3">
          <div className="fs-5 fw-bold text-danger">{result.planetTelugu}</div>
          <div className="fw-bold">{result.outcomeTelugu}</div>
          {showDebug && (
            <div className="small text-muted mt-2">
              <div>Method: {result.method}</div>
              <div>Remainder: {result.remainder}</div>
              <div>Raw Value: {result.debugValue}</div>
            </div>
          )}
        </div>
      )}

      <h6 className="fw-bold mb-2">జాతక (రాశులు → ఫలితములు)</h6>

      {!keywords && !rashiPredictions && <div className="small text-muted">Loading…</div>}

      {/* Display Python-style predictions if available */}
      {rashiPredictions && (
        <div className="rashi-keywords">
          {rashiPredictions.map(pred => (
            <div key={pred.rashi} className="d-flex justify-content-between border-bottom py-1">
              <div className="fw-semibold">{pred.rashiName}</div>
              <div
                className="fw-bold"
                style={{ fontSize: predictionMode === 'fullMessage' ? '0.8rem' : '1rem' }}
              >
                {pred.prediction}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display Day Ruler keywords if grahas not provided */}
      {keywords && !rashiPredictions && (
        <div className="rashi-keywords">
          {RASHI_NAMES_TE.map((rashi, i) => (
            <div key={i} className="d-flex justify-content-between border-bottom py-1">
              <div className="fw-semibold">{rashi}</div>
              <div className="fw-bold">{keywords[i]}</div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .day-ruler-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .rashi-keywords div:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

export default DayRulerCard;
