# 🚀 Vercel Deployment - Quick Start

## ✅ What's Ready

Your backend API is **ready to deploy**! Here's what's been configured:

- ✅ **3 API endpoints** created (Stripe, Gemini, Firestore)
- ✅ **CORS configured** for your Firebase Hosting domain
- ✅ **Environment variables** prepared
- ✅ **Vercel configuration** file created
- ✅ **Dependencies** installed

---

## 📋 Environment Variables (Ready to Use)

Your environment variables have been prepared in: `.vercel-env-vars.txt`

**Quick Copy:**
```bash
cat .vercel-env-vars.txt
```

---

## 🎯 Deploy in 5 Minutes

### Method 1: Vercel Dashboard (Recommended - No CLI needed)

#### Step 1: Sign Up / Login
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended) or email

#### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import from Git or drag & drop your project folder
3. Or use this command to create a GitHub repo:
   ```bash
   cd "/Users/abdulwaseyhussain/Desktop/programming/FYP  copy"
   git init
   git add .
   git commit -m "Initial commit with Vercel API"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

#### Step 3: Configure Project
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)

#### Step 4: Add Environment Variables
Click **"Environment Variables"** and add these 3 variables:

1. **STRIPE_SECRET_KEY**
   ```
   sk_test_51SEUewFg28xQAfMi0pPJJcOnVY2kZec25zkspUTTmXWW5jZeU9M8pb8tilKddVvVRdR59ParCFeSbBHRU1LOULqW00kKMzSiy4
   ```

2. **GEMINI_API_KEY**
   ```
   AIzaSyCTauGR3kNVGEM4137wVVcyp_1b8MV1bKA
   ```

3. **FIREBASE_SERVICE_ACCOUNT** (copy from `.vercel-env-vars.txt`)
   ```
   {"type":"service_account","project_id":"fyppp-5b4f0",...}
   ```

#### Step 5: Deploy!
Click **"Deploy"** and wait ~2 minutes.

---

### Method 2: Vercel CLI (If you prefer terminal)

#### Step 1: Install Vercel CLI
```bash
# Using npm
sudo npm install -g vercel

# Or using Homebrew (macOS)
brew install vercel-cli
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd "/Users/abdulwaseyhussain/Desktop/programming/FYP  copy"
vercel
```

Follow the prompts:
- **Set up and deploy**: Y
- **Which scope**: Choose your account
- **Link to existing project**: N (first time)
- **Project name**: petcarehub-api (or your choice)
- **Directory**: ./ 
- **Override settings**: N

#### Step 4: Add Environment Variables
```bash
# Add Stripe key
vercel env add STRIPE_SECRET_KEY

# Add Gemini key  
vercel env add GEMINI_API_KEY

# Add Firebase service account (paste the entire JSON string)
vercel env add FIREBASE_SERVICE_ACCOUNT
```

Choose **Production**, **Preview**, and **Development** for each.

#### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## 🌐 After Deployment

### Your API URL
After deployment, you'll get a URL like:
```
https://petcarehub-api-xxxxx.vercel.app
```

### Test Your Endpoints

#### 1. Health Check
```bash
curl https://your-project.vercel.app/api
```

#### 2. Create Payment Intent
```bash
curl -X POST https://your-project.vercel.app/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.99,
    "currency": "usd",
    "serviceName": "Dog Grooming"
  }'
```

#### 3. Generate AI Response
```bash
curl -X POST https://your-project.vercel.app/api/generate-ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are good dog foods?",
    "sessionId": "test_123"
  }'
```

#### 4. Store to Firestore
```bash
curl -X POST https://your-project.vercel.app/api/store-ai-output \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "test_data",
    "data": {"test": "Hello from API"},
    "userId": "test_user"
  }'
```

---

## 🔗 Connect to Your React Frontend

### Update Your Frontend API Configuration

Create or update `src/config/api.js`:

```javascript
// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-project.vercel.app/api'  // Replace with your Vercel URL
    : 'http://localhost:5001/api'
  );

export default API_BASE_URL;
```

### Add to `.env` (for production)
```bash
REACT_APP_API_BASE_URL=https://your-project.vercel.app/api
```

### Example Usage in React Components

```javascript
import API_BASE_URL from './config/api';

// Create payment intent
const handlePayment = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: servicePrice,
        serviceName: serviceName,
        userId: currentUser.id
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Handle successful payment intent creation
      console.log('Payment Intent:', data.paymentIntentId);
      console.log('Client Secret:', data.clientSecret);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};

// Get AI response
const getChatbotResponse = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-ai-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        sessionId: chatSessionId
      })
    });
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('AI error:', error);
    return 'Sorry, I encountered an error.';
  }
};

// Store data to Firestore
const saveAIResponse = async (question, answer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/store-ai-output`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: 'ai_conversations',
        data: {
          question,
          answer,
          timestamp: new Date().toISOString()
        },
        userId: currentUser.id
      })
    });
    
    const data = await response.json();
    console.log('Saved to Firestore:', data.documentId);
  } catch (error) {
    console.error('Storage error:', error);
  }
};
```

---

## 🔄 Redeploy After Changes

### Via Dashboard
1. Push changes to GitHub
2. Vercel auto-deploys (if connected to GitHub)

### Via CLI
```bash
vercel --prod
```

---

## 📊 Monitor Your API

### View Logs
```bash
vercel logs --follow
```

### Analytics
- Go to https://vercel.com/dashboard
- Select your project
- View Analytics, Functions, and Logs tabs

---

## ⚠️ Important Notes

1. **Firebase Service Account**: Keep it secret! Never commit to Git.
2. **Stripe Keys**: Use test keys for development, production keys for live.
3. **CORS**: Already configured for `https://fyppp-5b4f0.web.app`
4. **Rate Limiting**: Consider adding rate limiting for production.
5. **Costs**: Vercel free tier should be sufficient for development.

---

## 🆘 Troubleshooting

### Issue: "Invalid Firebase credentials"
- Verify the FIREBASE_SERVICE_ACCOUNT is a valid JSON string
- Check for extra quotes or spaces
- Re-copy from `.vercel-env-vars.txt`

### Issue: "Stripe API key invalid"
- Ensure you're using the correct key (test vs production)
- Check for spaces or line breaks

### Issue: CORS error
- Verify your Firebase Hosting domain is in `allowedOrigins`
- Check that requests include proper headers

### Issue: Function timeout
- Vercel has a 10-second timeout on free tier
- Optimize long-running operations
- Consider upgrading plan if needed

---

## ✅ Next Steps

1. **Deploy to Vercel** using one of the methods above
2. **Test all endpoints** using cURL or Postman
3. **Update your React frontend** to use the new API URL
4. **Redeploy your frontend** to Firebase Hosting
5. **Test end-to-end** payment and AI features

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

---

**Your backend is ready! Deploy now and start using external APIs.** 🚀

