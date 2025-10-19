import { useState, useEffect, useCallback } from 'react';
import { gpsTrackingService } from '../services/realtimeDatabase';

/**
 * Custom hook for real-time GPS tracking
 * @param {string} petId - Pet ID to track
 * @returns {object} { location, isLoading, error, updateLocation }
 */
export const useGPSTracking = (petId) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update location (for pet owners/collar devices)
  const updateLocation = useCallback(async (lat, lng, additionalData = {}) => {
    try {
      await gpsTrackingService.updateLocation(petId, lat, lng, additionalData);
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.message);
    }
  }, [petId]);

  // Listen to location updates
  useEffect(() => {
    if (!petId) {
      setIsLoading(false);
      return;
    }

    console.log(`🔌 Setting up GPS tracking for pet: ${petId}`);
    setIsLoading(true);
    setError(null);

    const unsubscribe = gpsTrackingService.listenToLocation(
      petId,
      (data) => {
        setLocation(data);
        setIsLoading(false);
        if (data) {
          console.log(`📍 Location updated:`, data);
        }
      }
    );

    // Cleanup on unmount or petId change
    return () => {
      console.log(`🔇 Cleaning up GPS tracking for pet: ${petId}`);
      unsubscribe();
    };
  }, [petId]);

  return {
    location,
    isLoading,
    error,
    updateLocation
  };
};

/**
 * Hook for tracking multiple pets
 * @param {array} petIds - Array of pet IDs
 * @returns {object} { locations, isLoading, error }
 */
export const useMultiPetTracking = (petIds) => {
  const [locations, setLocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!petIds || petIds.length === 0) {
      setIsLoading(false);
      return;
    }

    console.log(`🔌 Setting up tracking for ${petIds.length} pets`);
    setIsLoading(true);
    setError(null);

    const unsubscribers = petIds.map((petId) =>
      gpsTrackingService.listenToLocation(petId, (data) => {
        setLocations((prev) => ({
          ...prev,
          [petId]: data
        }));
      })
    );

    setIsLoading(false);

    // Cleanup
    return () => {
      console.log(`🔇 Cleaning up tracking for ${petIds.length} pets`);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [petIds?.join(',')]); // Re-run when petIds array changes

  return {
    locations,
    isLoading,
    error
  };
};







