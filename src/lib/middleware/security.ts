import { NextRequest, NextResponse } from 'next/server';

export interface SecurityOptions {
  contentSecurityPolicy?: boolean | string;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean | string;
  dnsPrefetchControl?: boolean;
  frameguard?: boolean | string;
  hidePoweredBy?: boolean;
  hsts?: boolean | {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean | string;
  referrerPolicy?: boolean | string;
  xssFilter?: boolean;
}

class SecurityHeaders {
  private options: SecurityOptions;

  constructor(options: SecurityOptions = {}) {
    this.options = {
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: true,
      xssFilter: true,
      ...options
    };
  }

  private getCSPDirective(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  public applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.options.contentSecurityPolicy) {
      const csp = typeof this.options.contentSecurityPolicy === 'string' 
        ? this.options.contentSecurityPolicy 
        : this.getCSPDirective();
      response.headers.set('Content-Security-Policy', csp);
    }

    // Cross-Origin Embedder Policy
    if (this.options.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    // Cross-Origin Opener Policy
    if (this.options.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    }

    // Cross-Origin Resource Policy
    if (this.options.crossOriginResourcePolicy) {
      const policy = typeof this.options.crossOriginResourcePolicy === 'string'
        ? this.options.crossOriginResourcePolicy
        : 'same-origin';
      response.headers.set('Cross-Origin-Resource-Policy', policy);
    }

    // DNS Prefetch Control
    if (this.options.dnsPrefetchControl) {
      response.headers.set('X-DNS-Prefetch-Control', 'off');
    }

    // Frame Options (X-Frame-Options)
    if (this.options.frameguard) {
      const frameOption = typeof this.options.frameguard === 'string'
        ? this.options.frameguard
        : 'DENY';
      response.headers.set('X-Frame-Options', frameOption);
    }

    // Hide Powered By
    if (this.options.hidePoweredBy) {
      response.headers.delete('X-Powered-By');
      response.headers.set('X-Powered-By', 'Next.js');
    }

    // HTTP Strict Transport Security
    if (this.options.hsts) {
      let hstsValue = 'max-age=31536000'; // 1 year default
      
      if (typeof this.options.hsts === 'object') {
        const { maxAge = 31536000, includeSubDomains = true, preload = false } = this.options.hsts;
        hstsValue = `max-age=${maxAge}`;
        if (includeSubDomains) hstsValue += '; includeSubDomains';
        if (preload) hstsValue += '; preload';
      }
      
      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // IE No Open
    if (this.options.ieNoOpen) {
      response.headers.set('X-Download-Options', 'noopen');
    }

    // No Sniff
    if (this.options.noSniff) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Origin Agent Cluster
    if (this.options.originAgentCluster) {
      response.headers.set('Origin-Agent-Cluster', '?1');
    }

    // Permitted Cross Domain Policies
    if (this.options.permittedCrossDomainPolicies) {
      const policy = typeof this.options.permittedCrossDomainPolicies === 'string'
        ? this.options.permittedCrossDomainPolicies
        : 'none';
      response.headers.set('X-Permitted-Cross-Domain-Policies', policy);
    }

    // Referrer Policy
    if (this.options.referrerPolicy) {
      const policy = typeof this.options.referrerPolicy === 'string'
        ? this.options.referrerPolicy
        : 'no-referrer';
      response.headers.set('Referrer-Policy', policy);
    }

    // XSS Filter
    if (this.options.xssFilter) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    return response;
  }
}

// Create default security headers instance
export const defaultSecurity = new SecurityHeaders();

// Create API-specific security headers (more permissive for API endpoints)
export const apiSecurity = new SecurityHeaders({
  contentSecurityPolicy: false, // APIs don't need CSP
  frameguard: false, // APIs don't need frame protection
  crossOriginResourcePolicy: 'cross-origin', // Allow cross-origin for API
});

// Middleware function to apply security headers
export function withSecurity(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  security: SecurityHeaders = apiSecurity
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const response = await handler(request, ...args);
      return security.applyHeaders(response);
    } catch (err) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      );
      return security.applyHeaders(errorResponse);
    }
  };
}
