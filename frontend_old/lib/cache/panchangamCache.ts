// lib/cache/panchangamCache.ts - Multi-tier caching for Panchangam data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class PanchangamCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

  /**
   * Generate cache key from date and location
   */
  private getCacheKey(date: Date, lat: number, lng: number): string {
    const dateStr = date.toISOString().split('T')[0];
    return `panchang_${dateStr}_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  }

  /**
   * Get data from cache (checks memory first, then localStorage)
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.expiresIn) {
      return memEntry.data as T;
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (Date.now() - entry.timestamp < entry.expiresIn) {
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            return entry.data;
          } else {
            // Expired, remove it
            localStorage.removeItem(key);
          }
        }
      } catch (err) {
        console.warn('localStorage read error:', err);
      }
    }

    return null;
  }

  /**
   * Set data in cache (both memory and localStorage)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);

    // Set in localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (err) {
        console.warn('localStorage write error (quota exceeded?):', err);
        // If quota exceeded, try to clear old entries
        this.clearOldEntries();
      }
    }
  }

  /**
   * Get Panchangam data with automatic key generation
   */
  getPanchangam<T>(date: Date, lat: number, lng: number): T | null {
    const key = this.getCacheKey(date, lat, lng);
    return this.get<T>(key);
  }

  /**
   * Set Panchangam data with automatic key generation
   */
  setPanchangam<T>(date: Date, lat: number, lng: number, data: T, ttl?: number): void {
    const key = this.getCacheKey(date, lat, lng);
    this.set(key, data, ttl);
  }

  /**
   * Clear expired entries from localStorage
   */
  clearOldEntries(): void {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('panchang_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const entry: CacheEntry<any> = JSON.parse(stored);
              if (now - entry.timestamp >= entry.expiresIn) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid entry, mark for removal
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (err) {
      console.warn('Error clearing old entries:', err);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('panchang_')) {
            localStorage.removeItem(key);
          }
        }
      } catch (err) {
        console.warn('Error clearing cache:', err);
      }
    }
  }
}

// Export singleton instance
export const panchangamCache = new PanchangamCache();
