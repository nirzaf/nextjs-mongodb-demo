import { NextRequest, NextResponse } from 'next/server';
import { ensureIndexes, recreateIndexes } from '@/lib/database/ensureIndexes';
import { withApiMiddleware } from '@/lib/middleware';

async function ensureIndexesHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recreate = searchParams.get('recreate') === 'true';
  
  try {
    let success;
    
    if (recreate) {
      console.log('Recreating all database indexes...');
      success = await recreateIndexes();
    } else {
      console.log('Ensuring database indexes exist...');
      success = await ensureIndexes();
    }
    
    return NextResponse.json({
      success,
      message: success 
        ? `Database indexes ${recreate ? 'recreated' : 'ensured'} successfully`
        : 'Failed to create database indexes',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in ensure-indexes endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create database indexes',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export const POST = withApiMiddleware(ensureIndexesHandler);
