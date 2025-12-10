import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication (optional for public read, but pass if available)
  const session = await getAuthSession(req, res);
  try {
    const { blockPath } = req.query;

    if (!blockPath || typeof blockPath !== 'string') {
      return res.status(400).json({ error: 'Block path is required' });
    }

    if (req.method === 'GET') {
      const backendUrl = `${BACKEND_URL}/graphql`;

      const query = `
        query GetBlockByPath($blockPath: String!) {
          blockByPath(blockPath: $blockPath) {
            id
            title { en te hi kn }
            content { en te hi kn }
            blockPath
            imageUrl
            videoId { en te hi kn }
            status
            order
            locales
            isActive
          }
        }
      `;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
            Authorization: `Bearer ${session.accessToken}`,
          }),
        },
        body: JSON.stringify({ query, variables: { blockPath } }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return res.status(404).json({ error: data.errors[0]?.message || 'Block not found' });
      }

      // Handle Apollo Server response format
      const block = data.data?.blockByPath;
      if (!block) {
        return res.status(404).json({ error: 'Block not found' });
      }

      res.json(block);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch block',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
