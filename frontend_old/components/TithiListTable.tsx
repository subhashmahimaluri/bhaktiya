import { useLocation } from '@/context/LocationContext';
import { useAstronomyBundle } from '@/hooks/useAstronomyBundle';
import { useTranslation } from '@/hooks/useTranslation';
import { useYexaaPanchang } from '@/hooks/useYexaaPanchang';
import {
  DisplayAnga,
  ServerPanchangamData,
  ServerPanchangamResult,
} from '@/lib/panchangam/serverPanchangam';
import { PanchangamData } from '@/types/panchangam';
import { getLocalizedWeekday } from '@/utils/calendarUtils';
import { getAllAngasForDay } from '@/utils/getAllAngasForDay';
import { getSpecialKaalForDay } from '@/utils/getSpecialKaal';
import {
  abhijitMuhurth,
  brahmaMuhurtham,
  durMuhurtham,
  getRahuKalam,
  pradoshaTime,
} from '@/utils/timeData';
import { formatToDateTimeIST, formatToLocalTimeZone, startEndDateFormat } from '@/utils/utils';
import { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { YexaaPanchang } from '../lib/panchangam';

// Types for anga display
interface AngaEntry {
  name: string;
  start: Date;
  end: Date;
  ino: number;
  paksha?: string; // For tithi entries
}

interface PanchangamProps {
  date?: string | Date;
  showViewMore?: boolean;
  initialData?: ServerPanchangamResult | null;
}

export default function TithiListTable({
  date,
  showViewMore = false,
  initialData,
}: PanchangamProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [panchangamData, setPanchangamData] = useState<PanchangamData | ServerPanchangamData>(
    initialData?.panchangamData || {}
  );
  const [displayTithis, setDisplayTithis] = useState<DisplayAnga[]>(
    initialData?.displayTithis || []
  );
  const [displayNakshatras, setDisplayNakshatras] = useState<DisplayAnga[]>(
    initialData?.displayNakshatras || []
  );
  const [displayYogas, setDisplayYogas] = useState<DisplayAnga[]>(initialData?.displayYogas || []);
  const [displayKaranas, setDisplayKaranas] = useState<DisplayAnga[]>(
    initialData?.displayKaranas || []
  );

  const { t, locale } = useTranslation();
  const { lat, lng, timezone } = useLocation();
  const panchangamDate = useMemo(() => (date ? new Date(date) : new Date()), [date]);

  // Track if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  // Skip hooks if we have initial data AND we're on SSR OR location matches default Hyderabad
  const shouldUseInitialData = !isClient || (lat === 17.385044 && lng === 78.486671);
  const skipHooks = !!initialData && shouldUseInitialData;

  const { sunrise, sunset, nextDaySunrise, moonrise, moonset, moonriseFull, moonsetFull } =
    useAstronomyBundle(panchangamDate);

  // Use the YexaaPanchang hook
  const {
    calendar: yexaaCalendar,
    calculated: yexaaCalculated,
    isLoading: yexaaIsLoading,
    error: yexaaError,
  } = useYexaaPanchang({
    date: panchangamDate,
    lat,
    lng,
    enabled: Boolean(lat && lng) && !skipHooks,
  });

  // Helper function to get sunrise time as Date object
  const getSunriseDate = (date: Date, lat: number, lng: number): Date => {
    const panchang = new YexaaPanchang();
    const sun = panchang.sunTimer(date, lat, lng);
    return new Date(sun.sunRise || date);
  };

  // Helper function to calculate all angas for the day according to Telugu Panchangam rules
  const getDayAngas = (
    entries: AngaEntry[],
    sunRise: Date,
    angaType: 'tithi' | 'nakshatra' | 'yoga' | 'karana'
  ): DisplayAnga[] => {
    const nextSunrise = new Date(sunRise.getTime() + 24 * 60 * 60 * 1000);
    const results: DisplayAnga[] = [];

    for (const anga of entries) {
      const start = new Date(anga.start);
      const end = new Date(anga.end);

      // Check if this anga is relevant for the day (intersects with sunrise to next sunrise)
      if (end <= sunRise || start >= nextSunrise) {
        continue; // Skip angas that don't intersect with our day
      }

      let tag = '';
      const time = `${formatToDateTimeIST(start, timezone)} – ${formatToDateTimeIST(end, timezone)}`;

      // Apply Telugu Panchangam rules - only for Tithi entries
      if (angaType === 'tithi') {
        if (start > sunRise && end < nextSunrise) {
          // Anga begins and ends between two sunrises
          tag = ' [Kshaya]';
        } else if (start < sunRise && end > nextSunrise) {
          // Anga spans across two consecutive sunrises
          tag = ' [Vriddhi]';
        } else if (end.getTime() === sunRise.getTime()) {
          // Anga ends exactly at sunrise - next anga is official (normal case, no tag)
          // This anga should not be displayed as it's not the day's main anga
          continue;
        }
      }
      // else: normal display (anga present at sunrise)

      const pakshaPrefix = anga.paksha ? `${anga.paksha} ` : '';
      const label = `${pakshaPrefix}${anga.name}${tag}`;

      results.push({
        label,
        time,
      });
    }

    return results;
  };

  useEffect(() => {
    if (skipHooks) return;

    if (!yexaaCalendar || !yexaaCalculated) {
      setPanchangamData({});
      setDisplayTithis([]);
      setDisplayNakshatras([]);
      setDisplayYogas([]);
      setDisplayKaranas([]);
      return;
    }
    try {
      setPanchangamData({
        tithi: String(yexaaCalculated.Tithi?.name || ''),
        tithiTime: startEndDateFormat(
          new Date(yexaaCalculated.Tithi.start),
          new Date(yexaaCalculated.Tithi.end)
        ),
        nakshatra: String(yexaaCalculated.Nakshatra?.name_TE || ''),
        nakshatraTime: startEndDateFormat(
          new Date(yexaaCalculated.Nakshatra.start),
          new Date(yexaaCalculated.Nakshatra.end)
        ),
        yoga: String(yexaaCalculated.Yoga?.name_TE || ''),
        yogaTime: startEndDateFormat(
          new Date(yexaaCalculated.Yoga.start),
          new Date(yexaaCalculated.Yoga.end)
        ),
        karana: String(yexaaCalculated.Karna?.name_TE || ''),
        karanaTime: startEndDateFormat(
          new Date(yexaaCalculated.Karna.start),
          new Date(yexaaCalculated.Karna.end)
        ),
        moonMasa: String(yexaaCalendar.MoonMasa?.name_TE || ''),
        masa: String(yexaaCalendar.Masa?.name_TE || ''),
        paksha: String(yexaaCalculated.Paksha?.name || ''),
        day: String(yexaaCalculated.Day?.name_TE || ''),
        ayana: String(yexaaCalendar?.Ayana.name_TE || ''),
        ritu: String(yexaaCalendar?.DrikRitu.name_TE || ''),
        teluguYear: String(yexaaCalendar?.TeluguYear.name_TE || ''),
      });

      // Calculate display angas according to Telugu Panchangam rules
      const sunriseTime = getSunriseDate(panchangamDate, lat, lng);

      const allTithis = getAllAngasForDay(panchangamDate, lat, lng, 'tithi');
      const dayTithis = getDayAngas(allTithis, sunriseTime, 'tithi');
      setDisplayTithis(dayTithis);

      const allNakshatras = getAllAngasForDay(panchangamDate, lat, lng, 'nakshatra');
      const dayNakshatras = getDayAngas(allNakshatras, sunriseTime, 'nakshatra');
      setDisplayNakshatras(dayNakshatras);

      const allYogas = getAllAngasForDay(panchangamDate, lat, lng, 'yoga');
      const dayYogas = getDayAngas(allYogas, sunriseTime, 'yoga');
      setDisplayYogas(dayYogas);

      const allKaranas = getAllAngasForDay(panchangamDate, lat, lng, 'karana');
      const dayKaranas = getDayAngas(allKaranas, sunriseTime, 'karana');
      setDisplayKaranas(dayKaranas);
    } catch (err) {
      setPanchangamData({});
      setDisplayTithis([]);
      setDisplayNakshatras([]);
      setDisplayYogas([]);
      setDisplayKaranas([]);
    }
  }, [yexaaCalendar, yexaaCalculated, lat, lng, date, skipHooks]);

  const renderAngaItem = (
    title: string,
    displayAngas: DisplayAnga[],
    fallbackKey?: string,
    fallbackTime?: string
  ) => (
    <div className="panchang-date">
      <h4 className="gr-text-6 text-black">{title}</h4>
      <ul className="list-unstyled gr-text-8 border-bottom pb-4">
        {displayAngas.length > 0
          ? displayAngas.map((anga, index) => (
              <li key={index}>
                <span className="fw-bold">
                  {(t.panchangam as any)[anga.label.split(' [')[0]] || anga.label.split(' [')[0]}
                </span>
                {anga.label.includes('[') && (
                  <span className="text-warning ms-1">{anga.label.match(/\[.*\]/)?.[0]}</span>
                )}{' '}
                :<span className="ms-1">{anga.time}</span>
              </li>
            ))
          : fallbackKey &&
            fallbackTime && (
              <li>
                <span className="fw-bold">
                  {fallbackKey ? (t.panchangam as any)[fallbackKey] || fallbackKey : ''}
                </span>{' '}
                :<span className="ms-1">{fallbackTime}</span>
              </li>
            )}
      </ul>
    </div>
  );

  const sunData = { sunrise: sunrise, sunset: sunset, nextDaySunrise: nextDaySunrise };
  const amrits = getSpecialKaalForDay('amrit', displayNakshatras, panchangamDate, sunData);
  const varjyams = getSpecialKaalForDay('varjyam', displayNakshatras, panchangamDate, sunData);

  return (
    <>
      <div className="panchang-date">
        <h4 className="gr-text-6 text-black">{t.panchangam.tithi}</h4>
        <ul className="list-unstyled gr-text-8 border-bottom pb-4">
          {displayTithis.length > 0 ? (
            displayTithis.map((tithi, index) => {
              const labelWithoutTag = tithi.label.split(' [')[0];
              const parts = labelWithoutTag.split(' ');
              let displayLabel = '';

              if (parts.length >= 2) {
                // Has paksha (e.g., "sukla_paksha vidiya")
                const paksha = parts[0];
                const tithiName = parts.slice(1).join(' ');
                const pakshaTranslation = (t.panchangam as any)[paksha] || paksha;
                const tithiTranslation = (t.panchangam as any)[tithiName] || tithiName;
                displayLabel = `${pakshaTranslation} ${tithiTranslation}`;
              } else {
                // No paksha, just tithi name
                displayLabel = (t.panchangam as any)[labelWithoutTag] || labelWithoutTag;
              }

              return (
                <li key={index}>
                  <span className="fw-bold">{displayLabel}</span>
                  {tithi.label.includes('[') && (
                    <span className="text-warning ms-1">{tithi.label.match(/\[.*\]/)?.[0]}</span>
                  )}{' '}
                  :<span className="ms-1">{tithi.time}</span>
                </li>
              );
            })
          ) : (
            <li>
              <span className="fw-bold">
                {panchangamData.tithi
                  ? (t.panchangam as any)[panchangamData.tithi] || panchangamData.tithi
                  : ''}
              </span>{' '}
              :<span className="ms-1">{panchangamData.tithiTime}</span>
            </li>
          )}
        </ul>
      </div>
      {renderAngaItem(
        t.panchangam.nakshatra,
        displayNakshatras,
        panchangamData.nakshatra,
        panchangamData.nakshatraTime
      )}
      {renderAngaItem(
        (t.panchangam as any).karana || 'Karana',
        displayKaranas,
        panchangamData.karana,
        panchangamData.karanaTime
      )}
      {renderAngaItem(
        t.panchangam.yoga,
        displayYogas,
        panchangamData.yoga,
        panchangamData.yogaTime
      )}
      {showViewMore && !isExpanded && (
        <div className="my-3 text-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewMoreClick}
            className="px-4"
          >
            {(t as any).upcomingEvents?.viewMore}
          </Button>
        </div>
      )}

      {(!showViewMore || isExpanded) && (
        <>
          {/* Inauspicious Period */}
          <div className="panchang-date">
            <h4 className="gr-text-6 text-black">{t.panchangam.inauspicious_period}</h4>
            <ul className="list-unstyled gr-text-8 border-bottom pb-4">
              <li>
                <span className="fw-bold">{t.panchangam.rahu}</span> :{' '}
                {sunrise && sunset
                  ? getRahuKalam(
                      sunrise,
                      sunset,
                      getLocalizedWeekday(panchangamDate, 'en'),
                      timezone
                    )?.rahu
                  : 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.gulika}</span> :{' '}
                {sunrise && sunset
                  ? getRahuKalam(
                      sunrise,
                      sunset,
                      getLocalizedWeekday(panchangamDate, 'en'),
                      timezone
                    )?.gulika
                  : 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.yamaganda}</span> :{' '}
                {sunrise && sunset
                  ? getRahuKalam(
                      sunrise,
                      sunset,
                      getLocalizedWeekday(panchangamDate, 'en'),
                      timezone
                    )?.yamaganda
                  : 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.dur_muhurat}</span> :{' '}
                {sunrise &&
                  sunset &&
                  durMuhurtham(sunrise, sunset, getLocalizedWeekday(panchangamDate, 'en'))}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.varjyam}</span> :{' '}
                {varjyams.length > 0
                  ? varjyams.map((varjyam, index) => (
                      <span key={index}>
                        {formatToLocalTimeZone(varjyam.rawStart, timezone)} -{' '}
                        {formatToLocalTimeZone(varjyam.rawEnd, timezone)}
                        {index < varjyams.length - 1 && ', '}
                      </span>
                    ))
                  : 'N/A'}
              </li>
            </ul>
          </div>
          {/* Auspicious Period */}
          <div className="panchang-date">
            <h4 className="gr-text-6 text-black">{t.panchangam.auspicious_period}</h4>
            <ul className="list-unstyled gr-text-8 border-bottom pb-4">
              <li>
                <span className="fw-bold">{t.panchangam.abhijit_muhurat}</span> :{' '}
                {(sunrise && sunset && abhijitMuhurth(sunrise, sunset)) || 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.brahma_muhurat}</span> :{' '}
                {(sunrise && timezone && brahmaMuhurtham(sunrise, timezone)) || 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.pradosha_time}</span> :{' '}
                {sunset && nextDaySunrise ? pradoshaTime(sunset, nextDaySunrise) : 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.amrit_kaal}</span> :{' '}
                {amrits.length > 0
                  ? amrits.map((amrit, index) => (
                      <span key={index}>
                        {formatToLocalTimeZone(amrit.rawStart, timezone)} -{' '}
                        {formatToLocalTimeZone(amrit.rawEnd, timezone)}
                        {index < amrits.length - 1 && ', '}
                      </span>
                    ))
                  : 'N/A'}
              </li>
            </ul>
          </div>

          {/* Sun Moon Time */}
          <div className="panchang-date">
            <h4 className="gr-text-6 text-black">{t.panchangam.sun_moon_time}</h4>
            <ul className="list-unstyled gr-text-8">
              <li>
                <span className="fw-bold">{t.panchangam.sunrise}</span> : {sunrise || 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.sunset}</span> : {sunset || 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.moonrise}</span> : {moonriseFull || 'N/A'}
              </li>
              <li>
                <span className="fw-bold">{t.panchangam.moonset}</span> : {moonsetFull || 'N/A'}
              </li>
            </ul>
          </div>

          {showViewMore && isExpanded && (
            <div className="my-3 text-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleViewMoreClick}
                className="px-4"
              >
                {(t as any).upcomingEvents?.showLess}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
