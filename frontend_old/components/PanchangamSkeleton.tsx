interface PanchangamSkeletonProps {
  className?: string;
}

export default function PanchangamSkeleton({ className = '' }: PanchangamSkeletonProps) {
  return (
    <div className={`panchangam-skeleton ${className}`}>
      {/* Main header skeleton */}
      <div className="pricing-card gr-hover-shadow-1 gr-text-color border bg-white px-4 py-2">
        <div className="panchang-date">
          <ul className="list-unstyled gr-text-8 border-bottom pb-3">
            {/* Basic info skeleton */}
            {[...Array(8)].map((_, index) => (
              <li key={index} className="mb-2">
                <div className="d-flex align-items-center">
                  <div
                    className="skeleton-text skeleton-text-sm me-2"
                    style={{ width: '80px' }}
                  ></div>
                  <span>:</span>
                  <div
                    className="skeleton-text skeleton-text-md ms-2"
                    style={{ width: '120px' }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Anga sections skeleton */}
        {['Tithi', 'Nakshatra', 'Yoga', 'Karana'].map(section => (
          <div key={section} className="panchang-date mb-4">
            <div className="skeleton-text skeleton-text-lg mb-3" style={{ width: '100px' }}></div>
            <ul className="list-unstyled gr-text-8 border-bottom pb-4">
              {[...Array(2)].map((_, index) => (
                <li key={index} className="mb-2">
                  <div className="d-flex align-items-center">
                    <div
                      className="skeleton-text skeleton-text-md me-2"
                      style={{ width: '140px' }}
                    ></div>
                    <span>:</span>
                    <div
                      className="skeleton-text skeleton-text-lg ms-2"
                      style={{ width: '200px' }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <style jsx>{`
        .skeleton-text {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          height: 16px;
          display: inline-block;
        }

        .skeleton-text-sm {
          height: 12px;
        }

        .skeleton-text-md {
          height: 16px;
        }

        .skeleton-text-lg {
          height: 20px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .panchangam-skeleton {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
