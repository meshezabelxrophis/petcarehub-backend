#!/usr/bin/env node
/**
 * Cleanup script to remove duplicate bookings from the database
 * 
 * Usage: node cleanup-duplicates.js <userId>
 * Example: node cleanup-duplicates.js abc123
 */

const axios = require('axios');

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: Please provide a user ID');
  console.log('\nUsage: node cleanup-duplicates.js <userId>');
  console.log('Example: node cleanup-duplicates.js abc123');
  process.exit(1);
}

// Backend URL - change this if your backend is hosted elsewhere
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting duplicate booking cleanup...');
    console.log(`User ID: ${userId}`);
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log('');
    
    const response = await axios.delete(
      `${BACKEND_URL}/api/bookings/cleanup-duplicates/${userId}`
    );
    
    if (response.data.success) {
      console.log('\n✅ Cleanup completed successfully!');
      console.log(`   - Duplicate groups found: ${response.data.duplicateGroups}`);
      console.log(`   - Bookings deleted: ${response.data.deletedCount}`);
      console.log(`   - Remaining bookings: ${response.data.remainingBookings}`);
      console.log('\n📝 Note: Refresh your bookings page to see the changes.');
    } else {
      console.error('❌ Cleanup failed:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
    } else if (error.request) {
      console.error('Could not connect to backend. Make sure it\'s running.');
    }
    
    process.exit(1);
  }
}

cleanupDuplicates();

