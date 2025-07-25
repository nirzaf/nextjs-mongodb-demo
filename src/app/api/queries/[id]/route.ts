import { NextRequest, NextResponse } from 'next/server';
import { QUERY_DEFINITIONS } from '@/lib/queries/definitions';
import { withApiMiddleware, commonErrors } from '@/lib/middleware';

async function getQueryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find query by ID instead of by key
  const query = Object.values(QUERY_DEFINITIONS).find(q => q.id === id);

  if (!query) {
    throw commonErrors.notFound(`Query with id '${id}'`);
  }

  return NextResponse.json({
    success: true,
    data: query
  });
}

export const GET = withApiMiddleware(getQueryHandler);
