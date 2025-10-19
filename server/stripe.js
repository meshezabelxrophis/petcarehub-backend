const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('./config/firebaseAdmin');
const { BookingService, PaymentService } = require('./services/firestoreService');

const router = express.Router();

console.log('✅ Stripe router initialized with Firestore');

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

    // Store payment record in Firestore
    try {
      const paymentData = {
        stripeSessionId: session.id,
        userId: userId || null,
        serviceId: serviceId || null,
        serviceName: serviceName,
        amount: priceInCents,
        currency: currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      const paymentRef = await PaymentService.createPayment(paymentData);
      console.log('✅ Payment record created:', paymentRef.id);
    } catch (err) {
      console.error('⚠️ Error storing payment record:', err);
      // Don't fail the checkout if payment record fails
    }

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
      console.log('💳 Payment successful for session:', session.id);

      // Update payment status in Firestore (async but don't wait)
      (async () => {
        try {
          await PaymentService.updatePaymentBySessionId(session.id, {
            status: 'completed',
            completedAt: new Date().toISOString()
          });
          console.log(`✅ Payment completed for session ${session.id}`);
        } catch (err) {
          console.error('⚠️ Error updating payment status:', err);
        }

        // Update the booking payment status if bookingId is provided
        const { booking_id, service_id, user_id } = session.metadata;
        
        if (booking_id) {
          try {
            await BookingService.updateBooking(booking_id, {
              paymentStatus: 'paid',
              stripeSessionId: session.id,
              status: 'confirmed'
            });
            console.log(`✅ Booking #${booking_id} marked as paid`);
          } catch (bookingErr) {
            console.error('⚠️ Error updating booking payment status:', bookingErr);
          }
        } else if (service_id && user_id) {
          // Legacy: Create a booking record if no booking_id provided
          try {
            const newBooking = await BookingService.createBooking({
              userId: user_id,
              serviceId: service_id,
              status: 'confirmed',
              paymentStatus: 'paid',
              stripeSessionId: session.id,
              bookingDate: new Date().toISOString()
            });
            console.log('✅ Booking created with ID:', newBooking.id);
          } catch (bookingErr) {
            console.error('⚠️ Error creating booking:', bookingErr);
          }
        }
      })();
      break;

    case 'checkout.session.expired':
      console.log('⏰ Checkout session expired:', event.data.object.id);
      // Update payment status to expired (async)
      PaymentService.updatePaymentBySessionId(event.data.object.id, {
        status: 'expired'
      }).catch(err => console.error('⚠️ Error updating expired payment:', err));
      break;

    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object.id);
      // Handle failed payment (you could update payment status here)
      break;

    default:
      console.log(`📌 Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Get payment status endpoint
router.get('/payment-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const payment = await PaymentService.getPaymentBySessionId(sessionId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      id: payment.id,
      sessionId: payment.stripeSessionId,
      status: payment.status,
      serviceName: payment.serviceName,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    });
  } catch (err) {
    console.error('❌ Error fetching payment status:', err);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Get user's payment history
router.get('/payments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await PaymentService.getPaymentsByUser(userId);

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      sessionId: payment.stripeSessionId,
      serviceName: payment.serviceName,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    }));

    res.json(formattedPayments);
  } catch (err) {
    console.error('❌ Error fetching payment history:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Manual webhook trigger for testing (remove in production)
router.post('/test-webhook-completion', async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    console.log(`🧪 Manual webhook trigger for session: ${sessionId}, booking: ${bookingId}`);
    
    // Update payment status in Firestore
    let paymentUpdated = false;
    try {
      await PaymentService.updatePaymentBySessionId(sessionId, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      console.log(`✅ Payment completed for session ${sessionId}`);
      paymentUpdated = true;
    } catch (err) {
      console.error('❌ Error updating payment status:', err);
      return res.status(500).json({ error: 'Failed to update payment' });
    }
    
    // Update booking if bookingId provided
    let bookingUpdated = false;
    if (bookingId) {
      try {
        await BookingService.updateBooking(bookingId, {
          paymentStatus: 'paid',
          stripeSessionId: sessionId,
          status: 'confirmed'
        });
        console.log(`✅ Booking #${bookingId} marked as paid`);
        bookingUpdated = true;
      } catch (bookingErr) {
        console.error('❌ Error updating booking payment status:', bookingErr);
        return res.status(500).json({ error: 'Failed to update booking' });
      }
    }
    
    res.json({ 
      success: true, 
      message: bookingId ? 'Payment and booking updated successfully' : 'Payment updated successfully',
      paymentUpdated,
      bookingUpdated
    });
    
  } catch (error) {
    console.error('❌ Error in test webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
