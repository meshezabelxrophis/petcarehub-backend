import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../animations/animationConfig';

const ServiceAddedAnimation = ({ isVisible, onComplete, serviceName = "Your Service" }) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (isVisible) {
      console.log('🛠️ ServiceAddedAnimation triggered - showing success popup!');
      if (shouldReduceMotion) {
        // Show simple toast for reduced motion
        setShowToast(true);
        const timer = setTimeout(() => {
          setShowToast(false);
          onComplete?.();
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Full animation completes after ~1.4s
        const timer = setTimeout(() => {
          onComplete?.();
        }, 1400);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, shouldReduceMotion, onComplete]);

  if (shouldReduceMotion && showToast) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-teal-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛠️</span>
            <span className="font-medium">{serviceName} added successfully!</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && !shouldReduceMotion && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          {/* Success Popup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.85, 1.05, 1, 1]
            }}
            transition={{ 
              duration: 1.4,
              times: [0, 0.3, 0.5, 1],
              ease: "easeOut"
            }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 border border-teal-200"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🛠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Service Added Successfully!
              </h3>
              <p className="text-gray-600 text-sm">
                {serviceName} has been added to your services
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceAddedAnimation;

