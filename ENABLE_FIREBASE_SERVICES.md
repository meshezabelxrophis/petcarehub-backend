# 🔥 Enable Firebase Services - Step-by-Step Guide

**Project:** fyppp-5b4f0  
**Console:** https://console.firebase.google.com/project/fyppp-5b4f0

---

## 1️⃣ Enable Authentication (Email/Password)

### Steps:
1. Go to: https://console.firebase.google.com/project/fyppp-5b4f0/authentication/users
2. Click **"Get started"** button
3. Click on **"Sign-in method"** tab
4. Find **"Email/Password"** in the list
5. Click on it to expand
6. Toggle **"Enable"** switch to ON
7. Click **"Save"**

### ✅ Verification:
You should see "Email/Password" listed as "Enabled" in the Sign-in providers.

---

## 2️⃣ Create Firestore Database

### Steps:
1. Go to: https://console.firebase.google.com/project/fyppp-5b4f0/firestore
2. Click **"Create database"** button
3. **Choose mode:**
   - Select **"Start in production mode"** (we'll deploy our security rules)
   - Click **"Next"**
4. **Choose location:**
   - Select closest region (e.g., `us-central1` or `asia-south1`)
   - Click **"Enable"**
5. Wait for database creation (30-60 seconds)

### ✅ Verification:
You should see the Firestore Data tab with an empty database and the option to "Start collection".

---

## 3️⃣ Create Realtime Database

### Steps:
1. Go to: https://console.firebase.google.com/project/fyppp-5b4f0/database
2. Click **"Create Database"** button (in Realtime Database section)
3. **Choose location:**
   - Select database location (e.g., `us-central1`)
   - Click **"Next"**
4. **Choose security rules:**
   - Select **"Start in locked mode"** (we'll deploy our security rules)
   - Click **"Enable"**
5. Wait for database creation (10-20 seconds)

### ✅ Verification:
You should see:
```
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

**Note:** Your database URL will be:
`https://fyppp-5b4f0-default-rtdb.firebaseio.com`

---

## 4️⃣ Enable Storage

### Steps:
1. Go to: https://console.firebase.google.com/project/fyppp-5b4f0/storage
2. Click **"Get started"** button
3. **Set up Cloud Storage:**
   - Read the information about security rules
   - Click **"Next"**
4. **Choose location:**
   - Select same location as Firestore (e.g., `us-central1`)
   - Click **"Done"**
5. Wait for storage setup (10-20 seconds)

### ✅ Verification:
You should see the Files tab with an empty storage bucket:
`fyppp-5b4f0.firebasestorage.app`

---

## 🎯 After Enabling All Services

Once all 4 services are enabled, come back to your terminal and run:

```bash
# Deploy your security rules
firebase deploy --only firestore:rules,database:rules,storage:rules

# Verify deployment
firebase deploy:list
```

---

## 📋 Quick Checklist

- [ ] Authentication → Email/Password enabled
- [ ] Firestore Database → Created
- [ ] Realtime Database → Created  
- [ ] Storage → Enabled
- [ ] Security rules deployed

---

## 🔗 Quick Links

| Service | Direct Link |
|---------|------------|
| **Authentication** | https://console.firebase.google.com/project/fyppp-5b4f0/authentication/users |
| **Firestore** | https://console.firebase.google.com/project/fyppp-5b4f0/firestore |
| **Realtime DB** | https://console.firebase.google.com/project/fyppp-5b4f0/database |
| **Storage** | https://console.firebase.google.com/project/fyppp-5b4f0/storage |
| **Project Settings** | https://console.firebase.google.com/project/fyppp-5b4f0/settings/general |

---

## ⏱️ Estimated Time

- Authentication: 1 minute
- Firestore: 2 minutes
- Realtime Database: 2 minutes
- Storage: 2 minutes
- **Total: ~7 minutes**

---

## 🆘 Troubleshooting

### Issue: "Create Database" button is grayed out

**Solution:** Make sure you have billing enabled (even for Spark free plan, you may need to verify your account)

### Issue: Can't select location

**Solution:** Refresh the page and try again. Some regions might be temporarily unavailable.

### Issue: Database creation is taking too long

**Solution:** Wait up to 2 minutes. If it still doesn't work, refresh and try again.

---

## 🎉 When All Services Are Enabled

You'll be ready to deploy security rules and run the migration!

**Next command:**
```bash
firebase deploy --only firestore:rules,database:rules,storage:rules
```

