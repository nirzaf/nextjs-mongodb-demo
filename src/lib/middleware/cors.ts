import { NextRequest, NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

class CorsHandler {
  private options: Required<CorsOptions>;

  constructor(options: CorsOptions = {}) {
    this.options = {
      origin: options.origin ?? this.getDefaultOrigin(),
      methods: options.methods ?? ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: options.allowedHeaders ?? [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      ],
      exposedHeaders: options.exposedHeaders ?? [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
      ],
      credentials: options.credentials ?? true,
      maxAge: options.maxAge ?? 86400, // 24 hours
      preflightContinue: options.preflightContinue ?? false,
      optionsSuccessStatus: options.optionsSuccessStatus ?? 204
    };
  }

  private getDefaultOrigin(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://your-domain.com',
        'https://www.your-domain.com'
      ];
    }
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
  }

  private isOriginAllowed(origin: string): boolean {
    const { origin: allowedOrigin } = this.options;

    if (allowedOrigin === true) {
      return true;
    }

    if (allowedOrigin === false) {
      return false;
    }

    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    }

    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.includes(origin);
    }

    if (typeof allowedOrigin === 'function') {
      return allowedOrigin(origin);
    }

    return false;
  }

  private setOriginHeader(response: NextResponse, request: NextRequest): void {
    const origin = request.headers.get('origin');
    
    if (!origin) {
      // No origin header (same-origin request or non-browser request)
      if (this.options.origin === true) {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }
      return;
    }

    if (this.isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
  }

  private setCredentialsHeader(response: NextResponse): void {
    if (this.options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  private setMethodsHeader(response: NextResponse): void {
    response.headers.set('Access-Control-Allow-Methods', this.options.methods.join(', '));
  }

  private setAllowedHeadersHeader(response: NextResponse, request: NextRequest): void {
    const requestedHeaders = request.headers.get('access-control-request-headers');
    
    if (requestedHeaders) {
      // Use requested headers if they're all allowed
      const requested = requestedHeaders.split(',').map(h => h.trim());
      const allowed = requested.filter(header => 
        this.options.allowedHeaders.some(allowed => 
          allowed.toLowerCase() === header.toLowerCase()
        )
      );
      
      if (allowed.length === requested.length) {
        response.headers.set('Access-Control-Allow-Headers', requestedHeaders);
      } else {
        response.headers.set('Access-Control-Allow-Headers', this.options.allowedHeaders.join(', '));
      }
    } else {
      response.headers.set('Access-Control-Allow-Headers', this.options.allowedHeaders.join(', '));
    }
  }

  private setExposedHeadersHeader(response: NextResponse): void {
    if (this.options.exposedHeaders.length > 0) {
      response.headers.set('Access-Control-Expose-Headers', this.options.exposedHeaders.join(', '));
    }
  }

  private setMaxAgeHeader(response: NextResponse): void {
    response.headers.set('Access-Control-Max-Age', this.options.maxAge.toString());
  }

  public handlePreflight(request: NextRequest): NextResponse {
    const response = new NextResponse(null, { 
      status: this.options.optionsSuccessStatus 
    });

    this.setOriginHeader(response, request);
    this.setCredentialsHeader(response);
    this.setMethodsHeader(response);
    this.setAllowedHeadersHeader(response, request);
    this.setMaxAgeHeader(response);

    return response;
  }

  public applyCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
    this.setOriginHeader(response, request);
    this.setCredentialsHeader(response);
    this.setExposedHeadersHeader(response);

    return response;
  }

  public isPreflightRequest(request: NextRequest): boolean {
    return request.method === 'OPTIONS' && 
           request.headers.has('access-control-request-method');
  }
}

// Create default CORS handler instance
export const corsHandler = new CorsHandler();

// Create API-specific CORS handler (more permissive)
export const apiCorsHandler = new CorsHandler({
  origin: true, // Allow all origins for API
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key'
  ]
});

// Middleware function to apply CORS
export function withCors(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  corsHandlerInstance: CorsHandler = corsHandler
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Handle preflight requests
    if (corsHandlerInstance.isPreflightRequest(request)) {
      return corsHandlerInstance.handlePreflight(request);
    }

    try {
      const response = await handler(request, ...args);
      return corsHandlerInstance.applyCorsHeaders(response, request);
    } catch (error) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      );
      return corsHandlerInstance.applyCorsHeaders(errorResponse, request);
    }
  };
}
