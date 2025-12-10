// components/home/HomeRow.tsx - Tailwind-based row for Home page
import React from 'react';

interface HomeRowProps {
  children: React.ReactNode;
  className?: string;
}

export const HomeRow: React.FC<HomeRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`tw-flex tw-flex-wrap tw--mx-3 ${className}`}>
      {children}
    </div>
  );
};
