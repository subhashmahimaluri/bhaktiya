// utils/seo.ts
import { Locale } from '@/locales';
import { metatags } from './meta-data';

interface ArticlesMetaData {
  title: string;
  description: string;
}

interface HomeMetaData {
  title: string;
  description: string;
}

interface StotrasMetaData {
  title: string;
  description: string;
}

export const getHomeMetaData = (locale: Locale): HomeMetaData => {
  switch (locale) {
    case 'te':
      return {
        title: 'Telugu Calendar | Telugu Panchangam | Stotras - SS Bhakthi',
        description:
          'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide in Telugu',
      };
    case 'en':
      return {
        title: 'Telugu Calendar | Telugu Panchangam | Stotras - SS Bhakthi',
        description:
          'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide in English',
      };
    case 'hi':
      return {
        title: 'Telugu Calendar | Telugu Panchangam | Stotras - SS Bhakthi',
        description:
          'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide in Hindi',
      };
    case 'kn':
      return {
        title: 'Telugu Calendar | Telugu Panchangam | Stotras - SS Bhakthi',
        description:
          'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide in Kannada',
      };
    default:
      return {
        title: 'Telugu Calendar | Telugu Panchangam | Stotras - SS Bhakthi',
        description:
          'SS Bhakthi is hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide',
      };
  }
};

export const getArticlesMetaData = (locale: Locale): ArticlesMetaData => {
  switch (locale) {
    case 'te':
      return {
        title: 'All Hindu Devotional Articles in Telugu | SS Bhakthi',
        description:
          'Read Hindu devotional articles, spiritual guides, and religious content in Telugu. Learn about festivals, traditions, rituals, and sacred practices.',
      };
    case 'en':
      return {
        title: 'All Hindu Devotional Articles in English | SS Bhakthi',
        description:
          'Read Hindu devotional articles, spiritual guides, and religious content in English. Learn about festivals, traditions, rituals, and sacred practices.',
      };
    case 'hi':
      return {
        title: 'All Hindu Devotional Articles in Hindi | SS Bhakthi',
        description:
          'Read Hindu devotional articles, spiritual guides, and religious content in Hindi. Learn about festivals, traditions, rituals, and sacred practices.',
      };
    case 'kn':
      return {
        title: 'All Hindu Devotional Articles in Kannada | SS Bhakthi',
        description:
          'Read Hindu devotional articles, spiritual guides, and religious content in Kannada. Learn about festivals, traditions, rituals, and sacred practices.',
      };
    default:
      return {
        title: 'All Hindu Devotional Articles | SS Bhakthi',
        description:
          'Read Hindu devotional articles, spiritual guides, and religious content. Learn about festivals, traditions, rituals, and sacred practices.',
      };
  }
};

export const getStotrasMetaData = (locale: Locale): StotrasMetaData => {
  switch (locale) {
    case 'te':
      return {
        title: 'All Devotional Stotras with Lyrics in Telugu | SS Bhakthi',
        description:
          'All Devotional Stotras like Stotras, Kavachas, Stuthi, Bhajan, Hrudaya, Ashtakass, shodasha nama .. etc. Everyone Can uderstand And read Stotras in Telugu.',
      };
    case 'en':
      return {
        title: 'All Devotional Stotras with Lyrics in English | SS Bhakthi',
        description:
          'All Devotional Stotras like Stotras, Kavachas, Stuthi, Bhajan, Hrudaya, Ashtakass, shodasha nama .. etc. Everyone Can uderstand And read Stotras in English.',
      };
    case 'hi':
      return {
        title: 'All Devotional Stotras with Lyrics in Hindi | SS Bhakthi',
        description:
          'All Devotional Stotras like Stotras, Kavachas, Stuthi, Bhajan, Hrudaya, Ashtakass, shodasha nama .. etc. Everyone Can uderstand And read Stotras in Hindi.',
      };
    case 'kn':
      return {
        title: 'All Devotional Stotras with Lyrics in Kannada | SS Bhakthi',
        description:
          'All Devotional Stotras like Stotras, Kavachas, Stuthi, Bhajan, Hrudaya, Ashtakass, shodasha nama .. etc. Everyone Can uderstand And read Stotras in Kannada.',
      };
    default:
      return {
        title: 'All Devotional Stotras with Lyrics | SS Bhakthi',
        description:
          'All Devotional Stotras like Stotras, Kavachas, Stuthi, Bhajan, Hrudaya, Ashtakass, shodasha nama .. etc. Everyone Can uderstand And read Stotras.',
      };
  }
};

export const getArticleDetailMetaData = (seoTitle: string): { title: string } => {
  return {
    title: seoTitle,
  };
};

export const getStotraDetailMetaData = (
  seoTitle: string,
  stotraText?: string,
  locale?: string
): { title: string; description: string } => {
  // Generate optimized meta description
  const description = generateStotraDescription(seoTitle, locale || 'en', stotraText);
  
  return {
    title: seoTitle,
    description,
  };
};

/**
 * Generate SEO-optimized meta description for stotra pages
 * Format: "[Stotra Title] - Read lyrics, meaning & benefits in [Language]. Sacred prayer for devotion. Listen to audio & download PDF."
 */
export const generateStotraDescription = (
  seoTitle: string,
  locale: string,
  stotraText?: string
): string => {
  const languageMap: { [key: string]: string } = {
    te: 'Telugu',
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
  };

  const language = languageMap[locale] || 'English';
  
  // Extract first 100 characters from stotra text if available, remove HTML tags
  let excerpt = '';
  if (stotraText) {
    const plainText = stotraText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    excerpt = plainText.substring(0, 100);
  }

  // Build description with keyword-rich, engaging copy
  const baseDescription = `${seoTitle} - Read lyrics, meaning & benefits in ${language}. Sacred Hindu prayer for spiritual growth and devotion. Listen to audio & download PDF.`;

  // Ensure description is within 150-160 character range for optimal SEO
  if (baseDescription.length > 160) {
    return baseDescription.substring(0, 157) + '...';
  }

  return baseDescription;
};

/**
 * Generate JSON-LD structured data for stotra pages
 */
export const generateStotraStructuredData = (params: {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  categoryName: string;
  basePath: string;
  locale: string;
}) => {
  const {
    title,
    description,
    canonicalUrl,
    imageUrl,
    publishedTime,
    modifiedTime,
    categoryName,
    basePath,
    locale,
  } = params;

  const siteUrl = 'https://www.ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';

  // BreadcrumbList Schema
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}${langPath}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `${siteUrl}${langPath}${basePath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  // Article Schema
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl || `${siteUrl}/images/default-stotra.jpg`,
    datePublished: publishedTime || new Date().toISOString(),
    dateModified: modifiedTime || publishedTime || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'SS Bhakthi',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SS Bhakthi',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: locale,
  };

  // Organization Schema
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SS Bhakthi',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'Hindu devotional information including Panchangam, Calendar, Stotras, Bhakthi Articles, Festivals Dates, Muhurthas and Temple guide',
    sameAs: [
      'https://www.facebook.com/ssbhakthi',
      'https://twitter.com/ssbhakthi',
      'https://www.youtube.com/ssbhakthi',
    ],
  };

  return [breadcrumbList, article, organization];
};

export const getMetaDataByPath = (
  path: string,
  locale: Locale
): { title: string; description: string } => {
  // First check if it's a direct path match
  const directMatch = metatags.find(tag => tag.path === path);
  if (directMatch && (directMatch as any)[locale]) {
    return {
      title: (directMatch as any)[locale].title,
      description: (directMatch as any)[locale].description,
    };
  }

  // Check if it's a nested path (like /deva/ganesha)
  for (const tag of metatags) {
    if (tag.pages) {
      const pageMatch = tag.pages.find(page => page.path === path);
      if (pageMatch && (pageMatch as any)[locale]) {
        return {
          title: (pageMatch as any)[locale].title,
          description: (pageMatch as any)[locale].description,
        };
      }
    }
  }

  // Fallback to generic stotras metadata
  return getStotrasMetaData(locale);
};
