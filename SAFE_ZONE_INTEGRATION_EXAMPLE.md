# 🗺️ Safe Zone Map Integration Example

## Quick Integration: Add Safe Zone Circle to PetMap

Here's how to display the safe zone boundary on your existing PetMap component:

### Step 1: Update `src/components/PetMap.jsx`

Add these imports at the top:
```javascript
import SafeZoneCircle from './SafeZoneCircle';
import { getUserSafeZone } from '../utils/safeZoneHelper';
import { useAuth } from '../context/AuthContext';
```

### Step 2: Add State and Effect

Inside your `PetMap` component, add:
```javascript
const { userId } = useAuth();
const [safeZone, setSafeZone] = useState(null);

// Load safe zone on component mount
useEffect(() => {
  if (userId) {
    getUserSafeZone(userId).then(zone => {
      if (zone) {
        setSafeZone(zone);
        console.log('✅ Loaded safe zone:', zone);
      }
    });
  }
}, [userId]);
```

### Step 3: Add to MapContainer

Inside your `<MapContainer>` component (after your `<Marker>`):
```javascript
<MapContainer center={position} zoom={defaultZoom} ...>
  <TileLayer ... />
  
  {/* Your existing pet marker */}
  <Marker position={position} icon={createAnimatedPawIcon()}>
    <Popup>...</Popup>
  </Marker>
  
  {/* NEW: Safe Zone Circle */}
  {safeZone && <SafeZoneCircle safeZone={safeZone} />}
</MapContainer>
```

### Complete Example

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import SafeZoneCircle from './SafeZoneCircle';
import { getUserSafeZone } from '../utils/safeZoneHelper';
import { useAuth } from '../context/AuthContext';
// ... other imports

const PetMap = ({ petId, petName }) => {
  const { userId } = useAuth();
  const [position, setPosition] = useState([33.6844, 73.0479]);
  const [safeZone, setSafeZone] = useState(null);
  
  // Load safe zone
  useEffect(() => {
    if (userId) {
      getUserSafeZone(userId).then(zone => {
        if (zone) {
          setSafeZone(zone);
        }
      });
    }
  }, [userId]);
  
  // Your existing GPS tracking code...
  
  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={position} zoom={13} style={{ height: '400px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Pet Location Marker */}
        <Marker position={position} icon={pawIcon}>
          <Popup>
            🐾 {petName}'s Location<br />
            Lat: {position[0].toFixed(4)}<br />
            Lng: {position[1].toFixed(4)}
          </Popup>
        </Marker>
        
        {/* Safe Zone Circle */}
        {safeZone && <SafeZoneCircle safeZone={safeZone} />}
      </MapContainer>
    </div>
  );
};
```

---

## Visual Preview

When a safe zone is set, users will see:
- 🐾 **Pet marker** (paw icon) at current location
- 🛡️ **Green dashed circle** showing safe zone boundary
- 📍 **Center point** of safe zone
- **Popup** with safe zone details when clicked

---

## Customization Options

### Change Safe Zone Appearance

```javascript
{/* Green with low opacity (default) */}
<SafeZoneCircle safeZone={safeZone} />

{/* Red with higher opacity (warning style) */}
<SafeZoneCircle 
  safeZone={safeZone} 
  color="#ef4444" 
  fillOpacity={0.3} 
/>

{/* Blue with custom style */}
<SafeZoneCircle 
  safeZone={safeZone} 
  color="#3b82f6" 
  fillOpacity={0.25} 
/>
```

### Add Warning Indicator

Show visual warning when pet is outside safe zone:

```javascript
import { getSafeZoneStatus } from '../utils/safeZoneHelper';

const [petStatus, setPetStatus] = useState({ isInside: true });

useEffect(() => {
  if (safeZone && position) {
    const status = getSafeZoneStatus(
      { lat: position[0], lng: position[1] },
      safeZone
    );
    setPetStatus(status);
  }
}, [position, safeZone]);

// In your JSX:
{!petStatus.isInside && (
  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
    ⚠️ Pet is outside safe zone ({petStatus.distanceFromEdge}m)
  </div>
)}

{/* Change safe zone color based on status */}
<SafeZoneCircle 
  safeZone={safeZone} 
  color={petStatus.isInside ? '#10b981' : '#ef4444'} 
/>
```

---

## Advanced: Real-time Monitoring

Monitor safe zone in real-time:

```javascript
useEffect(() => {
  if (!petId || !userId) return;
  
  let unsubscribe;
  
  const startMonitoring = async () => {
    const zone = await getUserSafeZone(userId);
    if (!zone) return;
    
    setSafeZone(zone);
    
    // Listen to GPS updates
    unsubscribe = gpsTrackingService.listenToLocation(petId, (location) => {
      if (!location) return;
      
      const newPosition = [location.lat, location.lng];
      setPosition(newPosition);
      
      // Check safe zone status
      const status = getSafeZoneStatus(
        { lat: location.lat, lng: location.lng },
        zone
      );
      
      if (!status.isInside) {
        console.warn(`⚠️ Pet outside safe zone by ${status.distanceFromEdge}m`);
        // Trigger alert here
      }
    });
  };
  
  startMonitoring();
  return () => unsubscribe?.();
}, [petId, userId]);
```

---

## Testing the Integration

1. **Set a safe zone:**
   - Go to "Track My Pet"
   - Click "Set Safe Zone"
   - Set radius to 100 meters
   - Submit

2. **View on map:**
   - Green dashed circle should appear
   - Click the circle to see popup with details

3. **Simulate pet movement:**
   - Use debug tools to update pet GPS
   - Watch the map update in real-time
   - Safe zone circle stays fixed while pet marker moves

4. **Test breach detection:**
   - Move pet marker outside the circle
   - Check console for warnings
   - Visual indicators should appear

---

## Firestore Security Rules

Don't forget to add security rules for safe zones:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read/write their own safe zone
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Summary

✅ **Safe Zone Modal** - Set/update safe zones  
✅ **Map Visualization** - See boundary on Leaflet map  
✅ **Real-time Monitoring** - Track when pet leaves zone  
✅ **Helper Utilities** - Calculate distances and status  
✅ **Beautiful UI** - Tailwind-styled components  

Your safe zone feature is now **fully integrated** and ready to use! 🎉

