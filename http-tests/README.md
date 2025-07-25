# MongoDB Demo API - HTTP Test Files

This directory contains comprehensive HTTP test files for testing all API endpoints in the MongoDB Demo project.

## Prerequisites

1. **Start the API Server**:
   ```bash
   npm run api
   # or
   npm run dev:api
   ```
   The server should be running on `http://localhost:3001`

2. **Seed the Database** (if not already done):
   ```bash
   npm run seed
   ```

3. **HTTP Client**: Use any HTTP client that supports `.http` files:
   - **VS Code**: Install "REST Client" extension
   - **IntelliJ IDEA/WebStorm**: Built-in support
   - **Postman**: Import the files
   - **curl**: Convert requests manually

## Test Files Overview

### 1. `01-health-and-basic.http`
- Health check endpoint
- Get all available queries
- Get specific query details
- Database statistics

### 2. `02-predefined-queries-basic.http`
- Basic find operations for companies and job seekers
- Tests with default and custom parameters
- Different industry and experience level filters

### 3. `03-predefined-queries-advanced.http`
- Advanced job search with multiple filters
- Skills-based candidate search
- Location and salary filtering
- Work arrangement preferences

### 4. `04-analytics-queries.http`
- Application status distribution
- Salary analysis by experience and industry
- Skills demand analysis
- Hiring funnel metrics
- Company growth analysis

### 5. `05-search-queries.http`
- Full-text search for jobs and candidates
- Geospatial queries for nearby jobs
- Location-based filtering
- Keyword search with relevance scoring

### 6. `06-custom-queries.http`
- Custom MongoDB query execution
- Direct collection access
- Various operation types (find, findOne, aggregate, countDocuments)
- Complex aggregation pipelines

### 7. `07-error-handling.http`
- 404 error scenarios
- 400 bad request scenarios
- 403 forbidden operations
- Invalid parameters and malformed requests

## Usage Instructions

### Using VS Code with REST Client Extension

1. Install the "REST Client" extension
2. Open any `.http` file
3. Click "Send Request" above each request
4. View responses in the right panel

### Using curl (Example)

```bash
# Health check
curl -X GET http://localhost:3001/health

# Get all queries
curl -X GET http://localhost:3001/api/queries

# Execute a predefined query
curl -X POST http://localhost:3001/api/data/execute/basic-find-companies \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"industry": "Technology", "limit": 5}}'
```

## API Endpoints Summary

### Health & Info
- `GET /health` - Health check
- `GET /api/queries` - List all available queries
- `GET /api/queries/:id` - Get specific query details
- `GET /api/data/stats` - Database statistics

### Predefined Queries
- `POST /api/data/execute/:queryId` - Execute predefined query

Available Query IDs:
- `basic-find-companies`
- `basic-find-jobseekers`
- `advanced-job-search`
- `skills-search`
- `application-status-distribution`
- `salary-analysis`
- `skills-demand`
- `text-search-jobs`
- `text-search-candidates`
- `nearby-jobs`
- `hiring-funnel`
- `company-growth-analysis`

### Custom Queries
- `POST /api/data/execute-custom` - Execute custom MongoDB query

Supported Collections:
- `users`
- `companies`
- `jobseekerprofiles`
- `employerprofiles`
- `jobs`
- `applications`

Supported Operations:
- `find` - Find multiple documents
- `findOne` - Find single document
- `aggregate` - Run aggregation pipeline
- `countDocuments` - Count documents

## Common Parameters

### Predefined Query Parameters
- `limit` - Number of results to return
- `industry` - Filter by industry (Technology, Healthcare, Finance, etc.)
- `experienceLevel` - Filter by experience (Entry, Mid, Senior, Lead)
- `city` - Filter by city location
- `workArrangement` - Filter by work type (Remote, Hybrid, On-site)
- `minSalary` - Minimum salary filter
- `currency` - Salary currency (QAR, USD, AED)
- `skills` - Array of required skills
- `searchText` - Text search keywords
- `coordinates` - [longitude, latitude] for geospatial queries
- `maxDistance` - Maximum distance in meters for geospatial queries

### Custom Query Parameters
- `collection` - Target collection name
- `operation` - MongoDB operation to perform
- `query` - MongoDB query object or aggregation pipeline

## Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "executionTime": "25ms",
    "resultCount": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Security Notes

- Custom queries are limited to read-only operations
- Results are limited to 50 documents for safety
- Rate limiting is applied (100 requests per 15 minutes)
- Only specific collections are accessible
- Write operations (insert, update, delete) are forbidden

## Troubleshooting

1. **Connection Refused**: Ensure the API server is running on port 3001
2. **Empty Results**: Make sure the database is seeded with sample data
3. **404 Errors**: Check that query IDs and endpoints are spelled correctly
4. **500 Errors**: Check server logs for database connection issues
