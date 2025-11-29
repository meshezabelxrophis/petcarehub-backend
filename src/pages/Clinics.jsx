import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Phone, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useUserLocation from '../hooks/useUserLocation';
import { API_ENDPOINTS } from '../config/backend';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_MAP_OPTIONS,
  GOOGLE_MAPS_LIBRARIES 
} from '../config/googleMaps';

function Clinics() {
  const { latitude, longitude, loading: locationLoading, error: locationError, isUsingFallback, getCurrentLocation } = useUserLocation();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const mapRef = useRef();

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Reverse geocoding function using Google Maps Geocoding API
  const getLocationName = async (lat, lon) => {
    try {
      if (!window.google || !window.google.maps) return null;
      
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
      
      return new Promise((resolve) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            // Get a formatted address
            const addressComponents = results[0].formatted_address.split(',');
            const shortAddress = addressComponents.slice(0, 3).join(', ');
            resolve(shortAddress);
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  // Fetch clinics when location is available
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      console.log('🔍 Fetching clinics for location:', { latitude, longitude, isUsingFallback });
      fetchClinics(latitude, longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const fetchClinics = async (lat, lon) => {
    try {
      setLoading(true);
      setError('');
      
      // Ensure coordinates are valid numbers
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        throw new Error('Invalid coordinates');
      }
      
      console.log('🌐 Fetching providers from:', `${API_ENDPOINTS.PROVIDERS}?lat=${parsedLat}&lon=${parsedLon}&radius=10`);
      
      // Fetch only service providers (they are our "clinics")
      const response = await fetch(`${API_ENDPOINTS.PROVIDERS}?lat=${parsedLat}&lon=${parsedLon}&radius=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const providersData = await response.json();
      
      console.log('✅ Received', providersData.length, 'providers');
      
      // Format all service providers as clinics and add location names
      const clinicsWithLocations = await Promise.all(
        providersData
          .filter(provider => provider.id) // Only filter out invalid entries
          .map(async (provider) => {
            let displayAddress = provider.address;
            
            // Parse and validate provider coordinates
            const providerLat = parseFloat(provider.latitude);
            const providerLon = parseFloat(provider.longitude);
            
            // If provider has coordinates but no proper address, get location name
            if (!isNaN(providerLat) && !isNaN(providerLon) && 
                (!provider.address || provider.address === 'Address not provided' || provider.address.length < 10)) {
              const locationName = await getLocationName(providerLat, providerLon);
              if (locationName) {
                displayAddress = locationName;
              }
            }
            
            // Calculate distance using Haversine formula
            let distance = null;
            if (!isNaN(providerLat) && !isNaN(providerLon) && !isNaN(parsedLat) && !isNaN(parsedLon)) {
              const R = 6371; // Radius of Earth in kilometers
              const dLat = (providerLat - parsedLat) * (Math.PI / 180);
              const dLon = (providerLon - parsedLon) * (Math.PI / 180);
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(parsedLat * (Math.PI / 180)) * Math.cos(providerLat * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              distance = R * c; // Distance in km
            }
            
            return {
              clinic_id: provider.id,
              name: provider.name,
              address: displayAddress,
              contact_number: provider.phone,
              latitude: providerLat,
              longitude: providerLon,
              bio: provider.bio,
              distance: distance,
              services: [] // Would need separate API call to get provider services if needed
            };
          })
      );
      
      // Sort by distance (closest first)
      const sortedClinics = clinicsWithLocations.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      setClinics(sortedClinics);
    } catch (err) {
      console.error('❌ Error fetching providers:', err);
      setError('Failed to load nearby providers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  // Manual location request handler - uses the hook's function
  const handleGetLocation = () => {
    setError(''); // Clear any previous errors
    getCurrentLocation(); // Use the hook's function to get fresh location
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Nearby Service Providers</h1>
        
        {/* Get My Location Button */}
        <button
          onClick={handleGetLocation}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>
      
      {/* Show current location info */}
      {latitude && longitude && (
        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
          isUsingFallback 
            ? 'bg-yellow-50 border border-yellow-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isUsingFallback ? 'text-yellow-600' : 'text-green-600'
          }`} />
          <div className="flex-1">
            <p className={`font-medium ${isUsingFallback ? 'text-yellow-800' : 'text-green-800'}`}>
              {isUsingFallback ? 'Using Default Location' : 'Location Detected'}
            </p>
            <p className={`text-sm mt-1 ${isUsingFallback ? 'text-yellow-700' : 'text-green-700'}`}>
              {isUsingFallback 
                ? 'Showing providers near Islamabad, Pakistan (default location).' 
                : `Showing providers near your current location (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`
              }
            </p>
            {isUsingFallback && (
              <p className="text-yellow-600 text-sm mt-2">
                💡 <strong>To see providers near you:</strong> Click the "Use My Location" button above and allow location access when prompted.
              </p>
            )}
            {locationError && (
              <p className="text-sm mt-2 text-gray-600">
                <strong>Note:</strong> {locationError}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Show fetch error if there's one */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-2">Location Error</p>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleGetLocation}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setError('');
                    // Use default location
                    fetchClinics(33.6844, 73.0479);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                >
                  Use Default Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Clinics List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {loading ? 'Loading...' : `${clinics.length} Providers Found`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No providers found nearby</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <div key={clinic.clinic_id} className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {clinic.name}
                  </h3>
                  
                  <div className="flex items-start text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2 mt-1 text-teal-600" />
                    <span className="text-sm">{clinic.address || 'Address not provided'}</span>
                  </div>
                  
                  {clinic.distance !== null && (
                    <div className="flex items-center text-teal-600 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-sm font-semibold">
                        {clinic.distance < 1 
                          ? `${(clinic.distance * 1000).toFixed(0)}m away` 
                          : `${clinic.distance.toFixed(1)}km away`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2 text-teal-600" />
                    <span className="text-sm">{clinic.contact_number || clinic.phone || 'Phone not provided'}</span>
                  </div>
                  
                  {clinic.bio && (
                    <p className="text-sm text-gray-600 mb-4">{clinic.bio}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/providers/${clinic.clinic_id}`}
                      className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/providers/${clinic.clinic_id}`}
                      className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition"
                    >
                      View Services
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Map View</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loadError ? (
              <div className="h-96 flex items-center justify-center bg-red-50">
                <p className="text-red-600">Error loading map</p>
              </div>
            ) : !isLoaded ? (
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude) ? (
              <GoogleMap
                mapContainerStyle={{ height: '500px', width: '100%' }}
                center={{ lat: latitude, lng: longitude }}
                zoom={13}
                options={DEFAULT_MAP_OPTIONS}
                onLoad={(map) => { mapRef.current = map; }}
              >
                {/* User location marker */}
                <Marker 
                  position={{ lat: latitude, lng: longitude }}
                  icon={{
                    path: window.google?.maps?.SymbolPath?.CIRCLE,
                    fillColor: '#3b82f6',
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: '#ffffff',
                    scale: 8,
                  }}
                />
                
                {/* Provider markers */}
                {clinics
                  .filter(clinic => {
                    const lat = parseFloat(clinic.latitude);
                    const lon = parseFloat(clinic.longitude);
                    const isValid = !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
                    if (!isValid) {
                      console.warn('⚠️ Invalid clinic coordinates:', clinic.name, { lat, lon });
                    }
                    return isValid;
                  })
                  .map((clinic) => {
                    const lat = parseFloat(clinic.latitude);
                    const lon = parseFloat(clinic.longitude);
                    console.log('📍 Rendering marker for:', clinic.name, 'at', { lat, lon });
                    return (
                      <Marker
                        key={clinic.clinic_id}
                        position={{ lat, lng: lon }}
                        onClick={() => setSelectedClinic(clinic)}
                        icon={{
                          path: window.google?.maps?.SymbolPath?.CIRCLE,
                          fillColor: '#dc2626',
                          fillOpacity: 1,
                          strokeWeight: 3,
                          strokeColor: '#ffffff',
                          scale: 10,
                        }}
                      >
                        {selectedClinic?.clinic_id === clinic.clinic_id && (
                          <InfoWindow onCloseClick={() => setSelectedClinic(null)}>
                            <div className="text-center p-2">
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {clinic.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">{clinic.address}</p>
                              {clinic.distance !== null && (
                                <p className="text-xs text-teal-600 font-semibold mb-2">
                                  📍 {clinic.distance < 1 
                                    ? `${(clinic.distance * 1000).toFixed(0)}m away` 
                                    : `${clinic.distance.toFixed(1)}km away`}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Link
                                  to={`/providers/${clinic.clinic_id}`}
                                  className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition"
                                >
                                  Details
                                </Link>
                                <Link
                                  to={`/providers/${clinic.clinic_id}`}
                                  className="inline-block bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-teal-700 transition"
                                >
                                  Services
                                </Link>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    );
                  })}
              </GoogleMap>
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clinics;
