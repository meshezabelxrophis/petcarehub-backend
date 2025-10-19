# 🚨 URGENT: Update Render Dashboard Settings

## Current Problem
Render is trying to run: `/opt/render/project/src/index.js` ❌  
Render should run: `/opt/render/project/src/server/index.js` ✅

## The Fix: Update Root Directory in Render Dashboard

### Step 1: Open Your Render Service
1. Go to https://dashboard.render.com/
2. Click on your service (probably named `petcarehub-backend` or similar)

### Step 2: Go to Settings
- In the left sidebar, click **"Settings"**

### Step 3: Find "Build & Deploy" Section
Scroll down to find these fields:

```
┌─────────────────────────────────────────────┐
│ Build & Deploy                               │
├─────────────────────────────────────────────┤
│                                              │
│ Root Directory                               │
│ ┌─────────────────────────────────────────┐ │
│ │ [Type here: server]                     │ │  ← ADD THIS!
│ └─────────────────────────────────────────┘ │
│                                              │
│ Build Command                                │
│ ┌─────────────────────────────────────────┐ │
│ │ npm ci                                  │ │  ← Should be this
│ └─────────────────────────────────────────┘ │
│                                              │
│ Start Command                                │
│ ┌─────────────────────────────────────────┐ │
│ │ node index.js                           │ │  ← Should be this
│ └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

### Step 4: Update These Exact Values

**Root Directory:**
```
server
```
⚠️ **IMPORTANT:** Type exactly `server` (no slashes, no spaces)

**Build Command:**
```
npm ci
```

**Start Command:**
```
node index.js
```

### Step 5: Save and Deploy
1. Scroll to bottom and click **"Save Changes"**
2. A confirmation will appear - the service will **NOT** redeploy automatically
3. Go to the **"Manual Deploy"** tab at the top
4. Click **"Deploy latest commit"**
5. Select branch: `main`
6. Click **"Deploy"**

## What Will Change

### Before (Current - Wrong):
```
==> Running build command 'npm install'...
(at /opt/render/project/src/)           ← Wrong location
==> Running 'node index.js'
Error: Cannot find module '/opt/render/project/src/index.js'
```

### After (Correct):
```
==> Running build command 'npm ci'...
(at /opt/render/project/src/server/)    ← Correct location!
==> Running 'node index.js'
✅ Using Firestore for database operations
🚀 Server running on port 10000
Socket.IO initialized
```

## Verification

After successful deployment, test your API:
```bash
curl https://your-service-name.onrender.com/
```

You should get:
```json
{"message":"PetCareHub Backend is running"}
```

## If It Still Doesn't Work

### Option A: Try with Leading Slash
Some Render configurations need:
```
./server
```
(with a dot and slash)

### Option B: Create New Service from Blueprint
1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repo
4. Render will detect `render.yaml` and use the correct settings automatically

### Option C: Check Service Type
Make sure your service is:
- **Type:** Web Service (NOT Static Site)
- **Environment:** Node

## Why This Is Necessary

Your repository structure is:
```
petcarehub-backend/
├── src/                    ← Frontend React code (don't deploy this)
│   └── index.js           ← React entry (deleted now)
├── server/                 ← Backend Node.js code (DEPLOY THIS)
│   ├── index.js           ← Server entry point ✅
│   ├── package.json       ← Backend dependencies
│   └── config/
└── render.yaml            ← Config file (being ignored for some reason)
```

By setting `Root Directory: server`, you're telling Render:
- Start in the `server/` folder
- Use `server/package.json` for dependencies
- Run `server/index.js` as the entry point

---

## Quick Checklist

- [ ] Open Render Dashboard
- [ ] Go to service Settings
- [ ] Set "Root Directory" to `server`
- [ ] Set "Build Command" to `npm ci`
- [ ] Set "Start Command" to `node index.js`
- [ ] Click "Save Changes"
- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Wait for deployment
- [ ] Test with curl

**Once you complete these steps, your deployment will succeed! 🎉**

