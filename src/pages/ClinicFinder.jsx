import React, { useState, useEffect, useCallback } from 'react';
import ClinicMap from '../components/ClinicMap';
import { MapPin, Phone, DollarSign, Search, Loader2, AlertCircle } from 'lucide-react';
import useUserLocation from '../hooks/useUserLocation';
import { API_ENDPOINTS } from '../config/backend';

function ClinicFinder() {
  const { latitude, longitude, loading: locationLoading, error: locationError, getCurrentLocation } = useUserLocation();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [searchType, setSearchType] = useState('all'); // 'all' or 'nearby'
  
  // Convert lat/lon to array format for map component
  const userLocation = latitude && longitude ? [latitude, longitude] : null;

  // Fetch nearby clinics
  const fetchNearbyClinics = useCallback(async (lat, lng) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `${API_ENDPOINTS.PROVIDERS}?lat=${lat}&lon=${lng}&radius=${searchRadius}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby clinics');
      
      const data = await response.json();
      
      // Transform providers to clinic format
      const clinicsData = data.map(provider => ({
        clinic_id: provider.id || provider.provider_id,
        name: provider.name,
        address: provider.address || 'Address not provided',
        contact_number: provider.phone || 'N/A',
        latitude: provider.latitude,
        longitude: provider.longitude,
        bio: provider.bio,
        services: []
      }));
      
      setClinics(clinicsData);
    } catch (err) {
      console.error('Error fetching nearby clinics:', err);
      setError('Failed to load nearby clinics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchRadius]);

  // Fetch all clinics
  const fetchAllClinics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all providers without location filtering
      const response = await fetch(API_ENDPOINTS.PROVIDERS);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      
      const data = await response.json();
      
      // Transform providers to clinic format
      const clinicsData = data.map(provider => ({
        clinic_id: provider.id || provider.provider_id,
        name: provider.name,
        address: provider.address || 'Address not provided',
        contact_number: provider.phone || 'N/A',
        latitude: provider.latitude,
        longitude: provider.longitude,
        bio: provider.bio,
        services: []
      }));
      
      setClinics(clinicsData);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Failed to load clinics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch nearby clinics when location changes and search type is nearby
  useEffect(() => {
    if (searchType === 'nearby' && latitude && longitude) {
      fetchNearbyClinics(latitude, longitude);
    }
  }, [searchType, latitude, longitude, fetchNearbyClinics]);

  // Initial load
  useEffect(() => {
    if (searchType === 'all') {
      fetchAllClinics();
    }
    // No need to call getCurrentLocation manually since the hook does it automatically
  }, [searchType, fetchAllClinics]);

  // Handle search type change
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSelectedClinic(null);
  };

  // Handle clinic selection
  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
  };

  // Calculate distance for display
  const calculateDistance = (clinic) => {
    if (!userLocation) return null;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (clinic.latitude - userLocation[0]) * (Math.PI / 180);
    const dLon = (clinic.longitude - userLocation[1]) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation[0] * (Math.PI / 180)) * Math.cos(clinic.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Nearby Pet Clinics</h1>
        <p className="text-gray-600">Discover veterinary clinics and pet care services near you</p>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleSearchTypeChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  searchType === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Clinics
              </button>
              <button
                onClick={() => handleSearchTypeChange('nearby')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  searchType === 'nearby'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nearby
              </button>
            </div>
            
            {searchType === 'nearby' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Radius:</label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                </select>
              </div>
            )}
          </div>
          
          {searchType === 'nearby' && (
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span>{locationLoading ? 'Getting Location...' : 'Use My Location'}</span>
            </button>
          )}
        </div>
        
        {(error || locationError) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error || locationError}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Clinic List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {loading ? 'Loading Clinics...' : `${clinics.length} Clinics Found`}
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
                  <p className="text-gray-600">Loading clinics...</p>
                </div>
              ) : clinics.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No clinics found in this area</p>
                </div>
              ) : (
                clinics.map((clinic) => (
                  <div
                    key={clinic.clinic_id}
                    onClick={() => handleClinicSelect(clinic)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${
                      selectedClinic?.clinic_id === clinic.clinic_id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                      {userLocation && (
                        <span className="text-xs text-teal-600 font-medium">
                          {calculateDistance(clinic)} km
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{clinic.contact_number}</span>
                    </div>
                    {clinic.services && clinic.services.length > 0 && (
                      <div className="text-xs text-teal-600">
                        {clinic.services.length} services available
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Clinic Locations</h3>
            </div>
            <div className="p-4">
              <ClinicMap
                clinics={clinics}
                userLocation={userLocation}
                onClinicSelect={handleClinicSelect}
              />
            </div>
          </div>

          {/* Selected Clinic Details */}
          {selectedClinic && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedClinic.name}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{selectedClinic.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{selectedClinic.contact_number}</span>
                      </div>
                      {userLocation && (
                        <div className="flex items-center text-teal-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{calculateDistance(selectedClinic)} km from your location</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Services Available</h4>
                    {selectedClinic.services && selectedClinic.services.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClinic.services.map((service) => (
                          <div key={service.service_id} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <span className="font-medium text-gray-900">{service.name}</span>
                              {service.description && (
                                <p className="text-sm text-gray-600">{service.description}</p>
                              )}
                            </div>
                            <div className="flex items-center text-teal-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              <span>{service.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No services listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClinicFinder;
