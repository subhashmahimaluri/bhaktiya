'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

interface CollectionStatsProps {
  pagination: {
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  itemsLength: number;
  currentPage: number;
  totalItemsLabel?: string;
  itemsLoadedLabel?: string;
  currentPageLabel?: string;
}

const CollectionStats: React.FC<CollectionStatsProps> = ({
  pagination,
  itemsLength,
  currentPage,
  totalItemsLabel = "Total Items",
  itemsLoadedLabel = "Items Loaded",
  currentPageLabel = "Current Page"
}) => {
  const { data: session } = useSession();
  
  if (!pagination) return null;

  // Check if user has admin roles
  const userRoles = (session?.user?.roles as string[]) || [];
  const hasAdminAccess = userRoles.some(role => ['admin', 'editor', 'author'].includes(role));

  // Only show Collection Stats to users with admin access
  if (!hasAdminAccess) return null;

  return (
    <div className="mt-3">
      <hr />
      <h6>Collection Stats</h6>
      <ul className="list-unstyled small text-muted">
        <li>
          <strong>{totalItemsLabel}:</strong> {pagination.total}
        </li>
        <li>
          <strong>{itemsLoadedLabel}:</strong> {itemsLength}
        </li>
        <li>
          <strong>{currentPageLabel}:</strong> {currentPage}
        </li>
      </ul>
    </div>
  );
};

export default CollectionStats;