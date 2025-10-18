const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Stripe Payment Integration...\n');

// Check if tables exist and have correct structure
db.serialize(() => {
  console.log('📋 Checking bookings table structure...');
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking bookings table:', err);
      return;
    }
    
    const hasPaymentStatus = columns.find(col => col.name === 'payment_status');
    const hasStripeSessionId = columns.find(col => col.name === 'stripe_session_id');
    
    console.log('✅ Bookings table columns:', columns.map(col => col.name).join(', '));
    console.log(hasPaymentStatus ? '✅ payment_status column exists' : '❌ payment_status column missing');
    console.log(hasStripeSessionId ? '✅ stripe_session_id column exists' : '❌ stripe_session_id column missing');
  });

  console.log('\n📋 Checking payments table...');
  db.all("PRAGMA table_info(payments)", (err, columns) => {
    if (err) {
      console.error('❌ Payments table does not exist');
      return;
    }
    console.log('✅ Payments table exists with columns:', columns.map(col => col.name).join(', '));
  });

  console.log('\n📊 Current booking statuses:');
  db.all("SELECT id, service_id, status, payment_status, stripe_session_id FROM bookings LIMIT 10", (err, rows) => {
    if (err) {
      console.error('❌ Error fetching bookings:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('ℹ️  No bookings found. Create a booking first to test payments.');
    } else {
      console.table(rows);
    }
  });

  console.log('\n💳 Current payment records:');
  db.all("SELECT id, stripe_session_id, service_name, amount, status, created_at FROM payments LIMIT 10", (err, rows) => {
    if (err) {
      console.error('❌ Error fetching payments:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('ℹ️  No payment records found.');
    } else {
      console.table(rows);
    }
    
    console.log('\n🎯 Ready to test! Follow these steps:');
    console.log('1. Make sure your server is running: npm run dev');
    console.log('2. Login as a pet owner');
    console.log('3. Create a booking and get it confirmed');
    console.log('4. Go to My Bookings and click "Pay"');
    console.log('5. Use test card: 4242 4242 4242 4242');
    console.log('6. Check this script again to see updated records');
    
    db.close();
  });
});
