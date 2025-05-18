import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple paw print logo */}
              <path 
                d="M9 7.2C10.2 7.2 11.2 6.2 11.2 5C11.2 3.8 10.2 2.8 9 2.8C7.8 2.8 6.8 3.8 6.8 5C6.8 6.2 7.8 7.2 9 7.2Z" 
                fill="#0D9488" 
              />
              <path 
                d="M23 7.2C24.2 7.2 25.2 6.2 25.2 5C25.2 3.8 24.2 2.8 23 2.8C21.8 2.8 20.8 3.8 20.8 5C20.8 6.2 21.8 7.2 23 7.2Z" 
                fill="#0D9488" 
              />
              <path 
                d="M6 16.5C7.7 16.5 9 15.2 9 13.5C9 11.8 7.7 10.5 6 10.5C4.3 10.5 3 11.8 3 13.5C3 15.2 4.3 16.5 6 16.5Z" 
                fill="#0D9488" 
              />
              <path 
                d="M26 16.5C27.7 16.5 29 15.2 29 13.5C29 11.8 27.7 10.5 26 10.5C24.3 10.5 23 11.8 23 13.5C23 15.2 24.3 16.5 26 16.5Z" 
                fill="#0D9488" 
              />
              <path 
                d="M16 29C19.9 29 23 25.9 23 22C23 18.1 19.9 15 16 15C12.1 15 9 18.1 9 22C9 25.9 12.1 29 16 29Z" 
                fill="#0D9488" 
                fillOpacity="0.2" 
              />
            </svg>
            <span className="ml-2 text-2xl font-bold text-teal-600">PetCare Hub</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="font-medium text-gray-700 hover:text-teal-600">Services</Link>
          <Link to="/providers" className="font-medium text-gray-700 hover:text-teal-600">Providers</Link>
          <Link to="/smart-collars" className="font-medium text-gray-700 hover:text-teal-600">Smart Collars</Link>
          <Link to="/about" className="font-medium text-gray-700 hover:text-teal-600">About Us</Link>
          <Link to="/contact" className="font-medium text-gray-700 hover:text-teal-600">Contact</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-4 py-2 rounded-md border border-teal-600 text-teal-600 font-medium hover:bg-teal-50">
            Log In
          </Link>
          <Link to="/signup" className="px-4 py-2 rounded-md bg-teal-600 text-white font-medium hover:bg-teal-700">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar; 