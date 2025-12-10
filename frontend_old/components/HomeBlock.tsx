import { CATEGORY_IDS } from '@/constants/stotras';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';

// Interface for translation data
interface StotraTranslation {
  title: string;
  seoTitle: string;
  videoId?: string | null;
  imageUrl?: string | null;
  stotra: string;
  stotraMeaning: string;
  body?: string | null;
}

// Interface for stotra data
export interface Stotra {
  canonicalSlug: string;
  contentType: string;
  stotraTitle: string;
  status: string;
  imageUrl?: string | null;
  categories?: {
    typeIds?: string[];
    devaIds?: string[];
    byNumberIds?: string[];
  };
  translations: {
    en?: StotraTranslation;
    te?: StotraTranslation;
    hi?: StotraTranslation;
    kn?: StotraTranslation;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response interface
interface StotrasResponse {
  stotras: Stotra[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    language: string;
    contentType: string;
  };
}

// HomeBlock component props
interface HomeBlockProps {
  title: string;
  path: string;
  categoryKey: 'ASHTOTTARA_SHATANAMAVALI' | 'SAHASRANAMAVALI' | 'STOTRAS';
  showItems?: number;
  initialStotras?: Stotra[];
}

const HomeBlock: React.FC<HomeBlockProps> = ({
  title,
  path,
  categoryKey,
  showItems = 5,
  initialStotras,
}) => {
  const { t, locale } = useTranslation();
  const [stotras, setStotras] = useState<Stotra[]>(initialStotras || []);
  const [loading, setLoading] = useState(!initialStotras);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have initialStotras and the locale matches (implicit assumption for SSG),
    // we might want to skip the first fetch.
    // However, to be safe and handle client-side navigation where props might not update immediately
    // or if we want to ensure fresh data, we can check.
    // For now, if initialStotras is present, we assume it's valid for the current render.
    // But if locale changes, we MUST fetch.
    if (initialStotras && stotras.length > 0) {
      // Check if we need to re-fetch due to locale change?
      // The parent passes initialStotras based on the page's locale.
      // If the component re-mounts or props change, this effect runs.
      // Let's just fetch if we don't have data OR if we want to update.
      // But to avoid double fetch on mount, we check:
      // If initialStotras is provided, we rely on it for the first render.
      // But we should probably only fetch if stotras is empty or if we want to refresh.
      // Actually, simplest is: fetch if !initialStotras.
      // But what if locale changes? initialStotras comes from parent, which gets it from getStaticProps.
      // getStaticProps runs per locale. So initialStotras should be correct for the locale.
      // So we only need to fetch if initialStotras is NOT provided (client-side nav to a page without SSG data? unlikely for index).
      return;
    }
    fetchStotras();
  }, [locale, categoryKey]);

  const fetchStotras = async () => {
    try {
      setLoading(true);
      const categoryId = CATEGORY_IDS[categoryKey as keyof typeof CATEGORY_IDS];

      if (!categoryId) {
        throw new Error(
          `Invalid categoryKey: ${categoryKey}. Must be one of: ${Object.keys(CATEGORY_IDS).join(', ')}`
        );
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL;
      const apiUrl = `${backendUrl}/rest/stotras?lang=${locale}&page=1&limit=${showItems}&categoryId=${categoryId}&sortBy=createdAt`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${categoryKey}`);
      }

      const data: StotrasResponse = await response.json();
      setStotras(data.stotras);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(`Error fetching ${categoryKey}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Get translation for current locale with fallback
  const getTranslation = (stotra: Stotra) => {
    return (
      stotra.translations[locale as keyof typeof stotra.translations] ||
      stotra.translations.en ||
      stotra.translations.te ||
      stotra.translations.hi ||
      stotra.translations.kn
    );
  };

  // Generate the correct link path for each stotra
  const getStotraLink = (stotra: Stotra, index: number) => {
    const translation = getTranslation(stotra);
    if (!translation) return `${path}/${stotra.canonicalSlug}`;

    return `${path}/${stotra.canonicalSlug}`;
  };

  // Get display title for stotra
  const getDisplayTitle = (stotra: Stotra) => {
    const translation = getTranslation(stotra);
    return translation?.title || stotra.stotraTitle || 'Untitled';
  };

  if (loading) {
    return (
      <Col lg="4" md="6" sm="8" className="col-lg-4 col-md-6 col-sm-8 mb-9">
        <div className="pricing-card gr-hover-shadow-1 rounded-8 bg-white py-2 text-center">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '200px' }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Col>
    );
  }

  if (error || stotras.length === 0) {
    return (
      <Col lg="4" md="6" sm="8" className="col-lg-4 col-md-6 col-sm-8 mb-9">
        <div className="pricing-card gr-hover-shadow-1 rounded-8 bg-white py-3 text-center">
          <div className="price-content light-mode-texts">
            <div className="d-flex align-items-end justify-content-center">
              <h2 className="text-primary gr-text-6 fw-bold mb-0">{title}</h2>
            </div>
            <div className="text-muted mt-4">
              {error ? `Error: ${error}` : 'No content available'}
            </div>
          </div>
        </div>
      </Col>
    );
  }

  return (
    <Col lg="4" md="6" sm="8" className="col-lg-4 col-md-6 col-sm-8 mb-2">
      <div className="pricing-card gr-hover-shadow-1 rounded-8 mx-2 mb-2 mt-2 bg-white py-2 text-center">
        <div className="price-content light-mode-texts">
          <div className="d-flex align-items-end justify-content-center my-3">
            <h2 className="text-primary gr-text-6 fw-bold mb-0">{title}</h2>
          </div>

          <ul className="card-list list-style-border mx-auto mb-3 mt-6 px-4 text-center">
            {stotras.map((stotra, index) => {
              const translation = getTranslation(stotra);
              const borderTop = index !== 0 ? ' border-top' : '';

              if (!translation) return null;

              const tyImage = translation.videoId
                ? `https://i.ytimg.com/vi/${translation.videoId}/hq720.jpg`
                : null;

              const articleImage = translation.imageUrl ? translation.imageUrl : tyImage;

              return (
                <li
                  key={stotra.canonicalSlug}
                  className={`gr-text-8 border-gray-3 d-block mb-0 pt-0 text-black ${borderTop}`}
                >
                  <Link
                    href={getStotraLink(stotra, index)}
                    className="gr-hover-text-orange text-decoration-none text-black"
                  >
                    {index === 0 && articleImage && (
                      <div className="mb-3">
                        <Image
                          className="img-fluid text-center"
                          src={articleImage}
                          alt={translation.title}
                          width={320}
                          height={180}
                          quality={75}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+"
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                      </div>
                    )}
                    <p className="gr-hover-text-orange py-2 text-black">
                      {getDisplayTitle(stotra)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <Link
          href={path}
          className="gr-hover-y gr-text-9 btn btn btn-primary white-text mx-auto mb-3 px-8 py-1"
        >
          {t.panchangam.explore_more} <i className="icon icon-tail-right fw-bold"></i>
        </Link>
      </div>
    </Col>
  );
};

export default HomeBlock;
