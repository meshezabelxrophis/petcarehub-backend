/**
 * Safe Zone Helper Utilities
 * 
 * Functions to retrieve, monitor, and check if a pet is within safe zone
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get user's safe zone configuration
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Safe zone data { lat, lng, radius } or null
 */
export const getUserSafeZone = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().safeZone) {
      return userDoc.data().safeZone;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching safe zone:', error);
    return null;
  }
};

/**
 * Calculate distance between two GPS coordinates (in meters)
 * Uses Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // in meters
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use haversineDistance instead
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  return haversineDistance(lat1, lng1, lat2, lng2);
};

/**
 * Check if a pet location is within safe zone
 * @param {object} petLocation - { lat, lng } or { lat, lon }
 * @param {object} safeZone - { lat, lng, radius } or { lat, lon, radius }
 * @returns {boolean} true if within safe zone, false otherwise
 */
export const isPetInSafeZone = (petLocation, safeZone) => {
  if (!petLocation || !safeZone) return false;
  
  const petLon = petLocation.lng || petLocation.lon;
  const zoneLon = safeZone.lng || safeZone.lon;
  
  const distance = haversineDistance(
    petLocation.lat,
    petLon,
    safeZone.lat,
    zoneLon
  );
  
  return distance <= safeZone.radius;
};

/**
 * Get safe zone breach status with details
 * @param {object} petLocation - { lat, lng } or { lat, lon }
 * @param {object} safeZone - { lat, lng, radius } or { lat, lon, radius }
 * @returns {object} { isInside, distance, percentageOutside, distanceFromEdge }
 */
export const getSafeZoneStatus = (petLocation, safeZone) => {
  if (!petLocation || !safeZone) {
    return { isInside: false, distance: null, percentageOutside: null };
  }
  
  const petLon = petLocation.lng || petLocation.lon;
  const zoneLon = safeZone.lng || safeZone.lon;
  
  const distance = haversineDistance(
    petLocation.lat,
    petLon,
    safeZone.lat,
    zoneLon
  );
  
  const isInside = distance <= safeZone.radius;
  const percentageOutside = isInside 
    ? 0 
    : Math.round(((distance - safeZone.radius) / safeZone.radius) * 100);
  
  return {
    isInside,
    distance: Math.round(distance), // in meters
    percentageOutside,
    distanceFromEdge: isInside 
      ? Math.round(safeZone.radius - distance) 
      : Math.round(distance - safeZone.radius)
  };
};

/**
 * Example usage:
 * 
 * // Get safe zone for current user
 * const safeZone = await getUserSafeZone(userId);
 * 
 * // Monitor pet location
 * const petLocation = { lat: 33.6844, lng: 73.0479 };
 * const status = getSafeZoneStatus(petLocation, safeZone);
 * 
 * if (!status.isInside) {
 *   console.log(`⚠️ Pet is ${status.distance}m from safe zone center`);
 *   console.log(`Pet is ${status.distanceFromEdge}m outside the safe zone`);
 *   // Trigger alert/notification
 * }
 */

