'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Sahasranamavali',
  basePath: '/sahasranamavali',
  categoryDescription:
    '1000 sacred names of various deities chanted for devotion and spiritual benefit.',
  sidebarDescription:
    '1000 sacred names of various deities chanted for devotion and spiritual benefit.',
};

export default function SahasranamavaliStotraPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/sahasranamavali/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
