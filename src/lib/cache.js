const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ApiCache {
  constructor() {
    this.cache = {};
  }

  async fetchWithCache(key, fetchFn) {
    const now = Date.now();
    const cached = this.cache[key];

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache[key] = {
        data,
        timestamp: now
      };
      return data;
    } catch (error) {
      // Return cached data even if stale when fetch fails
      if (cached) {
        console.warn(`Using stale cache for ${key} due to fetch error`);
        return cached.data;
      }
      throw error;
    }
  }

  clear() {
    this.cache = {};
  }
}

export const apiCache = new ApiCache();