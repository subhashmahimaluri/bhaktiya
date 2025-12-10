import { EclipseInfo } from '@/hooks/useEclipsesApi';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Col } from 'react-bootstrap';

interface EclipseCardProps {
  eclipse: EclipseInfo;
  locale: string;
  timezone: string;
}

// Function to generate slug from eclipse data
const generateEclipseSlug = (eclipse: EclipseInfo): string => {
  const date = new Date(eclipse.datetime_local);
  const month = date.toLocaleString('en', { month: 'long' }).toLowerCase();
  const year = date.getFullYear();
  const eclipseType = eclipse.type === 'solar' ? 'solar' : 'lunar';
  const eclipseKind = eclipse.eclipse_type.toLowerCase().replace(/\s+/g, '-');

  return `${month}-${year}-${eclipseType}-${eclipseKind}`;
};

// Function to get eclipse image based on type and locale
const getEclipseImage = (eclipse: EclipseInfo, locale: string): string => {
  const isPartial = eclipse.eclipse_type.toLowerCase().includes('partial');
  const isLunar = eclipse.type === 'lunar';
  const isSolar = eclipse.type === 'solar';

  if (isLunar) {
    if (isPartial) {
      return locale === 'te'
        ? '/images/eclipse/partial_lunar_eclipse_te.png'
        : '/images/eclipse/partial_lunar_eclipse_en.png';
    } else {
      return locale === 'te'
        ? '/images/eclipse/lunar_eclipse_te.png'
        : '/images/eclipse/lunar_eclipse_en.png';
    }
  } else if (isSolar) {
    if (isPartial) {
      return locale === 'te'
        ? '/images/eclipse/partial_solar_eclipse_te.png'
        : '/images/eclipse/partial_solar_eclipse_en.png';
    } else {
      return locale === 'te'
        ? '/images/eclipse/solar_eclipse_te.png'
        : '/images/eclipse/solar_eclipse_en.png';
    }
  }

  // Fallback image
  return '/images/eclipse/lunar_eclipse_en.png';
};

// Function to format date using translation object
const formatLocalizedDate = (date: Date, t: any, timezone: string): string => {
  const weekday = date.toLocaleString('en', { weekday: 'long', timeZone: timezone }).toLowerCase();
  const month = date.toLocaleString('en', { month: 'long', timeZone: timezone }).toLowerCase();
  const day = date.getDate();
  const year = date.getFullYear();

  // Get translated weekday and month names
  const translatedWeekday = t.panchangam[weekday] || weekday;
  const translatedMonth = t.panchangam[month] || month;

  // Format: "Friday 14 March, 2025" or "శుక్రవారం 14 మార్చి, 2025"
  return `${translatedWeekday} ${day} ${translatedMonth}, ${year}`;
};

export default function EclipseCard({ eclipse, locale, timezone }: EclipseCardProps) {
  const { t } = useTranslation();

  // Memoize calculations to prevent unnecessary re-renders
  const cardData = useMemo(() => {
    const slug = generateEclipseSlug(eclipse);
    const eclipseImage = getEclipseImage(eclipse, locale);
    const formattedDate = formatLocalizedDate(new Date(eclipse.datetime_local), t, timezone);

    return {
      slug,
      eclipseImage,
      formattedDate,
      eclipse_type_label: eclipse.eclipse_type_label,
    };
  }, [eclipse, locale, timezone, t]);

  return (
    <Col sm="12" md="6" lg="6" xl="6" className="h5 mb-3">
      <Link
        href={`/eclipse/${cardData.slug}`}
        className="feature-widget focus-reset d-flex flex-column min-height-px-280 rounded-4 gr-hover-shadow-1 border bg-white text-center"
      >
        <div className="mb-auto">
          {cardData.eclipseImage ? (
            <Image
              className="img-fluid text-center"
              src={cardData.eclipseImage}
              alt={`${eclipse.eclipse_type} Eclipse`}
              width={720}
              height={405}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="video-placeholder d-flex align-items-center justify-content-center position-relative">
              <div className="video-title-overlay position-absolute end-0 start-0 p-3">
                <span className="fw-bold text-white">{eclipse.eclipse_type}</span>
              </div>
            </div>
          )}
          <p className="text-muted mb-2 px-4 pt-3">{cardData.formattedDate}</p>
          <h3 className="gr-text-7 text-blackish-blue px-4 pt-3 text-left">
            {t.eclipse[cardData.eclipse_type_label] || eclipse.eclipse_type}
          </h3>
          <span className="btn-link with-icon gr-text-blue gr-text-9 fw-bold float-right py-3 text-right text-end">
            {t.stotra.read_more} <i className="icon icon-tail-right fw-bold"></i>
          </span>
        </div>
      </Link>
    </Col>
  );
}
