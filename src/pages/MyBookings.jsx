import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import PaymentButton from "../components/PaymentButton";
import { API_ENDPOINTS } from "../config/backend";

function MyBookings() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Check for new booking notification from location state
  useEffect(() => {
    if (location.state?.newBooking) {
      // Set success message when a new booking is made
      setSuccess(`Booking successfully created and sent to ${location.state.providerName || "the provider"}. They will contact you shortly.`);
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);
      
      // Trigger a refresh when a new booking is detected
      setRefreshKey(prev => prev + 1);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const userId = currentUser.id;
        
        console.log("Fetching bookings for user ID:", userId);
        const res = await fetch(API_ENDPOINTS.PET_OWNER_BOOKINGS(userId));
        
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        
        const data = await res.json();
        console.log("Fetched bookings:", data); // Debug logging
        
        // Filter out bookings with missing critical data (dummy data)
        const validBookings = data.filter(booking => 
          booking.service_name && 
          booking.service_name !== "Unknown Service" &&
          booking.provider_name &&
          booking.provider_name !== "Unknown Provider"
        );
        
        setBookings(validBookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [currentUser, refreshKey]);
  
  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "cancelled" })
      });
      
      if (!res.ok) {
        throw new Error("Failed to cancel booking");
      }
      
      // Update the booking status in the UI
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
      ));
      
      setSuccess("Booking cancelled successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again later.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }
      
      // Remove the booking from the UI
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      setSuccess("Booking deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking. Please try again later.");
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
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

  const getActionText = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Awaiting Service";
      case "pending":
        return "Cancel";
      case "cancelled":
        return "Delete";
      case "completed":
        return "Delete";
      default:
        return "";
    }
  };

  const isActionClickable = (status) => {
    return ["pending", "cancelled", "completed"].includes(status.toLowerCase());
  };

  const handlePaymentInitiated = (bookingId, sessionId) => {
    // Update the booking to show payment is in progress
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, payment_status: 'processing', stripe_session_id: sessionId } 
        : booking
    ));
  };

  const clearNotifications = () => {
    setError("");
    setSuccess("");
  };
  
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">My Bookings</h1>
        {(error || success) && (
          <button
            onClick={clearNotifications}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
          >
            Clear Notifications
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      ) : bookings && bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-lg text-gray-600">You don't have any bookings yet.</p>
          <a 
            href="/providers" 
            className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Find Service Providers
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.service_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.provider_name}</div>
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
                        booking.pet_name || (booking.pet_names && booking.pet_names[0]) || 'Unknown'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.booking_date && new Date(booking.booking_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status || "pending")}`}>
                      {booking.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.total_price ? (
                        <div>
                          <div className="font-semibold">${booking.total_price.toFixed(2)}</div>
                          {booking.number_of_pets > 1 && (
                            <div className="text-xs text-gray-600">
                              ${booking.base_price} × {booking.number_of_pets}
                            </div>
                          )}
                        </div>
                      ) : (
                        `$${booking.price || "0.00"}`
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.payment_status === 'paid' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    ) : booking.status === 'confirmed' ? (
                      <PaymentButton 
                        booking={booking}
                        onPaymentInitiated={handlePaymentInitiated}
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        {booking.status === 'pending' ? 'Awaiting confirmation' : 'Not payable'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isActionClickable(booking.status) ? (
                      <button
                        onClick={() => {
                          if (booking.status.toLowerCase() === "pending") {
                            handleCancelBooking(booking.id);
                          } else {
                            handleDeleteBooking(booking.id);
                          }
                        }}
                        className={booking.status.toLowerCase() === "pending" ? "text-yellow-600 hover:text-yellow-900" : "text-red-600 hover:text-red-900"}
                      >
                        {getActionText(booking.status)}
                      </button>
                    ) : (
                      <span className="text-gray-500">
                        {getActionText(booking.status)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyBookings; 