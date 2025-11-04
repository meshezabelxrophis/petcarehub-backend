import React, { useEffect, useRef } from 'react';
import { Circle, Popup } from 'react-leaflet';

/**
 * SafeZoneCircle - Displays a safe zone boundary on Leaflet map with animations
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
  const circleRef = useRef();

  if (!safeZone || !safeZone.lat || !safeZone.lng || !safeZone.radius) {
    return null;
  }

  // Apply CSS class based on breach state
  useEffect(() => {
    if (circleRef.current) {
      const circleElement = circleRef.current._path;
      if (circleElement) {
        if (isBreached) {
          circleElement.classList.add('danger-zone');
          circleElement.classList.remove('safe-zone');
        } else {
          circleElement.classList.add('safe-zone');
          circleElement.classList.remove('danger-zone');
        }
      }
    }
  }, [isBreached]);

  const pathOptions = isBreached ? {
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.2,
    weight: 3,
    dashArray: '10, 5',
    className: 'danger-zone',
  } : {
    color: '#10b981',
    fillColor: '#10b981',
    fillOpacity: 0.1,
    weight: 2,
    dashArray: '10, 5',
    className: 'safe-zone',
  };

  return (
    <>
      {/* Main Safe Zone Circle */}
      <Circle
        ref={circleRef}
        center={[safeZone.lat, safeZone.lng]}
        radius={safeZone.radius}
        pathOptions={pathOptions}
      >
        <Popup>
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
        </Popup>
      </Circle>

      {/* Ripple Effect Circle (only when breached) */}
      {isBreached && (
        <>
          <Circle
            center={[safeZone.lat, safeZone.lng]}
            radius={safeZone.radius * 1.1}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '5, 10',
            }}
            className="ripple-circle"
          />
          <Circle
            center={[safeZone.lat, safeZone.lng]}
            radius={safeZone.radius * 1.2}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '3, 15',
            }}
            className="ripple-circle"
          />
        </>
      )}
    </>
  );
};

export default SafeZoneCircle;

