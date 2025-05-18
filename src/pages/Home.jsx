import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="bg-teal-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Pet Care Made Simple</h1>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Connect with trusted pet care professionals for all your pet's needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-teal-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              to="/providers"
              className="bg-teal-700 text-white px-8 py-3 rounded-md font-medium hover:bg-teal-800 transition-colors"
            >
              Find Providers
            </Link>
          </div>
        </div>
      </div>

      {/* Featured services */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Pet Care Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover top-rated services that provide the best care for your furry friends
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="/placeholder.svg"
                alt="Pet Grooming"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">Pet Grooming</h3>
                <p className="text-gray-600 mb-4">
                  Professional grooming services to keep your pet looking and feeling their best.
                </p>
                <Link
                  to="/services/pet-grooming"
                  className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="/placeholder.svg"
                alt="Veterinary Care"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">Veterinary Care</h3>
                <p className="text-gray-600 mb-4">
                  Connect with qualified veterinarians for check-ups, vaccinations, and treatments.
                </p>
                <Link
                  to="/services/veterinary-care"
                  className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="/placeholder.svg"
                alt="Pet Training"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">Pet Training</h3>
                <p className="text-gray-600 mb-4">
                  Expert trainers to help with obedience, behavior modification, and specialized skills.
                </p>
                <Link
                  to="/services/pet-training"
                  className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
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

      {/* Smart Collars */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Track Your Pet's Health</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our Smart Collars provide real-time monitoring of your pet's location, activity levels, and health metrics. Get insights and peace of mind with our innovative technology.
              </p>
              <Link
                to="/smart-collars"
                className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-700 transition-colors"
              >
                Learn About Smart Collars
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/placeholder.svg"
                alt="Smart Collar"
                className="rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 