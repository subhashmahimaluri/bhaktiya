import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import { getAuthSession } from '@/lib/auth-dev';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Modal,
    Row,
    Spinner,
} from 'react-bootstrap';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  targets: {
    userIds?: string[];
    tokens?: string[];
    broadcast?: boolean;
  };
  sentCount: number;
  status: 'draft' | 'sent' | 'failed' | 'scheduled';
  providerResult?: any;
  createdBy: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminNotificationDetailProps {
  userRoles: string[];
  notificationId: string;
}

export default function AdminNotificationDetail({ userRoles, notificationId }: AdminNotificationDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchNotification = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/notifications/${notificationId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch notification');
      }

      const data = await response.json();
      setNotification(data.notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setSending(true);
      setError(null);

      const response = await fetch(`/api/admin/notifications/${notificationId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send notification');
      }

      // Refresh notification data
      fetchNotification();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete notification');
      }

      // Redirect to list
      router.push('/admin/notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNotification();
    }
  }, [session, notificationId]);

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
            <p>You don&apos;t have permission to view notifications.</p>
          </div>
        </Container>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge bg="success">Sent</Badge>;
      case 'draft':
        return <Badge bg="secondary">Draft</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      case 'scheduled':
        return <Badge bg="info">Scheduled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <AdminNav />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <Button variant="outline-secondary" onClick={() => router.push('/admin/notifications')}>
              ← Back to Notifications
            </Button>
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

        {loading ? (
          <Row>
            <Col className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Col>
          </Row>
        ) : !notification ? (
          <Row>
            <Col className="text-center py-5">
              <Alert variant="danger">Notification not found</Alert>
            </Col>
          </Row>
        ) : (
          <>
            <Row className="mb-4">
              <Col>
                <h1>{notification.title}</h1>
                <div className="mb-2">{getStatusBadge(notification.status)}</div>
                <div className="d-flex gap-2">
                  {notification.status === 'draft' && (
                    <Button
                      variant="success"
                      onClick={handleSendNotification}
                      disabled={sending}
                    >
                      {sending ? (
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
                  )}
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Card className="mb-3">
                  <Card.Header>Details</Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Body:</strong>
                      <p>{notification.body}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Created By:</strong>
                      <p>
                        {notification.createdBy.firstName
                          ? `${notification.createdBy.firstName} ${notification.createdBy.lastName || ''} (${notification.createdBy.email})`
                          : notification.createdBy.email}
                      </p>
                    </div>
                    <div className="mb-3">
                      <strong>Sent Count:</strong>
                      <p>{notification.sentCount}</p>
                    </div>
                    <div className="mb-3">
                      <strong>Created At:</strong>
                      <p>{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {notification.sentAt && (
                      <div className="mb-3">
                        <strong>Sent At:</strong>
                        <p>{new Date(notification.sentAt).toLocaleString()}</p>
                      </div>
                    )}
                    {notification.scheduledAt && (
                      <div className="mb-3">
                        <strong>Scheduled At:</strong>
                        <p>{new Date(notification.scheduledAt).toLocaleString()}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>Targets</Card.Header>
                  <Card.Body>
                    {notification.targets.broadcast && (
                      <Alert variant="info">Broadcast to all users</Alert>
                    )}
                    {notification.targets.userIds && notification.targets.userIds.length > 0 && (
                      <div className="mb-3">
                        <strong>User IDs:</strong>
                        <p>{notification.targets.userIds.join(', ')}</p>
                      </div>
                    )}
                    {notification.targets.tokens && notification.targets.tokens.length > 0 && (
                      <div className="mb-3">
                        <strong>Tokens ({notification.targets.tokens.length}):</strong>
                        <pre style={{ maxHeight: '200px', overflow: 'auto', fontSize: '0.85rem' }}>
                          {notification.targets.tokens.join('\n')}
                        </pre>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {notification.data && Object.keys(notification.data).length > 0 && (
                  <Card className="mb-3">
                    <Card.Header>Data</Card.Header>
                    <Card.Body>
                      <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    </Card.Body>
                  </Card>
                )}

                {notification.providerResult && (
                  <Card className="mb-3">
                    <Card.Header>Provider Result</Card.Header>
                    <Card.Body>
                      <pre style={{ maxHeight: '400px', overflow: 'auto' }}>
                        {JSON.stringify(notification.providerResult, null, 2)}
                      </pre>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={deleteModal} onHide={() => setDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this notification? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteNotification}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                'Delete Notification'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
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
      notificationId: context.params?.id || '',
    },
  };
};
