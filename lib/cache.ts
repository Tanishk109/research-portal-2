// Simple in-memory cache for server-side data
// Usage: cache.get(key), cache.set(key, value, ttlSeconds)

interface CacheEntry<T> {
  value: T
  expires: number
}

class SimpleCache {
  private store = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expires) {
      this.store.delete(key)
      return undefined
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlSeconds: number) {
    this.store.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  deleteByPrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache() 
