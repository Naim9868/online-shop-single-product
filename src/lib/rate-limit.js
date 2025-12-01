// lib/rate-limit.js
class RateLimit {
  constructor(options) {
    this.interval = options.interval || 60000;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval || 500;
    this.store = new Map();
  }

  async check(request, limit, key) {
    // Skip rate limiting for admin routes
    const isAdminRoute = request.headers.get('referer')?.includes('/admin');
    
    if (isAdminRoute) {
      return 1; // Return count but don't enforce limit
    }

    const identifier = key || 'anonymous';
    const now = Date.now();
    
    if (!this.store.has(identifier)) {
      this.store.set(identifier, { count: 1, lastReset: now });
    }

    const userData = this.store.get(identifier);
    
    if (now - userData.lastReset > this.interval) {
      userData.count = 1;
      userData.lastReset = now;
    } else {
      userData.count++;
    }

    if (this.store.size > this.uniqueTokenPerInterval) {
      const cutoff = now - this.interval;
      for (const [key, value] of this.store.entries()) {
        if (value.lastReset < cutoff) {
          this.store.delete(key);
        }
      }
    }

    if (userData.count > limit) {
      throw new Error('Rate limit exceeded');
    }

    return userData.count;
  }
}

export default function rateLimit(options) {
  return new RateLimit(options);
}