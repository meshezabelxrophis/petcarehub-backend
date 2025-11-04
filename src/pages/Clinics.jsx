import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Loader2, AlertCircle } from 'lucide-react';
import useUserLocation from '../hooks/useUserLocation';
import L from 'leaflet';
import { API_ENDPOINTS } from '../config/backend';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

function Clinics() {
  const { latitude, longitude, loading: locationLoading, error: locationError, isUsingFallback, getCurrentLocation } = useUserLocation();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reverse geocoding function
  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract relevant parts of the address
        const parts = data.display_name.split(',').slice(0, 3); // Take first 3 parts
        return parts.join(', ').trim();
      }
      return null;
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
            
            return {
              clinic_id: provider.id,
              name: provider.name,
              address: displayAddress,
              contact_number: provider.phone,
              latitude: providerLat,
              longitude: providerLon,
              bio: provider.bio,
              services: [] // Would need separate API call to get provider services if needed
            };
          })
      );
      
      setClinics(clinicsWithLocations);
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
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2 text-teal-600" />
                    <span className="text-sm">{clinic.contact_number || clinic.phone || 'Phone not provided'}</span>
                  </div>
                  
                  {clinic.bio && (
                    <p className="text-sm text-gray-600 mb-4">{clinic.bio}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <a
                      href={`/providers/${clinic.clinic_id}`}
                      className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                    >
                      View Details
                    </a>
                    <a
                      href={`/providers/${clinic.clinic_id}`}
                      className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition"
                    >
                      View Services
                    </a>
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
            {latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude) ? (
              <MapContainer
                key={`${latitude}-${longitude}`} // Force re-render when location changes
                center={[latitude, longitude]}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* User location marker */}
                <Marker position={[latitude, longitude]}>
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      <span className="text-xs text-gray-600">
                        {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
                      </span>
                      {isUsingFallback && (
                        <>
                          <br />
                          <span className="text-xs text-yellow-600">(Default location)</span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
                
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
                      position={[lat, lon]}
                    >
                    <Popup>
                      <div className="text-center p-2">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {clinic.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{clinic.address}</p>
                        <div className="flex gap-2">
                          <a
                            href={`/providers/${clinic.clinic_id}`}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition"
                          >
                            Details
                          </a>
                          <a
                            href={`/providers/${clinic.clinic_id}`}
                            className="inline-block bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-teal-700 transition"
                          >
                            Services
                          </a>
                        </div>
                      </div>
                    </Popup>
                    </Marker>
                    );
                  })}
              </MapContainer>
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
