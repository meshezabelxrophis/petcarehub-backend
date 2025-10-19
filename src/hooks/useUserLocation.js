import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for getting user's current GPS location
 * Returns: { latitude, longitude, loading, error }
 * Fallback coordinates: 33.6844, 73.0479 (Islamabad) if geolocation fails or is denied
 */
const useUserLocation = () => {
  // Fallback coordinates: Islamabad, Pakistan
  const ISLAMABAD_COORDS = {
    latitude: 33.6844,
    longitude: 73.0479
  };

  const [location, setLocation] = useState({
    latitude: ISLAMABAD_COORDS.latitude,
    longitude: ISLAMABAD_COORDS.longitude,
    loading: false,
    error: null
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using default location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            break;
          default:
            errorMessage = 'An unknown error occurred. Using default location.';
            break;
        }

        // Fallback to Islamabad coordinates
        setLocation({
          latitude: ISLAMABAD_COORDS.latitude,
          longitude: ISLAMABAD_COORDS.longitude,
          loading: false,
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes - cache location for 5 minutes
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically get location on hook initialization
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    ...location,
    getCurrentLocation // Expose function to manually refresh location
  };
};

export default useUserLocation;

