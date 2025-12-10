import { CONTENT_TYPE_ROUTES } from '@/types/search';
import ashtothramUrls from '@/utils/stotraurls/ashtothram';
import bhajansUrls from '@/utils/stotraurls/bhajans';
import bhakthiSongsUrls from '@/utils/stotraurls/bhakthi-songs';
import sahasranamamUrls from '@/utils/stotraurls/sahasranamam';
import sahasranamavaliUrls from '@/utils/stotraurls/sahasranamavali';
import stotrasUrls from '@/utils/stotraurls/stotras';

// Backend URL configuration
const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to generate date range for 3 years
const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Helper function to generate month names
const getMonthNames = (): string[] => [
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
];

// Helper function to generate Tithi names
const getTithiNames = (): string[] => [
  'padyami',
  'vidiya',
  'thadiya',
  'chavithi',
  'panchami',
  'shashti',
  'saptami',
  'ashtami',
  'navami',
  'dasami',
  'ekadasi',
  'dwadasi',
  'thrayodasi',
  'chaturdasi',
  'pournami',
  'amavasya',
];

// Generate Panchangam URLs (daily pages for 3 years)
const generatePanchangamUrls = (): string[] => {
  const urls: string[] = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st of current year
  const endDate = new Date(currentYear + 2, 11, 31); // December 31st of year+2

  const dates = generateDateRange(startDate, endDate);

  for (const date of dates) {
    const dateStr = formatDate(date);
    // Telugu version
    urls.push(`/panchangam/${dateStr}`);
    // English version
    urls.push(`/panchangam/${dateStr}`);
  }

  return urls;
};

// Generate Calendar URLs (monthly pages for 3 years)
const generateCalendarUrls = (): string[] => {
  const urls: string[] = [];
  const currentYear = new Date().getFullYear();
  const months = getMonthNames();

  for (let year = currentYear; year <= currentYear + 2; year++) {
    for (const month of months) {
      // Telugu version
      urls.push(`/calendar/${month}-${year}`);
      // English version
      urls.push(`/calendar/${month}-${year}`);
    }
  }

  return urls;
};

// Generate Tithi URLs (16 tithis per year for 3 years)
const generateTithiUrls = (): string[] => {
  const urls: string[] = [];
  const currentYear = new Date().getFullYear();
  const tithis = getTithiNames();

  for (let year = currentYear; year <= currentYear + 2; year++) {
    for (const tithi of tithis) {
      // Telugu version
      urls.push(`/calendar/tithi/${tithi}-${year}`);
      // English version
      urls.push(`/en/calendar/tithi/${tithi}-${year}`);
    }
  }

  return urls;
};

// Fetch content slugs from backend
const fetchContentSlugs = async (contentType: string, locale: string): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    params.append('lang', locale);
    params.append('limit', '1000'); // Fetch all items
    params.append('status', 'published');

    const endpoint = contentType === 'articles' ? 'articles' : 'stotras';
    const url = `${BACKEND_URL}/rest/${endpoint}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${contentType} for ${locale}:`, response.statusText);
      return [];
    }

    const data = await response.json();
    return data[endpoint] || [];
  } catch (error) {
    console.error(`Error fetching ${contentType} for ${locale}:`, error);
    return [];
  }
};

// Generate static stotra URLs from the imported arrays
const generateStaticStotraUrls = (locale: string): string[] => {
  const urls: string[] = [];
  const langPrefix = locale === 'en' ? '/en' : '';

  // Add all static URLs with appropriate language prefix
  [...ashtothramUrls, ...sahasranamamUrls, ...sahasranamavaliUrls, ...stotrasUrls].forEach(url => {
    urls.push(`${langPrefix}${url}`);
  });

  // bhajans and bhakthi-songs are only available in Telugu
  if (locale === 'te') {
    [...bhajansUrls, ...bhakthiSongsUrls].forEach(url => {
      urls.push(url);
    });
  }

  return urls;
};

// Generate content URLs based on category and type (for articles only)
const generateContentUrls = (items: any[], locale: string): string[] => {
  const urls: string[] = [];
  const langPrefix = locale === 'en' ? '/en' : '';

  for (const item of items) {
    const contentType = item.type || item.contentType;
    const slug = item.canonicalSlug || item.slug;

    if (!slug) continue;

    // Only handle articles, stotras are now handled by static URLs
    if (contentType?.toLowerCase() === 'article') {
      // Handle legacy view_node structure
      if (item.view_node) {
        const path = locale === 'en' ? item.view_node.slice(3) : item.view_node;
        urls.push(`${langPrefix}/${CONTENT_TYPE_ROUTES[contentType] || 'articles'}${path}`);
      } else {
        urls.push(`${langPrefix}/articles/${slug}`);
      }
    }
  }

  return urls;
};

// Generate static pages
const generateStaticPages = (): string[] => {
  const devaPages = [
    'anyadevatha',
    'ayyappa',
    'dashamahavidya',
    'dattatreya',
    'devi-other-forms',
    'durga',
    'ganesha',
    'gayatri',
    'hanuman',
    'kamakshi',
    'krishna',
    'lakshmi',
    'lalita',
    'narashimha',
    'navagraha',
    'other-vishnu-avatara',
    'other-vishnu',
    'others',
    'parvati',
    'prathyangira',
    'raama',
    'sarasvati',
    'shirdi-sai',
    'shiva',
    'shyamala',
    'subrahmanya',
    'tulasi',
    'varaha',
    'varahi',
    'venkateshwara',
    'vishhnu',
  ];

  const pages = [
    '/',
    '/articles',
    '/sahasranamavali',
    '/ashtothram',
    '/sahasranamam',
    '/stotras',
    '/calendar',
    '/privacy-polocy',
    '/en',
    '/en/articles',
    '/en/sahasranamavali',
    '/en/sahasranamam',
    '/en/ashtothram',
    '/en/stotras',
    '/en/calendar',
    '/calendar/festivals',
    '/calendar/vrathas',
    '/calendar/eclipse',
    '/en/calendar/festivals',
    '/en/calendar/vrathas',
    '/en/calendar/eclipse',
    '/en/privacy-polocy',
  ];

  // Add deva pages for both Telugu and English
  for (const deva of devaPages) {
    pages.push(`/deva/${deva}`);
    pages.push(`/en/deva/${deva}`);
  }

  return pages;
};

// Main sitemap generation function
const generateSitemap = async (): Promise<string> => {
  const currentDate = formatDate();
  const urls: string[] = [];

  // Add static pages
  const staticPages = generateStaticPages();
  for (const page of staticPages) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${page}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>${page === '/' || page === '/en' ? '1.00' : '0.80'}</priority>
    </url>`);
  }

  // Add Panchangam URLs
  const panchangamUrls = generatePanchangamUrls();
  for (const url of panchangamUrls) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>0.50</priority>
    </url>`);
  }

  // Add Calendar URLs
  const calendarUrls = generateCalendarUrls();
  for (const url of calendarUrls) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>0.50</priority>
    </url>`);
  }

  // Add Tithi URLs
  const tithiUrls = generateTithiUrls();
  for (const url of tithiUrls) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>0.50</priority>
    </url>`);
  }

  // Add static Stotra URLs
  const teStotraUrls = generateStaticStotraUrls('te');
  const enStotraUrls = generateStaticStotraUrls('en');

  for (const url of [...teStotraUrls, ...enStotraUrls]) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>0.50</priority>
    </url>`);
  }

  // Fetch and add Article URLs
  const [teArticles, enArticles] = await Promise.all([
    fetchContentSlugs('articles', 'te'),
    fetchContentSlugs('articles', 'en'),
  ]);

  const teArticleUrls = generateContentUrls(teArticles, 'te');
  const enArticleUrls = generateContentUrls(enArticles, 'en');

  for (const url of [...teArticleUrls, ...enArticleUrls]) {
    urls.push(`
    <url>
      <loc>https://www.ssbhakthi.com${url}</loc>
      <lastmod>${currentDate}</lastmod>
      <priority>0.50</priority>
    </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join('')}
    </urlset>`;
};

// Page component for sitemap.xml
const Sitemap = () => null;

Sitemap.getInitialProps = async ({ res }: { res: any }) => {
  const sitemap = await generateSitemap();

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {};
};

export default Sitemap;
