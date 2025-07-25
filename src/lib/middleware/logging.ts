import { NextRequest, NextResponse } from 'next/server';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  referer?: string;
  error?: string;
}

class RequestLogger {
  private logLevel: LogLevel;
  private includeUserAgent: boolean;
  private includeReferer: boolean;
  private colorize: boolean;

  constructor(options: {
    logLevel?: LogLevel;
    includeUserAgent?: boolean;
    includeReferer?: boolean;
    colorize?: boolean;
  } = {}) {
    this.logLevel = options.logLevel || 'info';
    this.includeUserAgent = options.includeUserAgent ?? true;
    this.includeReferer = options.includeReferer ?? true;
    this.colorize = options.colorize ?? true;
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
    
    return 'unknown';
  }

  private getStatusColor(status: number): string {
    if (!this.colorize) return '';
    
    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[0m'; // Reset
  }

  private getMethodColor(method: string): string {
    if (!this.colorize) return '';
    
    switch (method.toUpperCase()) {
      case 'GET': return '\x1b[32m'; // Green
      case 'POST': return '\x1b[33m'; // Yellow
      case 'PUT': return '\x1b[34m'; // Blue
      case 'DELETE': return '\x1b[31m'; // Red
      case 'PATCH': return '\x1b[35m'; // Magenta
      default: return '\x1b[0m'; // Reset
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const {
      timestamp,
      method,
      url,
      userAgent,
      ip,
      statusCode,
      responseTime,
      contentLength,
      referer,
      error
    } = entry;

    const methodColor = this.getMethodColor(method);
    const statusColor = statusCode ? this.getStatusColor(statusCode) : '';
    const resetColor = this.colorize ? '\x1b[0m' : '';

    let logLine = `${timestamp} ${methodColor}${method}${resetColor} ${url}`;
    
    if (statusCode) {
      logLine += ` ${statusColor}${statusCode}${resetColor}`;
    }
    
    if (responseTime !== undefined) {
      logLine += ` ${responseTime}ms`;
    }
    
    if (contentLength !== undefined) {
      logLine += ` ${contentLength}b`;
    }
    
    logLine += ` - ${ip}`;
    
    if (this.includeUserAgent && userAgent) {
      logLine += ` "${userAgent}"`;
    }
    
    if (this.includeReferer && referer) {
      logLine += ` "${referer}"`;
    }
    
    if (error) {
      logLine += ` ERROR: ${error}`;
    }

    return logLine;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  public logRequest(entry: LogEntry, level: LogLevel = 'info'): void {
    if (!this.shouldLog(level)) return;

    const formattedLog = this.formatLogEntry(entry);
    
    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }

  public createLogEntry(
    request: NextRequest,
    response?: NextResponse,
    startTime?: number,
    error?: Error
  ): LogEntry {
    const timestamp = new Date().toISOString();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = this.getClientIP(request);
    const referer = request.headers.get('referer') || undefined;
    
    const entry: LogEntry = {
      timestamp,
      method,
      url,
      ip,
      userAgent: this.includeUserAgent ? userAgent : undefined,
      referer: this.includeReferer ? referer : undefined
    };

    if (response) {
      entry.statusCode = response.status;
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        entry.contentLength = parseInt(contentLength, 10);
      }
    }

    if (startTime) {
      entry.responseTime = Date.now() - startTime;
    }

    if (error) {
      entry.error = error.message;
    }

    return entry;
  }
}

// Create default logger instance
export const requestLogger = new RequestLogger({
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  colorize: process.env.NODE_ENV === 'development'
});

// Middleware function to apply request logging
export function withLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  logger: RequestLogger = requestLogger
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      const response = await handler(request, ...args);
      
      // Log successful request
      const logEntry = logger.createLogEntry(request, response, startTime);
      const level: LogLevel = response.status >= 400 ? 'warn' : 'info';
      logger.logRequest(logEntry, level);
      
      return response;
    } catch (error) {
      // Log error request
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        },
        { status: 500 }
      );
      
      const logEntry = logger.createLogEntry(
        request, 
        errorResponse, 
        startTime, 
        error instanceof Error ? error : new Error(String(error))
      );
      logger.logRequest(logEntry, 'error');
      
      return errorResponse;
    }
  };
}
