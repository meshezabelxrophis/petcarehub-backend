import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function VeterinaryCare() {
  // Veterinary Care services
  const vetServices = [
    {
      id: 201,
      title: "Annual Check-up",
      provider: "PetHealth Clinic",
      rating: 4.9,
      reviews: 218,
      image: "/placeholder.svg",
      price: "₨8,500",
      description: "Comprehensive annual health examination including vaccinations and health assessment."
    },
    {
      id: 202,
      title: "Dental Cleaning",
      provider: "Advanced Vet Care",
      rating: 4.7,
      reviews: 143,
      image: "/placeholder.svg",
      price: "₨15,000",
      description: "Professional dental cleaning to maintain your pet's oral health."
    },
    {
      id: 203,
      title: "Vaccination Package",
      provider: "City Veterinary",
      rating: 4.8,
      reviews: 187,
      image: "/placeholder.svg",
      price: "₨6,500",
      description: "Essential vaccinations to protect your pet from common diseases."
    },
    {
      id: 204,
      title: "Emergency Care",
      provider: "24/7 Pet Hospital",
      rating: 4.9,
      reviews: 176,
      image: "/placeholder.svg",
      price: "From ₨12,000",
      description: "Urgent care services for pet emergencies available around the clock."
    },
    {
      id: 205,
      title: "Nutritional Consultation",
      provider: "Healthy Pets Clinic",
      rating: 4.7,
      reviews: 94,
      image: "/placeholder.svg",
      price: "₨5,500",
      description: "Expert advice on diet and nutrition tailored to your pet's specific health needs."
    },
    {
      id: 206,
      title: "Laboratory Tests",
      provider: "DiagnosticVet Lab",
      rating: 4.8,
      reviews: 129,
      image: "/placeholder.svg",
      price: "₨4,500-₨18,000",
      description: "Comprehensive range of diagnostic tests including blood work and urinalysis."
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
          <h1 className="text-4xl font-bold mb-4">Veterinary Care Services</h1>
          <p className="text-xl max-w-2xl">
            Connect with qualified veterinarians for check-ups, vaccinations, and treatments
          </p>
        </div>
      </div>

      {/* Services listing */}
      <div className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vetServices.map((service) => (
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
                    to={`/services/veterinary-care/${service.id}`}
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
          <h2 className="text-2xl font-bold mb-6 text-center">Our Veterinary Network</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Licensed Professionals</h3>
              <p className="text-gray-600">All veterinarians in our network are licensed and have years of experience in animal healthcare.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Modern Facilities</h3>
              <p className="text-gray-600">Access to state-of-the-art clinics equipped with the latest veterinary technology.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Preventive Care Focus</h3>
              <p className="text-gray-600">We emphasize preventive healthcare to keep your pets healthy and happy throughout their lives.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VeterinaryCare; 