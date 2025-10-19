import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from './PageLoader';
import AnimatedConfirmDialog from './AnimatedConfirmDialog';
import ServiceAddedAnimation from './ServiceAddedAnimation';
import ServiceRemovedAnimation from './ServiceRemovedAnimation';

// DEV ONLY: Remove this component before production deployment
const AnimationPlayground = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPetAdded, setShowPetAdded] = useState(false);
  const [simulateGPS, setSimulateGPS] = useState(false);
  const [chatbotTyping, setChatbotTyping] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Card animation testing states
  const [triggerCardRefresh, setTriggerCardRefresh] = useState(0);
  const [showCardDemo, setShowCardDemo] = useState(false);

  // Service animation testing states
  const [showServiceAdded, setShowServiceAdded] = useState(false);
  const [showServiceRemoved, setShowServiceRemoved] = useState(false);

  // Form slide animation testing states
  const [showFormSlideDemo, setShowFormSlideDemo] = useState(false);

  const handleTriggerAiScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      // Emit event for DiseasePredictor to listen to
      console.log('Triggering AI scan from playground...');
      window.dispatchEvent(new CustomEvent('triggerAiScan'));
    }
  };

  const handleTriggerPetAdded = () => {
    setShowPetAdded(!showPetAdded);
    if (!showPetAdded) {
      console.log('Triggering Pet Added animation from playground...');
      window.dispatchEvent(new CustomEvent('triggerPetAdded'));
    }
  };

  const handleTriggerPetRemoved = () => {
    console.log('🗑️ Triggering Pet Removed animation from playground...');
    window.dispatchEvent(new CustomEvent('triggerPetRemoved'));
  };

  const handleShowConfirmDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    console.log('✅ User confirmed action in playground');
    setShowConfirmDialog(false);
  };

  const handleCancelAction = () => {
    console.log('❌ User cancelled action in playground');
    setShowConfirmDialog(false);
  };

  // Card animation handlers
  const handleTriggerCardRefresh = () => {
    setTriggerCardRefresh(prev => prev + 1);
    console.log('🔄 Card refresh triggered - visit Services, Providers, or Home page to see staggered card animations');
  };

  const handleToggleCardDemo = () => {
    setShowCardDemo(!showCardDemo);
    console.log(`📋 Card demo ${!showCardDemo ? 'enabled' : 'disabled'}`);
  };

  // Service animation handlers
  const handleTriggerServiceAdded = () => {
    setShowServiceAdded(true);
    console.log('🛠️ Service added animation triggered from playground');
    // Emit event for ServiceDashboard to listen to
    window.dispatchEvent(new CustomEvent('triggerServiceAdded', { detail: { serviceName: 'Test Service' } }));
  };

  const handleTriggerServiceRemoved = () => {
    setShowServiceRemoved(true);
    console.log('🗑️ Service removed animation triggered from playground');
    // Emit event for ServiceDashboard to listen to
    window.dispatchEvent(new CustomEvent('triggerServiceRemoved', { detail: { serviceName: 'Test Service' } }));
  };

  // Form slide animation handlers
  const handleToggleFormSlideDemo = () => {
    setShowFormSlideDemo(!showFormSlideDemo);
    console.log(`📝 Form slide demo ${!showFormSlideDemo ? 'enabled' : 'disabled'}`);
  };

  const handleAddDummyPets = () => {
    console.log('🐕 Triggering dummy pets addition from playground...');
    window.dispatchEvent(new CustomEvent('addDummyPets'));
  };

  const handleSimulateGPS = () => {
    setSimulateGPS(!simulateGPS);
    if (!simulateGPS) {
      // Emit test coordinates for GPS marker animation
      const testCoords = {
        lat: 37.7749 + (Math.random() - 0.5) * 0.01,
        lng: -122.4194 + (Math.random() - 0.5) * 0.01,
        timestamp: Date.now()
      };
      console.log('Simulating GPS update:', testCoords);
      // Future components will listen for this event
      window.dispatchEvent(new CustomEvent('simulateGPSUpdate', { detail: testCoords }));
    }
  };

  const buttonStyle = {
    padding: '12px 20px',
    margin: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
  };

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #cbd5e1'
  };

  return (
    <div style={containerStyle}>
      <PageLoader loading={isLoading} />
      <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
        🎭 Animation Playground (DEV ONLY)
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        <div>
          <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>Page States</h3>
          <button
            style={isLoading ? activeButtonStyle : buttonStyle}
            onClick={() => setIsLoading(!isLoading)}
          >
            {isLoading ? '🔄 Stop Loader' : '⏳ Show PageLoader'}
          </button>
          
          <button
            style={isScanning ? activeButtonStyle : buttonStyle}
            onClick={handleTriggerAiScan}
          >
            {isScanning ? '🛑 Stop AI Scan' : '🔍 Trigger AI Scan'}
          </button>
        </div>

        <div>
          <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>Modals & Overlays</h3>
          <button
            style={showPaymentModal ? activeButtonStyle : buttonStyle}
            onClick={() => setShowPaymentModal(!showPaymentModal)}
          >
            {showPaymentModal ? '✅ Hide Payment' : '💳 Show Payment Modal'}
          </button>
          
          <button
            style={showPetAdded ? activeButtonStyle : buttonStyle}
            onClick={handleTriggerPetAdded}
          >
            {showPetAdded ? '🎉 Hide Success' : '🐾 Trigger Pet Added'}
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleAddDummyPets}
          >
            🐕 Add 3 Dummy Pets
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleTriggerPetRemoved}
          >
            🗑️ Trigger Pet Removed
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleTriggerServiceAdded}
          >
            🛠️ Trigger Service Added
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleTriggerServiceRemoved}
          >
            🗑️ Trigger Service Removed
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleShowConfirmDialog}
          >
            ⚠️ Show Confirm Dialog
          </button>
        </div>

        <div>
          <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>Card Animations</h3>
          <button
            style={buttonStyle}
            onClick={handleTriggerCardRefresh}
          >
            🔄 Refresh Card Grids
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleToggleCardDemo}
          >
            📋 {showCardDemo ? 'Hide' : 'Show'} Card Demo
          </button>
          
          <button
            style={buttonStyle}
            onClick={handleToggleFormSlideDemo}
          >
            📝 {showFormSlideDemo ? 'Hide' : 'Show'} Form Slide Demo
          </button>
        </div>

        <div>
          <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>Interactive</h3>
          <button
            style={chatbotTyping ? activeButtonStyle : buttonStyle}
            onClick={() => setChatbotTyping(!chatbotTyping)}
          >
            {chatbotTyping ? '💬 Stop Typing' : '⌨️ Chatbot Typing'}
          </button>
          
          <button
            style={simulateGPS ? activeButtonStyle : buttonStyle}
            onClick={handleSimulateGPS}
          >
            {simulateGPS ? '📍 Stop GPS' : '🗺️ Simulate GPS Update'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px' }}>
        <h4 style={{ color: '#334155', margin: '0 0 12px 0' }}>Current States:</h4>
        <div style={{ fontSize: '14px', color: '#64748b', fontFamily: 'monospace' }}>
          <div>isLoading: <strong>{isLoading.toString()}</strong></div>
          <div>isScanning: <strong>{isScanning.toString()}</strong></div>
          <div>showPaymentModal: <strong>{showPaymentModal.toString()}</strong></div>
          <div>showPetAdded: <strong>{showPetAdded.toString()}</strong></div>
          <div>simulateGPS: <strong>{simulateGPS.toString()}</strong></div>
          <div>chatbotTyping: <strong>{chatbotTyping.toString()}</strong></div>
            <div>showConfirmDialog: <strong>{showConfirmDialog.toString()}</strong></div>
            <div>triggerCardRefresh: <strong>{triggerCardRefresh}</strong></div>
            <div>showCardDemo: <strong>{showCardDemo.toString()}</strong></div>
            <div>showServiceAdded: <strong>{showServiceAdded.toString()}</strong></div>
            <div>showServiceRemoved: <strong>{showServiceRemoved.toString()}</strong></div>
            <div>showFormSlideDemo: <strong>{showFormSlideDemo.toString()}</strong></div>
          </div>
        </div>

        {/* Card Demo Section */}
        {showCardDemo && (
          <div style={{ 
            marginTop: '24px', 
            padding: '20px', 
            backgroundColor: '#f0fdfa', 
            borderRadius: '12px',
            border: '2px solid #99f6e4'
          }}>
            <h3 style={{ color: '#0f766e', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>
              🎯 Card Animation Demo
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              {/* Demo Cards */}
              {[1, 2, 3].map((num) => (
                <motion.div
                  key={`demo-card-${num}-${triggerCardRefresh}`}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 14,
                    delay: num * 0.1
                  }}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #99f6e4',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <h4 style={{ color: '#0f766e', marginBottom: '8px' }}>Demo Card {num}</h4>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    This card animates with the same smooth entrance as your service, provider, and pet cards!
                  </p>
                </motion.div>
              ))}
            </div>
            <p style={{ 
              color: '#0d9488', 
              fontSize: '14px', 
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              💡 Click "Refresh Card Grids" to see the staggered animation again!
            </p>
          </div>
        )}

        {/* Form Slide Demo Section */}
        {showFormSlideDemo && (
          <div style={{ 
            marginTop: '24px', 
            padding: '20px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '12px',
            border: '2px solid #0ea5e9'
          }}>
            <h3 style={{ color: '#0369a1', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>
              📝 Form Slide Animation Demo
            </h3>
            <AnimatePresence>
              <motion.div
                key={`form-demo-${triggerCardRefresh}`}
                initial={{ opacity: 0, y: -100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -100, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.5
                }}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h4 style={{ color: '#0369a1', marginBottom: '12px' }}>Demo Form</h4>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>
                    Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter name..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#374151', fontSize: '14px', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea 
                    placeholder="Enter description..."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    Cancel
                  </button>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#0369a1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    Submit
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
            <p style={{ 
              color: '#0369a1', 
              fontSize: '14px', 
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: '16px'
            }}>
              💡 This shows the same slide-down animation used in Add Pet and Add Service forms!
            </p>
          </div>
        )}

      <p style={{ 
        color: '#ef4444', 
        fontSize: '14px', 
        textAlign: 'center', 
        marginTop: '20px',
        fontWeight: '600'
      }}>
        ⚠️ REMOVE THIS COMPONENT BEFORE PRODUCTION DEPLOYMENT
      </p>
      
      {/* Service Added Animation */}
      <ServiceAddedAnimation
        isVisible={showServiceAdded}
        onComplete={() => setShowServiceAdded(false)}
        serviceName="Test Service"
      />

      {/* Service Removed Animation */}
      <ServiceRemovedAnimation
        isVisible={showServiceRemoved}
        onComplete={() => setShowServiceRemoved(false)}
        serviceName="Test Service"
      />
      
      {/* Animated Confirmation Dialog */}
      <AnimatedConfirmDialog
        isVisible={showConfirmDialog}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        title="Test Confirmation"
        message="This is a test of the animated confirmation dialog. Do you want to proceed with this demo action?"
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        type="teal"
      />
    </div>
  );
};

export default AnimationPlayground;
