interface VrathaTableSkeletonProps {
  rows?: number;
}

export default function VrathaTableSkeleton({ rows = 5 }: VrathaTableSkeletonProps) {
  const skeletonStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    display: 'inline-block',
    lineHeight: '1',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="mt-3">
      <style jsx>{`
        @keyframes skeleton-loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .skeleton-item {
          background-color: #f0f0f0;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-item::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: skeleton-loading 1.5s infinite;
        }
      `}</style>
      <div className="table-responsive">
        <table className="table-striped table">
          <thead>
            <tr>
              <th>
                <div
                  className="skeleton-item"
                  style={{ ...skeletonStyle, height: '20px', width: '80px' }}
                ></div>
              </th>
              <th>
                <div
                  className="skeleton-item"
                  style={{ ...skeletonStyle, height: '20px', width: '120px' }}
                ></div>
              </th>
              <th>
                <div
                  className="skeleton-item"
                  style={{ ...skeletonStyle, height: '20px', width: '120px' }}
                ></div>
              </th>
              <th>
                <div
                  className="skeleton-item"
                  style={{ ...skeletonStyle, height: '20px', width: '100px' }}
                ></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index}>
                <td>
                  <div
                    className="skeleton-item"
                    style={{ ...skeletonStyle, height: '16px', width: '150px' }}
                  ></div>
                </td>
                <td>
                  <div
                    className="skeleton-item"
                    style={{ ...skeletonStyle, height: '16px', width: '120px' }}
                  ></div>
                </td>
                <td>
                  <div
                    className="skeleton-item"
                    style={{ ...skeletonStyle, height: '16px', width: '120px' }}
                  ></div>
                </td>
                <td>
                  <div
                    className="skeleton-item"
                    style={{ ...skeletonStyle, height: '16px', width: '80px' }}
                  ></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
