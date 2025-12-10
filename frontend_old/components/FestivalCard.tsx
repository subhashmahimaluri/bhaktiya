import { useTranslation } from '@/hooks/useTranslation';
import { formatDateLocalized } from '@/utils/dateFormatUtils';
import { FESTIVALS } from '@/utils/festivals';
import { getLocalizedImagePath } from '@/utils/festivalUtils';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Col } from 'react-bootstrap';

// Define the Festival interface based on the data structure in festivals.js
interface Festival {
  name: string;
  name_te: string;
  path: string;
  image: string;
}

// FestivalOccurrence interface from useAllFestivalsV2
interface FestivalOccurrence {
  date: Date;
  festival: {
    festival_name: string;
    festival_en: string;
    festival_te: string;
    vratha_name: string;
    festival_url?: string;
    image?: string;
  };
}

interface FestivalCardProps {
  festival: Festival | FestivalOccurrence;
  locale: string;
  isDynamic?: boolean;
}

// Function to get festival image based on locale
const getFestivalImage = (festival: Festival, locale: string): string => {
  return festival.image;
};

// Function to get festival name based on locale
const getFestivalName = (festival: Festival, locale: string): string => {
  return locale === 'te' ? festival.name_te : festival.name;
};

export default function FestivalCard({ festival, locale, isDynamic = false }: FestivalCardProps) {
  const { t } = useTranslation();

  // Memoize calculations to prevent unnecessary re-renders
  const cardData = useMemo(() => {
    if (isDynamic) {
      // Handle dynamic festival data from useAllFestivalsV2
      const dynamicFestival = festival as FestivalOccurrence;
      const festivalName =
        locale === 'te'
          ? dynamicFestival.festival.festival_te
          : dynamicFestival.festival.festival_en;

      // Use festival_url from the data if available, otherwise construct from vratha_name
      const festivalPath =
        dynamicFestival.festival.festival_url ||
        (dynamicFestival.festival.vratha_name
          ? `/calendar/festivals/${dynamicFestival.festival.vratha_name}`
          : '#');

      // Use image from the data if available, otherwise find matching festival in FESTIVALS array
      let festivalImage = dynamicFestival.festival.image;

      if (!festivalImage) {
        // Find matching festival in FESTIVALS array to get image
        // Match with festival_name instead of vratha_name
        const staticFestival = FESTIVALS.find(
          (f: Festival) =>
            f.name.toLowerCase() === dynamicFestival.festival.festival_name?.toLowerCase()
        );

        festivalImage = staticFestival
          ? locale === 'te'
            ? staticFestival.image_te
            : staticFestival.image
          : '';
      }

      return {
        festivalImage,
        festivalName,
        path: festivalPath,
        date: dynamicFestival.date,
      };
    } else {
      // Handle static festival data from festivals.js
      const staticFestival = festival as Festival;
      const festivalImage = getFestivalImage(staticFestival, locale);
      const festivalName = getFestivalName(staticFestival, locale);

      return {
        festivalImage,
        festivalName,
        path: staticFestival.path,
        date: null,
      };
    }
  }, [festival, locale, isDynamic]);

  return (
    <Col sm="12" md="6" lg="4" className="h5 mb-3">
      <Link
        href={cardData.path}
        className="feature-widget focus-reset d-flex flex-column min-height-px-280 rounded-4 gr-hover-shadow-1 border bg-white text-center"
      >
        <div className="mb-auto">
          {cardData.festivalImage ? (
            <Image
              className="img-fluid text-center"
              src={getLocalizedImagePath(cardData.festivalImage, locale) || cardData.festivalImage}
              alt={cardData.festivalName}
              width={720}
              height={405}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="video-placeholder d-flex align-items-center justify-content-center position-relative">
              <div className="video-title-overlay position-absolute end-0 start-0 p-3">
                <span className="fw-bold text-white">{cardData.festivalName}</span>
              </div>
            </div>
          )}
          <h3 className="gr-text-7 text-blackish-blue px-4 pt-3 text-left">
            {cardData.festivalName}
          </h3>
          {cardData.date && (
            <p className="text-muted festival-date px-2 text-left">
              {formatDateLocalized(cardData.date, locale, t)}
            </p>
          )}
          <span className="btn-link with-icon gr-text-blue gr-text-9 fw-bold float-right py-3 text-right text-end">
            {t.stotra.read_more} <i className="icon icon-tail-right fw-bold"></i>
          </span>
        </div>
      </Link>
    </Col>
  );
}
