# 🚀 Render Deployment Guide - PetCareHub Backend

Complete guide to deploy your Express.js + Socket.IO backend to Render while keeping external APIs on Vercel and frontend on Firebase.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Render Configuration](#render-configuration)
4. [Deploy to Render](#deploy-to-render)
5. [Frontend Integration](#frontend-integration)
6. [Socket.IO Reconnection](#socketio-reconnection)
7. [Troubleshooting](#troubleshooting)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with your backend code (in `server/` folder)
- ✅ [Render.com](https://render.com) account (free tier available)
- ✅ Firebase project with Admin SDK credentials
- ✅ Stripe API keys
- ✅ Gemini API key (for AI chatbot)
- ✅ Firebase Hosting URL for your frontend
- ✅ Node.js 18+ installed locally (for testing)

---

## 🔐 Environment Setup

### Step 1: Gather Your Environment Variables

You'll need the following credentials:

#### Firebase Admin SDK

Get these from Firebase Console → Project Settings → Service Accounts:

1. Click "Generate new private key"
2. Download the JSON file
3. Extract these values:
   - `FIREBASE_PROJECT_ID`: `your-project-id`
   - `FIREBASE_CLIENT_EMAIL`: `firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com`
   - `FIREBASE_PRIVATE_KEY`: The entire private key (including BEGIN/END markers)
   - `FIREBASE_DATABASE_URL`: `https://your-project-id-default-rtdb.firebaseio.com`

#### Other APIs

- **Stripe**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
  - `STRIPE_SECRET_KEY`: `sk_live_...` or `sk_test_...`
  
- **Gemini**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - `GEMINI_API_KEY`: Your API key

#### Frontend URLs

- `FRONTEND_URL`: Your Firebase Hosting URL (e.g., `https://petcarehub-fyp.web.app`)
- `VERCEL_URL`: Your Vercel deployment URL (if using Vercel for external APIs)

---

## ⚙️ Render Configuration

### Step 1: Push Your Code to GitHub

```bash
cd server/
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `petcarehub-backend` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Plan** | Free (or upgrade for 24/7 uptime) |

### Step 3: Add Environment Variables

In the **Environment** section, add these variables:

```bash
NODE_ENV=production

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your private key content here (keep the quotes and newlines)
-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend URLs (for CORS)
FRONTEND_URL=https://petcarehub-fyp.web.app
VERCEL_URL=https://your-vercel-app.vercel.app
```

**⚠️ Important for FIREBASE_PRIVATE_KEY:**
- Include the entire key with quotes
- Keep the `\n` characters in the key
- Or paste the actual newlines (Render handles both formats)

### Step 4: Configure Auto Deploy

Enable **Auto-Deploy** to automatically deploy when you push to GitHub:

1. Scroll to **Auto-Deploy** section
2. Toggle **ON**
3. Select your main branch

---

## 🚀 Deploy to Render

### Automatic Deployment

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your server with `node index.js`
3. Wait 2-5 minutes for deployment
4. Your backend URL will be: `https://petcarehub-backend.onrender.com`

### Manual Deployment

To trigger a manual deployment:

1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔗 Frontend Integration

### Step 1: Update Your Frontend Code

Update your frontend API configuration to use the Render backend URL.

#### For React/Firebase Frontend

Update `src/config/api.js` or similar:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://petcarehub-backend.onrender.com'
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  USERS: `${API_BASE_URL}/api/users`,
  PETS: `${API_BASE_URL}/api/pets`,
  SERVICES: `${API_BASE_URL}/api/services`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  // ... other endpoints
};

export default API_BASE_URL;
```

### Step 2: Update Socket.IO Connection

Update your Socket.IO client configuration:

```javascript
// src/hooks/useGPSTracking.js or similar
import io from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://petcarehub-backend.onrender.com'
  : 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

export default socket;
```

### Step 3: Update Firebase Hosting Config

If using Firebase Hosting, update your `firebase.json`:

```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": {
          "region": "us-central1",
          "functionId": "api"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
```

### Step 4: Deploy Updated Frontend

```bash
# Build your React app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## 🔄 Socket.IO Reconnection

Render's free tier sleeps after 15 minutes of inactivity. Add reconnection logic:

### Auto-Reconnect Component

```javascript
// src/components/SocketConnection.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://petcarehub-backend.onrender.com'
  : 'http://localhost:5001';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setIsConnected(false);
      
      // Auto-reconnect if server went to sleep
      if (reason === 'io server disconnect') {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          socketInstance.connect();
        }, 1000);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      // Backend might be sleeping, try again
      setTimeout(() => {
        console.log('🔄 Retrying connection...');
        socketInstance.connect();
      }, 2000);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
```

### Wake-Up API Ping

Add a periodic ping to keep the backend awake:

```javascript
// src/utils/keepAlive.js
const BACKEND_URL = 'https://petcarehub-backend.onrender.com';

export const startKeepAlive = () => {
  // Ping backend every 10 minutes
  setInterval(() => {
    fetch(`${BACKEND_URL}/api/users`)
      .then(() => console.log('✅ Keep-alive ping successful'))
      .catch(() => console.log('⚠️ Keep-alive ping failed'));
  }, 10 * 60 * 1000); // 10 minutes
};

// Call this when app starts
// startKeepAlive();
```

---

## 🐛 Troubleshooting

### Issue: Backend Not Starting

**Check Render Logs:**
1. Go to Render Dashboard → Your Service → Logs
2. Look for errors in the startup process

**Common Issues:**
- Missing environment variables → Add them in Render dashboard
- Firebase credentials incorrect → Re-copy from Firebase Console
- Port binding issues → Render automatically provides PORT env var

### Issue: CORS Errors

**Solution:** Update allowed origins in `server/index.js`:

```javascript
const allowedOrigins = [
  'https://petcarehub-fyp.web.app',
  'https://petcarehub-fyp.firebaseapp.com',
  'https://your-vercel-app.vercel.app',
  'http://localhost:3000' // for local development
];
```

### Issue: Socket.IO Not Connecting

**Check:**
1. Socket URL is correct (use your Render URL)
2. CORS origins include your frontend domain
3. Backend is awake (visit backend URL directly)

**Test Socket Connection:**

```bash
# Install wscat
npm install -g wscat

# Test WebSocket connection
wscat -c wss://petcarehub-backend.onrender.com
```

### Issue: Firebase Admin Failing

**Solution:** Verify private key format:

The private key should be in one of these formats:

**Option 1:** With literal `\n`:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**Option 2:** With actual newlines (Render handles this):
```
"-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
-----END PRIVATE KEY-----"
```

### Issue: Backend Sleeping (Free Tier)

**Options:**
1. **Upgrade to paid plan** ($7/month) for 24/7 uptime
2. **Add keep-alive ping** from frontend (every 10 minutes)
3. **Use UptimeRobot** (free service) to ping your backend every 5 minutes

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Backend is accessible at Render URL
- [ ] `/api/users` endpoint returns data
- [ ] Socket.IO connection works from frontend
- [ ] Firebase Admin SDK authenticated successfully
- [ ] Stripe webhooks configured (update webhook URL to Render URL)
- [ ] Environment variables are set correctly
- [ ] Frontend can fetch data from backend
- [ ] Real-time pet location updates work
- [ ] AI chatbot responds correctly
- [ ] CORS is configured for your frontend domain

---

## 🔑 Environment Variables Reference

Quick reference for all required environment variables:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Environment mode |
| `FIREBASE_PROJECT_ID` | Yes | `petcarehub-fyp` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | `firebase-adminsdk-...@project.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | `"-----BEGIN PRIVATE KEY...` | Service account private key |
| `FIREBASE_DATABASE_URL` | Yes | `https://project-rtdb.firebaseio.com` | Realtime Database URL |
| `STRIPE_SECRET_KEY` | Yes | `sk_live_...` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | No | `whsec_...` | Stripe webhook secret |
| `GEMINI_API_KEY` | Yes | `AIza...` | Google Gemini API key |
| `FRONTEND_URL` | Yes | `https://app.web.app` | Firebase Hosting URL |
| `VERCEL_URL` | No | `https://app.vercel.app` | Vercel app URL |

---

## 📞 Testing Your Deployment

### Test Backend APIs

```bash
# Test user endpoint
curl https://petcarehub-backend.onrender.com/api/users

# Test health check
curl https://petcarehub-backend.onrender.com/api/pet-location
```

### Test Socket.IO

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Test</title>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Connection Test</h1>
  <div id="status">Connecting...</div>
  
  <script>
    const socket = io('https://petcarehub-backend.onrender.com');
    
    socket.on('connect', () => {
      document.getElementById('status').innerHTML = '✅ Connected: ' + socket.id;
      console.log('Connected:', socket.id);
    });
    
    socket.on('petLocationUpdate', (data) => {
      console.log('Location update:', data);
    });
    
    socket.on('disconnect', () => {
      document.getElementById('status').innerHTML = '❌ Disconnected';
      console.log('Disconnected');
    });
  </script>
</body>
</html>
```

---

## 🎯 Next Steps

1. **Update Frontend Environment Variables**
   - Add `REACT_APP_API_URL=https://petcarehub-backend.onrender.com`
   - Rebuild and redeploy frontend

2. **Configure Stripe Webhooks**
   - Go to Stripe Dashboard → Webhooks
   - Update webhook URL to `https://petcarehub-backend.onrender.com/api/webhook`

3. **Monitor Backend Performance**
   - Check Render logs regularly
   - Monitor response times
   - Consider upgrading if you experience slowdowns

4. **Optional: Custom Domain**
   - Render allows custom domains on paid plans
   - Configure DNS: `api.petcarehub.com` → Render backend

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Backend sleeps after 15 min of inactivity
   - Cold start takes ~30 seconds
   - Limited to 750 hours/month

2. **Upgrade Benefits ($7/month):**
   - 24/7 uptime (no sleeping)
   - Instant response times
   - Custom domains
   - More memory/CPU

3. **Keep Firebase Credentials Secure:**
   - Never commit `.env` files
   - Use Render's encrypted environment variables
   - Rotate keys periodically

4. **Monitor Logs:**
   - Render provides real-time logs
   - Set up log alerts for errors
   - Use logging services like Sentry for production

---

## 🆘 Need Help?

- **Render Documentation:** [render.com/docs](https://render.com/docs)
- **Socket.IO Documentation:** [socket.io/docs](https://socket.io/docs/v4/)
- **Firebase Admin SDK:** [firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)

---

## 📝 Summary

You've successfully deployed your backend to Render! Your architecture now looks like:

```
┌─────────────────┐
│  Firebase       │ Frontend + Database + Auth
│  Hosting        │ 
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Render         │ Express + Socket.IO Backend
│  Web Service    │ (Real-time tracking)
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  Vercel         │ External APIs
│  Functions      │ (Gemini, etc.)
└─────────────────┘
```

**Benefits:**
- ✅ Real-time WebSocket support
- ✅ Persistent backend for Socket.IO
- ✅ Scalable architecture
- ✅ Free tier available
- ✅ Automatic deployments from GitHub

---

**Happy Deploying! 🚀**


