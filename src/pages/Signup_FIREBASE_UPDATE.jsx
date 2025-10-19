// ============================================================================
// UPDATED handleSubmit function with Firebase Auth
// Replace lines 146-209 in Signup.jsx with this:
// ============================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    // Only block submission for critical errors (not location warning)
    const criticalErrors = {...formErrors};
    if (criticalErrors.location && criticalErrors.location.includes("help customers find")) {
      delete criticalErrors.location; // Don't block submission for location warning
    }
    
    if (Object.keys(criticalErrors).length > 0) {
      setErrors(formErrors); // Show all errors including warnings
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      console.log('🔐 Signing up with Firebase Auth...');
      
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const role = formData.accountType;
      
      // Prepare additional data for service providers
      const additionalData = {};
      if (role === 'serviceProvider') {
        additionalData.address = formData.address;
        additionalData.phone = formData.phone;
        additionalData.bio = formData.bio;
        if (formData.latitude && formData.longitude) {
          additionalData.location = {
            latitude: formData.latitude,
            longitude: formData.longitude
          };
        }
      }
      
      // Sign up with Firebase Auth
      const userData = await signUpWithEmail(
        formData.email,
        formData.password,
        fullName,
        role,
        additionalData
      );
      
      console.log('✅ Sign up successful:', userData);
      
      // Update auth context
      login(userData);
      
      // Show success message
      alert('Account created successfully!');
      
      // Redirect based on role
      if (role === 'serviceProvider') {
        navigate('/service-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('❌ Sign up error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to create account. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

// ============================================================================
// NEW handleGoogleSignup function
// Add this after handleSubmit:
// ============================================================================

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('🔐 Signing up with Google...');
      
      // For Google sign-in, use the selected account type
      const role = formData.accountType;
      
      const userData = await signInWithGoogle(role);
      
      console.log('✅ Google sign up successful:', userData);
      
      // Update auth context
      login(userData);
      
      // Redirect based on role
      if (role === 'serviceProvider') {
        navigate('/service-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('❌ Google sign up error:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to sign up with Google. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

// ============================================================================
// Update Google button onClick (around line 610)
// Change from: onClick={() => alert("Google signup coming soon!")}
// To:          onClick={handleGoogleSignup}
// ============================================================================

// Also update the submit button disabled prop (around line 550):
// Change from: disabled={false}
// To:          disabled={isSubmitting}

// And add loading state to button text:
// Change the button content to show loading state:
/*
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Creating Account...
    </>
  ) : (
    'Create Account'
  )}
</button>
*/







