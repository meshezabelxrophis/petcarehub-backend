import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddServiceForm from '../components/AddServiceForm';
import ProfileCompletionGuard from '../components/ProfileCompletionGuard';
import ServiceAddedAnimation from '../components/ServiceAddedAnimation';
import ServiceRemovedAnimation from '../components/ServiceRemovedAnimation';
import AnimatedConfirmDialog from '../components/AnimatedConfirmDialog';
import { API_ENDPOINTS } from '../config/backend';

const ServiceDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Animation states
  const [showServiceAddedAnimation, setShowServiceAddedAnimation] = useState(false);
  const [lastAddedServiceName, setLastAddedServiceName] = useState("");
  const [showServiceRemovedAnimation, setShowServiceRemovedAnimation] = useState(false);
  const [lastRemovedServiceName, setLastRemovedServiceName] = useState("");

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

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

  // Function to navigate to profile page
  // eslint-disable-next-line no-unused-vars
  const goToProfile = () => {
    navigate('/profile');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        if (!currentUser || !currentUser.id) {
          console.error("❌ No current user found! User must be logged in to view dashboard.");
          console.log("currentUser:", currentUser);
          setMessage("Please log in to view your dashboard");
          setLoading(false);
          return;
        }

        const providerId = currentUser.id;
        console.log("✅ Logged in as provider:", providerId, currentUser.name);
        console.log("📞 Fetching bookings for provider ID:", providerId);
        
        // Fetch bookings
        const bookingsRes = await fetch(API_ENDPOINTS.PROVIDER_BOOKINGS(providerId));
        console.log("📞 Bookings response status:", bookingsRes.status, bookingsRes.statusText);
        if (!bookingsRes.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
        }
        const bookingsData = await bookingsRes.json();
        console.log("✅ Fetched bookings:", bookingsData.length, "bookings");
        console.log("Bookings data:", bookingsData);
        setBookings(bookingsData);
        
        // Fetch services
        const servicesUrl = `${API_ENDPOINTS.SERVICES}?provider_id=${providerId}`;
        console.log("📞 Fetching services from:", servicesUrl);
        const servicesRes = await fetch(servicesUrl);
        console.log("📞 Services response status:", servicesRes.status, servicesRes.statusText);
        if (!servicesRes.ok) {
          throw new Error(`Failed to fetch services: ${servicesRes.status} ${servicesRes.statusText}`);
        }
        const servicesData = await servicesRes.json();
        console.log("✅ Fetched services:", servicesData.length, "services");
        console.log("Services data:", servicesData);
        setServices(servicesData);
        
        if (servicesData.length === 0) {
          console.log("ℹ️ No services found for provider:", providerId);
          setMessage("You haven't added any services yet. Click 'Add Service' to get started!");
        }
        if (bookingsData.length === 0) {
          console.log("ℹ️ No bookings found for provider:", providerId);
        }
      } catch (err) {
        console.error("❌ Error in fetchData:", err);
        setMessage("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up periodic refresh for bookings only
    const intervalId = setInterval(async () => {
      // Only refresh bookings to prevent deleted services from reappearing
      try {
        if (!currentUser || !currentUser.id) {
          return; // Don't refresh if not logged in
        }
        const providerId = currentUser.id;
        const bookingsRes = await fetch(API_ENDPOINTS.PROVIDER_BOOKINGS(providerId));
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (err) {
        console.error("Error refreshing bookings:", err);
      }
    }, 30000); // Refresh every 30 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(API_ENDPOINTS.BOOKING_BY_ID(bookingId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update booking status to ${status}`);
      }
      
      // Update the booking in the UI
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
      
      setMessage(`Booking #${bookingId} status updated to ${status}`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating booking status:", err);
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleAddService = () => {
    setShowAddForm(true);
  };

  const handleServiceAdded = (newService) => {
    setServices([...services, newService]);
    setShowAddForm(false);
    setMessage(`Service "${newService.name}" added successfully!`);
    
    // Trigger service added animation
    setLastAddedServiceName(newService.name);
    setShowServiceAddedAnimation(true);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleDeleteService = async (serviceId) => {
    // Find the service to delete and store it for confirmation
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    
    const serviceId = serviceToDelete.id;
    const serviceName = serviceToDelete.name || "Service";
    
    console.log("Attempting to delete service with ID:", serviceId);
    
    try {
      const token = localStorage.getItem('token');
      console.log("Token:", token ? "Present" : "Missing");
      
      const deleteUrl = `/api/services/${serviceId}`;
      console.log("DELETE URL:", deleteUrl);
      
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });
      
      console.log("Delete response status:", res.status);
      console.log("Delete response headers:", Object.fromEntries(res.headers.entries()));
      
      const responseText = await res.text();
      console.log("Delete response body:", responseText);
      
      if (!res.ok) {
        let errorMessage = `Failed to delete service (${res.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Store service name for animation and trigger it
      setLastRemovedServiceName(serviceName);
      setShowServiceRemovedAnimation(true);
      
      // Immediately remove from UI
      setServices(prevServices => {
        const updatedServices = prevServices.filter(service => service.id !== serviceId);
        console.log("Services after delete:", updatedServices);
        return updatedServices;
      });
      
      setMessage(`Service "${serviceName}" deleted successfully!`);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      
    } catch (err) {
      console.error("Delete service error:", err);
      setMessage(`Error deleting service: ${err.message}`);
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setMessage("");
      }, 8000);
      
      // Close confirmation dialog even on error
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
    }
  };

  const cancelDeleteService = () => {
    setShowDeleteConfirm(false);
    setServiceToDelete(null);
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show demo mode message if not logged in as service provider
  const isDemoMode = !currentUser || (
    currentUser.account_type !== 'serviceProvider' && 
    currentUser.accountType !== 'serviceProvider' && 
    currentUser.role !== 'serviceProvider'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Service Provider Dashboard</h1>
          <p className="text-center text-gray-600 mb-6">
            Welcome, {currentUser?.name || "Adan Chug"}!
            {isDemoMode && (
              <span className="ml-2 text-yellow-600 font-medium">(Demo Mode)</span>
            )}
          </p>
          
          {isDemoMode && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You're viewing this page in demo mode. Log in as a service provider for full functionality.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {message && (
            <div className={`mb-4 p-3 rounded text-center ${
              message.includes('Error') || message.includes('Failed') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Services
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : activeTab === 'bookings' ? (
            <ProfileCompletionGuard action="manage bookings">
              {bookings && bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No bookings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                      <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.service_name || "Unknown Service"}</div>
                          <div className="text-sm text-gray-500">
                            {booking.total_price ? (
                              <div>
                                <div className="font-semibold">₨{booking.total_price.toFixed(2)}</div>
                                {booking.number_of_pets > 1 && (
                                  <div className="text-xs">
                                    ₨{booking.base_price} × {booking.number_of_pets}
                                  </div>
                                )}
                              </div>
                            ) : (
                              `₨${booking.price || "0.00"}`
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {booking.pet_names && Array.isArray(booking.pet_names) && booking.pet_names.length > 1 ? (
                              <div>
                                <span className="font-semibold">{booking.pet_names.length} pets:</span>
                                <div className="text-xs text-gray-600 mt-1">
                                  {booking.pet_names.join(', ')}
                                </div>
                              </div>
                            ) : (
                              <div>
                                {booking.pet_name || (booking.pet_names && booking.pet_names[0]) || 'Unknown Pet'}
                                {booking.pet_type && (
                                  <div className="text-xs text-gray-500">{booking.pet_type} {booking.pet_breed ? `• ${booking.pet_breed}` : ''}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.owner_name || "Unknown Owner"}</div>
                          {booking.owner_email && (
                            <div className="text-xs text-gray-500">{booking.owner_email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.booking_date && new Date(booking.booking_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.payment_status === 'paid' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(booking.status === 'pending' || !booking.status) && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </ProfileCompletionGuard>
          ) : (
            // Services Tab Content
            <ProfileCompletionGuard action="add or manage services">
            <div>
              {showAddForm ? (
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
                    <AddServiceForm 
                      providerId={currentUser?.id || 101}
                      onServiceAdded={handleServiceAdded}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">My Services</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const fetchServicesOnly = async () => {
                            try {
                              const providerId = currentUser?.id || 1;
                              const servicesRes = await fetch(`${API_ENDPOINTS.SERVICES}?provider_id=${providerId}`);
                              if (servicesRes.ok) {
                                const servicesData = await servicesRes.json();
                                setServices(servicesData);
                                setMessage("Services refreshed");
                                setTimeout(() => setMessage(""), 2000);
                              }
                            } catch (err) {
                              console.error("Error refreshing services:", err);
                            }
                          };
                          fetchServicesOnly();
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={handleAddService}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Add New Service
                      </button>
                    </div>
                  </div>
                  
                  {services.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No services found.</p>
                    </div>
                  ) : (
                    <motion.div 
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                            className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-6">
                              <h3 className="font-bold text-lg text-gray-800 mb-2">{service.name}</h3>
                              <p className="text-gray-600 mb-4">{service.description || "No description available"}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold text-teal-600">₨{service.price.toFixed(2)}</span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setMessage(`Edit functionality for ${service.name} will be implemented soon`)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log("Delete button clicked for service:", service.id, service.name);
                                      handleDeleteService(service.id);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              )}
            </div>
            </ProfileCompletionGuard>
          )}
        </div>
      </div>

      {/* Service Added Animation */}
      <ServiceAddedAnimation
        isVisible={showServiceAddedAnimation}
        onComplete={() => setShowServiceAddedAnimation(false)}
        serviceName={lastAddedServiceName}
      />

      {/* Service Removed Animation */}
      <ServiceRemovedAnimation
        isVisible={showServiceRemovedAnimation}
        onComplete={() => setShowServiceRemovedAnimation(false)}
        serviceName={lastRemovedServiceName}
      />

      {/* Animated Confirmation Dialog */}
      <AnimatedConfirmDialog
        isVisible={showDeleteConfirm}
        onConfirm={confirmDeleteService}
        onCancel={cancelDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name || 'this service'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ServiceDashboard; 