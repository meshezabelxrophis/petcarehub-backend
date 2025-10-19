/**
 * Keep ML Service Alive
 * 
 * This script pings the ML API every 10 minutes to prevent it from sleeping
 * on Render's free tier (which sleeps after 15 minutes of inactivity)
 * 
 * Run this on your main backend server to keep the ML service awake
 */

const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'https://your-ml-service.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

let pingCount = 0;
let lastPingTime = null;
let consecutiveFailures = 0;

async function pingMLService() {
  try {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Pinging ML service... (Ping #${pingCount + 1})`);
    
    const response = await axios.get(`${ML_API_URL}/`, {
      timeout: 30000 // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    pingCount++;
    lastPingTime = new Date();
    consecutiveFailures = 0;
    
    console.log(`✅ ML service is alive! Response time: ${duration}ms`);
    console.log(`   Status: ${response.status}, Message: ${response.data?.message || 'OK'}`);
    
    return true;
  } catch (error) {
    consecutiveFailures++;
    const duration = Date.now() - startTime;
    
    console.error(`❌ Failed to ping ML service (Attempt ${consecutiveFailures})`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Time taken: ${duration}ms`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error(`   Reason: Request timeout (service is waking up)`);
    } else if (error.code === 'ENOTFOUND') {
      console.error(`   Reason: ML_API_URL might be incorrect: ${ML_API_URL}`);
    }
    
    // If too many consecutive failures, something might be wrong
    if (consecutiveFailures >= 5) {
      console.error(`⚠️  WARNING: ${consecutiveFailures} consecutive failures. Check ML service!`);
    }
    
    return false;
  }
}

function startKeepAlive() {
  console.log('\n🚀 Starting ML Keep-Alive Service');
  console.log(`   Target: ${ML_API_URL}`);
  console.log(`   Interval: ${PING_INTERVAL / 1000 / 60} minutes`);
  console.log(`   Started at: ${new Date().toISOString()}\n`);
  
  // Ping immediately on start
  pingMLService();
  
  // Then ping every 10 minutes
  setInterval(pingMLService, PING_INTERVAL);
}

function getStats() {
  return {
    totalPings: pingCount,
    lastPingTime: lastPingTime,
    consecutiveFailures: consecutiveFailures,
    uptime: process.uptime(),
    mlServiceUrl: ML_API_URL
  };
}

// Start the keep-alive service if this file is run directly
if (require.main === module) {
  startKeepAlive();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n📊 Keep-Alive Stats:');
    console.log(`   Total pings sent: ${pingCount}`);
    console.log(`   Last successful ping: ${lastPingTime || 'None'}`);
    console.log(`   Consecutive failures: ${consecutiveFailures}`);
    console.log('\n👋 Shutting down Keep-Alive service...');
    process.exit(0);
  });
} else {
  // Export for use in other modules
  module.exports = {
    startKeepAlive,
    pingMLService,
    getStats
  };
}

