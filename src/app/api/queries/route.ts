import { NextRequest, NextResponse } from 'next/server';
import { QUERY_DEFINITIONS } from '@/lib/queries/definitions';
import { withApiMiddleware } from '@/lib/middleware';

async function getQueriesHandler(request: NextRequest) {
  const queries = Object.values(QUERY_DEFINITIONS).map(query => ({
    id: query.id,
    title: query.title,
    description: query.description,
    difficulty: query.difficulty,
    category: query.category,
    mongodbConcepts: query.mongodbConcepts
  }));

  return NextResponse.json({
    success: true,
    data: queries,
    total: queries.length
  });
}

export const GET = withApiMiddleware(getQueriesHandler);
