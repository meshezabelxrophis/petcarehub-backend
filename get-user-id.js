#!/usr/bin/env node
/**
 * Helper script to get your user ID by email
 * 
 * Usage: node get-user-id.js <email>
 * Example: node get-user-id.js user@example.com
 */

const axios = require('axios');

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide your email address');
  console.log('\nUsage: node get-user-id.js <email>');
  console.log('Example: node get-user-id.js user@example.com');
  process.exit(1);
}

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

async function getUserId() {
  try {
    console.log('🔍 Looking up user ID...');
    console.log(`Email: ${email}`);
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log('');
    
    const response = await axios.get(`${BACKEND_URL}/api/users`);
    const users = response.data;
    
    // Find user by email
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      console.log('✅ User found!');
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log('\n📝 Use this ID to run the cleanup script:');
      console.log(`   node cleanup-duplicates.js ${user.id}`);
    } else {
      console.error('❌ No user found with that email address.');
      console.log('\n📧 Available users:');
      users.slice(0, 5).forEach(u => {
        console.log(`   - ${u.email || 'No email'} (${u.name || 'No name'})`);
      });
      if (users.length > 5) {
        console.log(`   ... and ${users.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error looking up user:', error.message);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
    } else if (error.request) {
      console.error('Could not connect to backend. Make sure it\'s running.');
    }
    
    process.exit(1);
  }
}

getUserId();

