import { getAuthSession } from '@/lib/auth-dev';
import { NextApiRequest, NextApiResponse } from 'next';

// In a real application, you would store preferences in a database
// For this example, we'll use a simple in-memory store
const userPreferences: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST and GET methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the session to authenticate the user
  // Handle authentication errors gracefully
  let session = null;
  try {
    session = await getAuthSession(req, res);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized - No valid session' });
  }

  const userId = session.user.id;

  try {
    if (req.method === 'GET') {
      // Return user preferences
      const preferences = userPreferences[userId] || {
        language: 'en',
        region: 'auto',
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
        newsletters: {
          festivals: true,
          panchangam: true,
          stotras: false,
          events: false,
        },
      };

      return res.status(200).json(preferences);
    }

    if (req.method === 'POST') {
      // Update user preferences
      const { language, region, notifications, newsletters } = req.body;

      // Validate input
      if (language && !['en', 'te', 'hi', 'kn', 'ta'].includes(language)) {
        return res.status(400).json({ error: 'Invalid language preference' });
      }

      if (region && !['auto', 'india', 'us', 'uk', 'other'].includes(region)) {
        return res.status(400).json({ error: 'Invalid region preference' });
      }

      // Initialize user preferences if not exists
      if (!userPreferences[userId]) {
        userPreferences[userId] = {
          language: 'en',
          region: 'auto',
          notifications: {
            email: true,
            push: false,
            sms: false,
          },
          newsletters: {
            festivals: true,
            panchangam: true,
            stotras: false,
            events: false,
          },
        };
      }

      // Update preferences
      if (language !== undefined) {
        userPreferences[userId].language = language;
      }

      if (region !== undefined) {
        userPreferences[userId].region = region;
      }

      if (notifications !== undefined) {
        userPreferences[userId].notifications = {
          ...userPreferences[userId].notifications,
          ...notifications,
        };
      }

      if (newsletters !== undefined) {
        userPreferences[userId].newsletters = {
          ...userPreferences[userId].newsletters,
          ...newsletters,
        };
      }

      return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: userPreferences[userId],
      });
    }
  } catch (error) {
    console.error('Error handling user preferences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
