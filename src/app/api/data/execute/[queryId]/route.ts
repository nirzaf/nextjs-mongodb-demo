import { NextRequest, NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import { QueryExecutor } from '@/lib/queries/executor';
import { withApiMiddleware } from '@/lib/middleware';

async function executeQueryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
  try {
    console.log('=== API Route Handler Started ===');

    await connectDatabase();
    console.log('Database connected successfully');

    const { queryId } = await params;
    console.log('Query ID:', queryId);

    const body = await request.json();
    console.log('Request body:', body);

    const { parameters = {} } = body;
    console.log(`Executing query: ${queryId} with parameters:`, parameters);

    const result = await QueryExecutor.executeQuery(queryId, parameters);
    console.log('Query executed successfully, result:', result);

    return NextResponse.json({
      success: true,
      queryId,
      parameters,
      result: result.data,
      metadata: {
        executionTime: result.executionTime,
        count: result.count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('=== API Route Handler Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Re-throw the error so the middleware can handle it
    throw error;
  }
}

export const POST = withApiMiddleware(executeQueryHandler);
