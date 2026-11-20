import Redis from 'ioredis';

class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  async get(key) {
    if (this.ttls.has(key) && Date.now() > this.ttls.get(key)) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    const val = this.store.get(key);
    return val !== undefined ? val : null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (mode === 'EX' && typeof duration === 'number') {
      this.ttls.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.ttls.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    const validKeys = [];
    const now = Date.now();
    for (const key of this.store.keys()) {
      if (this.ttls.has(key) && now > this.ttls.get(key)) {
        this.store.delete(key);
        this.ttls.delete(key);
      } else if (regex.test(key)) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }

  async flushall() {
    this.store.clear();
    this.ttls.clear();
    return 'OK';
  }
}

let redisClient = null;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  if (process.env.USE_REDIS_CLUSTER === 'true' || process.env.NODE_ENV === 'production') {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        connectTimeout: 2000
      });

      client.on('connect', () => {
        console.log('[Redis] Connected successfully to Redis server');
      });

      client.on('error', (err) => {
        console.warn(`[Redis] Server connection failed: ${err.message}. Reverting to high-performance memory cache.`);
        redisClient = new InMemoryCache();
      });

      redisClient = client;
      return redisClient;
    } catch {
      redisClient = new InMemoryCache();
      return redisClient;
    }
  }

  console.log('[Redis] Initialized fast in-memory Redis session & cart cache engine');
  redisClient = new InMemoryCache();
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};
