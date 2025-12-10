# useAllFestivals Hook - Usage Examples

## Overview

The `useAllFestivals` hook provides a comprehensive solution for calculating and filtering Hindu festivals for any year. It encapsulates all the complex logic from the `all-festivals/[year].tsx` page into a reusable, flexible hook.

## Features

- ✅ **Automatic Festival Calculation** - Calculates all festivals for a given year
- ✅ **Sunrise & Pradosha Support** - Handles both calculation types
- ✅ **Ekadashi Logic** - Includes predominant daytime tithi calculation
- ✅ **Adhik Masa Support** - Correctly handles leap months
- ✅ **Advanced Filtering** - Filter by month, priority, type, vratha name, calculation type, and date range
- ✅ **Location Aware** - Uses location context or custom lat/lng
- ✅ **TypeScript Support** - Full type safety
- ✅ **Automatic Sorting** - Festivals sorted by date (Jan 1 - Dec 31)

## Basic Usage

### 1. Simple Usage (with Location Context)

```tsx
import { useAllFestivals } from '@/hooks/useAllFestivals';

function FestivalList() {
  const { festivals, isLoading, isError, error } = useAllFestivals({
    year: 2025,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;

  return (
    <ul>
      {festivals.map((festival, idx) => (
        <li key={idx}>
          {festival.date.toLocaleDateString()} - {festival.name_en}
        </li>
      ))}
    </ul>
  );
}
```

### 2. With Custom Location

```tsx
const { festivals } = useAllFestivals({
  year: 2025,
  lat: 17.385,
  lng: 78.4867,
});
```

### 3. With Locale Support

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function LocalizedFestivalList() {
  const { locale } = useTranslation();
  const { festivals } = useAllFestivals({ year: 2025 });

  return (
    <ul>
      {festivals.map((festival, idx) => (
        <li key={idx}>
          {festival.date.toLocaleDateString()} -
          {locale.startsWith('te') ? festival.name_te : festival.name_en}
        </li>
      ))}
    </ul>
  );
}
```

## Advanced Filtering

### Filter by Month

```tsx
// Show only January festivals
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    month: 1, // 1-12 (January-December)
  },
});
```

### Filter by Priority

```tsx
// Show only high priority festivals
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    priority: 1, // 1 = highest priority
  },
});
```

### Filter by Vratha Name

```tsx
// Show only Ekadashi festivals
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    vrathaName: 'ekadashi',
  },
});

// Show only Sankatahara Chathurthi
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    vrathaName: 'sankatahara_chathurthi',
  },
});
```

### Filter by Calculation Type

```tsx
// Show only Sunrise-based festivals
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    calculationType: 'Sunrise',
  },
});

// Show only Pradosha-based festivals (e.g., Diwali)
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    calculationType: 'Pradosha',
  },
});
```

### Filter by Date Range

```tsx
// Show festivals between March and June
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    startDate: new Date(2025, 2, 1), // March 1
    endDate: new Date(2025, 5, 30), // June 30
  },
});
```

### Combine Multiple Filters

```tsx
// Show only high-priority Ekadashi festivals in January
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    month: 1,
    priority: 1,
    vrathaName: 'ekadashi',
  },
});
```

## Festival Object Structure

Each festival object returned has the following structure:

```typescript
{
  fname: string; // festival_name (internal identifier)
  date: Date; // Calculated date
  name_en: string; // English name
  name_te: string; // Telugu name
  festival_type: string; // Type (e.g., "vratha")
  priority: number; // Priority (1-5, 1 = highest)
  vratha_name: string; // Vratha category (e.g., "ekadashi")
  based_on: 'Sunrise' | 'Pradosha'; // Calculation method
  masa: string; // Telugu month (1-12)
  tithi: string; // Tithi number
}
```

## Hook Options

```typescript
{
  year: number;                    // Required: Year to calculate
  lat?: number;                    // Optional: Latitude (defaults to location context)
  lng?: number;                    // Optional: Longitude (defaults to location context)
  filters?: {                      // Optional: Filter options
    month?: number;                // 1-12 (January-December)
    priority?: number;             // 1-5 (1 = highest)
    festivalType?: string;         // Festival type
    vrathaName?: string;           // Vratha name
    calculationType?: 'Sunrise' | 'Pradosha';
    startDate?: Date;              // Start date for range
    endDate?: Date;                // End date for range
  };
  enabled?: boolean;               // Optional: Enable/disable hook (default: true)
  autoFetch?: boolean;             // Optional: Auto-fetch on mount (default: true)
}
```

## Hook Return Values

```typescript
{
  festivals: FestivalObject[];     // Array of festivals (sorted by date)
  isLoading: boolean;              // Loading state
  isError: boolean;                // Error state
  error: string | null;            // Error message
  hasLeapMonth: boolean;           // Whether year has adhik masa
  totalFestivals: number;          // Total count of festivals
  refetch: () => Promise<void>;   // Manual refetch function
}
```

## Dynamic Filtering Example

```tsx
import { useState } from 'react';
import { useAllFestivals } from '@/hooks/useAllFestivals';

function DynamicFestivalFilter() {
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<number | undefined>(undefined);

  const { festivals, totalFestivals, isLoading } = useAllFestivals({
    year: 2025,
    filters: { month, priority },
  });

  return (
    <div>
      <select onChange={e => setMonth(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All Months</option>
        {/* ... month options ... */}
      </select>

      <select onChange={e => setPriority(e.target.value ? Number(e.target.value) : undefined)}>
        <option value="">All Priorities</option>
        <option value="1">High Priority</option>
        {/* ... priority options ... */}
      </select>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Showing {totalFestivals} festivals</p>
          <ul>
            {festivals.map((f, i) => (
              <li key={i}>
                {f.name_en} - {f.date.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Manual Refetch

```tsx
function RefetchExample() {
  const { festivals, refetch, isLoading } = useAllFestivals({
    year: 2025,
    autoFetch: false, // Don't fetch on mount
  });

  return (
    <div>
      <button onClick={refetch} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load Festivals'}
      </button>
      {/* ... display festivals ... */}
    </div>
  );
}
```

## Performance Tips

1. **Memoize filters**: Use `useMemo` for complex filter objects
2. **Disable autoFetch**: Set `autoFetch: false` if you want manual control
3. **Use enabled flag**: Conditionally enable the hook when ready

```tsx
const filters = useMemo(
  () => ({
    month: selectedMonth,
    priority: selectedPriority,
    vrathaName: selectedVratha,
  }),
  [selectedMonth, selectedPriority, selectedVratha]
);

const { festivals } = useAllFestivals({
  year: 2025,
  filters,
  enabled: Boolean(lat && lng), // Only enable when location is available
});
```

## Migration from Old Code

### Before (Component Logic)

```tsx
// Old: All logic in component
const [festivalDates, setFestivalDates] = useState<FestivalDate[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const calculateFestivals = async () => {
    setLoading(true);
    // ... 150+ lines of calculation logic ...
    setLoading(false);
  };
  calculateFestivals();
}, [year, lat, lng]);
```

### After (Hook Usage)

```tsx
// New: Simple hook usage
const { festivals, isLoading } = useAllFestivals({ year: 2025 });
```

## Testing the Hook

Compare the new hook implementation with the old page:

1. **Old Page**: `/all-festivals/2025`
2. **New Page (with hook)**: `/all-festivals-new/2025`

Both should produce identical results!

## Common Vratha Names

- `ekadashi` - Ekadashi festivals
- `sankatahara_chathurthi` - Sankatahara Chathurthi festivals
- (Check festival JSON for more)

## Common Festival Types

- `vratha` - Fasting/Vratha days
- (Empty string for regular festivals)

## Notes

- Festivals are always sorted by date (January 1 to December 31)
- Hook automatically handles Ekadashi predominant daytime tithi logic
- Leap month (adhik masa) festivals are included/excluded automatically
- Location context is used by default; can be overridden with props
