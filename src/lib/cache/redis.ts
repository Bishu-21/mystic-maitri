import { Redis } from "@upstash/redis";
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

// Safely initialize the Upstash Redis client. If credentials are missing, we log a warning and use the memory fallback.
let redisClient: Redis | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisClient = Redis.fromEnv();
    } else {
        console.warn("[REDIS] Missing Upstash Redis environment variables. Falling back to local in-memory store.");
    }
} catch (e) {
    console.error("[REDIS_INIT_ERROR] Failed to initialize Redis client:", e);
}

// Wrapper class that simulates redis commands using memory fallback when Redis is offline or unconfigured
export const redis = {
    get: async <T>(key: string): Promise<T | null> => {
        try {
            if (redisClient) {
                return await redisClient.get<T>(key);
            }
        } catch (e) {
            console.error(`[REDIS_GET_ERROR] Failed to fetch key "${key}", falling back to memory:`, e);
        }
        return (localCache[key] as T) || null;
    },
    set: async (key: string, value: any, options?: any): Promise<void> => {
        try {
            if (redisClient) {
                await redisClient.set(key, value, options);
                return;
            }
        } catch (e) {
            console.error(`[REDIS_SET_ERROR] Failed to set key "${key}", falling back to memory:`, e);
        }
        localCache[key] = value;
    },
    lpush: async (key: string, value: string): Promise<number> => {
        try {
            if (redisClient) {
                return await redisClient.lpush(key, value);
            }
        } catch (e) {
            console.error(`[REDIS_LPUSH_ERROR] Failed to lpush key "${key}", falling back to memory:`, e);
        }
        if (!localLists[key]) {
            localLists[key] = [];
        }
        localLists[key].unshift(value); // LPUSH prepends to list
        return localLists[key].length;
    },
    lrange: async (key: string, start: number, stop: number): Promise<string[]> => {
        try {
            if (redisClient) {
                return await redisClient.lrange(key, start, stop);
            }
        } catch (e) {
            console.error(`[REDIS_LRANGE_ERROR] Failed to lrange key "${key}", falling back to memory:`, e);
        }
        const list = localLists[key] || [];
        const actualStop = stop === -1 ? list.length : stop + 1;
        return list.slice(start, actualStop);
    },
    del: async (key: string): Promise<number> => {
        try {
            if (redisClient) {
                return await redisClient.del(key);
            }
        } catch (e) {
            console.error(`[REDIS_DEL_ERROR] Failed to del key "${key}", falling back to memory:`, e);
        }
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
