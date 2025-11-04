import React, { useState, useEffect, useRef } from 'react';
import { Circle, useMapEvents, Marker } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MapPin, Maximize2, Info } from 'lucide-react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * SafeZoneEditor - Interactive map-based safe zone editor
 * 
 * Features:
 * - Click map to set center
 * - Draggable circle
 * - Radius slider
 * - Visual preview
 * - Confirm/Cancel actions
 */
const SafeZoneEditor = ({ 
  isEditing, 
  onSave, 
  onCancel, 
  initialZone,
  currentPetLocation 
}) => {
  const [center, setCenter] = useState(
    initialZone 
      ? [initialZone.lat, initialZone.lng] 
      : currentPetLocation 
        ? [currentPetLocation.lat, currentPetLocation.lng]
        : [33.6844, 73.0479]
  );
  const [radius, setRadius] = useState(initialZone?.radius || 100);
  const [isDragging, setIsDragging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const circleRef = useRef();

  // Create center marker icon
  const createCenterIcon = () => {
    const iconMarkup = renderToStaticMarkup(
      <div style={{
        width: '24px',
        height: '24px',
        background: '#3b82f6',
        border: '3px solid white',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
      }} />
    );
    
    return L.divIcon({
      html: iconMarkup,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'center-marker'
    });
  };

  // Handle map clicks to set new center
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (isEditing) {
          setCenter([e.latlng.lat, e.latlng.lng]);
          setShowInstructions(false);
        }
      },
    });
    return null;
  };

  // Handle circle drag
  useEffect(() => {
    if (circleRef.current && isEditing) {
      const circle = circleRef.current;
      
      circle.on('dragstart', () => {
        setIsDragging(true);
      });
      
      circle.on('drag', (e) => {
        const newCenter = e.target.getLatLng();
        setCenter([newCenter.lat, newCenter.lng]);
      });
      
      circle.on('dragend', () => {
        setIsDragging(false);
      });
    }
  }, [isEditing]);

  // Handle save
  const handleSave = () => {
    onSave({
      lat: center[0],
      lng: center[1],
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
      {/* Map Click Handler */}
      <MapClickHandler />

      {/* Center Marker (Draggable Circle Center) */}
      <Marker 
        position={center} 
        icon={createCenterIcon()}
      />

      {/* Draggable Safe Zone Circle */}
      <Circle
        ref={circleRef}
        center={center}
        radius={radius}
        draggable={true}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 3,
          dashArray: '10, 5',
          className: 'editing-circle'
        }}
      />

      {/* Instructions Tooltip */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="leaflet-top leaflet-right"
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
                    <li>• Drag circle to move</li>
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
        className="leaflet-bottom leaflet-center"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border-2 border-blue-500 min-w-[320px] sm:min-w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Safe Zone Editor</h3>
            </div>
            {isDragging && (
              <span className="text-xs text-blue-600 animate-pulse">
                Dragging...
              </span>
            )}
          </div>

          {/* Center Coordinates */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Center Position</p>
            <p className="text-sm font-mono text-gray-900">
              {center[0].toFixed(6)}, {center[1].toFixed(6)}
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
                  onClick={() => setRadius(preset)}
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
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2 shadow-md"
            >
              <Check size={18} />
              <span>Confirm</span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-center text-gray-500 mt-3">
            Click map to reposition • Drag circle to move
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

        .editing-circle {
          cursor: move;
        }

        .center-marker {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default SafeZoneEditor;

