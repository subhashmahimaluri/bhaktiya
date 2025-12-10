import { CATEGORY_IDS } from '@/constants/stotras';
import { CategoryContext } from '@/types/stotras';

// Helper function to determine category context based on stotra categories or slug patterns
export const getCategoryContext = (
  stotra: any
): CategoryContext => {
  // First try to detect based on categories if available
  if (stotra.categories) {
    const { typeIds = [], devaIds = [], byNumberIds = [] } = stotra.categories;

    // Check all category ID arrays for specific category IDs
    const allCategoryIds = [...typeIds, ...devaIds, ...byNumberIds];

    // Check for Ashtottara Shatanamavali category
    if (allCategoryIds.includes(CATEGORY_IDS.ASHTOTTARA_SHATANAMAVALI)) {
      return 'ashtothram';
    }

    // Check for Sahasranamavali category
    if (allCategoryIds.includes(CATEGORY_IDS.SAHASRANAMAVALI)) {
      return 'sahasranamavali';
    }

    // Check for Sahasranamam category
    if (allCategoryIds.includes(CATEGORY_IDS.SAHASRANAMAM)) {
      return 'sahasranamam';
    }

    // Check for Bhajans category
    if (allCategoryIds.includes(CATEGORY_IDS.BHAJANS)) {
      return 'bhajans';
    }

    // Check for Bhakthi Songs category
    if (allCategoryIds.includes(CATEGORY_IDS.BHAKTHI_SONGS)) {
      return 'bhakthisongs';
    }
  }

  // Fallback: Detect based on canonicalSlug patterns when categories is null/empty
  const slug = stotra.canonicalSlug?.toLowerCase() || '';

  // Check for Ashtottara patterns in slug
  if (slug.includes('ashtottara') || slug.includes('ashtothram')) {
    return 'ashtothram';
  }

  // Check for Sahasranamavali patterns in slug (but not sahasranamam)
  if (slug.includes('sahasranamavali') && !slug.includes('sahasranamam')) {
    return 'sahasranamavali';
  }

  // Check for Sahasranamam patterns in slug
  if (slug.includes('sahasranamam') || slug.includes('sahasranama-stotram')) {
    return 'sahasranamam';
  }

  // Default to 'default' for Hymns/Prayers or other categories (routes to /stotras/[slug])
  return 'default';
};