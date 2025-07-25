import { NextRequest, NextResponse } from 'next/server';
import { Model } from 'mongoose';
import { connectDatabase } from '@/lib/database';
import {
  User,
  Company,
  JobSeekerProfile,
  EmployerProfile,
  Job,
  Application
} from '@/lib/models';
import { withCustomQueryMiddleware, commonErrors } from '@/lib/middleware';

// Collection mapping
const COLLECTIONS = {
  users: User,
  companies: Company,
  jobseekerprofiles: JobSeekerProfile,
  employerprofiles: EmployerProfile,
  jobs: Job,
  applications: Application
};

// Safety restrictions for custom queries
const FORBIDDEN_OPERATIONS = [
  'deleteOne', 'deleteMany', 'remove',
  'updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndDelete',
  'replaceOne', 'insertOne', 'insertMany', 'create', 'save',
  'drop', 'dropCollection', 'dropDatabase'
];

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

async function executeCustomQueryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  await connectDatabase();
    
    const { collection } = await params;
    const body = await request.json();
    const { query, options = {} } = body;
    
    // Validate collection
    const ModelClass = COLLECTIONS[collection.toLowerCase() as keyof typeof COLLECTIONS];
    if (!ModelClass) {
      throw commonErrors.badRequest(
        `Collection '${collection}' is not supported. Supported collections: ${Object.keys(COLLECTIONS).join(', ')}`
      );
    }

    // Validate query structure
    if (!query || typeof query !== 'object') {
      throw commonErrors.badRequest('Query must be a valid MongoDB query object');
    }

    // Check for forbidden operations
    const queryString = JSON.stringify(query);
    const hasForbiddenOp = FORBIDDEN_OPERATIONS.some(op =>
      queryString.includes(op) || queryString.includes(`$${op}`)
    );

    if (hasForbiddenOp) {
      throw commonErrors.forbidden('Only read operations are allowed');
    }
    
    // Apply safety limits
    const safeOptions = {
      ...options,
      limit: Math.min(options.limit || DEFAULT_LIMIT, MAX_LIMIT)
    };
    
    const startTime = Date.now();
    
    // Execute the query
    let result;
    if (query.aggregate && Array.isArray(query.aggregate)) {
      // Handle aggregation pipeline
      result = await ModelClass.aggregate(query.aggregate);
    } else {
      // Handle regular find query
      let mongoQuery = (ModelClass as Model<unknown>).find(query);
      
      // Apply options
      if (safeOptions.select) {
        mongoQuery = mongoQuery.select(safeOptions.select);
      }
      if (safeOptions.populate) {
        mongoQuery = mongoQuery.populate(safeOptions.populate);
      }
      if (safeOptions.sort) {
        mongoQuery = mongoQuery.sort(safeOptions.sort);
      }
      if (safeOptions.limit) {
        mongoQuery = mongoQuery.limit(safeOptions.limit);
      }
      if (safeOptions.skip) {
        mongoQuery = mongoQuery.skip(safeOptions.skip);
      }
      
      result = await mongoQuery.exec();
    }
    
    const executionTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      collection,
      query,
      options: safeOptions,
      result,
      metadata: {
        executionTime,
        count: Array.isArray(result) ? result.length : (result ? 1 : 0),
        timestamp: new Date().toISOString()
      }
    });
}

export const POST = withCustomQueryMiddleware(executeCustomQueryHandler);
