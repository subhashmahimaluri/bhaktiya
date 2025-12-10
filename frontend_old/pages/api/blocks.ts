import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL =
  process.env.BACKEND_REST_URL ||
  process.env.NEXT_PUBLIC_BACKEND_REST_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication for admin access
    const session = await getAuthSession(req, res);

    if (req.method === 'GET') {
      // GET is public (reading blocks)
      // No auth required for read-only operations
      const { limit = '50', offset = '0', blockPath, status } = req.query;

      const backendUrl = `${BACKEND_URL}/graphql`;

      let filterStr = '';
      if (blockPath || status) {
        const filters: string[] = [];
        if (blockPath) filters.push(`blockPath: "${String(blockPath).replace(/"/g, '\\"')}"`);
        if (status) filters.push(`status: ${status}`);
        filterStr = `filters: { ${filters.join(', ')} }`;
      }

      const query = `
        query {
          blocks(
            ${filterStr}
            limit: ${limit}
            offset: ${offset}
          ) {
            items {
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
            total
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
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL GET errors:', data.errors);
        return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
      }

      // Handle Apollo Server response format
      const blocksResult = data.data?.blocks;
      if (!blocksResult) {
        console.error('Unexpected GET response format:', JSON.stringify(data));
        return res.status(500).json({ error: 'Unexpected response from backend' });
      }

      res.json({
        blocks: blocksResult.items || [],
        total: blocksResult.total || 0,
      });
    } else if (req.method === 'POST') {
      // Create new block - requires authentication
      if (!session) {
        console.log('❌ No session found');
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log('✅ Session found:', {
        hasAccessToken: !!session.accessToken,
        hasUser: !!session.user,
        roles: session.user?.roles,
      });

      const userRoles = (session.user?.roles as string[]) || [];
      const hasAdminAccess = userRoles.some(role => ['admin', 'editor'].includes(role));

      if (!hasAdminAccess) {
        console.log('❌ Insufficient permissions');
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Create new block
      const { title, content, blockPath, imageUrl, videoId, status, locales, order } = req.body;

      if (!title || !content || !blockPath) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: title, content, blockPath' });
      }

      const backendUrl = `${BACKEND_URL}/graphql`;

      // Escape special characters in strings
      const escapeString = (str: string) =>
        str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      const mutation = `
        mutation {
          createBlock(input: {
            title: {
              en: "${escapeString(title.en || '')}"
              te: "${escapeString(title.te || '')}"
              hi: "${escapeString(title.hi || '')}"
              kn: "${escapeString(title.kn || '')}"
            }
            content: {
              en: "${escapeString(content.en || '')}"
              te: "${escapeString(content.te || '')}"
              hi: "${escapeString(content.hi || '')}"
              kn: "${escapeString(content.kn || '')}"
            }
            blockPath: "${escapeString(blockPath)}"
            ${imageUrl ? `imageUrl: "${escapeString(imageUrl)}"` : ''}
            ${videoId ? `videoId: { en: "${escapeString(videoId.en || '')}", te: "${escapeString(videoId.te || '')}", hi: "${escapeString(videoId.hi || '')}", kn: "${escapeString(videoId.kn || '')}" }` : ''}
            status: ${status || 'DRAFT'}
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
              updatedAt
            }
            isActive
          }
        }
      `;

      console.log('📝 Block creation:', {
        blockPath,
        hasToken: !!session?.accessToken,
        userId: session?.user?.id,
      });

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && {
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
        console.error('GraphQL POST errors:', data.errors);
        return res.status(400).json({ error: data.errors[0]?.message || 'GraphQL error' });
      }

      // Handle Apollo Server response format
      const block = data.data?.createBlock;
      if (!block) {
        console.error('Unexpected POST response format:', JSON.stringify(data));
        return res.status(500).json({ error: 'Unexpected response from backend' });
      }
      console.log('✅ Block created successfully:', block.id);

      res.status(201).json(block);
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
