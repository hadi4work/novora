import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!ratelimit) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "novora:ratelimit",
    });
  }

  return ratelimit;
}

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const limiter = getRatelimit();

  if (!limiter) {
    return { success: true, remaining: 10 };
  }

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
