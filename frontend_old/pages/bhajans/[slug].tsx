'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Bhajans',
  basePath: '/bhajans',
  categoryDescription:
    'Devotional hymns and songs of praise to various deities for spiritual upliftment.',
  sidebarDescription:
    'Devotional hymns and songs of praise to various deities for spiritual upliftment.',
};

export default function BhajansPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/bhajans/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
