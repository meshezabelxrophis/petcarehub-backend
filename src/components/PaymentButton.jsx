import React, { useState } from 'react';

const PaymentButton = ({ 
  booking, 
  className = "",
  disabled = false,
  onPaymentInitiated
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!booking.service_name || !booking.price) {
      setError('Service name and price are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating checkout session for booking:', booking);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: booking.service_name,
          price: parseFloat(booking.price),
          serviceId: booking.service_id,
          bookingId: booking.id,
          userId: booking.pet_owner_id,
          currency: 'usd'
        }),
      });

      console.log('Checkout response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { url, sessionId } = await response.json();
      console.log('Checkout session created:', { sessionId, url });

      if (url) {
        // Store session ID in localStorage for later reference
        localStorage.setItem('stripe_session_id', sessionId);
        localStorage.setItem('checkout_service_name', booking.service_name);
        localStorage.setItem('checkout_booking_id', booking.id);
        
        // Call callback if provided
        if (onPaymentInitiated) {
          onPaymentInitiated(booking.id, sessionId);
        }
        
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to create payment session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={disabled || loading || booking.payment_status === 'paid'}
        className={`
          relative inline-flex items-center justify-center px-4 py-2 
          bg-gradient-to-r from-green-600 to-green-700 
          hover:from-green-700 hover:to-green-800 
          text-white font-medium rounded-md 
          transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:hover:from-green-600 disabled:hover:to-green-700
          shadow-sm hover:shadow-md
          text-sm
          ${className}
        `}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {booking.payment_status === 'paid' ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Paid
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {loading ? 'Processing...' : `Pay $${parseFloat(booking.price || 0).toFixed(2)}`}
            </>
          )}
        </span>
      </button>

      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
