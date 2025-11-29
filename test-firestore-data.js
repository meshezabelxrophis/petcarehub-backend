/**
 * Test Script to Check Firestore Data
 * Run: node test-firestore-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore Data...\n');
  console.log('📋 Project ID:', serviceAccount.project_id);
  console.log('━'.repeat(60));
  
  try {
    // Check Services Collection
    console.log('\n📦 SERVICES COLLECTION:');
    const servicesSnapshot = await db.collection('services').limit(20).get();
    console.log(`Found ${servicesSnapshot.size} services\n`);
    
    if (servicesSnapshot.empty) {
      console.log('⚠️  No services found in Firestore!');
      console.log('   You may need to add services to your database.\n');
    } else {
      servicesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'Unnamed'}`);
        console.log(`   Price: ₨${data.price || 0}`);
        console.log(`   Provider: ${data.provider_name || data.providerId || 'Unknown'}`);
        console.log(`   Category: ${data.category || 'N/A'}`);
        console.log(`   Description: ${data.description || 'None'}`);
        console.log('');
      });
    }
    
    console.log('━'.repeat(60));
    
    // Check Users/Providers Collection  
    console.log('\n👥 USERS/PROVIDERS COLLECTION:');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'provider')
      .limit(10)
      .get();
    console.log(`Found ${usersSnapshot.size} providers\n`);
    
    if (usersSnapshot.empty) {
      console.log('⚠️  No providers found!\n');
    } else {
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.name || 'Unnamed'} (${doc.id})`);
        console.log(`   Email: ${data.email || 'N/A'}`);
        console.log(`   Role: ${data.role || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('━'.repeat(60));
    
    // Check Bookings
    console.log('\n📅 BOOKINGS COLLECTION:');
    const bookingsSnapshot = await db.collection('bookings').limit(5).get();
    console.log(`Found ${bookingsSnapshot.size} bookings\n`);
    
    console.log('━'.repeat(60));
    console.log('\n✅ Firestore check complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error accessing Firestore:', error.message);
    console.error('\nFull error:', error);
  }
  
  process.exit(0);
}

// Run the check
checkFirestoreData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


