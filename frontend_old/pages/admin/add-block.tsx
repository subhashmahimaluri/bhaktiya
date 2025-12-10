import Layout from '@/components/Layout/Layout';
import AdminNav from '@/components/admin/AdminNav';
import BlockEditor from '@/components/admin/BlockEditor';
import { getAuthSession } from '@/lib/auth-dev';
import { GetServerSideProps } from 'next';
import { Container } from 'react-bootstrap';

interface AddBlockPageProps {
  userRoles: string[];
}

export default function AddBlockPage({ userRoles }: AddBlockPageProps) {
  return (
    <Layout>
      <AdminNav />
      <Container className="py-4">
        <BlockEditor />
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
