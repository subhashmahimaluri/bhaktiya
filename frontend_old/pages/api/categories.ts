import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// Use server-side env var for API routes (not NEXT_PUBLIC_ which is for client-side)
const BACKEND_URL =
  process.env.BACKEND_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Since categories should be publicly accessible, we don't require authentication
    // Get session only if available, but don't block if not
    let effectiveSession = null;
    try {
      effectiveSession = await getAuthSession(req, res);
    } catch (error) {
      // Ignore auth errors for public categories endpoint
      // Don't use console.log in production as it's not visible in Docker
    }

    // Since there's no direct REST categories endpoint, we'll fetch from GraphQL
    const query = `
      query GetCategories {
        categories(limit: 100) {
          items {
            id
            name {
              en
              te
            }
            slug {
              en
              te
            }
            meta
          }
        }
      }
    `;

    const response = await fetch(`${BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(effectiveSession?.accessToken && {
          Authorization: `Bearer ${effectiveSession.accessToken}`,
        }),
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`GraphQL responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Handle Apollo Server's nested response format
    const actualData = data.body?.singleResult || data;

    if (actualData.errors) {
      throw new Error(actualData.errors[0]?.message || 'GraphQL error');
    }

    const categories = actualData.data?.categories?.items || [];

    // Parse meta field if it's a string
    const parsedCategories = categories.map((cat: any) => {
      let parsedMeta = cat.meta;
      if (typeof cat.meta === 'string') {
        try {
          parsedMeta = JSON.parse(cat.meta);
        } catch (e) {
          parsedMeta = { taxonomy: 'unknown' };
        }
      }
      return {
        ...cat,
        meta: parsedMeta,
      };
    });

    res.json({
      categories: parsedCategories,
      total: parsedCategories.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
