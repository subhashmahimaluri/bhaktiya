import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// Use server-side env var for API routes (not NEXT_PUBLIC_ which is for client-side)
const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session for authentication (may be required for admin filters)
    const effectiveSession = await getAuthSession(req, res);
    // Forward request to backend API
    // Build query string from request parameters
    const queryParams = new URLSearchParams();

    if (req.query.lang) queryParams.set('lang', req.query.lang as string);
    if (req.query.limit) queryParams.set('limit', req.query.limit as string);
    if (req.query.offset) queryParams.set('offset', req.query.offset as string);
    if (req.query.status) queryParams.set('status', req.query.status as string);
    if (req.query.search) queryParams.set('search', req.query.search as string);
    if (req.query.categoryId) queryParams.set('categoryId', req.query.categoryId as string);
    if (req.query.page) queryParams.set('page', req.query.page as string);

    const url = `${BACKEND_URL}/rest/stotras?${queryParams.toString()}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(effectiveSession?.accessToken && {
        Authorization: `Bearer ${effectiveSession.accessToken}`,
      }),
    };

    // Forward admin access header from frontend
    if (req.headers['x-admin-access']) {
      headers['x-admin-access'] = req.headers['x-admin-access'] as string;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stotras:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch stotras',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}
