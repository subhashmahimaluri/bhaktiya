import React, { Component, ReactNode } from 'react';
import { Alert } from 'react-bootstrap';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch errors in child components
 * Provides graceful error handling and recovery options
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <Alert variant="danger" className="m-4">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p className="mb-2">{this.state.error.message}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={this.resetError}>
            Try again
          </button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
