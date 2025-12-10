interface CalendarCellSkeletonProps {
  showVarjyam?: boolean;
}

export default function CalendarCellSkeleton({ showVarjyam = true }: CalendarCellSkeletonProps) {
  return (
    <>
      <div className="skeleton-text skeleton-text-xs mb-1" style={{ width: '60%' }}></div>
      <div className="skeleton-text skeleton-text-xs mb-1" style={{ width: '70%' }}></div>
      {showVarjyam && (
        <div className="skeleton-text skeleton-text-xs" style={{ width: '50%' }}></div>
      )}
    </>
  );
}