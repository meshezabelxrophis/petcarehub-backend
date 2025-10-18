// Test webhook completion for the latest payment
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection  
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Finding latest payment session...');

// Find the latest pending payment and match it with a booking
db.get(`
  SELECT p.stripe_session_id, p.service_name, p.amount, 
         b.id as booking_id, b.service_id, s.name as service_name_db, s.price
  FROM payments p
  LEFT JOIN services s ON p.service_name = s.name
  LEFT JOIN bookings b ON b.service_id = s.id AND b.status = 'confirmed' AND b.payment_status = 'unpaid'
  WHERE p.status = 'pending'
  ORDER BY p.id DESC
  LIMIT 1
`, (err, row) => {
  if (err) {
    console.error('❌ Error finding payment:', err);
    return;
  }
  
  if (!row) {
    console.log('ℹ️  No pending payments found');
    return;
  }
  
  console.log('🎯 Found payment to complete:', {
    sessionId: row.stripe_session_id,
    serviceName: row.service_name,
    amount: row.amount,
    bookingId: row.booking_id
  });
  
  if (!row.booking_id) {
    console.log('⚠️  No matching booking found for this payment');
    return;
  }
  
  // Trigger the manual webhook
  const requestData = {
    sessionId: row.stripe_session_id,
    bookingId: row.booking_id
  };
  
  console.log('📡 Triggering webhook completion...');
  
  fetch('http://localhost:5001/api/test-webhook-completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Webhook response:', data);
    
    // Verify the update
    setTimeout(() => {
      console.log('\n🔍 Verifying update...');
      db.get(
        "SELECT id, service_id, status, payment_status FROM bookings WHERE id = ?",
        [row.booking_id],
        (err, booking) => {
          if (err) {
            console.error('Error verifying booking:', err);
            return;
          }
          
          console.log('📋 Updated booking status:', booking);
          
          if (booking.payment_status === 'paid') {
            console.log('🎉 Success! Booking is now marked as PAID');
            console.log('\n✅ Now check your frontend:');
            console.log('   - Pet owner: Go to My Bookings');
            console.log('   - Provider: Check dashboard');
            console.log('   - Both should show "Paid" status');
          } else {
            console.log('❌ Booking was not updated to paid status');
          }
          
          db.close();
        }
      );
    }, 1000);
  })
  .catch(err => {
    console.error('❌ Error triggering webhook:', err);
    db.close();
  });
});
