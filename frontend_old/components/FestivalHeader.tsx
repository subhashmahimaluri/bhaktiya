import {
  formatMonthYear,
  formatWeekDay,
  getLocalizedImagePath,
  getOrdinalSuffix,
} from '@/utils/festivalUtils';
import Image from 'next/image';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

interface FestivalHeaderProps {
  festivalName: string;
  city: string;
  country: string;
  date?: Date;
  image?: string;
  locale: string;
}

/**
 * Festival page header component with date card and image
 * Displays festival information in a visually organized layout
 */
export default function FestivalHeader({
  festivalName,
  city,
  country,
  date,
  image,
  locale,
}: FestivalHeaderProps) {
  const displayDate = date || new Date();
  const localizedImage = getLocalizedImagePath(image, locale);

  return (
    <div className="festival-header position-relative my-3 my-5">
      <div className="festival-background" />
      <Row className="g-4 align-items-stretch">
        {/* Left: Date Card */}
        <Col lg={5} md={12} className="mb-lg-0 mb-4">
          <Card className="h-100 date-card border-0 text-center shadow-sm">
            <Card.Body>
              <div className="card-caption mb-2">
                {city}, {country}
              </div>
              <Card.Title className="date-title">{festivalName}</Card.Title>

              <div className="date-card-content">
                <div className="greg-date fw-bold">
                  {displayDate.getDate()}
                  <span className="align-top ordinal">
                    {getOrdinalSuffix(displayDate.getDate())}
                  </span>
                </div>
                <div className="month fw-semibold">{formatMonthYear(displayDate, locale)}</div>
                <div className="week-day text-secondary mt-2">
                  {formatWeekDay(displayDate, locale)}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Image Card */}
        <Col lg={7} md={12}>
          <Card className="h-100 image-card position-relative overflow-hidden border-0 shadow-sm">
            <div className="position-relative ratio-3by2">
              {localizedImage ? (
                <Image
                  className="img-fluid text-center"
                  src={localizedImage}
                  alt={festivalName}
                  width={720}
                  height={480}
                  style={{ objectFit: 'cover' } as React.CSSProperties}
                  onError={e => {
                    // Fallback to default image if loading fails
                    (e.target as HTMLImageElement).src = '/images/festivals/default_festival.png';
                  }}
                />
              ) : (
                <Image
                  className="img-fluid text-center"
                  src="/images/festivals/festival_placeholder.png"
                  alt={festivalName}
                  width={720}
                  height={480}
                  style={{ objectFit: 'cover' } as React.CSSProperties}
                  onError={e => {
                    // Fallback to default image if loading fails
                    (e.target as HTMLImageElement).src = '/images/festivals/default_festival.png';
                  }}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
