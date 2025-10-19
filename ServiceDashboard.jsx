import React, { useState, useEffect } from 'react';

const ServiceDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/provider/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setBookings(data);
    };

    fetchBookings();
  }, [user.id]);

  const simulatePayment = async (bookingId) => {
    const token = localStorage.getItem("token");
    try {
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
      const data = await res.json();
      setMessage(data.message || JSON.stringify(data));
    } catch (err) {
      setMessage("Payment failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Service Provider Dashboard</h1>
        <p className="text-center text-gray-600 mb-6">
          Welcome, {user?.name}! Role: <strong>{user?.role}</strong>
        </p>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-500">No bookings found.</p>
        ) : (
          <table className="w-full text-left border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 border">Booking ID</th>
                <th className="px-3 py-2 border">Pet</th>
                <th className="px-3 py-2 border">Owner</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-3 py-2 border">{booking.id}</td>
                  <td className="px-3 py-2 border">{booking.pet_name}</td>
                  <td className="px-3 py-2 border">{booking.owner_name}</td>
                  <td className="px-3 py-2 border">{booking.status}</td>
                  <td className="px-3 py-2 border">
                    <button
                      onClick={() => simulatePayment(booking.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Simulate Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
      </div>
    </div>
  );
};

export default ServiceDashboard;
