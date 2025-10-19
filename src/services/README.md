# Services Architecture

This directory contains the service layer that defines how the frontend communicates with Firebase and the Vercel backend.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              COMPONENTS & PAGES                     │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              SERVICE LAYER                          │    │
│  │                                                      │    │
│  │  ┌──────────────────┐    ┌─────────────────────┐  │    │
│  │  │  Firebase Direct │    │  Vercel Backend API │  │    │
│  │  │                  │    │  (Authenticated)    │  │    │
│  │  │ • Auth           │    │  • Stripe Payments │  │    │
│  │  │ • Firestore      │    │  • Gemini AI       │  │    │
│  │  │ • Realtime DB    │    │  • AI Image Anal.  │  │    │
│  │  │ • Storage        │    │  • Store to DB     │  │    │
│  │  │ • Cloud Functions│    │                     │  │    │
│  │  └──────────────────┘    └─────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Service Files

### Core Configuration

#### `config/api.js`
**Central API configuration and authenticated fetch wrapper**

- Defines Vercel backend base URL
- Provides `authenticatedFetch()` for all Vercel API calls
- Includes Firebase auth token in requests
- Exports all Vercel API functions:
  - `createPaymentIntent()` - Stripe payments
  - `generateAIResponse()` - Gemini AI chat
  - `analyzeImage()` - Gemini Vision for images
  - `storeToFirestore()` - Backend storage
  - `retrieveFromFirestore()` - Backend retrieval

### Firebase Services (Direct Access)

#### `firestoreService.js`
**Firebase Firestore operations**

Use for:
- User profiles
- Bookings
- Pets
- Services
- Providers
- Notifications (read-only)

Functions:
- `getUserProfile()`, `updateUserProfile()`
- `createBooking()`, `getUserBookings()`, `updateBooking()`
- `getUserPets()`, `addPet()`, `updatePet()`, `deletePet()`
- `getAllServices()`, `getService()`
- `getUserNotifications()`, `markNotificationAsRead()`
- Real-time subscriptions: `subscribeToBooking()`, `subscribeToNotifications()`

#### `realtimeService.js`
**Firebase Realtime Database operations**

Use for:
- Live GPS location tracking
- Real-time chat
- Online status
- Live updates

Functions:
- GPS: `updatePetLocation()`, `getPetLocation()`, `subscribeToLocation()`
- Chat: `sendChatMessage()`, `getChatMessages()`, `subscribeToChatMessages()`
- Status: `setUserOnlineStatus()`, `subscribeToUserStatus()`
- Generic: `setLiveData()`, `subscribeToLiveData()`

### Vercel Backend Services (Via API)

#### `paymentService.js`
**Stripe payment processing via Vercel**

Functions:
- `processPayment()` - Create payment intent and update booking
- `confirmPayment()` - Confirm payment completion

Flow:
1. Call Vercel backend to create Stripe payment intent
2. Update booking in Firebase Firestore with payment ID
3. Store payment record via backend (saves to Firestore)

#### `aiService.js`
**Gemini AI via Vercel**

Functions:
- `chatWithAI()` - Chat with AI assistant
- `analyzePetImage()` - Analyze pet images (health, breed, etc.)
- `getPetCareRecommendations()` - Get personalized recommendations

Flow:
1. Call Vercel backend with authenticated request
2. Backend calls Gemini API
3. Backend stores result in Firestore
4. Return result to frontend

## 🔐 Authentication

All Vercel backend calls are authenticated using Firebase Auth tokens:

```javascript
import { createPaymentIntent } from '../config/api';

// Automatically includes Firebase auth token
const result = await createPaymentIntent({
  amount: 50.00,
  serviceName: 'Dog Grooming'
});
```

The `authenticatedFetch()` wrapper:
1. Gets current user's Firebase ID token
2. Adds `Authorization: Bearer <token>` header
3. Adds `Origin` header for CORS
4. Makes HTTPS request to Vercel backend

## 📖 Usage Examples

### Example 1: Create Booking with Payment

```javascript
import { createBooking } from '../services/firestoreService';
import { processPayment } from '../services/paymentService';

// 1. Create booking in Firebase
const bookingId = await createBooking({
  serviceId: 'service_123',
  serviceName: 'Dog Grooming',
  petId: 'pet_456',
  scheduledDate: '2025-10-20',
  price: 50.00
});

// 2. Process payment via Vercel (Stripe)
const payment = await processPayment({
  bookingId,
  serviceId: 'service_123',
  serviceName: 'Dog Grooming',
  amount: 50.00,
  userId: currentUser.uid
});

// 3. Use payment.clientSecret with Stripe Elements
```

### Example 2: AI Chat with Storage

```javascript
import { chatWithAI } from '../services/aiService';

const response = await chatWithAI(
  'What are the best foods for golden retrievers?',
  'session_123',
  {
    petType: 'dog',
    breed: 'Golden Retriever',
    age: 3
  }
);

// Response automatically stored in Firestore via backend
console.log(response.reply);
```

### Example 3: Real-time GPS Tracking

```javascript
import { subscribeToLocation } from '../services/realtimeService';

// Subscribe to pet location updates
const unsubscribe = subscribeToLocation('pet_123', (location) => {
  if (location) {
    console.log(`Pet at: ${location.latitude}, ${location.longitude}`);
    updateMapMarker(location);
  }
});

// Clean up when component unmounts
return () => unsubscribe();
```

### Example 4: Real-time Chat

```javascript
import { 
  sendChatMessage, 
  subscribeToChatMessages 
} from '../services/realtimeService';

// Subscribe to messages
const unsubscribe = subscribeToChatMessages(
  'chat_room_123', 
  (messages) => {
    setMessages(messages);
  }
);

// Send message
await sendChatMessage('chat_room_123', {
  text: 'Hello!',
  senderId: currentUser.uid,
  senderName: currentUser.displayName
});
```

### Example 5: Image Analysis

```javascript
import { analyzePetImage } from '../services/aiService';

const handleImageUpload = async (file) => {
  const result = await analyzePetImage(file, 'health');
  
  if (result.success) {
    console.log('Analysis:', result.analysis);
    // Result automatically stored in Firestore
  }
};
```

## 🚀 Best Practices

### 1. Use Firebase for Real-time Data
```javascript
// ✅ Good - Real-time updates
import { subscribeToBooking } from '../services/firestoreService';

const unsubscribe = subscribeToBooking(bookingId, (booking) => {
  setBooking(booking);
});
```

### 2. Use Vercel for External APIs
```javascript
// ✅ Good - Stripe via Vercel
import { processPayment } from '../services/paymentService';

const payment = await processPayment(paymentData);
```

### 3. Always Handle Errors
```javascript
try {
  const result = await chatWithAI(message, sessionId);
  if (result.success) {
    // Handle success
  }
} catch (error) {
  console.error('AI chat failed:', error);
  // Show user-friendly error
}
```

### 4. Clean Up Subscriptions
```javascript
useEffect(() => {
  const unsubscribe = subscribeToLocation(petId, callback);
  
  // Clean up on unmount
  return () => unsubscribe();
}, [petId]);
```

## 🔄 Data Flow

### Firebase Flow (Direct)
```
Component → Service → Firebase → Component
```

### Vercel Flow (Authenticated)
```
Component → Service → API Config → Vercel Backend → External API
                                  ↓
                                  → Firebase (storage)
```

## 📝 Notes

- **Firebase Auth** is required for all Vercel backend calls
- **CORS** is configured for your Firebase Hosting domain
- **Environment variables** are set in Vercel (not in frontend)
- **Firestore security rules** should validate all writes
- **Realtime DB rules** should protect location and chat data
- **Cloud Functions** handle notifications automatically

## 🆘 Troubleshooting

### Issue: "User not authenticated" error
**Solution**: Ensure user is logged in before calling Vercel APIs

### Issue: CORS error
**Solution**: Make sure requests are from `https://fyppp-5b4f0.web.app`

### Issue: Real-time updates not working
**Solution**: Check Firebase Realtime Database rules and ensure subscription is active

### Issue: Payment fails
**Solution**: Check Vercel logs and ensure Stripe keys are configured

