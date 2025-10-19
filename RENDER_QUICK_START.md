# ⚡ Render Deployment - Quick Start

**Goal:** Deploy Express + Socket.IO backend to Render in 10 minutes

---

## 🚀 Step-by-Step (Fast Track)

### 1️⃣ Prepare Your Code (Already Done! ✅)

Your backend is now ready with:
- ✅ Production-ready CORS configuration
- ✅ Dynamic port handling for Render
- ✅ Environment variable support
- ✅ Socket.IO configured for production

### 2️⃣ Push to GitHub

```bash
cd server/
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 3️⃣ Create Render Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Fill in:
   - **Name:** `petcarehub-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free (or paid for 24/7)

### 4️⃣ Add Environment Variables

Copy-paste these into Render's Environment section:

```bash
NODE_ENV=production

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

STRIPE_SECRET_KEY=sk_live_your_key
GEMINI_API_KEY=your_gemini_key

FRONTEND_URL=https://petcarehub-fyp.web.app
VERCEL_URL=https://your-vercel-app.vercel.app
```

**Where to get these values:**

| Variable | Where to Find |
|----------|---------------|
| Firebase credentials | Firebase Console → Project Settings → Service Accounts → Generate Private Key |
| Stripe key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| Gemini key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| Frontend URL | Your Firebase Hosting URL |

### 5️⃣ Deploy!

Click **"Create Web Service"** and wait 2-3 minutes.

Your backend will be live at: `https://petcarehub-backend.onrender.com`

### 6️⃣ Update Frontend

Update your React app to use the new backend URL:

```javascript
// src/config/api.js
const API_BASE_URL = 'https://petcarehub-backend.onrender.com';

// src/hooks/useSocket.js
const socket = io('https://petcarehub-backend.onrender.com', {
  reconnection: true,
  reconnectionAttempts: Infinity
});
```

Then rebuild and deploy frontend:

```bash
npm run build
firebase deploy --only hosting
```

---

## ✅ Verify Deployment

Test your backend:

```bash
# Test API
curl https://petcarehub-backend.onrender.com/api/users

# Test health
curl https://petcarehub-backend.onrender.com/api/pet-location
```

---

## ⚠️ Important Notes

**Free Tier Behavior:**
- Backend sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Recommended: Upgrade to $7/month for 24/7 uptime

**Socket.IO Auto-Reconnect:**
- Already configured in your code ✅
- Clients will auto-reconnect when backend wakes up

**Keep Backend Awake (Optional):**
Add this to your frontend:

```javascript
// Ping every 10 minutes to prevent sleep
setInterval(() => {
  fetch('https://petcarehub-backend.onrender.com/api/users')
    .catch(() => {});
}, 10 * 60 * 1000);
```

---

## 🐛 Quick Troubleshooting

**Issue: Backend won't start**
→ Check Render logs for errors
→ Verify all environment variables are set

**Issue: CORS errors**
→ Update `allowedOrigins` in `server/index.js` with your actual domains

**Issue: Firebase errors**
→ Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters
→ Verify project ID matches your Firebase project

**Issue: Socket.IO not connecting**
→ Check frontend is using correct Render URL
→ Wait 30 seconds if backend was sleeping

---

## 📚 Full Documentation

For detailed guides, troubleshooting, and advanced configuration, see:

**[RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)**

---

## 🎯 Your Complete Architecture

```
Frontend (Firebase Hosting)
    ↓ HTTPS
Backend (Render - Express + Socket.IO)
    ↓ APIs
External Services (Vercel - Gemini AI, etc.)
    ↓
Database (Firebase Firestore + Realtime DB)
```

---

## 🆘 Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Review environment variables: Dashboard → Environment
3. Test locally first: `cd server && npm start`
4. See full guide: [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

---

**That's it! Your backend is live! 🎉**

Now you have:
- ✅ Real-time WebSocket support for pet tracking
- ✅ Scalable Express.js backend
- ✅ Automatic deployments from GitHub
- ✅ Free hosting (with upgrade option)


