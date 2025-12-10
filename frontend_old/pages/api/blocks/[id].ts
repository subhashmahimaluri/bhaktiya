import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid block ID' });
    }

    const backendUrl = `${BACKEND_URL}/graphql`;

    if (req.method === 'GET') {
      // GET is public - allow unauthenticated access to read blocks
      // Get block by ID
      const query = `
        query {
          block(id: "${id}") {
            id
            title { en te hi kn }
            content { en te hi kn }
            blockPath
            imageUrl
            videoId { en te hi kn }
            status
            order
            locales
            audit {
              createdBy
              createdAt
              updatedBy
              updatedAt
            }
            isActive
          }
        }
      `;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
      }

      // Handle Apollo Server response format
      const block = data.data?.block;
      if (!block) {
        return res.status(404).json({ error: 'Block not found' });
      }

      res.json(block);
    } else if (req.method === 'PUT') {
      // PUT requires authentication - check admin access
      const session = await getAuthSession(req, res);

      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRoles = (session.user?.roles as string[]) || [];
      const hasAdminAccess = userRoles.some(role => ['admin', 'editor'].includes(role));

      if (!hasAdminAccess) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      // Update block
      const { title, content, blockPath, imageUrl, videoId, status, locales, order } = req.body;

      if (!title || !content || !blockPath) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Escape special characters in strings
      const escapeString = (str: string) =>
        str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      // Normalize status to uppercase enum value
      const normalizedStatus = status ? status.toUpperCase() : 'DRAFT';

      const mutation = `
        mutation {
          updateBlock(id: "${id}", input: {
            title: { en: "${escapeString(title.en || '')}", te: "${escapeString(title.te || '')}", hi: "${escapeString(title.hi || '')}", kn: "${escapeString(title.kn || '')}" }
            content: { en: "${escapeString(content.en || '')}", te: "${escapeString(content.te || '')}", hi: "${escapeString(content.hi || '')}", kn: "${escapeString(content.kn || '')}" }
            blockPath: "${escapeString(blockPath)}"
            ${imageUrl ? `imageUrl: "${escapeString(imageUrl)}"` : ''}
            ${videoId ? `videoId: { en: "${escapeString(videoId.en || '')}", te: "${escapeString(videoId.te || '')}", hi: "${escapeString(videoId.hi || '')}", kn: "${escapeString(videoId.kn || '')}" }` : ''}
            status: ${normalizedStatus}
            locales: ["en", "te", "hi", "kn"]
            order: ${order || 0}
          }) {
            id
            title { en te hi kn }
            content { en te hi kn }
            blockPath
            imageUrl
            videoId { en te hi kn }
            status
            order
            locales
            audit {
              createdBy
              createdAt
              updatedBy
              updatedAt
            }
            isActive
          }
        }
      `;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session.accessToken && {
            Authorization: `Bearer ${session.accessToken}`,
          }),
        },
        body: JSON.stringify({ query: mutation }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
      }

      // Handle Apollo Server response format
      const updatedBlock = data.data?.updateBlock;
      if (!updatedBlock) {
        return res.status(500).json({ error: 'Failed to update block' });
      }

      res.json(updatedBlock);
    } else if (req.method === 'DELETE') {
      // DELETE requires authentication - check admin access
      const session = await getAuthSession(req, res);

      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRoles = (session.user?.roles as string[]) || [];
      const hasAdminAccess = userRoles.some(role => ['admin', 'editor'].includes(role));

      if (!hasAdminAccess) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      // Delete block
      const mutation = `
        mutation {
          deleteBlock(id: "${id}")
        }
      `;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session.accessToken && {
            Authorization: `Bearer ${session.accessToken}`,
          }),
        },
        body: JSON.stringify({ query: mutation }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
      }

      // Handle Apollo Server response format
      const deleteResult = data.data?.deleteBlock;
      if (deleteResult === undefined) {
        return res.status(500).json({ error: 'Failed to delete block' });
      }

      res.json({ success: deleteResult });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
