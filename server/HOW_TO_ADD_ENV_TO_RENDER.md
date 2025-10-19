# 📝 How to Add Environment Variables to Render

**Important:** Render doesn't accept `.env` files. You add environment variables through the Render Dashboard.

---

## 🎯 Visual Step-by-Step Guide

### Step 1: Access Your Service

```
1. Go to: https://dashboard.render.com
2. Click on your service: petcarehub-backend
```

### Step 2: Navigate to Environment Section

```
In the left sidebar, click:
┌─────────────────────┐
│ 📊 Dashboard        │
│ ⚙️  Settings        │
│ 🌍 Environment      │ ← Click here
│ 🔧 Deploy           │
│ 📊 Metrics          │
│ 📝 Logs             │
└─────────────────────┘
```

### Step 3: Add Environment Variables

You'll see a page like this:

```
┌─────────────────────────────────────────────────────────┐
│  Environment                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Environment variables are encrypted and made           │
│  available to your service at runtime.                  │
│                                                         │
│  [+ Add Environment Variable]                           │
│                                                         │
│  Key                          Value                     │
│  ──────────────────────────────────────────────────     │
│                                                         │
│  No environment variables yet                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Click "Add Environment Variable"

For each variable, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  Add Environment Variable                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Key:                                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ NODE_ENV                                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Value:                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ production                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [ Add ]  [ Cancel ]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Add These Variables One by One

Copy each KEY and VALUE from `RENDER_ENV_VARIABLES.txt` file:

### Variable 1: NODE_ENV
```
Key:   NODE_ENV
Value: production
```
Click **Add**

### Variable 2: FIREBASE_PROJECT_ID
```
Key:   FIREBASE_PROJECT_ID
Value: your-project-id
```
*Replace with your actual Firebase project ID*

Click **Add**

### Variable 3: FIREBASE_CLIENT_EMAIL
```
Key:   FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```
*Replace with your actual client email from Firebase JSON*

Click **Add**

### Variable 4: FIREBASE_PRIVATE_KEY
```
Key:   FIREBASE_PRIVATE_KEY
Value: "-----BEGIN PRIVATE KEY-----
Your entire private key here
Keep all the newlines
-----END PRIVATE KEY-----"
```
*Copy the ENTIRE private key from your Firebase JSON file*

**Important Tips for Private Key:**
- Include the opening quotes `"`
- Include `-----BEGIN PRIVATE KEY-----`
- Include all the key content
- Include `-----END PRIVATE KEY-----`
- Include the closing quotes `"`
- Keep the `\n` characters or actual newlines

Click **Add**

### Variable 5: FIREBASE_DATABASE_URL
```
Key:   FIREBASE_DATABASE_URL
Value: https://your-project-id-default-rtdb.firebaseio.com
```
*Replace with your actual Realtime Database URL*

Click **Add**

### Variable 6: STRIPE_SECRET_KEY
```
Key:   STRIPE_SECRET_KEY
Value: sk_live_your_stripe_secret_key
```
*Replace with your actual Stripe secret key*

Click **Add**

### Variable 7: STRIPE_WEBHOOK_SECRET
```
Key:   STRIPE_WEBHOOK_SECRET
Value: whsec_your_webhook_secret
```
*Replace with your Stripe webhook secret (or add later)*

Click **Add**

### Variable 8: GEMINI_API_KEY
```
Key:   GEMINI_API_KEY
Value: your_gemini_api_key
```
*Replace with your Google Gemini API key*

Click **Add**

### Variable 9: FRONTEND_URL
```
Key:   FRONTEND_URL
Value: https://petcarehub-fyp.web.app
```
*Replace with your actual Firebase Hosting URL*

Click **Add**

### Variable 10: VERCEL_URL (Optional)
```
Key:   VERCEL_URL
Value: https://your-vercel-app.vercel.app
```
*Replace with your Vercel URL if using Vercel*

Click **Add**

---

## 💾 Save Changes

After adding all variables:

```
┌─────────────────────────────────────────────────────────┐
│  Environment                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Add Environment Variable]                           │
│                                                         │
│  Key                          Value                     │
│  ──────────────────────────────────────────────────     │
│  NODE_ENV                     ••••••••••               │
│  FIREBASE_PROJECT_ID          ••••••••••               │
│  FIREBASE_CLIENT_EMAIL        ••••••••••               │
│  FIREBASE_PRIVATE_KEY         ••••••••••               │
│  FIREBASE_DATABASE_URL        ••••••••••               │
│  STRIPE_SECRET_KEY            ••••••••••               │
│  GEMINI_API_KEY               ••••••••••               │
│  FRONTEND_URL                 ••••••••••               │
│                                                         │
│  [Save Changes]                                         │
└─────────────────────────────────────────────────────────┘
```

Click **"Save Changes"** button at the bottom.

---

## 🔄 Automatic Redeployment

After saving:

```
✅ Environment variables saved
🔄 Deploying new version...
```

Render will automatically redeploy your service with the new environment variables.

This takes about 2-3 minutes.

---

## 🧪 Verify Deployment

### Check Logs

Go to **Logs** in the left sidebar and look for:

```
✅ Using Firestore for database operations
✅ Firebase Admin initialized with environment variables
✅ Project ID: your-project-id
✅ Realtime Database URL: https://your-project-rtdb.firebaseio.com
Server running on port 10000
Socket.IO enabled for real-time pet tracking
```

### Test Your Backend

```bash
# Test API endpoint
curl https://your-app.onrender.com/api/users

# Test pet location
curl https://your-app.onrender.com/api/pet-location
```

Both should return JSON responses (not errors).

---

## 🎯 Quick Checklist

- [ ] Opened Render Dashboard
- [ ] Selected petcarehub-backend service
- [ ] Clicked "Environment" in sidebar
- [ ] Added all 9-10 environment variables
- [ ] Saved changes
- [ ] Waited for redeployment (2-3 min)
- [ ] Checked logs for successful initialization
- [ ] Tested API endpoints

---

## ⚠️ Common Issues

### Issue: "Firebase connection failed"
**Solution:** Check `FIREBASE_PRIVATE_KEY` format
- Make sure quotes are included
- Verify `\n` characters are present
- Try copying the key again from JSON

### Issue: "Invalid project ID"
**Solution:** Double-check `FIREBASE_PROJECT_ID`
- Should match your Firebase Console project
- No spaces or special characters

### Issue: "Stripe error"
**Solution:** Verify Stripe key
- Use test key (`sk_test_`) for testing
- Use live key (`sk_live_`) for production
- Check key is not expired

---

## 💡 Pro Tips

1. **Use Secret Keys Only**
   - Never paste publishable keys in environment variables
   - Secret keys should start with `sk_`

2. **Copy-Paste Carefully**
   - Avoid extra spaces before/after values
   - Don't include quotes around values (except FIREBASE_PRIVATE_KEY)

3. **Test Locally First**
   - Create a local `.env` file with same values
   - Test with `npm start` before deploying

4. **Update as Needed**
   - You can edit variables anytime
   - Service will auto-redeploy on save

---

## 📚 Where to Get Credentials

See the file: **`GET_YOUR_CREDENTIALS.md`** for detailed instructions on where to find each credential.

---

## 🆘 Still Stuck?

Check the full deployment guides:
- `RENDER_QUICK_START.md` - Fast deployment
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete guide
- `RENDER_VISUAL_GUIDE.md` - Visual walkthrough

Or visit Render docs: https://render.com/docs/environment-variables

---

**That's it! Your backend will be live in 3-5 minutes! 🚀**


