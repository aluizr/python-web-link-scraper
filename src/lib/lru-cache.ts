/**
 * Generic LRU (Least Recently Used) Cache with localStorage persistence
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private cache = new Map<K, { value: V; timestamp: number }>();
  private expiry: number;
  private storageKey: string;

  constructor(maxSize = 100, expiryMs = 24 * 60 * 60 * 1000, storageKey = "webnest:cache") {
    this.maxSize = maxSize;
    this.expiry = expiryMs;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        // Load only non-expired entries
        for (const [key, entry] of Object.entries(data)) {
          const typedEntry = entry as { value: V; timestamp: number };
          if (now - typedEntry.timestamp < this.expiry) {
            this.cache.set(key as K, typedEntry);
          }
        }
      }
    } catch (err) {
      console.warn(`[LRUCache] Error loading cache ${this.storageKey}:`, err);
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const data: Record<string, { value: V; timestamp: number }> = {};
      for (const [key, entry] of this.cache.entries()) {
        data[key as string] = entry;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (err) {
      console.warn(`[LRUCache] Error saving cache ${this.storageKey}:`, err);
    }
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() - entry.timestamp > this.expiry) {
      this.cache.delete(key);
      this.saveToStorage();
      return undefined;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (first in Map iteration order)
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
    this.saveToStorage();
  }

  delete(key: K): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.saveToStorage();
    }
  }

  clear(): void {
    this.cache.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}
