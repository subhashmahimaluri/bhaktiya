'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Stotras',
  basePath: '/stotras',
  categoryDescription:
    'Sacred hymns and prayers to deities for spiritual enlightenment and blessings.',
  sidebarDescription:
    'Sacred hymns and prayers to deities for spiritual enlightenment and blessings.',
};

export default function StotraPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/stotras/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
