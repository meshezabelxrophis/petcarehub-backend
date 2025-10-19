import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

const ServiceDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/bookings/provider/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setMessage("Error fetching bookings: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.account_type === 'serviceProvider') {
      fetchBookings();
    }
  }, [currentUser?.id]);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      setMessage(`Error: ${err.message}`);
    }
  };

  const simulatePayment = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: 500,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Payment processing failed");
      }
      
      const data = await res.json();
      setMessage(data.message || "Payment processed successfully");
      
      // Update booking status to completed
      await updateBookingStatus(bookingId, "completed");
    } catch (err) {
      setMessage("Payment failed: " + err.message);
    }
  };

  if (!currentUser || currentUser.account_type !== 'serviceProvider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          Access denied. This page is only for service providers.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2 text-center">Service Provider Dashboard</h1>
          <p className="text-center text-gray-600 mb-6">
            Welcome, {currentUser?.name}! Account Type: <strong>serviceProvider</strong>
          </p>
          
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.pet_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.owner_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => simulatePayment(booking.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Simulate Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard; 