/**
 * Geofence Testing Utility
 * 
 * Helper functions to test real-time geofencing by simulating pet location updates
 * 
 * Usage:
 * 1. Open browser console
 * 2. Import this file or copy functions
 * 3. Run test functions to simulate pet movements
 */

import { ref, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

/**
 * Update pet location in Firebase Realtime Database
 * @param {string} petId - Pet ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export const updatePetLocation = async (petId, lat, lng) => {
  try {
    const locationRef = ref(realtimeDb, `pets/${petId}/location`);
    await set(locationRef, {
      lat,
      lng,
      timestamp: Date.now(),
    });
    console.log(`✅ Updated pet ${petId} location to:`, { lat, lng });
  } catch (error) {
    console.error('❌ Error updating pet location:', error);
  }
};

/**
 * Simulate pet moving INSIDE safe zone
 * @param {string} petId - Pet ID
 * @param {object} safeZone - { lat, lng, radius }
 */
export const simulateInsideSafeZone = async (petId, safeZone) => {
  console.log('🟢 Simulating pet INSIDE safe zone...');
  // Place pet at safe zone center
  await updatePetLocation(petId, safeZone.lat, safeZone.lng);
};

/**
 * Simulate pet moving OUTSIDE safe zone
 * @param {string} petId - Pet ID
 * @param {object} safeZone - { lat, lng, radius }
 * @param {number} distanceMeters - How far outside (in meters)
 */
export const simulateOutsideSafeZone = async (petId, safeZone, distanceMeters = 200) => {
  console.log(`🔴 Simulating pet OUTSIDE safe zone by ${distanceMeters}m...`);
  
  // Move pet north of safe zone center
  // 1 degree latitude ≈ 111,000 meters
  const latOffset = distanceMeters / 111000;
  
  await updatePetLocation(
    petId,
    safeZone.lat + latOffset,
    safeZone.lng
  );
};

/**
 * Simulate pet walking from inside to outside safe zone
 * @param {string} petId - Pet ID
 * @param {object} safeZone - { lat, lng, radius }
 * @param {number} steps - Number of steps
 * @param {number} delay - Delay between steps (ms)
 */
export const simulateWalkingOut = async (petId, safeZone, steps = 10, delay = 1000) => {
  console.log(`🚶 Simulating pet walking out of safe zone in ${steps} steps...`);
  
  const totalDistance = safeZone.radius + 100; // Walk 100m beyond radius
  const stepDistance = totalDistance / steps;
  
  for (let i = 0; i <= steps; i++) {
    const currentDistance = (stepDistance * i);
    const latOffset = currentDistance / 111000;
    
    await updatePetLocation(
      petId,
      safeZone.lat + latOffset,
      safeZone.lng
    );
    
    console.log(`📍 Step ${i + 1}/${steps + 1}: ${Math.round(currentDistance)}m from center`);
    
    if (i < steps) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('✅ Walk simulation complete');
};

/**
 * Simulate pet walking back INTO safe zone
 * @param {string} petId - Pet ID
 * @param {object} safeZone - { lat, lng, radius }
 * @param {number} steps - Number of steps
 * @param {number} delay - Delay between steps (ms)
 */
export const simulateWalkingBack = async (petId, safeZone, steps = 10, delay = 1000) => {
  console.log(`🚶 Simulating pet walking back into safe zone in ${steps} steps...`);
  
  const startDistance = safeZone.radius + 100; // Start 100m outside
  const stepDistance = startDistance / steps;
  
  for (let i = 0; i <= steps; i++) {
    const currentDistance = startDistance - (stepDistance * i);
    const latOffset = currentDistance / 111000;
    
    await updatePetLocation(
      petId,
      safeZone.lat + latOffset,
      safeZone.lng
    );
    
    console.log(`📍 Step ${i + 1}/${steps + 1}: ${Math.round(currentDistance)}m from center`);
    
    if (i < steps) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('✅ Walk back simulation complete');
};

/**
 * Simulate random pet movement within a radius
 * @param {string} petId - Pet ID
 * @param {object} centerLocation - { lat, lng }
 * @param {number} maxRadius - Maximum radius to move within (meters)
 * @param {number} duration - Duration of simulation (seconds)
 * @param {number} updateInterval - Update interval (ms)
 */
export const simulateRandomMovement = async (
  petId,
  centerLocation,
  maxRadius = 150,
  duration = 60,
  updateInterval = 2000
) => {
  console.log(`🎲 Simulating random movement for ${duration} seconds...`);
  
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  const intervalId = setInterval(async () => {
    if (Date.now() >= endTime) {
      clearInterval(intervalId);
      console.log('✅ Random movement simulation complete');
      return;
    }
    
    // Random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * maxRadius;
    
    // Convert to lat/lng offset
    const latOffset = (Math.cos(angle) * distance) / 111000;
    const lngOffset = (Math.sin(angle) * distance) / (111000 * Math.cos(centerLocation.lat * Math.PI / 180));
    
    await updatePetLocation(
      petId,
      centerLocation.lat + latOffset,
      centerLocation.lng + lngOffset
    );
    
  }, updateInterval);
  
  return intervalId;
};

// ============================================
// CONSOLE TEST FUNCTIONS
// ============================================

/**
 * Make functions available in browser console
 */
if (typeof window !== 'undefined') {
  window.testGeofence = {
    updatePetLocation,
    simulateInsideSafeZone,
    simulateOutsideSafeZone,
    simulateWalkingOut,
    simulateWalkingBack,
    simulateRandomMovement,
    
    // Quick test scenarios
    quickTest: async (petId, safeZone) => {
      console.log('🧪 Running quick geofence test...');
      console.log('1. Moving pet inside safe zone...');
      await simulateInsideSafeZone(petId, safeZone);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('2. Moving pet outside safe zone...');
      await simulateOutsideSafeZone(petId, safeZone, 150);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('3. Moving pet back inside...');
      await simulateInsideSafeZone(petId, safeZone);
      
      console.log('✅ Quick test complete!');
    },
  };
  
  console.log('🧪 Geofence test utilities loaded! Use window.testGeofence');
}

/**
 * Example Usage in Browser Console:
 * 
 * // Get your petId and safe zone
 * const petId = "123";
 * const safeZone = { lat: 33.6844, lng: 73.0479, radius: 100 };
 * 
 * // Test 1: Move inside
 * await window.testGeofence.simulateInsideSafeZone(petId, safeZone);
 * 
 * // Test 2: Move outside
 * await window.testGeofence.simulateOutsideSafeZone(petId, safeZone, 200);
 * 
 * // Test 3: Walk out gradually
 * await window.testGeofence.simulateWalkingOut(petId, safeZone, 10, 1000);
 * 
 * // Test 4: Quick automated test
 * await window.testGeofence.quickTest(petId, safeZone);
 */

