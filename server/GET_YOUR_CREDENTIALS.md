# 🔑 Where to Get Your Credentials

This guide shows you exactly where to find each credential you need for Render deployment.

---

## 1️⃣ Firebase Credentials

### Step-by-Step:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project (e.g., `petcarehub-fyp`)

2. **Navigate to Service Accounts**
   - Click the ⚙️ **Settings** icon (top left)
   - Select **Project settings**
   - Go to the **"Service accounts"** tab

3. **Generate Private Key**
   - Click **"Generate new private key"** button
   - Click **"Generate key"** in the popup
   - A JSON file will download (e.g., `petcarehub-fyp-firebase-adminsdk-xxxxx.json`)

4. **Extract Values from Downloaded JSON**

   Open the downloaded JSON file and find these values:

   ```json
   {
     "project_id": "petcarehub-fyp",           ← FIREBASE_PROJECT_ID
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  ← FIREBASE_PRIVATE_KEY
     "client_email": "firebase-adminsdk-xxxxx@petcarehub-fyp.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
     ...
   }
   ```

5. **Get Realtime Database URL**
   - In Firebase Console, click **"Realtime Database"** in left sidebar
   - Copy the URL at the top (e.g., `https://petcarehub-fyp-default-rtdb.firebaseio.com`)
   - This is your `FIREBASE_DATABASE_URL`

---

## 2️⃣ Stripe Credentials

### Step-by-Step:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - Log in to your account

2. **Get API Keys**
   - Click **"Developers"** in the top menu
   - Click **"API keys"** in the left sidebar

3. **Copy Keys**
   - **Secret key**: Click "Reveal test key" or "Reveal live key"
     - Test: `sk_test_...` (for testing)
     - Live: `sk_live_...` (for production)
   - This is your `STRIPE_SECRET_KEY`

4. **Get Webhook Secret** (Optional, for payment webhooks)
   - Click **"Webhooks"** in the left sidebar
   - After deploying to Render, add webhook endpoint:
     - Endpoint URL: `https://your-app.onrender.com/api/webhook`
   - Copy the **Signing secret** (starts with `whsec_`)
   - This is your `STRIPE_WEBHOOK_SECRET`

---

## 3️⃣ Google Gemini AI Key

### Step-by-Step:

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click **"Create API Key"** button
   - Select your Google Cloud project (or create new)
   - Copy the generated key (starts with `AIza...`)
   - This is your `GEMINI_API_KEY`

**Alternative - Using Google Cloud Console:**
1. Go to: https://console.cloud.google.com
2. Enable "Generative Language API"
3. Go to "APIs & Services" → "Credentials"
4. Create API key

---

## 4️⃣ Frontend URLs

### Firebase Hosting URL

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Check Hosting**
   - Click **"Hosting"** in left sidebar
   - Your URL will be shown (e.g., `https://petcarehub-fyp.web.app`)
   - This is your `FRONTEND_URL`

### Vercel URL (if using Vercel)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your project

2. **Copy Production URL**
   - Click on your project
   - Copy the URL (e.g., `https://your-project.vercel.app`)
   - This is your `VERCEL_URL`

---

## 📋 Quick Reference Checklist

After gathering all credentials, you should have:

- [ ] `FIREBASE_PROJECT_ID` - From downloaded JSON
- [ ] `FIREBASE_CLIENT_EMAIL` - From downloaded JSON
- [ ] `FIREBASE_PRIVATE_KEY` - From downloaded JSON (full key with `\n`)
- [ ] `FIREBASE_DATABASE_URL` - From Realtime Database page
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard → API keys
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard → Webhooks (after Render deploy)
- [ ] `GEMINI_API_KEY` - From Google AI Studio
- [ ] `FRONTEND_URL` - Your Firebase Hosting URL
- [ ] `VERCEL_URL` - Your Vercel deployment URL (optional)

---

## 🚀 Next: Add to Render

Once you have all these credentials:

1. Go to https://dashboard.render.com
2. Select your service
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each KEY=VALUE pair
6. Click **"Save Changes"**
7. Render will automatically redeploy with new variables

---

## ⚠️ Security Tips

- **Never commit credentials to Git** - They're already in `.gitignore`
- **Use test keys for development** - Use live keys only in production
- **Rotate keys periodically** - Change credentials every few months
- **Keep JSON files secure** - Store Firebase service account file safely
- **Enable 2FA** - Use two-factor auth on Firebase, Stripe, Google accounts

---

## 🆘 Troubleshooting

### Firebase Private Key Issues

If Firebase connection fails, check your `FIREBASE_PRIVATE_KEY` format:

**Correct format in Render:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...\n-----END PRIVATE KEY-----\n"
```

**Common mistakes:**
- ❌ Missing quotes around the key
- ❌ Missing `\n` characters (newlines)
- ❌ Extra spaces or line breaks

### Stripe Key Issues

- Make sure you're using **Secret Key** (not Publishable Key)
- Test keys start with `sk_test_`
- Live keys start with `sk_live_`

### Gemini API Issues

- Enable "Generative Language API" in Google Cloud Console
- Check API quotas and limits
- Verify API key is active

---

**Need help?** Check the full guides:
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `RENDER_QUICK_START.md` - Fast track guide
- `README.md` - Backend documentation


