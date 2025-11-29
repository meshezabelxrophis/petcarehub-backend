import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, OverlayView, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdPaw } from 'react-icons/io';
import { AlertTriangle, CheckCircle, Shield, Edit3 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import SafeZoneCircle from './SafeZoneCircle';
import SafeZoneEditor from './SafeZoneEditor';
import RadiusSlider from './RadiusSlider';
import useSafeZoneMonitoring from '../hooks/useSafeZoneMonitoring';
import { 
  GOOGLE_MAPS_API_KEY, 
  DEFAULT_CENTER, 
  DEFAULT_MAP_OPTIONS,
  GOOGLE_MAPS_LIBRARIES 
} from '../config/googleMaps';

const PetMapWithGeofence = ({ petId, petName }) => {
  const defaultZoom = 15;

  const { userId } = useAuth();
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [liveRadius, setLiveRadius] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const mapRef = useRef();

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Real-time geofencing monitoring
  const {
    isOutside,
    distance,
    safeZone,
    petLocation,
    loading,
    distanceFromEdge,
    isMonitoring,
  } = useSafeZoneMonitoring(petId, userId);

  // Update map position when pet location changes
  useEffect(() => {
    if (petLocation?.lat && petLocation?.lng) {
      const newPosition = { lat: petLocation.lat, lng: petLocation.lng };
      setPosition(newPosition);

      // Smooth pan to new location (only if not in edit mode)
      if (mapRef.current && !isEditMode) {
        mapRef.current.panTo(newPosition);
      }
    }
  }, [petLocation, isEditMode]);

  // Handle save from SafeZoneEditor
  const handleSaveSafeZone = async (newZone) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        safeZone: {
          lat: newZone.lat,
          lng: newZone.lng,
          radius: newZone.radius,
          updatedAt: new Date().toISOString(),
          petName: petName || 'Pet',
        }
      }, { merge: true });

      console.log('✅ Safe zone saved:', newZone);
      
      // Exit edit mode
      setIsEditMode(false);
      
      // Show success message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
      // Reload the page to fetch new safe zone
      window.location.reload();
    } catch (error) {
      console.error('❌ Error saving safe zone:', error);
      alert('Failed to save safe zone. Please try again.');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Handle live radius change from slider
  const handleRadiusChange = (newRadius) => {
    setLiveRadius(newRadius);
    console.log(`📏 Radius changed to: ${newRadius}m`);
  };

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
    <div style={{ position: 'relative' }}>
      <style>
        {`
          /* Custom Paw Marker Styles */
          .animated-paw-marker {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .animated-paw-marker.safe {
            border: 3px solid #10b981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            animation: gentle-paw-pulse 2s ease-in-out infinite;
          }
          
          .animated-paw-marker.danger {
            border: 3px solid #ef4444;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            animation: danger-pulse 1.5s ease-in-out infinite;
          }

          /* Gentle pulse for normal state */
          @keyframes gentle-paw-pulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1) rotate(0deg); 
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.08) rotate(2deg); 
              box-shadow: 0 8px 20px rgba(16, 185, 129, 0.6);
            }
          }

          /* Danger pulse for pet marker when outside */
          @keyframes danger-pulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1); 
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.2); 
              box-shadow: 0 8px 24px rgba(239, 68, 68, 0.8);
            }
          }

          /* Breathing glow for danger state */
          @keyframes breathing-glow {
            0%, 100% {
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.5),
                          0 0 20px rgba(239, 68, 68, 0.3),
                          0 0 30px rgba(239, 68, 68, 0.2);
            }
            50% {
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.8),
                          0 0 40px rgba(239, 68, 68, 0.5),
                          0 0 60px rgba(239, 68, 68, 0.3);
            }
          }

          /* Shake animation for alert banner */
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}
      </style>

      {/* Geofence Alert Banner - Enhanced with animations */}
      <AnimatePresence>
        {isMonitoring && isOutside && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.95 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
            }}
            exit={{ y: -100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 right-0 z-[1000] bg-red-500 text-white px-4 py-3 shadow-2xl"
            style={{
              animation: 'breathing-glow 2s ease-in-out infinite, shake 0.5s ease-in-out',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
            }}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <AlertTriangle size={28} />
                </motion.div>
                <div>
                  <motion.p 
                    className="font-bold text-lg"
                    animate={{ opacity: [1, 0.8, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ⚠️ Geofence Breach Alert!
                  </motion.p>
                  <p className="text-sm text-red-100">
                    {petName} is <strong className="text-white text-base">{distanceFromEdge}m</strong> outside the safe zone
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-100">Distance from center</p>
                <motion.p 
                  className="text-2xl font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {distance}m
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Zone Status Indicator & Edit Button */}
      {isMonitoring && !loading && !isEditMode && (
        <div className="absolute top-4 left-4 z-[999] space-y-2">
          {/* Status Badge */}
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 border-2"
            style={{
              borderColor: isOutside ? '#ef4444' : '#10b981',
            }}
          >
            <div className="flex items-center space-x-2">
              {isOutside ? (
                <>
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-sm font-medium text-red-700">Outside Safe Zone</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-green-700">Inside Safe Zone</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {distanceFromEdge}m from edge
            </p>
          </div>

          {/* Edit Safe Zone Button */}
          <button
            onClick={() => setIsEditMode(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <Edit3 size={16} />
            <span>Edit Safe Zone</span>
          </button>
        </div>
      )}

      {/* Set New Safe Zone Button (when no safe zone exists) */}
      {!loading && !safeZone && !isEditMode && (
        <div className="absolute top-4 left-4 z-[999]">
          <button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg transition-colors flex items-center space-x-2 font-medium"
          >
            <Shield size={20} />
            <span>Set New Safe Zone</span>
          </button>
        </div>
      )}

      {/* Save Success Toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 right-4 z-[1001] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle size={20} />
              <span className="font-medium">Safe zone saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[999] bg-white rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Loading geofence...</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={position}
        zoom={defaultZoom}
        options={DEFAULT_MAP_OPTIONS}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {/* Pet Location Marker - Custom Paw Icon */}
        <OverlayView
          position={position}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div
            className={`animated-paw-marker ${isOutside ? 'danger' : 'safe'}`}
            onClick={() => setShowInfoWindow(true)}
            style={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <IoMdPaw 
              size={28} 
              color={isOutside ? '#ef4444' : '#10b981'}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
          </div>
        </OverlayView>

        {/* Info Window */}
        {showInfoWindow && (
          <InfoWindow 
            position={position}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="text-sm">
              <strong className="flex items-center">
                <IoMdPaw className="mr-1" />
                {petName}'s Location
              </strong>
              <br />
              <small>Lat: {position.lat.toFixed(4)}</small>
              <br />
              <small>Lng: {position.lng.toFixed(4)}</small>
              {isMonitoring && (
                <>
                  <br />
                  <br />
                  <strong
                    style={{
                      color: isOutside ? '#ef4444' : '#10b981',
                    }}
                  >
                    {isOutside ? '⚠️ Outside Safe Zone' : '✅ Inside Safe Zone'}
                  </strong>
                  <br />
                  <small>Distance from center: {distance}m</small>
                  <br />
                  <small>Distance from edge: {distanceFromEdge}m</small>
                </>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Safe Zone Circle with Glowing Effect (hide in edit mode) */}
        {safeZone && !isEditMode && (
          <SafeZoneCircle
            safeZone={{
              ...safeZone,
              radius: liveRadius || safeZone.radius
            }}
            isBreached={isOutside}
          />
        )}

        {/* Safe Zone Editor (interactive mode) */}
        <SafeZoneEditor
          isEditing={isEditMode}
          onSave={handleSaveSafeZone}
          onCancel={handleCancelEdit}
          initialZone={safeZone}
          currentPetLocation={petLocation}
          map={mapRef.current}
        />
      </GoogleMap>

      {/* Radius Slider (persistent control at bottom) */}
      {safeZone && !isEditMode && !loading && (
        <RadiusSlider
          safeZone={{
            ...safeZone,
            radius: liveRadius || safeZone.radius
          }}
          userId={userId}
          petName={petName}
          onRadiusChange={handleRadiusChange}
        />
      )}

      {/* Info Footer */}
      {isMonitoring && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield size={20} className="text-teal-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">Safe Zone Monitoring Active</h4>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={`font-medium ${isOutside ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutside ? 'Outside' : 'Inside'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Distance</p>
                  <p className="font-medium text-gray-900">{distance}m</p>
                </div>
                <div>
                  <p className="text-gray-500">Safe Zone Radius</p>
                  <p className="font-medium text-gray-900">{safeZone?.radius}m</p>
                </div>
                <div>
                  <p className="text-gray-500">From Edge</p>
                  <p className="font-medium text-gray-900">{distanceFromEdge}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Safe Zone Message */}
      {!loading && !safeZone && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">No Safe Zone Set</h4>
              <p className="text-xs text-blue-700 mt-1">
                Click "Set Safe Zone" to enable real-time geofencing alerts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && isMonitoring && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            zIndex: 1000,
          }}
        >
          <div>🎯 Monitoring: {isMonitoring ? 'Yes' : 'No'}</div>
          <div>📍 Location: {petLocation ? 'Yes' : 'No'}</div>
          <div>🛡️ Safe Zone: {safeZone ? 'Yes' : 'No'}</div>
          <div>⚠️ Outside: {isOutside ? 'Yes' : 'No'}</div>
          <div>📏 Distance: {distance}m</div>
        </div>
      )}
    </div>
  );
};

export default PetMapWithGeofence;
