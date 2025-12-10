import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import { getAuthSession } from '@/lib/auth-dev';
import { formatDistanceToNow } from 'date-fns';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Spinner,
    Table,
} from 'react-bootstrap';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdBy: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  status: 'draft' | 'sent' | 'failed' | 'scheduled';
  sentCount: number;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface AdminNotificationsProps {
  userRoles: string[];
}

export default function AdminNotifications({ userRoles }: AdminNotificationsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; notificationId: string | null }>({
    show: false,
    notificationId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const limit = 20;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const response = await fetch(`/api/admin/notifications?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch notifications');
      }

      const data: NotificationsResponse = await response.json();
      setNotifications(data.notifications);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete notification');
      }

      // Remove the deleted notification from the list
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setTotal(prev => prev - 1);
      setDeleteModal({ show: false, notificationId: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send notification');
      }

      // Refresh list
      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  };

  const showDeleteModal = (notificationId: string) => {
    setDeleteModal({ show: true, notificationId });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, notificationId: null });
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, page]);

  // Debounced search
  useEffect(() => {
    if (!session) return;

    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on new search
      fetchNotifications();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, session]);

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
            <p>You don&apos;t have permission to manage notifications.</p>
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
            <h1>Manage Notifications</h1>
            <p className="text-muted">Create and send push notifications to mobile app users.</p>
          </Col>
          <Col xs="auto">
            <Link href="/admin/notifications/new" passHref>
              <Button variant="primary">
                Create Notification
              </Button>
            </Link>
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

        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                {loading ? (
                  <div className="py-4 text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-muted">No notifications found.</p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Body</th>
                        <th>Created By</th>
                        <th>Status</th>
                        <th>Sent Count</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(notification => (
                        <tr key={notification.id}>
                          <td>
                            <strong>{notification.title}</strong>
                          </td>
                          <td>
                            <div
                              style={{
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={notification.body}
                            >
                              {notification.body}
                            </div>
                          </td>
                          <td>
                            {notification.createdBy.firstName
                              ? `${notification.createdBy.firstName} ${notification.createdBy.lastName || ''}`
                              : notification.createdBy.email}
                          </td>
                          <td>{getStatusBadge(notification.status)}</td>
                          <td>{notification.sentCount}</td>
                          <td>
                            <small title={new Date(notification.createdAt).toLocaleString()}>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </small>
                          </td>
                          <td>
                            <Link href={`/admin/notifications/${notification.id}`} passHref>
                              <Button variant="outline-primary" size="sm" className="me-2">
                                View
                              </Button>
                            </Link>
                            {notification.status === 'draft' && (
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleSendNotification(notification.id)}
                              >
                                Send
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => showDeleteModal(notification.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {/* Pagination */}
                {!loading && notifications.length > 0 && totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <div className="btn-group">
                      <Button
                        variant="outline-primary"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="btn btn-outline-primary disabled">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline-primary"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal show={deleteModal.show} onHide={hideDeleteModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this notification? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={hideDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModal.notificationId && handleDeleteNotification(deleteModal.notificationId)}
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
    },
  };
};
