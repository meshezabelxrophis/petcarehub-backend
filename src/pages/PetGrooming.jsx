import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function PetGrooming() {
  // Pet Grooming services
  const groomingServices = [
    {
      id: 101,
      title: "Full Grooming Package",
      provider: "PawPerfect Salon",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg",
      price: "$60",
      description: "Complete grooming service including bath, haircut, nail trimming, ear cleaning, and more."
    },
    {
      id: 102,
      title: "Bath & Brush",
      provider: "Clean Pets Co.",
      rating: 4.6,
      reviews: 98,
      image: "/placeholder.svg",
      price: "$40",
      description: "Basic cleaning service with shampoo, conditioning, and brush out."
    },
    {
      id: 103,
      title: "Nail Trimming",
      provider: "Mobile Pet Groomers",
      rating: 4.5,
      reviews: 76,
      image: "/placeholder.svg",
      price: "$15",
      description: "Professional nail trimming service to keep your pet's paws healthy."
    },
    {
      id: 104,
      title: "Breed-Specific Styling",
      provider: "Elite Pet Salon",
      rating: 4.9,
      reviews: 112,
      image: "/placeholder.svg",
      price: "$75",
      description: "Specialized grooming tailored to your pet's breed standards with expert styling."
    },
    {
      id: 105,
      title: "Flea & Tick Treatment",
      provider: "Health Fur Grooming",
      rating: 4.7,
      reviews: 93,
      image: "/placeholder.svg",
      price: "$35",
      description: "Special treatment to eliminate fleas and ticks while leaving your pet's coat clean and healthy."
    },
    {
      id: 106,
      title: "De-shedding Treatment",
      provider: "Fur Control Experts",
      rating: 4.8,
      reviews: 87,
      image: "/placeholder.svg",
      price: "$45",
      description: "Specialized treatment to reduce shedding by removing loose fur from your pet's undercoat."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/services" className="inline-flex items-center text-white mb-4 hover:underline">
            <ChevronLeft size={20} className="mr-1" /> Back to Services
          </Link>
          <h1 className="text-4xl font-bold mb-4">Pet Grooming Services</h1>
          <p className="text-xl max-w-2xl">
            Professional grooming services to keep your pet looking and feeling their best
          </p>
        </div>
      </div>

      {/* Services listing */}
      <div className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groomingServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{service.title}</h3>
                <p className="text-teal-600 font-medium mb-2">{service.provider}</p>
                <p className="text-gray-600 mb-3 text-sm">{service.description}</p>
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(service.rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                  </div>
                  <span className="text-gray-600 ml-2">
                    {service.rating} ({service.reviews} reviews)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">{service.price}</span>
                  <Link
                    to={`/services/pet-grooming/${service.id}`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional information */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our Pet Grooming Services?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Professional Groomers</h3>
              <p className="text-gray-600">All our groomers are certified professionals with years of experience handling various breeds.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Premium Products</h3>
              <p className="text-gray-600">We use only pet-safe, high-quality grooming products suited for your pet's specific needs.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Stress-Free Environment</h3>
              <p className="text-gray-600">Our facilities are designed to create a calm and comfortable experience for your pet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetGrooming; 