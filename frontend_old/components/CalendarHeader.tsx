import { useTranslation } from '@/hooks/useTranslation';
import { addMonths, format, subMonths } from 'date-fns';
import { Button } from 'react-bootstrap';
import Link from 'next/link';

interface CalendarHeaderProps {
  currentDate: Date;
  locale: string;
  t: any;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  monthYear: string;
  monthYearTelugu: string;
}

export default function CalendarHeader({
  currentDate,
  locale,
  t,
  onPreviousMonth,
  onNextMonth,
  onToday,
  monthYear,
  monthYearTelugu,
}: CalendarHeaderProps) {
  const year = new Date().getFullYear();

  return (
    <>
      {/* Navigation Header */}
      <div className="calendar-nav d-flex justify-content-between align-items-center mb-4 rounded p-3">
        <div className="calendar-title">
          <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-calendar-alt me-2"></i>
            {locale === 'te' ? monthYearTelugu : monthYear}
          </h2>
          <p className="text-muted small mb-0">{locale === 'te' ? monthYear : monthYearTelugu}</p>
        </div>
        <div className="nav-buttons d-flex gap-2">
          <Link href={`/calendar/${format(subMonths(currentDate, 1), 'MMMM-yyyy').toLowerCase()}`} passHref>
            <Button
              variant="outline-primary"
              size="sm"
              className="nav-btn"
            >
              <i className="fa fa-chevron-left"></i>
              <span className="d-none d-sm-inline ms-1">
                {locale === 'te'
                  ? `${(t.panchangam as any)[format(subMonths(currentDate, 1), 'MMMM').toLowerCase()] || format(subMonths(currentDate, 1), 'MMMM')} ${format(subMonths(currentDate, 1), 'yyyy')}`
                  : `${format(subMonths(currentDate, 1), 'MMM')} ${format(subMonths(currentDate, 1), 'yyyy')}`}
              </span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={onToday} className="today-btn">
            <i className="fas fa-calendar-day me-1"></i>
            {locale === 'te'
              ? `${(t.panchangam as any)[format(currentDate, 'MMMM').toLowerCase()] || format(currentDate, 'MMMM')} ${format(currentDate, 'yyyy')}`
              : `${format(currentDate, 'MMM')} ${format(currentDate, 'yyyy')}`}
          </Button>
          <Link href={`/calendar/${format(addMonths(currentDate, 1), 'MMMM-yyyy').toLowerCase()}`} passHref>
            <Button
              variant="outline-primary"
              size="sm"
              className="nav-btn"
            >
              <span className="d-none d-sm-inline me-1">
                {locale === 'te'
                  ? `${(t.panchangam as any)[format(addMonths(currentDate, 1), 'MMMM').toLowerCase()] || format(addMonths(currentDate, 1), 'MMMM')} ${format(addMonths(currentDate, 1), 'yyyy')}`
                  : `${format(addMonths(currentDate, 1), 'MMM')} ${format(addMonths(currentDate, 1), 'yyyy')}`}
              </span>
              <i className="fa fa-chevron-right"></i>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}