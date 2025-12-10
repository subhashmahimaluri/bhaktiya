import { useTranslation } from '@/hooks/useTranslation';
import { getLocalizedText } from '@/utils/panchangamUtils';
import { format } from 'date-fns';
import Link from 'next/link';
import { formatDate } from '../utils/vrathaDateUtils';

interface FestivalTableProps {
  festivalDate?: Date;
  festivalName?: string;
  festivalData: any;
}

export default function FestivalTable({
  festivalDate,
  festivalName,
  festivalData,
}: FestivalTableProps) {
  const { t, locale } = useTranslation();

  // If no specific date/name provided, show placeholder
  if (!festivalDate || !festivalName) {
    return (
      <div className="mt-3">
        <div className="table-responsive">
          <div className="alert alert-info">
            Festival details will be displayed here when available.
          </div>
        </div>
      </div>
    );
  }

  // Format date for panchangam link
  const formatDateForPanchangam = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <div className="mt-3 text-center">
      {/* Festival Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-2">
          {festivalName}: {formatDate(format(festivalDate, 'yyyy-MM-dd'), locale, t)}
        </h4>
      </div>

      {/* Tithi Section */}
      {festivalData.tithi.name && (
        <div className="mb-4">
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <div className="text-muted">
                {locale === 'te' ? festivalData.tithi.name_TE : festivalData.tithi.name}{' '}
                {t.calendar.tithi_start} -{' '}
                {festivalData.tithi.start
                  ? format(festivalData.tithi.start, 'MMM dd hh:mm a')
                  : 'N/A'}{' '}
              </div>
              <div className="text-muted">
                {locale === 'te' ? festivalData.tithi.name_TE : festivalData.tithi.name}{' '}
                {t.calendar.tithi_end} -{' '}
                {festivalData.tithi.end
                  ? format(festivalData.tithi.end, 'MMM dd hh:mm a')
                  : 'N/A'}{' '}
              </div>
              <div className="text-muted">
                <span className="fw-bold">{t.panchangam.month}</span> :{' '}
                <span>{getLocalizedText(festivalData?.masa, 'name_TE', 'name', locale)}</span>
              </div>
            </li>
          </ul>
        </div>
      )}
      {/* Panchangam Link */}
      <div className="pull-right pt-3">
        <Link
          href={`/panchangam/${formatDateForPanchangam(festivalDate)}`}
          className="btn btn-outline-primary btn-sm"
        >
          {festivalName} {t.calendar.day_panchangam} →
        </Link>
      </div>
    </div>
  );
}
