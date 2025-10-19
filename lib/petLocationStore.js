// Simple in-memory storage for pet location data
// In production, replace this with a proper database

let petLocationData = {
  pet_id: 1,
  latitude: 33.6844, // Default Islamabad coordinates
  longitude: 73.0479,
  timestamp: new Date().toISOString()
};

export function getPetLocation() {
  return { ...petLocationData }; // Return a copy to prevent direct mutations
}

export function updatePetLocation(newData) {
  petLocationData = {
    pet_id: newData.pet_id,
    latitude: parseFloat(newData.latitude),
    longitude: parseFloat(newData.longitude),
    timestamp: new Date().toISOString()
  };
  return { ...petLocationData };
}

export function initializePetLocation(initialData) {
  petLocationData = { ...initialData };
}



