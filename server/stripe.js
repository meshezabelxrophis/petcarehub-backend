const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create payments table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_session_id TEXT UNIQUE,
    user_id INTEGER,
    service_id INTEGER,
    service_name TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )
`);

// Create checkout session endpoint
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      serviceName, 
      price, 
      serviceId, 
      bookingId,
      userId, 
      currency = 'usd' 
    } = req.body;

    // Validate required fields
    if (!serviceName || !price) {
      return res.status(400).json({ 
        error: 'Service name and price are required' 
      });
    }

    // Convert price to cents (Stripe uses cents)
    const priceInCents = Math.round(parseFloat(price) * 100);

    if (priceInCents <= 0) {
      return res.status(400).json({ 
        error: 'Price must be greater than 0' 
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceName,
              description: `Pet care service: ${serviceName}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancelled`,
      metadata: {
        service_id: serviceId?.toString() || '',
        user_id: userId?.toString() || '',
        service_name: serviceName,
        booking_id: bookingId?.toString() || '',
      },
    });

    // Store payment record in database
    db.run(
      `INSERT INTO payments (stripe_session_id, user_id, service_id, service_name, amount, currency, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [session.id, userId, serviceId, serviceName, priceInCents, currency, 'pending'],
      function(err) {
        if (err) {
          console.error('Error storing payment record:', err);
        } else {
          console.log('Payment record created with ID:', this.lastID);
        }
      }
    );

    res.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful for session:', session.id);

      // Update payment status in database
      db.run(
        `UPDATE payments 
         SET status = ?, completed_at = CURRENT_TIMESTAMP 
         WHERE stripe_session_id = ?`,
        ['completed', session.id],
        function(err) {
          if (err) {
            console.error('Error updating payment status:', err);
          } else {
            console.log(`Payment completed for session ${session.id}, rows affected: ${this.changes}`);
            
            // Here you can add additional logic like:
            // - Send confirmation email
            // - Update booking status
            // - Notify service provider
            // - Create booking record
            
            // Update the booking payment status if bookingId is provided
            const { service_id, user_id, service_name, booking_id } = session.metadata;
            
            if (booking_id) {
              // Update existing booking payment status
              db.run(
                `UPDATE bookings 
                 SET payment_status = ?, stripe_session_id = ? 
                 WHERE id = ?`,
                ['paid', session.id, booking_id],
                function(bookingErr) {
                  if (bookingErr) {
                    console.error('Error updating booking payment status:', bookingErr);
                  } else {
                    console.log(`Booking #${booking_id} marked as paid, rows affected: ${this.changes}`);
                  }
                }
              );
            } else if (service_id && user_id) {
              // Legacy: Create a booking record if no booking_id provided
              db.run(
                `INSERT INTO bookings (user_id, service_id, status, payment_status, created_at) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [user_id, service_id, 'confirmed', 'paid'],
                function(bookingErr) {
                  if (bookingErr) {
                    console.error('Error creating booking:', bookingErr);
                  } else {
                    console.log('Booking created with ID:', this.lastID);
                  }
                }
              );
            }
          }
        }
      );
      break;

    case 'checkout.session.expired':
      console.log('Checkout session expired:', event.data.object.id);
      // Update payment status to expired
      db.run(
        `UPDATE payments SET status = ? WHERE stripe_session_id = ?`,
        ['expired', event.data.object.id]
      );
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      // Handle failed payment
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Get payment status endpoint
router.get('/payment-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  db.get(
    `SELECT * FROM payments WHERE stripe_session_id = ?`,
    [sessionId],
    (err, row) => {
      if (err) {
        console.error('Error fetching payment status:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({
        id: row.id,
        sessionId: row.stripe_session_id,
        status: row.status,
        serviceName: row.service_name,
        amount: row.amount,
        currency: row.currency,
        createdAt: row.created_at,
        completedAt: row.completed_at
      });
    }
  );
});

// Get user's payment history
router.get('/payments/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching payment history:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const payments = rows.map(row => ({
        id: row.id,
        sessionId: row.stripe_session_id,
        serviceName: row.service_name,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at
      }));

      res.json(payments);
    }
  );
});

// Manual webhook trigger for testing (remove in production)
router.post('/test-webhook-completion', (req, res) => {
  const { sessionId, bookingId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  console.log(`🧪 Manual webhook trigger for session: ${sessionId}, booking: ${bookingId}`);
  
  // Update payment status
  db.run(
    `UPDATE payments 
     SET status = ?, completed_at = CURRENT_TIMESTAMP 
     WHERE stripe_session_id = ?`,
    ['completed', sessionId],
    function(err) {
      if (err) {
        console.error('❌ Error updating payment status:', err);
        return res.status(500).json({ error: 'Failed to update payment' });
      }
      
      console.log(`✅ Payment completed for session ${sessionId}, rows affected: ${this.changes}`);
      
      if (bookingId) {
        // Update booking payment status
        db.run(
          `UPDATE bookings 
           SET payment_status = ?, stripe_session_id = ? 
           WHERE id = ?`,
          ['paid', sessionId, bookingId],
          function(bookingErr) {
            if (bookingErr) {
              console.error('❌ Error updating booking payment status:', bookingErr);
              return res.status(500).json({ error: 'Failed to update booking' });
            } else {
              console.log(`✅ Booking #${bookingId} marked as paid, rows affected: ${this.changes}`);
              res.json({ 
                success: true, 
                message: `Payment and booking updated successfully`,
                paymentUpdated: true,
                bookingUpdated: this.changes > 0
              });
            }
          }
        );
      } else {
        res.json({ 
          success: true, 
          message: 'Payment updated successfully',
          paymentUpdated: true,
          bookingUpdated: false
        });
      }
    }
  );
});

module.exports = router;
