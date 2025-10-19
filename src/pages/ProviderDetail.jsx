import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/backend";

function ProviderDetail() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch provider details
        const providerRes = await fetch(API_ENDPOINTS.USER_BY_ID(providerId));
        if (!providerRes.ok) throw new Error("Failed to fetch provider details");
        const providerData = await providerRes.json();
        setProvider(providerData);
        
        // Fetch provider profile
        const profileRes = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(providerId));
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProviderProfile(profileData);
        }
        
        // Fetch provider services
        const servicesRes = await fetch(`${API_ENDPOINTS.SERVICES}?provider_id=${providerId}`);
        if (!servicesRes.ok) throw new Error("Failed to fetch provider services");
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      } catch (err) {
        console.error("Error fetching provider details:", err);
        setError("Failed to load provider details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderDetails();
  }, [providerId]);
  
  const formatBusinessHours = (businessHours) => {
    if (!businessHours) return "Not available";
    
    try {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      return days.map(day => {
        const dayHours = businessHours[day];
        if (!dayHours || !dayHours.isOpen) {
          return <div key={day} className="flex justify-between"><span className="capitalize">{day}:</span> <span className="text-red-600">Closed</span></div>;
        }
        return <div key={day} className="flex justify-between"><span className="capitalize">{day}:</span> <span>{dayHours.open} - {dayHours.close}</span></div>;
      });
    } catch (e) {
      return "Not available";
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading provider details...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : provider ? (
        <div>
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-teal-600 hover:text-teal-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Providers
            </button>
          </div>
          
          {/* Show special message for authenticated users */}
          {currentUser && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">You are viewing this provider as {currentUser.name}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Provider Info */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-4xl mb-4">
                      {provider.name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{provider.name}</h1>
                    <div className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded mt-2">
                      Service Provider
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Contact Information</h2>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Email:</span> {provider.email}
                    </p>
                    {providerProfile && providerProfile.phone && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Phone:</span> {providerProfile.phone}
                      </p>
                    )}
                    {providerProfile && providerProfile.address && (
                      <p className="text-gray-600">
                        <span className="font-medium">Address:</span> {providerProfile.address}
                      </p>
                    )}
                  </div>
                  
                  {providerProfile && providerProfile.bio && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">About</h2>
                      <p className="text-gray-600">{providerProfile.bio}</p>
                    </div>
                  )}
                  
                  {providerProfile && providerProfile.business_hours && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">Business Hours</h2>
                      <div className="text-gray-600 space-y-1">
                        {formatBusinessHours(providerProfile.business_hours)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Services Offered</h2>
                  
                  {services.length === 0 ? (
                    <p className="text-gray-600">No services available from this provider.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {services.map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <h3 className="text-xl font-bold mb-2 text-gray-800">{service.name}</h3>
                          <p className="text-gray-600 mb-4">{service.description || "No description available."}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-teal-600">${service.price}</span>
                            <Link
                              to={`/services/${service.id}`}
                              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Provider not found.</p>
          <button
            onClick={() => navigate('/providers')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Browse All Providers
          </button>
        </div>
      )}
    </div>
  );
}

export default ProviderDetail; 