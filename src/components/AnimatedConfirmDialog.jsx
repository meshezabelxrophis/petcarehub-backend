import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../animations/animationConfig';

const AnimatedConfirmDialog = ({ 
  isVisible, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "warning" // 'warning', 'danger', 'info'
}) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());
  }, []);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const dialogVariants = shouldReduceMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const buttonVariants = shouldReduceMotion ? {} : {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.15 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Get theme colors based on type - Updated for PetCareHub teal theme
  const getThemeColors = () => {
    switch (type) {
      case 'danger':
        return {
          accent: '#ef4444',
          accentLight: '#fef2f2',
          accentBorder: '#fecaca',
          confirmBg: '#ef4444',
          confirmHover: '#dc2626'
        };
      case 'warning':
        return {
          accent: '#f59e0b',
          accentLight: '#fffbeb',
          accentBorder: '#fed7aa',
          confirmBg: '#f59e0b',
          confirmHover: '#d97706'
        };
      case 'info':
        return {
          accent: '#0f766e', // PetCareHub teal
          accentLight: '#f0fdfa',
          accentBorder: '#99f6e4',
          confirmBg: '#0f766e',
          confirmHover: '#0d9488'
        };
      case 'success':
        return {
          accent: '#10b981',
          accentLight: '#ecfdf5',
          accentBorder: '#a7f3d0',
          confirmBg: '#10b981',
          confirmHover: '#059669'
        };
      case 'teal': // New PetCareHub branded option
      default:
        return {
          accent: '#0f766e', // Primary teal
          accentLight: '#f0fdfa', // Very light teal
          accentBorder: '#99f6e4', // Light teal border
          confirmBg: '#0f766e', // Primary teal
          confirmHover: '#0d9488' // Darker teal on hover
        };
    }
  };

  const theme = getThemeColors();

  // Handle keyboard events
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      } else if (e.key === 'Enter') {
        onConfirm?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, onConfirm, onCancel]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={onCancel} // Click overlay to cancel
        >
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking dialog
            className="w-full max-w-md mx-auto"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: `2px solid ${theme.accentBorder}`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Header with colored accent */}
            <div 
              className="px-6 py-4 border-b"
              style={{
                backgroundColor: theme.accentLight,
                borderBottom: `1px solid ${theme.accentBorder}`,
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px'
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icon based on type */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <span className="text-white text-lg">
                    {type === 'danger' ? '⚠️' : type === 'warning' ? '❓' : 'ℹ️'}
                  </span>
                </div>
                
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: '#1f2937' }}
                >
                  {title}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p 
                className="text-gray-700 leading-relaxed"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              >
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onCancel}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db'
                }}
                onMouseEnter={(e) => {
                  if (!shouldReduceMotion) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                {cancelText}
              </motion.button>

              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onConfirm}
                className="px-6 py-2.5 rounded-lg font-medium text-white transition-colors"
                style={{
                  backgroundColor: theme.confirmBg,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!shouldReduceMotion) {
                    e.target.style.backgroundColor = theme.confirmHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.confirmBg;
                }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedConfirmDialog;
