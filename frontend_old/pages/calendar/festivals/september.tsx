import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function SeptemberFestivals() {
  return (
    <FestivalsMonthTemplate
      month={9} // September is 9 (1-12)
      monthName="September"
      metaPath="/calendar/festivals/september"
    />
  );
}
