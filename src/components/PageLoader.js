import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdPaw } from 'react-icons/io';

const PageLoader = ({ loading = true }) => {
  const [showLoader, setShowLoader] = useState(loading);

  useEffect(() => {
    if (!loading) {
      // Delay hiding to allow fade-out animation
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [loading]);

  // Framer Motion variants
  const loaderVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  // PetCareHub branded paw loader (uses your actual logo design)
  const PetCareHubLoader = () => (
    <div className="petcarehub-loader">
      <div className="paw-container">
        <IoMdPaw size={32} className="rotating-paw" />
      </div>
      <style jsx>{`
        .petcarehub-loader {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .paw-container {
          width: 60px;
          height: 60px;
          background: white;
          border: 3px solid #0f766e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
          position: relative;
        }
        .rotating-paw {
          color: #0f766e;
          animation: rotate-pulse 2s linear infinite;
        }
        @keyframes rotate-pulse {
          0% { 
            transform: rotate(0deg) scale(1); 
          }
          25% { 
            transform: rotate(90deg) scale(1.05); 
          }
          50% { 
            transform: rotate(180deg) scale(1.1); 
          }
          75% { 
            transform: rotate(270deg) scale(1.05); 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
          }
        }
        /* Keep loading animation even with reduced motion - it's functional */
      `}</style>
    </div>
  );

  if (!showLoader) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={loaderVariants}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            pointerEvents: 'none' // Prevents blocking interactions
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '16px'
          }}>
            <PetCareHubLoader />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                color: '#0f766e', // Brand teal color
                fontSize: '14px',
                fontWeight: '600',
                margin: 0,
                letterSpacing: '0.5px'
              }}
            >
              PetCare Hub
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
