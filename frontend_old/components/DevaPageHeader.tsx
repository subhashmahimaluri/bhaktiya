import React from 'react';

interface DevaPageHeaderProps {
  title: string;
  subtitle: string;
}

const DevaPageHeader: React.FC<DevaPageHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h1 className="text-center">{title}</h1>
      <p className="text-muted text-center">{subtitle}</p>
    </>
  );
};

export default DevaPageHeader;