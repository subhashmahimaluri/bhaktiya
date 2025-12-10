import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="alert alert-danger mt-3" role="alert">
      Error: {message}
    </div>
  );
};

export default ErrorMessage;