import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function AprilFestivals() {
  return (
    <FestivalsMonthTemplate
      month={4} // April is 4 (1-12)
      monthName="April"
      metaPath="/calendar/festivals/april"
    />
  );
}
