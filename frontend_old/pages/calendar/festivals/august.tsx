import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function AugustFestivals() {
  return (
    <FestivalsMonthTemplate
      month={8} // August is 8 (1-12)
      monthName="August"
      metaPath="/calendar/festivals/august"
    />
  );
}
