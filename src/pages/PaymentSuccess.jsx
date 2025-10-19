import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!sessionId) {
        setError('No payment session found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payment-status/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPaymentDetails(data);

        // Clear stored session data
        localStorage.removeItem('stripe_session_id');
        localStorage.removeItem('checkout_service_name');

      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/services');
  };

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {error ? (
          // Error State
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            
            <button
              onClick={handleContinue}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Back to Services
            </button>
          </div>
        ) : (
          // Success State
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Payment Successful! 🎉
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-8"
            >
              Thank you for your payment. Your booking has been confirmed and you'll receive a confirmation email shortly.
            </motion.p>

            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-50 rounded-lg p-6 mb-8 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{paymentDetails.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {paymentDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm text-gray-500">
                      {paymentDetails.sessionId.substring(0, 20)}...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleViewBookings}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={handleContinue}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Browse More Services
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;