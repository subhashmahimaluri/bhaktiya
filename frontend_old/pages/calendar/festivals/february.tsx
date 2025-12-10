import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function FebruaryFestivals() {
  return (
    <FestivalsMonthTemplate
      month={2} // February is 2 (1-12)
      monthName="February"
      metaPath="/calendar/festivals/february"
    />
  );
}
