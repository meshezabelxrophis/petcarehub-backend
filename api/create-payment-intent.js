/**
 * Stripe Payment Intent API
 * POST /api/create-payment-intent
 * 
 * Creates a Stripe payment intent for processing payments
 */

const cors = require('cors');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS configuration
const allowedOrigins = [
  'https://fyppp-5b4f0.web.app',
  'https://fyppp-5b4f0.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5003'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const corsMiddleware = cors(corsOptions);

module.exports = async (req, res) => {
  return new Promise((resolve) => {
    corsMiddleware(req, res, async () => {
      // Handle OPTIONS
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return resolve();
      }

      // Only allow POST
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return resolve();
      }

      try {
        const {
          amount,
          currency = 'usd',
          serviceName,
          serviceId,
          userId,
          bookingId,
          metadata = {}
        } = req.body;

        // Validate required fields
        if (!amount || !serviceName) {
          res.status(400).json({
            error: 'Missing required fields',
            required: ['amount', 'serviceName']
          });
          return resolve();
        }

        // Validate amount
        const amountInCents = Math.round(parseFloat(amount) * 100);
        if (amountInCents <= 0 || isNaN(amountInCents)) {
          res.status(400).json({
            error: 'Invalid amount',
            message: 'Amount must be a positive number'
          });
          return resolve();
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency,
          description: `Pet care service: ${serviceName}`,
          metadata: {
            service_name: serviceName,
            service_id: serviceId?.toString() || '',
            user_id: userId?.toString() || '',
            booking_id: bookingId?.toString() || '',
            ...metadata
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        console.log(`✅ Payment intent created: ${paymentIntent.id} for ${serviceName}`);

        res.status(200).json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amountInCents,
          currency: currency,
          serviceName: serviceName
        });

      } catch (error) {
        console.error('❌ Error creating payment intent:', error);
        
        res.status(500).json({
          error: 'Failed to create payment intent',
          message: error.message,
          type: error.type || 'api_error'
        });
      }

      resolve();
    });
  });
};

