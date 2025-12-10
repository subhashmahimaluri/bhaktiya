/** @type {import('next').NextConfig} */

// Detect which instance this is based on environment or port
const getInstanceConfig = () => {
  const port = process.env.PORT;
  const defaultLocale = process.env.DEFAULT_LOCALE;
  const supportedLocales = process.env.SUPPORTED_LOCALES;

  // If specific environment variables are set, use them
  if (defaultLocale && supportedLocales) {
    const locales = supportedLocales.split(',');
    return {
      locales,
      defaultLocale,
      localeDetection: false,
    };
  }

  // Default fallback based on port
  switch (port) {
    case '3001':
      return {
        locales: ['hi'],
        defaultLocale: 'hi',
        localeDetection: false,
      };
    case '3002':
      return {
        locales: ['kn'],
        defaultLocale: 'kn',
        localeDetection: false,
      };
    default:
      // Port 3000 or undefined - Telugu/English instance
      return {
        locales: ['te', 'en'],
        defaultLocale: 'te',
        localeDetection: false,
      };
  }
};

const i18nConfig = getInstanceConfig();

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  generateEtags: true, // Enable ETag generation for caching

  // i18n configuration (Pages Router)
  i18n: i18nConfig,
  trailingSlash: false,

  // Optimize JavaScript build for modern browsers (eliminates 12.5 KiB polyfills)
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable React compiler optimizations
    reactRemoveProperties:
      process.env.NODE_ENV === 'production' ? { properties: ['^data-test'] } : false,
  },
  experimental: {
    // Use modern browser features without polyfills
    swcTraceProfiling: false,
    // Enable optimized package imports to reduce bundle size
    optimizePackageImports: [
      'lodash',
      '@fortawesome/fontawesome-free',
      'react-bootstrap',
      'date-fns',
      'astronomy-bundle',
      'moment-timezone',
    ],
  },

  // Webpack configuration for additional optimizations
  webpack: (config, { isServer, webpack, dev }) => {
    // Don't polyfill Node.js modules on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Add performance hints
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 512000, // 500 KB
        maxAssetSize: 512000, // 500 KB
      };

      // Disable chunks optimization in development to prevent runtime errors on refresh
      // Production builds use optimized bundle splitting for better caching and parallel loading
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          moduleIds: 'deterministic',
          runtimeChunk: 'single', // Separate runtime chunk for better caching
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            maxSize: 244000, // Split chunks larger than 244KB
            cacheGroups: {
              // Default vendors
              defaultVendors: false,
              default: false,

              // Framework chunk (React, Next.js, scheduler)
              framework: {
                name: 'framework',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
                priority: 40,
                enforce: true,
              },

              // Heavy astronomy libraries (lazy loaded)
              astronomy: {
                name: 'astronomy',
                test: /[\\/]node_modules[\\/](astronomy-bundle|astronomy-engine)[\\/]/,
                priority: 35,
                reuseExistingChunk: true,
              },

              // Moment/date libraries
              datetime: {
                name: 'datetime',
                test: /[\\/]node_modules[\\/](moment-timezone|moment|date-fns)[\\/]/,
                priority: 33,
                reuseExistingChunk: true,
              },

              // Apollo GraphQL client
              apollo: {
                name: 'apollo',
                test: /[\\/]node_modules[\\/](@apollo|graphql)[\\/]/,
                priority: 32,
                reuseExistingChunk: true,
              },

              // Lib chunk for other stable dependencies
              lib: {
                test(module) {
                  return module.size() > 160000 && /node_modules[\\/]/.test(module.identifier());
                },
                name(module) {
                  const hash = require('crypto')
                    .createHash('sha1')
                    .update(module.identifier())
                    .digest('hex')
                    .substring(0, 8);
                  return `lib-${hash}`;
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },

              // Commons chunk for shared code between pages
              commons: {
                name: 'commons',
                minChunks: 2,
                priority: 20,
              },

              // Shared chunk for code used across all pages
              shared: {
                name: 'shared',
                test: /[\\/]node_modules[\\/]/,
                minChunks: 3,
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        };
      } else {
        // In development, disable optimization to prevent chunk loading errors
        config.optimization = {
          ...config.optimization,
          runtimeChunk: false,
          splitChunks: false,
        };
      }

      // Ignore moment locales to reduce bundle size (we use moment-timezone)
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
    }

    return config;
  },

  // Redirects to handle default locale properly
  async redirects() {
    const redirects = [];

    // Only add redirects for Telugu/English instance (port 3000)
    if (i18nConfig.defaultLocale === 'te' && i18nConfig.locales.includes('te')) {
      redirects.push({
        source: '/te/:path*',
        destination: '/:path*',
        permanent: true,
      });
    }

    return redirects;
  },

  // Add security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Preconnect hints for critical external origins
          {
            key: 'Link',
            value:
              '<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin, <https://cdn.jsdelivr.net>; rel=preconnect; crossorigin',
          },
          // Enable compression
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // DNS prefetch for faster DNS resolution
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Image caching headers for optimal performance
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static assets caching
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    // Optimized device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimized image sizes for component usage
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image compression and quality
    minimumCacheTTL: 31536000, // Cache images for 1 year (365 days)
    unoptimized: false,
    // Disable lazy loading for above-the-fold images
    loader: 'default',
  },

  // SCSS configuration
  sassOptions: {
    includePaths: ['./styles'],
    prependData: `
      @import "styles/variables.scss";
      @import "styles/mixins.scss";
    `,
  },
};

module.exports = nextConfig;
