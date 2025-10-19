import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdPaw } from 'react-icons/io';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import io from 'socket.io-client';
import { loadLottie } from '../utils/animationLoader';
import { SOCKET_URL, SOCKET_CONFIG } from '../config/backend';

// Lazy load Lottie for radar animation
const Lottie = lazy(() => import('lottie-react'));

const PetMap = () => {
  // Default location: Islamabad, Pakistan
  const defaultPosition = [33.6844, 73.0479];
  const defaultZoom = 13;

  // Enhanced state for animations
  const [position, setPosition] = useState(defaultPosition);
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [markerBounce, setMarkerBounce] = useState(false);
  const [radarAnimation, setRadarAnimation] = useState(null);
  const [showRadar, setShowRadar] = useState(false);
  const [markerKey, setMarkerKey] = useState(0); // Force marker re-render

  // Refs for smooth animations
  const mapRef = useRef();
  const markerRef = useRef();
  const socketRef = useRef();
  const locationTimeoutRef = useRef();

  // Create animated paw marker with proper Leaflet integration
  const createAnimatedPawIcon = () => {
    // Create the paw icon with CSS animations
    const pawIconMarkup = renderToStaticMarkup(
      <div 
        className="paw-marker-content"
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          borderRadius: '50%',
          border: '3px solid #0f766e',
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
          position: 'relative',
          animation: 'gentle-paw-pulse 2s ease-in-out infinite'
        }}
      >
        <IoMdPaw 
          size={20} 
          color="#0f766e"
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}
        />
      </div>
    );
    
    return L.divIcon({
      html: pawIconMarkup,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: `animated-paw-marker ${markerBounce ? 'marker-bounce' : ''}`
    });
  };

  // Load animations on component mount
  useEffect(() => {
    // Load radar animation
    loadLottie('/animations/radar.json')
      .then(setRadarAnimation)
      .catch(console.warn);
  }, []);

  // Listen for debug GPS updates from animations-test
  useEffect(() => {
    const handleSimulateGPS = (event) => {
      console.log('🧪 Debug GPS simulation triggered:', event.detail);
      const { lat, lng, timestamp: debugTimestamp } = event.detail;
      updatePetLocation([lat, lng], debugTimestamp || Date.now());
    };

    window.addEventListener('simulateGPSUpdate', handleSimulateGPS);
    return () => window.removeEventListener('simulateGPSUpdate', handleSimulateGPS);
  }, []);

  // Enhanced position update function
  const updatePetLocation = (newPosition, newTimestamp) => {
    console.log('📍 Updating pet location with smooth animations:', newPosition);
    
    setPosition(newPosition);
    setTimestamp(newTimestamp);
    setIsLocationActive(true);
    setShowRadar(true);
    
    // Trigger marker bounce animation
    setMarkerBounce(true);
    setMarkerKey(prev => prev + 1); // Force marker re-render
    setTimeout(() => setMarkerBounce(false), 600);
    
    // Smooth map movement
    if (mapRef.current) {
      mapRef.current.panTo(newPosition, { 
        animate: true, 
        duration: 1.0,
        easeLinearity: 0.2
      });
    }
    
    // Smooth marker movement (if marker exists)
    if (markerRef.current) {
      markerRef.current.setLatLng(newPosition);
    }

    // Hide radar after animation
    setTimeout(() => setShowRadar(false), 3000);
  };

  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection to:', SOCKET_URL);
    
    // Connect to Socket.IO server (production: Render, development: localhost)
    socketRef.current = io(SOCKET_URL, SOCKET_CONFIG.options);
    
    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('🟢 Connected to server for real-time pet tracking. Socket ID:', socketRef.current.id);
      setIsConnected(true);
      setIsLoading(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔴 Disconnected from server. Reason:', reason);
      setIsConnected(false);
    });

    // Listen for pet location updates with enhanced animations
    socketRef.current.on('petLocationUpdate', (data) => {
      console.log('📍 Received pet location update:', data);
      const newPosition = [data.latitude, data.longitude];
      updatePetLocation(newPosition, data.timestamp);
      
      // Clear any existing timeout
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
      
      // Set timeout to detect inactive location updates (30 seconds)
      locationTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Location updates timed out - marking as inactive');
        setIsLocationActive(false);
        setShowRadar(false);
      }, 30000); // 30 seconds timeout
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  // Check if location is recent (within last 2 minutes)
  const isLocationRecent = (timestamp) => {
    if (!timestamp) return false;
    const now = new Date();
    const locationTime = new Date(timestamp);
    const timeDiff = (now - locationTime) / 1000; // seconds
    return timeDiff < 120; // 2 minutes
  };

  // Get connection status text and color
  const getConnectionStatus = () => {
    if (!isConnected) {
      return { text: '🔴 Disconnected', color: 'red' };
    }
    if (!isLocationActive || !isLocationRecent(timestamp)) {
      return { text: '🟡 No signal', color: 'orange' };
    }
    return { text: '🟢 Live tracking', color: 'green' };
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          /* Enhanced marker animations */
          .animated-paw-marker {
            background: transparent !important;
            border: none !important;
            transition: all 0.3s ease !important;
          }
          
          .animated-paw-marker.marker-bounce {
            animation: paw-marker-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
          }
          
          /* Apply gentle pulse to both direct content and child divs */
          .paw-marker-content,
          .animated-paw-marker .paw-marker-content,
          .animated-paw-marker > div {  
            animation: gentle-paw-pulse 2.5s ease-in-out infinite !important;
          }
          
          /* Enhanced bounce animation overrides pulse temporarily */
          .animated-paw-marker.marker-bounce .paw-marker-content,
          .animated-paw-marker.marker-bounce > div {
            animation: paw-marker-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
                       gentle-paw-pulse 2.5s ease-in-out infinite !important;
          }
          
          @keyframes paw-marker-bounce {
            0% { 
              transform: scale(1) translateY(0) rotate(0deg); 
            }
            30% { 
              transform: scale(1.2) translateY(-10px) rotate(-8deg); 
            }
            60% { 
              transform: scale(1.08) translateY(-3px) rotate(3deg); 
            }
            100% { 
              transform: scale(1) translateY(0) rotate(0deg); 
            }
          }
          
          @keyframes gentle-paw-pulse {
            0%, 100% { 
              transform: scale(1) rotate(0deg); 
              box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
              border-color: #0f766e;
            }
            50% { 
              transform: scale(1.08) rotate(2deg); 
              box-shadow: 0 8px 20px rgba(15, 118, 110, 0.5);
              border-color: #059669;
            }
          }
          
          /* Radar overlay */
          .radar-overlay {
            position: absolute;
            z-index: 1000;
            pointer-events: none;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(15, 118, 110, 0.1) 0%, transparent 70%);
          }
          
          /* Mobile optimizations */
          @media (max-width: 768px) {
            .radar-overlay {
              width: 80px !important;
              height: 80px !important;
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .animated-paw-marker,
            .paw-marker-content,
            .animated-paw-marker > div,
            .animated-paw-marker.marker-bounce,
            .animated-paw-marker.marker-bounce > div {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
      
      {/* Radar Animation Overlay */}
      <AnimatePresence>
        {showRadar && isLocationActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="radar-overlay"
            style={{
              top: '50%',
              left: '50%',
              width: '100px',
              height: '100px',
              marginTop: '-50px',
              marginLeft: '-50px',
            }}
          >
            {radarAnimation ? (
              <Suspense fallback={null}>
                <Lottie
                  animationData={radarAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </Suspense>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                border: '2px solid #0f766e',
                borderRadius: '50%',
                animation: 'gentle-pulse 1s ease-in-out infinite'
              }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer 
        center={position} 
        zoom={defaultZoom} 
        style={{ width: '100%', height: '400px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          key={`marker-${markerKey}`}
          position={position} 
          icon={createAnimatedPawIcon()}
          ref={markerRef}
        >
          <Popup>
            <div>
              <strong>🐾 Pet Location</strong><br/>
              {isLoading ? (
                'Connecting...'
              ) : (
                <>
                  Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}<br/>
                  <small>Updated: {formatTimestamp(timestamp)}</small><br/>
                  <small style={{ color: getConnectionStatus().color }}>
                    {getConnectionStatus().text}
                  </small>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>🎯 Active: {isLocationActive ? 'Yes' : 'No'}</div>
          <div>📡 Radar: {showRadar ? 'Yes' : 'No'}</div>
          <div>🔗 Connected: {isConnected ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default PetMap;
