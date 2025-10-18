// Complete payment for the most recent checkout session
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Completing recent test payments...');

// Find recent pending payments and their corresponding bookings
db.all(`
  SELECT 
    p.id as payment_id,
    p.stripe_session_id,
    p.service_name,
    p.amount,
    p.status as payment_status,
    b.id as booking_id,
    b.status as booking_status,
    b.payment_status as booking_payment_status
  FROM payments p
  LEFT JOIN services s ON p.service_name = s.name
  LEFT JOIN bookings b ON b.service_id = s.id 
    AND b.status = 'confirmed' 
    AND b.payment_status = 'unpaid'
    AND (s.price * 100) = p.amount
  WHERE p.status = 'pending'
  ORDER BY p.id DESC
  LIMIT 5
`, (err, rows) => {
  if (err) {
    console.error('❌ Error finding payments:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('ℹ️  No pending payments to complete');
    db.close();
    return;
  }
  
  console.log(`🎯 Found ${rows.length} payment(s) to complete:`);
  console.table(rows);
  
  let completed = 0;
  const total = rows.length;
  
  rows.forEach((row, index) => {
    if (!row.booking_id) {
      console.log(`⚠️  Payment ${row.payment_id}: No matching booking found`);
      completed++;
      if (completed === total) {
        console.log('\n✅ Processing complete!');
        showFinalStatus();
      }
      return;
    }
    
    console.log(`\n🔄 Processing payment ${row.payment_id} for booking ${row.booking_id}...`);
    
    // Update payment status
    db.run(
      `UPDATE payments SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [row.payment_id],
      function(err) {
        if (err) {
          console.error(`❌ Error updating payment ${row.payment_id}:`, err);
        } else {
          console.log(`✅ Payment ${row.payment_id} marked as completed`);
        }
        
        // Update booking payment status
        db.run(
          `UPDATE bookings 
           SET payment_status = 'paid', stripe_session_id = ? 
           WHERE id = ?`,
          [row.stripe_session_id, row.booking_id],
          function(bookingErr) {
            if (bookingErr) {
              console.error(`❌ Error updating booking ${row.booking_id}:`, bookingErr);
            } else {
              console.log(`✅ Booking ${row.booking_id} marked as paid`);
            }
            
            completed++;
            if (completed === total) {
              console.log('\n🎉 All payments processed!');
              showFinalStatus();
            }
          }
        );
      }
    );
  });
});

function showFinalStatus() {
  console.log('\n📊 Final Status:');
  
  db.all("SELECT id, service_name, status FROM payments WHERE status = 'completed' ORDER BY id DESC LIMIT 5", (err, payments) => {
    if (err) {
      console.error('Error fetching final payment status:', err);
      return;
    }
    
    console.log('\n💳 Completed Payments:');
    console.table(payments);
    
    db.all("SELECT id, service_id, status, payment_status FROM bookings WHERE payment_status = 'paid' ORDER BY id DESC LIMIT 5", (err, bookings) => {
      if (err) {
        console.error('Error fetching final booking status:', err);
        return;
      }
      
      console.log('\n📋 Paid Bookings:');
      console.table(bookings);
      
      console.log('\n✅ Payment completion finished!');
      console.log('👀 Check your frontend:');
      console.log('   • Pet Owner: /my-bookings should show "Paid" status');
      console.log('   • Provider: Dashboard should show "Paid" status');
      
      db.close();
    });
  });
}
