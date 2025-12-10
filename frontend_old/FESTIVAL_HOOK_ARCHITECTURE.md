# Festival Hook Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Components                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Import & Use
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useAllFestivals Hook                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Input Parameters                       │  │
│  │  • year (required)                                        │  │
│  │  • lat, lng (optional, uses context)                     │  │
│  │  • filters (optional)                                     │  │
│  │  • enabled, autoFetch (optional)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              State Management                             │  │
│  │  • festivals: FestivalObject[]                           │  │
│  │  • isLoading: boolean                                    │  │
│  │  • isError: boolean                                      │  │
│  │  • error: string | null                                  │  │
│  │  • hasLeapMonth: boolean                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           Festival Calculation Logic                      │  │
│  │  1. Iterate through each day of year                     │  │
│  │  2. Calculate Sunrise & Pradosha calendars               │  │
│  │  3. Calculate predominant daytime tithi                  │  │
│  │  4. Match festivals using festivalMatcher               │  │
│  │  5. Convert to FestivalObject format                     │  │
│  │  6. Sort by date (Jan 1 - Dec 31)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Filter Application                           │  │
│  │  • Month filter (1-12)                                   │  │
│  │  • Priority filter (1-5)                                 │  │
│  │  • Festival type filter                                  │  │
│  │  • Vratha name filter                                    │  │
│  │  • Calculation type filter (Sunrise/Pradosha)           │  │
│  │  • Date range filter (start/end dates)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Return Results                           │  │
│  │  • festivals: Filtered and sorted array                 │  │
│  │  • totalFestivals: Count of festivals                   │  │
│  │  • hasLeapMonth: Boolean flag                           │  │
│  │  • isLoading, isError, error: States                    │  │
│  │  • refetch: Manual refetch function                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Return to Component
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Component Renders UI                         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Input Flow

```
User/Component → Hook Options → useAllFestivals → State Initialization
```

### 2. Calculation Flow

```
Year + Location
    ↓
YexaaPanchang Instance
    ↓
For each day of year:
    ├── Calculate Sunrise Calendar
    ├── Calculate Pradosha Calendar
    ├── Calculate Predominant Tithi
    └── Match Festivals
        ├── Sunrise-based festivals
        ├── Pradosha-based festivals
        └── Ekadashi festivals (special logic)
    ↓
Collect all festivals
    ↓
Sort by date (Jan 1 - Dec 31)
    ↓
Apply filters (if any)
    ↓
Return results
```

### 3. Filter Flow

```
All Festivals (unsorted)
    ↓
Sort by date
    ↓
Apply month filter (if specified)
    ↓
Apply priority filter (if specified)
    ↓
Apply festival type filter (if specified)
    ↓
Apply vratha name filter (if specified)
    ↓
Apply calculation type filter (if specified)
    ↓
Apply date range filter (if specified)
    ↓
Filtered Festivals (still sorted by date)
```

## Component Integration

### Pattern 1: Direct Usage

```tsx
Component
    ├── useAllFestivals({ year: 2025 })
    │   └── Returns: { festivals, isLoading, ... }
    └── Render UI with festivals
```

### Pattern 2: With Filters

```tsx
Component
    ├── useState for filter values
    ├── useAllFestivals({ year: 2025, filters: { ... } })
    │   └── Returns: filtered festivals
    └── Render UI with filtered festivals
```

### Pattern 3: With Location Context

```tsx
Component
    ├── useLocation() → { lat, lng }
    ├── useAllFestivals({ year: 2025 })
    │   └── Auto-uses location from context
    └── Render UI with festivals
```

### Pattern 4: Custom Location

```tsx
Component
    ├── Custom lat, lng values
    ├── useAllFestivals({ year: 2025, lat, lng })
    │   └── Overrides location context
    └── Render UI with festivals
```

## Dependencies

```
useAllFestivals Hook
    │
    ├── useLocation (context)
    │   └── Provides default lat, lng
    │
    ├── YexaaPanchang (lib)
    │   ├── calendar()
    │   ├── calendarAtPradosha()
    │   └── calculate()
    │
    ├── festivalMatcher (utils)
    │   ├── calculatePredominantDaytimeTithi()
    │   └── getMatchingFestivalsWithEkadashi()
    │
    └── festivalsData (JSON)
        └── Telugu festivals database
```

## State Management

```
Hook Internal State
    │
    ├── festivals: FestivalObject[]
    │   └── All calculated festivals
    │
    ├── isLoading: boolean
    │   └── Calculation in progress
    │
    ├── isError: boolean
    │   └── Error occurred
    │
    ├── error: string | null
    │   └── Error message
    │
    └── hasLeapMonth: boolean
        └── Year has adhik masa
```

## Memory Structure

```
Festival Object (in memory)
{
    fname: "Diwali",                    // Internal identifier
    date: Date(2025-10-21),             // Calculated date
    name_en: "Diwali (Deepavali)",      // English name
    name_te: "దీపావళి",                 // Telugu name
    festival_type: "",                  // Type category
    priority: 1,                        // Priority (1-5)
    vratha_name: "",                    // Vratha category
    based_on: "Pradosha",               // Calculation method
    masa: "7",                          // Telugu month
    tithi: "30"                         // Tithi number
}
```

## Performance Profile

```
useAllFestivals Execution
    │
    ├── Initial Load: ~2-3 seconds
    │   └── Calculates 365 days × 2 calendars
    │
    ├── Filtering: <100ms
    │   └── Array filter operations
    │
    ├── Re-fetch: ~2-3 seconds
    │   └── Recalculates from scratch
    │
    └── Memory: ~100-200KB
        └── 200-300 festival objects
```

## Hook Lifecycle

```
Component Mount
    │
    ├── useAllFestivals initialization
    │   └── Check if enabled && autoFetch
    │
    ├── If yes:
    │   └── useEffect triggers
    │       └── calculateFestivals()
    │           ├── setLoading(true)
    │           ├── Calculate all festivals
    │           ├── Apply filters
    │           ├── setFestivals(results)
    │           └── setLoading(false)
    │
    └── Component renders with results

Filter Change
    │
    ├── Filters update (from props)
    │   └── useEffect detects change
    │       └── calculateFestivals() re-runs
    │           └── Recalculates with new filters
    │
    └── Component re-renders

Manual Refetch
    │
    ├── User calls refetch()
    │   └── calculateFestivals() runs
    │       └── Fresh calculation
    │
    └── Component re-renders
```

## Error Handling

```
Error Sources
    │
    ├── Missing Parameters
    │   └── "Missing required parameters: year, lat, lng"
    │
    ├── Calculation Errors
    │   └── Caught per-date, logged to console
    │
    └── Filter Errors
        └── Handled gracefully, returns empty array
```

## Extension Points

```
Future Enhancements
    │
    ├── Caching Layer
    │   └── Cache results by year + location
    │
    ├── Pagination
    │   └── Return festivals in chunks
    │
    ├── Search
    │   └── Add text search filter
    │
    ├── Sorting Options
    │   └── Sort by priority, name, etc.
    │
    └── Export Functionality
        └── Export to JSON, CSV, iCal
```

## Testing Strategy

```
Test Coverage
    │
    ├── Unit Tests
    │   ├── Filter logic
    │   ├── Date calculations
    │   └── Error handling
    │
    ├── Integration Tests
    │   ├── Hook with YexaaPanchang
    │   ├── Hook with festivalMatcher
    │   └── Hook with location context
    │
    └── E2E Tests
        ├── Full year calculation
        ├── Filter combinations
        └── UI rendering
```

## Comparison Architecture

### Old Implementation

```
Component
    │
    ├── State Management (multiple useState)
    ├── useEffect with dependencies
    ├── 150+ lines of calculation logic
    ├── Festival matching logic
    ├── Sorting logic
    └── UI rendering
```

### New Implementation

```
Component
    │
    ├── useAllFestivals hook (1 line)
    │   └── All logic encapsulated
    └── UI rendering
```

**Complexity Reduction**: 150+ lines → 1 line

## Reusability Pattern

```
useAllFestivals Hook (Single Implementation)
    │
    ├── Used in: All Festivals Page
    ├── Used in: Ekadashi Calendar
    ├── Used in: Monthly View
    ├── Used in: Festival Search
    ├── Used in: Upcoming Festivals Widget
    └── Used in: Festival Stats Dashboard
```

**DRY Principle**: Write once, use everywhere
