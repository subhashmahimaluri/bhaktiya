import { EclipseInfo, useEclipsesApi } from '@/hooks/useEclipsesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import Link from 'next/link';

interface EclipseDetailSidebarProps {
  selectedEclipse: EclipseInfo | null;
  timezone: string;
  city: string;
  country: string;
}

// Function to get eclipse type badge color
const getEclipseBadgeColor = (eclipse: EclipseInfo): string => {
  const eclipseType = eclipse.eclipse_type.toLowerCase();
  if (eclipse.type === 'solar') {
    return eclipseType.includes('total')
      ? 'danger'
      : eclipseType.includes('annular')
        ? 'warning'
        : 'secondary';
  } else {
    return eclipseType.includes('total')
      ? 'danger'
      : eclipseType.includes('partial')
        ? 'warning'
        : 'info';
  }
};

// Function to format date for display
const formatEclipseDate = (eclipse: EclipseInfo, timezone: string): string => {
  const date = new Date(eclipse.datetime_local);
  return date.toLocaleDateString('en-IN', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Function to calculate days until eclipse
const getDaysUntilEclipse = (eclipse: EclipseInfo): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eclipseDate = new Date(eclipse.datetime_local);
  eclipseDate.setHours(0, 0, 0, 0);
  const diffTime = eclipseDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Function to generate slug from eclipse data (same as in EclipseCard)
const generateEclipseSlug = (eclipse: EclipseInfo): string => {
  const date = new Date(eclipse.datetime_local);
  const month = date.toLocaleString('en', { month: 'long' }).toLowerCase();
  const year = date.getFullYear();
  const eclipseType = eclipse.type === 'solar' ? 'solar' : 'lunar';
  const eclipseKind = eclipse.eclipse_type.toLowerCase().replace(/\s+/g, '-');

  return `${month}-${year}-${eclipseType}-${eclipseKind}`;
};

export default function EclipseDetailSidebar({
  selectedEclipse,
  timezone,
  city,
  country,
}: EclipseDetailSidebarProps) {

  const { t } = useTranslation();

  // Memoize date range to prevent unnecessary re-renders
  const dateRange = useMemo(() => ({
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }), []);

  // Fetch upcoming eclipses for the next 365 days from today
  const { data: upcomingData, isLoading } = useEclipsesApi({
    ...dateRange,
    eclipseType: 'both',
    enabled: true,
    retryOnMount: true,
  });

  // Memoize today's date to prevent unnecessary re-renders
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Get upcoming eclipses (from today onwards)
  const upcomingEclipses = useMemo(() => {
    if (!upcomingData?.eclipses) return [];
    
    // Filter eclipses that are from today onwards and sort by date
    return upcomingData.eclipses
      .filter(eclipse => new Date(eclipse.datetime_local) >= today)
      .sort((a, b) => new Date(a.datetime_local).getTime() - new Date(b.datetime_local).getTime())
      .slice(0, 4); // Take only the first 4 upcoming eclipses
  }, [upcomingData, today]);

  // Memoize helper functions to prevent unnecessary re-renders
  const getDaysUntilEclipse = useCallback((eclipse: EclipseInfo): number => {
    const eclipseDate = new Date(eclipse.datetime_local);
    eclipseDate.setHours(0, 0, 0, 0);
    const diffTime = eclipseDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [today]);

  const formatEclipseDate = useCallback((eclipse: EclipseInfo): string => {
    const date = new Date(eclipse.datetime_local);
    return date.toLocaleDateString('en-IN', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [timezone]);

  const getEclipseBadgeColor = useCallback((eclipse: EclipseInfo): string => {
    const eclipseType = eclipse.eclipse_type.toLowerCase();
    if (eclipse.type === 'solar') {
      return eclipseType.includes('total')
        ? 'danger'
        : eclipseType.includes('annular')
          ? 'warning'
          : 'secondary';
    } else {
      return eclipseType.includes('total')
        ? 'danger'
        : eclipseType.includes('partial')
          ? 'warning'
          : 'info';
    }
  }, []);

  const generateEclipseSlug = useCallback((eclipse: EclipseInfo): string => {
    const date = new Date(eclipse.datetime_local);
    const month = date.toLocaleString('en', { month: 'long' }).toLowerCase();
    const year = date.getFullYear();
    const eclipseType = eclipse.type === 'solar' ? 'solar' : 'lunar';
    const eclipseKind = eclipse.eclipse_type.toLowerCase().replace(/\s+/g, '-');

    return `${month}-${year}-${eclipseType}-${eclipseKind}`;
  }, []);

  return (
    <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black eclipse-detail-sidebar">
      <h3>{t.eclipse.upcoming_eclipses}</h3>
      
      {isLoading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted small mt-2">Loading upcoming eclipses...</p>
        </div>
      ) : upcomingEclipses.length === 0 ? (
        <p className="text-muted small">
          No upcoming eclipses in the next year
        </p>
      ) : (
        <div className="upcoming-eclipses mt-3">
          {upcomingEclipses.map((eclipse, index) => {
            const daysUntil = getDaysUntilEclipse(eclipse);
            const formattedDate = formatEclipseDate(eclipse);
            const badgeColor = getEclipseBadgeColor(eclipse);
            const slug = generateEclipseSlug(eclipse);
            
            return (
              <Link
                key={`${eclipse.type}-${eclipse.jd}-${index}`}
                href={`/eclipse/${slug}`}
                className="upcoming-item d-flex justify-content-between align-items-center mb-2 rounded border p-2 text-decoration-none text-dark"
              >
                <div>
                  <small className="fw-bold text-dark">
                    {eclipse.type === 'solar' ? '☀️' : '🌙'} {' '}
                    {t.eclipse[eclipse.eclipse_type_label] || eclipse.eclipse_type}
                  </small>
                  <br />
                  <small className="text-muted">{formattedDate}</small>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <Badge bg={badgeColor} className="ms-2">
                    {eclipse.type === 'solar' ? 'Solar' : 'Lunar'}
                  </Badge>
                  <small className="text-muted mt-1">
                    {daysUntil === 0
                      ? 'Today'
                      : daysUntil === 1
                        ? 'Tomorrow'
                        : `${daysUntil}d`}
                  </small>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
