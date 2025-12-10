import { useState, useEffect } from 'react';
import { StotrasResponse } from '@/types/stotras';
import { ITEMS_PER_PAGE } from '@/constants/stotras';

interface UseStotrasProps {
  categoryId: string;
  locale: string;
}

export const useStotras = ({ categoryId, locale }: UseStotrasProps) => {
  const [stotras, setStotras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    fetchStotras(1, true);
  }, [locale, categoryId]); // Re-fetch when locale or categoryId changes

  const fetchStotras = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000';
      const apiUrl = `${backendUrl}/rest/stotras?lang=${locale}&page=${page}&limit=${ITEMS_PER_PAGE}&categoryId=${categoryId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch stotras');
      }
      const data: StotrasResponse = await response.json();

      if (reset) {
        setStotras(data.stotras);
      } else {
        // Only add new items that don't already exist
        setStotras(prev => {
          const existingSlugs = new Set(prev.map(s => s.canonicalSlug));
          const newStotras = data.stotras.filter(s => !existingSlugs.has(s.canonicalSlug));
          return [...prev, ...newStotras];
        });
      }

      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchStotras(nextPage, false);
  };

  return {
    stotras,
    loading,
    loadingMore,
    error,
    pagination,
    currentPage,
    handleLoadMore,
  };
};