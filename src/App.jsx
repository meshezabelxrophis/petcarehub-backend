import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import PetGrooming from "./pages/PetGrooming";
import VeterinaryCare from "./pages/VeterinaryCare";
import PetTraining from "./pages/PetTraining";
import Providers from "./pages/Providers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SmartCollars from "./pages/SmartCollars";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/pet-grooming" element={<PetGrooming />} />
            <Route path="/services/veterinary-care" element={<VeterinaryCare />} />
            <Route path="/services/pet-training" element={<PetTraining />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/smart-collars" element={<SmartCollars />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 