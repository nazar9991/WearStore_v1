"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheDelPattern = exports.cacheDel = exports.cacheSet = exports.cacheGet = void 0;
const logger_js_1 = require("../utils/logger.js");
// Simple in-memory cache (replaces Redis for development/small deployments)
const cache = new Map();
// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
            cache.delete(key);
        }
    }
}, 60000); // Every minute
const cacheGet = async (key) => {
    try {
        const entry = cache.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            cache.delete(key);
            return null;
        }
        return JSON.parse(entry.value);
    }
    catch (error) {
        logger_js_1.logger.error('Cache get error:', error);
        return null;
    }
};
exports.cacheGet = cacheGet;
const cacheSet = async (key, value, ttl) => {
    try {
        const stringValue = JSON.stringify(value);
        cache.set(key, {
            value: stringValue,
            expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
        });
    }
    catch (error) {
        logger_js_1.logger.error('Cache set error:', error);
    }
};
exports.cacheSet = cacheSet;
const cacheDel = async (key) => {
    try {
        cache.delete(key);
    }
    catch (error) {
        logger_js_1.logger.error('Cache delete error:', error);
    }
};
exports.cacheDel = cacheDel;
const cacheDelPattern = async (pattern) => {
    try {
        // Convert glob pattern to regex
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of cache.keys()) {
            if (regex.test(key)) {
                cache.delete(key);
            }
        }
    }
    catch (error) {
        logger_js_1.logger.error('Cache delete pattern error:', error);
    }
};
exports.cacheDelPattern = cacheDelPattern;
//# sourceMappingURL=redis.js.map