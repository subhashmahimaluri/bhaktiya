import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
import LocationAccordion from './LocationAccordion';

interface FestivalYearNavProps {
  slug: string | string[] | undefined;
  year: number;
  city: string;
  country: string;
  isLoading?: boolean;
}

/**
 * Festival year navigation component
 * Allows users to navigate between different years
 */
export default function FestivalYearNav({
  slug,
  year,
  city,
  country,
  isLoading = false,
}: FestivalYearNavProps) {
  const isNavigationDisabled = isLoading;

  return (
    <Row className="align-items-center py-3">
      <Col lg="6" md="6" sm="12" className="mb-md-0 mb-2">
        <LocationAccordion city={city} country={country} />
      </Col>

      <Col lg="6" md="6" sm="12" className="text-lg-end text-md-end">
        <div className="d-flex align-items-center justify-content-lg-end justify-content-md-end justify-content-start gap-2">
          <Link
            href={`/calendar/festivals/${slug}?year=${year - 1}`}
            className={`btn btn-outline-primary btn-sm ${isNavigationDisabled ? 'disabled' : ''}`}
            aria-disabled={isNavigationDisabled}
          >
            ← {year - 1}
          </Link>
          <span className="fw-bold px-3">{year}</span>
          <Link
            href={`/calendar/festivals/${slug}?year=${year + 1}`}
            className={`btn btn-outline-primary btn-sm ${isNavigationDisabled ? 'disabled' : ''}`}
            aria-disabled={isNavigationDisabled}
          >
            {year + 1} →
          </Link>
        </div>
      </Col>
    </Row>
  );
}
