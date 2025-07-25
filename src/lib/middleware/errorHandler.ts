import { NextRequest, NextResponse } from 'next/server';
import { Error as MongooseError } from 'mongoose';

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp?: string;
}

export class CustomApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'CustomApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ErrorHandler {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private handleValidationError(error: MongooseError.ValidationError): ApiError {
    const details = Object.keys(error.errors).reduce((acc, key) => {
      const err = error.errors[key];
      acc[key] = {
        message: err.message,
        value: (err as any).value,
        kind: (err as any).kind
      };
      return acc;
    }, {} as any);

    return {
      success: false,
      error: 'Validation Error',
      message: 'The provided data is invalid',
      details,
      statusCode: 400,
      timestamp: new Date().toISOString()
    };
  }

  private handleCastError(error: MongooseError.CastError): ApiError {
    return {
      success: false,
      error: 'Invalid ID Format',
      message: `Invalid ${error.path}: ${error.value}`,
      details: {
        path: error.path,
        value: error.value,
        kind: error.kind
      },
      statusCode: 400,
      timestamp: new Date().toISOString()
    };
  }

  private handleDuplicateKeyError(error: any): ApiError {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];

    return {
      success: false,
      error: 'Duplicate Field Value',
      message: `${field} '${value}' already exists`,
      details: {
        field,
        value,
        code: error.code
      },
      statusCode: 409,
      timestamp: new Date().toISOString()
    };
  }

  private handleJsonWebTokenError(): ApiError {
    return {
      success: false,
      error: 'Invalid Token',
      message: 'Please log in again',
      statusCode: 401,
      timestamp: new Date().toISOString()
    };
  }

  private handleTokenExpiredError(): ApiError {
    return {
      success: false,
      error: 'Token Expired',
      message: 'Your token has expired. Please log in again',
      statusCode: 401,
      timestamp: new Date().toISOString()
    };
  }

  private handleMongoServerError(error: any): ApiError {
    return {
      success: false,
      error: 'Database Error',
      message: 'A database error occurred',
      details: this.isDevelopment ? {
        code: error.code,
        codeName: error.codeName
      } : undefined,
      statusCode: 500,
      timestamp: new Date().toISOString()
    };
  }

  private handleCustomApiError(error: CustomApiError): ApiError {
    return {
      success: false,
      error: error.name,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    };
  }

  private handleGenericError(error: Error): ApiError {
    console.error('Unhandled error:', error);

    return {
      success: false,
      error: 'Internal Server Error',
      message: this.isDevelopment 
        ? error.message 
        : 'Something went wrong on our end',
      details: this.isDevelopment ? {
        stack: error.stack,
        name: error.name
      } : undefined,
      statusCode: 500,
      timestamp: new Date().toISOString()
    };
  }

  public handleError(error: any): { apiError: ApiError; statusCode: number } {
    let apiError: ApiError;

    // Handle different types of errors
    if (error instanceof CustomApiError) {
      apiError = this.handleCustomApiError(error);
    } else if (error instanceof MongooseError.ValidationError) {
      apiError = this.handleValidationError(error);
    } else if (error instanceof MongooseError.CastError) {
      apiError = this.handleCastError(error);
    } else if (error.code === 11000) {
      // MongoDB duplicate key error
      apiError = this.handleDuplicateKeyError(error);
    } else if (error.name === 'JsonWebTokenError') {
      apiError = this.handleJsonWebTokenError();
    } else if (error.name === 'TokenExpiredError') {
      apiError = this.handleTokenExpiredError();
    } else if (error.name === 'MongoServerError') {
      apiError = this.handleMongoServerError(error);
    } else if (error instanceof Error) {
      apiError = this.handleGenericError(error);
    } else {
      // Handle non-Error objects
      apiError = this.handleGenericError(new Error(String(error)));
    }

    return {
      apiError,
      statusCode: apiError.statusCode || 500
    };
  }

  public createErrorResponse(error: any): NextResponse {
    const { apiError, statusCode } = this.handleError(error);
    return NextResponse.json(apiError, { status: statusCode });
  }
}

// Create default error handler instance
export const errorHandler = new ErrorHandler();

// Middleware function to apply error handling
export function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return errorHandler.createErrorResponse(error);
    }
  };
}

// Utility function to throw custom API errors
export function throwApiError(message: string, statusCode: number = 500, details?: any): never {
  throw new CustomApiError(message, statusCode, details);
}

// Common error responses
export const commonErrors = {
  notFound: (resource: string = 'Resource') => 
    new CustomApiError(`${resource} not found`, 404),
  
  unauthorized: (message: string = 'Unauthorized access') => 
    new CustomApiError(message, 401),
  
  forbidden: (message: string = 'Access forbidden') => 
    new CustomApiError(message, 403),
  
  badRequest: (message: string = 'Bad request') => 
    new CustomApiError(message, 400),
  
  conflict: (message: string = 'Resource conflict') => 
    new CustomApiError(message, 409),
  
  tooManyRequests: (message: string = 'Too many requests') => 
    new CustomApiError(message, 429),
  
  internalServer: (message: string = 'Internal server error') => 
    new CustomApiError(message, 500)
};
