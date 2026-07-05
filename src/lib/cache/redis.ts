import { createHash } from "crypto";

// Declare global variables to persist in-memory fallback cache across hot-reloads in Next.js
declare global {
    var _inMemoryCache: Record<string, any> | undefined;
    var _inMemoryLists: Record<string, string[]> | undefined;
}

const localCache = globalThis._inMemoryCache || {};
const localLists = globalThis._inMemoryLists || {};

if (process.env.NODE_ENV !== "production") {
    globalThis._inMemoryCache = localCache;
    globalThis._inMemoryLists = localLists;
}

// Wrapper object that simulates Redis commands locally using pure in-memory cache
export const redis = {
    get: async <T>(key: string): Promise<T | null> => {
        return (localCache[key] as T) || null;
    },
    set: async (key: string, value: any, options?: any): Promise<void> => {
        localCache[key] = value;
    },
    lpush: async (key: string, value: string): Promise<number> => {
        if (!localLists[key]) {
            localLists[key] = [];
        }
        localLists[key].unshift(value); // LPUSH prepends to list
        return localLists[key].length;
    },
    lrange: async (key: string, start: number, stop: number): Promise<string[]> => {
        const list = localLists[key] || [];
        const actualStop = stop === -1 ? list.length : stop + 1;
        return list.slice(start, actualStop);
    },
    del: async (key: string): Promise<number> => {
        let count = 0;
        if (key in localCache) {
            delete localCache[key];
            count++;
        }
        if (key in localLists) {
            delete localLists[key];
            count++;
        }
        return count;
    }
};

/**
 * Generates a SHA-256 hash for normalized content to be used as a cache key.
 */
export function hashNormalizedContent(type: string, content: any, version: string = "v1"): string {
    const normalized = JSON.stringify({
        type,
        content,
        version
    });
    return createHash("sha256").update(normalized).digest("hex");
}

export async function getCachedResult<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get<T>(key);
        if (data) {
            console.log(`[CACHE_HIT] Key: ${key.substring(0, 8)}...`);
        } else {
            console.log(`[CACHE_MISS] Key: ${key.substring(0, 8)}...`);
        }
        return data;
    } catch (error) {
        console.error("[REDIS_ERROR] Failed to get cache:", error);
        return null;
    }
}

export async function setCachedResult(key: string, value: any, ttlInSeconds: number = 86400): Promise<void> {
    try {
        await redis.set(key, value, { ex: ttlInSeconds });
    } catch (error) {
        console.error("[REDIS_ERROR] Failed to set cache:", error);
    }
}
