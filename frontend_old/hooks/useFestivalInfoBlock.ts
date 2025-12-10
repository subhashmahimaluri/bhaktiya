import { useEffect, useState } from 'react';

interface InfoBlock {
  imageUrl?: string;
  title: Record<string, string>;
  content: Record<string, string>;
  videoId?: Record<string, string>;
}

/**
 * Hook to fetch and manage festival info block data
 * @param slug - Festival slug identifier
 * @returns Info block data, loading state, and error
 */
export const useFestivalInfoBlock = (slug: string | string[] | undefined) => {
  const [infoBlock, setInfoBlock] = useState<InfoBlock | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInfoBlock = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch if slug exists
        if (!slug || (typeof slug === 'string' && !slug.trim())) {
          setInfoBlock(null);
          setLoading(false);
          return;
        }

        const blockPath = `/calendar/festivals/${slug}`;
        const response = await fetch(`/api/blocks-by-path?blockPath=${blockPath}`);

        // Handle 404 gracefully - block may not exist yet
        if (response.status === 404) {
          setInfoBlock(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load info block: ${response.statusText}`);
        }

        const block = await response.json();
        setInfoBlock(block);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load info block:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadInfoBlock();
  }, [slug]);

  return { infoBlock, loading, error };
};
