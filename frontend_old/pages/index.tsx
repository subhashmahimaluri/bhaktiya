// pages/index.tsx - Home Page (Optimized with Tailwind CSS + SSG)
import { Article } from '@/components/FeaturedArticles';
import { Stotra } from '@/components/HomeBlock';
import Layout from '@/components/Layout/Layout';
import SearchBox from '@/components/Layout/SearchBox';
import { LazyImage } from '@/components/LazyImage';
import PanchangamTable from '@/components/PanchangamTable';
import UpcomingEventsV2, { FestivalDate } from '@/components/UpcomingEvents';
import { CATEGORY_IDS } from '@/constants/stotras';
import { FestivalProvider } from '@/context/FestivalContext';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateFestivalsServerSide } from '@/lib/panchangam/serverFestivals';
import {
  calculatePanchangamServerSide,
  ServerPanchangamResult,
} from '@/lib/panchangam/serverPanchangam';
import { YexaaPanchang } from '@/lib/panchangam/yexaaPanchang';
import { getHomeMetaData } from '@/utils/seo';
import { addDays } from 'date-fns';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

// Lazy-load below-the-fold components for better initial load performance
const FeaturedArticles = dynamic(() => import('@/components/FeaturedArticles'), {
  ssr: true,
  loading: () => <div className="tw-h-64 tw-animate-pulse tw-bg-gray-100" />,
});

const HomeBlock = dynamic(() => import('@/components/HomeBlock'), {
  ssr: true,
  loading: () => <div className="tw-h-48 tw-animate-pulse tw-bg-gray-100" />,
});

interface HomePageProps {
  initialPanchangam?: {
    calendar: any;
    calculated: any;
  };
  initialDate?: string;
  initialStotras?: {
    ashtottara: Stotra[];
    sahasranamavali: Stotra[];
    stotras: Stotra[];
  };
  initialArticles?: Article[];
  initialFestivals?: FestivalDate[];
  initialTithiData?: ServerPanchangamResult;
}

const HomePage: React.FC<HomePageProps> = ({
  initialPanchangam,
  initialDate,
  initialStotras,
  initialArticles,
  initialFestivals,
  initialTithiData,
}) => {
  const { t, locale } = useTranslation();
  const { title, description } = getHomeMetaData(locale);

  return (
    <FestivalProvider>
      <Head>
        {/* Prefetch critical images */}
        <link rel="prefetch" href="/l6-download-appstore.png" as="image" />
        <link rel="prefetch" href="/l6-download-gplay.png" as="image" />
      </Head>
      <Layout title={title} description={description}>
        <div id="home-page-root" className="tw-w-full">
          {/* Critical above-the-fold content - Now with Tailwind CSS only */}
          <div className="tw--mx-3 tw-mt-20 tw-flex tw-flex-wrap tw-pt-5">
            <div className="tw-order-1 tw-mt-3 tw-w-full tw-px-3 tw-pt-5 md:tw-order-1 lg:tw-mt-5 lg:tw-w-[58.333333%]">
              <div
                className="tw-rounded-md tw-bg-white tw-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]"
                style={{ contentVisibility: 'visible' }}
              >
                <PanchangamTable
                  showViewMore={true}
                  initialData={initialPanchangam}
                  initialTithiData={initialTithiData}
                  initialFestivals={initialFestivals}
                />
              </div>
            </div>
            <div className="tw-order-2 tw-mt-3 tw-w-full tw-px-3 tw-pt-5 md:tw-order-2 lg:tw-mt-5 lg:tw-w-[41.666667%] lg:tw-pt-5">
              <div
                className="tw-rounded-md tw-bg-white tw-text-black tw-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]"
                style={{ contentVisibility: 'visible' }}
              >
                <SearchBox layout="vertical" />
              </div>

              {/* Upcoming Festivals and Vraths Section - LCP element */}
              <div
                className="tw-mt-4 tw-rounded-md tw-bg-white tw-p-4 tw-text-black tw-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]"
                style={{ contentVisibility: 'visible' }}
              >
                <UpcomingEventsV2
                  isHomePage={true}
                  maxHeight={500}
                  maxEvents={10}
                  initialFestivals={initialFestivals}
                />
              </div>

              <div className="tw-mt-4 tw-rounded-md tw-bg-white tw-text-black tw-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]">
                <div className="tw-mb-3 tw-mt-3 tw-bg-white tw-px-5 tw-py-3 tw-shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]">
                  <p className="tw-mb-2 tw-text-sm tw-font-semibold tw-opacity-70">
                    Download Our App
                  </p>
                  <div className="tw-flex tw-gap-3">
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.yexaa.ssbhakthi"
                      target="_blank"
                    >
                      <LazyImage
                        src="/l6-download-appstore.png"
                        alt="Download from App Store"
                        width={120}
                        height={40}
                        quality={85}
                        priority={false}
                      />
                    </Link>
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.yexaa.ssbhakthi"
                      target="_blank"
                    >
                      <LazyImage
                        src="/l6-download-gplay.png"
                        alt="Download from Google Play"
                        width={120}
                        height={40}
                        quality={85}
                        priority={false}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tw--mx-3 tw-flex tw-flex-wrap tw-justify-center">
            <HomeBlock
              title={t.stotra.ashtottara_shatanamavali}
              path="/ashtothram"
              categoryKey="ASHTOTTARA_SHATANAMAVALI"
              showItems={5}
              initialStotras={initialStotras?.ashtottara}
            />
            <HomeBlock
              title={t.stotra.sahasranamavali}
              path="/sahasranamavali"
              categoryKey="SAHASRANAMAVALI"
              showItems={5}
              initialStotras={initialStotras?.sahasranamavali}
            />
            <HomeBlock
              title={t.stotra.stotras}
              path="/stotras"
              categoryKey="STOTRAS"
              showItems={5}
              initialStotras={initialStotras?.stotras}
            />
          </div>
          <FeaturedArticles showItems={4} initialArticles={initialArticles} />
        </div>
      </Layout>
    </FestivalProvider>
  );
};

export default HomePage;

// For static generation with ISR (Incremental Static Regeneration)
// Revalidate at midnight for fresh daily Panchangam data
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Calculate seconds until next midnight for optimal revalidation
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const secondsUntilMidnight = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);

  // Server-side Panchangam Calculation
  let initialPanchangam = null;
  let initialDate = null;
  let initialStotras = undefined;
  let initialArticles = undefined;
  let initialFestivals = undefined;
  let initialTithiData = undefined;

  // Default location: Hyderabad, India
  const lat = 17.385;
  const lng = 78.4867;
  // Get current time in IST
  const dateInIndiaStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const dateInIndia = new Date(dateInIndiaStr);
  initialDate = dateInIndia.toISOString();

  try {
    const panchang = new YexaaPanchang();
    const calendarData = panchang.calendar(dateInIndia, lat, lng);
    const calculatedData = panchang.calculate(dateInIndia);

    // Serialize data
    initialPanchangam = JSON.parse(
      JSON.stringify({
        calendar: calendarData,
        calculated: calculatedData,
      })
    );

    // Calculate detailed Tithi/Anga data for TithiListTable
    const tithiData = calculatePanchangamServerSide(dateInIndia, lat, lng);
    initialTithiData = JSON.parse(JSON.stringify(tithiData));
  } catch (error) {
    console.error('Error generating static panchangam:', error);
  }

  // Fetch Stotras and Articles
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
    const currentLocale = locale || 'en';

    const fetchStotras = async (categoryId: string) => {
      const res = await fetch(
        `${backendUrl}/rest/stotras?lang=${currentLocale}&page=1&limit=5&categoryId=${categoryId}&sortBy=createdAt`
      );
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.stotras;
    };

    const [ashtottara, sahasranamavali, stotras, articlesRes] = await Promise.all([
      fetchStotras(CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI),
      fetchStotras(CATEGORY_IDS.SAHASRANAMAVALI),
      fetchStotras(CATEGORY_IDS.STOTRAS),
      fetch(`${backendUrl}/rest/articles?lang=${currentLocale}&status=published&page=1&limit=4`),
    ]);

    initialStotras = {
      ashtottara: ashtottara || [],
      sahasranamavali: sahasranamavali || [],
      stotras: stotras || [],
    };

    if (articlesRes.ok) {
      const articlesData = await articlesRes.json();
      initialArticles = articlesData.articles;
    }
  } catch (error) {
    console.error('Error fetching static content:', error);
  }

  // Calculate Upcoming Festivals (Next 30 days)
  try {
    const year = dateInIndia.getFullYear();
    const festivals = await calculateFestivalsServerSide(year, lat, lng, 5.5); // 5.5 is IST offset

    if (dateInIndia.getMonth() === 11) {
      const nextYearFestivals = await calculateFestivalsServerSide(year + 1, lat, lng, 5.5);
      festivals.push(...nextYearFestivals);
    }

    const filterStartDate = new Date(dateInIndia);
    filterStartDate.setHours(0, 0, 0, 0);
    
    const endDate = addDays(filterStartDate, 30);
    const festivalMap = new Map<string, Array<{ name: string; url?: string }>>();

    festivals.forEach(festival => {
      // Use filterStartDate to ensure we include festivals from the beginning of today
      if (festival.date >= filterStartDate && festival.date <= endDate) {
        const dateKey = festival.date.toISOString().split('T')[0];
        const festivalName =
          locale === 'te' ? festival.festival.festival_te : festival.festival.festival_en;

        if (!festivalMap.has(dateKey)) {
          festivalMap.set(dateKey, []);
        }
        festivalMap.get(dateKey)!.push({
          name: festivalName,
          url: festival.festival.festival_url,
        });
      }
    });

    const results: FestivalDate[] = [];
    festivalMap.forEach((fests, dateKey) => {
      results.push({
        date: new Date(dateKey),
        festivals: fests,
      });
    });

    results.sort((a, b) => a.date.getTime() - b.date.getTime());
    initialFestivals = JSON.parse(JSON.stringify(results.slice(0, 10)));
  } catch (error) {
    console.error('Error calculating static festivals:', error);
  }

  return {
    props: {
      initialPanchangam,
      initialDate,
      initialStotras: initialStotras || null,
      initialArticles: initialArticles || null,
      initialFestivals: initialFestivals || null,
      initialTithiData: initialTithiData || null,
    },
    revalidate: Math.min(secondsUntilMidnight, 3600),
  };
};
