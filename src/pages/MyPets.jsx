import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PetAddedAnimation from "../components/PetAddedAnimation";
import PetRemovedAnimation from "../components/PetRemovedAnimation";
import AnimatedConfirmDialog from "../components/AnimatedConfirmDialog";
import { API_ENDPOINTS } from "../config/backend";

function MyPets() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    gender: "Male",
    weight: "",
    notes: ""
  });
  const [showPetAddedAnimation, setShowPetAddedAnimation] = useState(false);
  const [lastAddedPetName, setLastAddedPetName] = useState("");
  const [showPetRemovedAnimation, setShowPetRemovedAnimation] = useState(false);
  const [lastRemovedPetName, setLastRemovedPetName] = useState("");
  
  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // Pet types for dropdown
  const petTypes = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Guinea Pig", "Fish", "Reptile", "Other"];

  // Animation variants for pet cards
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 14, 
      scale: 0.985 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 14
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // If no user or not a pet owner, use mock data
      const ownerId = currentUser?.id || 2; // Default to mock user ID 2
      
      const res = await fetch(`${API_ENDPOINTS.PETS}?owner_id=${ownerId}`);
      if (!res.ok) throw new Error("Failed to fetch pets");
      
      const data = await res.json();
      setPets(data);
    } catch (err) {
      console.error("Error fetching pets:", err);
      setError("Failed to load pets. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPets();
    
    // Listen for animation playground triggers
    const handlePetAddedTrigger = () => {
      setLastAddedPetName("Demo Pet");
      setShowPetAddedAnimation(true);
    };

    const handleAddDummyPets = () => {
      console.log('🐕 Adding 3 dummy pets for animation testing...');
      addDummyPets();
    };

    const handlePetRemovedTrigger = () => {
      setLastRemovedPetName("Demo Pet");
      setShowPetRemovedAnimation(true);
    };

    window.addEventListener('triggerPetAdded', handlePetAddedTrigger);
    window.addEventListener('addDummyPets', handleAddDummyPets);
    window.addEventListener('triggerPetRemoved', handlePetRemovedTrigger);
    return () => {
      window.removeEventListener('triggerPetAdded', handlePetAddedTrigger);
      window.removeEventListener('addDummyPets', handleAddDummyPets);
      window.removeEventListener('triggerPetRemoved', handlePetRemovedTrigger);
    };
  }, [fetchPets]);

  // Function to navigate to booking page with selected pet
  // eslint-disable-next-line no-unused-vars
  const navigateToBooking = (petId) => {
    navigate(`/book-service?pet=${petId}`);
  };

  // Function to add dummy pets for animation testing
  const addDummyPets = () => {
    const dummyPets = [
      {
        id: Date.now() + 1,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        age: 3,
        gender: "Male",
        weight: 25,
        notes: "Very friendly and energetic"
      },
      {
        id: Date.now() + 2,
        name: "Whiskers",
        type: "Cat",
        breed: "Persian",
        age: 2,
        gender: "Female",
        weight: 4.5,
        notes: "Loves to nap in sunny spots"
      },
      {
        id: Date.now() + 3,
        name: "Charlie",
        type: "Dog",
        breed: "Beagle",
        age: 5,
        gender: "Male",
        weight: 15,
        notes: "Great with kids"
      }
    ];

    // Add pets with a slight delay for staggered effect
    dummyPets.forEach((pet, index) => {
      setTimeout(() => {
        setPets(prevPets => [...prevPets, pet]);
      }, index * 200);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "age" || name === "weight" ? (value === "" ? "" : Number(value)) : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Dog",
      breed: "",
      age: "",
      gender: "Male",
      weight: "",
      notes: ""
    });
    setEditingPet(null);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      setError("Pet name and type are required");
      return;
    }
    
    try {
      const ownerId = currentUser?.id || 2; // Default to mock user ID 2
      
      const res = await fetch(API_ENDPOINTS.PETS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          owner_id: ownerId
        })
      });
      
      if (!res.ok) throw new Error("Failed to add pet");
      
      const data = await res.json();
      console.log("Pet added successfully:", data);
      
      // Store pet name for animation
      setLastAddedPetName(formData.name);
      
      // Refresh pets list
      fetchPets();
      resetForm();
      setShowAddForm(false);
      
      // Show success animation
      setShowPetAddedAnimation(true);
      setError("");
    } catch (err) {
      console.error("Error adding pet:", err);
      setError("Failed to add pet. Please try again later.");
    }
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      setError("Pet name and type are required");
      return;
    }
    
    try {
      const res = await fetch(API_ENDPOINTS.PET_BY_ID(editingPet.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to update pet");
      
      // Refresh pets list
      fetchPets();
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error updating pet:", err);
      setError("Failed to update pet. Please try again later.");
    }
  };

  const handleDeletePet = async (petId) => {
    // Find the pet to delete and store it for confirmation
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    setPetToDelete(pet);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePet = async () => {
    if (!petToDelete) return;
    
    const petId = petToDelete.id;
    const petName = petToDelete.name || "Pet";
    
    try {
      console.log("Attempting to delete pet with ID:", petId);
      
      const token = localStorage.getItem('token');
      const headers = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(API_ENDPOINTS.PET_BY_ID(petId), {
        method: "DELETE",
        headers
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Delete failed with status:", res.status, "Response:", errorData);
        throw new Error(errorData || "Failed to delete pet");
      }
      
      const data = await res.json();
      console.log("Pet deleted successfully:", data);
      
      // Store pet name for animation and trigger it
      setLastRemovedPetName(petName);
      setShowPetRemovedAnimation(true);
      
      // Update the pets list locally without fetching again
      setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
      
      // Clear any existing errors
      setError("");
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setPetToDelete(null);
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError(`Failed to delete pet: ${err.message}`);
      
      // Close confirmation dialog even on error
      setShowDeleteConfirm(false);
      setPetToDelete(null);
    }
  };

  const cancelDeletePet = () => {
    setShowDeleteConfirm(false);
    setPetToDelete(null);
  };

  const startEditPet = (pet) => {
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || "",
      age: pet.age || "",
      gender: pet.gender || "Male",
      weight: pet.weight || "",
      notes: pet.notes || ""
    });
    setEditingPet(pet);
    setShowAddForm(true);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Pets</h1>
      
      {/* Pet Added Animation */}
      <PetAddedAnimation 
        isVisible={showPetAddedAnimation}
        petName={lastAddedPetName}
        onComplete={() => setShowPetAddedAnimation(false)}
      />
      
      {/* Pet Removed Animation */}
      <PetRemovedAnimation 
        isVisible={showPetRemovedAnimation}
        petName={lastRemovedPetName}
        onComplete={() => setShowPetRemovedAnimation(false)}
      />
      
      {/* Animated Confirmation Dialog */}
      <AnimatedConfirmDialog
        isVisible={showDeleteConfirm}
        onConfirm={confirmDeletePet}
        onCancel={cancelDeletePet}
        title="Delete Pet"
        message={`Are you sure you want to delete ${petToDelete?.name || 'this pet'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Add New Pet
        </button>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.5
            }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingPet ? "Edit Pet" : "Add New Pet"}
            </h2>
          
          <form onSubmit={editingPet ? handleEditPet : handleAddPet}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Pet Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Pet Type*
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {petTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                {editingPet ? "Update Pet" : "Add Pet"}
              </button>
            </div>
          </form>
          </motion.div>
        </AnimatePresence>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <img 
              src="/placeholder.svg" 
              alt="No pets" 
              className="w-32 h-32 mx-auto opacity-50"
            />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Pets Added Yet</h3>
          <p className="text-gray-500 mb-4">
            Add your pets to easily book services for them
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Your First Pet
          </button>
        </div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {pets.map(pet => (
              <motion.div
                key={pet.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800">{pet.name}</h3>
                    <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">
                      {pet.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-600 mb-6">
                    {pet.breed && (
                      <p><span className="font-medium">Breed:</span> {pet.breed}</p>
                    )}
                    {pet.age && (
                      <p><span className="font-medium">Age:</span> {pet.age} years</p>
                    )}
                    {pet.gender && (
                      <p><span className="font-medium">Gender:</span> {pet.gender}</p>
                    )}
                    {pet.weight && (
                      <p><span className="font-medium">Weight:</span> {pet.weight} kg</p>
                    )}
                    {pet.notes && (
                      <p><span className="font-medium">Notes:</span> {pet.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => startEditPet(pet)}
                      className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full"
                      title="Edit pet"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full"
                      title="Delete pet"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default MyPets; 