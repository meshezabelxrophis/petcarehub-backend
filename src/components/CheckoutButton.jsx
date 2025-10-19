import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CheckoutButton = ({ 
  serviceName, 
  price, 
  serviceId, 
  className = "",
  disabled = false,
  children 
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleBookService = () => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.accountType !== 'petOwner' && currentUser.role !== 'petOwner') {
      alert('Only pet owners can book services.');
    } else {
      navigate(`/book-service/${serviceId}`);
    }
  };

  return (
    <button
      onClick={handleBookService}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center px-6 py-3 
        bg-gradient-to-r from-teal-600 to-teal-700 
        hover:from-teal-700 hover:to-teal-800 
        text-white font-medium rounded-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:from-teal-600 disabled:hover:to-teal-700
        shadow-md hover:shadow-lg
        ${className}
      `}
    >
      {children || (
        <>
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v8m6-8v8M5 7h14M5 15h14" 
            />
          </svg>
          Book Now
        </>
      )}
    </button>
  );
};

export default CheckoutButton;
