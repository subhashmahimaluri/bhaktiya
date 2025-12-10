'use client';

import { useLocation } from '@/context/LocationContext';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Badge, Button, Collapse } from 'react-bootstrap';
import AutoComplete from './AutoComplete';

// Types
interface SelectedLocationData {
  city: string;
  province: string;
  country: string;
  iso2: string;
  lat: number;
  lng: number;
  timezone: string;
  offset: number;
}

interface PanchangamSearchProps {
  className?: string;
  onLocationUpdate?: (location: SelectedLocationData) => void;
  disabled?: boolean;
}

// Configuration constants
const SEARCH_CONFIG = {
  PROGRESS_STEPS: [20, 40, 60, 80, 100],
  PROGRESS_INTERVAL: 200,
  SUCCESS_DISPLAY_DURATION: 1500,
  BACKGROUND_COLOR: '#6f0e0e',
  ANIMATION_CLASSES: {
    SUCCESS_GLOW: 'success-glow',
    PULSE_ICON: 'pulse-icon',
    FADE_IN: 'fade-in',
    SLIDE_DOWN: 'slide-down',
    FLAG_BOUNCE: 'flag-bounce',
    BOUNCE_IN: 'bounce-in',
    SPIN_ANIMATION: 'spin-animation',
  },
} as const;

type SubmissionState = {
  isSubmitting: boolean;
  progress: number;
  showSuccess: boolean;
};

export default function PanchangamSearch({
  className = '',
  onLocationUpdate,
  disabled = false,
}: PanchangamSearchProps) {
  const [openCollapse, setOpenCollapse] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationData | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    progress: 0,
    showSuccess: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();
  const { city, country, setLocationData } = useLocation();

  // Destructure for easier access
  const { isSubmitting, progress, showSuccess } = submissionState;

  // Location handling functions
  const handleLocationSelect = useCallback(
    (locationData: SelectedLocationData) => {
      if (disabled || isSubmitting) return;

      setSelectedLocation(locationData);
      setError(null); // Clear any previous errors
    },
    [disabled, isSubmitting]
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedLocation || disabled || isSubmitting) return;

    try {
      setError(null);
      setSubmissionState(prev => ({ ...prev, isSubmitting: true, progress: 0 }));

      // Simulate progress steps with smooth animation
      for (let i = 0; i < SEARCH_CONFIG.PROGRESS_STEPS.length; i++) {
        await new Promise(resolve => setTimeout(resolve, SEARCH_CONFIG.PROGRESS_INTERVAL));
        setSubmissionState(prev => ({
          ...prev,
          progress: SEARCH_CONFIG.PROGRESS_STEPS[i],
        }));
      }

      // Apply the location change
      await setLocationData(selectedLocation);

      // Call optional callback
      onLocationUpdate?.(selectedLocation);

      // Show success state
      setSubmissionState(prev => ({ ...prev, showSuccess: true }));

      // Reset state with delay for smooth transition
      setTimeout(() => {
        setSelectedLocation(null);
        setSubmissionState({ isSubmitting: false, progress: 0, showSuccess: false });
        setOpenCollapse(false);
      }, SEARCH_CONFIG.SUCCESS_DISPLAY_DURATION);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      setSubmissionState({ isSubmitting: false, progress: 0, showSuccess: false });
      console.error('Location update error:', err);
    }
  }, [selectedLocation, disabled, isSubmitting, setLocationData, onLocationUpdate]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) return; // Prevent cancellation during submission

    setSelectedLocation(null);
    setError(null);
    setOpenCollapse(false);
  }, [isSubmitting]);

  const handleToggleCollapse = useCallback(() => {
    if (disabled || isSubmitting) return;
    setOpenCollapse(prev => !prev);
  }, [disabled, isSubmitting]);

  return (
    <div className={`collapse-search ${className}`}>
      <div
        className={`collapse-header fw-bold d-flex justify-content-between align-items-center py-1 text-white ${showSuccess ? SEARCH_CONFIG.ANIMATION_CLASSES.SUCCESS_GLOW : ''}`}
        aria-expanded={openCollapse}
        aria-label={openCollapse ? 'Collapse location search' : 'Expand location search'}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggleCollapse}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleCollapse();
          }
        }}
        style={{
          cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div className="location-display d-flex align-items-center">
          <i
            className={`fas fa-map-marker-alt me-2 ${isSubmitting ? SEARCH_CONFIG.ANIMATION_CLASSES.PULSE_ICON : ''}`}
            aria-hidden="true"
          ></i>
          <span aria-label={`Current location: ${city}, ${country}`}>
            {city}, {country}
          </span>
          {showSuccess && (
            <Badge bg="success" className={`${SEARCH_CONFIG.ANIMATION_CLASSES.FADE_IN} ms-2`}>
              <i className="fas fa-check me-1" aria-hidden="true"></i>
              <span className="sr-only">Location updated successfully</span>
              Updated!
            </Badge>
          )}
          {error && (
            <Badge bg="danger" className="ms-2">
              <i className="fas fa-exclamation-triangle me-1" aria-hidden="true"></i>
              Error
            </Badge>
          )}
        </div>
        <i className={`fa ${openCollapse ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
      </div>
      <Collapse in={openCollapse}>
        <div
          id="collapse-text"
          className="border-top p-3"
          style={{ backgroundColor: SEARCH_CONFIG.BACKGROUND_COLOR, color: 'white' }}
          role="region"
          aria-label="Location search form"
        >
          {error && (
            <div className="alert alert-danger mb-3 py-2" role="alert">
              <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
              {error}
            </div>
          )}

          <div className="mb-2">
            <label className="form-label small mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <i className="fas fa-search me-1" aria-hidden="true"></i>
              Search for a city to update Panchangam calculations:
            </label>
          </div>
          <AutoComplete
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />

          {selectedLocation && (
            <div
              className={`location-preview ${SEARCH_CONFIG.ANIMATION_CLASSES.SLIDE_DOWN} mt-3 rounded border bg-white p-2`}
              role="region"
              aria-label="Selected location preview"
            >
              <div className="d-flex align-items-center mb-2">
                <Image
                  className={`${SEARCH_CONFIG.ANIMATION_CLASSES.FLAG_BOUNCE} me-2 rounded`}
                  src={`https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/${selectedLocation.iso2}.svg`}
                  alt={`${selectedLocation.country} flag`}
                  width={20}
                  height={15}
                  loading="lazy"
                />
                <div>
                  <div className="fw-bold text-dark">{selectedLocation.city}</div>
                  <small className="text-muted">
                    {selectedLocation.province}, {selectedLocation.country}
                  </small>
                </div>
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                <div
                  className="progress mb-2"
                  style={{ height: '4px' }}
                  role="progressbar"
                  aria-label="Update progress"
                >
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant={showSuccess ? 'success' : 'primary'}
                  size="sm"
                  onClick={handleSubmit}
                  disabled={disabled || isSubmitting || !selectedLocation}
                  className={`flex-grow-1 submit-btn ${isSubmitting ? 'submitting' : ''} ${showSuccess ? 'success-state' : ''}`}
                  aria-label={
                    showSuccess
                      ? 'Location updated successfully'
                      : isSubmitting
                        ? `Updating location, ${progress}% complete`
                        : 'Update Panchangam location'
                  }
                >
                  {showSuccess ? (
                    <>
                      <i
                        className={`fas fa-check-circle ${SEARCH_CONFIG.ANIMATION_CLASSES.BOUNCE_IN} me-1`}
                        aria-hidden="true"
                      ></i>
                      Applied Successfully!
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div
                        className={`spinner-border spinner-border-sm ${SEARCH_CONFIG.ANIMATION_CLASSES.SPIN_ANIMATION} me-1`}
                        role="status"
                        aria-hidden="true"
                      ></div>
                      <span className="sr-only">Updating location</span>
                      Updating Panchangam... ({progress}%)
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt me-1" aria-hidden="true"></i>
                      Update Panchangam
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={disabled || isSubmitting}
                  className={`cancel-btn ${isSubmitting ? 'disabled-state' : ''}`}
                  aria-label="Cancel location selection"
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
                  <span className="sr-only">Cancel</span>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-2">
            <small id="search-help-text" style={{ color: 'rgba(255, 255, 255, 0.8)' }} role="note">
              <i className="fas fa-info-circle me-1" aria-hidden="true"></i>
              Changing location will recalculate all Panchangam elements for the new coordinates.
            </small>
          </div>
        </div>
      </Collapse>
    </div>
  );
}
