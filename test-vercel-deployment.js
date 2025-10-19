#!/usr/bin/env node

/**
 * Test Vercel Deployment
 * Tests all API endpoints after deployment
 */

// Your Vercel deployment URL
const BASE_URL = 'https://petcarehub-external-d4p96vidh-meshezabel95-gmailcoms-projects.vercel.app';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log('blue', `\n📡 Testing: ${name}`);
    log('blue', `   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log('green', `   ✅ Status: ${response.status} OK`);
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 500));
      return true;
    } else {
      log('red', `   ❌ Status: ${response.status} Failed`);
      console.log('   Error:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    log('red', `   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.clear();
  log('cyan', '═══════════════════════════════════════════════════════════');
  log('cyan', '        Vercel Deployment Test Suite');
  log('cyan', '═══════════════════════════════════════════════════════════\n');
  
  log('yellow', `Testing deployment at:\n${BASE_URL}/api\n`);
  
  const results = [];
  
  // Test 1: Health Check
  log('bold', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 1: Health Check (GET /api)');
  const test1 = await testEndpoint(
    'Health Check',
    `${BASE_URL}/api`
  );
  results.push({ name: 'Health Check', passed: test1 });
  
  // Test 2: Create Payment Intent (Stripe)
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 2: Create Payment Intent (POST /api/create-payment-intent)');
  const test2 = await testEndpoint(
    'Stripe Payment Intent',
    `${BASE_URL}/api/create-payment-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://fyppp-5b4f0.web.app'
      },
      body: JSON.stringify({
        amount: 25.99,
        currency: 'usd',
        serviceName: 'Test Dog Grooming Service',
        serviceId: 'test_service_123',
        userId: 'test_user_456',
        bookingId: 'test_booking_789'
      })
    }
  );
  results.push({ name: 'Stripe Payment Intent', passed: test2 });
  
  // Test 3: Generate AI Response (Gemini)
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 3: Generate AI Response (POST /api/generate-ai-response)');
  const test3 = await testEndpoint(
    'Gemini AI Response',
    `${BASE_URL}/api/generate-ai-response`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://fyppp-5b4f0.web.app'
      },
      body: JSON.stringify({
        message: 'What are the best foods for dogs?',
        sessionId: 'test_session_' + Date.now()
      })
    }
  );
  results.push({ name: 'Gemini AI Response', passed: test3 });
  
  // Test 4: Store to Firestore
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 4: Store to Firestore (POST /api/store-ai-output)');
  const test4 = await testEndpoint(
    'Firestore Storage',
    `${BASE_URL}/api/store-ai-output`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://fyppp-5b4f0.web.app'
      },
      body: JSON.stringify({
        collection: 'test_deployments',
        data: {
          test: 'Vercel Deployment Test',
          timestamp: new Date().toISOString(),
          message: 'Testing Firestore integration from Vercel'
        },
        userId: 'test_user_' + Date.now(),
        sessionId: 'test_session_' + Date.now()
      })
    }
  );
  results.push({ name: 'Firestore Storage', passed: test4 });
  
  // Summary
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '\n📊 Test Summary:');
  log('cyan', '═══════════════════════════════════════════════════════════\n');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.passed) {
      log('green', `   ✅ ${result.name}: PASSED`);
      passed++;
    } else {
      log('red', `   ❌ ${result.name}: FAILED`);
      failed++;
    }
  });
  
  log('cyan', '\n═══════════════════════════════════════════════════════════');
  log('bold', `\n   Total: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);
  
  if (failed > 0) {
    log('yellow', '\n⚠️  Some tests failed. Possible reasons:');
    log('yellow', '   1. Environment variables not set in Vercel');
    log('yellow', '   2. CORS configuration issue');
    log('yellow', '   3. API keys are invalid');
    log('yellow', '\nNext steps:');
    log('blue', '   1. Go to https://vercel.com/dashboard');
    log('blue', '   2. Select your project: petcarehub-external-api');
    log('blue', '   3. Go to Settings > Environment Variables');
    log('blue', '   4. Add the variables from .vercel-env-vars.txt');
    log('blue', '   5. Redeploy: npx vercel --prod\n');
  } else {
    log('green', '\n🎉 All tests passed! Your API is working perfectly!\n');
    log('cyan', 'Your API URL: ' + BASE_URL + '/api\n');
  }
}

// Run tests
runTests().catch(console.error);

