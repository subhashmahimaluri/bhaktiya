import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export interface DevSession {
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
  accessToken: string;
  expires: string;
  error?: string;
}

export function isDevelopmentMode(): boolean {
  // In production Docker containers, NODE_ENV should always be 'production'
  // Only enable dev mode if explicitly in development environment
  const nodeEnv = process.env.NODE_ENV;

  // If NODE_ENV is explicitly set to 'production', always use production mode
  if (nodeEnv === 'production') {
    return false;
  }

  // Enable dev mode only if:
  // 1. NODE_ENV is 'development', OR
  // 2. NEXTAUTH_URL includes 'localhost', OR
  // 3. Keycloak is not properly configured (missing client secret)
  return (
    nodeEnv === 'development' ||
    process.env.NEXTAUTH_URL?.includes('localhost') ||
    !process.env.KEYCLOAK_CLIENT_SECRET ||
    process.env.KEYCLOAK_CLIENT_SECRET === 'your_keycloak_client_secret'
  );
}

export function createDevSession(): DevSession {
  return {
    user: {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Development User',
      roles: ['admin'],
    },
    accessToken: 'dev-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function getAuthSession(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
) {
  // In development mode, provide a mock session immediately if no proper Keycloak config
  if (isDevelopmentMode()) {
    return createDevSession();
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
      return session;
    }

    return null;
  } catch (error) {
    // In production, throw the error so it can be handled properly
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

/**
 * Check if a session has an expired JWT that failed to refresh
 * Returns true if the session exists but has a RefreshAccessTokenError
 */
export function isSessionExpired(session: DevSession | any | null): boolean {
  return session !== null && session.error === 'RefreshAccessTokenError';
}

/**
 * Standard response for expired sessions across all API routes
 */
export function sendSessionExpiredResponse(res: NextApiResponse) {
  return res.status(401).json({
    message: 'Session expired',
    error: 'jwt_expired',
    requiresReauth: true,
  });
}
