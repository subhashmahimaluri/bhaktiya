import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function NovemberFestivals() {
  return (
    <FestivalsMonthTemplate
      month={11} // November is 11 (1-12)
      monthName="November"
      metaPath="/calendar/festivals/november"
    />
  );
}
