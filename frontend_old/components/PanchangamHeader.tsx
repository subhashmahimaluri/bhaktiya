import { useTranslation } from '@/hooks/useTranslation';
import { formatDay, formatMonth } from '@/utils/utils';
import { addDays, format } from 'date-fns';
import Link from 'next/link';
import PanchangamSearch from './PanchangamSearch';

interface PanchangamHeaderProps {
  panchangamDate: Date;
}

export default function PanchangamHeader({ panchangamDate }: PanchangamHeaderProps) {
  const { t } = useTranslation();

  const getUrlDate = (offset: number) => format(addDays(panchangamDate, offset), 'yyyy-MM-dd');
  const getLabelDate = (offset: number) => format(addDays(panchangamDate, offset), 'MMM d');

  return (
    <div className="panchang-header text-black">
      <div className="d-flex w-100 align-items-center">
        <div className="pn-header-text flex-grow-1 pl-2">
          <div className="panchang-nav py-1">
            <ul className="list-unstyled">
              <li className="nav-prev fw-bold">
                <Link href={`/panchangam/${getUrlDate(-1)}`}>
                  <i className="fa fa-angle-left" /> {getLabelDate(-1)}
                </Link>
              </li>
              <li className="nav-prev fw-bold">
                <Link href={`/panchangam/${format(new Date(), 'yyyy-MM-dd')}`}>Today</Link>
              </li>
              <li className="nav-next fw-bold">
                <Link href={`/panchangam/${getUrlDate(1)}`}>
                  {getLabelDate(1)} <i className="fa fa-angle-right" />
                </Link>
              </li>
            </ul>
          </div>
          <div className="panchang-title fw-bold">
            <span className="icon-sprite icon-sprite-balaji"></span>
            <h4 className="text-black">
              {t.panchangam.panchang}{' '}
              {(t.panchangam as any)[formatMonth(panchangamDate)] || formatMonth(panchangamDate)}{' '}
              {formatDay(panchangamDate)}, {panchangamDate.getFullYear()}
            </h4>
          </div>
          <PanchangamSearch />
        </div>
      </div>
    </div>
  );
}
