import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import CheckoutButton from "../components/CheckoutButton";
import { getAllServices, getUserProfile } from "../services/firestoreService";

function Services() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);

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
        
        // Fetch provider details for each service
        const providerMap = {};
        const uniqueProviderIds = [...new Set(allServices.map(service => service.providerId))];
        
        for (const providerId of uniqueProviderIds) {
          try {
            const providerData = await getUserProfile(providerId);
            // Only add if it's a service provider
            if (providerData && providerData.accountType === 'serviceProvider') {
              providerMap[providerId] = providerData;
            }
          } catch (err) {
            console.error(`Error fetching provider ${providerId}:`, err);
          }
        }
        
        setServices(allServices);
        setProviders(providerMap);
        setFilteredServices(allServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
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
          
          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Available Services section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Available Services</h2>
          
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
              <p className="text-gray-600">No services found matching your search.</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                View All Services
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
                        <p className="text-sm text-gray-500 mb-4">
                          Provided by <span className="font-medium">{providers[service.providerId].name}</span>
                        </p>
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