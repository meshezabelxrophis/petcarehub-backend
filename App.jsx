
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import ServiceDashboard from './ServiceDashboard';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {user && user.role === 'service_provider' && (
          <Route path="/dashboard" element={<ServiceDashboard />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
