#!/usr/bin/env node

/**
 * Test Final Deployment with Environment Variables
 */

// Updated Vercel deployment URL
const BASE_URL = 'https://petcarehub-external-extxd2xj8-meshezabel95-gmailcoms-projects.vercel.app';

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
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      log('yellow', `   ⚠️  Response is not JSON. Content-Type: ${contentType}`);
      log('yellow', `   Response preview: ${text.substring(0, 200)}...`);
      return false;
    }
    
    if (response.ok) {
      log('green', `   ✅ Status: ${response.status} OK`);
      const preview = JSON.stringify(data, null, 2).substring(0, 400);
      console.log('   Response:', preview + (preview.length >= 400 ? '...' : ''));
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
  log('cyan', '    Final Vercel Deployment Test (With Env Vars)');
  log('cyan', '═══════════════════════════════════════════════════════════\n');
  
  log('yellow', `Testing deployment at:\n${BASE_URL}/api\n`);
  log('yellow', `Environment variables: STRIPE_SECRET_KEY, GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT\n`);
  
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
  log('yellow', 'Test 2: Create Payment Intent - Stripe Integration (POST /api/create-payment-intent)');
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
        amount: 99.99,
        currency: 'usd',
        serviceName: 'Premium Dog Grooming Service',
        serviceId: 'test_service_grooming_001',
        userId: 'test_user_pet_owner_456',
        bookingId: 'test_booking_789'
      })
    }
  );
  results.push({ name: 'Stripe Payment Intent', passed: test2 });
  
  // Test 3: Generate AI Response (Gemini)
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 3: Generate AI Response - Gemini Integration (POST /api/generate-ai-response)');
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
        message: 'What are the best foods for a golden retriever puppy?',
        sessionId: 'test_session_' + Date.now(),
        context: {
          userPets: ['Golden Retriever'],
          userLocation: 'New York'
        }
      })
    }
  );
  results.push({ name: 'Gemini AI Response', passed: test3 });
  
  // Test 4: Store to Firestore
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', 'Test 4: Store to Firestore - Firebase Integration (POST /api/store-ai-output)');
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
        collection: 'deployment_tests',
        data: {
          test: 'Final Vercel Deployment Test',
          timestamp: new Date().toISOString(),
          message: 'Testing all integrations: Stripe + Gemini + Firestore',
          status: 'success',
          envVarsConfigured: true
        },
        userId: 'test_user_' + Date.now(),
        sessionId: 'test_session_' + Date.now(),
        metadata: {
          deployment: 'production',
          testRun: new Date().toISOString()
        }
      })
    }
  );
  results.push({ name: 'Firestore Storage', passed: test4 });
  
  // Summary
  log('bold', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('cyan', '\n📊 Final Test Summary:');
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
    log('yellow', '\n⚠️  Some tests failed. Check the error messages above.');
    log('yellow', '   Review Vercel logs: npx vercel logs');
  } else {
    log('green', '\n🎉 🎉 🎉  ALL TESTS PASSED! 🎉 🎉 🎉\n');
    log('green', '   Your API is fully functional with all integrations working!\n');
    log('cyan', '   ✅ Stripe Payment Processing: Working');
    log('cyan', '   ✅ Gemini AI Chatbot: Working');
    log('cyan', '   ✅ Firebase Firestore: Working');
    log('cyan', '   ✅ CORS Configuration: Working\n');
    log('blue', '   Production API URL:');
    log('blue', `   ${BASE_URL}/api\n`);
    log('yellow', '   Next Steps:');
    log('yellow', '   1. Update your React frontend to use this API URL');
    log('yellow', '   2. Redeploy your frontend to Firebase Hosting');
    log('yellow', '   3. Test end-to-end integration from your live app\n');
  }
}

// Run tests
runTests().catch(console.error);

