import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function PetTraining() {
  // Pet Training services
  const trainingServices = [
    {
      id: 301,
      title: "Basic Obedience Training",
      provider: "Good Boy Academy",
      rating: 4.7,
      reviews: 86,
      image: "/placeholder.svg",
      price: "$35/session",
      description: "Learn essential commands and establish good behavior patterns for your dog."
    },
    {
      id: 302,
      title: "Puppy Socialization",
      provider: "Paws & Train",
      rating: 4.8,
      reviews: 92,
      image: "/placeholder.svg",
      price: "$30/session",
      description: "Help your puppy develop social skills with other dogs and people in a safe environment."
    },
    {
      id: 303,
      title: "Behavior Modification",
      provider: "Elite K9 Training",
      rating: 4.9,
      reviews: 112,
      image: "/placeholder.svg",
      price: "$45/session",
      description: "Specialized training to address behavioral issues such as anxiety, aggression, or excessive barking."
    },
    {
      id: 304,
      title: "Advanced Tricks",
      provider: "Smart Pets Training",
      rating: 4.8,
      reviews: 74,
      image: "/placeholder.svg",
      price: "$40/session",
      description: "Teach your pet impressive tricks and advanced commands to challenge their mind."
    },
    {
      id: 305,
      title: "Service Dog Training",
      provider: "Assistance Paws",
      rating: 5.0,
      reviews: 68,
      image: "/placeholder.svg",
      price: "$65/session",
      description: "Specialized training for service dogs to assist people with disabilities."
    },
    {
      id: 306,
      title: "Group Training Classes",
      provider: "Community Pet School",
      rating: 4.6,
      reviews: 105,
      image: "/placeholder.svg",
      price: "$25/session",
      description: "Cost-effective group training sessions for basic commands and socialization."
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
          <h1 className="text-4xl font-bold mb-4">Pet Training Services</h1>
          <p className="text-xl max-w-2xl">
            Expert trainers to help with obedience, behavior modification, and specialized skills
          </p>
        </div>
      </div>

      {/* Services listing */}
      <div className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainingServices.map((service) => (
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
                    to={`/services/pet-training/${service.id}`}
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
          <h2 className="text-2xl font-bold mb-6 text-center">Our Training Approach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Positive Reinforcement</h3>
              <p className="text-gray-600">Our trainers use reward-based methods to encourage good behavior and build confidence.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Customized Training</h3>
              <p className="text-gray-600">Training plans tailored to your pet's specific needs, temperament, and learning style.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Owner Education</h3>
              <p className="text-gray-600">We work with both pets and their owners to ensure consistency and long-term success.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PetTraining; 