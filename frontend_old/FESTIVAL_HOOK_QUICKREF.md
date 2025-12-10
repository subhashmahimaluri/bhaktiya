# useAllFestivals Hook - Quick Reference

## Import

```tsx
import { useAllFestivals } from '@/hooks/useAllFestivals';
```

## Basic Usage

```tsx
const { festivals, isLoading, hasLeapMonth } = useAllFestivals({ year: 2025 });
```

## With Location

```tsx
const { festivals } = useAllFestivals({
  year: 2025,
  lat: 17.385,
  lng: 78.4867,
});
```

## Common Filters

### Month

```tsx
filters: {
  month: 1;
} // January only
```

### Priority

```tsx
filters: {
  priority: 1;
} // High priority only
```

### Vratha Type

```tsx
filters: {
  vrathaName: 'ekadashi';
} // Only Ekadashi
filters: {
  vrathaName: 'sankatahara_chathurthi';
} // Only Sankatahara
```

### Calculation Type

```tsx
filters: {
  calculationType: 'Sunrise';
} // Sunrise-based
filters: {
  calculationType: 'Pradosha';
} // Pradosha-based
```

### Date Range

```tsx
filters: {
  startDate: new Date(2025, 0, 1),  // Jan 1
  endDate: new Date(2025, 2, 31)     // Mar 31
}
```

### Combined

```tsx
filters: {
  month: 1,
  priority: 1,
  vrathaName: 'ekadashi'
}
```

## Festival Object

```typescript
{
  fname: string; // festival_name
  date: Date; // calculated date
  name_en: string; // English name
  name_te: string; // Telugu name
  festival_type: string; // type
  priority: number; // 1-5
  vratha_name: string; // vratha category
  based_on: 'Sunrise' | 'Pradosha';
  masa: string; // Telugu month
  tithi: string; // Tithi number
}
```

## Return Values

```typescript
{
  festivals: FestivalObject[];  // Sorted by date
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  hasLeapMonth: boolean;
  totalFestivals: number;
  refetch: () => Promise<void>;
}
```

## Display Example

```tsx
{
  festivals.map(f => (
    <div key={f.fname}>
      {f.date.toLocaleDateString()} - {f.name_en}
    </div>
  ));
}
```

## With Locale

```tsx
const { locale } = useTranslation();
const { festivals } = useAllFestivals({ year: 2025 });

{
  festivals.map(f => <div>{locale.startsWith('te') ? f.name_te : f.name_en}</div>);
}
```

## Testing URLs

- Old: `/all-festivals/2025`
- New: `/all-festivals-new/2025`
