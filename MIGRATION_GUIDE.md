# SQLite to Firestore Migration Guide

This guide walks you through migrating your PetCare Hub backend from SQLite3 to Firebase Firestore.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare Firebase](#prepare-firebase)
3. [Run Migration](#run-migration)
4. [Update Backend Code](#update-backend-code)
5. [Testing](#testing)
6. [Rollback Plan](#rollback-plan)

---

## Prerequisites

### 1. Firebase Project Setup

✅ You should have already completed Firebase setup from `FIREBASE_SETUP_GUIDE.md`

Make sure you have:
- Firebase project created
- Firestore enabled
- Realtime Database enabled
- Security rules deployed

### 2. Service Account Key

**Download your Firebase service account key:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** ⚙️ > **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `firebase-service-account.json` in your project root

```bash
# Place file here:
/Users/abdulwaseyhussain/Desktop/programming/FYP  copy/firebase-service-account.json
```

⚠️ **IMPORTANT:** Add this file to `.gitignore` (already done)

### 3. Install Dependencies

```bash
# Root directory (for migration script)
npm install firebase-admin

# Server directory (for backend)
cd server
npm install firebase-admin
cd ..
```

---

## Prepare Firebase

### 1. Verify Firestore Indexes

The migration script will create documents that need indexes for queries. Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

### 2. Backup Your SQLite Database

```bash
# Create a backup copy
cp database.sqlite database.sqlite.backup
```

---

## Run Migration

### Step 1: Dry Run (Preview)

First, run a dry run to see what will be migrated without actually migrating:

```bash
node migrate-sqlite-to-firestore.js --dry-run
```

This will show you:
- Number of records in each collection
- Sample data that will be migrated
- No actual changes to Firestore

### Step 2: Create Backup

Create a JSON backup of your SQLite data:

```bash
node migrate-sqlite-to-firestore.js --backup
```

This creates a file like `sqlite-backup-1234567890.json` with all your data.

### Step 3: Run Full Migration

Run the actual migration:

```bash
node migrate-sqlite-to-firestore.js
```

**Expected output:**
```
🚀 SQLite to Firestore Migration

✓ Firebase Admin initialized with service account
✓ Connected to SQLite database

👥 Migrating Users
ℹ Found 25 users to migrate
ℹ Committed batch of 25 users
✓ Migrated 25/25 users

🐾 Migrating Pets
ℹ Found 42 pets to migrate
ℹ Committed batch of 42 pets
✓ Migrated 42/42 pets

💼 Migrating Services
ℹ Found 18 services to migrate
ℹ Committed batch of 18 services
✓ Migrated 18/18 services

📅 Migrating Bookings
ℹ Found 67 bookings to migrate
ℹ Committed batch of 67 bookings
✓ Migrated 67/67 bookings

💳 Migrating Payments
ℹ Found 34 payments to migrate
ℹ Committed batch of 34 payments
✓ Migrated 34/34 payments

📊 Migration Summary

Total Records:
  Processed: 186
  Migrated:  186
  Errors:    0

By Collection:
  users           25/25 (100.0%)
  pets            42/42 (100.0%)
  services        18/18 (100.0%)
  bookings        67/67 (100.0%)
  payments        34/34 (100.0%)

✨ Migration completed successfully!
```

### Step 4: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Check that collections exist:
   - `users`
   - `pets`
   - `services`
   - `bookings`
   - `payments`
4. Verify data looks correct

### Migration Options

```bash
# Migrate specific collections only
node migrate-sqlite-to-firestore.js --collections=users,pets

# Dry run + backup
node migrate-sqlite-to-firestore.js --dry-run --backup
```

---

## Update Backend Code

Now that data is migrated, update your backend to use Firestore instead of SQLite.

### Option 1: Use New Firestore-Based Server (Recommended)

Create a new server file that uses Firestore:

```bash
# Create new server file
cp server/index.js server/index-sqlite.js.backup
```

Then update `server/index.js` to use Firestore services. Here's a quick example:

```javascript
// OLD (SQLite):
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// NEW (Firestore):
const { UserService } = require('./services/firestoreService');

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: Gradual Migration

Keep both SQLite and Firestore running, gradually migrating routes:

1. Add Firestore config alongside SQLite
2. Migrate routes one by one
3. Test each route thoroughly
4. Eventually remove SQLite code

### Update Environment Variables

Add to your `server/.env` or `.env`:

```env
# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
USE_FIRESTORE=true
```

### ID Mapping

The migration script preserves original SQLite IDs:

- SQLite `users.id=1` → Firestore `users/user_1`
- SQLite `pets.id=5` → Firestore `pets/pet_5`
- SQLite `services.id=10` → Firestore `services/service_10`

Update your code to use these new IDs:

```javascript
// OLD:
const ownerId = 1;

// NEW:
const ownerId = 'user_1';
```

### Foreign Key References

Update foreign key references:

```javascript
// OLD (SQLite):
{
  pet_id: 5,
  owner_id: 1
}

// NEW (Firestore):
{
  petId: 'pet_5',
  ownerId: 'user_1'
}
```

---

## Testing

### 1. Test Migration Integrity

Compare record counts:

```bash
# Check SQLite counts
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./database.sqlite'); db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => console.log('SQLite users:', row.count));"

# Check Firestore counts (in Firebase Console)
# Or use this script:
node -e "const admin = require('firebase-admin'); admin.initializeApp(); const db = admin.firestore(); db.collection('users').get().then(snapshot => console.log('Firestore users:', snapshot.size));"
```

### 2. Test API Endpoints

```bash
# Test getting users
curl http://localhost:5001/api/users

# Test getting pets
curl http://localhost:5001/api/pets?owner_id=user_1

# Test getting services
curl http://localhost:5001/api/services
```

### 3. Test Frontend

1. Start your server: `npm run start:backend`
2. Start your frontend: `npm start`
3. Test all features:
   - User registration/login
   - Adding/editing/deleting pets
   - Creating services
   - Making bookings
   - GPS tracking
   - Chat functionality

---

## Rollback Plan

If something goes wrong, you can rollback:

### Option 1: Restore SQLite Database

```bash
# Restore backup
cp database.sqlite.backup database.sqlite

# Revert server code
git checkout server/index.js

# Restart server
npm run start:backend
```

### Option 2: Clear Firestore and Re-migrate

```bash
# Delete all documents in Firestore
# (Use Firebase Console > Firestore Database > Delete collections)

# Re-run migration
node migrate-sqlite-to-firestore.js
```

### Option 3: Restore from JSON Backup

```bash
# You can write a script to restore from the JSON backup
# sqlite-backup-TIMESTAMP.json
```

---

## Common Issues & Solutions

### Issue: "Firebase Admin not initialized"

**Solution:**
```bash
# Make sure service account key exists
ls firebase-service-account.json

# If not, download from Firebase Console
```

### Issue: "Collection not found" errors

**Solution:**
```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Make sure security rules allow your operations
firebase deploy --only firestore:rules
```

### Issue: IDs don't match

**Solution:**
The migration script prefixes IDs:
- `user_1` instead of `1`
- `pet_5` instead of `5`

Update your code to use the new format.

### Issue: Permission denied in Firestore

**Solution:**
```bash
# Check security rules
# Make sure rules allow your operations
firebase deploy --only firestore:rules

# For testing, you can temporarily use open rules (NOT for production):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TESTING ONLY!
    }
  }
}
```

---

## Next Steps

After successful migration:

1. ✅ Test all features thoroughly
2. ✅ Monitor Firestore usage in Firebase Console
3. ✅ Update any cron jobs or scripts
4. ✅ Update documentation
5. ✅ Remove SQLite dependencies:
   ```bash
   npm uninstall sqlite3 better-sqlite3
   rm database.sqlite
   ```
6. ✅ Deploy to production
7. ✅ Monitor for errors

---

## Performance Optimization

After migration, optimize Firestore usage:

1. **Use Indexes:** Firestore automatically suggests indexes
2. **Implement Pagination:** Limit query results
3. **Cache Data:** Use client-side caching
4. **Batch Operations:** Group writes together
5. **Monitor Usage:** Check Firebase Console regularly

See `SPARK_PLAN_OPTIMIZATION.md` for more tips.

---

## Support

If you encounter issues:

1. Check Firebase Console for errors
2. Review migration logs
3. Test with `--dry-run` first
4. Keep SQLite backup until confident
5. Monitor Firestore quota usage

---

**Good luck with your migration! 🚀**

