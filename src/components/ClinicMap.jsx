import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FaHospital } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';

const ClinicMap = ({ clinics, userLocation, onClinicSelect }) => {
  // Default location: Karachi, Pakistan
  const defaultPosition = [24.8607, 67.0011];
  const defaultZoom = 12;
  
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState(userLocation || defaultPosition);

  // Create custom clinic marker icon
  const createClinicIcon = () => {
    const clinicIconMarkup = renderToStaticMarkup(
      <FaHospital 
        size={28} 
        color="#dc2626" 
        style={{ 
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
          backgroundColor: 'white',
          borderRadius: '50%',
          padding: '6px'
        }} 
      />
    );
    
    return L.divIcon({
      html: clinicIconMarkup,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'custom-clinic-marker'
    });
  };

  // Create user location marker icon
  const createUserIcon = () => {
    const userIconMarkup = renderToStaticMarkup(
      <div style={{
        width: '16px',
        height: '16px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        border: '3px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }} />
    );
    
    return L.divIcon({
      html: userIconMarkup,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11],
      className: 'custom-user-marker'
    });
  };

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      setMapCenter(userLocation);
      mapRef.current.setView(userLocation, defaultZoom);
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
    if (onClinicSelect) {
      onClinicSelect(clinic);
    }
    // Center map on selected clinic
    if (mapRef.current) {
      mapRef.current.setView([clinic.latitude, clinic.longitude], 15);
    }
  };

  return (
    <div>
      <style>
        {`
          .custom-clinic-marker {
            background: transparent !important;
            border: none !important;
          }
          .custom-clinic-marker svg {
            background: white;
            border-radius: 50%;
            border: 2px solid #dc2626;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .custom-user-marker {
            background: transparent !important;
            border: none !important;
          }
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
      <MapContainer 
        center={mapCenter} 
        zoom={defaultZoom} 
        style={{ width: '100%', height: '500px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div>
                <strong>Your Location</strong><br/>
                Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Clinic markers */}
        {clinics.map(clinic => (
          <Marker 
            key={clinic.clinic_id} 
            position={[clinic.latitude, clinic.longitude]} 
            icon={createClinicIcon()}
          >
            <Popup className="clinic-popup">
              <div>
                <div className="clinic-name">{clinic.name}</div>
                <div className="clinic-address">📍 {clinic.address}</div>
                <div className="clinic-contact">📞 {clinic.contact_number}</div>
                {userLocation && (
                  <div className="clinic-distance">
                    📏 {calculateDistance(
                      userLocation[0], 
                      userLocation[1], 
                      clinic.latitude, 
                      clinic.longitude
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
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ClinicMap;
