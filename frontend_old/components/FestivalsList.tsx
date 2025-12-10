import { format, parseISO } from 'date-fns';
import { Col, Row } from 'react-bootstrap';
import FestivalSkeleton from './FestivalSkeleton';
import HeaderSkeleton from './HeaderSkeleton';

interface FestivalEvent {
  date: Date;
  name: string;
  nameTelugu: string;
  type: 'festival' | 'vrath' | 'combined';
  category: string;
}

interface FestivalsListProps {
  festivalsData: any;
  festivalsLoading: boolean;
  festivalsError: boolean;
  monthYear: string;
  monthYearTelugu: string;
  locale: string;
  t: any;
}

export default function FestivalsList({
  festivalsData,
  festivalsLoading,
  festivalsError,
  monthYear,
  monthYearTelugu,
  locale,
  t,
}: FestivalsListProps) {
  // Get monthly events (festivals only) for the current month
  const getMonthlyEvents = (): FestivalEvent[] => {
    const events: FestivalEvent[] = [];

    // Group festivals by date
    const eventsByDate = new Map<string, string[]>();

    // Add festivals from API
    if (festivalsData && festivalsData.festivals) {
      festivalsData.festivals.forEach((festival: any) => {
        const dateKey = festival.date;
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, []);
        }
        eventsByDate.get(dateKey)!.push(festival.name);
      });
    }

    // Create grouped events
    for (const [dateStr, eventNames] of eventsByDate.entries()) {
      try {
        const eventDate = parseISO(dateStr);
        // Validate the parsed date
        if (isNaN(eventDate.getTime())) {
          console.error('Invalid date string in festival data:', dateStr);
          continue; // Skip invalid dates
        }
        const groupedName = eventNames.join(' / ');
        events.push({
          date: eventDate,
          name: groupedName,
          nameTelugu: groupedName,
          type: 'festival', // Use festival type
          category: 'festival',
        });
      } catch (error) {
        console.error('Error parsing festival date:', dateStr, error);
        continue; // Skip invalid dates
      }
    }

    // Sort by date (only include valid dates)
    return events
      .filter(event => event.date && !isNaN(event.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  return (
    <Row className="mt-4">
      <Col>
        {festivalsLoading ? (
          <div className="mb-3 text-center">
            <HeaderSkeleton className="mx-auto" height="h-8" />
          </div>
        ) : (
          <h3 className="mb-3 text-center">
            <i className="fas fa-calendar-check text-primary me-2"></i>
            {locale === 'te' ? `${monthYearTelugu} పండుగలు` : `Festivals in ${monthYear}`}
          </h3>
        )}

        {festivalsLoading ? (
          <FestivalSkeleton type="calendar" />
        ) : festivalsError ? (
          <div className="text-danger py-4 text-center">
            <p>{locale === 'te' ? 'పండుగలు లోడ్ చేయడంలో లోపం' : 'Error loading festivals'}</p>
          </div>
        ) : getMonthlyEvents().length === 0 ? (
          <div className="text-muted py-4 text-center">
            <p>{locale === 'te' ? 'ఈ నెలలో పండుగలు లేవు' : 'No festivals this month'}</p>
          </div>
        ) : (
          <div className="events-list">
            <ul className="festival-list">
              {getMonthlyEvents().map((event, index) => (
                <li key={index} className={`event-item ${event.type}`}>
                  <span className="event-date">
                    {format(event.date, 'dd')}{' '}
                    {locale === 'te'
                      ? (t.panchangam as any)[format(event.date, 'EEEE').toLowerCase()] ||
                        format(event.date, 'EEE')
                      : format(event.date, 'EEE')}
                  </span>
                  <span className="separator"> - </span>
                  <span className="event-name">
                    {locale === 'te' ? event.nameTelugu : event.name}
                  </span>
                  {/* Removed icons as requested */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Col>
    </Row>
  );
}
