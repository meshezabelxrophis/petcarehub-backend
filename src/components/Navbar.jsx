import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout as firebaseLogout } from "../services/authService";
import { IoMdPaw } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { currentUser, isPetOwner, isServiceProvider } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="bg-white border-b border-gray-100 py-3 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="inline-flex items-center justify-center bg-white rounded-full border-2 border-teal-600 shadow-md p-1">
                <IoMdPaw size={20} className="text-teal-600 sm:w-6 sm:h-6" />
              </span>
              <span className="ml-2 text-xl sm:text-2xl font-bold text-teal-600">
                <span className="hidden sm:inline">PetCare Hub</span>
                <span className="sm:hidden">PetCare</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/services" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">Services</Link>
            <Link to="/providers" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">Providers</Link>
            <Link to="/smart-collars" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">Smart Collars</Link>
            
            {isPetOwner && (
              <>
                <Link to="/my-pets" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">My Pets</Link>
                <Link to="/clinics" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">Find Clinics</Link>
              </>
            )}
            
            {isServiceProvider && (
              <>
                <Link to="/dashboard" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">Dashboard</Link>
                <Link to="/my-services" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">My Services</Link>
              </>
            )}
            
            <Link to="/about" className="font-medium text-gray-700 hover:text-teal-600 transition-colors">About</Link>
          </nav>
          
          {/* Right side: Notifications, User Menu, Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
          {currentUser ? (
            <>
              {/* Notification Bell - Hidden on smallest screens */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
              
              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-teal-600 focus:outline-none"
                >
                  <span className="font-medium text-sm sm:text-base">
                    <span className="hidden md:inline">{currentUser.name}</span>
                    <span className="md:hidden">{currentUser.name.split(' ')[0]}</span>
                    <span className="ml-1 text-xs text-gray-500 hidden lg:inline">
                      {isPetOwner ? '(Pet Owner)' : isServiceProvider ? '(Provider)' : ''}
                    </span>
                  </span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
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
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-teal-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border border-teal-600 text-teal-600 text-sm sm:text-base font-medium hover:bg-teal-50 transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-teal-600 text-white text-sm sm:text-base font-medium hover:bg-teal-700 transition-colors">
                Sign Up
              </Link>
              
              {/* Mobile Menu Button for non-logged in users */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-teal-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </button>
            </>
          )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/services" 
                className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/providers" 
                className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Providers
              </Link>
              <Link 
                to="/smart-collars" 
                className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Smart Collars
              </Link>
              
              {isPetOwner && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    to="/my-pets" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🐾 My Pets
                  </Link>
                  <Link 
                    to="/track-my-pet" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📍 Track My Pet
                  </Link>
                  <Link 
                    to="/disease-predictor" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🏥 Disease Predictor
                  </Link>
                  <Link 
                    to="/clinics" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🏥 Find Clinics
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📅 My Bookings
                  </Link>
                </>
              )}
              
              {isServiceProvider && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    to="/dashboard" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link 
                    to="/my-services" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⚙️ My Services
                  </Link>
                  <Link 
                    to="/manage-bookings" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📋 Manage Bookings
                  </Link>
                  <Link 
                    to="/service-analytics" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📈 Analytics
                  </Link>
                </>
              )}
              
              <div className="border-t border-gray-100 my-2"></div>
              <Link 
                to="/about" 
                className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {currentUser && (
                <>
                  <Link 
                    to="/profile" 
                    className="font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  
                  {/* Mobile Notification Bell */}
                  <div className="sm:hidden px-3 py-2">
                    <NotificationBell />
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar; 