import React from 'react';
import { Col } from 'react-bootstrap';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, className = '' }) => {
  return (
    <Col xl="12" className={`mb-4 ${className}`}>
      <h2 className="text-primary">{title}</h2>
    </Col>
  );
};

export default SectionHeader;