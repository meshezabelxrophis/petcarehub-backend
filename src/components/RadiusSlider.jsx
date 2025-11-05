import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Save, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * RadiusSlider - Draggable slider for adjusting safe zone radius
 * Updates Firestore and redraws circle in real-time
 */
const RadiusSlider = ({ 
  safeZone, 
  userId, 
  petName, 
  onRadiusChange 
}) => {
  const [radius, setRadius] = useState(safeZone?.radius || 100);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local radius when safeZone prop changes
  useEffect(() => {
    if (safeZone?.radius) {
      setRadius(safeZone.radius);
    }
  }, [safeZone?.radius]);

  // Debounced save to Firestore
  useEffect(() => {
    if (!safeZone || radius === safeZone.radius) return;

    const saveTimeout = setTimeout(async () => {
      await handleSave();
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(saveTimeout);
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!userId || !safeZone) return;

    try {
      setIsSaving(true);

      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        safeZone: {
          lat: safeZone.lat,
          lng: safeZone.lng,
          radius: radius,
          updatedAt: new Date().toISOString(),
          petName: petName || 'Pet',
        }
      }, { merge: true });

      console.log(`✅ Safe zone radius updated to ${radius}m`);
      
      // Show saved indicator
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);

      // Notify parent component for instant UI update
      if (onRadiusChange) {
        onRadiusChange(radius);
      }
    } catch (error) {
      console.error('❌ Error updating radius:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    
    // Instant visual update (before Firestore save)
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  const handleQuickPreset = async (presetRadius) => {
    setRadius(presetRadius);
    if (onRadiusChange) {
      onRadiusChange(presetRadius);
    }
  };

  if (!safeZone) return null;

  return (
    <>
      {/* Toggle Button - Bottom Right Corner */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-4 right-4 z-[998] bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-2xl transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <Maximize2 size={20} />
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </motion.button>

      {/* Expandable Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 right-4 z-[998]"
            style={{ width: 'calc(100% - 2rem)', maxWidth: '600px' }}
          >
            <div 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Maximize2 size={18} className="text-blue-600" />
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              Safe Zone Radius
            </span>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1 text-blue-600"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Saving...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1 text-green-600"
                >
                  <Save size={14} />
                  <span className="text-xs font-medium">Saved!</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Current Radius Display */}
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1 }}
              className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm sm:text-base font-bold"
            >
              {radius}m
            </motion.div>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-3">
          <input
            type="range"
            min="50"
            max="2000"
            step="10"
            value={radius}
            onChange={handleSliderChange}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              setIsDragging(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setIsDragging(false);
            }}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-enhanced"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(radius - 50) / 1950 * 100}%, #e5e7eb ${(radius - 50) / 1950 * 100}%, #e5e7eb 100%)`
            }}
          />
          
          {/* Range Labels */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-500">50m</span>
            <span className="text-xs text-gray-500">2000m</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-6 gap-2">
          {[100, 200, 300, 500, 1000, 2000].map((preset) => (
            <button
              key={preset}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickPreset(preset);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                radius === preset
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset}m
            </button>
          ))}
        </div>

        {/* Helper Text */}
        <p className="text-xs text-center text-gray-500 mt-3">
          Drag slider or click preset to adjust • Auto-saves in 1 second
        </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Slider Styles */}
      <style>{`
        .slider-enhanced::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }
        
        .slider-enhanced::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
        }
        
        .slider-enhanced::-webkit-slider-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.8);
        }
        
        .slider-enhanced::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }
        
        .slider-enhanced::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
        }
        
        .slider-enhanced::-moz-range-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </>
  );
};

export default RadiusSlider;

