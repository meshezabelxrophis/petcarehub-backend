import React from "react";

function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About PetCare Hub</h1>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At PetCare Hub, we're dedicated to connecting pet owners with reliable, high-quality care services.
                We believe every pet deserves the best care possible, and every pet owner deserves peace of mind.
              </p>
              <p className="text-gray-600">
                Our platform makes it easy to find, book, and manage pet care services, from dog walking and
                grooming to veterinary care and pet sitting - all in one convenient place.
              </p>
            </div>
            <div className="bg-teal-50 p-8 md:p-12 flex items-center justify-center">
              <img 
                src="/images/about-mission.jpg" 
                alt="Happy pets with their owners"
                className="rounded-lg shadow-md max-h-80 object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-lg text-gray-700 mb-6">
            Founded in 2023, PetCare Hub began with a simple idea: make pet care accessible, reliable, and stress-free.
            Our founders, all pet owners themselves, experienced firsthand the challenges of finding trustworthy pet care services.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            After struggling to find a dog walker on short notice and having difficulty comparing pet care options,
            they decided to create a solution that would help pet owners everywhere.
          </p>
          <p className="text-lg text-gray-700">
            Today, PetCare Hub has grown into a comprehensive platform that connects thousands of pet owners with
            qualified pet care professionals, all vetted to ensure they provide the highest standard of care.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Pet Welfare</h3>
              <p className="text-gray-600">
                The well-being of pets is at the heart of everything we do. We prioritize safety, comfort, and happiness.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality & Trust</h3>
              <p className="text-gray-600">
                We maintain high standards for all service providers on our platform through rigorous vetting processes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600">
                We're building a community of pet lovers, creating connections between pet owners and care providers.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
          <div className="text-center">
            <p className="text-xl text-gray-800 mb-2">Uzair Yameen</p>
            <p className="text-xl text-gray-800">Meshezabel Rophis</p>
          </div>
        </div>
        
        <div className="bg-teal-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Mission</h2>
          <p className="text-lg text-gray-700 mb-8">
            Whether you're a pet owner looking for quality care or a pet care professional wanting to grow your business,
            PetCare Hub is here to help. Join our community today and be part of revolutionizing the pet care industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/signup" className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg text-center hover:bg-teal-700 transition">
              Sign Up as Pet Owner
            </a>
            <a href="/providers/join" className="inline-block px-6 py-3 border border-teal-600 text-teal-600 font-medium rounded-lg text-center hover:bg-teal-50 transition">
              Become a Provider
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 