import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { GetStaticProps } from 'next';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

const PrivacyPolicy: React.FC = () => {
  const { t, locale } = useTranslation();
  const pageTitle = 'Privacy Policy - SSBhakthi';
  const pageDescription =
    'Learn how SSBhakthi collects, uses, and protects your personal information.';

  return (
    <Layout>
      <Row className="mt-25 account-page py-5">
        <Col xl="12" lg="12" md="12" className="mt-5 pt-5">
          <div className="privacy-policy-content p-md-5 rounded bg-white p-4 shadow-sm">
            <h1 className="mb-4 text-center">Privacy Policy</h1>
            <p className="text-muted mb-5 text-center">Last Updated: December 1, 2025</p>

            {/* Introduction */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Introduction</h2>
              <p>
                Welcome to SSBhakthi. We are committed to protecting your privacy and ensuring the
                security of your personal information. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our mobile application
                and website (collectively, the Services).
              </p>
              <p>
                By using SSBhakthi, you agree to the collection and use of information in accordance
                with this policy. If you do not agree with our policies and practices, please do not
                use our Services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Information We Collect</h2>

              <h3 className="h5 mb-2">1. Location Data</h3>
              <p>
                <strong>Mobile App:</strong> We collect precise location data (latitude and
                longitude) to provide you with accurate Panchangam calculations, including sunrise,
                sunset, tithi timings, and festival dates specific to your location.
              </p>
              <ul>
                <li>
                  <strong>Purpose:</strong> Calculate astronomical timings and festival dates based
                  on your geographical location
                </li>
                <li>
                  <strong>Collection:</strong> Only when you grant location permissions
                </li>
                <li>
                  <strong>Storage:</strong> Stored locally on your device for faster subsequent
                  calculations
                </li>
                <li>
                  <strong>Sharing:</strong> Not shared with third parties; used only for
                  calculations
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">2. Account Information</h3>
              <p>
                When you create an account or sign in using Keycloak authentication, we collect:
              </p>
              <ul>
                <li>Email address</li>
                <li>Name (first and last name)</li>
                <li>User ID (generated automatically)</li>
                <li>Authentication tokens (stored securely)</li>
              </ul>

              <h3 className="h5 mb-2 mt-4">3. Device Information</h3>
              <p>We automatically collect certain information about your device, including:</p>
              <ul>
                <li>Device type and model</li>
                <li>Operating system version</li>
                <li>Mobile network information</li>
                <li>Unique device identifiers</li>
                <li>Push notification tokens (for sending notifications)</li>
              </ul>

              <h3 className="h5 mb-2 mt-4">4. Usage Data</h3>
              <ul>
                <li>Features you access (Calendar, Festivals, Stotras, Articles)</li>
                <li>Content you view or save</li>
                <li>Search queries</li>
                <li>App crash reports and error logs</li>
                <li>Language preferences</li>
              </ul>

              <h3 className="h5 mb-2 mt-4">5. Cached Data</h3>
              <p>To improve performance and reduce data usage, we store:</p>
              <ul>
                <li>Festival calculations (cached for up to 7 days)</li>
                <li>Content you have previously accessed</li>
                <li>Your saved articles and stotras</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-5">
              <h2 className="h4 mb-3">How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li>
                  <strong>Location Services:</strong> Calculate accurate Panchangam timings,
                  sunrise/sunset, and festival dates specific to your location
                </li>
                <li>
                  <strong>Authentication:</strong> Securely manage your account and provide
                  personalized features
                </li>
                <li>
                  <strong>Notifications:</strong> Send you reminders about festivals, vrathas, and
                  important dates (only if you opt-in)
                </li>
                <li>
                  <strong>Content Delivery:</strong> Provide you with articles, stotras, videos, and
                  other devotional content
                </li>
                <li>
                  <strong>Personalization:</strong> Save your preferences, language settings, and
                  favorite content
                </li>
                <li>
                  <strong>Performance Optimization:</strong> Cache frequently accessed data to
                  improve app speed
                </li>
                <li>
                  <strong>Error Tracking:</strong> Identify and fix technical issues to improve
                  service quality
                </li>
                <li>
                  <strong>Analytics:</strong> Understand how users interact with our services to
                  improve features
                </li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Data Storage and Security</h2>

              <h3 className="h5 mb-2">Local Storage</h3>
              <p>Most of your data is stored locally on your device:</p>
              <ul>
                <li>
                  <strong>Authentication Tokens:</strong> Stored securely using device-level
                  encryption (SecureStore)
                </li>
                <li>
                  <strong>Location Data:</strong> Stored in app storage (AsyncStorage)
                </li>
                <li>
                  <strong>Preferences:</strong> Language settings, saved content stored locally
                </li>
                <li>
                  <strong>Cache:</strong> Festival calculations cached locally (max 10MB,
                  auto-evicted when full)
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Server Storage</h3>
              <p>We store the following on our secure servers:</p>
              <ul>
                <li>Account information (email, name, user ID)</li>
                <li>Device registration for push notifications</li>
                <li>Content you create or upload (if any)</li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Security Measures</h3>
              <ul>
                <li>HTTPS encryption for all data transmission</li>
                <li>Secure token-based authentication (OAuth 2.0 with Keycloak)</li>
                <li>Automatic token refresh to maintain security</li>
                <li>Device-level encryption for sensitive data</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="text-muted small">
                <em>
                  Note: While we implement industry-standard security measures, no method of
                  transmission over the internet or electronic storage is 100% secure. We cannot
                  guarantee absolute security.
                </em>
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Third-Party Services</h2>
              <p>Our Services may integrate with the following third-party services:</p>

              <h3 className="h5 mb-2">Authentication Services</h3>
              <ul>
                <li>
                  <strong>Keycloak:</strong> Secure identity and access management
                  <br />
                  <span className="text-muted small">
                    Purpose: User authentication and account management
                  </span>
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Content Delivery</h3>
              <ul>
                <li>
                  <strong>YouTube API:</strong> Embedded devotional videos
                  <br />
                  <span className="text-muted small">
                    Purpose: Display video content within the app
                  </span>
                  <br />
                  <span className="text-muted small">
                    Privacy Policy:{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://policies.google.com/privacy
                    </a>
                  </span>
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Analytics (Optional)</h3>
              <p className="text-muted small">
                <em>
                  We do not currently use analytics services, but may integrate error tracking
                  services in the future. Any such integration will be updated in this policy.
                </em>
              </p>

              <p className="mt-3">
                <strong>Important:</strong> These third-party services have their own privacy
                policies. We encourage you to review their policies to understand how they handle
                your data.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Data Sharing and Disclosure</h2>
              <p>
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
              <p>We may share your information only in the following circumstances:</p>
              <ul>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly authorize us to share
                  specific information
                </li>
                <li>
                  <strong>Service Providers:</strong> With trusted third parties who assist in
                  operating our services (e.g., cloud hosting, authentication)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, court order, or
                  governmental authority
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                  sale of assets (users will be notified)
                </li>
                <li>
                  <strong>Protection of Rights:</strong> To protect the rights, property, or safety
                  of SSBhakthi, our users, or the public
                </li>
              </ul>
              <p>
                <strong>We do NOT:</strong>
              </p>
              <ul>
                <li>Share your location data with advertisers</li>
                <li>Sell your personal information</li>
                <li>Use your data for targeted advertising</li>
                <li>Track you across other websites or apps</li>
              </ul>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>

              <h3 className="h5 mb-2">Location Data</h3>
              <ul>
                <li>You can deny location permissions at any time through your device settings</li>
                <li>If denied, you can manually enter your location to use Panchangam features</li>
                <li>
                  Clearing location data will improve privacy but may require re-entering location
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Account Data</h3>
              <ul>
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct your account information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and associated data
                </li>
                <li>
                  <strong>Data Portability:</strong> Request your data in a machine-readable format
                </li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Notifications</h3>
              <ul>
                <li>You can enable/disable push notifications in your device settings</li>
                <li>Notification preferences can be managed within the app</li>
              </ul>

              <h3 className="h5 mb-2 mt-4">Cache and Storage</h3>
              <ul>
                <li>Clear cached data through the app settings or by uninstalling the app</li>
                <li>
                  Cached data is automatically deleted after 7 days or when storage limit is reached
                </li>
              </ul>

              <p className="mt-3">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:contact@ssbhakthi.com">contact@ssbhakthi.com</a>
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Data Retention</h2>
              <ul>
                <li>
                  <strong>Account Data:</strong> Retained until you request deletion or delete your
                  account
                </li>
                <li>
                  <strong>Location Data:</strong> Stored locally on your device; automatically
                  cleared when you uninstall the app
                </li>
                <li>
                  <strong>Cached Data:</strong> Automatically deleted after 7 days or when exceeding
                  10MB storage limit
                </li>
                <li>
                  <strong>Authentication Tokens:</strong> Automatically refreshed and expired tokens
                  are deleted
                </li>
                <li>
                  <strong>Usage Logs:</strong> Retained for 90 days for troubleshooting and security
                  purposes
                </li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Children&apos;s Privacy</h2>
              <p>
                Our Services are not directed to children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us
                at <a href="mailto:contact@ssbhakthi.com">contact@ssbhakthi.com</a>, and we will
                delete such information from our systems.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-5">
              <h2 className="h4 mb-3">International Data Transfers</h2>
              <p>
                Your information may be transferred to and maintained on servers located outside of
                your state, province, country, or other governmental jurisdiction where data
                protection laws may differ. By using our Services, you consent to the transfer of
                your information to our facilities and third-party service providers.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices or for legal, operational, or regulatory reasons. We will notify you of
                any material changes by:
              </p>
              <ul>
                <li>Posting the updated policy on our website and in the app</li>
                <li>Updating the Last Updated date at the top of this policy</li>
                <li>Sending an in-app notification (for significant changes)</li>
              </ul>
              <p>
                Your continued use of the Services after changes are posted constitutes your
                acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-4">
              <h2 className="h4 mb-3">Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data practices, please contact us:
              </p>
              <div className="mt-3">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:contact@ssbhakthi.com">contact@ssbhakthi.com</a>
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a href="https://www.ssbhakthi.com" target="_blank" rel="noopener noreferrer">
                    www.ssbhakthi.com
                  </a>
                </p>
              </div>
              <p className="mt-3 text-muted small">
                <em>We will respond to your inquiry within 30 days.</em>
              </p>
            </section>

            {/* Compliance Information */}
            <section className="mb-4">
              <h2 className="h4 mb-3">Compliance Information</h2>
              <p className="small text-muted">This Privacy Policy is designed to comply with:</p>
              <ul className="small text-muted">
                <li>Google Play Store Data Safety requirements</li>
                <li>Apple App Store Privacy requirements</li>
                <li>General Data Protection Regulation (GDPR) - for EU users</li>
                <li>California Consumer Privacy Act (CCPA) - for California residents</li>
                <li>Information Technology Act, 2000 (India)</li>
              </ul>
            </section>
          </div>
        </Col>
      </Row>
    </Layout>
  );
};

export default PrivacyPolicy;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {},
  };
};
