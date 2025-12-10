// components/LazyImage.tsx - Optimized image component with IntersectionObserver
import Image, { ImageProps } from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps extends Omit<ImageProps, 'loading'> {
  threshold?: number;
  rootMargin?: string;
}

/**
 * LazyImage component with IntersectionObserver for optimal lazy loading
 * Improves LCP by deferring below-fold images
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef}>
      {isInView ? (
        <Image src={src} alt={alt} {...props} />
      ) : (
        <div
          style={{
            width: props.width,
            height: props.height,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Placeholder */}
        </div>
      )}
    </div>
  );
};
