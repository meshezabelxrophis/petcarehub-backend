import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for getting user's current GPS location
 * Returns: { latitude, longitude, loading, error, isUsingFallback }
 * Fallback coordinates: 33.6844, 73.0479 (Islamabad) if geolocation fails or is denied
 */
const useUserLocation = () => {
  // Fallback coordinates: Islamabad, Pakistan
  const ISLAMABAD_COORDS = {
    latitude: 33.6844,
    longitude: 73.0479
  };

  const [location, setLocation] = useState({
    latitude: null, // Start with null to indicate no location yet
    longitude: null,
    loading: true, // Start with loading true
    error: null,
    isUsingFallback: false
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported, using fallback location');
      setLocation({
        latitude: ISLAMABAD_COORDS.latitude,
        longitude: ISLAMABAD_COORDS.longitude,
        loading: false,
        error: 'Geolocation is not supported by this browser',
        isUsingFallback: true
      });
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    console.log('📍 Requesting user location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude);
        const lon = parseFloat(position.coords.longitude);
        
        console.log('✅ Got user location:', { lat, lon });
        console.log('   Accuracy:', position.coords.accuracy, 'meters');
        
        // Validate coordinates
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          console.error('❌ Invalid coordinates received:', { lat, lon });
          setLocation({
            latitude: ISLAMABAD_COORDS.latitude,
            longitude: ISLAMABAD_COORDS.longitude,
            loading: false,
            error: 'Invalid coordinates received. Using default location.',
            isUsingFallback: true
          });
          return;
        }
        
        setLocation({
          latitude: lat,
          longitude: lon,
          loading: false,
          error: null,
          isUsingFallback: false
        });
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access in your browser settings.';
            console.warn('   User denied location permission');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your internet connection.';
            console.warn('   Location position unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            console.warn('   Location request timeout');
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
            console.warn('   Unknown geolocation error');
            break;
        }

        // Fallback to Islamabad coordinates
        console.log('📍 Using fallback location (Islamabad)');
        setLocation({
          latitude: ISLAMABAD_COORDS.latitude,
          longitude: ISLAMABAD_COORDS.longitude,
          loading: false,
          error: errorMessage,
          isUsingFallback: true
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased to 15 seconds for better reliability
        maximumAge: 60000 // 1 minute cache - more reasonable for location
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

