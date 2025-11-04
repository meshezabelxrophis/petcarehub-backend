#!/usr/bin/env node

/**
 * API Testing Script
 * 
 * Tests all external API endpoints
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      log('green', `✅ Success (${response.status})`);
      console.log(JSON.stringify(data, null, 2));
      return true;
    } else {
      log('red', `❌ Failed (${response.status})`);
      console.log(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    log('red', `❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests(baseUrl) {
  console.clear();
  log('cyan', '═══════════════════════════════════════════════════════');
  log('cyan', '           PetCareHub API Testing Suite');
  log('cyan', '═══════════════════════════════════════════════════════\n');
  
  log('blue', `Testing API at: ${baseUrl}\n`);
  
  // Test 1: Health Check
  log('yellow', '📡 Test 1: Health Check');
  log('blue', `GET ${baseUrl}\n`);
  await testEndpoint(baseUrl);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Test 2: Create Payment Intent
  log('yellow', '💳 Test 2: Create Payment Intent');
  log('blue', `POST ${baseUrl}/create-payment-intent\n`);
  await testEndpoint(`${baseUrl}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 25.99,
      currency: 'usd',
      serviceName: 'Dog Grooming Test',
      serviceId: 'test_service_123',
      userId: 'test_user_456'
    })
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Test 3: Generate AI Response
  log('yellow', '🤖 Test 3: Generate AI Response');
  log('blue', `POST ${baseUrl}/generate-ai-response\n`);
  await testEndpoint(`${baseUrl}/generate-ai-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'What are the best foods for dogs?',
      sessionId: 'test_session_123'
    })
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // Test 4: Store AI Output
  log('yellow', '💾 Test 4: Store AI Output');
  log('blue', `POST ${baseUrl}/store-ai-output\n`);
  await testEndpoint(`${baseUrl}/store-ai-output`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      collection: 'test_data',
      data: {
        test: 'API Test',
        timestamp: new Date().toISOString(),
        message: 'Testing Firestore integration'
      },
      userId: 'test_user_123',
      sessionId: 'test_session_456'
    })
  });
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  log('cyan', '═══════════════════════════════════════════════════════');
  log('green', '                   Tests Complete!');
  log('cyan', '═══════════════════════════════════════════════════════\n');
}

// Main
rl.question('Enter your Vercel API URL (or press Enter for local): ', (answer) => {
  const apiUrl = answer.trim() || 'http://localhost:3000/api';
  rl.close();
  
  runTests(apiUrl).catch(console.error);
});

