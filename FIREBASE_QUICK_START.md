# Firebase Quick Start - PetCare Hub

## 🚀 Quick Setup (5 Minutes)

### 1. Create Firebase Project
```bash
# Login to Firebase
firebase login

# Go to https://console.firebase.google.com/
# Create a new project called "PetCare Hub"
```

### 2. Configure Environment Variables
```bash
# Copy the template
cp env.template .env

# Edit .env with your Firebase config from:
# Firebase Console > Project Settings > Your apps > SDK setup and configuration
```

### 3. Update Firebase Project ID
```bash
# Edit .firebaserc and replace with your project ID
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### 4. Enable Firebase Services

In Firebase Console, enable these services:

**Authentication** → Enable Email/Password  
**Firestore Database** → Create database (production mode)  
**Realtime Database** → Create database  
**Storage** → Get started  

### 5. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,database:rules,storage:rules
```

### 6. Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### 7. Build and Deploy
```bash
# Build React app
npm run build

# Deploy everything
firebase deploy
```

---

## 🧪 Development with Emulators

### Start Emulators
```bash
# Start all emulators
npm run firebase:emulators

# Or use Firebase CLI directly
firebase emulators:start
```

### Enable Emulators in App
```bash
# In .env file, set:
REACT_APP_USE_FIREBASE_EMULATORS=true

# Then restart your dev server:
npm start
```

### Access Emulator UI
Open: `http://localhost:4000`

---

## 📦 NPM Scripts Available

```bash
# Development
npm start                    # Start React dev server
npm run start:backend        # Start backend server
npm run dev                  # Start both frontend and backend

# Build
npm run build                # Build React app for production

# Firebase
npm run firebase:deploy      # Deploy everything to Firebase
npm run firebase:hosting     # Deploy hosting only
npm run firebase:functions   # Deploy functions only
npm run firebase:rules       # Deploy security rules only
npm run firebase:emulators   # Start Firebase emulators
```

---

## 🔑 Environment Variables Reference

Create a `.env` file with:

```env
# Required
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_DATABASE_URL=

# Optional
REACT_APP_USE_FIREBASE_EMULATORS=false
```

---

## 📂 Firebase Project Structure

```
petcare-hub/
├── firebase.json                 # Firebase configuration
├── .firebaserc                   # Firebase project settings
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── database.rules.json          # Realtime DB rules
├── storage.rules                # Storage security rules
├── functions/                   # Cloud Functions
│   ├── index.js                # Functions code
│   └── package.json            # Functions dependencies
├── build/                       # React production build (hosting)
└── src/
    ├── config/
    │   └── firebase.js         # Firebase initialization
    └── utils/
        └── firebaseHelpers.js  # Helper functions
```

---

## 🔥 Common Firebase Operations

### Authentication

```javascript
import { auth } from './config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';

// Sign up
const signup = await createUserWithEmailAndPassword(auth, email, password);

// Sign in
const login = await signInWithEmailAndPassword(auth, email, password);

// Sign out
await signOut(auth);
```

### Firestore

```javascript
import { db } from './config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

// Create
await addDoc(collection(db, 'pets'), { name: 'Fluffy', type: 'cat' });

// Read
const snapshot = await getDocs(collection(db, 'pets'));
const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Update
await updateDoc(doc(db, 'pets', petId), { name: 'New Name' });
```

### Realtime Database

```javascript
import { realtimeDb } from './config/firebase';
import { ref, set, onValue } from 'firebase/database';

// Write
await set(ref(realtimeDb, `petLocations/${petId}`), {
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: Date.now()
});

// Listen
onValue(ref(realtimeDb, `petLocations/${petId}`), (snapshot) => {
  const location = snapshot.val();
  console.log(location);
});
```

### Storage

```javascript
import { storage } from './config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload
const storageRef = ref(storage, `pets/${petId}/photo.jpg`);
await uploadBytes(storageRef, file);

// Get URL
const url = await getDownloadURL(storageRef);
```

---

## 🛟 Troubleshooting

### "Permission denied" errors
```bash
# Deploy security rules
firebase deploy --only firestore:rules,database:rules,storage:rules
```

### Environment variables not working
```bash
# Restart dev server after changing .env
npm start
```

### Functions not deploying
```bash
# Install dependencies
cd functions && npm install && cd ..

# Check Node version (must be 18)
node --version
```

### Port already in use
```bash
# Kill processes on Firebase ports
lsof -ti:4000,5000,5001,8080,9000,9099,9199 | xargs kill -9
```

---

## 📊 Monitor Usage

**Check quota usage:**
Firebase Console → Usage and billing

**Set up alerts:**
Usage and billing → Details & settings → Enable notifications

---

## 🎯 Next Steps

1. ✅ Complete Firebase setup
2. ✅ Test with emulators
3. ✅ Deploy to production
4. 📖 Read full setup guide: `FIREBASE_SETUP_GUIDE.md`
5. 📖 Learn optimization: `SPARK_PLAN_OPTIMIZATION.md`

---

**Need help?** Check the detailed guides:
- `FIREBASE_SETUP_GUIDE.md` - Complete setup instructions
- `SPARK_PLAN_OPTIMIZATION.md` - How to stay within free tier limits

---

**Happy Building! 🎉**

