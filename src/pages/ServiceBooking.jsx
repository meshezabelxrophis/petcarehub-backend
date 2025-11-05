import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/backend";

function ServiceBooking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [selectedPet, setSelectedPet] = useState(null); // Changed from "" to null for better type checking
  const [bookingDate, setBookingDate] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service details
        const serviceRes = await fetch(API_ENDPOINTS.SERVICE_BY_ID(serviceId));
        if (!serviceRes.ok) throw new Error("Failed to fetch service details");
        const serviceData = await serviceRes.json();
        setService(serviceData);
        
        // Fetch provider details
        const providerRes = await fetch(API_ENDPOINTS.USER_BY_ID(serviceData.provider_id));
        if (!providerRes.ok) throw new Error("Failed to fetch provider details");
        const providerData = await providerRes.json();
        setProvider(providerData);
        
        // Fetch pet owner's pets or use mock data
        if (currentUser && (currentUser.accountType === "petOwner" || currentUser.role === "petOwner")) {
          const petsRes = await fetch(`${API_ENDPOINTS.PETS}?owner_id=${currentUser.id}`);
          if (!petsRes.ok) throw new Error("Failed to fetch pets");
          const petsData = await petsRes.json();
          setPets(petsData);
        } else {
          // Mock pets data for demonstration
          setPets([
            {
              id: 1,
              owner_id: 2,
              name: "Max",
              type: "Dog",
              breed: "Golden Retriever",
              age: 3
            },
            {
              id: 2,
              owner_id: 2,
              name: "Buddy",
              type: "Dog",
              breed: "Labrador",
              age: 2
            },
            {
              id: 3,
              owner_id: 2,
              name: "Whiskers",
              type: "Cat",
              breed: "Persian",
              age: 4
            }
          ]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load necessary data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [serviceId, currentUser]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!selectedPet) {
      errors.pet = "Please select a pet for this booking";
    }
    
    if (!bookingDate) {
      errors.date = "Please select a booking date";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (!currentUser) {
      setError("You must be logged in to book a service");
      navigate("/login");
      return;
    }
    
    try {
      // Create booking data with all necessary information
      const bookingData = {
        pet_owner_id: currentUser?.uid || currentUser?.id, // Use Firebase Auth UID
        service_id: service.id,
        pet_id: selectedPet, // This is now a number
        booking_date: bookingDate,
        provider_id: service.provider_id // Include the provider ID from the service
      };
      
      console.log("Creating new booking with data:", bookingData);
      
      const res = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create booking");
      }
      
      const data = await res.json();
      console.log("New booking created:", data);
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setSelectedPet(null);
      setBookingDate("");
      
      // Redirect to bookings page after a delay
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err.message || "Failed to create booking. Please try again later.");
    }
  };

  // Handle pet selection
  const handlePetSelection = (petId) => {
    console.log("Selected pet ID:", petId, "Type:", typeof petId);
    
    // Find the pet in our list to confirm it exists
    const selectedPetObj = pets.find(p => p.id === petId);
    console.log("Found pet:", selectedPetObj);
    
    setSelectedPet(petId);
    // Clear any validation errors for pet selection
    setValidationErrors({...validationErrors, pet: undefined});
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You're not logged in. This is a demo mode with sample data.
                <button
                  onClick={() => navigate("/login")}
                  className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </div>
        {/* Rest of the component will render as normal */}
      </div>
    );
  }
  
  if (currentUser && currentUser.accountType !== "petOwner" && currentUser.role !== "petOwner") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Note: You're logged in as a service provider. This is a demo mode with sample data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      ) : success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Successful!</h2>
          <p className="text-green-700 mb-4">Your booking has been confirmed. You'll be redirected to your bookings page shortly.</p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Booking Failed</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => setError("")}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : service ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Book a Service</h1>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h2 className="text-xl font-semibold text-gray-800">{service.name}</h2>
              <p className="text-gray-600 mt-1">{service.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-gray-600">Provider:</span>
                  <span className="ml-2 font-medium">{provider?.name || "Unknown Provider"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-medium">${service.price}</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select Pet</label>
                {pets.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-600 mb-4">You don't have any pets added yet.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/my-pets")}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Add a Pet
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid gap-4 mb-4">
                      {pets.map((pet) => (
                        <div 
                          key={pet.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPet === pet.id 
                              ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500" 
                              : "border-gray-200 hover:border-teal-300"
                          }`}
                          onClick={() => handlePetSelection(pet.id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                {pet.type === "Dog" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                )}
                                {pet.type === "Cat" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12a8 8 0 01-8 8v-8h8zm0 0a8 8 0 00-8-8v8h8z" />
                                  </svg>
                                )}
                                {!["Dog", "Cat"].includes(pet.type) && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 flex-grow">
                              <h3 className="font-medium text-gray-800">{pet.name}</h3>
                              <p className="text-sm text-gray-500">{pet.type} • {pet.breed || 'No breed specified'}</p>
                            </div>
                            <div className="ml-2">
                              <input
                                type="radio"
                                name="selectedPet"
                                value={pet.id}
                                checked={selectedPet === pet.id}
                                onChange={() => handlePetSelection(pet.id)}
                                className="h-5 w-5 text-teal-600 border-gray-300 focus:ring-teal-500"
                              />
                            </div>
                          </div>
                          {selectedPet === pet.id && (
                            <div className="mt-3 text-sm text-gray-600 grid grid-cols-2 gap-2">
                              {pet.age && <div><span className="font-medium">Age:</span> {pet.age} years</div>}
                              {pet.gender && <div><span className="font-medium">Gender:</span> {pet.gender}</div>}
                              {pet.weight && <div><span className="font-medium">Weight:</span> {pet.weight} kg</div>}
                              {pet.notes && <div className="col-span-2"><span className="font-medium">Notes:</span> {pet.notes}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {validationErrors.pet && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.pet}</p>
                    )}
                    {pets.length > 0 && selectedPet && (
                      <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-md text-teal-700 text-sm">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            You've selected {pets.find(p => p.id === selectedPet)?.name} for this booking
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="text-right mt-4">
                      <button
                        type="button"
                        onClick={() => navigate("/my-pets")}
                        className="inline-flex items-center text-teal-600 hover:text-teal-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Another Pet
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Booking Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setValidationErrors({...validationErrors, date: undefined});
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border ${validationErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  required
                />
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 ${!selectedPet || !bookingDate ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded-md transition-colors`}
                  disabled={!selectedPet || !bookingDate || pets.length === 0}
                >
                  Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Service not found.</p>
        </div>
      )}
    </div>
  );
}

export default ServiceBooking; 