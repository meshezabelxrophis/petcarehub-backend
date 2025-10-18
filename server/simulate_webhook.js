// Test webhook to simulate Stripe checkout.session.completed event
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Simulate webhook completion for the latest payment
const simulateWebhookCompletion = (sessionId, bookingId) => {
  console.log(`🔗 Simulating webhook completion for session: ${sessionId}`);
  
  // Update payment status
  db.run(
    `UPDATE payments 
     SET status = ?, completed_at = CURRENT_TIMESTAMP 
     WHERE stripe_session_id = ?`,
    ['completed', sessionId],
    function(err) {
      if (err) {
        console.error('❌ Error updating payment status:', err);
        return;
      }
      
      console.log(`✅ Payment updated: ${this.changes} rows affected`);
      
      // Update booking payment status if bookingId provided
      if (bookingId) {
        db.run(
          `UPDATE bookings 
           SET payment_status = ?, stripe_session_id = ? 
           WHERE id = ?`,
          ['paid', sessionId, bookingId],
          function(bookingErr) {
            if (bookingErr) {
              console.error('❌ Error updating booking payment status:', bookingErr);
            } else {
              console.log(`✅ Booking #${bookingId} marked as paid: ${this.changes} rows affected`);
            }
            
            // Show final status
            showResults();
          }
        );
      } else {
        showResults();
      }
    }
  );
};

const showResults = () => {
  console.log('\n📊 Updated Payment Status:');
  db.all("SELECT id, service_name, status FROM payments ORDER BY id DESC LIMIT 3", (err, payments) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return;
    }
    console.table(payments);
    
    console.log('\n📋 Updated Booking Status:');
    db.all("SELECT id, service_id, status, payment_status FROM bookings WHERE payment_status = 'paid'", (err, bookings) => {
      if (err) {
        console.error('Error fetching bookings:', err);
        return;
      }
      
      if (bookings.length === 0) {
        console.log('ℹ️  No paid bookings found');
      } else {
        console.table(bookings);
      }
      
      db.close();
      console.log('\n🎉 Webhook simulation complete!');
    });
  });
};

// Get the latest payment session and simulate completion
db.get(
  "SELECT stripe_session_id FROM payments ORDER BY id DESC LIMIT 1",
  (err, row) => {
    if (err) {
      console.error('Error fetching latest payment:', err);
      return;
    }
    
    if (!row) {
      console.log('❌ No payments found to simulate');
      return;
    }
    
    // For this test, let's assume it's for booking ID 1 (you can modify this)
    const bookingId = 1; // Change this to match your actual booking
    simulateWebhookCompletion(row.stripe_session_id, bookingId);
  }
);
