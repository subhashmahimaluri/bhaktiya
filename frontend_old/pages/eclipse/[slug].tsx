import CommentSection from '@/components/comments/CommentSection';
import EclipseDetailSidebar from '@/components/EclipseDetailSidebar';
import EclipseDetailSkeleton from '@/components/EclipseDetailSkeleton';
import Layout from '@/components/Layout/Layout';
import LocationAccordion from '@/components/LocationAccordion';
import { useLocation } from '@/context/LocationContext';
import { useEclipseDetailsBySlug } from '@/hooks/useEclipsesApi';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { Alert, Badge, Col, Row } from 'react-bootstrap';

interface EclipseDetailPageProps {
  slug: string;
}

const formatLocalizedDate = (date: Date, t: any, timezone: string): string => {
  const month = date.toLocaleString('en', { month: 'long', timeZone: timezone }).toLowerCase();
  const day = date.getDate();
  const year = date.getFullYear();

  // Get translated weekday and month names
  const translatedMonth = t.panchangam[month] || month;

  // Format: "Friday 14 March, 2025" or "శుక్రవారం 14 మార్చి, 2025"
  return `${day} ${translatedMonth} ${year}`;
};

export default function EclipseDetailPage({ slug }: EclipseDetailPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { city, country, timezone } = useLocation();

  // Parse slug to extract eclipse information for display purposes - memoize to prevent re-calculations
  const eclipseInfo = useMemo(() => {
    const parts = slug.split('-');
    if (parts.length >= 4) {
      return {
        month: parts[0],
        year: parseInt(parts[1]),
        type: parts[2],
        kind: parts.slice(3).join('-'),
      };
    }
    return null;
  }, [slug]);

  // Use the simplified hook to fetch eclipse details directly by slug
  const {
    data: eclipseDetails,
    isLoading,
    isError,
    error,
  } = useEclipseDetailsBySlug({
    slug,
    enabled: !!eclipseInfo,
  });

  // Redirect to 404 page if there's an error (like 404 from API)
  useEffect(() => {
    if (isError && error) {
      // Check if it's a 404 error or any other API error
      if (error.includes('404') || error.includes('status')) {
        router.push('/404');
      }
    }
  }, [isError, error, router]);

  // Show loading skeleton if eclipse info is invalid
  if (!eclipseInfo) {
    return (
      <Layout>
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
              <Alert variant="danger">
                <Alert.Heading>Invalid Eclipse</Alert.Heading>
                <p>The requested eclipse page could not be found.</p>
              </Alert>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }

  const getEclipseIcon = (type: string) => {
    return type === 'solar' ? '☀️' : '🌙';
  };

  const getEclipseTypeColor = (type: string, kind: string) => {
    const eclipseKind = kind.toLowerCase();
    if (type === 'solar') {
      return eclipseKind.includes('total')
        ? 'danger'
        : eclipseKind.includes('annular')
          ? 'warning'
          : 'secondary';
    } else {
      return eclipseKind.includes('total')
        ? 'danger'
        : eclipseKind.includes('partial')
          ? 'warning'
          : 'info';
    }
  };

  const formattedDate = eclipseDetails?.datetime_local
    ? formatLocalizedDate(new Date(eclipseDetails?.datetime_local), t, timezone)
    : '';

  return (
    <>
      <Head>
        <title>
          {eclipseDetails
            ? `${t.eclipse[eclipseDetails.eclipse_type_label]} ${formattedDate}`
            : `${eclipseInfo.type.charAt(0).toUpperCase() + eclipseInfo.type.slice(1)} Eclipse ${eclipseInfo.month.charAt(0).toUpperCase() + eclipseInfo.month.slice(1)} ${eclipseInfo.year}`}
        </title>
      </Head>
      <Layout>
        <Row className="mt-25 inner-page py-5">
          {/* Left Content - Eclipse Details */}
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 panchangam-block px-md-10 bg-white px-5 py-3 text-black">
              {/* Header with Eclipse Info */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="mb-0">
                    {eclipseDetails ? t.eclipse[eclipseDetails.eclipse_type_label] : ''}{' '}
                    {formattedDate}
                  </h1>
                </div>
                <Badge
                  bg={getEclipseTypeColor(eclipseInfo.type, eclipseInfo.kind)}
                  className="fs-6"
                >
                  {eclipseInfo.type.charAt(0).toUpperCase() + eclipseInfo.type.slice(1)} Eclipse
                </Badge>
              </div>

              {/* Basic Eclipse Information */}
              <div className="eclipse-basic-info">
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>{t.eclipse.location}:</strong>
                      <br />
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {city || 'Hyderabad'}, {country || 'India'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>{t.eclipse.date}:</strong>
                      <br />
                      {eclipseDetails?.datetime_local
                        ? format(new Date(eclipseDetails.datetime_local), 'EEEE, dd MMMM, yyyy')
                        : `${eclipseInfo.month.charAt(0).toUpperCase() + eclipseInfo.month.slice(1)} ${eclipseInfo.year}`}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>{t.eclipse.eclipse_duration}:</strong>
                      <br />
                      {eclipseDetails?.contacts?.first_contact &&
                      eclipseDetails?.contacts?.fourth_contact
                        ? `${formatDateTimeRange(eclipseDetails.contacts.first_contact, eclipseDetails.contacts.fourth_contact)}`
                        : ''}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>{t.eclipse.total_eclipse_time}:</strong>
                      <br />
                      {eclipseDetails?.duration_total
                        ? formatDuration(eclipseDetails.duration_total)
                        : eclipseDetails?.contacts?.first_contact &&
                            eclipseDetails?.contacts?.fourth_contact
                          ? formatDuration(
                              calculateDuration(
                                eclipseDetails.contacts.first_contact,
                                eclipseDetails.contacts.fourth_contact
                              )
                            )
                          : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Eclipse Information */}
              <div className="mt-5">
                {isLoading ? (
                  <EclipseDetailSkeleton />
                ) : eclipseDetails && !isError ? (
                  <div className="eclipse-detailed-info">
                    <h3>{t.eclipse.eclipse_information}</h3>

                    {/* Eclipse Timings */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <h5>{t.eclipse.eclipse_timings}</h5>
                        <div className="table-responsive">
                          <table className="table-striped table">
                            <tbody>
                              {eclipseDetails.contacts.first_contact && (
                                <tr>
                                  <td>
                                    <strong>{t.eclipse.first_contact_penumbra}</strong>
                                  </td>
                                  <td>{formatDateTime(eclipseDetails.contacts.first_contact)}</td>
                                </tr>
                              )}
                              {eclipseDetails.contacts.second_contact && (
                                <tr>
                                  <td>
                                    <strong>{t.eclipse.first_contact_umbra}</strong>
                                  </td>
                                  <td>{formatDateTime(eclipseDetails.contacts.second_contact)}</td>
                                </tr>
                              )}
                              {eclipseDetails.contacts.third_contact && (
                                <tr>
                                  <td>
                                    <strong>{t.eclipse.total_phase_begins}</strong>
                                  </td>
                                  <td>{formatDateTime(eclipseDetails.contacts.third_contact)}</td>
                                </tr>
                              )}
                              {eclipseDetails.datetime_local && (
                                <tr>
                                  <td>
                                    <strong>{t.eclipse.maximum_lunar_eclipse}</strong>
                                  </td>
                                  <td>{formatDateTime(eclipseDetails.datetime_local)}</td>
                                </tr>
                              )}
                              {eclipseDetails.contacts.fourth_contact && (
                                <tr>
                                  <td>
                                    <strong>{t.eclipse.total_phase_ends}</strong>
                                  </td>
                                  <td>{formatDateTime(eclipseDetails.contacts.fourth_contact)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Sutak Timings - Only show if Sutak data is available */}
                    {(eclipseDetails.sutak_begin ||
                      eclipseDetails.sutak_end ||
                      eclipseDetails.sutak_kids_begin ||
                      eclipseDetails.sutak_kids_end) && (
                      <div className="row mt-4">
                        <div className="col-12">
                          <h5>{t.eclipse.sutak_timings}</h5>
                          <div className="table-responsive">
                            <table className="table-striped table">
                              <tbody>
                                {eclipseDetails.sutak_begin && (
                                  <tr>
                                    <td>
                                      <strong>{t.eclipse.sutak_begins}</strong>
                                    </td>
                                    <td>{formatDateTime(eclipseDetails.sutak_begin)}</td>
                                  </tr>
                                )}
                                {eclipseDetails.sutak_end && (
                                  <tr>
                                    <td>
                                      <strong>{t.eclipse.sutak_ends}</strong>
                                    </td>
                                    <td>{formatDateTime(eclipseDetails.sutak_end)}</td>
                                  </tr>
                                )}
                                {eclipseDetails.sutak_kids_begin && (
                                  <tr>
                                    <td>
                                      <strong>{t.eclipse.sutak_kids_old_sick_begins}</strong>
                                    </td>
                                    <td>{formatDateTime(eclipseDetails.sutak_kids_begin)}</td>
                                  </tr>
                                )}
                                {eclipseDetails.sutak_kids_end && (
                                  <tr>
                                    <td>
                                      <strong>{t.eclipse.sutak_kids_old_sick_ends}</strong>
                                    </td>
                                    <td>{formatDateTime(eclipseDetails.sutak_kids_end)}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {eclipseDetails.saros_series && (
                      <div className="row mt-4">
                        <div className="col-12">
                          <h5>Additional Information</h5>
                          <p>
                            <strong>Saros Series:</strong> {eclipseDetails.saros_series}
                          </p>
                          {eclipseDetails.saros_member && (
                            <p>
                              <strong>Saros Member:</strong> {eclipseDetails.saros_member}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="info">
                    <Alert.Heading>More Details Coming Soon</Alert.Heading>
                    <p>
                      Detailed eclipse information including exact timings, visibility maps, and
                      spiritual significance will be available soon.
                    </p>
                  </Alert>
                )}
              </div>
            </div>
          </Col>

          {/* Right Sidebar */}
          <Col xl="4" lg="4" md="12" className="mt-5 pt-5">
            {/* Location Selection */}
            <div className="right-container shadow-1 mb-3 bg-white px-3 py-3 text-black">
              <LocationAccordion city={city || 'Hyderabad'} country={country || 'India'} />
            </div>

            <EclipseDetailSidebar
              selectedEclipse={null}
              timezone={timezone || 'Asia/Calcutta'}
              city={city || 'Hyderabad'}
              country={country || 'India'}
            />
          </Col>
        </Row>

        {/* Comments Section */}
        <Row className="mt-25 inner-page py-5">
          <Col xl="8" lg="8" md="12" className="mt-5 pt-5">
            <div className="left-container shadow-1 px-md-10 bg-white px-5 py-3 text-black">
              <CommentSection contentType="eclipse" canonicalSlug={slug} />
            </div>
          </Col>
        </Row>
      </Layout>
    </>
  );
}

// Helper functions for formatting
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'hh:mm a, MMM dd');
  } catch {
    return dateString;
  }
}

function formatDuration(durationString: string): string {
  try {
    // Check if the duration string is already formatted (e.g., "03 Hours 29 Mins 29 Secs")
    if (
      durationString &&
      (durationString.includes('Hours') ||
        durationString.includes('Mins') ||
        durationString.includes('Secs'))
    ) {
      return durationString;
    }

    // Parse duration string with colons and format it
    if (durationString && durationString.includes(':')) {
      const parts = durationString.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;

      let result = '';
      if (hours > 0) result += `${hours} Hour${hours > 1 ? 's' : ''} `;
      if (minutes > 0) result += `${minutes} Min${minutes > 1 ? 's' : ''} `;
      if (seconds > 0) result += `${seconds} Sec${seconds > 1 ? 's' : ''}`;

      return result.trim() || durationString;
    }
    return durationString || 'N/A';
  } catch {
    return durationString || 'N/A';
  }
}

function calculateDuration(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    let result = '';
    if (hours > 0) result += `${hours} Hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} Min${minutes > 1 ? 's' : ''} `;
    if (seconds > 0) result += `${seconds} Sec${seconds > 1 ? 's' : ''}`;

    return result.trim();
  } catch {
    return 'Unknown';
  }
}

function formatDateTimeRange(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startFormatted = format(start, 'MMM dd, hh:mm a');
    const endFormatted = format(end, 'MMM dd, hh:mm a');

    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return 'Unknown time range';
  }
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { slug } = context.params!;

  return {
    props: {
      slug: slug as string,
    },
  };
};
