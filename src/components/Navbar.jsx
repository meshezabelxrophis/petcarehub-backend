import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout as firebaseLogout } from "../services/authService";
import { IoMdPaw } from "react-icons/io";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { currentUser, isPetOwner, isServiceProvider } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      await firebaseLogout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="inline-flex items-center justify-center bg-white rounded-full border-2 border-teal-600 shadow-md p-1">
              <IoMdPaw size={24} className="text-teal-600" />
            </span>
            <span className="ml-2 text-2xl font-bold text-teal-600">PetCare Hub</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/services" className="font-medium text-gray-700 hover:text-teal-600">Services</Link>
          <Link to="/providers" className="font-medium text-gray-700 hover:text-teal-600">Providers</Link>
          <Link to="/smart-collars" className="font-medium text-gray-700 hover:text-teal-600">Smart Collars</Link>
          
          {isPetOwner && (
            <>
              <Link to="/my-pets" className="font-medium text-gray-700 hover:text-teal-600">My Pets</Link>
              <Link to="/clinics" className="font-medium text-gray-700 hover:text-teal-600">Find Clinics</Link>
            </>
          )}
          
          {isServiceProvider && (
            <>
              <Link to="/dashboard" className="font-medium text-gray-700 hover:text-teal-600">Dashboard</Link>
              <Link to="/my-services" className="font-medium text-gray-700 hover:text-teal-600">My Services</Link>
            </>
          )}
          
          <Link to="/about" className="font-medium text-gray-700 hover:text-teal-600">About</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />
              
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 focus:outline-none"
                >
                <span className="font-medium">
                  {currentUser.name}
                  <span className="ml-1 text-xs text-gray-500">
                    {isPetOwner ? '(Pet Owner)' : isServiceProvider ? '(Provider)' : ''}
                  </span>
                </span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  
                  {isPetOwner && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link 
                        to="/my-bookings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📅 My Bookings
                      </Link>
                      <Link 
                        to="/track-my-pet" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📍 Track My Pet
                      </Link>
                      <Link 
                        to="/disease-predictor" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🏥 Disease Predictor
                      </Link>
                    </>
                  )}
                  
                  {isServiceProvider && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link 
                        to="/manage-bookings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📋 Manage Bookings
                      </Link>
                      <Link 
                        to="/service-analytics" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        📈 Analytics
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md border border-teal-600 text-teal-600 font-medium hover:bg-teal-50">
                Log In
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar; 