import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function JanuaryFestivals() {
  return (
    <FestivalsMonthTemplate
      month={1} // January is 1 (1-12)
      monthName="January"
      metaPath="/calendar/festivals/january"
    />
  );
}
