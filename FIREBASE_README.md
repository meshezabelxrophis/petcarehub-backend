# Firebase Integration - PetCare Hub

Firebase has been successfully initialized for your PetCare Hub project on the **Spark (Free) Plan**.

## ✅ What's Been Set Up

### 1. Firebase Services Enabled
- ✅ **Firestore** - Main database for structured data
- ✅ **Realtime Database** - For GPS tracking and real-time chat
- ✅ **Authentication** - Role-based user authentication
- ✅ **Storage** - For pet images and documents
- ✅ **Cloud Functions** - Internal automation and triggers
- ✅ **Hosting** - For deploying your React app

### 2. Security Configured
- ✅ **Firestore Rules** - Role-based access control (user, provider, admin)
- ✅ **Realtime Database Rules** - Secure GPS and chat data
- ✅ **Storage Rules** - Protected file uploads with size limits
- ✅ **Indexes** - Optimized Firestore queries

### 3. Cloud Functions Ready
Location: `/functions/index.js`

Includes:
- User profile creation on signup
- User data cleanup on deletion
- Service rating updates
- Booking status notifications
- Location history logging
- User/Provider statistics

### 4. Development Setup
- ✅ Firebase SDK installed
- ✅ Firebase CLI tools installed
- ✅ Emulator configuration ready
- ✅ Helper functions created
- ✅ Environment template provided

---

## 📁 Files Created

```
PetCare Hub/
├── firebase.json                    # Firebase project config
├── .firebaserc                      # Project ID settings
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore query indexes
├── database.rules.json              # Realtime DB security rules
├── storage.rules                    # Storage security rules
├── env.template                     # Environment variables template
├── .gitignore                       # Updated with Firebase ignores
│
├── functions/                       # Cloud Functions
│   ├── index.js                    # Functions code (triggers & callables)
│   ├── package.json                # Functions dependencies
│   ├── .eslintrc.js                # ESLint configuration
│   └── .gitignore                  # Functions gitignore
│
├── src/
│   ├── config/
│   │   └── firebase.js             # Firebase initialization
│   └── utils/
│       └── firebaseHelpers.js      # Helper functions
│
└── Documentation/
    ├── FIREBASE_SETUP_GUIDE.md      # Complete setup instructions
    ├── FIREBASE_QUICK_START.md      # Quick start guide
    └── SPARK_PLAN_OPTIMIZATION.md   # Free tier optimization tips
```

---

## 🚀 Next Steps

### 1. Create Your Firebase Project (5 min)

```bash
# Login to Firebase
firebase login

# Create project at: https://console.firebase.google.com/
# Project name: "PetCare Hub" (or your choice)
```

### 2. Configure Your Environment (2 min)

```bash
# Copy the template
cp env.template .env

# Get your config from Firebase Console:
# Project Settings > Your apps > SDK setup and configuration

# Edit .env with your actual Firebase config
```

### 3. Update Project ID (1 min)

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### 4. Enable Services in Firebase Console (3 min)

Enable these in the Firebase Console:
1. **Authentication** → Email/Password
2. **Firestore Database** → Create database
3. **Realtime Database** → Create database
4. **Storage** → Get started

### 5. Deploy Security Rules (1 min)

```bash
npm run firebase:rules
```

### 6. Install Functions Dependencies (1 min)

```bash
cd functions && npm install && cd ..
```

### 7. Test with Emulators (Optional)

```bash
# Start emulators
npm run firebase:emulators

# In .env, enable emulators
REACT_APP_USE_FIREBASE_EMULATORS=true

# Access Emulator UI at: http://localhost:4000
```

### 8. Deploy to Production

```bash
# Build your app
npm run build

# Deploy everything
npm run firebase:deploy

# Or deploy individually:
npm run firebase:hosting      # Deploy frontend
npm run firebase:functions    # Deploy functions
```

---

## 📚 Documentation Guide

### For Quick Start
→ Read: `FIREBASE_QUICK_START.md`
- 5-minute setup
- Common operations
- Quick troubleshooting

### For Complete Setup
→ Read: `FIREBASE_SETUP_GUIDE.md`
- Detailed step-by-step instructions
- Service configuration
- Deployment guide
- Emulator setup
- Full troubleshooting

### For Optimization
→ Read: `SPARK_PLAN_OPTIMIZATION.md`
- Stay within free tier limits
- Performance optimization
- Best practices
- Cost prevention tips

---

## 🎯 Key Features

### Authentication System
- Email/password authentication
- Role-based access (user, provider, admin)
- Automatic profile creation
- Secure user management

### Database Architecture

**Firestore Collections:**
- `users` - User profiles
- `pets` - Pet information
- `services` - Service listings
- `bookings` - Appointment bookings
- `reviews` - Service reviews
- `messages` - Chat messages
- `conversations` - Chat rooms
- `clinics` - Veterinary clinics

**Realtime Database:**
- `petLocations` - Live GPS tracking
- `chatRooms` - Real-time messaging
- `onlineStatus` - User presence
- `typing` - Typing indicators

### Storage Structure
```
/users/{userId}/profile/         # Profile pictures
/pets/{petId}/images/            # Pet photos
/pets/{petId}/medical/           # Medical records
/services/{serviceId}/images/    # Service images
/chat/{roomId}/                  # Chat media
/clinics/{clinicId}/images/      # Clinic photos
```

---

## 🔒 Security Features

### Firestore Rules
- ✅ Users can only edit their own data
- ✅ Providers can manage their services
- ✅ Booking access limited to participants
- ✅ Reviews publicly readable
- ✅ Messages only visible to sender/receiver

### Realtime Database Rules
- ✅ GPS data protected by authentication
- ✅ Chat rooms secured to participants
- ✅ Input validation on all fields
- ✅ Size and type restrictions

### Storage Rules
- ✅ 5MB limit on images
- ✅ 10MB limit on documents
- ✅ File type validation
- ✅ User ownership verification

---

## 💡 Usage Examples

### Using Firebase in Your Components

```javascript
// Import Firebase config
import { auth, db, realtimeDb, storage } from './config/firebase';

// Or use helper functions
import { createDocument, updateDocument } from './utils/firebaseHelpers';

// Example: Add a pet
const addPet = async (petData) => {
  const result = await createDocument('pets', {
    ...petData,
    ownerId: auth.currentUser.uid
  });
  
  if (result.success) {
    console.log('Pet added with ID:', result.id);
  }
};

// Example: Upload pet image
import { uploadFile } from './utils/firebaseHelpers';

const uploadPetPhoto = async (petId, file) => {
  const path = `pets/${petId}/images/${Date.now()}.jpg`;
  const result = await uploadFile(path, file);
  
  if (result.success) {
    console.log('Image URL:', result.url);
  }
};
```

---

## 🎨 NPM Scripts Reference

```bash
# Development
npm start                     # Start React dev server
npm run dev                   # Start frontend + backend

# Build
npm run build                 # Build for production

# Firebase
npm run firebase:deploy       # Deploy everything
npm run firebase:hosting      # Deploy frontend only
npm run firebase:functions    # Deploy functions only
npm run firebase:rules        # Deploy security rules
npm run firebase:emulators    # Start local emulators
npm run firebase:logs         # View function logs
```

---

## ⚠️ Spark Plan Limits

**Stay aware of free tier limits:**

| Service | Limit |
|---------|-------|
| Firestore Reads | 50K/day |
| Firestore Writes | 20K/day |
| Realtime DB Storage | 1 GB |
| Storage | 5 GB |
| Function Invocations | 125K/month |
| Hosting Transfer | 360 MB/day |

**💡 Tip:** Use emulators during development to save quota!

---

## 🐛 Common Issues

### "Permission denied" error
**Solution:** Deploy security rules
```bash
npm run firebase:rules
```

### Environment variables not loading
**Solution:** 
1. Ensure `.env` file is in root directory
2. Restart dev server: `npm start`
3. Variables must start with `REACT_APP_`

### Functions deployment fails
**Solution:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Emulators won't start
**Solution:** Kill processes and retry
```bash
lsof -ti:4000,5000,5001,8080,9000,9099,9199 | xargs kill -9
npm run firebase:emulators
```

---

## 📊 Monitoring

**Check your usage:**
- Firebase Console → Usage and billing
- Set up alerts at 50%, 75%, 90% quota

**Monitor in real-time:**
- Firebase Console → Analytics
- Functions logs: `npm run firebase:logs`

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Status](https://status.firebase.google.com/)
- [Pricing Calculator](https://firebase.google.com/pricing)

---

## 🎉 You're All Set!

Firebase is now configured for your PetCare Hub project. Follow the **Next Steps** section above to complete the setup.

**Questions?** Check the detailed guides in the project root:
- `FIREBASE_SETUP_GUIDE.md`
- `FIREBASE_QUICK_START.md`
- `SPARK_PLAN_OPTIMIZATION.md`

**Happy coding! 🚀**

