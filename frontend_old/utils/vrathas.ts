import { FESTIVALS } from './festivals';
import { VRATAS } from './vratas';

export interface VrathaInfo {
  name: string;
  name_te: string;
  path: string;
  image: string;
  image_te?: string; // Made optional since VRATAS array doesn't have this property
}

/**
 * Get vratha information by slug
 * @param slug - The vratha slug (e.g., 'sankashti-chaturthi')
 * @returns VrathaInfo object or null if not found
 */
export function getVrathaBySlug(slug: string, type: string): VrathaInfo | null {
  if (type === 'festivals') {
    return FESTIVALS.find(vratha => vratha.path === `/calendar/${type}/${slug}`) || null;
  }
  return VRATAS.find(vratha => vratha.path === `/calendar/${type}/${slug}`) || null;
}

/**
 * Get localized vratha name by slug and locale
 * @param slug - The vratha slug (e.g., 'sankashti-chaturthi')
 * @param locale - The locale ('en' or 'te')
 * @returns Localized vratha name or slug if not found
 */
export function getLocalizedVrathaName(
  slug: string,
  locale: string = 'en',
  type = 'vrathas'
): string {
  const vratha = getVrathaBySlug(slug, type);
  if (!vratha) {
    // Return formatted slug as fallback
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (locale === 'te' && vratha.name_te) {
    return vratha.name_te;
  }

  return vratha.name;
}

/**
 * Get all vrathas for a specific locale
 * @param locale - The locale ('en' or 'te')
 * @returns Array of localized vratha objects
 */
export function getAllLocalizedVrathas(locale: string = 'en'): Array<{
  name: string;
  path: string;
  image: string;
}> {
  return VRATAS.map(vratha => ({
    name: locale === 'te' && vratha.name_te ? vratha.name_te : vratha.name,
    path: vratha.path,
    image: locale === 'te' && (vratha as any).image_te ? (vratha as any).image_te : vratha.image,
  }));
}
