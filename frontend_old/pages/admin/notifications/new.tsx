import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import { getAuthSession } from '@/lib/auth-dev';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row,
    Spinner,
} from 'react-bootstrap';

interface AdminNotificationsNewProps {
  userRoles: string[];
}

export default function AdminNotificationsNew({ userRoles }: AdminNotificationsNewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [data, setData] = useState('{}');
  const [targetType, setTargetType] = useState<'tokens' | 'users' | 'broadcast'>('tokens');
  const [tokens, setTokens] = useState('');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!body.trim()) {
      setError('Body is required');
      return false;
    }

    // Validate JSON data if provided
    if (data.trim() && data.trim() !== '{}') {
      try {
        JSON.parse(data);
      } catch (e) {
        setError('Data must be valid JSON');
        return false;
      }
    }

    // Validate at least one target
    if (targetType === 'tokens' && !tokens.trim()) {
      setError('At least one push token is required');
      return false;
    }
    if (targetType === 'users' && userIds.length === 0) {
      setError('At least one user is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (sendNow: boolean) => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const targets: any = {};
      if (targetType === 'broadcast') {
        targets.broadcast = true;
      } else if (targetType === 'tokens') {
        targets.tokens = tokens.split('\n').map(t => t.trim()).filter(Boolean);
      } else if (targetType === 'users') {
        targets.userIds = userIds;
      }

      const payload = {
        title: title.trim(),
        body: body.trim(),
        data: data.trim() && data.trim() !== '{}' ? JSON.parse(data) : {},
        targets,
        scheduledAt: scheduledAt ? scheduledAt : null,
        sendNow,
      };

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create notification');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Redirect to notification list after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/notifications');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating notification:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Layout>
        <Container className="py-5">
          <div className="text-center">
            <h2>Access Denied</h2>
            <p>Please log in to access admin panel.</p>
          </div>
        </Container>
      </Layout>
    );
  }

  const hasAdminAccess = userRoles.includes('admin');

  if (!hasAdminAccess) {
    return (
      <Layout>
        <Container className="py-5">
          <div className="text-center">
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to create notifications.</p>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminNav />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>Create Notification</h1>
            <p className="text-muted">Create a new push notification to send to mobile app users.</p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row className="mb-4">
            <Col>
              <Alert variant="success">
                Notification created successfully! Redirecting...
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={8}>
            <Card>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter notification title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      maxLength={200}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Body *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter notification body"
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      maxLength={1000}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Data (JSON)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder='{"key": "value"}'
                      value={data}
                      onChange={e => setData(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Optional JSON data to include with the notification
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Target Audience *</Form.Label>
                    <div className="mb-2">
                      <Form.Check
                        type="radio"
                        label="Specific Tokens"
                        name="targetType"
                        id="target-tokens"
                        checked={targetType === 'tokens'}
                        onChange={() => setTargetType('tokens')}
                      />
                      <Form.Check
                        type="radio"
                        label="Broadcast to All Users"
                        name="targetType"
                        id="target-broadcast"
                        checked={targetType === 'broadcast'}
                        onChange={() => setTargetType('broadcast')}
                      />
                    </div>

                    {targetType === 'tokens' && (
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Enter Expo push tokens (one per line)&#10;ExponentPushToken[xxxxx]&#10;ExponentPushToken[yyyyy]"
                        value={tokens}
                        onChange={e => setTokens(e.target.value)}
                      />
                    )}

                    {targetType === 'broadcast' && (
                      <Alert variant="warning">
                        This will send the notification to all registered devices. Use with caution!
                      </Alert>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Schedule (Optional)</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to send immediately (if &quot;Send Now&quot; is clicked)
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        'Save Draft'
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Now'
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => router.push('/admin/notifications')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getAuthSession(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  const userRoles = (session.user?.roles as string[]) || [];
  const hasAdminAccess = userRoles.includes('admin');

  if (!hasAdminAccess) {
    return {
      redirect: {
        destination: '/my-account',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userRoles,
    },
  };
};
