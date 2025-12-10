import FestivalsMonthTemplate from '@/components/FestivalsMonthTemplate';

export default function JulyFestivals() {
  return (
    <FestivalsMonthTemplate
      month={7} // July is 7 (1-12)
      monthName="July"
      metaPath="/calendar/festivals/july"
    />
  );
}
