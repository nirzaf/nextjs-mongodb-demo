import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, apiRateLimiter, customQueryRateLimiter } from './rateLimit';
import { withSecurity, apiSecurity } from './security';
import { withLogging, requestLogger } from './logging';
import { withErrorHandling } from './errorHandler';
import { withCors, apiCorsHandler } from './cors';

// Export all middleware components
export * from './rateLimit';
export * from './security';
export * from './logging';
export * from './errorHandler';
export * from './cors';

// Middleware composition utility
export function composeMiddleware(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  middlewares: Array<(handler: any) => any>
): (request: NextRequest, ...args: any[]) => Promise<NextResponse> {
  return middlewares.reduceRight(
    (acc, middleware) => middleware(acc),
    handler
  );
}

// Pre-configured middleware stacks

/**
 * Standard API middleware stack with all security features
 * Includes: CORS, Security Headers, Rate Limiting, Logging, Error Handling
 */
export function withApiMiddleware(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return composeMiddleware(handler, [
    withErrorHandling,
    withLogging,
    (h) => withRateLimit(h, apiRateLimiter),
    (h) => withSecurity(h, apiSecurity),
    (h) => withCors(h, apiCorsHandler)
  ]);
}

/**
 * Custom query middleware stack with stricter rate limiting
 * Includes: CORS, Security Headers, Strict Rate Limiting, Logging, Error Handling
 */
export function withCustomQueryMiddleware(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return composeMiddleware(handler, [
    withErrorHandling,
    withLogging,
    (h) => withRateLimit(h, customQueryRateLimiter),
    (h) => withSecurity(h, apiSecurity),
    (h) => withCors(h, apiCorsHandler)
  ]);
}

/**
 * Lightweight middleware stack for health checks and simple endpoints
 * Includes: CORS, Basic Security Headers, Logging
 */
export function withLightMiddleware(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return composeMiddleware(handler, [
    withErrorHandling,
    withLogging,
    (h) => withSecurity(h, apiSecurity),
    (h) => withCors(h, apiCorsHandler)
  ]);
}

/**
 * Development middleware stack with enhanced logging
 * Includes: All middleware with debug logging enabled
 */
export function withDevMiddleware(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  const devLogger = requestLogger;
  
  return composeMiddleware(handler, [
    withErrorHandling,
    (h) => withLogging(h, devLogger),
    (h) => withRateLimit(h, apiRateLimiter),
    (h) => withSecurity(h, apiSecurity),
    (h) => withCors(h, apiCorsHandler)
  ]);
}

// Utility functions for common middleware patterns

/**
 * Apply middleware only to specific HTTP methods
 */
export function withMethodFilter(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  allowedMethods: string[]
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Method Not Allowed',
          message: `Method ${request.method} is not allowed for this endpoint`,
          allowedMethods
        },
        { 
          status: 405,
          headers: {
            'Allow': allowedMethods.join(', ')
          }
        }
      );
    }
    
    return handler(request, ...args);
  };
}

/**
 * Apply middleware with request size limits
 */
export function withRequestSizeLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Too Large',
          message: `Request size exceeds maximum allowed size of ${maxSizeBytes} bytes`,
          maxSize: maxSizeBytes
        },
        { status: 413 }
      );
    }
    
    return handler(request, ...args);
  };
}

/**
 * Apply middleware with timeout protection
 */
export function withTimeout(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  timeoutMs: number = 30000 // 30 seconds default
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    try {
      return await Promise.race([
        handler(request, ...args),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request Timeout',
            message: 'The request took too long to process',
            timeout: timeoutMs
          },
          { status: 408 }
        );
      }
      throw error;
    }
  };
}

// Environment-specific middleware selection
export function getMiddlewareForEnvironment() {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return withDevMiddleware;
    case 'production':
      return withApiMiddleware;
    case 'test':
      return withLightMiddleware;
    default:
      return withApiMiddleware;
  }
}
