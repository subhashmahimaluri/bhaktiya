import Layout from '@/components/Layout/Layout';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth/next';
import { getCsrfToken, getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { authOptions } from '../api/auth/[...nextauth]';

export default function SignIn({
  providers,
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  useEffect(() => {
    // Check if user was redirected due to session expiration
    if (typeof window !== 'undefined') {
      const reason = sessionStorage.getItem('signOutReason');
      if (reason === 'session_expired') {
        setShowExpiredMessage(true);
        sessionStorage.removeItem('signOutReason');

        // Auto-hide after 10 seconds
        setTimeout(() => setShowExpiredMessage(false), 10000);
      }
    }
  }, []);

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center my-5 py-5">
          <Col md={6} lg={4}>
            {showExpiredMessage && (
              <Alert
                variant="warning"
                dismissible
                onClose={() => setShowExpiredMessage(false)}
                className="mb-3"
              >
                <Alert.Heading className="h6">
                  <i className="bi bi-clock-history me-2"></i>
                  Session Expired
                </Alert.Heading>
                <p className="small mb-0">
                  Your session has expired. Please sign in again to continue.
                </p>
              </Alert>
            )}

            <Card>
              <Card.Body>
                <Card.Title className="mb-4 text-center">Sign In</Card.Title>
                <p className="text-muted mb-4 text-center">Sign in to access the account panel</p>

                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

                {Object.values(providers).map(provider => (
                  <div key={provider.name} className="d-grid">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => signIn(provider.id, { callbackUrl: '/my-account' })}
                    >
                      Sign in with
                    </Button>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect to my-account
  if (session) {
    return { redirect: { destination: '/my-account' } };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

  return {
    props: {
      providers: providers ?? [],
      csrfToken: csrfToken ?? '',
    },
  };
}
