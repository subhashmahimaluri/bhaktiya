export interface StotrasResponse {
  stotras: Array<{
    canonicalSlug: string;
    contentType: string;
    status: string;
    imageUrl?: string | null;
    categories?: Array<{
      _id: string;
      name: string;
      slug: string;
    }>;
    translations: {
      en?: any;
      te?: any;
      hi?: any;
      kn?: any;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    language: string;
    contentType: string;
  };
}

export type CategoryContext = 'ashtothram' | 'sahasranamavali' | 'sahasranamam' | 'bhajans' | 'bhakthisongs' | 'default';