import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function Services() {
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Sample service categories
  const serviceCategories = [
    { 
      id: 1, 
      name: "Pet Grooming", 
      description: "Professional grooming services to keep your pet looking and feeling their best.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path>
        </svg>
      ),
      count: 24,
      path: "/services/pet-grooming"
    },
    { 
      id: 2, 
      name: "Veterinary Care", 
      description: "Connect with qualified veterinarians for check-ups, vaccinations, and treatments.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12a6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 0112 0z"></path>
        </svg>
      ),
      count: 18,
      path: "/services/veterinary-care"
    },
    { 
      id: 3, 
      name: "Pet Training", 
      description: "Expert trainers to help with obedience, behavior modification, and specialized skills.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      ),
      count: 12,
      path: "/services/pet-training"
    },
    { 
      id: 4, 
      name: "Pet Sitting", 
      description: "Reliable pet sitters to care for your pets when you're away from home.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
      count: 15,
      path: "/services/pet-sitting"
    },
    { 
      id: 5, 
      name: "Dog Walking", 
      description: "Regular exercise and outdoor activities for your canine companions.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      count: 20,
      path: "/services/dog-walking"
    },
    { 
      id: 6, 
      name: "Pet Boarding", 
      description: "Safe and comfortable accommodation for your pets during your absence.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      ),
      count: 9,
      path: "/services/pet-boarding"
    },
  ];

  // Combined service listings for search
  const allServices = [
    // Pet Grooming
    {
      id: 101,
      title: "Full Grooming Package",
      provider: "PawPerfect Salon",
      category: "Pet Grooming",
      location: "New York, NY",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg",
      price: "$60",
      description: "Complete grooming service including bath, haircut, nail trimming, ear cleaning, and more.",
      searchTerms: ["grooming", "pet grooming", "groomer", "pet care"]
    },
    {
      id: 102,
      title: "Bath & Brush",
      provider: "Clean Pets Co.",
      category: "Pet Grooming",
      location: "Boston, MA",
      rating: 4.6,
      reviews: 98,
      image: "/placeholder.svg",
      price: "$40",
      description: "Basic cleaning service with shampoo, conditioning, and brush out.",
      searchTerms: ["bath", "brush", "cleaning", "pet care"]
    },
    // Veterinary Care
    {
      id: 201,
      title: "Annual Check-up",
      provider: "PetHealth Clinic",
      category: "Veterinary Care",
      location: "Chicago, IL",
      rating: 4.9,
      reviews: 218,
      image: "/placeholder.svg",
      price: "$85",
      description: "Comprehensive annual health examination including vaccinations and health assessment.",
      searchTerms: ["annual checkup", "yearly checkup", "annual exam", "yearly exam", "pet exam", "pet checkup", "health exam", "wellness exam", "preventive care"]
    },
    {
      id: 202,
      title: "Dental Cleaning",
      provider: "Advanced Vet Care",
      category: "Veterinary Care",
      location: "Miami, FL",
      rating: 4.7,
      reviews: 143,
      image: "/placeholder.svg",
      price: "$150",
      description: "Professional dental cleaning to maintain your pet's oral health.",
      searchTerms: ["dental", "cleaning", "veterinary", "pet care"]
    },
    // Pet Training
    {
      id: 301,
      title: "Basic Obedience Training",
      provider: "Good Boy Academy",
      category: "Pet Training",
      location: "Seattle, WA",
      rating: 4.7,
      reviews: 86,
      image: "/placeholder.svg",
      price: "$35/session",
      description: "Learn essential commands and establish good behavior patterns for your dog.",
      searchTerms: ["obedience", "training", "pet training", "dog training"]
    },
    {
      id: 302,
      title: "Puppy Socialization",
      provider: "Paws & Train",
      category: "Pet Training",
      location: "Denver, CO",
      rating: 4.8,
      reviews: 92,
      image: "/placeholder.svg",
      price: "$30/session",
      description: "Help your puppy develop social skills with other dogs and people in a safe environment.",
      searchTerms: ["socialization", "puppy training", "dog training", "pet training"]
    },
    // Pet Sitting
    {
      id: 401,
      title: "Daily Home Visits",
      provider: "TrustedSitters",
      category: "Pet Sitting",
      location: "Austin, TX",
      rating: 4.6,
      reviews: 108,
      image: "/placeholder.svg",
      price: "$25/visit",
      description: "Regular home visits to feed, play with, and care for your pet while you're away.",
      searchTerms: ["pet sitting", "pet care", "home visits", "dog sitting"]
    },
    // Dog Walking
    {
      id: 501,
      title: "30-Min Walk",
      provider: "Daily Walkers",
      category: "Dog Walking",
      location: "Portland, OR",
      rating: 4.7,
      reviews: 156,
      image: "/placeholder.svg",
      price: "$15",
      description: "Standard 30-minute walk for your dog, including pickup and drop-off at your home.",
      searchTerms: ["dog walking", "walking", "pet walking", "dog care"]
    },
    // Pet Boarding
    {
      id: 601,
      title: "Luxury Pet Resort Stay",
      provider: "PetParadise",
      category: "Pet Boarding",
      location: "San Diego, CA",
      rating: 4.8,
      reviews: 178,
      image: "/placeholder.svg",
      price: "$65/night",
      description: "Premium boarding with private suites, playtime, grooming, and 24/7 care.",
      searchTerms: ["pet boarding", "boarding", "pet care", "dog care"]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Pet Care Services</h1>
          <p className="text-xl mx-auto max-w-2xl">
            Find the perfect service for your pet from our network of verified professionals
          </p>
        </div>
      </div>

      {/* Categories section */}
      <div className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover a wide range of pet care services tailored to your pet's needs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {serviceCategories.map((category) => (
            <Link 
              to={category.path} 
              key={category.id} 
              className="flex flex-col items-center text-center group transition-transform transform hover:scale-105"
            >
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-200 transition-colors">
                <div className="text-teal-600">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
              <span className="mt-4 inline-flex items-center text-teal-600 font-medium">
                View services <ChevronRight size={16} className="ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works - always show */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Search</h3>
              <p className="text-gray-600">
                Browse through services or search for specific pet care needs
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Book</h3>
              <p className="text-gray-600">
                Choose a service and schedule an appointment that works for you
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Relax</h3>
              <p className="text-gray-600">
                Sit back and let our verified professionals take care of your pet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services; 