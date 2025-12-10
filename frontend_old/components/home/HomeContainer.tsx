// components/home/HomeContainer.tsx - Tailwind-based container for Home page
import React from 'react';

interface HomeContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const HomeContainer: React.FC<HomeContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`tw-w-full tw-px-3 tw-mx-auto ${className}`} style={{ maxWidth: '1320px' }}>
      {children}
    </div>
  );
};
