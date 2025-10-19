import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PetMap from '../components/PetMap';
import { MapPin, AlertCircle, PawPrint } from 'lucide-react';
import { API_ENDPOINTS } from '../config/backend';

function TrackMyPet() {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // If no user or not a pet owner, use mock data
      const ownerId = currentUser?.id || 2; // Default to mock user ID 2
      
      const res = await fetch(`${API_ENDPOINTS.PETS}?owner_id=${ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch pets');
      
      const data = await res.json();
      setPets(data);
      
      // Auto-select first pet if available
      if (data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Failed to load pets. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handlePetChange = (e) => {
    const petId = parseInt(e.target.value);
    const pet = pets.find(p => p.id === petId);
    setSelectedPet(pet);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PawPrint size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Pets Added Yet</h3>
          <p className="text-gray-500 mb-4">
            Add your pets in "My Pets" section to start tracking them
          </p>
          <a
            href="/my-pets"
            className="inline-flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            <PawPrint size={20} className="mr-2" />
            Add Your First Pet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <MapPin size={32} className="mr-3 text-teal-600" />
          Track My Pet
        </h1>
        <p className="text-gray-600">
          Monitor your pet's real-time location with our smart collar GPS tracking system
        </p>
      </div>

      {/* Pet Selection */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Pet to Track:
        </label>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPet?.id || ''}
            onChange={handlePetChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.type}) {pet.breed && `- ${pet.breed}`}
              </option>
            ))}
          </select>
          {selectedPet && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded">
                {selectedPet.type}
              </span>
              {selectedPet.age && (
                <span className="text-gray-500">{selectedPet.age} years old</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GPS Tracking Map */}
      {selectedPet && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">
              🐾 {selectedPet.name}'s Live Location
            </h2>
            <p className="text-teal-100">
              Real-time GPS tracking • Updates every few seconds
            </p>
          </div>
          
          <div className="p-6">
            <PetMap petId={selectedPet.id} petName={selectedPet.name} />
          </div>
          
          {/* Pet Info */}
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Pet Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{selectedPet.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="font-medium">{selectedPet.type}</p>
              </div>
              {selectedPet.breed && (
                <div>
                  <span className="text-gray-500">Breed:</span>
                  <p className="font-medium">{selectedPet.breed}</p>
                </div>
              )}
              {selectedPet.age && (
                <div>
                  <span className="text-gray-500">Age:</span>
                  <p className="font-medium">{selectedPet.age} years</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackMyPet;

