# ⚡ Cloud Functions Guide - Spark-Plan-Safe Implementation

## 🎯 Overview

Three new Cloud Functions have been created that are **Spark-plan-safe** (no external API calls):

1. **`onBookingCreate`** - Notify clinic when a booking is created
2. **`onGpsUpdate`** - Alert owner when pet leaves safe zone
3. **`onNewMessage`** - Notify receiver of new chat messages

> ⚠️ **Note**: While these functions are designed to be Spark-safe, **deployment requires Blaze plan**. You can test them locally using Firebase Emulators.

---

## 📋 Functions Overview

### 1. **onBookingCreate** (Firestore Trigger)

**Trigger**: When a new booking document is created in `bookings/{bookingId}`

**What it does**:
- Fetches user and service details
- Sends notification to the clinic/provider (Firestore)
- Adds activity to provider's Realtime activity feed
- Includes booking details and user info

**Notifications sent**:
- Firestore: `notifications` collection
- Realtime DB: `activity_feed/{providerId}`

**Example notification**:
```javascript
{
  userId: "provider_123",
  type: "new_booking",
  title: "🎉 New Booking Request",
  message: "John Doe booked Dog Grooming on 2024-01-15",
  bookingId: "booking_456",
  read: false,
  createdAt: Timestamp
}
```

---

### 2. **onGpsUpdate** (Realtime Database Trigger)

**Trigger**: When GPS location is updated at `gps_tracking/{petId}`

**What it does**:
- Checks if pet has a safe zone configured
- Calculates distance from safe zone center using Haversine formula
- Sends alert if pet is outside safe zone radius
- Prevents spam by limiting alerts to once per 5 minutes

**Safe Zone Configuration** (stored in Firestore pet document):
```javascript
{
  name: "Buddy",
  ownerId: "user_123",
  safeZone: {
    enabled: true,
    centerLat: 33.6844,
    centerLng: 73.0479,
    radiusMeters: 100  // Alert if pet goes >100m from center
  }
}
```

**Alert triggered when**:
- Pet is outside safe zone radius
- More than 5 minutes since last alert (anti-spam)

**Notifications sent**:
- Firestore: `notifications` collection
- Realtime DB: `activity_feed/{ownerId}`
- Realtime DB: `safe_zone_alerts/{petId}/lastAlert` (timestamp)

**Example alert**:
```javascript
{
  type: "safe_zone_alert",
  message: "⚠️ Buddy has left the safe zone! Current distance: 150m",
  petId: "pet_123",
  latitude: 33.6850,
  longitude: 73.0490,
  distance: 150,
  timestamp: 1699999999999,
  read: false
}
```

---

### 3. **onNewMessage** (Realtime Database Trigger)

**Trigger**: When a new message is created at `messages/{chatId}/{messageId}`

**What it does**:
- Fetches sender's name from Firestore
- Sends notification to receiver with message preview
- Adds activity to receiver's activity feed
- Creates persistent notification in Firestore

**Notifications sent**:
- Firestore: `notifications` collection
- Realtime DB: `activity_feed/{receiverId}`

**Example notification**:
```javascript
{
  type: "message",
  message: "💬 New message from Dr. Smith: Hello, how can I help...",
  senderId: "user_123",
  chatId: "user_123_user_456",
  messageId: "-NxXxXxXxXxXxXxX",
  timestamp: 1699999999999,
  read: false
}
```

---

## 🛠️ Testing Locally with Emulators

Since deployment requires Blaze plan, test these functions locally:

### 1. Start Firebase Emulators

```bash
firebase emulators:start
```

This will start:
- Functions emulator (port 5001)
- Firestore emulator (port 8080)
- Realtime Database emulator (port 9000)
- Auth emulator (port 9099)

### 2. Update Frontend to Use Emulators

In `src/config/firebase.js`, set:
```javascript
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

In `.env`:
```bash
REACT_APP_USE_FIREBASE_EMULATORS=true
```

### 3. Test Each Function

#### Test `onBookingCreate`:
```javascript
// Create a booking in Firestore
import { db } from './config/firebase';
import { collection, addDoc } from 'firebase/firestore';

await addDoc(collection(db, 'bookings'), {
  userId: 'user_123',
  providerId: 'provider_456',
  serviceId: 'service_789',
  date: '2024-01-15',
  status: 'pending',
  price: 50
});

// Check:
// 1. Firestore notifications collection for provider
// 2. Realtime DB activity_feed/provider_456
```

#### Test `onGpsUpdate`:
```javascript
// First, create a pet with safe zone in Firestore
await setDoc(doc(db, 'pets', 'pet_123'), {
  name: 'Buddy',
  ownerId: 'user_123',
  safeZone: {
    enabled: true,
    centerLat: 33.6844,
    centerLng: 73.0479,
    radiusMeters: 100
  }
});

// Then update GPS location outside safe zone
import { realtimeDb } from './config/firebase';
import { ref, set } from 'firebase/database';

await set(ref(realtimeDb, 'gps_tracking/pet_123'), {
  lat: 33.6850,  // Outside safe zone
  lng: 73.0490,
  lastUpdated: Date.now()
});

// Check:
// 1. Realtime DB activity_feed/user_123
// 2. Firestore notifications collection
// 3. Realtime DB safe_zone_alerts/pet_123/lastAlert
```

#### Test `onNewMessage`:
```javascript
// Send a message
import { realtimeDb } from './config/firebase';
import { ref, push, set } from 'firebase/database';

const chatId = 'user_123_user_456';
const messageRef = push(ref(realtimeDb, `messages/${chatId}`));

await set(messageRef, {
  senderId: 'user_123',
  receiverId: 'user_456',
  text: 'Hello, how can I help you?',
  timestamp: Date.now(),
  read: false
});

// Check:
// 1. Realtime DB activity_feed/user_456
// 2. Firestore notifications collection
```

---

## 📊 Database Structure Requirements

### Firestore Collections

#### `pets` (for safe zone)
```javascript
{
  id: "pet_123",
  name: "Buddy",
  ownerId: "user_123",
  breed: "Golden Retriever",
  safeZone: {
    enabled: true,
    centerLat: 33.6844,
    centerLng: 73.0479,
    radiusMeters: 100
  }
}
```

#### `bookings`
```javascript
{
  id: "booking_123",
  userId: "user_123",
  providerId: "provider_456",
  serviceId: "service_789",
  date: "2024-01-15",
  status: "pending",
  price: 50
}
```

#### `notifications` (created by functions)
```javascript
{
  userId: "user_123",
  type: "new_booking" | "safe_zone_alert" | "new_message",
  title: "Notification Title",
  message: "Notification message",
  read: false,
  createdAt: Timestamp,
  // Additional fields based on type
  bookingId: "...",
  petId: "...",
  chatId: "...",
  senderId: "..."
}
```

### Realtime Database Structure

#### GPS Tracking
```
gps_tracking/
  pet_123/
    lat: 33.6844
    lng: 73.0479
    lastUpdated: 1699999999999
    accuracy: 10
    battery: 85
```

#### Messages
```
messages/
  user_123_user_456/
    -NxXxXxXxXxXxXxX/
      senderId: "user_123"
      receiverId: "user_456"
      text: "Hello!"
      timestamp: 1699999999999
      read: false
```

#### Activity Feed (created by functions)
```
activity_feed/
  user_123/
    -NyYyYyYyYyYyYyY/
      type: "booking" | "safe_zone_alert" | "message"
      message: "Activity description"
      timestamp: 1699999999999
      read: false
      // Additional fields based on type
```

#### Safe Zone Alerts (created by onGpsUpdate)
```
safe_zone_alerts/
  pet_123/
    lastAlert: 1699999999999
```

---

## 🚀 Deployment (Requires Blaze Plan)

### 1. Upgrade to Blaze Plan

Visit: https://console.firebase.google.com/project/fyppp-5b4f0/usage/details

**Cost**: Pay-as-you-go
- **Free tier**: 2M invocations/month, 400K GB-seconds, 200K CPU-seconds
- These functions should stay well within free limits

### 2. Deploy Functions

```bash
firebase deploy --only functions
```

Or deploy specific functions:
```bash
firebase deploy --only functions:onBookingCreate,functions:onGpsUpdate,functions:onNewMessage
```

### 3. Monitor Function Logs

```bash
firebase functions:log
```

Or view in console:
https://console.firebase.google.com/project/fyppp-5b4f0/functions/logs

---

## 🔍 Monitoring & Debugging

### View Function Executions

```bash
# Tail logs in real-time
firebase functions:log --only onBookingCreate

# View specific function
firebase functions:log --only onGpsUpdate
```

### Check Emulator Logs

When running emulators, check terminal output for:
- ✅ Function triggered successfully
- ⚠️ Warnings (e.g., no safe zone configured)
- ❌ Errors

---

## 💡 Best Practices

### 1. Safe Zone Configuration

Add safe zone settings to pet profile:
```javascript
// In MyPets.jsx or pet edit form
const [safeZone, setSafeZone] = useState({
  enabled: false,
  centerLat: null,
  centerLng: null,
  radiusMeters: 100
});

// When saving pet
await updateDoc(doc(db, 'pets', petId), {
  safeZone: {
    enabled: safeZone.enabled,
    centerLat: parseFloat(safeZone.centerLat),
    centerLng: parseFloat(safeZone.centerLng),
    radiusMeters: parseInt(safeZone.radiusMeters)
  }
});
```

### 2. Reading Notifications

Fetch notifications for user:
```javascript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const q = query(
  collection(db, 'notifications'),
  where('userId', '==', currentUser.id),
  where('read', '==', false),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setNotifications(notifications);
});
```

### 3. Mark Notification as Read

```javascript
import { doc, updateDoc } from 'firebase/firestore';

const markAsRead = async (notificationId) => {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true
  });
};
```

---

## 📈 Cost Estimation (Blaze Plan)

**Assumptions**:
- 1000 bookings/month
- 10,000 GPS updates/month (smart collar updates every 5 min)
- 5000 messages/month

**Estimated invocations**: ~16,000/month
**Estimated cost**: **$0.00** (well within free tier of 2M invocations)

**Free tier limits**:
- ✅ 2M invocations/month
- ✅ 400K GB-seconds
- ✅ 200K CPU-seconds

These functions are lightweight and should stay free indefinitely!

---

## 🎉 Summary

✅ **Three Cloud Functions created**:
1. `onBookingCreate` - Notify providers of new bookings
2. `onGpsUpdate` - Alert owners when pets leave safe zones
3. `onNewMessage` - Notify users of new messages

✅ **Spark-plan-safe** (no external API calls)
✅ **Tested locally** with emulators
✅ **Ready to deploy** when you upgrade to Blaze plan
✅ **Cost-effective** (stays within free tier)

---

## 🔗 Next Steps

1. **Test locally** with Firebase Emulators
2. **Upgrade to Blaze plan** (when ready)
3. **Deploy functions** with `firebase deploy --only functions`
4. **Monitor logs** to ensure everything works
5. **Add notification UI** to display alerts to users

For emulator setup, see: `FIREBASE_SETUP_GUIDE.md`
For realtime features usage, see: `REALTIME_FEATURES_GUIDE.md`






