import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get session for authentication
  const session = await getServerSession(req, res, authOptions);

  const backendUrl = process.env.BACKEND_REST_URL || process.env.NEXT_PUBLIC_BACKEND_REST_URL;

  if (!backendUrl) {
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  try {
    // Get the slug/path from the request (this handles routes like /api/comments/[commentId] and /api/comments/[canonicalSlug])
    const { slug } = req.query;
    const slugPath = Array.isArray(slug) ? slug.join('/') : slug || '';

    // Build the target URL
    let targetUrl = `${backendUrl}/rest/comments`;

    if (slugPath) {
      targetUrl += `/${slugPath}`;
    }

    // Append query parameters
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      // Skip the slug parameter as it's already in the URL path
      if (key !== 'slug' && value) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      targetUrl += `?${queryString}`;
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if session exists
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers,
      body:
        req.method !== 'GET' && req.method !== 'HEAD' && req.body
          ? JSON.stringify(req.body)
          : undefined,
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({
      error: 'Failed to process comments request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
