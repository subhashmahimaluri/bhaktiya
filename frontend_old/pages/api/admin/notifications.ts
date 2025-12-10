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

  console.log('📄 Notifications API request:', {
    method: req.method,
    path: req.url,
    hasSession: !!session,
    hasAccessToken: !!session?.accessToken,
  });

  // All notification operations require authentication
  if (!session) {
    console.error('❌ No session found for notifications operation');
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHENTICATED',
    });
  }

  // Check for admin role
  const userRoles = (session.user?.roles as string[]) || [];
  console.log('👤 User roles:', userRoles);
  
  if (!userRoles.includes('admin')) {
    console.error('❌ User does not have admin role');
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin role required',
    });
  }

  try {
    // Build the target URL based on request method and path
    let targetUrl = `${backendUrl}/rest/admin/notifications`;

    // Extract notification ID and action from slug
    const slug = req.query.slug;
    if (slug && Array.isArray(slug) && slug.length > 0) {
      const notificationId = slug[0];
      targetUrl = `${backendUrl}/rest/admin/notifications/${notificationId}`;
      
      // Check for /send action
      if (slug.length > 1 && slug[1] === 'send') {
        targetUrl += '/send';
      }
    }

    // Check for /send-test path
    if (req.url?.includes('/send-test')) {
      targetUrl = `${backendUrl}/rest/admin/notifications/send-test`;
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
      hasBody: !!req.body,
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

    console.log('📥 Backend response:', {
      status: response.status,
      ok: response.ok,
      hasData: !!data,
    });

    if (!response.ok) {
      console.error('❌ Backend error response:', {
        status: response.status,
        error: data,
      });
    }

    // Check for JWT expiration in backend response
    if (response.status === 401 && data.details && data.details.includes('jwt expired')) {
      return res.status(401).json({
        message: 'Session expired',
        error: 'jwt_expired',
        requiresReauth: true,
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Notifications API error:', error);
    return res.status(500).json({
      error: 'Failed to process notifications request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
