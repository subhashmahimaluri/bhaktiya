'use client';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import SocialShareButtons from '@/components/SocialShareButtons';
import TithiList from '@/components/TithiList';
import TithiYearNavigation from '@/components/TithiYearNavigation';
import UpcomingEventsV2 from '@/components/UpcomingEvents';
import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { YexaaLocalConstant } from '@/lib/panchangam/yexaaLocalConstant';
import { YexaaTithiCalculate } from '@/lib/panchangam/yexaaTithiCalculate';
import { getTithiNumbersByName } from '@/utils/tithiMap';
import { format } from 'date-fns';
import { useParams, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

type TithiInfo = {
  date: Date;
  tithiIno: number;
  tithiName: string;
  tithiNameTe: string;
  pakshaIno: number;
  pakshaName: string;
  pakshaMame_TE: string;
  masaIno: number;
  masaName: string;
  masaName_TE: string;
  startTime: Date;
  endTime: Date;
};

type TithiGroup = {
  month: number;
  monthName: string;
  tithiData: TithiInfo[];
};

export default function TithiPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const yearParam = searchParams?.get('year');

  const [dates, setDates] = useState<TithiGroup[]>([]);
  const [tithiName, setTithiName] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { t, locale } = useTranslation();

  const { lat, lng, city, timezone, country, setLocationData } = useLocation();

  const seoTitle = useMemo(() => {
    return `${tithiName ? (t.panchangam as any)[tithiName] : ''} ${t.panchangam.tithi} ${year || ''}`;
  }, [tithiName, year, t.panchangam]);

  const seoDescription = useMemo(() => {
    return `${tithiName ? (t.panchangam as any)[tithiName] : ''} tithi ${year || ''} - Hindu tithi date, time, and muhurta information with panchangam`;
  }, [tithiName, year, t.panchangam]);

  useEffect(() => {
    if (!slug || !lat || !lng) return;

    const [name, yearStr] = slug.split('-');
    const parsedYear = parseInt(yearStr, 10);
    const inos = getTithiNumbersByName(name.toLowerCase());

    if (!name || isNaN(parsedYear) || !inos || inos.length === 0) {
      console.error('Invalid Tithi name or year:', slug);
      setLoading(false);
      return;
    }

    // Use V2 approach with pre-calculated tithi boundaries
    try {
      const tithiCalculator = new YexaaTithiCalculate();
      const allTithiBoundaries = tithiCalculator.getAllTithiBoundariesInYear(parsedYear, lat, lng);
      const yexaaConstant = new YexaaLocalConstant();

      // Filter boundaries for the requested tithis
      const filteredBoundaries = allTithiBoundaries.filter(boundary =>
        inos.includes(boundary.tithiIno)
      );

      // Create TithiInfo objects
      const tithiInfos: TithiInfo[] = filteredBoundaries.map(boundary => {
        const tithiIno = boundary.tithiIno;
        const pakshaIno = tithiIno > 14 ? 1 : 0; // Krishna (1) if tithi > 15, Shukla (0) if < 16

        return {
          date: boundary.startTime,
          tithiIno: tithiIno,
          tithiName: yexaaConstant.Tithi.name[tithiIno],
          tithiNameTe: yexaaConstant.Tithi.name_TE[tithiIno],
          pakshaIno: pakshaIno,
          pakshaName: yexaaConstant.Paksha.name[pakshaIno],
          pakshaMame_TE: yexaaConstant.Paksha.name_TE[pakshaIno],
          masaIno: boundary.masaIno,
          masaName: yexaaConstant.Masa.name[boundary.masaIno],
          masaName_TE: yexaaConstant.Masa.name_TE[boundary.masaIno],
          startTime: boundary.startTime,
          endTime: boundary.endTime,
        };
      });

      // Sort by date
      tithiInfos.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      // Group by month
      const grouped = new Map<number, TithiInfo[]>();
      tithiInfos.forEach(info => {
        const month = info.date.getUTCMonth();
        if (!grouped.has(month)) {
          grouped.set(month, []);
        }
        grouped.get(month)!.push(info);
      });

      const groupedArray: TithiGroup[] = Array.from(grouped.entries())
        .map(([month, tithiData]) => {
          const monthKey = [
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december',
          ][month];
          const monthName = (t.panchangam as any)[monthKey];
          return {
            month,
            monthName,
            tithiData,
          };
        })
        .sort((a, b) => a.month - b.month);

      setDates(groupedArray);
      setTithiName(name);
      setYear(parsedYear);
    } catch (err) {
      console.error('Error calculating tithis:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, lat, lng, locale, t]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  // Helper function to interpolate template strings
  const interpolate = (template: string, values: Record<string, any>): string => {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return values[trimmedKey] ?? match;
    });
  };

  return (
    <Layout title={seoTitle} description={seoDescription}>
      <Row className="mt-25 inner-page py-5">
        <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
          <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
            <h1 className="mb-2 text-xl font-bold">
              {(t.panchangam as any)[tithiName]} {t.panchangam.tithi} {year}
            </h1>
            <p className="mb-4">
              {interpolate(t.panchangam.tithi_list_desc, {
                year,
                tithiName: (t.panchangam as any)[tithiName],
                city,
                country,
              })}
            </p>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${(t.panchangam as any)[tithiName]} ${t.panchangam.tithi} ${year}`}
              description={`${(t.panchangam as any)[tithiName]} dates and times for ${year}`}
            />
            <LocationAccordion city={city} country={country} />
            <table className="table-tith table-bordered border-gray mt-3 table">
              <tbody>
                {dates.map((group, index) => (
                  <Fragment key={index}>
                    <tr className="bg-gray-opacity text-cente">
                      <td colSpan={2}>
                        <h4 className="pt-3">
                          {interpolate(t.panchangam.tithi_list_month, {
                            tithi: (t.panchangam as any)[tithiName],
                            month: group.monthName,
                          })}
                        </h4>
                      </td>
                    </tr>
                    {group.tithiData.map((tithi, idx) => (
                      <tr key={idx}>
                        <td>
                          <h6>
                            {(t.panchangam as any)[tithi.masaName] ||
                              (t.panchangam as any)[tithi.masaName.toLowerCase()] ||
                              tithi.masaName}{' '}
                            {(t.panchangam as any)[tithi.pakshaName] ||
                              (t.panchangam as any)[tithi.pakshaName.toLowerCase()] ||
                              tithi.pakshaName}{' '}
                            {(t.panchangam as any)[tithi.tithiName] ||
                              (t.panchangam as any)[tithi.tithiName.toLowerCase()] ||
                              tithi.tithiName}
                          </h6>
                        </td>
                        <td>
                          {format(tithi.startTime, 'dd MMM yyyy hh:mm a')} –{' '}
                          {format(tithi.endTime, 'dd MMM yyyy hh:mm a')}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {year && <TithiYearNavigation tithiName={tithiName} currentYear={year} />}
            {year && <TithiList year={year} title="Other Tithi List" currentTithi={tithiName} />}
          </div>
        </Col>
        <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
          <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
            <UpcomingEventsV2 />
          </div>
        </Col>
      </Row>
    </Layout>
  );
}
