'use client';

import { useCallback, useState } from 'react';
import styles from './SocialShareButtons.module.scss';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  // Social share URLs
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [url]);

  const handleShareClick = useCallback(
    (platform: keyof typeof shareLinks) => {
      const link = shareLinks[platform];
      window.open(link, '_blank', 'width=600,height=400');
    },
    [shareLinks]
  );

  return (
    <div className={styles.socialShareContainer}>
      <div className={styles.socialShareWrapper}>
        <div className={styles.socialIcons}>
          <button
            className={`${styles.shareButton} ${styles.whatsapp}`}
            onClick={() => handleShareClick('whatsapp')}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <i className="bi bi-whatsapp"></i>
            <span className={styles.label}>WhatsApp</span>
          </button>

          <button
            className={`${styles.shareButton} ${styles.facebook}`}
            onClick={() => handleShareClick('facebook')}
            title="Share on Facebook"
            aria-label="Share on Facebook"
          >
            <i className="bi bi-facebook"></i>
            <span className={styles.label}>Facebook</span>
          </button>

          <button
            className={`${styles.shareButton} ${styles.twitter}`}
            onClick={() => handleShareClick('twitter')}
            title="Share on X (Twitter)"
            aria-label="Share on X (Twitter)"
          >
            <i className="bi bi-twitter-x"></i>
            <span className={styles.label}>X</span>
          </button>

          <button
            className={`${styles.shareButton} ${styles.copy}`}
            onClick={handleCopyLink}
            title="Copy link"
            aria-label="Copy link"
          >
            <i className="bi bi-link-45deg"></i>
            <span className={styles.label}>Copy</span>
          </button>
        </div>
      </div>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className={styles.copyNotification}>
          <i className="bi bi-check-circle-fill me-2"></i>
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
