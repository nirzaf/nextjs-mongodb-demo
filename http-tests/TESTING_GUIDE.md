# MongoDB Demo API - Complete Testing Guide

This directory contains comprehensive HTTP test files and tools for testing all API endpoints in the MongoDB Demo project.

## 🚀 Quick Start

### Option 1: Automated Test Runner (Recommended)
```bash
# Navigate to the http-tests directory
cd http-tests

# Run all tests (will start API if needed)
./run-tests.sh test

# Or check individual components
./run-tests.sh check    # Check if API is running
./run-tests.sh start    # Start API server
./run-tests.sh stop     # Stop API server
```

### Option 2: Manual Testing with HTTP Files
1. Start the API server: `npm run api`
2. Open any `.http` file in VS Code with REST Client extension
3. Click "Send Request" above each request

### Option 3: Postman Collection
1. Import `MongoDB-Demo-API.postman_collection.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:3001`
3. Run individual requests or the entire collection

## 📁 File Structure

```
http-tests/
├── 01-health-and-basic.http          # Health check and basic endpoints
├── 02-predefined-queries-basic.http  # Basic find operations
├── 03-predefined-queries-advanced.http # Advanced filtering and search
├── 04-analytics-queries.http         # Analytics and aggregation
├── 05-search-queries.http            # Text search and geospatial
├── 06-custom-queries.http            # Custom MongoDB queries
├── 07-error-handling.http            # Error scenarios and edge cases
├── test-runner.js                    # Automated test runner
├── run-tests.sh                      # Shell script for easy testing
├── MongoDB-Demo-API.postman_collection.json # Postman collection
├── README.md                         # Detailed documentation
└── TESTING_GUIDE.md                  # This file
```

## 🧪 Test Categories

### 1. Health & Basic (01-health-and-basic.http)
- ✅ Health check endpoint
- ✅ List all available queries
- ✅ Get specific query details
- ✅ Database statistics

### 2. Basic Queries (02-predefined-queries-basic.http)
- ✅ Find companies by industry
- ✅ Find job seekers by experience level
- ✅ Parameter variations and limits

### 3. Advanced Queries (03-predefined-queries-advanced.http)
- ✅ Advanced job search with multiple filters
- ✅ Skills-based candidate search
- ✅ Location and salary filtering

### 4. Analytics (04-analytics-queries.http)
- ✅ Application status distribution
- ✅ Salary analysis by experience/industry
- ✅ Skills demand analysis
- ✅ Hiring funnel metrics
- ✅ Company growth analysis

### 5. Search Queries (05-search-queries.http)
- ✅ Full-text search for jobs
- ✅ Full-text search for candidates
- ✅ Geospatial queries (nearby jobs)
- ✅ Location-based filtering

### 6. Custom Queries (06-custom-queries.http)
- ✅ Direct collection access
- ✅ Find, findOne, aggregate, countDocuments
- ✅ Complex aggregation pipelines
- ✅ All supported collections

### 7. Error Handling (07-error-handling.http)
- ✅ 404 scenarios (non-existent routes/queries)
- ✅ 400 scenarios (bad requests)
- ✅ 403 scenarios (forbidden operations)
- ✅ Invalid parameters

## 🔧 Available Tools

### 1. Shell Script (`run-tests.sh`)
```bash
./run-tests.sh check      # Check API status
./run-tests.sh start      # Start API server
./run-tests.sh test       # Run all tests
./run-tests.sh test-cat health  # Run category tests
./run-tests.sh stop       # Stop API server
./run-tests.sh help       # Show help
```

### 2. Node.js Test Runner (`test-runner.js`)
```bash
node test-runner.js       # Run all tests programmatically
```
- Generates detailed JSON report
- Shows pass/fail statistics
- Includes response times and error details

### 3. HTTP Files (VS Code REST Client)
- Individual `.http` files for each category
- Click "Send Request" to execute
- View responses in split panel

### 4. Postman Collection
- Import JSON file into Postman
- Organized folders by category
- Environment variables for easy configuration

## 📊 API Endpoints Summary

### Core Endpoints
- `GET /health` - Health check
- `GET /api/queries` - List all queries
- `GET /api/queries/:id` - Get query details
- `GET /api/data/stats` - Database statistics

### Predefined Queries
- `POST /api/data/execute/:queryId` - Execute predefined query

**Available Query IDs:**
- `basic-find-companies` - Find companies by industry
- `basic-find-jobseekers` - Find job seekers by experience
- `advanced-job-search` - Advanced job filtering
- `skills-search` - Skills-based candidate search
- `application-status-distribution` - Application analytics
- `salary-analysis` - Salary benchmarking
- `skills-demand` - Skills demand analysis
- `text-search-jobs` - Job keyword search
- `text-search-candidates` - Candidate keyword search
- `nearby-jobs` - Geospatial job search
- `hiring-funnel` - Hiring process analytics
- `company-growth-analysis` - Company growth metrics

### Custom Queries
- `POST /api/data/execute-custom` - Execute custom MongoDB query

**Supported Collections:** users, companies, jobseekerprofiles, employerprofiles, jobs, applications
**Supported Operations:** find, findOne, aggregate, countDocuments

## 🛡️ Security & Safety

- ✅ Read-only operations only
- ✅ Result limits (50 documents max)
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ❌ Write operations forbidden (insert, update, delete)

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if API is running
   ./run-tests.sh check
   
   # Start API if needed
   ./run-tests.sh start
   ```

2. **Empty Results**
   ```bash
   # Seed the database
   cd ..
   npm run seed
   ```

3. **Permission Denied**
   ```bash
   # Make script executable
   chmod +x run-tests.sh
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

### Debugging Tips

- Check server logs for detailed error messages
- Use `curl -v` for verbose HTTP debugging
- Verify database connection and seeded data
- Check network connectivity and firewall settings

## 📈 Performance Testing

The test runner includes basic performance metrics:
- Response times for each endpoint
- Success/failure rates
- Result counts and data sizes

For load testing, consider using tools like:
- Apache Bench (`ab`)
- Artillery.io
- k6
- JMeter

## 🎯 Best Practices

1. **Always test with seeded data** - Run `npm run seed` first
2. **Test error scenarios** - Don't just test happy paths
3. **Verify response structure** - Check both data and metadata
4. **Test parameter variations** - Try different limits, filters, etc.
5. **Monitor performance** - Watch response times and resource usage
6. **Test edge cases** - Empty results, large datasets, invalid inputs

## 📝 Contributing

To add new tests:
1. Add HTTP requests to appropriate `.http` file
2. Update `test-runner.js` with new test cases
3. Add Postman requests to collection
4. Update documentation

## 🔗 Related Documentation

- [API Documentation](../API_DOCUMENTATION.md)
- [Project README](../README.md)
- [Database Schema](../src/models/)
- [Sample Queries](../src/queries.ts)
