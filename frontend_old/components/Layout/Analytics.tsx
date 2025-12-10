import Script from 'next/script';

interface AnalyticsConfig {
  domain: string;
  gtagId: string;
}

// Analytics configuration for different domains
const analyticsConfigs: AnalyticsConfig[] = [
  {
    domain: 'https://www.ssbhakthi.com',
    gtagId: 'G-36LB3LM4DK',
  },
  // Add more domain configurations here as needed
  // {
  //   domain: 'https://another-domain.com',
  //   gtagId: 'GA-ANOTHER-ID'
  // }
];

// Default analytics configuration for production
const defaultAnalyticsConfig: AnalyticsConfig = {
  domain: 'https://www.ssbhakthi.com',
  gtagId: 'G-36LB3LM4DK',
};

const Analytics = () => {
  // Use window.location.hostname if available (client-side), otherwise fallback to NEXT_PUBLIC_SITE_URL
  const currentDomain =
    typeof window !== 'undefined'
      ? `https://${window.location.hostname}`
      : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL;

  // Find the matching analytics configuration for the current domain
  let analyticsConfig = analyticsConfigs.find(
    config =>
      currentDomain &&
      (currentDomain.includes(config.domain.replace('https://www.', '').replace('https://', '')) ||
        config.domain === currentDomain)
  );

  // If no specific configuration is found but we're in production, use the default
  if (!analyticsConfig && process.env.NODE_ENV === 'production') {
    analyticsConfig = defaultAnalyticsConfig;
  }

  // If no configuration is found or we're in development, don't render analytics
  if (!analyticsConfig || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <>
      <Script
        strategy="beforeInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gtagId}`}
      />
      <Script id="ga-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsConfig.gtagId}');
        `}
      </Script>
    </>
  );
};

export default Analytics;
