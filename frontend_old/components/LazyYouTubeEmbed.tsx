import React, { useEffect, useRef, useState } from 'react';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title?: string;
}

/**
 * LazyYouTubeEmbed Component
 * 
 * A performance-optimized YouTube embed component that uses Intersection Observer
 * to lazy load videos only when they come into the viewport.
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Memoized to prevent unnecessary re-renders
 * - Loads video when it's 100px away from viewport
 * - Shows spinner while video is loading
 * - Proper error handling
 */
const LazyYouTubeEmbed: React.FC<LazyYouTubeEmbedProps> = ({ videoId, title = 'YouTube video player' }) => {
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasError(false);
    
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load when video is 100px away from viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [videoId]);

  if (!videoId || hasError) {
    return (
      <div className="alert alert-warning" role="alert">
        Unable to load video. Invalid YouTube video ID.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="ratio ratio-16x9 mb-4">
      {isInView ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onError={() => setHasError(true)}
        ></iframe>
      ) : (
        <div className="d-flex align-items-center justify-content-center bg-light">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading video...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(LazyYouTubeEmbed);
