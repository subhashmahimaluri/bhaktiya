import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// Use server-side env var for API routes (not NEXT_PUBLIC_ which is for client-side)
const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Check authentication
    const effectiveSession = await getAuthSession(req, res);

    if (!effectiveSession) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check permissions - only admin can delete
    const userRoles = (effectiveSession.user?.roles as string[]) || [];
    const hasDeletePermission = userRoles.includes('admin');

    if (!hasDeletePermission) {
      return res.status(403).json({
        error: 'Insufficient permissions. Only admins can delete stotras.',
      });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Stotra slug is required' });
    }

    // Call backend API to delete stotra
    const response = await fetch(`${BACKEND_URL}/rest/stotras/${slug}`, {
      method: 'DELETE',
      headers: {
        ...(effectiveSession.accessToken && {
          Authorization: `Bearer ${effectiveSession.accessToken}`,
        }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stotra' });
  }
}
