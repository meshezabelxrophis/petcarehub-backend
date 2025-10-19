# Stripe Integration Setup Guide

## Environment Variables Required

Add these to your `server/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

## API Endpoints Created

### 1. Create Checkout Session
- **POST** `/api/create-checkout-session`
- **Body**: 
  ```json
  {
    "serviceName": "Pet Grooming",
    "price": 50.00,
    "serviceId": 1,
    "userId": 123,
    "currency": "usd"
  }
  ```
- **Response**: 
  ```json
  {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/...",
    "success": true
  }
  ```

### 2. Webhook Handler
- **POST** `/api/webhook`
- Handles Stripe events (checkout.session.completed, etc.)
- Updates payment status in database
- Creates booking records automatically

### 3. Payment Status
- **GET** `/api/payment-status/:sessionId`
- Returns payment details and status

### 4. Payment History
- **GET** `/api/payments/:userId`
- Returns all payments for a user

## Database Tables Created

### payments
- `id` - Primary key
- `stripe_session_id` - Stripe session ID
- `user_id` - User who made payment
- `service_id` - Service being paid for
- `service_name` - Name of service
- `amount` - Amount in cents
- `currency` - Currency (default: usd)
- `status` - pending/completed/expired
- `created_at` - When payment was initiated
- `completed_at` - When payment was completed

## Webhook Setup Instructions

1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Add endpoint: `http://localhost:5001/api/webhook`
4. Select events: `checkout.session.completed`, `checkout.session.expired`
5. Copy the webhook secret to your .env file as `STRIPE_WEBHOOK_SECRET`

## Frontend Integration

Use the publishable key in your React app:
```javascript
const stripe = await loadStripe('pk_test_51SEUewFg28xQAfMiXtnKx3VybduPNdQmPwDO8bYIOZBpI7R6SwZTbVARm5Jez8Vdc7mSa50V4TgxBcalHa76SDti00BtzjrmdB');
```

## Testing

1. Use Stripe test card numbers:
   - Success: `4242424242424242`
   - Declined: `4000000000000002`

2. Test the flow:
   - Create checkout session
   - Complete payment
   - Verify webhook receives event
   - Check database for payment record

