import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageLoader from "./components/PageLoader";
import { prefersReducedMotion, transition, applyLowPerformanceMode } from "./animations/animationConfig";
import Home from "./pages/Home";
import Services from "./pages/Services";
import PetGrooming from "./pages/PetGrooming";
import VeterinaryCare from "./pages/VeterinaryCare";
import PetTraining from "./pages/PetTraining";
import Providers from "./pages/Providers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SmartCollars from "./pages/SmartCollars";
import TrackMyPet from "./pages/TrackMyPet";
import ClinicFinder from "./pages/ClinicFinder";
import Clinics from "./pages/Clinics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import MyPets from "./pages/MyPets";
import ServiceBooking from "./pages/ServiceBooking";
import ServiceDetail from "./pages/ServiceDetail";
import ProviderDetail from "./pages/ProviderDetail";
import DiseasePredictor from "./pages/DiseasePredictor";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import AnimationsTest from "./pages/animations-test"; // DEV ONLY
import LiveFeaturesDemo from "./pages/LiveFeaturesDemo"; // Realtime features demo
import TestNotifications from "./pages/TestNotifications"; // Test notifications system
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ServiceDashboard from "./pages/ServiceDashboard";
import { TwentyFirstToolbar } from "@21st-extension/toolbar-react";
import { ReactPlugin } from "@21st-extension/react";
import Chatbot from "./components/Chatbot";
import ProfileCompletionNotification from "./components/ProfileCompletionNotification";

// Example components for testing new architecture
import PaymentExample from "./examples/PaymentExample";
import AIChatExample from "./examples/AIChatExample";
import LiveTrackingExample from "./examples/LiveTrackingExample";

// Protected route component for authenticated users
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, isPetOwner, isServiceProvider } = useAuth();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role (if specified)
  if (requiredRole === 'petOwner' && !isPetOwner) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole === 'serviceProvider' && !isServiceProvider) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  const { isPetOwner } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Initialize performance optimizations
  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());
    
    // Apply low performance mode if needed
    applyLowPerformanceMode();
  }, []);

  // Simulate loading on route change (customize duration as needed)
  useEffect(() => {
    // Uncomment the return below to temporarily disable loader for debugging
    // return;
    
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust loading duration here

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 },
  };

  const pageTransition = {
    ...transition,
    duration: transition.duration * 0.8,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageLoader loading={isLoading} />
      <Navbar />
      <ProfileCompletionNotification />
      <div className="flex-grow">
        {shouldReduceMotion ? (
          // No animations for reduced motion users
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/pet-grooming" element={<PetGrooming />} />
            <Route path="/services/veterinary-care" element={<VeterinaryCare />} />
            <Route path="/services/pet-training" element={<PetTraining />} />
            <Route path="/service/:serviceId" element={<ServiceDetail />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/services/:category/:serviceId" element={<ServiceDetail />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/providers/:providerId" element={<ProviderDetail />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/smart-collars" element={<SmartCollars />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/animations-test" element={<AnimationsTest />} /> {/* DEV ONLY */}
            <Route path="/live-features-demo" element={<LiveFeaturesDemo />} /> {/* Realtime features demo */}
            <Route path="/test-notifications" element={<TestNotifications />} /> {/* Test notification system */}
            
            {/* Example routes for new architecture testing */}
            <Route path="/examples/payment" element={<PaymentExample />} />
            <Route path="/examples/chat" element={<AIChatExample />} />
            <Route path="/examples/tracking" element={<LiveTrackingExample />} />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Pet owner specific routes */}
            <Route 
              path="/my-pets" 
              element={
                <ProtectedRoute requiredRole="petOwner">
                  <MyPets />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-bookings" 
              element={
                <ProtectedRoute requiredRole="petOwner">
                  <MyBookings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/track-my-pet" 
              element={
                <ProtectedRoute requiredRole="petOwner">
                  <TrackMyPet />
                </ProtectedRoute>
              } 
            />
            
            <Route
              path="/disease-predictor"
              element={
                <ProtectedRoute requiredRole="petOwner">
                  <DiseasePredictor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-analytics"
              element={
                <ProtectedRoute requiredRole="serviceProvider">
                  <ServiceAnalytics />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/clinic-finder" 
              element={
                <ProtectedRoute requiredRole="petOwner">
                  <ClinicFinder />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/book-service/:serviceId" 
              element={<ServiceBooking />} 
            />
            
            {/* Service provider specific routes - all point to ServiceDashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="serviceProvider">
                  <ServiceDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-services" 
              element={
                <ProtectedRoute requiredRole="serviceProvider">
                  <ServiceDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/manage-bookings" 
              element={
                <ProtectedRoute requiredRole="serviceProvider">
                  <ServiceDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
          </Routes>
        ) : (
          // With page transitions for users who can handle motion
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/pet-grooming" element={<PetGrooming />} />
                <Route path="/services/veterinary-care" element={<VeterinaryCare />} />
                <Route path="/services/pet-training" element={<PetTraining />} />
                <Route path="/service/:serviceId" element={<ServiceDetail />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/services/:category/:serviceId" element={<ServiceDetail />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/:providerId" element={<ProviderDetail />} />
                <Route path="/clinics" element={<Clinics />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/smart-collars" element={<SmartCollars />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/animations-test" element={<AnimationsTest />} /> {/* DEV ONLY */}
                <Route path="/live-features-demo" element={<LiveFeaturesDemo />} /> {/* Realtime features demo */}
                <Route path="/test-notifications" element={<TestNotifications />} /> {/* Test notification system */}
                
                {/* Example routes for new architecture testing */}
                <Route path="/examples/payment" element={<PaymentExample />} />
                <Route path="/examples/chat" element={<AIChatExample />} />
                <Route path="/examples/tracking" element={<LiveTrackingExample />} />
                
                {/* Protected routes - require authentication */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Pet owner specific routes */}
                <Route 
                  path="/my-pets" 
                  element={
                    <ProtectedRoute requiredRole="petOwner">
                      <MyPets />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/my-bookings" 
                  element={
                    <ProtectedRoute requiredRole="petOwner">
                      <MyBookings />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/track-my-pet" 
                  element={
                    <ProtectedRoute requiredRole="petOwner">
                      <TrackMyPet />
                    </ProtectedRoute>
                  } 
                />
                
                <Route
                  path="/disease-predictor"
                  element={
                    <ProtectedRoute requiredRole="petOwner">
                      <DiseasePredictor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-analytics"
                  element={
                    <ProtectedRoute requiredRole="serviceProvider">
                      <ServiceAnalytics />
                    </ProtectedRoute>
                  }
                />
                
                <Route 
                  path="/clinic-finder" 
                  element={
                    <ProtectedRoute requiredRole="petOwner">
                      <ClinicFinder />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/book-service/:serviceId" 
                  element={<ServiceBooking />} 
                />
                
                {/* Service provider specific routes - all point to ServiceDashboard */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="serviceProvider">
                      <ServiceDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/my-services" 
                  element={
                    <ProtectedRoute requiredRole="serviceProvider">
                      <ServiceDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/manage-bookings" 
                  element={
                    <ProtectedRoute requiredRole="serviceProvider">
                      <ServiceDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
      {isPetOwner && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <TwentyFirstToolbar 
          config={{
            plugins: [ReactPlugin]
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App; 