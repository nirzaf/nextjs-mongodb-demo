import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(options: {
    windowMs?: number;
    maxRequests?: number;
    message?: string;
  } = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100;
    this.message = options.message || 'Too many requests from this IP, please try again later.';
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    // Fallback for development
    return 'unknown';
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  public checkLimit(request: NextRequest): { 
    allowed: boolean; 
    remaining: number; 
    resetTime: number;
    error?: NextResponse;
  } {
    const clientIP = this.getClientIP(request);
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup
      this.cleanupExpiredEntries();
    }

    // Initialize or get existing entry
    if (!this.store[clientIP] || this.store[clientIP].resetTime <= now) {
      this.store[clientIP] = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }

    const entry = this.store[clientIP];
    entry.count++;

    const remaining = Math.max(0, this.maxRequests - entry.count);
    const allowed = entry.count <= this.maxRequests;

    if (!allowed) {
      const error = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: this.message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': this.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
          }
        }
      );
      
      return { allowed: false, remaining: 0, resetTime: entry.resetTime, error };
    }

    return { allowed: true, remaining, resetTime: entry.resetTime };
  }

  public addHeaders(response: NextResponse, remaining: number, resetTime: number): NextResponse {
    response.headers.set('X-RateLimit-Limit', this.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
    return response;
  }
}

// Create default rate limiter instance
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Create stricter rate limiter for custom queries
export const customQueryRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // limit each IP to 20 custom queries per 5 minutes
  message: 'Too many custom queries from this IP, please try again later.'
});

// Middleware function to apply rate limiting
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  limiter: RateLimiter = apiRateLimiter
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const { allowed, remaining, resetTime, error } = limiter.checkLimit(request);
    
    if (!allowed && error) {
      return error;
    }
    
    try {
      const response = await handler(request, ...args);
      return limiter.addHeaders(response, remaining, resetTime);
    } catch (err) {
      // Even on error, we should add rate limit headers
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      );
      return limiter.addHeaders(errorResponse, remaining, resetTime);
    }
  };
}
