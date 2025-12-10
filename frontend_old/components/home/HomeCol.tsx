// components/home/HomeCol.tsx - Tailwind-based column for Home page
import React from 'react';

interface HomeColProps {
  children: React.ReactNode;
  className?: string;
  lg?: string;
  md?: string;
  sm?: string;
}

export const HomeCol: React.FC<HomeColProps> = ({ 
  children, 
  className = '',
  lg,
  md,
  sm 
}) => {
  // Generate Tailwind classes based on Bootstrap-like props
  const getSizeClasses = () => {
    const classes: string[] = ['tw-px-3'];
    
    // Default to full width
    classes.push('tw-w-full');
    
    // Large screens (lg)
    if (lg === '7') {
      classes.push('lg:tw-w-[58.333333%]');
    } else if (lg === '5') {
      classes.push('lg:tw-w-[41.666667%]');
    }
    
    // Medium screens (md)
    if (md === '12') {
      classes.push('md:tw-w-full');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`${getSizeClasses()} ${className}`}>
      {children}
    </div>
  );
};
