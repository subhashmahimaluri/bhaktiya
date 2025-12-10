import { Alert, Button } from 'react-bootstrap';

interface PanchangamErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export default function PanchangamError({ error, onRetry, className = '' }: PanchangamErrorProps) {
  return (
    <div className={`panchangam-error ${className}`}>
      <Alert variant="warning" className="mb-3">
        <div className="d-flex align-items-start">
          <i className="fas fa-exclamation-triangle me-3 mt-1" style={{ fontSize: '1.2rem' }}></i>
          <div className="flex-grow-1">
            <Alert.Heading as="h6" className="mb-2">
              Unable to load Panchangam data
            </Alert.Heading>
            <p className="small mb-2">
              {error || 'There was an issue connecting to the Panchangam service.'}
            </p>
            <div className="d-flex gap-2">
              {onRetry && (
                <Button variant="outline-warning" size="sm" onClick={onRetry} className="me-2">
                  <i className="fas fa-refresh me-1"></i>
                  Try Again
                </Button>
              )}
              <small className="text-muted align-self-center">
                Using fallback calculations when available
              </small>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}
