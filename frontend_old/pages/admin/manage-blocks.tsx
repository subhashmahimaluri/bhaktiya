import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import { getAuthSession } from '@/lib/auth-dev';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Row, Spinner, Table } from 'react-bootstrap';

interface Block {
  id: string;
  title: { te: string; en: string; hi: string; kn: string };
  content: { te: string; en: string; hi: string; kn: string };
  blockPath: string;
  imageUrl?: string;
  status: string;
  order: number;
  audit: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  isActive: boolean;
}

interface ManageBlocksPageProps {
  userRoles: string[];
}

export default function ManageBlocksPage({ userRoles }: ManageBlocksPageProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('te');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * limit;
      const response = await fetch(`/api/blocks?limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Failed to load blocks');
      }

      const data = await response.json();
      setBlocks(data.blocks || []);
      setTotalCount(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete block');
      }

      setBlocks(prev => prev.filter(b => b.id !== blockId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete block');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'primary' | 'warning' | 'danger' | 'success'> = {
      DRAFT: 'warning',
      PUBLISHED: 'success',
      ARCHIVED: 'danger',
    };

    return (
      <Badge bg={statusMap[status] || 'secondary'}>
        {status === 'DRAFT' ? 'Draft' : status === 'PUBLISHED' ? 'Published' : 'Archived'}
      </Badge>
    );
  };

  const handlePageChange = (newPage: number) => {
    loadBlocks(newPage);
  };

  const getTitleForLocale = (block: Block, locale: string): string => {
    return block.title[locale as keyof typeof block.title] || 'Untitled';
  };

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage * limit < totalCount;

  return (
    <Layout>
      <AdminNav />
      <Container className="py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h1>Manage Blocks</h1>
          </Col>
          <Col xs="auto">
            <Link href="/admin/add-block" passHref>
              <Button variant="primary">
                <i className="bi bi-plus-lg me-2"></i>
                Add New Block
              </Button>
            </Link>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-3">
          <Col xs="auto">
            <div className="d-flex gap-2">
              <span className="text-muted">View titles in:</span>
              {['te', 'en', 'hi', 'kn'].map(locale => (
                <Button
                  key={locale}
                  variant={currentLocale === locale ? 'outline-primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setCurrentLocale(locale)}
                >
                  {locale.toUpperCase()}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="py-5 text-center">
            <Spinner animation="border" />
            <p className="mt-2">Loading blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            No blocks found. <Link href="/admin/add-block">Create one</Link>
          </Alert>
        ) : (
          <>
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '30%' }}>Title ({currentLocale.toUpperCase()})</th>
                    <th>Block Path</th>
                    <th style={{ width: '10%' }}>Order</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th>Last Updated</th>
                    <th style={{ width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map(block => (
                    <tr key={block.id}>
                      <td>
                        <div>
                          <strong>{getTitleForLocale(block, currentLocale)}</strong>
                          <br />
                          <small className="text-muted">{block.blockPath}</small>
                        </div>
                      </td>
                      <td>
                        <code>{block.blockPath}</code>
                      </td>
                      <td>{block.order}</td>
                      <td>{getStatusBadge(block.status)}</td>
                      <td>
                        <small>
                          {new Date(block.audit.updatedAt).toLocaleDateString()}{' '}
                          {new Date(block.audit.updatedAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/admin/blocks/${block.id}/edit`} passHref>
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-pencil"></i> Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={deleting}
                            onClick={() => handleDelete(block.id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Row className="align-items-center mt-3">
              <Col>
                <small className="text-muted">
                  Showing {(currentPage - 1) * limit + 1} to{' '}
                  {Math.min(currentPage * limit, totalCount)} of {totalCount} block
                  {totalCount !== 1 ? 's' : ''}
                </small>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={!hasPrevPage}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={!hasNextPage}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        )}
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
