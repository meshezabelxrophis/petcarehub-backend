#!/usr/bin/env node

/**
 * Prepare Environment Variables for Vercel Deployment
 * 
 * This script helps you prepare environment variables for Vercel deployment
 * by converting the Firebase service account JSON to a string format.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing Vercel Environment Variables...\n');

// Read Firebase service account
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: firebase-service-account.json not found!');
  console.error('   Expected location:', serviceAccountPath);
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Convert to single-line JSON string
  const serviceAccountString = JSON.stringify(serviceAccount);
  
  console.log('✅ Firebase Service Account converted successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Copy these environment variables to Vercel:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Read .env from server if exists
  const serverEnvPath = path.join(__dirname, '..', 'server', '.env');
  let stripeKey = 'your_stripe_secret_key';
  let geminiKey = 'your_gemini_api_key';
  
  if (fs.existsSync(serverEnvPath)) {
    const envContent = fs.readFileSync(serverEnvPath, 'utf8');
    const stripeMatch = envContent.match(/STRIPE_SECRET_KEY=(.+)/);
    const geminiMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
    
    if (stripeMatch) stripeKey = stripeMatch[1].trim();
    if (geminiMatch) geminiKey = geminiMatch[1].trim();
  }
  
  console.log('1. STRIPE_SECRET_KEY');
  console.log(`   ${stripeKey}\n`);
  
  console.log('2. GEMINI_API_KEY');
  console.log(`   ${geminiKey}\n`);
  
  console.log('3. FIREBASE_SERVICE_ACCOUNT');
  console.log(`   ${serviceAccountString}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Save to a file for easy copying
  const envVarsPath = path.join(__dirname, '..', '.vercel-env-vars.txt');
  const envVarsContent = `# Vercel Environment Variables
# Copy these to Vercel Dashboard > Settings > Environment Variables

STRIPE_SECRET_KEY=${stripeKey}

GEMINI_API_KEY=${geminiKey}

FIREBASE_SERVICE_ACCOUNT=${serviceAccountString}

# Note: Make sure to set these for Production, Preview, and Development environments
`;
  
  fs.writeFileSync(envVarsPath, envVarsContent);
  
  console.log('✅ Environment variables saved to: .vercel-env-vars.txt');
  console.log('   You can reference this file when setting up Vercel.\n');
  
  console.log('📌 Next Steps:');
  console.log('   1. Go to https://vercel.com/dashboard');
  console.log('   2. Import your project or create new one');
  console.log('   3. Go to Settings > Environment Variables');
  console.log('   4. Add each variable from above');
  console.log('   5. Deploy: vercel --prod\n');
  
} catch (error) {
  console.error('❌ Error processing service account:', error.message);
  process.exit(1);
}

