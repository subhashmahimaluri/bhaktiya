import { getAuthSession, isSessionExpired, sendSessionExpiredResponse } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get session for authentication
  const session = await getAuthSession(req, res);

  // Check if session has expired
  if (isSessionExpired(session)) {
    return sendSessionExpiredResponse(res);
  }

  const backendUrl = process.env.BACKEND_REST_URL || process.env.NEXT_PUBLIC_BACKEND_REST_URL;

  if (!backendUrl) {
    console.error('❌ BACKEND_REST_URL not configured. Using defaults.');
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  // Log the request for debugging
  console.log('📄 Comments API request:', {
    method: req.method,
    path: req.url,
    hasSession: !!session,
    hasAccessToken: !!session?.accessToken,
    userId: session?.user?.id,
  });

  // All comment operations require authentication
  if (!session) {
    console.error('❌ No session found for comments operation');
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHENTICATED',
    });
  }

  try {
    // Build the target URL based on request method and path
    let targetUrl = `${backendUrl}/rest/comments`;

    // Extract commentId if present in the query string (from dynamic route)
    // The Next.js dynamic route [...slug] captures everything after /api/comments/
    const slug = req.query.slug;
    if (slug && Array.isArray(slug) && slug.length > 0) {
      // For routes like /api/comments/[commentId], slug[0] is the commentId
      const commentId = slug[0];
      targetUrl = `${backendUrl}/rest/comments/${commentId}`;
    }

    // Append query parameters for GET requests
    if (req.method === 'GET' && !slug) {
      const queryParams = new URLSearchParams();
      Object.entries(req.query).forEach(([key, value]) => {
        if (value && key !== 'slug') {
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
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    console.log('🚀 Forwarding request to backend:', {
      targetUrl,
      method: req.method,
    });

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

    // Check for JWT expiration in backend response
    if (response.status === 401 && data.details && data.details.includes('jwt expired')) {
      return res.status(401).json({
        message: 'Session expired',
        error: 'jwt_expired',
        requiresReauth: true,
      });
    }

    // Log response for debugging
    if (!response.ok) {
      console.error('Backend comments API error:', {
        status: response.status,
        data,
        method: req.method,
        targetUrl,
      });
    } else {
      console.log('✅ Backend request successful:', {
        status: response.status,
        method: req.method,
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({
      error: 'Failed to process comments request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
