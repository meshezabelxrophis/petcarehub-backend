import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { FaHospital } from 'react-icons/fa';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_MAP_OPTIONS,
  GOOGLE_MAPS_LIBRARIES 
} from '../config/googleMaps';

const ClinicMap = ({ clinics, userLocation, onClinicSelect }) => {
  // Default location: Islamabad, Pakistan (matches useUserLocation fallback)
  const defaultPosition = { lat: 33.6844, lng: 73.0479 };
  const defaultZoom = 12;
  
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [selectedClinic, setSelectedClinic] = useState(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      const [lat, lon] = userLocation;
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      
      // Validate coordinates
      if (!isNaN(parsedLat) && !isNaN(parsedLon) && 
          parsedLat >= -90 && parsedLat <= 90 && 
          parsedLon >= -180 && parsedLon <= 180) {
        console.log('🗺️ Updating map center to:', { lat: parsedLat, lon: parsedLon });
        const newCenter = { lat: parsedLat, lng: parsedLon };
        setMapCenter(newCenter);
        
        if (mapRef.current) {
          mapRef.current.panTo(newCenter);
        }
      } else {
        console.warn('⚠️ Invalid user location coordinates:', { lat: parsedLat, lon: parsedLon });
      }
    }
  }, [userLocation]);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(1);
  };

  const handleClinicClick = (clinic) => {
    setSelectedClinic(clinic);
    if (onClinicSelect) {
      onClinicSelect(clinic);
    }
    // Center map on selected clinic
    const lat = parseFloat(clinic.latitude);
    const lon = parseFloat(clinic.longitude);
    if (mapRef.current && !isNaN(lat) && !isNaN(lon)) {
      mapRef.current.panTo({ lat, lng: lon });
      mapRef.current.setZoom(15);
    }
  };

  // Create clinic marker icon
  const createClinicIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: '#dc2626',
    fillOpacity: 1,
    strokeWeight: 3,
    strokeColor: '#ffffff',
    scale: 12,
  });

  // Create user location marker icon
  const createUserIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: '#3b82f6',
    fillOpacity: 1,
    strokeWeight: 3,
    strokeColor: '#ffffff',
    scale: 8,
  });

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center" style={{ height: '500px' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>;
  }

  return (
    <div>
      <style>
        {`
          .clinic-popup {
            min-width: 250px;
          }
          .clinic-popup .clinic-name {
            font-weight: bold;
            font-size: 16px;
            color: #374151;
            margin-bottom: 8px;
          }
          .clinic-popup .clinic-address {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .clinic-popup .clinic-contact {
            color: #059669;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .clinic-popup .clinic-distance {
            color: #7c3aed;
            font-size: 12px;
            font-weight: 500;
          }
          .clinic-popup button {
            background: #059669;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            margin-top: 8px;
          }
          .clinic-popup button:hover {
            background: #047857;
          }
        `}
      </style>
      
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={mapCenter}
        zoom={defaultZoom}
        options={DEFAULT_MAP_OPTIONS}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {/* User location marker */}
        {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
          <Marker 
            position={{ lat: parseFloat(userLocation[0]), lng: parseFloat(userLocation[1]) }}
            icon={createUserIcon()}
            title="Your Location"
          />
        )}
        
        {/* Clinic markers */}
        {clinics
          .filter(clinic => {
            const lat = parseFloat(clinic.latitude);
            const lon = parseFloat(clinic.longitude);
            const isValid = !isNaN(lat) && !isNaN(lon) && 
                           lat >= -90 && lat <= 90 && 
                           lon >= -180 && lon <= 180;
            if (!isValid) {
              console.warn('⚠️ Skipping clinic with invalid coordinates:', clinic.name, { lat, lon });
            }
            return isValid;
          })
          .map(clinic => {
            const lat = parseFloat(clinic.latitude);
            const lon = parseFloat(clinic.longitude);
            
            return (
              <Marker 
                key={clinic.clinic_id} 
                position={{ lat, lng: lon }}
                icon={createClinicIcon()}
                onClick={() => handleClinicClick(clinic)}
                title={clinic.name}
              >
                {selectedClinic?.clinic_id === clinic.clinic_id && (
                  <InfoWindow onCloseClick={() => setSelectedClinic(null)}>
                    <div className="clinic-popup">
                      <div className="clinic-name">{clinic.name}</div>
                      <div className="clinic-address">📍 {clinic.address}</div>
                      <div className="clinic-contact">📞 {clinic.contact_number}</div>
                      {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
                        <div className="clinic-distance">
                          📏 {calculateDistance(
                            parseFloat(userLocation[0]), 
                            parseFloat(userLocation[1]), 
                            lat, 
                            lon
                          )} km away
                        </div>
                      )}
                      {clinic.services && clinic.services.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                          Services: {clinic.services.length} available
                        </div>
                      )}
                      <button onClick={() => handleClinicClick(clinic)}>
                        View Details
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
      </GoogleMap>
    </div>
  );
};

export default ClinicMap;
