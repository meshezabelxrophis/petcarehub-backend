# Firebase Spark Plan Optimization Guide

This guide helps you optimize your PetCare Hub application to stay within Firebase Spark (Free) Plan limits.

## 🎯 Spark Plan Overview

### What's Included (FREE)
✅ Firestore: 1GB storage, 50K reads/day, 20K writes/day  
✅ Realtime Database: 1GB storage, 10GB downloads/month  
✅ Authentication: Unlimited users  
✅ Storage: 5GB storage, 1GB downloads/day  
✅ Cloud Functions: 125K invocations/month  
✅ Hosting: 10GB storage, 360MB/day transfer  

### What's NOT Included
❌ Outbound API calls (except to Google services)  
❌ Cloud Run  
❌ Cloud Build with external calls  
❌ Paid third-party APIs  

---

## 📊 Monitoring Usage

### Check Your Usage
1. Go to Firebase Console
2. Navigate to **Usage and billing**
3. Review daily/monthly usage

### Set Up Budget Alerts
1. Firebase Console > **Usage and billing**
2. Click **Details & settings**
3. Enable email notifications for:
   - 50% quota usage
   - 75% quota usage
   - 90% quota usage

---

## 🛠️ Optimization Strategies

### 1. Firestore Optimization

#### Reduce Read Operations
```javascript
// ❌ BAD: Reading entire collection
const allPets = await getDocs(collection(db, 'pets'));

// ✅ GOOD: Use pagination
const petsQuery = query(
  collection(db, 'pets'),
  limit(10)
);
const petsSnapshot = await getDocs(petsQuery);
```

#### Use Realtime Listeners Wisely
```javascript
// ❌ BAD: Multiple listeners on same data
const unsub1 = onSnapshot(doc(db, 'users', userId), ...);
const unsub2 = onSnapshot(doc(db, 'users', userId), ...);

// ✅ GOOD: Single listener, share data via state
const unsub = onSnapshot(doc(db, 'users', userId), ...);
```

#### Implement Caching
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open
    } else if (err.code == 'unimplemented') {
      // Browser doesn't support
    }
  });
```

### 2. Realtime Database Optimization

#### Use Realtime Database for High-Frequency Updates
```javascript
// ✅ GOOD: GPS updates in Realtime Database
import { ref, set } from 'firebase/database';

const updatePetLocation = (petId, location) => {
  set(ref(realtimeDb, `petLocations/${petId}`), {
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: Date.now()
  });
};
```

#### Limit Data Downloads
```javascript
import { ref, query, limitToLast, onValue } from 'firebase/database';

// ❌ BAD: Download all messages
const messagesRef = ref(realtimeDb, `chatRooms/${roomId}/messages`);

// ✅ GOOD: Limit to last 50 messages
const messagesQuery = query(
  ref(realtimeDb, `chatRooms/${roomId}/messages`),
  limitToLast(50)
);
```

### 3. Storage Optimization

#### Compress Images Before Upload
```javascript
const compressImage = async (file) => {
  // Use canvas to compress
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Resize to max 1024px
      const maxSize = 1024;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

#### Use Thumbnails
```javascript
// ✅ Store both full and thumbnail versions
const uploadPetImage = async (petId, file) => {
  // Upload full image
  const fullPath = `pets/${petId}/images/${Date.now()}_full.jpg`;
  await uploadFile(fullPath, file);
  
  // Create and upload thumbnail
  const thumbnail = await compressImage(file);
  const thumbPath = `pets/${petId}/images/${Date.now()}_thumb.jpg`;
  await uploadFile(thumbPath, thumbnail);
};
```

### 4. Cloud Functions Optimization

#### Minimize Function Invocations
```javascript
// ❌ BAD: Trigger on every field update
exports.onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(...);

// ✅ GOOD: Only trigger on specific field changes
exports.onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Only run if email changed
    if (before.email === after.email) {
      return null;
    }
    
    // Process email change
  });
```

#### Batch Operations
```javascript
// ❌ BAD: Multiple function calls
await updateDoc1();
await updateDoc2();
await updateDoc3();

// ✅ GOOD: Batch in one function call
const batch = db.batch();
batch.update(ref1, data1);
batch.update(ref2, data2);
batch.update(ref3, data3);
await batch.commit();
```

### 5. Authentication Optimization

#### Use Email/Password (Free)
```javascript
// ✅ Email/Password is completely free
import { createUserWithEmailAndPassword } from 'firebase/auth';

const signup = async (email, password) => {
  await createUserWithEmailAndPassword(auth, email, password);
};
```

#### Limit Phone Auth Usage
```javascript
// Phone auth has limits (10K/month on Spark)
// Use it only when necessary
// Consider email/password as primary auth method
```

---

## 🚀 Development Best Practices

### 1. Use Firebase Emulators for Development

```bash
# Start all emulators
firebase emulators:start

# Your app will use local emulators instead of production
# This saves quota during development
```

### 2. Implement Request Debouncing

```javascript
import { debounce } from 'lodash';

// ❌ BAD: Update on every keystroke
const handleSearch = (query) => {
  searchFirestore(query);
};

// ✅ GOOD: Debounce search requests
const handleSearch = debounce((query) => {
  searchFirestore(query);
}, 500);
```

### 3. Use Client-Side Filtering When Possible

```javascript
// ✅ Fetch once, filter in memory
const allServices = await getDocs(collection(db, 'services'));
const filteredServices = allServices.docs
  .map(doc => doc.data())
  .filter(service => service.category === selectedCategory);
```

### 4. Implement Pagination

```javascript
import { query, collection, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

let lastVisible = null;

const loadMoreServices = async () => {
  let q = query(
    collection(db, 'services'),
    orderBy('createdAt'),
    limit(10)
  );
  
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }
  
  const snapshot = await getDocs(q);
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return snapshot.docs.map(doc => doc.data());
};
```

---

## 📈 Scaling Strategies

### When to Upgrade to Blaze Plan

Consider upgrading when you:
1. Consistently hit daily/monthly limits
2. Need external API integrations
3. Have >100 concurrent users regularly
4. Need more than 125K function invocations/month
5. Need scheduled functions (limited on Spark)

### Gradual Migration Path

1. **Start on Spark**: Build and test your MVP
2. **Monitor Usage**: Track what's consuming quota
3. **Optimize**: Implement strategies above
4. **Upgrade Selectively**: Move only heavy features to Blaze
5. **Use Multiple Projects**: Split dev/staging/prod

---

## 🔍 Common Quota Issues & Solutions

### Issue: Too Many Firestore Reads

**Solutions:**
- Enable offline persistence
- Implement caching with React state/Redux
- Use pagination
- Reduce listener scope

### Issue: Realtime Database Downloads High

**Solutions:**
- Limit query results
- Use shallow queries: `.orderByKey().limitToLast(10)`
- Clean up old data regularly

### Issue: Storage Downloads Exceeded

**Solutions:**
- Use CDN for static assets
- Implement image thumbnails
- Cache images in browser
- Use lazy loading

### Issue: Too Many Function Invocations

**Solutions:**
- Combine multiple triggers
- Use Cloud Scheduler sparingly
- Batch operations
- Move logic to client when possible

---

## 📝 Monitoring Checklist

Daily:
- [ ] Check Firebase Console usage dashboard
- [ ] Review function logs for errors
- [ ] Monitor realtime database connections

Weekly:
- [ ] Analyze read/write patterns
- [ ] Review storage usage trends
- [ ] Check for unused data

Monthly:
- [ ] Review quota usage trends
- [ ] Optimize heavy queries
- [ ] Clean up old/unused data
- [ ] Evaluate if upgrade needed

---

## 🛡️ Cost Prevention Tips

1. **Never commit Firebase config with production keys to public repos**
2. **Set up budget alerts before hitting limits**
3. **Use emulators for all development**
4. **Implement proper error handling to avoid retry storms**
5. **Use security rules to prevent abuse**
6. **Monitor authentication attempts for unusual activity**
7. **Implement rate limiting on client side**

---

## 📚 Additional Resources

- [Firebase Pricing Calculator](https://firebase.google.com/pricing)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Pricing](https://firebase.google.com/docs/functions/pricing)
- [Optimize Cloud Functions](https://firebase.google.com/docs/functions/tips)

---

**Stay within limits and build amazing things! 🎉**

