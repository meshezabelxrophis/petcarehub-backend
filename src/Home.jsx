import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Calendar, PawPrint, Search, 
  Scissors, Stethoscope, Award, Home as HomeIcon, Activity, Hotel,
  Video, Bell, MapPin as MapPinIcon } from "lucide-react";
import ServiceCard from "./components/ServiceCard";
import TestimonialCard from "./components/TestimonialCard";
import FeatureCard from "./components/FeatureCard";
import Button from "./components/Button";
import { API_ENDPOINTS } from "./config/backend";

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setMessage('Login successful!');
      if (res.data.account_type === 'serviceProvider') {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessage('Logged out');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Login
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Home; 