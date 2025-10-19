import React from 'react';
import AnimationPlayground from '../components/AnimationPlayground';
import AnimationDemo from '../components/AnimationDemo';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// DEV ONLY: Remove this page before production deployment
const AnimationsTest = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navbar />
      
      <main style={{ 
        paddingTop: '80px', 
        paddingBottom: '40px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px' 
        }}>
          <h1 style={{ 
            color: '#1e293b', 
            fontSize: '32px', 
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            Animation Testing Hub
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Test and debug all animations in isolation. Use the controls below to trigger different animation states and verify they work correctly across the application.
          </p>
        </div>

        <AnimationDemo />
        
        <div style={{ margin: '40px 0', borderTop: '2px dashed #cbd5e1' }}></div>
        
        <AnimationPlayground />
        
        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '8px' }}>Development Notes</h3>
          <p style={{ color: '#78350f', fontSize: '14px', lineHeight: '1.5' }}>
            This page is for testing animations during development. 
            Future animation components will read these states and respond accordingly. 
            Make sure to test on different devices and screen sizes.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AnimationsTest;
