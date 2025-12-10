import React from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No stotras available at the moment." 
}) => {
  return (
    <div className="py-4 text-center">
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default EmptyState;