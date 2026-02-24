/**
 * lib/cache.ts — Server-Side In-Memory Cache
 *
 * How it works:
 * - Node.js server process holds data in memory (RAM)
 * - Each cache entry has a TTL (time-to-live) in milliseconds
 * - After TTL expires, the next request fetches fresh data from MongoDB
 * - All concurrent requests during TTL window are served from memory (zero DB hit)
 *
 * Scale impact:
 * - 1 lakh students hit /api/admin/settings → 1 DB query per 5 minutes total
 * - 1 lakh students hit /api/products → 1 DB query per 30 minutes total
 * - Each cache key is isolated — settings cache doesn't affect products cache
 *
 * Limitations:
 * - Cache is per-server-process (not shared across multiple instances)
 * - Cache is lost on server restart (acceptable — data is re-fetched on first request)
 * - Do NOT cache user-specific data here (use per-user keys or skip caching)
 */

interface CacheEntry {
    data: any;
    expiresAt: number;  // Unix timestamp in ms
    cachedAt: number;   // When it was stored (for debugging)
}

// Global cache store — lives for the lifetime of the Node.js process
// Using (global as any) ensures this survives Next.js hot reloads in dev
const globalForCache = global as any;

if (!globalForCache.__serverCache) {
    globalForCache.__serverCache = new Map<string, CacheEntry>();
}

const store: Map<string, CacheEntry> = globalForCache.__serverCache;

// ────────────────────────────────────────────────────────────────────────────
// Core Cache Operations
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get a value from cache.
 * Returns null if not found or expired.
 */
export function cacheGet<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);  // Expired — clean it up
        return null;
    }

    return entry.data as T;
}

/**
 * Store a value in cache with TTL in seconds.
 */
export function cacheSet(key: string, data: any, ttlSeconds: number): void {
    store.set(key, {
        data,
        expiresAt: Date.now() + ttlSeconds * 1000,
        cachedAt: Date.now(),
    });
}

/**
 * Delete a specific cache key (call this after admin updates data).
 * Example: when admin saves settings, call cacheDelete('settings:global')
 */
export function cacheDelete(key: string): void {
    store.delete(key);
}

/**
 * Delete all cache keys that start with a prefix.
 * Example: cacheDeletePattern('quiz:questions') clears all question caches.
 */
export function cacheDeletePattern(prefix: string): void {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
            store.delete(key);
        }
    }
}

/**
 * The main helper — wraps a DB fetch with automatic caching.
 *
 * Usage:
 *   const settings = await withCache(
 *     'settings:global',    // unique cache key
 *     300,                  // TTL in seconds (5 minutes)
 *     () => SystemSettings.findOne({ key: 'global' })  // fetch function
 *   );
 *
 * First call: runs the fetch function, stores result in cache, returns it.
 * Next calls (within TTL): returns cached result immediately. Zero DB query.
 */
export async function withCache<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    // Try cache first
    const cached = cacheGet<T>(key);
    if (cached !== null) {
        return cached;  // ← Cache hit: zero DB call
    }

    // Cache miss — fetch from DB
    const data = await fetchFn();

    // Store in cache only if data is non-null
    if (data !== null && data !== undefined) {
        cacheSet(key, data, ttlSeconds);
    }

    return data;
}

// ────────────────────────────────────────────────────────────────────────────
// Cache Key Constants — Centralised to avoid typos across files
// ────────────────────────────────────────────────────────────────────────────
export const CACHE_KEYS = {
    SETTINGS: 'settings:global',      // SystemSettings — TTL: 5 min
    PRODUCTS_ALL: 'products:all',         // All active products — TTL: 30 min
    QUIZ_QUESTIONS: 'quiz:questions:all',   // All questions from DB — TTL: 30 min
    TOP_RANKERS: 'rankers:today',        // Today's top 10 rankers — TTL: 2 min
} as const;

export const CACHE_TTL = {
    SETTINGS: 5 * 60,   // 5 minutes  — settings change rarely
    PRODUCTS: 30 * 60,   // 30 minutes — products change rarely
    QUESTIONS: 30 * 60,   // 30 minutes — questions change rarely
    RANKERS: 2 * 60,   // 2 minutes  — leaderboard updates frequently
} as const;
