import { NextRequest, NextResponse } from 'next/server';
import { withLightMiddleware } from '@/lib/middleware';

async function healthHandler(request: NextRequest) {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
}

export const GET = withLightMiddleware(healthHandler);
