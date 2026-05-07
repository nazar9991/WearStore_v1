export declare const cacheGet: <T>(key: string) => Promise<T | null>;
export declare const cacheSet: (key: string, value: unknown, ttl?: number) => Promise<void>;
export declare const cacheDel: (key: string) => Promise<void>;
export declare const cacheDelPattern: (pattern: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map