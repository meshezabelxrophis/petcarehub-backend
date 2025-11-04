# 🛡️ Safe Zone Feature - Implementation Guide

## Overview

The Safe Zone feature allows users to define a geographic boundary for their pets and receive alerts when pets leave this designated area.

## Features Implemented

✅ **Set Safe Zone Modal** - Clean, minimalist UI to configure safe zones  
✅ **Firestore Integration** - Data saved to `/users/{userId}/safeZone`  
✅ **Auto-population** - Defaults to current pet's GPS location  
✅ **Update Existing** - Automatically updates if safe zone already exists  
✅ **Success Toast** - Beautiful confirmation message  
✅ **Helper Utilities** - Functions to monitor and check safe zone breaches  
✅ **Map Visualization** - Component to display safe zone on Leaflet map  

---

## 📁 Files Created/Modified

### New Files:
1. **`src/components/SafeZoneModal.jsx`** - Main modal component
2. **`src/utils/safeZoneHelper.js`** - Utility functions for safe zone calculations
3. **`src/components/SafeZoneCircle.jsx`** - Leaflet component to visualize safe zone

### Modified Files:
1. **`src/pages/TrackMyPet.jsx`** - Integrated "Set Safe Zone" button and modal

---

## 🎯 How to Use

### 1. Setting a Safe Zone

1. Navigate to **Track My Pet** page
2. Select the pet you want to track
3. Click **"Set Safe Zone"** button
4. The modal will appear with:
   - **Latitude** (pre-filled with pet's current location)
   - **Longitude** (pre-filled with pet's current location)
   - **Radius** (default: 100 meters, customizable)
5. Adjust values as needed or click **"Use Current Pet Location"**
6. Click **"Set Safe Zone"** to save
7. Success toast appears confirming the save

### 2. Firestore Data Structure

Safe zone data is stored at:
```
/users/{userId}/safeZone
```

**Data format:**
```javascript
{
  lat: 33.6844,           // Latitude of safe zone center
  lng: 73.0479,           // Longitude of safe zone center
  radius: 100,            // Radius in meters
  updatedAt: "2024-11-04T...",  // ISO timestamp
  petName: "Max"          // Pet name for reference
}
```

### 3. Retrieving Safe Zone Data

Use the helper utilities:

```javascript
import { getUserSafeZone, isPetInSafeZone, getSafeZoneStatus } from '../utils/safeZoneHelper';

// Get user's safe zone
const safeZone = await getUserSafeZone(userId);
console.log(safeZone);
// { lat: 33.6844, lng: 73.0479, radius: 100, ... }

// Check if pet is in safe zone
const petLocation = { lat: 33.6850, lng: 73.0480 };
const isInside = isPetInSafeZone(petLocation, safeZone);
console.log(isInside); // true or false

// Get detailed status
const status = getSafeZoneStatus(petLocation, safeZone);
console.log(status);
// {
//   isInside: true,
//   distance: 75,              // meters from center
//   distanceFromEdge: 25,      // meters from boundary
//   percentageOutside: 0       // 0 if inside, >0 if outside
// }
```

### 4. Displaying Safe Zone on Map

Add the `SafeZoneCircle` component to your `PetMap.jsx`:

```javascript
import SafeZoneCircle from './SafeZoneCircle';
import { getUserSafeZone } from '../utils/safeZoneHelper';

function PetMap({ petId, petName }) {
  const [safeZone, setSafeZone] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    const loadSafeZone = async () => {
      const zone = await getUserSafeZone(userId);
      setSafeZone(zone);
    };
    loadSafeZone();
  }, [userId]);

  return (
    <MapContainer center={position} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Your existing pet marker */}
      <Marker position={petPosition} icon={pawIcon}>
        <Popup>Pet Location</Popup>
      </Marker>

      {/* Safe Zone Circle */}
      <SafeZoneCircle safeZone={safeZone} />
    </MapContainer>
  );
}
```

---

## 🔔 Implementing Alerts (Next Steps)

To implement alerts when a pet leaves the safe zone:

### Option 1: Client-side Monitoring

```javascript
import { useEffect, useState } from 'react';
import { gpsTrackingService } from '../services/realtimeDatabase';
import { getUserSafeZone, getSafeZoneStatus } from '../utils/safeZoneHelper';

function useSafeZoneMonitoring(petId, userId) {
  const [isOutside, setIsOutside] = useState(false);

  useEffect(() => {
    let unsubscribe;

    const setupMonitoring = async () => {
      // Get safe zone
      const safeZone = await getUserSafeZone(userId);
      if (!safeZone) return;

      // Listen to pet location updates
      unsubscribe = gpsTrackingService.listenToLocation(petId, (location) => {
        if (!location) return;

        const status = getSafeZoneStatus(
          { lat: location.lat, lng: location.lng },
          safeZone
        );

        if (!status.isInside && !isOutside) {
          // Pet just left safe zone
          setIsOutside(true);
          showNotification(`⚠️ ${petName} left the safe zone!`);
          console.log(`Pet is ${status.distanceFromEdge}m outside safe zone`);
        } else if (status.isInside && isOutside) {
          // Pet returned to safe zone
          setIsOutside(false);
          showNotification(`✅ ${petName} returned to safe zone`);
        }
      });
    };

    setupMonitoring();
    return () => unsubscribe?.();
  }, [petId, userId]);

  return { isOutside };
}
```

### Option 2: Firebase Cloud Function (Recommended for Production)

Create a Cloud Function to monitor pet locations:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.monitorSafeZone = functions.database
  .ref('/gps_tracking/{petId}')
  .onUpdate(async (change, context) => {
    const petId = context.params.petId;
    const newLocation = change.after.val();
    
    // Get owner's user ID and safe zone
    const petDoc = await admin.firestore()
      .collection('pets')
      .doc(petId)
      .get();
    
    const userId = petDoc.data().ownerId;
    
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    const safeZone = userDoc.data().safeZone;
    if (!safeZone) return;
    
    // Calculate distance
    const distance = calculateDistance(
      newLocation.lat,
      newLocation.lng,
      safeZone.lat,
      safeZone.lng
    );
    
    // Check if outside safe zone
    if (distance > safeZone.radius) {
      // Send push notification
      await admin.messaging().sendToDevice(
        userDoc.data().fcmToken,
        {
          notification: {
            title: '⚠️ Pet Left Safe Zone',
            body: `Your pet is ${Math.round(distance - safeZone.radius)}m outside the safe zone!`,
          }
        }
      );
    }
  });
```

---

## 🎨 Customization

### Change Safe Zone Color

In `SafeZoneCircle.jsx`:
```javascript
<SafeZoneCircle 
  safeZone={safeZone} 
  color="#ef4444"      // Red color
  fillOpacity={0.3}    // More visible
/>
```

### Modify Modal Appearance

Edit `src/components/SafeZoneModal.jsx`:
- Change gradient colors in the header
- Adjust input styles
- Customize toast appearance

### Add Multiple Safe Zones

Modify Firestore structure:
```javascript
/users/{userId}/safeZones/
  - home: { lat, lng, radius, name: "Home" }
  - park: { lat, lng, radius, name: "Dog Park" }
  - vet: { lat, lng, radius, name: "Vet Clinic" }
```

---

## 📊 Analytics & Insights

Track safe zone breaches:

```javascript
// Log breach event to Firestore
const logSafeZoneBreach = async (userId, petId, location, safeZone) => {
  await addDoc(collection(db, 'safeZoneBreaches'), {
    userId,
    petId,
    timestamp: new Date(),
    location: { lat: location.lat, lng: location.lng },
    safeZone: { lat: safeZone.lat, lng: safeZone.lng, radius: safeZone.radius },
    distance: calculateDistance(location.lat, location.lng, safeZone.lat, safeZone.lng)
  });
};
```

---

## 🧪 Testing

### Test the Modal:
1. Open Track My Pet page
2. Click "Set Safe Zone"
3. Enter test coordinates (e.g., 33.6844, 73.0479, radius: 50)
4. Submit and verify Firestore document is created

### Test Safe Zone Calculations:
```javascript
import { isPetInSafeZone, getSafeZoneStatus } from '../utils/safeZoneHelper';

const safeZone = { lat: 33.6844, lng: 73.0479, radius: 100 };

// Inside safe zone
const petLocation1 = { lat: 33.6844, lng: 73.0479 };
console.log(isPetInSafeZone(petLocation1, safeZone)); // true

// Outside safe zone
const petLocation2 = { lat: 33.7000, lng: 73.0600 };
console.log(isPetInSafeZone(petLocation2, safeZone)); // false
console.log(getSafeZoneStatus(petLocation2, safeZone));
// { isInside: false, distance: 2156, distanceFromEdge: 2056, percentageOutside: 2056 }
```

---

## 🔧 Troubleshooting

### Safe Zone Not Saving?
- Check Firebase console for Firestore write permissions
- Verify `userId` is correctly passed to `SafeZoneModal`
- Check browser console for errors

### Location Not Auto-populating?
- Ensure pet has GPS data in Realtime Database at `/gps_tracking/{petId}`
- Check `gpsTrackingService.getLocation()` is working

### Safe Zone Circle Not Showing?
- Import `SafeZoneCircle` in your map component
- Verify safe zone data exists in Firestore
- Check Leaflet map is properly initialized

---

## 🚀 Future Enhancements

- [ ] Multiple safe zones per user
- [ ] Time-based safe zones (e.g., weekdays 9-5 at park)
- [ ] Geofence history and analytics
- [ ] Email/SMS alerts for breaches
- [ ] Safe zone sharing between users
- [ ] Auto-adjust radius based on pet activity

---

## 📝 Summary

You now have a fully functional Safe Zone feature with:
- ✅ Modal to set/update safe zones
- ✅ Firestore persistence
- ✅ Helper utilities for calculations
- ✅ Map visualization component
- ✅ Clean, minimalist Tailwind UI

**Next steps:** Implement real-time monitoring and push notifications when pets leave the safe zone!

