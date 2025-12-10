export default function EclipseDetailSkeleton() {
  return (
    <div className="eclipse-detail-skeleton">
      {/* Skeleton for title */}
      <div className="skeleton-item mb-3">
        <div className="skeleton-text skeleton-text-lg" style={{ width: '60%' }}></div>
      </div>
      
      {/* Skeleton for table */}
      <div className="skeleton-table">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="skeleton-row mb-3">
            <div className="d-flex">
              <div className="skeleton-text skeleton-text-md me-3" style={{ width: '200px' }}></div>
              <div className="skeleton-text skeleton-text-md" style={{ width: '150px' }}></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Skeleton for magnitude and duration sections */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '120px' }}></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton-text skeleton-text-sm mb-2" style={{ width: '100%' }}></div>
          ))}
        </div>
        <div className="col-md-6">
          <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '100px' }}></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton-text skeleton-text-sm mb-2" style={{ width: '100%' }}></div>
          ))}
        </div>
      </div>
      
      {/* Skeleton for Sutak timings */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="skeleton-text skeleton-text-md mb-3" style={{ width: '140px' }}></div>
          <div className="skeleton-table">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-row mb-3">
                <div className="d-flex">
                  <div className="skeleton-text skeleton-text-md me-3" style={{ width: '250px' }}></div>
                  <div className="skeleton-text skeleton-text-md" style={{ width: '150px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          height: 24px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .eclipse-detail-skeleton {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}