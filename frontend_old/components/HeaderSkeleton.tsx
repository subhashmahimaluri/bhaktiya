interface HeaderSkeletonProps {
  className?: string;
  height?: string;
}

export default function HeaderSkeleton({ className = "", height = "h-6" }: HeaderSkeletonProps) {
  return (
    <div className={`skeleton-text ${height} ${className}`} style={{ width: '200px' }}></div>
  );
}