/**
 * API Utilities for Chapter99 Solution
 * Optimized for stability and speed with Caching and Retry Logic.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, CacheEntry<any>> = {};

/**
 * Fetch data with retry logic and caching
 */
export async function fetchWithRetry<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    useCache?: boolean;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, useCache = true } = options;

  // Check cache first
  if (useCache && cache[key]) {
    const entry = cache[key];
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log(`[Cache] Returning cached data for: ${key}`);
      return entry.data;
    }
  }

  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const data = await fetcher();
      
      // Update cache
      if (useCache) {
        cache[key] = { data, timestamp: Date.now() };
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`[API] Attempt ${i + 1} failed for ${key}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Clear cache for a specific key or all keys
 */
export function clearCache(key?: string) {
  if (key) {
    delete cache[key];
  } else {
    Object.keys(cache).forEach(k => delete cache[k]);
  }
}
