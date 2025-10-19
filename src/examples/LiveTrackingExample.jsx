/**
 * Example: Live GPS Tracking
 * 
 * This component demonstrates how to:
 * 1. Subscribe to real-time pet location updates
 * 2. Update pet location
 * 3. Display location on a map
 * 4. Handle multiple pets tracking
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToLocation,
  updatePetLocation,
  subscribeToMultipleLocations
} from '../services/realtimeService';

export default function LiveTrackingExample() {
  const { currentUser } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState('pet_123');
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to pet location
  useEffect(() => {
    if (!selectedPetId) return;

    console.log('🔄 Subscribing to pet location:', selectedPetId);

    // Subscribe to real-time updates from Firebase Realtime DB
    const unsubscribe = subscribeToLocation(selectedPetId, (newLocation) => {
      if (newLocation) {
        console.log('📍 Location updated:', newLocation);
        setLocation(newLocation);
      } else {
        console.log('⚠️ No location data available');
        setLocation(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🛑 Unsubscribing from location updates');
      unsubscribe();
    };
  }, [selectedPetId]);

  // Simulate GPS tracking
  const startTracking = () => {
    setTracking(true);
    setError(null);

    // Try to get user's actual location
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          // Update location in Firebase Realtime DB
          updatePetLocation(selectedPetId, locationData)
            .then(() => {
              console.log('✅ Location updated successfully');
            })
            .catch((error) => {
              console.error('❌ Failed to update location:', error);
              setError(error.message);
            });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access location. Using simulated data.');
          
          // Fallback: Use simulated location
          simulateLocationUpdates();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation not supported. Using simulated data.');
      simulateLocationUpdates();
    }
  };

  const stopTracking = () => {
    setTracking(false);
  };

  // Simulate location updates (for demo purposes)
  const simulateLocationUpdates = () => {
    let lat = 40.7128; // New York
    let lng = -74.0060;

    const interval = setInterval(() => {
      if (!tracking) {
        clearInterval(interval);
        return;
      }

      // Simulate movement
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;

      const locationData = {
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        timestamp: Date.now()
      };

      updatePetLocation(selectedPetId, locationData)
        .catch((error) => {
          console.error('Failed to update location:', error);
        });
    }, 3000); // Update every 3 seconds

    return interval;
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '50px auto',
      padding: '20px'
    }}>
      <h2>Live GPS Tracking Example</h2>
      <p style={{ color: '#666' }}>
        Real-time location tracking using Firebase Realtime Database
      </p>

      {/* Controls */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Select Pet:
          </label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            style={{
              padding: '10px',
              width: '100%',
              maxWidth: '300px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="pet_123">Max (Dog)</option>
            <option value="pet_456">Luna (Cat)</option>
            <option value="pet_789">Charlie (Dog)</option>
          </select>
        </div>

        <div>
          {!tracking ? (
            <button
              onClick={startTracking}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🚀 Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              style={{
                padding: '12px 24px',
                backgroundColor: '#e00',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ⏸️ Stop Tracking
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Location Display */}
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        <h3>Current Location</h3>
        
        {location ? (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <strong>Latitude:</strong>
                <div style={{ fontSize: '24px', color: '#0070f3' }}>
                  {location.latitude?.toFixed(6)}
                </div>
              </div>
              
              <div>
                <strong>Longitude:</strong>
                <div style={{ fontSize: '24px', color: '#0070f3' }}>
                  {location.longitude?.toFixed(6)}
                </div>
              </div>
              
              {location.accuracy && (
                <div>
                  <strong>Accuracy:</strong>
                  <div style={{ fontSize: '18px' }}>
                    ±{location.accuracy.toFixed(0)}m
                  </div>
                </div>
              )}
              
              <div>
                <strong>Last Updated:</strong>
                <div style={{ fontSize: '14px' }}>
                  {new Date(location.timestamp || location.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Simple Map Placeholder */}
            <div style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Map marker */}
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#e00',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                position: 'absolute',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  transform: 'rotate(45deg)'
                }} />
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                📍 {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </div>
            </div>

            <p style={{
              marginTop: '15px',
              fontSize: '14px',
              color: '#666',
              textAlign: 'center'
            }}>
              💡 In production, replace with Google Maps or Mapbox
            </p>
          </div>
        ) : (
          <div style={{
            padding: '50px',
            textAlign: 'center',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📍</div>
            <p>No location data available</p>
            <p style={{ fontSize: '14px' }}>
              {tracking ? 'Waiting for GPS signal...' : 'Start tracking to see location'}
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>ℹ️ How it works:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Location updates are stored in <strong>Firebase Realtime Database</strong></li>
          <li>Changes propagate to all connected clients instantly</li>
          <li>Perfect for live tracking, delivery tracking, or geofencing</li>
          <li>Works alongside Firestore for pet profiles and bookings</li>
        </ul>
      </div>
    </div>
  );
}

