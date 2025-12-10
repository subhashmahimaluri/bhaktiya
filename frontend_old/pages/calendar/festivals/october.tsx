import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function OctoberFestivals() {
  return (
    <FestivalsMonthTemplate
      month={10} // October is 10 (1-12)
      monthName="October"
      metaPath="/calendar/festivals/october"
    />
  );
}
