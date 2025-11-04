# Fix Render Deployment - Node.js Backend

## Problem
Render is detecting your service as **Python** instead of **Node.js**, causing deployment failures.

## Solution: Choose ONE of these options

---

### Option 1: Delete and Recreate Service (RECOMMENDED - Easiest)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Delete the current service**:
   - Click on your `petcarehub-backend` service
   - Go to **Settings** tab
   - Scroll down and click **Delete Service**
   - Confirm deletion

3. **Create a new service**:
   - Click **New +** → **Web Service**
   - Connect your GitHub repository: `meshezabelxrophis/petcarehub-backend`
   - Render will **automatically detect the `render.yaml` file** ✅
   - Click **Apply** or **Create Web Service**
   - The service will be created with the correct Node.js configuration!

4. **Add environment variables** (in the service dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_DATABASE_URL=your-database-url
   STRIPE_SECRET_KEY=your-stripe-key
   GEMINI_API_KEY=your-gemini-key
   FRONTEND_URL=https://petcarehub-fyp.web.app
   VERCEL_URL=your-vercel-url
   ML_API_URL=your-ml-api-url
   ```

---

### Option 2: Manually Update Existing Service

1. **Go to your service in Render Dashboard**
2. **Go to Settings tab**
3. **Update these settings**:
   - **Runtime**: Change from Python to **Node**
   - **Root Directory**: Set to `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Node Version**: `22.16.0` (or `>=18.0.0`)

4. **Remove any Python-specific settings** (if present)
5. **Save Changes**
6. **Manually Deploy**: Go to the **Manual Deploy** section and click **Deploy latest commit**

---

## Verify Deployment

After deploying, check the logs. You should see:
```
==> Using Node.js version 22.16.0
==> Running build command 'npm install'...
added 1453 packages...
==> Running 'node index.js'
```

**NOT** this (Python error):
```
==> Installing Python version 3.13.4...
ERROR: Could not open requirements file
```

---

## Why This Happened

Your repository contains both:
- **Frontend** code (React, in `src/`)
- **Backend** code (Node.js, in `server/`)
- **Python ML models** (in `ml_models/` and `server/ml_models/`)

Render was auto-detecting Python because of the `.py` files. The `render.yaml` file with `rootDir: server` and `runtime: node` fixes this by explicitly telling Render:
- This is a **Node.js** service
- The code is in the **server/** directory

---

## Quick Command Summary

If you need to redeploy after making changes:
```bash
git add .
git commit -m "Update backend configuration"
git push origin main
```

Render will auto-deploy if you have **Auto-Deploy** enabled in your service settings.

---

## Need Help?

If you continue to have issues:
1. Check the **Logs** tab in your Render service dashboard
2. Verify all environment variables are set correctly
3. Make sure the `render.yaml` file is at the **root** of your repository
4. Check that your GitHub repository is the correct one: `meshezabelxrophis/petcarehub-backend`

## What Your render.yaml Does

```yaml
services:
  - type: web
    name: petcarehub-backend
    runtime: node              # ← Tells Render this is Node.js
    rootDir: server            # ← Tells Render to use server/ directory
    buildCommand: npm install  # ← Install Node.js dependencies
    startCommand: node index.js # ← Start the Express server
```

Good luck! 🚀

