import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import { getAuthSession } from '@/lib/auth-dev';
import { formatDistanceToNow } from 'date-fns';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
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
  Table,
} from 'react-bootstrap';

interface Comment {
  id: string;
  canonicalSlug: string;
  lang: string;
  userName: string;
  userEmail?: string;
  text: string;
  status: 'approved' | 'pending' | 'spam';
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  items: Comment[];
  total: number;
}

interface AdminCommentsProps {
  userRoles: string[];
}

export default function AdminComments({ userRoles }: AdminCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; commentId: string | null }>({
    show: false,
    commentId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const limit = 20;
  const offset = (page - 1) * limit;

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/comments?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch comments');
      }

      const data: CommentsResponse = await response.json();
      setComments(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete comment');
      }

      // Remove the deleted comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setTotal(prev => prev - 1);
      setDeleteModal({ show: false, commentId: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const showDeleteModal = (commentId: string) => {
    setDeleteModal({ show: true, commentId });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, commentId: null });
  };

  useEffect(() => {
    if (session) {
      fetchComments();
    }
  }, [session, page]);

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

  const hasAdminAccess = userRoles.some(role => ['admin', 'editor'].includes(role));

  if (!hasAdminAccess) {
    return (
      <Layout>
        <Container className="py-5">
          <div className="text-center">
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to manage comments.</p>
          </div>
        </Container>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'spam':
        return <Badge bg="danger">Spam</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <AdminNav />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1>Manage Comments</h1>
            <p className="text-muted">View and manage all user comments on your content.</p>
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
                ) : comments.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-muted">No comments found.</p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Comment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map(comment => (
                        <tr key={comment.id}>
                          <td>
                            <div>
                              <strong>{comment.canonicalSlug}</strong>
                              <br />
                              <small className="text-muted">({comment.lang})</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{comment.userName}</strong>
                              {comment.userEmail && (
                                <>
                                  <br />
                                  <small className="text-muted">{comment.userEmail}</small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={comment.text}
                            >
                              {comment.text}
                            </div>
                          </td>
                          <td>{getStatusBadge(comment.status)}</td>
                          <td>
                            <small title={new Date(comment.createdAt).toLocaleString()}>
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                              })}
                            </small>
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => showDeleteModal(comment.id)}
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
                {!loading && comments.length > 0 && totalPages > 1 && (
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
            Are you sure you want to delete this comment? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={hideDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModal.commentId && handleDeleteComment(deleteModal.commentId)}
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
                'Delete Comment'
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
  const hasAdminAccess = userRoles.some(role => ['admin', 'editor'].includes(role));

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
