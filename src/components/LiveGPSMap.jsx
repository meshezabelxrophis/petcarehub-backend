import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useGPSTracking } from '../hooks/useGPSTracking';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to auto-center map on location
const MapController = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location && location.lat && location.lng) {
      map.flyTo([location.lat, location.lng], 15, {
        duration: 1
      });
    }
  }, [location, map]);

  return null;
};

/**
 * Live GPS tracking map component
 * @param {string} petId - Pet ID to track
 * @param {string} petName - Pet name (optional)
 * @param {number} height - Map height in pixels (default: 400)
 */
const LiveGPSMap = ({ petId, petName = 'Pet', height = 400 }) => {
  const { location, isLoading, error } = useGPSTracking(petId);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (location && location.lastUpdated) {
      setLastUpdate(new Date(location.lastUpdated));
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading GPS data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ height }}>
        <p className="text-red-700">Error loading GPS data: {error}</p>
      </div>
    );
  }

  if (!location || !location.lat || !location.lng) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" style={{ height }}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-2 text-yellow-700 font-medium">No GPS data available for {petName}</p>
          <p className="text-sm text-yellow-600">Make sure the GPS tracker is turned on and has signal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Status bar */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live Tracking</span>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            Updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
        {location.battery && (
          <div className="flex items-center mt-2">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm12 0H5v8h10V6z"/>
            </svg>
            <span className="text-xs text-gray-600">{location.battery}%</span>
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[location.lat, location.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{petName}</h3>
              <p className="text-sm text-gray-600">
                📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              {location.accuracy && (
                <p className="text-xs text-gray-500">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}
              {lastUpdate && (
                <p className="text-xs text-gray-500 mt-1">
                  {lastUpdate.toLocaleString()}
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        <MapController location={location} />
      </MapContainer>
    </div>
  );
};

export default LiveGPSMap;







