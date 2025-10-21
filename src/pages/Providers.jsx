import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_ENDPOINTS } from "../config/backend";

function Providers() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Local state for live search inputs
  const [searchTermInput, setSearchTermInput] = useState("");
  const [searchLocationInput, setSearchLocationInput] = useState("");

  // Animation variants for provider cards (same as pet cards)
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
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch providers
        const providersRes = await fetch(API_ENDPOINTS.PROVIDERS);
        if (!providersRes.ok) throw new Error('Failed to fetch providers');
        const providersData = await providersRes.json();
        
        // Fetch all services
        const servicesRes = await fetch(API_ENDPOINTS.SERVICES);
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        
        // Filter for service provider services only
        const validServices = servicesData.filter(service => 
          service.account_type === 'serviceProvider'
        );
        
        setProviders(providersData);
        setServices(validServices);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load providers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Live filter providers by name and location
  const filterProviders = (nameTerm, locationTerm) => {
    const name = (nameTerm || "").trim().toLowerCase();
    const loc = (locationTerm || "").trim().toLowerCase();

    // If both empty, clear results
    if (!name && !loc) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    const results = providers.filter((provider) => {
      const providerName = (provider.name || "").toLowerCase();
      const providerDesc = (provider.description || "").toLowerCase();
      const providerAddress = (
        provider.address || provider.city || provider.location || provider.region || ""
      ).toLowerCase();

      const matchesName = !name || providerName.includes(name) || providerDesc.includes(name);
      const matchesLocation = !loc || providerAddress.includes(loc);

      return matchesName && matchesLocation;
    });

    setSearchResults(results);
    setShowSearchResults(true);
  };
  
  const clearSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchTermInput("");
    setSearchLocationInput("");
  };
  
  const getDisplayedProviders = () => {
    if (showSearchResults) {
      return searchResults;
    }
    
    if (activeFilter === "all") {
      return providers;
    }
    
    // Filter providers based on the services they offer
    const providersWithServices = providers.filter(provider => {
      const providerServices = services.filter(service => service.provider_id === provider.id);
      return providerServices.some(service => {
        const serviceName = service.name.toLowerCase();
        const filter = activeFilter.toLowerCase();
        
        // Match based on service names containing the filter category
        return serviceName.includes(filter) || 
               (filter === "grooming" && serviceName.includes("groom")) ||
               (filter === "veterinary" && (serviceName.includes("vet") || serviceName.includes("medical") || serviceName.includes("health"))) ||
               (filter === "training" && serviceName.includes("train")) ||
               (filter === "pet sitting" && (serviceName.includes("sit") || serviceName.includes("care"))) ||
               (filter === "dog walking" && serviceName.includes("walk")) ||
               (filter === "boarding" && serviceName.includes("board"));
      });
    });
    
    return providersWithServices;
  };
  
  // Add a button to clear search results
  // eslint-disable-next-line no-unused-vars
  const renderClearSearchButton = () => {
    if (showSearchResults) {
      return (
        <button 
          onClick={clearSearch}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear Search
        </button>
      );
    }
    return null;
  };

  // Update the displayedProviders section to handle empty results better
  const displayedProviders = getDisplayedProviders();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Pet Care Providers</h1>
          <p className="text-xl mx-auto max-w-2xl mb-8">
            Connect with our network of verified pet care professionals
          </p>

          {/* Search bar removed as requested */}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header removed as requested */}
        
        {/* Search form */}
        <div className="bg-teal-50 p-6 rounded-lg mb-8">
          <form onSubmit={(e) => { e.preventDefault(); filterProviders(searchTermInput, searchLocationInput); }} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTermInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTermInput(val);
                  filterProviders(val, searchLocationInput);
                }}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 p-2.5"
                placeholder="Search providers..."
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchLocationInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchLocationInput(val);
                  filterProviders(searchTermInput, val);
                }}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 p-2.5"
                placeholder="Your location"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Search
            </button>
          </form>
        </div>
        
        {/* Category filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("grooming")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "grooming" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Grooming
            </button>
            <button
              onClick={() => setActiveFilter("veterinary")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "veterinary" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Veterinary
            </button>
            <button
              onClick={() => setActiveFilter("training")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "training" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Training
            </button>
            <button
              onClick={() => setActiveFilter("pet sitting")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "pet sitting" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Pet Sitting
            </button>
            <button
              onClick={() => setActiveFilter("dog walking")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "dog walking" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Dog Walking
            </button>
            <button
              onClick={() => setActiveFilter("boarding")}
              className={`px-4 py-2 rounded-full ${
                activeFilter === "boarding" 
                  ? "bg-teal-600 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Boarding
            </button>
          </div>
        </div>
        
        {/* Loading, error, or no results state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading providers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : displayedProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No providers found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setShowSearchResults(false);
              }}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              View All Providers
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {displayedProviders.map(provider => (
                <motion.div 
                  key={provider.id} 
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{provider.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {(() => {
                        const providerServices = services.filter(service => service.provider_id === provider.id);
                        if (providerServices.length === 0) return "Service provider";
                        const serviceNames = providerServices.slice(0, 2).map(s => s.name).join(", ");
                        return providerServices.length > 2 ? `${serviceNames} & more` : serviceNames;
                      })()}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/providers/${provider.id}`}
                        className="text-teal-600 font-medium hover:text-teal-700"
                      >
                        View Profile
                      </Link>
                      <span className="text-sm text-gray-500">
                        {(() => {
                          const providerServices = services.filter(service => service.provider_id === provider.id);
                          return `${providerServices.length} service${providerServices.length !== 1 ? 's' : ''}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination - only show if not searching and there are providers */}
        {!showSearchResults && displayedProviders.length > 0 && !loading && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-1">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-white bg-teal-600">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Join as provider CTA */}
      <div className="bg-teal-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Are You a Pet Care Professional?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our network of providers and connect with pet owners in your area
          </p>
          <Link
            to="/providers/join"
            className="px-6 py-3 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 transition-colors"
          >
            Join as a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Providers; 