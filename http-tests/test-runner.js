#!/usr/bin/env node

/**
 * MongoDB Demo API Test Runner
 * 
 * This script runs all HTTP tests programmatically and generates a report.
 * Usage: node test-runner.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const TIMEOUT = 10000; // 10 seconds

// Test definitions
const tests = [
  // Health and Basic Tests
  {
    name: 'Health Check',
    method: 'GET',
    url: '/health',
    expectedStatus: 200
  },
  {
    name: 'Get All Queries',
    method: 'GET',
    url: '/api/queries',
    expectedStatus: 200
  },
  {
    name: 'Get Database Stats',
    method: 'GET',
    url: '/api/data/stats',
    expectedStatus: 200
  },

  // Predefined Queries - Basic
  {
    name: 'Basic Find Companies',
    method: 'POST',
    url: '/api/data/execute/basic-find-companies',
    body: { parameters: { industry: 'Technology', limit: 5 } },
    expectedStatus: 200
  },
  {
    name: 'Basic Find Job Seekers',
    method: 'POST',
    url: '/api/data/execute/basic-find-jobseekers',
    body: { parameters: { experienceLevel: 'Senior', limit: 5 } },
    expectedStatus: 200
  },

  // Advanced Queries
  {
    name: 'Advanced Job Search',
    method: 'POST',
    url: '/api/data/execute/advanced-job-search',
    body: { parameters: { city: 'Doha', limit: 5 } },
    expectedStatus: 200
  },
  {
    name: 'Skills Search',
    method: 'POST',
    url: '/api/data/execute/skills-search',
    body: { parameters: { skills: ['JavaScript', 'React'], limit: 3 } },
    expectedStatus: 200
  },

  // Analytics Queries
  {
    name: 'Application Status Distribution',
    method: 'POST',
    url: '/api/data/execute/application-status-distribution',
    body: {},
    expectedStatus: 200
  },
  {
    name: 'Salary Analysis',
    method: 'POST',
    url: '/api/data/execute/salary-analysis',
    body: { parameters: { currency: 'QAR' } },
    expectedStatus: 200
  },
  {
    name: 'Skills Demand',
    method: 'POST',
    url: '/api/data/execute/skills-demand',
    body: { parameters: { limit: 10 } },
    expectedStatus: 200
  },
  {
    name: 'Hiring Funnel',
    method: 'POST',
    url: '/api/data/execute/hiring-funnel',
    body: {},
    expectedStatus: 200
  },
  {
    name: 'Company Growth Analysis',
    method: 'POST',
    url: '/api/data/execute/company-growth-analysis',
    body: { parameters: { minEmployees: 50 } },
    expectedStatus: 200
  },

  // Search Queries
  {
    name: 'Text Search Jobs',
    method: 'POST',
    url: '/api/data/execute/text-search-jobs',
    body: { parameters: { searchText: 'software developer', limit: 5 } },
    expectedStatus: 200
  },
  {
    name: 'Text Search Candidates',
    method: 'POST',
    url: '/api/data/execute/text-search-candidates',
    body: { parameters: { searchText: 'react javascript', limit: 3 } },
    expectedStatus: 200
  },
  {
    name: 'Nearby Jobs',
    method: 'POST',
    url: '/api/data/execute/nearby-jobs',
    body: { parameters: { coordinates: [51.5310, 25.2854], maxDistance: 10000 } },
    expectedStatus: 200
  },

  // Custom Queries
  {
    name: 'Custom Query - Find Users',
    method: 'POST',
    url: '/api/data/execute-custom',
    body: { collection: 'users', operation: 'find', query: {} },
    expectedStatus: 200
  },
  {
    name: 'Custom Query - Count Companies',
    method: 'POST',
    url: '/api/data/execute-custom',
    body: { collection: 'companies', operation: 'countDocuments', query: { isActive: true } },
    expectedStatus: 200
  },

  // Error Handling Tests
  {
    name: 'Non-existent Route (404)',
    method: 'GET',
    url: '/api/nonexistent',
    expectedStatus: 404
  },
  {
    name: 'Invalid Query ID (404)',
    method: 'GET',
    url: '/api/queries/nonexistent-query',
    expectedStatus: 404
  },
  {
    name: 'Invalid Collection (400)',
    method: 'POST',
    url: '/api/data/execute-custom',
    body: { collection: 'invalidcollection', operation: 'find', query: {} },
    expectedStatus: 400
  },
  {
    name: 'Forbidden Operation (403)',
    method: 'POST',
    url: '/api/data/execute-custom',
    body: { collection: 'users', operation: 'insertOne', query: { name: 'Test' } },
    expectedStatus: 403
  }
];

// HTTP request helper
function makeRequest(test) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + test.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            success: res.statusCode === test.expectedStatus,
            statusCode: res.statusCode,
            expectedStatus: test.expectedStatus,
            data: jsonData,
            error: null
          });
        } catch (parseError) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            expectedStatus: test.expectedStatus,
            data: data,
            error: `JSON Parse Error: ${parseError.message}`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        statusCode: null,
        expectedStatus: test.expectedStatus,
        data: null,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: null,
        expectedStatus: test.expectedStatus,
        data: null,
        error: 'Request timeout'
      });
    });

    if (test.body) {
      req.write(JSON.stringify(test.body));
    }

    req.end();
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting MongoDB Demo API Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total Tests: ${tests.length}\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    process.stdout.write(`[${i + 1}/${tests.length}] ${test.name}... `);

    const result = await makeRequest(test);
    results.push({ test, result });

    if (result.success) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      } else {
        console.log(`    Expected: ${test.expectedStatus}, Got: ${result.statusCode}`);
      }
      failed++;
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

  // Generate detailed report
  const reportPath = path.join(__dirname, 'test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: tests.length, passed, failed },
    results: results.map(({ test, result }) => ({
      name: test.name,
      method: test.method,
      url: test.url,
      success: result.success,
      statusCode: result.statusCode,
      expectedStatus: test.expectedStatus,
      error: result.error,
      responseSize: result.data ? JSON.stringify(result.data).length : 0
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the server is running and database is seeded.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, tests };
