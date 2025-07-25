import { NextRequest, NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import { QueryExecutor } from '@/lib/queries/executor';
import { withApiMiddleware } from '@/lib/middleware';

async function executeQueryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
  await connectDatabase();

  const { queryId } = await params;
  const body = await request.json();
  const { parameters = {} } = body;

  const result = await QueryExecutor.executeQuery(queryId, parameters);

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
}

export const POST = withApiMiddleware(executeQueryHandler);
