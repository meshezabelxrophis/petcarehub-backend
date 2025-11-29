/**
 * Google Maps Configuration
 * 
 * This file contains the Google Maps API configuration
 * and helper functions for map styling and options.
 */

export const GOOGLE_MAPS_API_KEY = 'AIzaSyCjjA0xCvB57C2u25UQMbMjMCPWzDVkXzk';

/**
 * Default map options for all maps
 */
export const DEFAULT_MAP_OPTIONS = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
};

/**
 * Default center location: Islamabad, Pakistan
 */
export const DEFAULT_CENTER = {
  lat: 33.6844,
  lng: 73.0479,
};

/**
 * Default zoom level
 */
export const DEFAULT_ZOOM = 13;

/**
 * Map container style
 */
export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
};

/**
 * Custom map styles (optional - for themed maps)
 */
export const MAP_STYLES = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

/**
 * Libraries to load from Google Maps API
 */
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

