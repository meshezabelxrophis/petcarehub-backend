import React from 'react';

// Example component demonstrating the new animation classes
const AnimationDemo = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>
        🎭 Animation Classes Demo
      </h2>
      
      {/* Animated Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>
          Animated Buttons
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-animated" style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Primary Button
          </button>
          
          <button className="btn-animated" style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Success Button
          </button>
          
          <button className="btn-animated" style={{
            padding: '12px 24px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Warning Button
          </button>
        </div>
      </div>

      {/* Animated Cards */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>
          Animated Cards
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="card-animated" style={{
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer'
          }}>
            <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>Pet Care</h4>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Professional pet care services with experienced veterinarians.
            </p>
          </div>
          
          <div className="card-animated" style={{
            padding: '20px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer'
          }}>
            <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>Pet Training</h4>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Expert training programs to help your pet learn and grow.
            </p>
          </div>
        </div>
      </div>

      {/* Animation States */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#475569', fontSize: '16px', marginBottom: '12px' }}>
          Animation States
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="loading-pulse" style={{
            padding: '16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            color: '#475569'
          }}>
            Loading Content...
          </div>
          
          <div className="fade-in" style={{
            padding: '16px',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            color: '#065f46'
          }}>
            Fade In Animation
          </div>
          
          <div className="bounce-in" style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            Bounce In Effect
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ color: '#334155', margin: '0 0 8px 0' }}>
          🚀 Performance Features:
        </h4>
        <ul style={{ color: '#64748b', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
          <li>GPU-accelerated animations with <code>transform: translateZ(0)</code></li>
          <li>Respects <code>prefers-reduced-motion</code> user setting</li>
          <li>Automatic low-end device detection and optimization</li>
          <li>Hover effects only animate transform and box-shadow</li>
          <li>CSS classes automatically disabled for low-performance devices</li>
        </ul>
      </div>
      
      <p style={{ 
        color: '#ef4444', 
        fontSize: '14px', 
        textAlign: 'center', 
        marginTop: '20px',
        fontWeight: '600'
      }}>
        ⚠️ This is a demo component - remove before production
      </p>
    </div>
  );
};

export default AnimationDemo;

