import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function JuneFestivals() {
  return (
    <FestivalsMonthTemplate
      month={6} // June is 6 (1-12)
      monthName="June"
      metaPath="/calendar/festivals/june"
    />
  );
}
