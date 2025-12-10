import {
  formatMuhurtaTimes,
  getMasaNameForPage,
  getTithiNameForPage,
  parseNumericString,
} from '@/utils/festivalPageUtils';
import {
  formatLocalizedFullDate,
  formatShivaratriMuhurta,
  getPakshaName,
} from '@/utils/festivalUtils';

interface FestivalDetailsProps {
  festivalName: string;
  date?: Date;
  locale: string;
  tithiData?: {
    masaNumber: string;
    tithiNumber: string;
    tithiStarts?: Date;
    tithiEnds?: Date;
  };
  translationKeys: {
    tithi_start: string;
    tithi_end: string;
    start: string;
    end: string;
    muhurtha: string;
    shivratri_muhurtha: string;
  };
  muhurthaStart?: Date | undefined;
  muhurthaEnd?: Date | undefined;
  calculationType?: string | undefined;
}

/**
 * Festival details component displaying tithi and timing information
 * Shows masa, paksha, tithi, and muhurta times
 */
export default function FestivalDetails({
  festivalName,
  date,
  locale,
  tithiData,
  translationKeys,
  muhurthaStart,
  muhurthaEnd,
  calculationType,
}: FestivalDetailsProps) {
  if (!tithiData) {
    return null;
  }

  const masaNumber = parseNumericString(tithiData.masaNumber, 0);
  const tithiNumber = parseNumericString(tithiData.tithiNumber, 0);

  const masaName = getMasaNameForPage(masaNumber, locale);
  const tithiName = getTithiNameForPage(tithiNumber, locale);
  const pakshaInfo = getPakshaName(tithiNumber);
  const pakshaName = pakshaInfo ? (locale === 'te' ? pakshaInfo.name_TE : pakshaInfo.name) : '';

  const formattedDate = date ? formatLocalizedFullDate(date, locale) : 'N/A';

  return (
    <>
      <div className="mt-3 text-center">
        <div className="mb-4">
          <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>
            {festivalName}: {formattedDate}
          </h4>
        </div>

        {tithiData.tithiStarts && (
          <div className="mb-4">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <strong>
                  {masaName} {pakshaName} {tithiName}
                </strong>
                <br />
                {translationKeys.tithi_start} -{' '}
                {formatMuhurtaTimes(tithiData.tithiStarts, tithiData.tithiStarts)}
              </li>
              <li className="mb-2">
                <strong>
                  {masaName} {pakshaName} {tithiName}
                </strong>
                <br />
                {translationKeys.tithi_end} -{' '}
                {formatMuhurtaTimes(tithiData.tithiEnds, tithiData.tithiEnds)}
              </li>
            </ul>
          </div>
        )}
        {/* Shivaratri Muhurta Section (if applicable) */}
        {tithiData.tithiStarts && muhurthaStart && muhurthaEnd && (
          <div>
            <h5 className="fw-bold text-dark">
              {calculationType === 'Shivaratri'
                ? `${translationKeys.shivratri_muhurtha}`
                : `${translationKeys.muhurtha}`}
            </h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <div className="text-muted">
                  {translationKeys.start}:{' '}
                  {formatShivaratriMuhurta(muhurthaStart, muhurthaEnd, locale).start}
                </div>
                <div className="text-muted">
                  {translationKeys.end}:{' '}
                  {formatShivaratriMuhurta(muhurthaStart, muhurthaEnd, locale).end}
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
