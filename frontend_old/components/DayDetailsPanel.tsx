import { useLocation } from '@/context/LocationContext';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useYexaaPanchang } from '@/hooks/useYexaaPanchang';
import { getLocalizedText } from '@/utils/panchangamUtils';
import { formatDay, formatMonth } from '@/utils/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import DayDetailsSkeleton from './DayDetailsSkeleton';
import HeaderSkeleton from './HeaderSkeleton';

interface DayDetailsPanelProps {
  selectedDate: Date;
  locale: string;
  t: any;
}

export default function DayDetailsPanel({ selectedDate, locale, t }: DayDetailsPanelProps) {
  const { lat, lng } = useLocation();

  // Format the date to avoid timezone issues in astronomical calculations
  // Create a UTC date with noon time for consistent calculations
  const formattedDate = useMemo(() => {
    if (!selectedDate) return new Date();

    return new Date(
      Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, // Set to noon UTC for more accurate astronomical calculations
        0,
        0
      )
    );
  }, [selectedDate]);

  const { calendar, isLoading, error } = useYexaaPanchang({
    date: formattedDate,
    lat,
    lng,
    enabled: Boolean(lat && lng),
  });

  const { sunrise, sunset, moonriseFull, moonsetFull } = useAstronomyBundle(formattedDate);

  return (
    <div className="day-details rounded bg-white p-3 shadow">
      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
        {isLoading ? (
          <HeaderSkeleton height="h-6" />
        ) : (
          <>
            <h4>
              {(t.panchangam as any)[formatMonth(formattedDate)] || formatMonth(formattedDate)}{' '}
              {formatDay(formattedDate)} {formattedDate.getFullYear()}
            </h4>
          </>
        )}
      </div>

      {isLoading ? (
        <DayDetailsSkeleton />
      ) : error ? (
        <div className="text-muted py-4 text-center">
          <p>
            {locale === 'te'
              ? 'పంచాంగం వివరాలను లోడ్ చేయడం సాధ్యపడలేదు'
              : 'Unable to load panchangam details'}
          </p>
          <small>
            {typeof error === 'string'
              ? error
              : locale === 'te'
                ? 'దయచేసి మీ స్థాన సెట్టింగ్‌లను తనిఖీ చేయండి'
                : 'Please check your location settings'}
          </small>
        </div>
      ) : calendar ? (
        <div className="panchang-details">
          {/* Sun & Moon Times */}
          <div className="mb-4">
            <h6 className="fw-bold text-primary mb-2">{t.panchangam.sun_moon_time}</h6>
            <div className="row small">
              <div className="col-6">
                <div className="d-flex align-items-center mb-1">
                  <strong>{t.panchangam.sunrise}:</strong>
                </div>
                <div className="text-muted">{sunrise || 'N/A'}</div>
                <div className="d-flex align-items-center mb-1 mt-2">
                  <strong>{t.panchangam.sunset}:</strong>
                </div>
                <div className="text-muted">{sunset || 'N/A'}</div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center mb-1">
                  <strong>{t.panchangam.moonrise}:</strong>
                </div>
                <div className="text-muted">{moonriseFull || 'N/A'}</div>
                <div className="d-flex align-items-center mb-1 mt-2">
                  <strong>{t.panchangam.moonset}:</strong>
                </div>
                <div className="text-muted">{moonsetFull || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Panchangam Elements */}
          <div className="mb-4">
            <h6 className="fw-bold text-primary mb-2">{t.panchangam.panchang_info}</h6>
            <div className="small">
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.tithi}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Tithi, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">
                  {t.panchangam.nakshatra}:
                </div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Nakshatra, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.yoga}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Yoga, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">
                  {t.panchangam.karana}:
                </div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Karna, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">
                  {(t.panchangam as any).paksha || 'Paksha'}:
                </div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Paksha, 'name_TE', 'name', locale)}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Information */}
          <div className="mb-3">
            <h6 className="fw-bold text-primary mb-2">{t.panchangam.calender_info}</h6>
            <div className="small">
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.month}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.MoonMasa, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.year}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.TeluguYear, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.ruthu}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.DrikRitu, 'name_TE', 'name', locale)}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 fw-bold d-flex align-items-center">{t.panchangam.ayana}:</div>
                <div className="col-8">
                  {getLocalizedText(calendar?.Ayana, 'name_TE', 'name', locale)}
                </div>
              </div>
            </div>
          </div>
          {/* View More */}
          <div className="mt-3 text-center">
            <Link href={`/panchangam/${format(selectedDate, 'yyyy-MM-dd')}`}>
              <Button variant="outline-primary" size="sm" className="px-4">
                {(t as any).upcomingEvents?.viewMore || 'Explore More'}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-muted py-4 text-center">
          <p>
            {locale === 'te'
              ? 'పంచాంగం వివరాలు అందుబాటులో లేవు'
              : 'No panchangam details available'}
          </p>
        </div>
      )}
    </div>
  );
}
