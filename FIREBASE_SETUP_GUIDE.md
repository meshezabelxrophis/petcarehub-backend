# Firebase Setup Guide for PetCare Hub

This guide will help you set up Firebase for the PetCare Hub project on the **Spark (Free) Plan**.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Firebase Project](#create-firebase-project)
3. [Enable Firebase Services](#enable-firebase-services)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Deploy Security Rules](#deploy-security-rules)
6. [Deploy Cloud Functions](#deploy-cloud-functions)
7. [Deploy to Firebase Hosting](#deploy-to-firebase-hosting)
8. [Using Firebase Emulators](#using-firebase-emulators)
9. [Spark Plan Limits](#spark-plan-limits)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google account
- Firebase CLI installed globally: `npm install -g firebase-tools`

---

## Create Firebase Project

### Step 1: Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**

### Step 2: Configure Project

1. **Project name**: Enter `PetCare Hub` (or your preferred name)
2. **Google Analytics**: You can enable it (optional for Spark plan)
3. Click **"Create project"**

### Step 3: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. **App nickname**: `PetCare Hub Web`
3. **Check** "Also set up Firebase Hosting"
4. Click **"Register app"**
5. **Copy the Firebase configuration** (you'll need this later)

---

## Enable Firebase Services

### 1. Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll deploy rules later)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

### 2. Realtime Database

1. Go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose a location
4. Start in **"Locked mode"** (we'll deploy rules later)
5. Click **"Enable"**

### 3. Authentication

1. Go to **Build > Authentication**
2. Click **"Get started"**
3. Enable the following sign-in methods:
   - **Email/Password**: Click to enable
   - **Google** (optional): Configure if needed
4. Click **"Save"**

### 4. Storage

1. Go to **Build > Storage**
2. Click **"Get started"**
3. Start in **"Production mode"** (we'll deploy rules later)
4. Choose a location
5. Click **"Done"**

### 5. Cloud Functions

Cloud Functions are enabled automatically when you deploy them. No manual setup needed in the console.

### 6. Firebase Hosting

1. Go to **Build > Hosting**
2. Click **"Get started"**
3. Follow the setup wizard (or skip if already done during app registration)

---

## Configure Environment Variables

### Step 1: Create .env File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration values from the Firebase Console:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=petcarehub-xxxxx.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=petcarehub-xxxxx
   REACT_APP_FIREBASE_STORAGE_BUCKET=petcarehub-xxxxx.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:xxxxx
   REACT_APP_FIREBASE_DATABASE_URL=https://petcarehub-xxxxx-default-rtdb.firebaseio.com
   ```

### Step 2: Update .firebaserc

1. Open `.firebaserc`
2. Replace `"petcarehub-project"` with your actual Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

---

## Deploy Security Rules

### Step 1: Login to Firebase

```bash
firebase login
```

### Step 2: Initialize Firebase (if not already done)

```bash
firebase init
```

Select:
- ✓ Firestore
- ✓ Realtime Database
- ✓ Functions
- ✓ Storage
- ✓ Hosting

Use existing configuration files when prompted.

### Step 3: Deploy Security Rules

Deploy all rules at once:
```bash
firebase deploy --only firestore:rules,database:rules,storage:rules
```

Or deploy individually:
```bash
# Firestore rules
firebase deploy --only firestore:rules

# Realtime Database rules
firebase deploy --only database:rules

# Storage rules
firebase deploy --only storage:rules
```

---

## Deploy Cloud Functions

### Step 1: Install Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 2: Deploy Functions

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy a specific function:
```bash
firebase deploy --only functions:createUserProfile
```

### Step 3: Verify Deployment

1. Go to Firebase Console > **Build > Functions**
2. You should see your deployed functions listed

---

## Deploy to Firebase Hosting

### Step 1: Build Your React App

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Step 2: Deploy to Hosting

```bash
firebase deploy --only hosting
```

### Step 3: View Your Live Site

After deployment, Firebase will provide a URL like:
```
https://petcarehub-xxxxx.web.app
```

---

## Using Firebase Emulators

Firebase Emulators let you test locally without affecting production data.

### Step 1: Start Emulators

```bash
firebase emulators:start
```

This will start:
- ✓ Auth Emulator (port 9099)
- ✓ Functions Emulator (port 5001)
- ✓ Firestore Emulator (port 8080)
- ✓ Realtime Database Emulator (port 9000)
- ✓ Storage Emulator (port 9199)
- ✓ Hosting Emulator (port 5000)
- ✓ Emulator UI (port 4000)

### Step 2: Use Emulators in Development

In your `.env` file, set:
```env
REACT_APP_USE_FIREBASE_EMULATORS=true
```

### Step 3: Access Emulator UI

Open your browser to: `http://localhost:4000`

---

## Spark Plan Limits

The **Spark (Free) Plan** has the following limits:

### Firestore
- **Storage**: 1 GB
- **Document reads**: 50K/day
- **Document writes**: 20K/day
- **Document deletes**: 20K/day

### Realtime Database
- **Storage**: 1 GB
- **Downloads**: 10 GB/month
- **Simultaneous connections**: 100

### Authentication
- **Active users**: Unlimited
- **Phone authentication**: 10K verifications/month

### Storage
- **Storage**: 5 GB
- **Downloads**: 1 GB/day
- **Uploads**: 20K/day

### Cloud Functions
- **Invocations**: 125K/month
- **GB-seconds**: 40K/month
- **CPU-seconds**: 40K/month
- **Outbound networking**: 0 GB (Google services only)

### Hosting
- **Storage**: 10 GB
- **Transfer**: 360 MB/day

### Important Spark Plan Restrictions:
1. ❌ **No outbound API calls** (except to Google services)
2. ❌ **No Cloud Run**
3. ❌ **No Cloud Build with external calls**
4. ✅ Can use all Firebase services (Auth, Firestore, RTDB, Storage, Functions, Hosting)

---

## Troubleshooting

### Issue: "Permission denied" errors

**Solution**: Make sure you've deployed security rules:
```bash
firebase deploy --only firestore:rules,database:rules,storage:rules
```

### Issue: Functions not deploying

**Solution**: 
1. Check Node.js version (should be 18):
   ```bash
   node --version
   ```
2. Install dependencies in functions folder:
   ```bash
   cd functions && npm install
   ```

### Issue: Emulators not starting

**Solution**: Make sure ports are not in use:
```bash
# Kill processes on Firebase ports
lsof -ti:4000,5000,5001,8080,9000,9099,9199 | xargs kill -9
```

### Issue: Environment variables not working

**Solution**: 
1. Make sure `.env` file is in the root directory
2. Restart your development server:
   ```bash
   npm start
   ```
3. Variables must start with `REACT_APP_`

### Issue: Exceeded Spark plan limits

**Solution**: 
1. Check usage in Firebase Console > **Usage and billing**
2. Optimize queries and reduce unnecessary reads/writes
3. Use Firebase Emulators for development
4. Consider upgrading to Blaze (pay-as-you-go) plan if needed

### Issue: Build folder not found during hosting deployment

**Solution**: Make sure you've built your React app:
```bash
npm run build
```

---

## Next Steps

1. ✅ Complete the setup steps above
2. ✅ Test locally with Firebase Emulators
3. ✅ Deploy security rules
4. ✅ Deploy Cloud Functions
5. ✅ Deploy to Firebase Hosting
6. ✅ Monitor usage in Firebase Console

---

## Useful Commands

```bash
# Login to Firebase
firebase login

# List your projects
firebase projects:list

# Switch between projects
firebase use <project-id>

# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# View function logs
firebase functions:log

# Open Firebase Console
firebase open

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules

# Start emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only functions,firestore
```

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## Support

If you encounter any issues:
1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review [Firebase Support](https://firebase.google.com/support)
3. Check project documentation

---

**Happy Coding! 🚀**

