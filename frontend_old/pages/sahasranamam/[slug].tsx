'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Sahasranamam',
  basePath: '/sahasranamam',
  categoryDescription:
    '1000 sacred names of various deities with traditional meanings and devotional benefits.',
  sidebarDescription:
    '1000 sacred names of various deities with traditional meanings and devotional benefits.',
};

export default function SahasranamamStotraPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/sahasranamam/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
