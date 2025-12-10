'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Ashtottara Shatanamavali',
  basePath: '/ashtothram',
  categoryDescription:
    '108 sacred names of various deities chanted for devotion and spiritual benefit.',
  sidebarDescription:
    '108 sacred names of various deities chanted for devotion and spiritual benefit.',
};

export default function AshtothramStotraPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/ashtothram/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
