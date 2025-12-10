import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export interface SessionStatus {
  /** Whether the session is currently loading */
  isLoading: boolean;
  
  /** Whether a user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether the session has expired (JWT refresh failed) */
  isExpired: boolean;
  
  /** The session data if authenticated and not expired */
  session: any | null;
  
  /** Error message if session is expired */
  errorMessage: string | null;
}

/**
 * Custom hook to check session status including JWT expiration
 * 
 * Usage:
 * ```tsx
 * const { isExpired, isAuthenticated, errorMessage } = useSessionStatus();
 * 
 * if (isExpired) {
 *   return <LoginPrompt message={errorMessage} />;
 * }
 * ```
 */
export function useSessionStatus(): SessionStatus {
  const { data: session, status } = useSession();

  const sessionStatus = useMemo(() => {
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated' && !!session;
    const isExpired = isAuthenticated && (session as any)?.error === 'RefreshAccessTokenError';

    let errorMessage: string | null = null;
    if (isExpired) {
      errorMessage = 'Your session has expired. Please log in again.';
    }

    return {
      isLoading,
      isAuthenticated,
      isExpired,
      session: isExpired ? null : session,
      errorMessage,
    };
  }, [session, status]);

  return sessionStatus;
}
