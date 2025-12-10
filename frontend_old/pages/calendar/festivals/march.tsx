import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function MarchFestivals() {
  return (
    <FestivalsMonthTemplate
      month={3} // March is 3 (1-12)
      monthName="March"
      metaPath="/calendar/festivals/march"
    />
  );
}
