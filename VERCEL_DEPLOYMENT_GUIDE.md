# Vercel Backend Deployment Guide

## 🎯 Overview

This guide will help you deploy your Node.js + Express backend with external API integrations (Stripe, Gemini, Firestore) to Vercel.

---

## 📁 Project Structure

```
/
├── api/                              # Vercel serverless functions
│   ├── index.js                      # Health check endpoint
│   ├── create-payment-intent.js      # Stripe payment intent
│   ├── generate-ai-response.js       # Gemini AI responses
│   ├── store-ai-output.js           # Firestore operations
│   └── package.json                 # API dependencies
├── vercel.json                      # Vercel configuration
└── .vercelignore                    # Files to exclude from deployment
```

---

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

#### 1. **STRIPE_SECRET_KEY**
Get from: https://dashboard.stripe.com/apikeys

```bash
# Test key (starts with sk_test_)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

#### 2. **GEMINI_API_KEY**
Get from: https://makersuite.google.com/app/apikey

```bash
GEMINI_API_KEY=your_gemini_api_key
```

#### 3. **FIREBASE_SERVICE_ACCOUNT**
This should be your Firebase service account as a **JSON string** (minified, no line breaks).

```bash
# Convert your firebase-service-account.json to a single-line string
# On macOS/Linux:
cat firebase-service-account.json | jq -c . | pbcopy

# Or manually copy and minify:
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"fyppp-5b4f0",...}'
```

### Step 4: Set Environment Variables in Vercel

#### Option A: Via Vercel CLI (During First Deploy)
```bash
cd "/Users/abdulwaseyhussain/Desktop/programming/FYP  copy"
vercel
```

The CLI will prompt you to add environment variables.

#### Option B: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `STRIPE_SECRET_KEY`
   - `GEMINI_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT`

### Step 5: Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

Or use the deployment script:

```bash
npm run deploy:vercel
```

---

## 📡 API Endpoints

Once deployed, your API will be available at: `https://your-project.vercel.app`

### Health Check
```
GET https://your-project.vercel.app/api
```

Response:
```json
{
  "status": "ok",
  "message": "PetCareHub External API",
  "version": "1.0.0",
  "endpoints": {
    "stripe": "/api/create-payment-intent",
    "gemini": "/api/generate-ai-response",
    "firestore": "/api/store-ai-output"
  }
}
```

### 1. Create Payment Intent (Stripe)

**Endpoint:** `POST /api/create-payment-intent`

**Request Body:**
```json
{
  "amount": 50.00,
  "currency": "usd",
  "serviceName": "Dog Grooming",
  "serviceId": "service_123",
  "userId": "user_456",
  "bookingId": "booking_789",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 5000,
  "currency": "usd",
  "serviceName": "Dog Grooming"
}
```

### 2. Generate AI Response (Gemini)

**Endpoint:** `POST /api/generate-ai-response`

**Request Body:**
```json
{
  "message": "What are the best foods for my dog?",
  "sessionId": "user_session_123",
  "systemPrompt": "You are a helpful pet care assistant...",
  "context": {
    "userPets": ["Dog", "Cat"],
    "location": "New York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Here are the best foods for your dog...",
  "sessionId": "user_session_123",
  "messageCount": 4
}
```

### 3. Store AI Output (Firestore)

**Endpoint:** `POST /api/store-ai-output`

**Request Body:**
```json
{
  "collection": "ai_responses",
  "data": {
    "question": "What are the symptoms of parvovirus?",
    "response": "Parvovirus symptoms include...",
    "category": "health"
  },
  "userId": "user_123",
  "sessionId": "session_456",
  "metadata": {
    "source": "chatbot",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "success": true,
  "documentId": "doc_abc123",
  "collection": "ai_responses",
  "message": "Data stored successfully"
}
```

**Retrieve Data:** `GET /api/store-ai-output?collection=ai_responses&userId=user_123&limit=10`

---

## 🔒 CORS Configuration

The API is configured to accept requests from:

- `https://fyppp-5b4f0.web.app` (Your Firebase Hosting)
- `https://fyppp-5b4f0.firebaseapp.com` (Alternative Firebase domain)
- `http://localhost:3000` (Local development)
- `http://localhost:5003` (Firebase emulator)

To add more domains, edit the `allowedOrigins` array in each API file.

---

## 🧪 Testing Your API

### Test with cURL

```bash
# Health check
curl https://your-project.vercel.app/api

# Create payment intent
curl -X POST https://your-project.vercel.app/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.99,
    "currency": "usd",
    "serviceName": "Pet Grooming"
  }'

# Generate AI response
curl -X POST https://your-project.vercel.app/api/generate-ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about dog vaccination schedules",
    "sessionId": "test_session"
  }'

# Store data to Firestore
curl -X POST https://your-project.vercel.app/api/store-ai-output \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "test_data",
    "data": {
      "test": "Hello from API",
      "timestamp": "2025-10-18"
    },
    "userId": "test_user"
  }'
```

### Test from Your React App

Update your frontend API calls to use the Vercel URL:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-project.vercel.app/api'
  : 'http://localhost:5001/api';

// Stripe payment
const createPaymentIntent = async (amount, serviceName) => {
  const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      serviceName,
      userId: currentUser.id
    })
  });
  
  return response.json();
};

// Gemini AI
const getAIResponse = async (message, sessionId) => {
  const response = await fetch(`${API_BASE_URL}/generate-ai-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      sessionId
    })
  });
  
  return response.json();
};

// Firestore storage
const storeData = async (data, userId) => {
  const response = await fetch(`${API_BASE_URL}/store-ai-output`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      collection: 'ai_responses',
      data,
      userId
    })
  });
  
  return response.json();
};
```

---

## 🔄 Continuous Deployment

### Connect to GitHub

1. Push your code to GitHub
2. Go to Vercel Dashboard
3. Import your GitHub repository
4. Vercel will automatically deploy on every push to `main`

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview (staging)
vercel
```

---

## 🛠️ Troubleshooting

### Issue: CORS Errors

**Solution:** Make sure your Firebase Hosting domain is in the `allowedOrigins` array in each API file.

### Issue: Firebase Admin Initialization Failed

**Solution:** 
1. Verify `FIREBASE_SERVICE_ACCOUNT` is a valid JSON string
2. Check that the service account has proper permissions in Firebase Console
3. Ensure it's not wrapped in quotes (should be raw JSON)

### Issue: Stripe API Key Invalid

**Solution:**
1. Verify you're using the correct key (test vs. production)
2. Check for extra spaces or line breaks
3. Ensure the key starts with `sk_test_` or `sk_live_`

### Issue: Gemini API Rate Limit

**Solution:**
1. Check your API quota in Google AI Studio
2. Implement rate limiting in your frontend
3. Consider upgrading your Gemini API plan

### Issue: 500 Internal Server Error

**Solution:**
1. Check Vercel logs: `vercel logs`
2. Look for environment variable issues
3. Verify all dependencies are installed

---

## 📊 Monitoring & Logs

### View Deployment Logs

```bash
vercel logs
```

### View Function Logs (Real-time)

```bash
vercel logs --follow
```

### Vercel Dashboard

Access detailed analytics:
- https://vercel.com/dashboard
- Functions → Your Project → Logs

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Enable Stripe webhook signing** in production
5. **Implement rate limiting** for AI endpoints
6. **Validate all inputs** before processing
7. **Use HTTPS only** (Vercel provides this automatically)

---

## 💰 Cost Considerations

### Vercel Free Tier Limits:
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- 12 serverless functions

### If You Exceed:
- Upgrade to Vercel Pro ($20/month)
- Or split services (Stripe on Vercel, Gemini elsewhere)

### External Service Costs:
- **Stripe**: 2.9% + $0.30 per transaction
- **Gemini API**: Free tier available, then pay-as-you-go
- **Firebase**: Spark (free) or Blaze (pay-as-you-go)

---

## 🎯 Next Steps

- [ ] Deploy to Vercel
- [ ] Test all endpoints
- [ ] Update frontend to use Vercel API URLs
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring and alerts
- [ ] Implement rate limiting
- [ ] Add authentication middleware

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Your API is now ready to handle production traffic!** 🚀

