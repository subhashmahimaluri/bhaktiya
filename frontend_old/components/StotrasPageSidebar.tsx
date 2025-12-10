'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import CollectionStats from './CollectionStats';

interface StotrasPageSidebarProps {
  pagination: {
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  stotrasLength: number;
  currentPage: number;
  aboutText?: string;
}

const StotrasPageSidebar: React.FC<StotrasPageSidebarProps> = ({
  pagination,
  stotrasLength,
  currentPage,
  aboutText = 'This comprehensive collection includes all categories of devotional content: <strong> Hymns & Prayers, Ashtottara Shatanamavali, Sahasranamavali,</strong> and <strong> Sahasranamam</strong>.',
}) => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const currentPath = router.pathname;

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (
      path === '/stotras' &&
      (currentPath === '/all-stotras-namavali' || currentPath === '/stotras')
    ) {
      return true;
    }
    return currentPath === path;
  };

  // Function to get the appropriate button class
  const getButtonClass = (path: string) => {
    return isActive(path) ? 'btn btn-outline-primary btn-sm' : 'btn btn-outline-secondary btn-sm';
  };

  return (
    <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
      <h4 className="gr-text-7 fw-bold mb-3">{t.nav.browse_by_category}</h4>
      <div className="d-grid gap-2">
        <Link href="/stotras" className={getButtonClass('/stotras')}>
          {t.nav.all_stotras}
        </Link>
        <Link href="/ashtothram" className={getButtonClass('/ashtothram')}>
          {t.nav.ashtottara_shatanamavali}
        </Link>
        <Link href="/sahasranamavali" className={getButtonClass('/sahasranamavali')}>
          {t.nav.sahasranamavali}
        </Link>
        <Link href="/sahasranamam" className={getButtonClass('/sahasranamam')}>
          {t.nav.sahasranamam}
        </Link>
        {locale === 'te' && (
          <>
            <Link href="/bhajans" className={getButtonClass('/bhajans')}>
              {t.nav.bhajans}
            </Link>
            <Link href="/bhakthi-songs" className={getButtonClass('/bhakthi-songs')}>
              {t.nav.bhajans}
            </Link>
          </>
        )}
      </div>

      <CollectionStats
        pagination={pagination}
        itemsLength={stotrasLength}
        currentPage={currentPage}
      />
    </div>
  );
};

export default StotrasPageSidebar;
