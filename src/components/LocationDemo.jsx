import React from 'react';
import useUserLocation from '../hooks/useUserLocation';
import { MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Demo component showing how to use the useUserLocation hook
 * This component can be used anywhere in the app to get user location
 */
const LocationDemo = () => {
  const { latitude, longitude, loading, error, getCurrentLocation } = useUserLocation();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-teal-600" />
          Your Location
        </h3>
        
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{loading ? 'Getting...' : 'Refresh'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Getting your location...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <div className="mt-1 text-lg font-mono text-gray-900">
                {latitude ? latitude.toFixed(6) : 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <div className="mt-1 text-lg font-mono text-gray-900">
                {longitude ? longitude.toFixed(6) : 'N/A'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm text-amber-700 font-medium">Location Note</p>
                <p className="text-sm text-amber-600">{error}</p>
              </div>
            </div>
          )}
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Hook Usage:</strong> <code className="bg-gray-200 px-1 rounded text-xs">
                const &#123; latitude, longitude, loading, error &#125; = useUserLocation();
              </code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Fallback coordinates: Karachi (24.8607, 67.0011) if geolocation fails
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDemo;

