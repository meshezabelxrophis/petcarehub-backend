import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllServices, getUserProfile } from "../services/firestoreService";

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);

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
        // Fetch all services directly from Firestore
        const allServices = await getAllServices();
        
        // Get only first 3 services
        const validServices = allServices.slice(0, 3);
        
        // Fetch provider details
        const providerMap = {};
        const uniqueProviderIds = [...new Set(validServices.map(service => service.providerId))];
        
        for (const providerId of uniqueProviderIds) {
          try {
            const providerData = await getUserProfile(providerId);
            if (providerData && providerData.accountType === 'serviceProvider') {
              providerMap[providerId] = providerData;
            }
          } catch (err) {
            console.error(`Error fetching provider ${providerId}:`, err);
          }
        }
        
        setServices(validServices);
        setProviders(providerMap);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Pet Care Made Simple</h1>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Connect with trusted pet care professionals for all your pet's needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-teal-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              to="/providers"
              className="bg-teal-700 text-white px-8 py-3 rounded-md font-medium hover:bg-teal-800 transition-colors"
            >
              Find Providers
            </Link>
          </div>
        </div>
      </div>

      {/* Featured services */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Services from Providers</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover real services offered by verified pet care professionals
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading featured services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No services available at the moment.</p>
              <Link
                to="/services"
                className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
              >
                Check back later <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {services.map(service => (
                  <motion.div 
                    key={service.id} 
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full h-48 bg-teal-100 flex items-center justify-center">
                      <div className="text-teal-600 text-4xl font-bold">
                        {service.name.charAt(0)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">{service.name}</h3>
                      <p className="text-gray-600 mb-2">
                        {service.description || "Professional pet care service"}
                      </p>
                      {providers[service.providerId] && (
                        <p className="text-sm text-gray-500 mb-4">
                          by <span className="font-medium">{providers[service.providerId].name}</span>
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-teal-600">${service.price}</span>
                        <button
                          onClick={() => navigate(`/service/${service.id}`)}
                          className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                        >
                          View Details <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
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

      {/* Smart Collars */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Track Your Pet's Health</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our Smart Collars provide real-time monitoring of your pet's location, activity levels, and health metrics. Get insights and peace of mind with our innovative technology.
              </p>
              <Link
                to="/smart-collars"
                className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
              >
                Learn About Smart Collars
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/placeholder.svg"
                alt="Smart Collar"
                className="rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 