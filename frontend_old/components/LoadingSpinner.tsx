import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="py-4 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;