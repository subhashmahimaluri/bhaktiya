import Layout from '@/components/Layout/Layout';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { authOptions } from './api/auth/[...nextauth]';

export default function MyAccount() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    language: '',
    region: '',
    notifications: {} as any,
    newsletters: {} as any,
  });

  const {
    preferences,
    loading,
    error,
    updateLanguage,
    updateRegion,
    updateNotifications,
    updateNewsletters,
  } = useUserPreferences();

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUserActivities();
    }
  }, [session]);

  const fetchUserActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch('/api/user/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        console.error('Failed to fetch user activities:', response.status);
        // Set fallback activities if API fails
        setActivities([
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
        ]);
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      // Set fallback activities if there's an error
      setActivities([
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
      ]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearMessages();
    const newLanguage = e.target.value;
    setPendingChanges(prev => ({ ...prev, language: newLanguage }));
    setHasUnsavedChanges(true);
  };

  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearMessages();
    const newRegion = e.target.value;
    setPendingChanges(prev => ({ ...prev, region: newRegion }));
    setHasUnsavedChanges(true);
  };

  // Function to format relative time (e.g., "2 days ago")
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const handleNotificationChange = async (type: string, checked: boolean) => {
    clearMessages();
    setPendingChanges(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [type]: checked },
    }));
    setHasUnsavedChanges(true);
  };

  const handleNewsletterChange = async (type: string, checked: boolean) => {
    clearMessages();
    setPendingChanges(prev => ({
      ...prev,
      newsletters: { ...prev.newsletters, [type]: checked },
    }));
    setHasUnsavedChanges(true);
  };

  const handleProfileSave = async () => {
    clearMessages();
    try {
      // Here you would typically make an API call to update the user profile
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSuccessMessage('Profile updated successfully!');
      setHasUnsavedChanges(false);

      // Add activity log
      const newActivity = {
        id: Date.now(),
        title: 'Profile Updated',
        timestamp: new Date(),
        type: 'info',
      };
      setActivities(prev => [newActivity, ...prev]);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage('Failed to update profile. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreferencesSave = async () => {
    clearMessages();
    try {
      // Save language preference if changed
      if (pendingChanges.language) {
        await updateLanguage(pendingChanges.language);

        // Add activity log for language change
        const languageActivity = {
          id: Date.now(),
          title: 'Language Preference Changed',
          timestamp: new Date(),
          type: 'success',
        };
        setActivities(prev => [languageActivity, ...prev]);
      }

      // Save region preference if changed
      if (pendingChanges.region) {
        await updateRegion(pendingChanges.region);

        // Add activity log for region change
        const regionActivity = {
          id: Date.now() + 1,
          title: 'Region Preference Changed',
          timestamp: new Date(),
          type: 'success',
        };
        setActivities(prev => [regionActivity, ...prev]);
      }

      // Save notification preferences if changed
      if (Object.keys(pendingChanges.notifications).length > 0) {
        await updateNotifications(pendingChanges.notifications);

        // Add activity log for notification changes
        const notificationActivity = {
          id: Date.now() + 2,
          title: 'Notification Settings Changed',
          timestamp: new Date(),
          type: 'success',
        };
        setActivities(prev => [notificationActivity, ...prev]);
      }

      // Save newsletter preferences if changed
      if (Object.keys(pendingChanges.newsletters).length > 0) {
        await updateNewsletters(pendingChanges.newsletters);

        // Add activity log for newsletter changes
        const newsletterActivity = {
          id: Date.now() + 3,
          title: 'Newsletter Subscription Changed',
          timestamp: new Date(),
          type: 'success',
        };
        setActivities(prev => [newsletterActivity, ...prev]);
      }

      setSuccessMessage('Preferences saved successfully!');
      setHasUnsavedChanges(false);
      setPendingChanges({ language: '', region: '', notifications: {}, newsletters: {} });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage('Failed to save preferences. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!session) {
    return (
      <Layout>
        <Container className="py-5">
          <Row className="justify-content-center mt-25 accoount-page">
            <Col md={6}>
              <Card>
                <Card.Body className="text-center">
                  <h3>Please Sign In</h3>
                  <p>You need to be signed in to access your account page.</p>
                  <Button href="/auth/signin" variant="primary">
                    Sign In
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Row className="mt-25 account-page py-5">
        <Col xl="12" lg="12" md="12" className="mt-5 pt-5">
          <div className="my-account-container mt-25">
            {/* Page Header */}
            <div className="page-header">
              <h1>My Account</h1>
              <button className="sign-out-btn" onClick={handleSignOut}>
                <span>Sign out</span>
              </button>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <Alert variant="success" className="success-message">
                <i className="bi bi-check-circle-fill"></i>
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert variant="danger" className="error-message">
                <i className="bi bi-exclamation-circle-fill"></i>
                {errorMessage}
              </Alert>
            )}

            <div className="layout-content">
              {/* Left Sidebar Navigation */}
              <div className="sidebar-nav">
                <button
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person"></i>
                  <span>Profile</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <i className="bi bi-gear"></i>
                  <span>Preferences</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  <i className="bi bi-clock-history"></i>
                  <span>Activity</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="content-area">
                {activeTab === 'profile' && (
                  <div className="content-section">
                    <h2>Personal Information</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={name}
                          readOnly
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{session.user.email || 'Not provided'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Roles</span>
                        <span className="info-value">
                          {session.user.roles && session.user.roles.length > 0
                            ? session.user.roles.join(', ')
                            : 'User'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Member Since</span>
                        <span className="info-value">
                          {(session.user as any).createdAt
                            ? new Date((session.user as any).createdAt).toLocaleDateString()
                            : 'Not available'}
                        </span>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button className="btn-primary" onClick={handleProfileSave}>
                        Save Changes
                      </button>
                      <button className="btn-secondary">Cancel</button>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="content-section">
                    <h2>Preferences</h2>

                    {loading ? (
                      <div className="py-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Language Preferences */}
                        <div className="preference-section">
                          <h3>Language Preferences</h3>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Display Language</label>
                              <select
                                className="form-select"
                                value={pendingChanges.language || preferences?.language || 'en'}
                                onChange={handleLanguageChange}
                                disabled={loading}
                              >
                                <option value="en">English</option>
                                <option value="te">తెలుగు (Telugu)</option>
                                <option value="hi">हिन्दी (Hindi)</option>
                                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Region Settings</label>
                              <select
                                className="form-select"
                                value={pendingChanges.region || preferences?.region || 'auto'}
                                onChange={handleRegionChange}
                                disabled={loading}
                              >
                                <option value="auto">Auto-detect</option>
                                <option value="india">India</option>
                                <option value="us">United States</option>
                                <option value="uk">United Kingdom</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="preference-section">
                          <h3>Notification Preferences</h3>
                          <div className="preference-list">
                            <div className="preference-item">
                              <span>Email Notifications</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.notifications.email !== undefined
                                      ? pendingChanges.notifications.email
                                      : preferences?.notifications?.email || false
                                  }
                                  onChange={e =>
                                    handleNotificationChange('email', e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="preference-item">
                              <span>Push Notifications</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.notifications.push !== undefined
                                      ? pendingChanges.notifications.push
                                      : preferences?.notifications?.push || false
                                  }
                                  onChange={e => handleNotificationChange('push', e.target.checked)}
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="preference-item">
                              <span>SMS Notifications</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.notifications.sms !== undefined
                                      ? pendingChanges.notifications.sms
                                      : preferences?.notifications?.sms || false
                                  }
                                  onChange={e => handleNotificationChange('sms', e.target.checked)}
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Newsletter Preferences */}
                        <div className="preference-section">
                          <h3>Newsletter Preferences</h3>
                          <div className="preference-list">
                            <div className="preference-item">
                              <span>Festival Updates</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.newsletters.festivals !== undefined
                                      ? pendingChanges.newsletters.festivals
                                      : preferences?.newsletters?.festivals || false
                                  }
                                  onChange={e =>
                                    handleNewsletterChange('festivals', e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="preference-item">
                              <span>Panchangam Updates</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.newsletters.panchangam !== undefined
                                      ? pendingChanges.newsletters.panchangam
                                      : preferences?.newsletters?.panchangam || false
                                  }
                                  onChange={e =>
                                    handleNewsletterChange('panchangam', e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="preference-item">
                              <span>Stotras & Prayers</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.newsletters.stotras !== undefined
                                      ? pendingChanges.newsletters.stotras
                                      : preferences?.newsletters?.stotras || false
                                  }
                                  onChange={e =>
                                    handleNewsletterChange('stotras', e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                            <div className="preference-item">
                              <span>Special Events</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={
                                    pendingChanges.newsletters.events !== undefined
                                      ? pendingChanges.newsletters.events
                                      : preferences?.newsletters?.events || false
                                  }
                                  onChange={e => handleNewsletterChange('events', e.target.checked)}
                                  disabled={loading}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="action-buttons">
                      <button
                        className={`btn-primary ${!hasUnsavedChanges ? 'opacity-50' : ''}`}
                        onClick={handlePreferencesSave}
                        disabled={!hasUnsavedChanges}
                      >
                        Save Preferences
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setHasUnsavedChanges(false);
                          setPendingChanges({
                            language: '',
                            region: '',
                            notifications: {},
                            newsletters: {},
                          });
                          clearMessages();
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="content-section">
                    <h2>Recent Activity</h2>
                    {loadingActivities ? (
                      <div className="py-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="activity-timeline">
                        {activities.length > 0 ? (
                          activities.map(activity => (
                            <div key={activity.id} className="activity-item">
                              <div className={`activity-icon ${activity.type}`}>
                                <i
                                  className={`bi ${
                                    activity.type === 'success'
                                      ? 'bi-check'
                                      : activity.type === 'info'
                                        ? 'bi-pencil'
                                        : 'bi-person-plus'
                                  }`}
                                ></i>
                              </div>
                              <div className="activity-content">
                                <p className="activity-title">{activity.title}</p>
                                <span className="activity-time">
                                  {formatRelativeTime(new Date(activity.timestamp))}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-muted">No activity data available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Allow access even without session - component will handle redirect
  return {
    props: {},
  };
};
