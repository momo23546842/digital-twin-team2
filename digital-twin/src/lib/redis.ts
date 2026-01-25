import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    "Upstash Redis credentials are not defined in environment variables"
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Store a value in Redis with optional TTL (in seconds)
 */
export async function setRedisValue(
  key: string,
  value: string | object,
  ttl?: number
) {
  try {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error("Redis set error:", error);
    throw error;
  }
}

/**
 * Retrieve a value from Redis
 */
export async function getRedisValue(key: string) {
  try {
    const value = await redis.get(key);
    return value ? (typeof value === "string" ? JSON.parse(value) : value) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    throw error;
  }
}

/**
 * Delete a value from Redis
 */
export async function deleteRedisValue(key: string) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
    throw error;
  }
}

/**
 * Rate limit check using Redis
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const key = `rate-limit:${userId}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    return current <= limit;
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open on error
    return true;
  }
}
