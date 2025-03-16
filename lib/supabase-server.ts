import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const MAX_REQUESTS = 30; // Maximum requests per minute
const RETRY_AFTER = 2000; // Wait 2 seconds between retries

interface RateLimitState {
  requests: number;
  windowStart: number;
}

const rateLimitState: RateLimitState = {
  requests: 0,
  windowStart: Date.now()
};

// Reset rate limit window if needed
const checkRateLimit = () => {
  const now = Date.now();
  if (now - rateLimitState.windowStart >= RATE_LIMIT_WINDOW) {
    rateLimitState.requests = 0;
    rateLimitState.windowStart = now;
  }
};

// Wrapper function to add rate limiting
const withRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
  checkRateLimit();
  
  if (rateLimitState.requests >= MAX_REQUESTS) {
    console.log('Rate limit reached, waiting before retry...');
    await new Promise(resolve => setTimeout(resolve, RETRY_AFTER));
    return withRateLimit(fn);
  }
  
  try {
    rateLimitState.requests++;
    return await fn();
  } catch (error: any) {
    if (error?.status === 429) {
      console.log('Rate limit error from Supabase, retrying...');
      await new Promise(resolve => setTimeout(resolve, RETRY_AFTER));
      return withRateLimit(fn);
    }
    throw error;
  }
};

// Server-side Supabase client (for API routes and server components)
export const createServerClient = () => {
  const client = createServerComponentClient({ cookies });
  
  // Wrap auth methods with rate limiting
  const originalAuth = client.auth;
  client.auth = new Proxy(originalAuth, {
    get(target, prop) {
      const original = target[prop as keyof typeof target];
      if (typeof original === 'function') {
        return async (...args: any[]) => {
          return withRateLimit(() => original.apply(target, args));
        };
      }
      return original;
    }
  });
  
  return client;
};
