import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../config/backend";

function ServiceDetail() {
  const { serviceId, categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Validate serviceId
        if (!serviceId) {
          throw new Error("Service ID is required");
        }
        
        // Fetch service details
        const serviceRes = await fetch(API_ENDPOINTS.SERVICE_BY_ID(serviceId));
        if (!serviceRes.ok) {
          const errorData = await serviceRes.json();
          throw new Error(errorData.error || "Failed to fetch service details");
        }
        
        const serviceData = await serviceRes.json();
        setService(serviceData);
        
        // Fetch provider details
        const providerRes = await fetch(API_ENDPOINTS.USER_BY_ID(serviceData.provider_id));
        if (!providerRes.ok) {
          const errorData = await providerRes.json();
          throw new Error(errorData.error || "Failed to fetch provider details");
        }
        
        const providerData = await providerRes.json();
        setProvider(providerData);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Failed to load service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId]);
  
  const handleBookService = () => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.accountType !== 'petOwner' && currentUser.role !== 'petOwner') {
      alert('Only pet owners can book services.');
    } else {
      navigate(`/book-service/${service.id}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading service details...</p>
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
      ) : service && provider ? (
        <div>
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-teal-600 hover:text-teal-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Services
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">{service.name}</h1>
              
              <div className="flex items-center mb-6">
                <div className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {categoryId || "Service"}
                </div>
                <div className="mx-2 text-gray-300">|</div>
                <div className="text-gray-600">
                  Provided by <span className="font-medium">{provider.name}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Description</h2>
                <p className="text-gray-600">{service.description || "No description available."}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Price</h2>
                <p className="text-2xl font-bold text-teal-600">${service.price}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Provider Information</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl mr-4">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{provider.name}</p>
                    <p className="text-gray-600">{provider.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleBookService}
                  className="px-8 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
                >
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Service not found.</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Browse All Services
          </button>
        </div>
      )}
    </div>
  );
}

export default ServiceDetail; 