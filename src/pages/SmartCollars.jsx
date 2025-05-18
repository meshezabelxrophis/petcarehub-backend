import React, { useState } from "react";

function SmartCollars() {
  const [activeTab, setActiveTab] = useState("features");
  
  const collar = {
    id: 1,
    name: "The PetCare Hub - SmartCollar",
    price: 89.99,
    features: [
      "IoT & Health Tracking",
      "Real-time location monitoring",
      "Activity tracking",
      "Vital health parameter monitoring",
      "Water resistant",
      "Long battery life"
    ],
    description: "Smart Collars with IoT & Health Tracking, enabling pet owners to monitor their pets' location, activity, and vital health parameters in real time. This integration will provide enhanced security, health insights, and convenience to pet owners."
  };
  
  const faqs = [
    {
      question: "How accurate is the GPS tracking?",
      answer: "Our GPS tracking is accurate to within 10 feet in open areas. In dense urban environments or indoors, accuracy may be reduced to 50-100 feet."
    },
    {
      question: "Are the collars comfortable for pets to wear?",
      answer: "Yes, our smart collar is designed with pet comfort in mind. It's lightweight, has smooth edges, and is made from pet-friendly materials."
    },
    {
      question: "How long does the battery last?",
      answer: "The PetCare Hub SmartCollar lasts up to 7 days on a single charge with standard use. Usage of real-time tracking features may reduce battery life."
    },
    {
      question: "Can I use the smart collar for both dogs and cats?",
      answer: "Yes, our collar is adjustable and suitable for both dogs and cats. It's designed to be comfortable for all pets."
    },
    {
      question: "Does the collar require a subscription?",
      answer: "Basic features work without a subscription. Advanced features like historical data, extended health insights, and premium GPS services require a monthly subscription."
    }
  ];
  
  const reviews = [
    {
      id: 1,
      name: "Jessica M.",
      rating: 5,
      comment: "The PetCare Hub SmartCollar has given me such peace of mind. My dog likes to wander, and now I can always see where he is on my phone!",
      product: "The PetCare Hub - SmartCollar",
      date: "3 weeks ago"
    },
    {
      id: 2,
      name: "Mark T.",
      rating: 4,
      comment: "This smart collar detected my cat's elevated temperature before I noticed any symptoms. Vet confirmed she had an infection. Early detection made treatment much easier.",
      product: "The PetCare Hub - SmartCollar",
      date: "2 months ago"
    },
    {
      id: 3,
      name: "Sarah L.",
      rating: 5,
      comment: "Being able to track my pet's activity levels has helped me ensure they're getting enough exercise. The health insights are incredible!",
      product: "The PetCare Hub - SmartCollar",
      date: "1 month ago"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-teal-600 opacity-90"></div>
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-500">Coming Soon</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">The PetCare Hub Smart Collar</h1>
            <p className="text-xl text-white mb-8">
              Track location, monitor health, and ensure the safety of your furry family members with our cutting-edge smart collar technology.
            </p>
            <button className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition">
              Shop Smart Collar
            </button>
          </div>
        </div>
      </div>
      
      {/* Key Benefits Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Smart Collar?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: (
                <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              ),
              title: "Real-Time GPS Tracking",
              description: "Know your pet's location at all times with precise GPS tracking. Set safe zones and receive instant alerts if they wander too far."
            },
            {
              icon: (
                <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              ),
              title: "Health Monitoring",
              description: "Track activity levels, heart rate, temperature, and sleep patterns to stay informed about your pet's overall health and wellbeing."
            },
            {
              icon: (
                <svg className="w-12 h-12 text-teal-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
              ),
              title: "Instant Alerts",
              description: "Receive notifications for unusual behavior, health changes, or when your pet leaves designated safe areas directly to your smartphone."
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
              {benefit.icon}
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Showcase */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">The PetCare Hub Smart Collar</h2>
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden transition transform hover:-translate-y-1 hover:shadow-md max-w-lg w-full">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-500">Coming Soon</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{collar.name}</h3>
                <span className="text-lg font-bold text-teal-600">${collar.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{collar.description}</p>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Features:</span>
                <ul className="mt-2 space-y-1">
                  {collar.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* App Integration Section */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Seamless App Integration</h2>
            <p className="text-lg text-gray-700 mb-6">
              Our smart collar connects seamlessly to our free mobile app, giving you complete control and insights at your fingertips.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Monitor location and health metrics in real-time",
                "Set activity goals and track progress",
                "Receive customizable alerts and notifications",
                "View historical data and identify trends",
                "Share access with family members or pet sitters"
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-6 h-6 text-teal-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
                App Store
              </button>
              <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                </svg>
                Google Play
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-2xl font-bold text-gray-500">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Information Tabs */}
      <div className="mb-20">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {["features", "specs", "faq"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                  activeTab === tab
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "faq" ? "FAQ" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="py-8">
          {activeTab === "features" && (
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Advanced GPS Tracking",
                  description: "Our collars use a combination of GPS, WiFi, and cellular technology to provide accurate location tracking, even in challenging environments."
                },
                {
                  title: "Waterproof Design",
                  description: "All our smart collars are waterproof (IP67 rated), allowing your pets to swim, play in the rain, or get bathed without damaging the device."
                },
                {
                  title: "Long Battery Life",
                  description: "Depending on the model, our smart collars can last from 2 weeks to 6 months on a single charge, with quick 1-hour recharging."
                },
                {
                  title: "Adjustable & Comfortable",
                  description: "Made from pet-friendly materials with adjustable sizes to ensure a comfortable fit for pets of all sizes, from small cats to large dogs."
                },
                {
                  title: "Health Insights",
                  description: "Monitor activity levels, sleep patterns, scratching frequency, and other behaviors to identify potential health issues early."
                },
                {
                  title: "Training Features",
                  description: "Some models include gentle vibration feedback to assist with training, helping to reduce excessive barking or establish boundaries."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === "specs" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { name: "Dimensions", value: "Small: 1.2\" x 0.8\" x 0.4\" | Medium: 1.6\" x 1.0\" x 0.4\" | Large: 2.0\" x 1.2\" x 0.5\"" },
                    { name: "Weight", value: "Small: 0.8 oz | Medium: 1.2 oz | Large: 1.5 oz" },
                    { name: "Battery", value: "Rechargeable lithium-ion 500mAh (small) to 1200mAh (large)" },
                    { name: "Battery Life", value: "2 weeks to 6 months depending on model and usage" },
                    { name: "Charging Time", value: "1-2 hours for full charge" },
                    { name: "Waterproof Rating", value: "IP67 (submersible up to 1 meter for 30 minutes)" },
                    { name: "Connectivity", value: "Bluetooth 5.0, WiFi, LTE-M (varies by model)" },
                    { name: "Sensors", value: "GPS, accelerometer, temperature, heart rate monitor (varies by model)" },
                    { name: "Compatibility", value: "iOS 12.0+ and Android 8.0+" },
                    { name: "Warranty", value: "1 year limited warranty, extendable to 2 years" }
                  ].map((spec, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spec.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === "faq" && (
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">What Pet Parents Are Saying</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">for {review.product}</span>
              </div>
              <p className="text-gray-700 mb-4">"{review.comment}"</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">{review.name}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-teal-600 rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Keep Your Pet Safe & Healthy?</h2>
        <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
          Join thousands of pet parents who trust our smart collar to monitor, protect, and improve the lives of their furry family members.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition">
            Shop Smart Collar
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-teal-700 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default SmartCollars; 