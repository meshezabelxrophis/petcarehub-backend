import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<div className="p-8 text-center">Signup Page (Coming Soon)</div>} />
        <Route path="/services" element={<div className="p-8 text-center">Services Page (Coming Soon)</div>} />
        <Route path="/smart-collars" element={<div className="p-8 text-center">Smart Collars Page (Coming Soon)</div>} />
        <Route path="/login" element={<div className="p-8 text-center">Login Page (Coming Soon)</div>} />
        <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App; 