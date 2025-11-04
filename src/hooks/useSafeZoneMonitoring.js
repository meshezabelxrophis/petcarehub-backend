import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { getUserSafeZone, haversineDistance } from '../utils/safeZoneHelper';

/**
 * Custom hook for real-time safe zone monitoring
 * 
 * Listens to pet's live location from Firebase Realtime Database
 * and checks if pet is within the safe zone boundaries
 * 
 * @param {string} petId - Pet ID to monitor
 * @param {string} userId - User ID to fetch safe zone
 * @returns {object} { isOutside, distance, safeZone, petLocation, loading }
 */
const useSafeZoneMonitoring = (petId, userId) => {
  const [isOutside, setIsOutside] = useState(false);
  const [distance, setDistance] = useState(null);
  const [safeZone, setSafeZone] = useState(null);
  const [petLocation, setPetLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate if pet is outside safe zone
  const checkGeofence = useCallback((location, zone) => {
    if (!location || !zone) return;

    const locationLon = location.lng || location.lon;
    const zoneLon = zone.lng || zone.lon;

    const dist = haversineDistance(
      location.lat,
      locationLon,
      zone.lat,
      zoneLon
    );

    setDistance(Math.round(dist));

    if (dist > zone.radius) {
      // Pet is OUTSIDE safe zone
      if (!isOutside) {
        console.warn(`⚠️ GEOFENCE BREACH: Pet is ${Math.round(dist - zone.radius)}m outside safe zone`);
      }
      setIsOutside(true);
    } else {
      // Pet is INSIDE safe zone
      if (isOutside) {
        console.log(`✅ GEOFENCE RESTORED: Pet returned to safe zone`);
      }
      setIsOutside(false);
    }
  }, [isOutside]);

  useEffect(() => {
    if (!petId || !userId) {
      setLoading(false);
      return;
    }

    let locationUnsubscribe;
    let mounted = true;

    const setupMonitoring = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch safe zone from Firestore (optional - don't block location tracking)
        console.log(`🔍 Fetching safe zone for user: ${userId}`);
        const zone = await getUserSafeZone(userId);
        
        if (zone) {
          if (mounted) {
            setSafeZone(zone);
            console.log('✅ Safe zone loaded:', zone);
          }
        } else {
          console.log('ℹ️ No safe zone configured for this user (location tracking will still work)');
        }

        // 2. Listen to pet's live location from Realtime Database (ALWAYS listen, even without safe zone)
        const locationRef = ref(realtimeDb, `pets/${petId}/location`);
        const firebasePath = `pets/${petId}/location`;
        
        console.log('\n🚀 ==========================================');
        console.log('📡 Starting real-time monitoring for pet');
        console.log('==========================================');
        console.log('   Pet ID:', petId);
        console.log('   Pet ID type:', typeof petId);
        console.log('   Firebase path:', firebasePath);
        console.log('   User ID:', userId);
        console.log('==========================================\n');
        
        locationUnsubscribe = onValue(
          locationRef,
          (snapshot) => {
            if (!mounted) {
              console.log('⚠️ Component unmounted, ignoring update');
              return;
            }

            const location = snapshot.val();
            
            console.log('\n📍 ==========================================');
            console.log('📍 Firebase Location Update Received!');
            console.log('==========================================');
            console.log('   Pet ID:', petId);
            console.log('   Firebase path:', firebasePath);
            console.log('   Raw data:', location);
            console.log('   Data type:', typeof location);
            
            if (location && location.lat && location.lng) {
              console.log('   ✅ Valid location data found');
              console.log('   Lat:', location.lat);
              console.log('   Lng:', location.lng);
              console.log('   Last updated:', location.lastUpdated);
              console.log('==========================================\n');
              
              console.log(`📍 Pet location update:`, location);
              setPetLocation(location);
              
              // 3. Check geofence only if safe zone exists
              if (zone) {
                console.log('🛡️ Safe zone exists, checking geofence...');
                checkGeofence(location, zone);
              } else {
                console.log('ℹ️ No safe zone, skipping geofence check');
                // No safe zone, but still track distance as 0 (inside zone)
                setDistance(0);
                setIsOutside(false);
              }
            } else {
              console.log('   ⚠️ Invalid or missing location data');
              console.log('   Location object:', location);
              if (location) {
                console.log('   Has lat?', !!location.lat);
                console.log('   Has lng?', !!location.lng);
                console.log('   Keys:', Object.keys(location || {}));
              }
              console.log('==========================================\n');
              console.log('⚠️ No valid location data found');
            }

            setLoading(false);
          },
          (error) => {
            console.error('\n❌ ==========================================');
            console.error('❌ Error listening to pet location');
            console.error('==========================================');
            console.error('   Pet ID:', petId);
            console.error('   Firebase path:', firebasePath);
            console.error('   Error message:', error.message);
            console.error('   Error code:', error.code);
            console.error('==========================================\n');
            setError(error.message);
            setLoading(false);
          }
        );
        
        console.log('✅ Firebase listener attached successfully');

      } catch (err) {
        console.error('❌ Error setting up safe zone monitoring:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    setupMonitoring();

    // Cleanup function
    return () => {
      mounted = false;
      if (locationUnsubscribe) {
        const locationRef = ref(realtimeDb, `pets/${petId}/location`);
        off(locationRef);
        console.log(`🔇 Stopped monitoring pet: ${petId}`);
      }
    };
  }, [petId, userId, checkGeofence]);

  // Re-check geofence when safe zone is loaded (in case it was loaded after location)
  useEffect(() => {
    if (safeZone && petLocation) {
      console.log('🔄 Re-checking geofence with newly loaded safe zone');
      checkGeofence(petLocation, safeZone);
    }
  }, [safeZone, petLocation, checkGeofence]);

  return {
    isOutside,
    distance,
    safeZone,
    petLocation,
    loading,
    error,
    // Helper values
    distanceFromEdge: safeZone && distance ? Math.round(Math.abs(distance - safeZone.radius)) : null,
    isMonitoring: !!safeZone && !!petLocation,
  };
};

export default useSafeZoneMonitoring;

