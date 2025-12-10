# Festival Hook Migration Guide

## Overview

This guide explains the migration from component-based festival calculation to the new `useAllFestivals` hook.

## What Was Created

### 1. **useAllFestivals Hook** (`hooks/useAllFestivals.ts`)

- Encapsulates all festival calculation logic
- Supports advanced filtering
- Fully typed with TypeScript
- Reusable across multiple components

### 2. **Test Page** (`pages/all-festivals-new/[year].tsx`)

- Demonstrates hook usage
- Includes filter UI
- Shows comparison with old implementation

### 3. **Comparison Component** (`components/FestivalComparison.tsx`)

- Validates hook results
- Shows statistics
- Useful for testing

### 4. **Documentation** (`HOOK_USAGE_EXAMPLES.md`)

- Comprehensive usage examples
- Filter examples
- Migration guide

## Testing the Hook

### Step 1: Compare Implementations

1. **Old Page**: Navigate to `/all-festivals/2025`
2. **New Page**: Navigate to `/all-festivals-new/2025`

Both pages should show:

- Same number of festivals
- Same festival dates
- Same festival names
- Same leap month status

### Step 2: Validate Filters

Test the filters on the new page:

- Month filter (e.g., select "January")
- Priority filter (e.g., select "1")
- Vratha filter (e.g., select "ekadashi")
- Calculation type filter (e.g., select "Sunrise")

### Step 3: Check Edge Cases

Test with different scenarios:

- Regular year (e.g., 2025)
- Leap month year (check `hasLeapMonth` flag)
- Different locations (change location in settings)

## Migration Plan

### Phase 1: Testing (Current Phase)

✅ Hook created  
✅ Test page created  
✅ Comparison component created  
✅ Documentation written

### Phase 2: Validation

- [ ] Test with 2025 data
- [ ] Test with 2024 data
- [ ] Test with different locations (Hyderabad, Mumbai, etc.)
- [ ] Compare results between old and new implementations
- [ ] Test all filter combinations

### Phase 3: Migration (After Validation)

- [ ] Update `/all-festivals/[year].tsx` to use hook
- [ ] Remove old calculation logic from component
- [ ] Keep test page for reference
- [ ] Update other components that need festival data

### Phase 4: Cleanup

- [ ] Remove test page (optional)
- [ ] Archive old implementation
- [ ] Update documentation

## Migration Example

### Before (Old Implementation)

```tsx
// Component with 150+ lines of calculation logic
const AllFestivalsPage: NextPage = () => {
  const [festivalDates, setFestivalDates] = useState<FestivalDate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasLeapMonth, setHasLeapMonth] = useState<boolean>(false);

  useEffect(() => {
    if (year && lat && lng) {
      calculateAllFestivals(Number(year));
    }
  }, [year, lat, lng]);

  const calculateAllFestivals = async (selectedYear: number) => {
    setLoading(true);
    // ... 150+ lines of logic ...
    setLoading(false);
  };

  // ... rest of component ...
};
```

### After (New Implementation)

```tsx
// Clean component using hook
const AllFestivalsPage: NextPage = () => {
  const router = useRouter();
  const { year } = router.query;
  const { lat, lng } = useLocation();
  const { locale } = useTranslation();

  // All logic encapsulated in hook!
  const { festivals, isLoading, isError, error, hasLeapMonth, totalFestivals } = useAllFestivals({
    year: Number(year) || new Date().getFullYear(),
    lat,
    lng,
  });

  // Group festivals by date for display
  const festivalsByDate = useMemo(() => {
    const grouped = new Map<string, typeof festivals>();
    festivals.forEach(festival => {
      const dateKey = festival.date.toISOString().split('T')[0];
      const existing = grouped.get(dateKey) || [];
      existing.push(festival);
      grouped.set(dateKey, existing);
    });
    return Array.from(grouped.entries()).map(([dateKey, festivalList]) => ({
      date: new Date(dateKey),
      festivals: festivalList,
    }));
  }, [festivals]);

  // ... render UI using festivalsByDate ...
};
```

## Hook Benefits

### 1. **Code Reusability**

- Use in any component
- No code duplication
- Consistent behavior

### 2. **Separation of Concerns**

- Logic separated from UI
- Easier to test
- Easier to maintain

### 3. **Advanced Filtering**

```tsx
// Before: Required custom implementation for each filter
// After: Built-in filtering
const { festivals } = useAllFestivals({
  year: 2025,
  filters: {
    month: 1,
    priority: 1,
    vrathaName: 'ekadashi',
  },
});
```

### 4. **Type Safety**

```tsx
// All types are properly defined
const festival: FestivalObject = {
  fname: 'Diwali',
  date: new Date(),
  name_en: 'Diwali',
  name_te: 'దీపావళి',
  festival_type: '',
  priority: 1,
  vratha_name: '',
  based_on: 'Pradosha',
  masa: '7',
  tithi: '30',
};
```

### 5. **Easy to Extend**

```tsx
// Add new filters easily
export interface FestivalFilterOptions {
  month?: number;
  priority?: number;
  // ... existing filters ...

  // NEW: Add custom filter
  festivalName?: string; // Filter by festival name
}
```

## Data Flow Comparison

### Old Implementation

```
Component → useState → useEffect → Calculation Logic → setState → Render
```

### New Implementation

```
Component → useAllFestivals Hook → Render
              ↓
         [Hook Internal]
         State Management
              ↓
         Calculation Logic
              ↓
         Filtering Logic
              ↓
         Return Results
```

## Hook API

### Input (Options)

```typescript
{
  year: number;              // Required
  lat?: number;              // Optional (uses context)
  lng?: number;              // Optional (uses context)
  filters?: {
    month?: number;          // 1-12
    priority?: number;       // 1-5
    festivalType?: string;
    vrathaName?: string;
    calculationType?: 'Sunrise' | 'Pradosha';
    startDate?: Date;
    endDate?: Date;
  };
  enabled?: boolean;         // Default: true
  autoFetch?: boolean;       // Default: true
}
```

### Output (Return)

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

## Performance Considerations

### Old Implementation

- Calculated on every component mount
- No caching
- Repeated calculations if multiple components need same data

### New Implementation

- Hook manages state internally
- Can be memoized
- Single calculation shared across hook instances
- Efficient filtering (no re-calculation needed)

## Validation Checklist

Before migrating to production:

- [ ] **Count Match**: Old and new pages show same festival count
- [ ] **Date Match**: Festival dates are identical
- [ ] **Name Match**: Festival names match in both languages
- [ ] **Leap Month**: `hasLeapMonth` flag is accurate
- [ ] **Priority Sorting**: Festivals sorted correctly by priority
- [ ] **Date Sorting**: Festivals sorted Jan 1 - Dec 31
- [ ] **Sunrise/Pradosha**: Both calculation types working
- [ ] **Ekadashi Logic**: Predominant daytime tithi logic correct
- [ ] **Adhik Masa**: Leap month festivals included/excluded correctly
- [ ] **Location**: Results accurate for different locations
- [ ] **Filters**: All filter combinations work correctly
- [ ] **Performance**: No significant slowdown

## Next Steps

1. **Test thoroughly** using `/all-festivals-new/2025`
2. **Compare results** with `/all-festivals/2025`
3. **Validate filters** work as expected
4. **Test edge cases** (leap months, different locations)
5. **Once validated**, migrate old page to use hook
6. **Reuse hook** in other components that need festival data

## Questions or Issues?

If you find any discrepancies between old and new implementations:

1. Document the difference
2. Check the comparison component output
3. Review the hook logic
4. Compare with `festivalMatcher.ts` utility

## Files to Review

- **Hook**: `hooks/useAllFestivals.ts`
- **Test Page**: `pages/all-festivals-new/[year].tsx`
- **Comparison**: `components/FestivalComparison.tsx`
- **Examples**: `HOOK_USAGE_EXAMPLES.md`
- **Old Page**: `pages/all-festivals/[year].tsx` (for comparison)

---

**Status**: ✅ Hook created and ready for testing  
**Next**: Validate results and migrate old implementation
