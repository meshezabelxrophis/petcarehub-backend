import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, ChevronDown, Filter } from "lucide-react";
import { useForm } from "react-hook-form";

function Providers() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Use React Hook Form to manage form inputs
  const { register, handleSubmit } = useForm({
    defaultValues: {
      searchTerm: "",
      searchLocation: ""
    }
  });

  // Sample providers data
  const providers = [
    {
      id: 1,
      name: "PawPerfect Salon",
      category: "Grooming",
      rating: 4.8,
      reviews: 124,
      location: "Islamabad",
      distance: "2.3 km",
      image: "/placeholder.svg",
      featured: true,
      services: ["Bathing", "Nail Trimming", "Haircut", "Teeth Cleaning"],
      description: "Professional grooming services for all breeds with premium products."
    },
    {
      id: 2,
      name: "PetHealth Clinic",
      category: "Veterinary",
      rating: 4.9,
      reviews: 218,
      location: "Lahore",
      distance: "3.5 km",
      image: "/placeholder.svg",
      featured: true,
      services: ["Check-ups", "Vaccinations", "Surgery", "Emergency Care"],
      description: "Full-service veterinary clinic with experienced doctors and modern facilities."
    },
    {
      id: 3,
      name: "Good Boy Academy",
      category: "Training",
      rating: 4.7,
      reviews: 86,
      location: "Karachi",
      distance: "4.2 km",
      image: "/placeholder.svg",
      featured: false,
      services: ["Basic Obedience", "Behavior Modification", "Agility Training"],
      description: "Expert dog trainers specializing in positive reinforcement techniques."
    },
    {
      id: 4,
      name: "Happy Tails Pet Sitting",
      category: "Pet Sitting",
      rating: 4.6,
      reviews: 92,
      location: "Islamabad",
      distance: "1.8 km",
      image: "/placeholder.svg",
      featured: false,
      services: ["In-home Sitting", "Overnight Care", "Daily Visits"],
      description: "Reliable pet sitters who provide personalized care in your home."
    },
    {
      id: 5,
      name: "WalkiePaws",
      category: "Dog Walking",
      rating: 4.5,
      reviews: 74,
      location: "Lahore",
      distance: "2.7 km",
      image: "/placeholder.svg",
      featured: false,
      services: ["Individual Walks", "Group Walks", "Puppy Walks"],
      description: "Professional dog walkers providing regular exercise for your canine companions."
    },
    {
      id: 6,
      name: "Luxury Pet Hotel",
      category: "Boarding",
      rating: 4.8,
      reviews: 112,
      location: "Karachi",
      distance: "5.1 km",
      image: "/placeholder.svg",
      featured: true,
      services: ["Luxury Suites", "Playtime", "Grooming", "Webcam Access"],
      description: "Upscale boarding facility with spacious accommodations and 24/7 care."
    }
  ];

  // Filter categories
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "grooming", name: "Grooming" },
    { id: "veterinary", name: "Veterinary" },
    { id: "training", name: "Training" },
    { id: "sitting", name: "Pet Sitting" },
    { id: "walking", name: "Dog Walking" },
    { id: "boarding", name: "Boarding" }
  ];

  // Search submit handler
  const onSubmit = (data) => {
    const term = data.searchTerm.toLowerCase();
    const location = data.searchLocation.toLowerCase();
    
    let results = providers;
    
    // Filter by search term
    if (term) {
      results = results.filter(provider => 
        provider.name.toLowerCase().includes(term) || 
        provider.category.toLowerCase().includes(term) || 
        provider.description.toLowerCase().includes(term) ||
        provider.services.some(service => service.toLowerCase().includes(term))
      );
    }
    
    // Filter by location
    if (location) {
      results = results.filter(provider => 
        provider.location.toLowerCase().includes(location)
      );
    }
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Clear search results
  const clearSearch = () => {
    setShowSearchResults(false);
  };

  // Get the providers to display based on search state and category filter
  const getDisplayedProviders = () => {
    if (showSearchResults) {
      return searchResults;
    } else {
      return activeFilter === "all" 
        ? providers 
        : providers.filter(provider => provider.category.toLowerCase() === activeFilter);
    }
  };

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

          {/* Search bar */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-4 shadow-md flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search providers..."
                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                {...register("searchTerm")}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Your location"
                className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                {...register("searchLocation")}
              />
            </div>
            <button 
              type="submit"
              className="bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search results header or filters */}
        {showSearchResults ? (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
            <button 
              className="flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-teal-600 hover:text-teal-700"
              onClick={clearSearch}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === category.id
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
            
            <button className="ml-auto flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Filter size={16} className="mr-2" />
              More Filters
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-gray-600 mb-6">
          {displayedProviders.length} providers found
          {showSearchResults && searchResults.length === 0 && (
            <span className="ml-2 text-red-500">
              No results match your search criteria. Try different terms or clear your search.
            </span>
          )}
        </p>

        {/* Providers grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  src={provider.image} 
                  alt={provider.name}
                  className="w-full h-48 object-cover"
                />
                {provider.featured && (
                  <div className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{provider.name}</h3>
                  <span className="flex items-center bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-medium">
                    {provider.category}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-700 ml-1 font-medium">{provider.rating}</span>
                  <span className="text-gray-500 ml-1">({provider.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-1" />
                  <span>{provider.location} • {provider.distance}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{provider.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link
                    to={`/providers/${provider.id}`}
                    className="text-teal-600 font-medium hover:text-teal-700"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/providers/${provider.id}/book`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - only show if not searching and there are providers */}
        {!showSearchResults && displayedProviders.length > 0 && (
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