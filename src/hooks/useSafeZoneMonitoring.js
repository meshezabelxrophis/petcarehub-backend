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

        // 1. Fetch safe zone from Firestore
        console.log(`🔍 Fetching safe zone for user: ${userId}`);
        const zone = await getUserSafeZone(userId);
        
        if (!zone) {
          console.log('ℹ️ No safe zone configured for this user');
          setLoading(false);
          return;
        }

        if (mounted) {
          setSafeZone(zone);
          console.log('✅ Safe zone loaded:', zone);
        }

        // 2. Listen to pet's live location from Realtime Database
        const locationRef = ref(realtimeDb, `pets/${petId}/location`);
        
        console.log(`📡 Starting real-time monitoring for pet: ${petId}`);
        
        locationUnsubscribe = onValue(
          locationRef,
          (snapshot) => {
            if (!mounted) return;

            const location = snapshot.val();
            
            if (location && location.lat && location.lng) {
              console.log(`📍 Pet location update:`, location);
              setPetLocation(location);
              
              // 3. Check geofence immediately on each update
              checkGeofence(location, zone);
            } else {
              console.log('⚠️ No valid location data found');
            }

            setLoading(false);
          },
          (error) => {
            console.error('❌ Error listening to pet location:', error);
            setError(error.message);
            setLoading(false);
          }
        );

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

