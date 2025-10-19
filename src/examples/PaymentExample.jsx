/**
 * Example: Payment Processing with Stripe
 * 
 * This component demonstrates how to:
 * 1. Create a booking in Firebase Firestore
 * 2. Process payment via Vercel backend (Stripe)
 * 3. Handle payment confirmation
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/firestoreService';
import { processPayment, confirmPayment } from '../services/paymentService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function CheckoutForm({ bookingData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create booking in Firebase
      const bookingId = await createBooking({
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        petId: bookingData.petId,
        scheduledDate: bookingData.scheduledDate,
        price: bookingData.price
      });

      console.log('✅ Booking created:', bookingId);

      // Step 2: Process payment via Vercel (creates Stripe payment intent)
      const payment = await processPayment({
        bookingId,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        amount: bookingData.price,
        userId: currentUser.uid
      });

      console.log('✅ Payment intent created');

      // Step 3: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        payment.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 4: Confirm payment in our system
      await confirmPayment(paymentIntent.id, bookingId);

      console.log('✅ Payment confirmed');
      onSuccess({ bookingId, paymentIntent });

    } catch (error) {
      console.error('❌ Payment failed:', error);
      setError(error.message);
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Payment Details</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Service:</strong> {bookingData.serviceName}</p>
          <p><strong>Amount:</strong> ${bookingData.price.toFixed(2)}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: processing ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: processing ? 'not-allowed' : 'pointer'
          }}
        >
          {processing ? 'Processing...' : `Pay $${bookingData.price.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function PaymentExample() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [bookingData] = useState({
    serviceId: 'service_123',
    serviceName: 'Premium Dog Grooming',
    petId: 'pet_456',
    scheduledDate: '2025-10-25',
    price: 50.00
  });

  const handleSuccess = ({ bookingId, paymentIntent }) => {
    alert(`Payment successful! Booking ID: ${bookingId}`);
    setShowCheckout(false);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h2>Payment Example</h2>
      
      {!showCheckout ? (
        <div>
          <h3>Service Details</h3>
          <p><strong>Service:</strong> {bookingData.serviceName}</p>
          <p><strong>Price:</strong> ${bookingData.price.toFixed(2)}</p>
          
          <button
            onClick={() => setShowCheckout(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Book & Pay Now
          </button>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingData={bookingData}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Elements>
      )}
    </div>
  );
}

