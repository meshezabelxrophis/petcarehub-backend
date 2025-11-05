import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Shield, CheckCircle } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SafeZoneModal = ({ isOpen, onClose, currentLocation, petName, userId }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [existingSafeZone, setExistingSafeZone] = useState(null);

  // Load existing safe zone when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadExistingSafeZone();
    }
  }, [isOpen, userId]);

  // Set default values from current location
  useEffect(() => {
    if (isOpen && currentLocation) {
      setLatitude(currentLocation.lat?.toString() || '');
      setLongitude(currentLocation.lng?.toString() || '');
    }
  }, [isOpen, currentLocation]);

  const loadExistingSafeZone = async () => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().safeZone) {
        const safeZone = userDoc.data().safeZone;
        setExistingSafeZone(safeZone);
        setLatitude(safeZone.lat?.toString() || '');
        setLongitude(safeZone.lng?.toString() || '');
        setRadius(safeZone.radius?.toString() || '100');
      }
    } catch (error) {
      console.error('Error loading safe zone:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const safeZoneData = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        radius: parseFloat(radius),
        updatedAt: new Date().toISOString(),
        petName: petName || 'Pet',
      };

      // Save to Firestore at /users/{userId}/safeZone
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { safeZone: safeZoneData }, { merge: true });

      console.log('✅ Safe zone saved:', safeZoneData);
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving safe zone:', error);
      alert('Failed to save safe zone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setLatitude(currentLocation.lat?.toString() || '');
      setLongitude(currentLocation.lng?.toString() || '');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-[1001] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield size={28} />
                <div>
                  <h2 className="text-xl font-bold">Set Safe Zone</h2>
                  <p className="text-teal-100 text-sm">
                    {existingSafeZone ? 'Update' : 'Create'} safe zone for {petName || 'your pet'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-teal-800 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {existingSafeZone && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>ℹ️ Existing Safe Zone:</strong> Last updated{' '}
                {new Date(existingSafeZone.updatedAt).toLocaleString()}
              </div>
            )}

            {/* Latitude Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 33.6844"
              />
            </div>

            {/* Longitude Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 73.0479"
              />
            </div>

            {/* Use Current Location Button */}
            {currentLocation && (
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 py-2 px-3 rounded-lg transition-colors border border-teal-200"
              >
                📍 Use Current Pet Location
              </button>
            )}

            {/* Radius Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield size={16} className="inline mr-1" />
                Radius (meters)
              </label>
              <input
                type="number"
                step="1"
                min="10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Safe zone radius in meters (minimum 10m)
              </p>
            </div>

            {/* Preview */}
            {latitude && longitude && radius && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-gray-700">Preview:</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>
                    <span className="text-xs text-gray-500">Center:</span>
                    <p className="font-mono text-xs">
                      {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Radius:</span>
                    <p className="font-mono text-xs">{radius}m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield size={18} className="mr-2" />
                    {existingSafeZone ? 'Update' : 'Set'} Safe Zone
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle size={24} />
              <div>
                <p className="font-semibold">Safe zone updated successfully!</p>
                <p className="text-sm text-green-100">Your pet is now protected</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default SafeZoneModal;

