# 🚀 Migration Quick Start Guide

Quick reference for migrating from SQLite to Firestore.

## 📦 What You Have Now

✅ **Migration Script**: `migrate-sqlite-to-firestore.js`  
✅ **Firestore Service Layer**: `server/services/firestoreService.js`  
✅ **Firebase Admin Config**: `server/config/firebaseAdmin.js`  
✅ **Documentation**:
  - `MIGRATION_GUIDE.md` - Complete migration guide
  - `SERVER_MIGRATION_EXAMPLES.md` - Code conversion examples
  - `FIREBASE_SETUP_GUIDE.md` - Firebase setup
  - `SPARK_PLAN_OPTIMIZATION.md` - Cost optimization

---

## 🎯 Migration in 5 Steps

### Step 1: Get Firebase Service Account Key (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Project Settings** ⚙️ → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save as `firebase-service-account.json` in project root

```bash
# File should be here:
/Users/abdulwaseyhussain/Desktop/programming/FYP  copy/firebase-service-account.json
```

### Step 2: Test Migration (Dry Run) (1 min)

```bash
node migrate-sqlite-to-firestore.js --dry-run
```

This shows what will be migrated without actually changing anything.

### Step 3: Run Migration (2 min)

```bash
node migrate-sqlite-to-firestore.js
```

Watch for success messages. All data will be copied to Firestore.

### Step 4: Verify Data (2 min)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Firestore Database**
3. Check collections: `users`, `pets`, `services`, `bookings`, `payments`

### Step 5: Update Backend Code (30-60 min)

Use examples from `SERVER_MIGRATION_EXAMPLES.md` to update your routes.

**Example for one route:**

```javascript
// OLD (server/index.js)
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// NEW (server/index.js)
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

---

## 📊 Collection Structure

Your data is migrated to these Firestore collections:

### Collections

| Collection | Document ID Format | Key Fields |
|------------|-------------------|------------|
| `users` | `user_{id}` | name, email, role, accountType |
| `pets` | `pet_{id}` | ownerId, name, type, breed |
| `services` | `service_{id}` | providerId, name, price, category |
| `bookings` | `booking_{id}` | userId, providerId, serviceId, petId |
| `payments` | `payment_{id}` | stripeSessionId, amount, status |

### ID Mapping

SQLite IDs are preserved with prefixes:

```javascript
SQLite: users.id = 1      → Firestore: users/user_1
SQLite: pets.id = 5       → Firestore: pets/pet_5
SQLite: services.id = 10  → Firestore: services/service_10
```

---

## 🔧 Common Tasks

### Check Migration Status

```javascript
// Count users in Firestore
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
db.collection('users').get().then(snap => console.log('Users:', snap.size));
```

### Re-migrate Specific Collection

```bash
# Only migrate users
node migrate-sqlite-to-firestore.js --collections=users

# Migrate users and pets
node migrate-sqlite-to-firestore.js --collections=users,pets
```

### Create Backup Before Migration

```bash
# Backup SQLite data as JSON
node migrate-sqlite-to-firestore.js --backup

# This creates: sqlite-backup-TIMESTAMP.json
```

### Rollback to SQLite

```bash
# Restore SQLite database
cp database.sqlite.backup database.sqlite

# Revert code changes
git checkout server/index.js

# Restart server
npm run start:backend
```

---

## 🎨 Code Migration Pattern

### Pattern 1: Simple GET

```javascript
// ❌ SQLite
db.all('SELECT * FROM table', [], callback);

// ✅ Firestore
const items = await Service.getAll();
```

### Pattern 2: GET with Filter

```javascript
// ❌ SQLite
db.all('SELECT * FROM pets WHERE owner_id = ?', [ownerId], callback);

// ✅ Firestore
const pets = await PetService.getPetsByOwner(ownerId);
```

### Pattern 3: POST (Create)

```javascript
// ❌ SQLite
db.run('INSERT INTO table VALUES (?)', [data], callback);

// ✅ Firestore
const newItem = await Service.create(data);
```

### Pattern 4: PUT (Update)

```javascript
// ❌ SQLite
db.run('UPDATE table SET field = ? WHERE id = ?', [value, id], callback);

// ✅ Firestore
const updated = await Service.update(id, { field: value });
```

### Pattern 5: DELETE

```javascript
// ❌ SQLite
db.run('DELETE FROM table WHERE id = ?', [id], callback);

// ✅ Firestore
await Service.delete(id);
```

---

## ⚠️ Important Notes

### 1. All Routes Must Be Async

```javascript
// ❌ OLD
app.get('/api/route', (req, res) => {

// ✅ NEW
app.get('/api/route', async (req, res) => {
```

### 2. Always Use Try/Catch

```javascript
try {
  const data = await Service.getSomething();
  res.json(data);
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

### 3. Update ID References

```javascript
// ❌ OLD
const userId = 1;
const petId = 5;

// ✅ NEW
const userId = 'user_1';
const petId = 'pet_5';
```

---

## 🧪 Testing Checklist

After migration, test these features:

- [ ] User registration
- [ ] User login
- [ ] Get all users
- [ ] Add pet
- [ ] Edit pet
- [ ] Delete pet
- [ ] Get pets by owner
- [ ] Create service
- [ ] Get all services
- [ ] Get services by provider
- [ ] Delete service
- [ ] Create booking
- [ ] Get bookings (user)
- [ ] Get bookings (provider)
- [ ] Update booking status
- [ ] GPS tracking
- [ ] Chat functionality
- [ ] Payments

---

## 💡 Quick Fixes

### Problem: "Firebase Admin not initialized"

```bash
# Check service account file exists
ls firebase-service-account.json

# If not, download from Firebase Console
```

### Problem: "Permission denied" in Firestore

```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

### Problem: IDs not matching

```javascript
// Use ID conversion helper
const userId = req.query.owner_id.startsWith('user_') 
  ? req.query.owner_id 
  : `user_${req.query.owner_id}`;
```

### Problem: Data not showing in frontend

1. Check browser console for errors
2. Verify IDs match (user_1 vs 1)
3. Check Firestore security rules
4. Verify backend is using Firestore (not SQLite)

---

## 📁 File Structure After Migration

```
petcare-hub/
├── firebase-service-account.json    # ⚠️ KEEP SECRET
├── migrate-sqlite-to-firestore.js   # Migration script
├── database.sqlite.backup           # SQLite backup
├── sqlite-backup-TIMESTAMP.json     # JSON backup
│
├── server/
│   ├── config/
│   │   └── firebaseAdmin.js        # Firebase config
│   ├── services/
│   │   └── firestoreService.js     # Firestore operations
│   └── index.js                     # Updated server (Firestore)
│
├── Documentation/
│   ├── MIGRATION_GUIDE.md           # Complete guide
│   ├── MIGRATION_QUICK_START.md     # This file
│   ├── SERVER_MIGRATION_EXAMPLES.md # Code examples
│   └── FIREBASE_SETUP_GUIDE.md      # Firebase setup
```

---

## 🎓 Learning Resources

**Firestore Basics:**
- [Get Started with Firestore](https://firebase.google.com/docs/firestore/quickstart)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)

**Security Rules:**
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Examples](https://firebase.google.com/docs/firestore/security/rules-conditions)

**Optimization:**
- Read: `SPARK_PLAN_OPTIMIZATION.md`
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## 🆘 Need Help?

1. **Check Documentation:**
   - `MIGRATION_GUIDE.md` - Detailed migration steps
   - `SERVER_MIGRATION_EXAMPLES.md` - Code conversion examples

2. **Common Issues:**
   - Service account key missing → Download from Firebase Console
   - Permission errors → Deploy security rules
   - ID mismatch → Use `user_`, `pet_`, `service_` prefixes

3. **Firebase Console:**
   - Monitor usage: **Usage and billing**
   - View data: **Firestore Database**
   - Check logs: **Functions** → **Logs**

---

## ✅ Success Checklist

Migration complete when:

- [✓] Migration script runs without errors
- [✓] All data visible in Firebase Console
- [✓] Backend routes updated to use Firestore
- [✓] Frontend works with new backend
- [✓] All features tested and working
- [✓] SQLite dependencies removed
- [✓] Backup created and saved

---

**You're ready to migrate! Start with Step 1 above.** 🚀

**Estimated time: 1-2 hours for complete migration**

