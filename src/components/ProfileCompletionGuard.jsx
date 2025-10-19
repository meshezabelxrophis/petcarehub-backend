import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/backend';

const ProfileCompletionGuard = ({ children, action = "access this feature" }) => {
  const { currentUser, isServiceProvider } = useAuth();
  const [profileComplete, setProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isServiceProvider || !currentUser) {
      setLoading(false);
      return;
    }

    const checkProfileCompletion = async () => {
      try {
        console.log('Checking profile completion for user ID:', currentUser.id);
        const response = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(currentUser.id));
        console.log('Profile API response status:', response.status);
        
        if (!response.ok) {
          console.log('Profile not found or incomplete - status:', response.status);
          if (response.status === 404) {
            console.log('No profile exists for this provider. They need to create one first.');
          }
          setProfileComplete(false);
          setLoading(false);
          return;
        }

        const profile = await response.json();
        console.log('Profile data:', profile);
        
        // Check if essential fields are filled with actual content
        const isComplete = profile.phone && profile.phone.trim() !== '' &&
                          profile.address && profile.address.trim() !== '' &&
                          profile.bio && profile.bio.trim() !== '' &&
                          profile.business_hours &&
                          Object.keys(profile.business_hours).length > 0;
        
        console.log('Profile completion check:', {
          phone: profile.phone,
          address: profile.address,
          business_hours: profile.business_hours,
          bio: profile.bio,
          phoneExists: !!profile.phone,
          addressExists: !!profile.address,
          business_hoursExists: !!profile.business_hours,
          bioExists: !!profile.bio,
          isComplete
        });
        
        setProfileComplete(isComplete);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [currentUser, isServiceProvider]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isServiceProvider || profileComplete) {
    return children;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mb-6">
        <svg className="mx-auto h-16 w-16 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Profile Setup Required
      </h2>
      
      <p className="text-gray-600 mb-6">
        You need to set up your provider profile before you can {action}.
      </p>
      
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 text-left">
        <h3 className="font-medium text-orange-800 mb-2">Required Information:</h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Phone number</li>
          <li>• Business address</li>
          <li>• Business hours</li>
          <li>• Bio/description</li>
        </ul>
        <p className="text-xs text-orange-600 mt-2">
          Complete your profile to start offering services and managing bookings.
        </p>
      </div>
      
      <Link
        to="/profile"
        className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Set Up Profile
      </Link>
    </div>
  );
};

export default ProfileCompletionGuard;
