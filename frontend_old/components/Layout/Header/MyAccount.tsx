'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyAccount() {
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignIn = () => {
    signIn('keycloak', { callbackUrl: '/my-account' });
  };

  const handleSignOut = async () => {
    try {
      // Perform NextAuth signOut which will also trigger Keycloak logout
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      // Fallback: redirect manually if signOut fails
      window.location.href = '/';
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="my-account">
        <div className="account-menu px-3 py-2">
          <span className="text-muted">Loading...</span>
        </div>
      </div>
    );
  }

  // Show unauthenticated state
  return (
    <div className="my-account">
      {session ? (
        isMobile ? (
          // Mobile vertical layout
          <div className="account-menu-mobile">
            <Link
              href="/my-account"
              className="d-block text-decoration-none text-dark hover-bg-light px-3 py-2"
            >
              <i className="fas fa-user me-2"></i>
              My Account
            </Link>
            {/* Show admin link if user has admin access */}
            {session.user?.roles?.some((role: string) =>
              ['admin', 'editor', 'author'].includes(role)
            ) && (
              <Link
                href="/admin"
                className="d-block text-decoration-none text-dark hover-bg-light px-3 py-2"
              >
                <i className="fas fa-cog me-2"></i>
                Admin
              </Link>
            )}
            <Link
              href="#"
              className="d-block text-decoration-none text-danger hover-bg-light px-3 py-2"
              onClick={handleSignOut}
            >
              <i className="fas fa-sign-out-alt me-2"></i>
              Sign Out
            </Link>
          </div>
        ) : (
          // Desktop horizontal layout
          <div className="account-menu gr-text-6 gr-text-color contact mb-1 mt-1 py-1">
            <Link href="/my-account" className="gr-hover-text-orange fw-bold gr-text-6 text-black">
              My Account
            </Link>
            {/* Show admin link if user has admin access */}
            {session.user?.roles?.some((role: string) =>
              ['admin', 'editor', 'author'].includes(role)
            ) && (
              <>
                <span className="mx-2">|</span>
                <Link href="/admin" className="gr-hover-text-orange fw-bold gr-text-6 text-black">
                  Admin
                </Link>
              </>
            )}
            <span className="mx-2">|</span>
            <Link
              href="#"
              className="gr-hover-text-orange fw-bold gr-text-color text-black"
              onClick={handleSignOut}
            >
              Sign Out
            </Link>
          </div>
        )
      ) : (
        <div className="account-menu gr-text-color contact mb-1 mt-1 py-1">
          <Link href="#" className="gr-hover-text-orange fw-bold text-black" onClick={handleSignIn}>
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
