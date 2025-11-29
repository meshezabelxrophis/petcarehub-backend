import React from 'react';
import { Circle, InfoWindow } from '@react-google-maps/api';

/**
 * SafeZoneCircle - Displays a safe zone boundary on Google Maps with animations
 * 
 * Usage:
 * <SafeZoneCircle 
 *   safeZone={{ lat: 33.6844, lng: 73.0479, radius: 100 }} 
 *   isBreached={false}
 * />
 */
const SafeZoneCircle = ({ 
  safeZone, 
  isBreached = false 
}) => {
  const [showInfo, setShowInfo] = React.useState(false);

  if (!safeZone || !safeZone.lat || !safeZone.lng || !safeZone.radius) {
    return null;
  }

  const circleOptions = isBreached ? {
    strokeColor: '#ef4444',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: '#ef4444',
    fillOpacity: 0.2,
    clickable: true,
  } : {
    strokeColor: '#10b981',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#10b981',
    fillOpacity: 0.1,
    clickable: true,
  };

  return (
    <>
      {/* Main Safe Zone Circle */}
      <Circle
        center={{ lat: safeZone.lat, lng: safeZone.lng }}
        radius={safeZone.radius}
        options={circleOptions}
        onClick={() => setShowInfo(true)}
      />
      
      {showInfo && (
        <InfoWindow
          position={{ lat: safeZone.lat, lng: safeZone.lng }}
          onCloseClick={() => setShowInfo(false)}
        >
          <div className="text-sm">
            <strong className="flex items-center">
              {isBreached ? '🚨' : '🛡️'} Safe Zone {isBreached && '(BREACHED)'}
            </strong>
            <br />
            <small>Radius: {safeZone.radius}m</small>
            <br />
            <small>Center: {safeZone.lat.toFixed(4)}, {safeZone.lng.toFixed(4)}</small>
            {safeZone.updatedAt && (
              <>
                <br />
                <small className="text-gray-500">
                  Updated: {new Date(safeZone.updatedAt).toLocaleDateString()}
                </small>
              </>
            )}
            {isBreached && (
              <>
                <br />
                <strong className="text-red-600 text-xs">
                  ⚠️ Pet is outside this zone!
                </strong>
              </>
            )}
          </div>
        </InfoWindow>
      )}

      {/* Ripple Effect Circles (only when breached) */}
      {isBreached && (
        <>
          <Circle
            center={{ lat: safeZone.lat, lng: safeZone.lng }}
            radius={safeZone.radius * 1.1}
            options={{
              strokeColor: '#ef4444',
              strokeOpacity: 0.5,
              strokeWeight: 1,
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              clickable: false,
            }}
          />
          <Circle
            center={{ lat: safeZone.lat, lng: safeZone.lng }}
            radius={safeZone.radius * 1.2}
            options={{
              strokeColor: '#ef4444',
              strokeOpacity: 0.3,
              strokeWeight: 1,
              fillColor: '#ef4444',
              fillOpacity: 0.05,
              clickable: false,
            }}
          />
        </>
      )}
    </>
  );
};

export default SafeZoneCircle;
