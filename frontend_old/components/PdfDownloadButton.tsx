'use client';

import { signIn, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';

interface PdfDownloadButtonProps {
  slug: string;
  title: string;
  language: string;
}

export default function PdfDownloadButton({ slug, title, language }: PdfDownloadButtonProps) {
  const { data: session, status } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessage, setShowMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [pendingDownload, setPendingDownload] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Button text: "Download [Title] in telugu pdf" for both languages
  const buttonText = `${title} ${language === 'te' ? 'Telugu' : 'English'} pdf`;
  const ariaLabel = buttonText;

  // Handle download intent - preserve across login
  const handleDownloadClick = useCallback(() => {
    if (status === 'loading') {
      return;
    }

    // Check if session has expired (RefreshAccessTokenError)
    if (session && (session as any).error === 'RefreshAccessTokenError') {
      setShowMessage({
        type: 'error',
        text: 'Your session has expired. Please log in again.',
      });
      setShowLoginModal(true);
      return;
    }

    if (!session) {
      // Store download intent for after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'pdfDownloadIntent',
          JSON.stringify({ slug, lang: language, intent: 'download-pdf' })
        );
      }
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, proceed with download
    initiateDownload();
  }, [session, status, slug, language]);

  // Poll for PDF readiness
  const pollForPdf = useCallback(async () => {
    if (isPolling) return; // Prevent duplicate polling

    setIsPolling(true);
    const maxAttempts = 20; // Poll for up to 40 seconds (20 * 2s)
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/stotra/${slug}/pdf?lang=${language}`);

        if (response.status === 200) {
          // PDF is ready!
          clearInterval(pollInterval);
          setIsPolling(false);
          setIsDownloading(false);

          const data = await response.json();
          if (data.url) {
            window.open(data.url, '_blank');
            setShowMessage({
              type: 'success',
              text: 'PDF is generated! Download now.',
            });
          }
        } else if (attempts >= maxAttempts) {
          // Timeout
          clearInterval(pollInterval);
          setIsPolling(false);
          setIsDownloading(false);
          setShowMessage({
            type: 'info',
            text: 'PDF generation is taking longer than expected. Please try again in a moment.',
          });
        }
        // Continue polling if status is 202
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setIsPolling(false);
        setIsDownloading(false);
        setShowMessage({
          type: 'error',
          text: 'Failed to check PDF status. Please try again.',
        });
      }
    }, 2000); // Poll every 2 seconds
  }, [slug, language, isPolling]);

  // Initiate the actual PDF download
  const initiateDownload = useCallback(async () => {
    setIsDownloading(true);
    setShowMessage(null);

    try {
      const response = await fetch(`/api/stotra/${slug}/pdf?lang=${language}`);

      if (response.status === 200) {
        // PDF is ready
        const data = await response.json();
        if (data.url) {
          // Open PDF in new tab
          window.open(data.url, '_blank');
          setShowMessage({
            type: 'success',
            text: 'PDF is generated! Download now.',
          });
        } else {
          throw new Error('No download URL received');
        }
        setIsDownloading(false);
      } else if (response.status === 202) {
        // PDF is being generated - start polling
        setShowMessage({
          type: 'info',
          text: 'PDF is being prepared. Please wait...',
        });
        // Start polling for completion
        pollForPdf();
      } else if (response.status === 401 || response.status === 403) {
        // Check if it's a JWT expiration issue
        const errorData = await response.json().catch(() => ({}));

        if (errorData.requiresReauth || errorData.error === 'jwt_expired') {
          setShowMessage({
            type: 'error',
            text: 'Your session has expired. Please log in again.',
          });
          setShowLoginModal(true);
        } else {
          setShowMessage({
            type: 'error',
            text: 'You must be logged in to download this PDF.',
          });
          setShowLoginModal(true);
        }
        setIsDownloading(false);
      } else {
        // Other errors
        const errorData = await response.json().catch(() => ({}));
        setShowMessage({
          type: 'error',
          text: errorData.message || 'Something went wrong preparing the PDF. Try again later.',
        });
        setIsDownloading(false);
      }
    } catch (error) {
      console.error('PDF download error:', error);
      setShowMessage({
        type: 'error',
        text: 'Failed to download PDF. Please try again later.',
      });
      setIsDownloading(false);
    }
  }, [slug, language, pollForPdf]);

  // Handle login action
  const handleLogin = useCallback(() => {
    setShowLoginModal(false);
    setPendingDownload(true);
    signIn('keycloak', { callbackUrl: window.location.href });
  }, []);

  // Check for pending download intent after login
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const intentStr = sessionStorage.getItem('pdfDownloadIntent');
      if (intentStr) {
        try {
          const intent = JSON.parse(intentStr);
          if (
            intent.intent === 'download-pdf' &&
            intent.slug === slug &&
            intent.lang === language
          ) {
            // Clear the intent
            sessionStorage.removeItem('pdfDownloadIntent');
            // Auto-trigger download
            setTimeout(() => {
              initiateDownload();
            }, 500);
          }
        } catch (e) {
          console.error('Failed to parse download intent:', e);
        }
      }
    }
  }, [session, slug, language, initiateDownload]);

  // Auto-hide success/info messages after 5 seconds
  useEffect(() => {
    if (showMessage && (showMessage.type === 'success' || showMessage.type === 'info')) {
      const timer = setTimeout(() => {
        setShowMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <>
      {/* Download Button */}
      <div className="pdf-download-wrapper">
        <Button
          variant="outline-primary"
          onClick={handleDownloadClick}
          disabled={isDownloading || status === 'loading'}
          className="pdf-download-btn mb-3"
          aria-label={ariaLabel}
        >
          {isDownloading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Preparing...</span>
            </>
          ) : (
            <>
              <i className="bi bi-file-pdf me-2"></i>
              {buttonText}
            </>
          )}
        </Button>
      </div>

      {/* Toast/Alert Message */}
      {showMessage && (
        <div
          className={`alert alert-${showMessage.type === 'error' ? 'danger' : showMessage.type === 'success' ? 'success' : 'info'} alert-dismissible fade show mb-3`}
          role="alert"
        >
          <i
            className={`bi ${showMessage.type === 'error' ? 'bi-exclamation-circle-fill' : showMessage.type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'} me-2`}
          ></i>
          {showMessage.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login to download PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please login to download the PDF.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
