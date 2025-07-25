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
    const { query, operation = 'find', options = {} } = body;

    // Validate collection
    const ModelClass = COLLECTIONS[collection.toLowerCase() as keyof typeof COLLECTIONS];
    if (!ModelClass) {
      throw commonErrors.badRequest(
        `Collection '${collection}' is not supported. Supported collections: ${Object.keys(COLLECTIONS).join(', ')}`
      );
    }

    // Validate operation
    const allowedOperations = ['find', 'findOne', 'aggregate', 'countDocuments'];
    if (!allowedOperations.includes(operation)) {
      throw commonErrors.badRequest(
        `Operation '${operation}' is not allowed. Allowed operations: ${allowedOperations.join(', ')}`
      );
    }

    // Validate query structure
    if (operation === 'aggregate') {
      if (!Array.isArray(query)) {
        throw commonErrors.badRequest('Aggregation query must be an array of pipeline stages');
      }
    } else {
      if (!query || typeof query !== 'object') {
        throw commonErrors.badRequest('Query must be a valid MongoDB query object');
      }
    }

    // Check for forbidden operations in query
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

    // Execute the query based on operation
    let result;

    switch (operation) {
      case 'aggregate':
        result = await ModelClass.aggregate(query);
        break;

      case 'findOne':
        result = await (ModelClass as Model<unknown>).findOne(query).lean();
        break;

      case 'countDocuments':
        result = await (ModelClass as Model<unknown>).countDocuments(query);
        break;

      case 'find':
      default:
        let mongoQuery = (ModelClass as Model<unknown>).find(query).lean();

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
        break;
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      collection,
      operation,
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
