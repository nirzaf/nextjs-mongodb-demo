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
    data: result.data,
    metadata: {
      queryId,
      executionTime: result.executionTime,
      resultCount: result.count,
      parameters
    }
  });
}

export const POST = withApiMiddleware(executeQueryHandler);
