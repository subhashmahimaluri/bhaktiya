import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, formatDateTime } from '../utils/vrathaDateUtils';

interface VrathaDate {
  date: string;
  startTime: string;
  endTime: string;
  tag: string;
  description: string;
}

interface VrathaTableProps {
  dates: VrathaDate[];
  locale: string;
}

export default function VrathaTable({ dates, locale }: VrathaTableProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-3">
      <div className="table-responsive">
        <table className="table-striped table">
          <thead>
            <tr>
              <th>{t.panchangam.date}</th>
              <th>{t.calendar.tithi_start}</th>
              <th>{t.calendar.tithi_end}</th>
              <th>{t.calendar.vratha_desc}</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((dateInfo: VrathaDate, index: number) => (
              <tr key={index}>
                <td>
                  <strong>{formatDate(dateInfo.date, locale, t)}</strong>
                </td>
                <td>{formatDateTime(dateInfo.date, dateInfo.startTime, locale)}</td>
                <td>{formatDateTime(dateInfo.date, dateInfo.endTime, locale)}</td>
                <td>{dateInfo.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
