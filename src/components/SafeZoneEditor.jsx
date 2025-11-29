import React, { useState, useEffect } from 'react';
import { Circle, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MapPin, Maximize2, Info } from 'lucide-react';

/**
 * SafeZoneEditor - Interactive map-based safe zone editor for Google Maps
 * 
 * Features:
 * - Click map to set center
 * - Draggable marker
 * - Radius slider
 * - Visual preview
 * - Confirm/Cancel actions
 */
const SafeZoneEditor = ({ 
  isEditing, 
  onSave, 
  onCancel, 
  initialZone,
  currentPetLocation,
  map 
}) => {
  const [center, setCenter] = useState(
    initialZone 
      ? { lat: initialZone.lat, lng: initialZone.lng }
      : currentPetLocation 
        ? { lat: currentPetLocation.lat, lng: currentPetLocation.lng }
        : { lat: 33.6844, lng: 73.0479 }
  );
  const [radius, setRadius] = useState(initialZone?.radius || 100);
  const [showInstructions, setShowInstructions] = useState(true);

  // Handle map clicks to set new center
  useEffect(() => {
    if (map && isEditing) {
      const listener = map.addListener('click', (e) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        setCenter({ lat: clickedLat, lng: clickedLng });
        setShowInstructions(false);
      });

      return () => {
        if (listener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    }
  }, [map, isEditing]);

  // Handle save
  const handleSave = () => {
    onSave({
      lat: center.lat,
      lng: center.lng,
      radius: radius
    });
  };

  // Auto-hide instructions after 5 seconds
  useEffect(() => {
    if (showInstructions && isEditing) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions, isEditing]);

  if (!isEditing) return null;

  return (
    <>
      {/* Center Marker (Draggable) */}
      <Marker 
        position={center}
        draggable={true}
        onDragEnd={(e) => {
          setCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }}
        icon={{
          path: window.google?.maps?.SymbolPath?.CIRCLE,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#ffffff',
          scale: 10,
        }}
      />

      {/* Draggable Safe Zone Circle */}
      <Circle
        center={center}
        radius={radius}
        options={{
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          clickable: false,
        }}
      />

      {/* Instructions Tooltip */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: '80px',
              right: '10px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs">
              <div className="flex items-start space-x-2">
                <Info size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">How to set safe zone:</p>
                  <ul className="text-xs space-y-1 text-blue-100">
                    <li>• Click map to set center</li>
                    <li>• Drag blue marker to move</li>
                    <li>• Adjust radius with slider</li>
                    <li>• Click confirm to save</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="safe-zone-control-panel"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-blue-500 min-w-[320px] sm:min-w-[400px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Safe Zone Editor</h3>
            </div>
          </div>

          {/* Center Coordinates */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Center Position</p>
            <p className="text-sm font-mono text-gray-900">
              {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
            </p>
          </div>

          {/* Radius Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Maximize2 size={16} className="mr-1" />
                Radius
              </label>
              <span className="text-sm font-bold text-blue-600">
                {radius}m
              </span>
            </div>
            
            {/* Slider */}
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(radius - 10) / 490 * 100}%, #e5e7eb ${(radius - 10) / 490 * 100}%, #e5e7eb 100%)`
              }}
            />
            
            {/* Quick Presets */}
            <div className="flex space-x-2 mt-2">
              {[50, 100, 200, 300].map((preset) => (
                <button
                  key={preset}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRadius(preset);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    radius === preset
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancel();
              }}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSave();
              }}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 shadow-md"
            >
              <Check size={18} />
              <span>Confirm</span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-gray-500 mt-3">
            Click map to reposition • Drag marker to move
          </p>
        </div>
      </motion.div>

      {/* CSS for slider */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        /* Prevent click-through on control panel */
        .safe-zone-control-panel {
          pointer-events: all !important;
        }
        
        .safe-zone-control-panel * {
          pointer-events: all !important;
        }
      `}</style>
    </>
  );
};

export default SafeZoneEditor;
