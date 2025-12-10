import type { DocumentContext, DocumentInitialProps } from 'next/document';
import { Head, Html, Main, NextScript } from 'next/document';

interface DocumentProps {
  locale: string;
}

export default function MyDocument(props: DocumentProps) {
  const { locale } = props;
  return (
    <Html lang={locale || 'te'}>
      <Head>
        {/* CRITICAL: Establish early connections to font CDNs to reduce latency */}
        {/* Preconnect to Google Fonts CSS origin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Preconnect to Google Fonts assets origin (requires crossOrigin for CORS) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Bootstrap Icons CDN */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />

        {/* DNS prefetch as fallback for older browsers */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Inline critical font CSS to eliminate render-blocking request chain */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical font-face declarations for immediate text rendering */
              @font-face {
                font-family: 'Noto Sans Telugu';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url(https://fonts.gstatic.com/s/notosanstelugu/v30/0FlCVOGZlE2NC6buBvPZpb4Xe_OFYJ5H-JHF.woff2) format('woff2');
                unicode-range: U+0C00-0C7F;
              }
              @font-face {
                font-family: 'Noto Serif Telugu';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url(https://fonts.gstatic.com/s/notoseriftelugu/v30/tDbl2pCbnkEKmXNVmt2M1q6f4HWbbj6MRbYJbk4.woff2) format('woff2');
                unicode-range: U+0C00-0C7F;
              }
            `,
          }}
        />

        {/* Preload critical Telugu fonts directly to avoid CSS chain delay */}
        {/* This bypasses the googleapis CSS file and loads fonts immediately */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notosanstelugu/v30/0FlCVOGZlE2NC6buBvPZpb4Xe_OFYJ5H-JHF.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notoseriftelugu/v30/tDbl2pCbnkEKmXNVmt2M1q6f4HWbbj6MRbYJbk4.woff2"
          crossOrigin="anonymous"
        />

        {/* Inline script to load stylesheets asynchronously (non-render-blocking) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Load Google Fonts CSS asynchronously
                var fonts = document.createElement('link');
                fonts.rel = 'stylesheet';
                fonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@100;300;400;500;600;700;800;900&family=Noto+Serif+Telugu:wght@100..900&display=swap';
                fonts.media = 'print';
                fonts.onload = function() { this.media = 'all'; };
                        
                // Load Bootstrap Icons CSS asynchronously
                var icons = document.createElement('link');
                icons.rel = 'stylesheet';
                icons.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
                icons.media = 'print';
                icons.onload = function() { this.media = 'all'; };
                        
                // Append to head
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(fonts);
                head.appendChild(icons);
              })();
            `,
          }}
        />

        {/* Fallback for no-JS environments */}
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@100;300;400;500;600;700;800;900&family=Noto+Serif+Telugu:wght@100..900&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
          />
        </noscript>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (
  ctx: DocumentContext
): Promise<DocumentInitialProps & { locale: string }> => {
  const initialProps = await ctx.defaultGetInitialProps(ctx);

  // Get locale from the request context
  // For server-side rendering, this will be available in ctx.req
  // For client-side, we'll use the default locale
  let locale = 'te'; // Default to Telugu

  // Try to get locale from the request headers or query parameters
  if (ctx.req) {
    // Check if the URL has /en prefix
    const url = ctx.req.url || '';
    if (url.startsWith('/en')) {
      locale = 'en';
    }
  }

  return {
    ...initialProps,
    locale,
  };
};
