import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

export const redis = Redis.fromEnv();

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
