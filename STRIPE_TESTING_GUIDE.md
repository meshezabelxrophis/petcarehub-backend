# 🧪 Stripe Payment Testing Guide

## 🔧 Setup & Configuration

### 1. Environment Variables
Make sure your `server/.env` file contains:
```env
# Stripe Test Keys (already configured)
STRIPE_SECRET_KEY=sk_test_51SEUewFg28xQAfMi0pPJJcOnVY2kZec25zkspUTTmXWW5jZeU9M8pb8tilKddVvVRdR59ParCFeSbBHRU1LOULqW00kKMzSiy4
STRIPE_PUBLISHABLE_KEY=pk_test_51SEUewFg28xQAfMiXtnKx3VybduPNdQmPwDO8bYIOZBpI7R6SwZTbVARm5Jez8Vdc7mSa50V4TgxBcalHa76SDti00BtzjrmdB
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
```

### 2. Database Verification
Check that these tables exist with payment fields:
```sql
-- bookings table should have:
ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN stripe_session_id TEXT;

-- payments table should exist:
CREATE TABLE payments (
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
);
```

## 💳 Stripe Test Cards

### ✅ Success Cards
- **4242 4242 4242 4242** - Visa (most common for testing)
- **4000 0566 5566 5556** - Visa (debit)
- **5555 5555 5555 4444** - Mastercard
- **3782 822463 10005** - American Express

### ❌ Error Cards
- **4000 0000 0000 0002** - Card declined
- **4000 0000 0000 9995** - Insufficient funds
- **4000 0000 0000 9987** - Lost card
- **4000 0000 0000 9979** - Stolen card

### 📅 Test Data
- **Expiry**: Any future date (e.g., 12/25, 01/26)
- **CVC**: Any 3-digit number (e.g., 123, 456)
- **ZIP**: Any 5-digit code (e.g., 12345)

## 🧪 Testing Flow

### Step 1: Create a Booking
1. Login as a **pet owner**
2. Go to `/services` and book a service
3. Service provider should confirm the booking
4. Booking status should be "confirmed" with payment status "unpaid"

### Step 2: Make Payment
1. Go to `/my-bookings`
2. Find the confirmed booking
3. Click the **"Pay $X.XX"** button
4. You'll be redirected to Stripe checkout

### Step 3: Complete Payment
1. Use test card: **4242 4242 4242 4242**
2. Expiry: **12/25** (any future date)
3. CVC: **123** (any 3 digits)
4. ZIP: **12345** (any 5 digits)
5. Click "Pay"

### Step 4: Verify Results
1. You should be redirected to success page
2. Check `/my-bookings` - payment status should show "Paid"
3. Provider should see "Paid" status in their dashboard

## 🔍 Database Verification

Check the database after payment:

```sql
-- Check booking payment status
SELECT id, service_id, payment_status, stripe_session_id 
FROM bookings 
WHERE payment_status = 'paid';

-- Check payment record
SELECT id, stripe_session_id, service_name, amount, status, completed_at 
FROM payments 
WHERE status = 'completed';
```

## 🚨 Troubleshooting

### Issue: Payment doesn't update booking
**Solution**: Check webhook configuration
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://localhost:5001/api/webhook`
3. Events to include: `checkout.session.completed`
4. Copy webhook secret to `.env`

### Issue: "Webhook signature verification failed"
**Solution**: 
1. Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Use ngrok for local testing:
   ```bash
   npm install -g ngrok
   ngrok http 5001
   # Use the ngrok URL for webhook endpoint
   ```

### Issue: Database not updating
**Solution**: Check server logs
```bash
# In server directory
npm run dev
# Watch for webhook logs and database updates
```

## 🎯 Quick Test Commands

### Test 1: Create Checkout Session
```bash
curl -X POST http://localhost:5001/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Pet Grooming",
    "price": 25.00,
    "serviceId": 1,
    "bookingId": 1,
    "userId": 1
  }'
```

### Test 2: Check Payment Status
```bash
curl http://localhost:5001/api/payment-status/cs_test_SESSION_ID
```

### Test 3: View Database
```bash
sqlite3 server/database.sqlite
.mode column
.headers on
SELECT * FROM bookings WHERE payment_status = 'paid';
SELECT * FROM payments WHERE status = 'completed';
```

## ✅ Expected Behavior

1. **Before Payment**: 
   - Booking: `payment_status = 'unpaid'`, `stripe_session_id = NULL`
   - No payment record exists

2. **During Payment**: 
   - Payment record created with `status = 'pending'`
   - User redirected to Stripe checkout

3. **After Successful Payment**: 
   - Webhook triggered
   - Booking: `payment_status = 'paid'`, `stripe_session_id = 'cs_test_...'`
   - Payment: `status = 'completed'`, `completed_at = timestamp`
   - UI updates to show "Paid" status

## 🎉 Success Indicators

- ✅ Pet owner sees "Paid" badge in My Bookings
- ✅ Service provider sees "Paid" badge in Manage Bookings  
- ✅ Database `bookings.payment_status = 'paid'`
- ✅ Database `payments.status = 'completed'`
- ✅ Console logs show webhook received and processed
