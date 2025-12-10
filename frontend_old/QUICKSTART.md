# 🚀 Festival Hook - Quick Start Guide

## 5-Minute Setup

### 1. Import the Hook

```tsx
import { useAllFestivals } from '@/hooks/useAllFestivals';
```

### 2. Use in Your Component

```tsx
function MyComponent() {
  const { festivals, isLoading } = useAllFestivals({ year: 2025 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {festivals.map((f, i) => (
        <li key={i}>
          {f.name_en} - {f.date.toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Test It

Navigate to: `/all-festivals-new/2025`

---

## Common Patterns

### Show Only Ekadashi

```tsx
const { festivals } = useAllFestivals({
  year: 2025,
  filters: { vrathaName: 'ekadashi' },
});
```

### Show This Month's Festivals

```tsx
const { festivals } = useAllFestivals({
  year: 2025,
  filters: { month: new Date().getMonth() + 1 },
});
```

### Show High Priority Only

```tsx
const { festivals } = useAllFestivals({
  year: 2025,
  filters: { priority: 1 },
});
```

---

## What You Get

Each festival object contains:

```typescript
{
  fname: string; // Internal name
  date: Date; // Calculated date
  name_en: string; // English name
  name_te: string; // Telugu name
  priority: number; // 1-5 (1 = highest)
  vratha_name: string; // e.g., "ekadashi"
  based_on: 'Sunrise' | 'Pradosha';
  // ... and more
}
```

---

## Files to Check

📄 **Full Documentation**: `HOOK_USAGE_EXAMPLES.md`  
📄 **Examples**: `examples/FestivalHookExamples.tsx`  
📄 **Quick Ref**: `FESTIVAL_HOOK_QUICKREF.md`  
📄 **Test Page**: `pages/all-festivals-new/[year].tsx`

---

## Need Help?

Check the comprehensive docs:

- `HOOK_USAGE_EXAMPLES.md` - Full guide with 15+ examples
- `FESTIVAL_HOOK_ARCHITECTURE.md` - Technical deep dive
- `FESTIVAL_HOOK_QUICKREF.md` - Cheat sheet

---

**That's it!** You're ready to use the festival hook. 🎉
