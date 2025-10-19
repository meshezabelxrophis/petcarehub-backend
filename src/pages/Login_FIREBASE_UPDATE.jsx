// ============================================================================
// Firebase Auth Login Update
// This file shows how to update Login.jsx for Firebase Authentication
// ============================================================================

// 1. Add these imports at the top:
import { signInWithEmail, signInWithGoogle } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// 2. Add these hooks in the component:
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // ... existing state ...
  const [isLoading, setIsLoading] = useState(false);
  
  // 3. Replace the handleSubmit function with this:
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Signing in with Firebase Auth...');
      
      // Sign in with Firebase Auth
      const userData = await signInWithEmail(email, password);
      
      console.log('✅ Sign in successful:', userData);
      
      // Update auth context
      login(userData);
      
      // Redirect based on role
      if (userData.role === 'serviceProvider' || userData.account_type === 'serviceProvider') {
        navigate('/service-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 4. Add this new function for Google login:
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Signing in with Google...');
      
      // For login, use petOwner as default (can be changed in profile later)
      const userData = await signInWithGoogle('petOwner');
      
      console.log('✅ Google sign in successful:', userData);
      
      // Update auth context
      login(userData);
      
      // Redirect based on role
      if (userData.role === 'serviceProvider' || userData.account_type === 'serviceProvider') {
        navigate('/service-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 5. Update the login button:
  /*
  <button
    type="submit"
    disabled={isLoading}
    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing in...
      </>
    ) : (
      'Sign in'
    )}
  </button>
  */
  
  // 6. Update Google login button:
  // Change from: onClick={() => alert("Google login coming soon!")}
  // To:          onClick={handleGoogleLogin}
  
  // 7. Add password reset functionality (optional):
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      const { resetPassword } = await import("../services/authService");
      await resetPassword(email);
      alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to send password reset email');
    }
  };
  
  // Then add a "Forgot Password?" link in the form:
  /*
  <div className="text-sm text-right">
    <button
      type="button"
      onClick={handleForgotPassword}
      className="font-medium text-teal-600 hover:text-teal-500"
    >
      Forgot your password?
    </button>
  </div>
  */
}

// ============================================================================
// Complete example of updated Login component structure:
// ============================================================================

/*
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    // ... (see above)
  };

  const handleGoogleLogin = async () => {
    // ... (see above)
  };

  const handleForgotPassword = async () => {
    // ... (see above)
  };

  return (
    // ... your existing JSX with updated onClick handlers
  );
}

export default Login;
*/







