interface FestivalSkeletonProps {
  className?: string;
  type?: 'list' | 'calendar';
}

export default function FestivalSkeleton({ className = '', type = 'list' }: FestivalSkeletonProps) {
  if (type === 'calendar') {
    return (
      <div className={`festival-skeleton ${className}`}>
        {/* Calendar events skeleton */}
        <div className="events-list">
          <ul className="festival-list">
            {[...Array(8)].map((_, index) => (
              <li key={index} className="event-item skeleton-item">
                <div className="d-flex align-items-center">
                  <div
                    className="skeleton-text skeleton-text-sm me-3"
                    style={{ width: '60px' }}
                  ></div>
                  <div className="skeleton-text skeleton-text-md" style={{ width: '200px' }}></div>
                </div>
              </li>
            ))}
          </ul>
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

          .festival-skeleton {
            opacity: 0.8;
          }

          .skeleton-item {
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
          }

          .festival-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
            list-style: none;
            padding: 0;
            margin: 0;
          }

          @media (max-width: 768px) {
            .festival-list {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  // Default list type skeleton
  return (
    <div className={`festival-skeleton ${className}`}>
      {/* Upcoming events skeleton */}
      <div className="events-list">
        <ul className="festival-list">
          {[...Array(6)].map((_, index) => (
            <li key={index} className="event-item skeleton-item">
              <div className="d-flex align-items-center">
                <div
                  className="skeleton-text skeleton-text-sm me-3"
                  style={{ width: '80px' }}
                ></div>
                <div className="skeleton-text skeleton-text-md" style={{ width: '180px' }}></div>
              </div>
            </li>
          ))}
        </ul>
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

        .festival-skeleton {
          opacity: 0.8;
        }

        .skeleton-item {
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
        }

        .festival-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
