import React, { useState, useEffect } from 'react';
import PageLoader from './PageLoader';

const LoaderDemo = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const resetDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <PageLoader loading={loading} />
      
      <h2>PageLoader Demo</h2>
      <p>Status: {loading ? 'Loading...' : 'Loaded!'}</p>
      
      <button 
        onClick={resetDemo}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Test Again (2s)
      </button>
    </div>
  );
};

export default LoaderDemo;

