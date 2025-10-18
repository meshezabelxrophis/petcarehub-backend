# PetCareHub External API

Node.js + Express backend with Stripe, Gemini AI, and Firebase Admin SDK integration.

## 🚀 Quick Deploy

```bash
# Install Vercel CLI
sudo npm install -g vercel

# Login and deploy
vercel login
cd ..
./deploy-vercel.sh
```

## 📡 Endpoints

### Health Check
```
GET /api
```

### Create Payment Intent (Stripe)
```
POST /api/create-payment-intent

Body:
{
  "amount": 50.00,
  "currency": "usd",
  "serviceName": "Dog Grooming",
  "userId": "user_123"
}
```

### Generate AI Response (Gemini)
```
POST /api/generate-ai-response

Body:
{
  "message": "What are the best foods for dogs?",
  "sessionId": "session_123"
}
```

### Store to Firestore
```
POST /api/store-ai-output

Body:
{
  "collection": "ai_responses",
  "data": {"question": "...", "answer": "..."},
  "userId": "user_123"
}
```

### Retrieve from Firestore
```
GET /api/store-ai-output?collection=ai_responses&userId=user_123&limit=10
```

## 🔐 Environment Variables

Set these in Vercel:
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (JSON string)

## 📚 Documentation

See parent directory for complete guides:
- `../VERCEL_QUICK_START.md` - 5-minute setup
- `../VERCEL_DEPLOYMENT_GUIDE.md` - Full guide
- `../API_SUMMARY.md` - Complete reference

## 🧪 Testing

```bash
# Test all endpoints
cd ..
node scripts/test-api.js
```

## 🌐 CORS

Configured for:
- `https://fyppp-5b4f0.web.app`
- `https://fyppp-5b4f0.firebaseapp.com`
- `http://localhost:3000`
- `http://localhost:5003`

