# ⚡ Cloud Functions Quick Test Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Firebase Emulators

```bash
firebase emulators:start
```

Wait for:
```
✔  functions: Emulator started at http://127.0.0.1:5001
✔  firestore: Emulator started at http://127.0.0.1:8080
✔  database: Emulator started at http://127.0.0.1:9000
```

Keep this terminal open!

---

### 2. Enable Emulators in Frontend

In `.env`:
```bash
REACT_APP_USE_FIREBASE_EMULATORS=true
```

Start your frontend (new terminal):
```bash
npm start
```

---

## 🧪 Test Each Function

### Test 1: onBookingCreate 📅

**What it does**: Notifies provider when a booking is created

**Steps**:
1. Log in as a user
2. Book a service from a provider
3. Log in as the provider
4. Click the notification bell 🔔 in navbar
5. You should see: "🎉 New Booking Request from [User]"

**Check**:
- ✅ Notification appears in bell dropdown
- ✅ Unread badge shows count
- ✅ Click notification to mark as read

**Emulator Console**:
Look for in terminal:
```
✅ Booking notification sent to provider provider_123 for booking booking_456
```

---

### Test 2: onGpsUpdate ⚠️

**What it does**: Alerts owner when pet leaves safe zone

**Setup** (in Firestore emulator UI: http://localhost:4000/firestore):

1. Create/edit a pet document:
```javascript
Collection: pets
Document ID: pet_123
Fields:
  name: "Buddy"
  ownerId: "your_user_id"
  safeZone:
    enabled: true
    centerLat: 33.6844
    centerLng: 73.0479
    radiusMeters: 100
```

2. Update GPS location (in browser console or code):
```javascript
import { ref, set } from 'firebase/database';
import { realtimeDb } from './config/firebase';

// Inside safe zone (no alert)
await set(ref(realtimeDb, 'gps_tracking/pet_123'), {
  lat: 33.6844,
  lng: 73.0479,
  lastUpdated: Date.now()
});

// Outside safe zone (triggers alert!)
await set(ref(realtimeDb, 'gps_tracking/pet_123'), {
  lat: 33.6850,  // ~66m away
  lng: 73.0490,  // Total: ~150m outside zone
  lastUpdated: Date.now()
});
```

**Check**:
- ✅ Notification appears: "⚠️ Buddy has left the safe zone! Distance: 150m"
- ✅ Only one alert per 5 minutes (anti-spam)

**Emulator Console**:
```
⚠️ Pet pet_123 is outside safe zone! Distance: 150m
✅ Safe zone alert sent to owner user_123
```

---

### Test 3: onNewMessage 💬

**What it does**: Notifies receiver of new messages

**Steps**:

1. Use the chat component or send a message via code:
```javascript
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from './config/firebase';

const chatId = 'user_123_user_456'; // Sender_Receiver
const messageRef = push(ref(realtimeDb, `messages/${chatId}`));

await set(messageRef, {
  senderId: 'user_123',
  receiverId: 'user_456',
  text: 'Hello! How can I help you?',
  timestamp: Date.now(),
  read: false
});
```

2. Log in as the receiver (`user_456`)
3. Check notification bell 🔔

**Check**:
- ✅ Notification: "💬 New message from [Sender]: Hello! How can..."
- ✅ Click to mark as read

**Emulator Console**:
```
✅ Message notification sent to user_456 from John Doe
```

---

## 🎯 Quick Test Checklist

| Function | Test | Status |
|----------|------|--------|
| `onBookingCreate` | Created booking → Provider notified | ⬜ |
| `onGpsUpdate` | Pet outside zone → Owner alerted | ⬜ |
| `onNewMessage` | Sent message → Receiver notified | ⬜ |
| Notification Bell | Shows unread count | ⬜ |
| Notification Bell | Mark as read works | ⬜ |

---

## 🔍 Troubleshooting

### Functions not triggering?

1. **Check emulators are running**:
   ```bash
   # You should see this in terminal:
   ✔  functions: Emulator started at http://127.0.0.1:5001
   ```

2. **Check .env has emulators enabled**:
   ```bash
   REACT_APP_USE_FIREBASE_EMULATORS=true
   ```

3. **Check browser console** for errors

4. **Check emulator console** for function logs

### Notifications not showing?

1. **Check you're logged in** - bell only shows for authenticated users
2. **Refresh the page** after creating notification
3. **Check Firestore emulator UI**: http://localhost:4000/firestore
   - Look for `notifications` collection
4. **Check browser console** for errors

### Safe zone alerts not working?

1. **Verify safe zone is configured** in pet document
2. **Check distance calculation** - pet must be >100m away (default)
3. **Wait 5 minutes** between alerts (anti-spam)
4. **Check emulator console** for function logs

---

## 📊 View Data in Emulator UI

Open: **http://localhost:4000**

### Firestore
http://localhost:4000/firestore

Check collections:
- `notifications` - All notifications created by functions
- `pets` - Pet documents with safe zones
- `bookings` - Booking documents

### Realtime Database
http://localhost:4000/database

Check paths:
- `gps_tracking/{petId}` - GPS locations
- `messages/{chatId}` - Chat messages
- `activity_feed/{userId}` - Activity notifications
- `safe_zone_alerts/{petId}` - Last alert timestamps

---

## 💡 Testing Tips

### 1. Browser Console Helpers

Open browser console (F12) and paste:

```javascript
// Quick booking test
async function testBooking() {
  const { db } = await import('./config/firebase');
  const { collection, addDoc } = await import('firebase/firestore');
  
  await addDoc(collection(db, 'bookings'), {
    userId: 'user_123',
    providerId: 'provider_456',
    serviceId: 'service_789',
    date: '2024-01-15',
    status: 'pending',
    price: 50
  });
  
  console.log('✅ Booking created! Check provider notifications.');
}

// Quick message test
async function testMessage() {
  const { realtimeDb } = await import('./config/firebase');
  const { ref, push, set } = await import('firebase/database');
  
  const chatId = 'user_123_user_456';
  const msgRef = push(ref(realtimeDb, `messages/${chatId}`));
  
  await set(msgRef, {
    senderId: 'user_123',
    receiverId: 'user_456',
    text: 'Test message!',
    timestamp: Date.now(),
    read: false
  });
  
  console.log('✅ Message sent! Check receiver notifications.');
}

// Quick GPS test (outside safe zone)
async function testGPS() {
  const { realtimeDb } = await import('./config/firebase');
  const { ref, set } = await import('firebase/database');
  
  await set(ref(realtimeDb, 'gps_tracking/pet_123'), {
    lat: 33.6850,
    lng: 73.0490,
    lastUpdated: Date.now()
  });
  
  console.log('✅ GPS updated! Check owner notifications if safe zone is configured.');
}
```

Then call:
```javascript
testBooking();
testMessage();
testGPS();
```

### 2. Monitor Function Logs

In emulator terminal, watch for:
- ✅ Green checkmarks = Success
- ⚠️ Yellow warnings = Info (e.g., "No safe zone configured")
- ❌ Red errors = Something went wrong

### 3. Network Tab

Open DevTools → Network tab → Filter by "firestore" or "database" to see real-time updates

---

## 🎉 Success Criteria

You've successfully tested when:

✅ Booking notification appears when you create a booking  
✅ Safe zone alert appears when pet leaves zone  
✅ Message notification appears when message is sent  
✅ Notification bell shows unread count  
✅ Clicking notification marks it as read  
✅ All three function types logged in emulator console  

---

## 🚀 Ready for Production?

When you're satisfied with testing:

1. Upgrade to Blaze plan
2. Deploy: `firebase deploy --only functions`
3. Remove `REACT_APP_USE_FIREBASE_EMULATORS=true` from `.env`
4. Test in production!

---

For detailed documentation, see: **CLOUD_FUNCTIONS_GUIDE.md**






