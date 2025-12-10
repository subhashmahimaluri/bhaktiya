export default function DayDetailsSkeleton() {
  return (
    <div className="day-details-skeleton">
      {/* Header skeleton */}
      <div className="skeleton-text skeleton-text-lg mb-3" style={{ width: '200px' }}></div>
      
      {/* Sun & Moon Times skeleton */}
      <div className="mb-4">
        <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '150px' }}></div>
        <div className="row small">
          <div className="col-6">
            <div className="mb-2">
              <div className="skeleton-text skeleton-text-sm mb-1" style={{ width: '60px' }}></div>
              <div className="skeleton-text skeleton-text-sm" style={{ width: '80px' }}></div>
            </div>
            <div className="mb-2">
              <div className="skeleton-text skeleton-text-sm mb-1" style={{ width: '60px' }}></div>
              <div className="skeleton-text skeleton-text-sm" style={{ width: '80px' }}></div>
            </div>
          </div>
          <div className="col-6">
            <div className="mb-2">
              <div className="skeleton-text skeleton-text-sm mb-1" style={{ width: '70px' }}></div>
              <div className="skeleton-text skeleton-text-sm" style={{ width: '80px' }}></div>
            </div>
            <div className="mb-2">
              <div className="skeleton-text skeleton-text-sm mb-1" style={{ width: '70px' }}></div>
              <div className="skeleton-text skeleton-text-sm" style={{ width: '80px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Panchangam Elements skeleton */}
      <div className="mb-4">
        <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '150px' }}></div>
        <div className="small">
          {[...Array(5)].map((_, index) => (
            <div className="row mb-2" key={index}>
              <div className="col-4">
                <div className="skeleton-text skeleton-text-sm" style={{ width: '60px' }}></div>
              </div>
              <div className="col-8">
                <div className="skeleton-text skeleton-text-sm" style={{ width: '120px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Information skeleton */}
      <div className="mb-3">
        <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '150px' }}></div>
        <div className="small">
          {[...Array(4)].map((_, index) => (
            <div className="row mb-2" key={index}>
              <div className="col-4">
                <div className="skeleton-text skeleton-text-sm" style={{ width: '60px' }}></div>
              </div>
              <div className="col-8">
                <div className="skeleton-text skeleton-text-sm" style={{ width: '120px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className="mt-3 text-center">
        <div className="skeleton-text skeleton-text-md" style={{ width: '120px', height: '32px', margin: '0 auto' }}></div>
      </div>

      <style jsx>{`
        .skeleton-text {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
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

        .day-details-skeleton {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}