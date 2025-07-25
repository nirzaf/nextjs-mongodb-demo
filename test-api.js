#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Script/1.0'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`);
    
    // Check for security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy',
      'access-control-allow-origin',
      'x-ratelimit-limit',
      'x-ratelimit-remaining'
    ];
    
    securityHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`     ${header}: ${value}`);
      }
    });
    
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { error };
  }
}

async function runTests() {
  console.log('🚀 Starting API Middleware Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Health endpoint (should have light middleware)
  await testEndpoint('/health');
  
  // Test 2: Queries endpoint (should have full API middleware)
  await testEndpoint('/queries');
  
  // Test 3: Query by ID (should have full API middleware)
  await testEndpoint('/queries/basic-find');

  // Test 4: Database stats (should have full API middleware)
  await testEndpoint('/data/stats');

  // Test 5: Execute predefined query (should have full API middleware)
  await testEndpoint('/data/execute/basic-find-companies', 'POST', {
    parameters: { limit: 5 }
  });
  
  // Test 6: Custom query execution (should have custom query middleware with stricter rate limiting)
  await testEndpoint('/data/execute-custom/users', 'POST', {
    query: { userType: 'JobSeeker' },
    options: { limit: 3 }
  });
  
  // Test 7: Rate limiting test - make multiple requests quickly
  console.log('\n🔄 Testing Rate Limiting (making 5 quick requests)');
  for (let i = 1; i <= 5; i++) {
    console.log(`   Request ${i}:`);
    const result = await testEndpoint('/health');
    if (result.response) {
      const remaining = result.response.headers.get('x-ratelimit-remaining');
      console.log(`     Rate limit remaining: ${remaining}`);
    }
  }
  
  // Test 8: CORS preflight request
  console.log('\n🌐 Testing CORS Preflight');
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS Headers:`);
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-max-age'
    ];
    
    corsHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`     ${header}: ${value}`);
      }
    });
  } catch (error) {
    console.error(`   ❌ CORS Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ API Middleware Tests Complete');
}

// Run the tests
runTests().catch(console.error);
