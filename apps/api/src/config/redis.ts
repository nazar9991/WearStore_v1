import { logger } from '../utils/logger.js';

// Simple in-memory cache (replaces Redis for development/small deployments)
const cache = new Map<string, { value: string; expiresAt?: number }>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt && entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}, 60000); // Every minute

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const entry = cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      cache.delete(key);
      return null;
    }

    return JSON.parse(entry.value);
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: unknown, ttl?: number): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    cache.set(key, {
      value: stringValue,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    });
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    cache.delete(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    // Convert glob pattern to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  } catch (error) {
    logger.error('Cache delete pattern error:', error);
  }
};
