'use client';

import StotraPageTemplate, { StotraPageConfig } from '@/components/StotraPageTemplate';
import { GetServerSideProps } from 'next';

const stotraConfig: StotraPageConfig = {
  categoryName: 'Bhakthi Songs',
  basePath: '/bhakthi-songs',
  categoryDescription: 'Contemporary and traditional devotional songs for meditation and worship.',
  sidebarDescription: 'Contemporary and traditional devotional songs for meditation and worship.',
};

export default function BhakthiSongsPage({ canonicalUrl }: { canonicalUrl?: string }) {
  return <StotraPageTemplate config={stotraConfig} canonicalUrl={canonicalUrl} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params as { slug: string };
  const locale = context.locale || 'te';

  // Build the canonical URL on the server side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssbhakthi.com';
  const langPath = locale === 'en' ? '/en' : '';
  const canonicalUrl = `${siteUrl}${langPath}/bhakthi-songs/${slug}`;

  return {
    props: {
      canonicalUrl,
    },
  };
};
