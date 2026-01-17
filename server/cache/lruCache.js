const NodeCache = require('node-cache');

class LRUCache {
  constructor(ttlSeconds = 600, maxKeys = 1000) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      maxKeys: maxKeys,
      useClones: false,
      deleteOnExpire: true
    });
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Log cache stats periodically
    setInterval(() => this.logStats(), 60000);
  }
  
  // Get cached value
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return null;
  }
  
  // Set cache value
  set(key, value, ttl = null) {
    const success = ttl 
      ? this.cache.set(key, value, ttl)
      : this.cache.set(key, value);
    
    if (success) {
      this.stats.sets++;
    }
    return success;
  }
  
  // Delete cache key
  del(key) {
    const deleted = this.cache.del(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }
  
  // Get multiple keys
  mget(keys) {
    return this.cache.mget(keys);
  }
  
  // Check if key exists
  has(key) {
    return this.cache.has(key);
  }
  
  // Get all keys
  keys() {
    return this.cache.keys();
  }
  
  // Flush all cache
  flush() {
    this.cache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    return true;
  }
  
  // Get cache stats
  getStats() {
    const stats = this.cache.getStats();
    return {
      ...this.stats,
      keys: stats.keys,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      size: this.cache.keys().length
    };
  }
  
  // Log stats
  logStats() {
    const stats = this.getStats();
    console.log('📊 Cache Stats:', {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
      size: stats.size
    });
  }
  
  // Middleware for Express
  middleware(ttl = 300) {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }
      
      const key = req.originalUrl || req.url;
      const cached = this.get(key);
      
      if (cached) {
        console.log(`⚡ Cache hit: ${key}`);
        return res.json(cached);
      }
      
      // Store original send method
      const originalSend = res.json;
      res.json = (body) => {
        // Cache the response
        this.set(key, body, ttl);
        
        // Call original send method
        originalSend.call(res, body);
      };
      
      next();
    };
  }
}

// Create singleton instance
const cacheInstance = new LRUCache();

module.exports = cacheInstance;