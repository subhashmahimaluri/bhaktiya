import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function DecemberFestivals() {
  return (
    <FestivalsMonthTemplate
      month={12} // December is 12 (1-12)
      monthName="December"
      metaPath="/calendar/festivals/december"
    />
  );
}
