import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function MayFestivals() {
  return (
    <FestivalsMonthTemplate
      month={5} // May is 5 (1-12)
      monthName="May"
      metaPath="/calendar/festivals/may"
    />
  );
}
