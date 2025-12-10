import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NewsletterPreferences {
  festivals: boolean;
  panchangam: boolean;
  stotras: boolean;
  events: boolean;
}

interface UserPreferences {
  language: string;
  region: string;
  notifications: NotificationPreferences;
  newsletters: NewsletterPreferences;
}

export const useUserPreferences = () => {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences on component mount
  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/preferences');

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      return data.preferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (language: string) => {
    return updatePreferences({ language });
  };

  const updateRegion = async (region: string) => {
    return updatePreferences({ region });
  };

  const updateNotifications = async (notifications: Partial<NotificationPreferences>) => {
    const currentNotifications = preferences?.notifications || {
      email: true,
      push: false,
      sms: false,
    };
    return updatePreferences({
      notifications: { ...currentNotifications, ...notifications },
    });
  };

  const updateNewsletters = async (newsletters: Partial<NewsletterPreferences>) => {
    const currentNewsletters = preferences?.newsletters || {
      festivals: true,
      panchangam: true,
      stotras: false,
      events: false,
    };
    return updatePreferences({
      newsletters: { ...currentNewsletters, ...newsletters },
    });
  };

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    updateLanguage,
    updateRegion,
    updateNotifications,
    updateNewsletters,
  };
};
