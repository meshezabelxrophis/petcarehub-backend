import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import useUserLocation from "../hooks/useUserLocation";
import { API_ENDPOINTS } from "../config/backend";
import CheckoutButton from "../components/CheckoutButton";
import { getAllServices, getUserProfile } from "../services/firestoreService";

function Services() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { latitude, longitude } = useUserLocation();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [maxRadius, setMaxRadius] = useState(10); // Default 10km radius

  // Animation variants for service cards (same as pet cards)
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
        duration: 0.2
      }
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all services directly from Firestore
        const allServices = await getAllServices();
        
        // Fetch provider details from both Firestore and backend API
        const providerMap = {};
        const uniqueProviderIds = [...new Set(allServices.map(service => service.providerId))];
        
        // Fetch provider location data from backend API
        let backendProviders = [];
        try {
          const providersRes = await fetch(API_ENDPOINTS.PROVIDERS);
          if (providersRes.ok) {
            backendProviders = await providersRes.json();
          }
        } catch (err) {
          console.warn('Could not fetch provider locations from backend:', err);
        }
        
        for (const providerId of uniqueProviderIds) {
          try {
            const providerData = await getUserProfile(providerId);
            // Only add if it's a service provider
            if (providerData && providerData.accountType === 'serviceProvider') {
              // Find matching provider from backend to get location data
              const backendProvider = backendProviders.find(p => p.id === providerId);
              providerMap[providerId] = {
                ...providerData,
                latitude: backendProvider?.latitude || providerData.latitude,
                longitude: backendProvider?.longitude || providerData.longitude,
              };
            }
          } catch (err) {
            console.error(`Error fetching provider ${providerId}:`, err);
          }
        }
        
        // Calculate distances if user location is available
        const servicesWithDistance = allServices.map(service => {
          const provider = providerMap[service.providerId];
          let distance = null;
          
          if (provider && provider.latitude && provider.longitude && latitude && longitude) {
            const providerLat = parseFloat(provider.latitude);
            const providerLon = parseFloat(provider.longitude);
            const userLat = parseFloat(latitude);
            const userLon = parseFloat(longitude);
            
            if (!isNaN(providerLat) && !isNaN(providerLon) && !isNaN(userLat) && !isNaN(userLon)) {
              // Haversine formula
              const R = 6371; // Earth's radius in km
              const dLat = (providerLat - userLat) * (Math.PI / 180);
              const dLon = (providerLon - userLon) * (Math.PI / 180);
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * (Math.PI / 180)) * Math.cos(providerLat * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              distance = R * c;
            }
          }
          
          return {
            ...service,
            distance
          };
        });
        
        // Filter services within radius (only if user has location)
        const nearbyServices = latitude && longitude
          ? servicesWithDistance.filter(service => 
              service.distance !== null && service.distance <= maxRadius
            )
          : servicesWithDistance; // Show all if no location
        
        // Sort by distance (closest first)
        const sortedServices = nearbyServices.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setServices(sortedServices);
        setProviders(providerMap);
        setFilteredServices(sortedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [latitude, longitude, maxRadius]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);
  
  // eslint-disable-next-line no-unused-vars
  const handleBookService = (serviceId) => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.accountType !== 'petOwner' && currentUser.role !== 'petOwner') {
      alert('Only pet owners can book services.');
    } else {
      navigate(`/book-service/${serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Pet Care Services</h1>
          <p className="text-xl mx-auto max-w-2xl mb-8">
            Find the perfect service for your pet from our network of verified professionals
          </p>
          
          {/* Search bar and Radius filter */}
          <div className="max-w-xl mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Radius Filter */}
            {latitude && longitude && (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Search Radius</label>
                  <span className="text-lg font-bold">{maxRadius}km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={maxRadius}
                  onChange={(e) => setMaxRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-1 opacity-75">
                  <span>1km</span>
                  <span>50km</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Services section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Available Services</h2>
            {latitude && longitude && filteredServices.length > 0 && (
              <p className="text-gray-600">
                Showing <span className="font-bold text-teal-600">{filteredServices.length}</span> services within {maxRadius}km
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm 
                  ? "No services found matching your search." 
                  : latitude && longitude
                    ? `No services found within ${maxRadius}km of your location.`
                    : "No services available at the moment."}
              </p>
              {latitude && longitude && !searchTerm && (
                <p className="text-sm text-gray-500 mb-4">
                  Try increasing the search radius to see more services
                </p>
              )}
              <div className="flex gap-3 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {latitude && longitude && maxRadius < 50 && (
                  <button
                    onClick={() => setMaxRadius(50)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Expand to 50km
                  </button>
                )}
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredServices.map(service => (
                  <motion.div 
                    key={service.id} 
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4">{service.description || "No description available."}</p>
                      
                      {providers[service.providerId] && (
                        <p className="text-sm text-gray-500 mb-2">
                          Provided by <span className="font-medium">{providers[service.providerId].name}</span>
                        </p>
                      )}
                      
                      {service.distance !== null && (
                        <div className="flex items-center text-teal-600 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm font-semibold">
                            {service.distance < 1 
                              ? `${(service.distance * 1000).toFixed(0)}m away` 
                              : `${service.distance.toFixed(1)}km away`}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-teal-600">₨{service.price.toFixed(2)}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/service/${service.id}`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm px-4 py-2.5"
                          >
                            View Details
                          </button>
                          <CheckoutButton
                            serviceName={service.name}
                            price={service.price}
                            serviceId={service.id}
                            className="text-sm px-5 py-2.5"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>


      {/* How it works - always show */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Search</h3>
              <p className="text-gray-600">
                Browse through services or search for specific pet care needs
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Book</h3>
              <p className="text-gray-600">
                Choose a service and schedule an appointment that works for you
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Relax</h3>
              <p className="text-gray-600">
                Sit back and let our verified professionals take care of your pet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;