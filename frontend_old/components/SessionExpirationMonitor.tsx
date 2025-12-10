'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

/**
 * Global component to monitor session expiration and automatically sign out
 * when NextAuth token refresh fails
 * 
 * This component should be mounted in _app.tsx to work globally
 */
export default function SessionExpirationMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasSignedOut = useRef(false);

  useEffect(() => {
    // Only check if session is loaded and we haven't already signed out
    if (status === 'loading' || hasSignedOut.current) {
      return;
    }

    // Check if session has RefreshAccessTokenError
    if (session && (session as any).error === 'RefreshAccessTokenError') {
      console.warn('🔐 Session expired - automatically signing out user');
      
      // Prevent duplicate sign-out calls
      hasSignedOut.current = true;

      // Store a message to show on the sign-in page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('signOutReason', 'session_expired');
      }

      // Sign out and redirect to sign-in page with callback URL
      signOut({
        callbackUrl: `${window.location.pathname}${window.location.search}`,
        redirect: true,
      });
    }
  }, [session, status, router]);

  // This component doesn't render anything
  return null;
}
