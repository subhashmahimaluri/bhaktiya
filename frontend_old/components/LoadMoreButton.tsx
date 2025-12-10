import React from 'react';
import { Button } from 'react-bootstrap';

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  currentCount: number;
  totalCount: number;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  onClick, 
  disabled, 
  loading, 
  currentCount, 
  totalCount 
}) => {
  return (
    <div className="mt-4 text-center">
      <Button
        variant="primary"
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-2"
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
      <div className="text-muted small mt-2">
        Showing {currentCount} of {totalCount} results
      </div>
    </div>
  );
};

export default LoadMoreButton;