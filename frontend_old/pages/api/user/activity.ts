import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// Use server-side env var for API routes (same as categories endpoint)
const BACKEND_URL =
  process.env.BACKEND_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL ||
  'http://localhost:4000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session - let backend handle authentication validation
    let session = null;
    try {
      session = await getAuthSession(req, res);
    } catch (error) {
      // Log auth error but continue - let backend validate the token
      console.error('Session retrieval error:', error);
    }

    // If no session in production, we still need a token to try
    if (!session && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ message: 'Unauthorized - No session available' });
    }

    // For development mode, check if we have a development session
    if (process.env.NODE_ENV === 'development' && (!session || !session.user?.id)) {
      // Create a mock session for development
      const mockSession = {
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          name: 'Development User',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        accessToken: 'dev-token',
      };

      // Return mock activities for development
      const mockActivities = [
        {
          id: 1,
          title: 'Account Created',
          timestamp: new Date(mockSession.user.createdAt),
          type: 'default',
        },
        {
          id: 2,
          title: 'Last Login',
          timestamp: new Date(mockSession.user.lastLogin),
          type: 'info',
        },
      ];

      return res.status(200).json({ activities: mockActivities });
    }

    if (!session || !session.user?.id) {
      return res.status(401).json({ message: 'Unauthorized - Invalid session' });
    }

    // Fetch user data from GraphQL API
    const graphqlQuery = {
      query: `
        query {
          me {
            id
            email
            createdAt
            lastLogin
            updatedAt
          }
        }
      `,
    };

    const response = await fetch(`${BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
        }),
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    const user = userData.data?.me;

    if (!user) {
      throw new Error('User data not found');
    }

    // Create activities based on real user data
    const activities = [
      {
        id: 1,
        title: 'Account Created',
        timestamp: new Date(user.createdAt),
        type: 'default',
      },
    ];

    // Add last login activity if available
    if (user.lastLogin) {
      activities.push({
        id: 2,
        title: 'Last Login',
        timestamp: new Date(user.lastLogin),
        type: 'info',
      });
    }

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);

    // Fallback to mock data if API fails
    const fallbackActivities = [
      {
        id: 1,
        title: 'Account Created',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        type: 'default',
      },
      {
        id: 2,
        title: 'Last Login',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        type: 'info',
      },
    ];

    return res.status(200).json({ activities: fallbackActivities });
  }
}
