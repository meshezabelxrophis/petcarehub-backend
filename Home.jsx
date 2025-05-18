import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Calendar, PawPrint, Search, 
  Scissors, Stethoscope, Award, Home as HomeIcon, Activity, Hotel,
  Video, Bell, MapPin as MapPinIcon } from "lucide-react";
import ServiceCard from "./components/ServiceCard";
import TestimonialCard from "./components/TestimonialCard";
import FeatureCard from "./components/FeatureCard";
import Button from "./components/Button";

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-teal-700">
                  Connect with Trusted Pet Care Services
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Find verified pet care professionals for grooming, veterinary care, training, and more. All in one
                  place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/signup">
                  <Button className="bg-teal-600 hover:bg-teal-700">Get Started</Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" className="border-teal-600 text-teal-600">
                    Browse Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/placeholder.svg?height=550&width=550"
                width={550}
                height={550}
                alt="Pet care services"
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
              Find the Perfect Service for Your Pet
            </h2>
            <p className="text-gray-600 md:text-xl">
              Search from hundreds of verified pet care professionals in your area
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Your location"
                  className="w-full rounded-lg border border-gray-300 bg-white px-10 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700 py-3">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                Our Services
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                Discover a wide range of pet care services tailored to your pet's needs
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <ServiceCard
              title="Pet Grooming"
              description="Professional grooming services to keep your pet looking and feeling their best."
              icon="scissors"
            />
            <ServiceCard
              title="Veterinary Care"
              description="Connect with qualified veterinarians for check-ups, vaccinations, and treatments."
              icon="stethoscope"
            />
            <ServiceCard
              title="Pet Training"
              description="Expert trainers to help with obedience, behavior modification, and specialized skills."
              icon="award"
            />
            <ServiceCard
              title="Pet Sitting"
              description="Reliable pet sitters to care for your pets when you're away from home."
              icon="home"
            />
            <ServiceCard
              title="Dog Walking"
              description="Regular exercise and outdoor activities for your canine companions."
              icon="activity"
            />
            <ServiceCard
              title="Pet Boarding"
              description="Safe and comfortable accommodation for your pets during your absence."
              icon="hotel"
            />
          </div>
          <div className="flex justify-center">
            <Link to="/services">
              <Button variant="outline" className="border-teal-600 text-teal-600">
                View All Services <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Smart Collar Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-teal-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex items-center justify-center">
              <img
                src="/placeholder.svg?height=500&width=500"
                width={500}
                height={500}
                alt="Smart Pet Collar"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                  Smart Collars with IoT & Health Tracking
                </h2>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Monitor your pet's location, activity, and vital health parameters in real time with our innovative
                  smart collars.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FeatureCard
                  title="GPS Tracking"
                  description="Real-time location tracking and geofencing alerts"
                  icon="map-pin"
                />
                <FeatureCard
                  title="Health Monitoring"
                  description="Track vital signs, sleep patterns, and activity levels"
                  icon="activity"
                />
                <FeatureCard
                  title="Live PetCam"
                  description="See what your pet sees with live video streaming"
                  icon="video"
                />
                <FeatureCard
                  title="Emergency Alerts"
                  description="Instant notifications for unusual activity or health concerns"
                  icon="bell"
                />
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/smart-collars">
                  <Button className="bg-teal-600 hover:bg-teal-700">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                How It Works
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                Finding and booking pet care services has never been easier
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Search</h3>
              <p className="text-gray-600">Browse through our extensive list of verified pet care service providers</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Book</h3>
              <p className="text-gray-600">Schedule appointments with your preferred service providers</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <PawPrint className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Enjoy</h3>
              <p className="text-gray-600">Sit back and relax while your pet receives the best care possible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                What Our Users Say
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                Hear from pet owners who have found the perfect care for their beloved companions
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <TestimonialCard
              name="Sarah Ahmed"
              location="Islamabad"
              quote="Finding a reliable groomer for my Persian cat was always a challenge until I discovered this platform. Now, I book appointments with just a few clicks!"
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              name="Ali Hassan"
              location="Lahore"
              quote="The smart collar feature has been a game-changer. I can track my dog's location and health metrics in real-time, giving me peace of mind."
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              name="Fatima Khan"
              location="Karachi"
              quote="As a busy professional, I needed reliable pet sitting services. This platform connected me with trustworthy sitters who send me regular updates about my pets."
              image="/placeholder.svg?height=100&width=100"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-teal-600">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Find the Perfect Care for Your Pet?
              </h2>
              <p className="max-w-[900px] md:text-xl">
                Join thousands of pet owners who have found reliable and professional pet care services through our
                platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/signup">
                <Button className="bg-white text-teal-600 hover:bg-gray-100">Sign Up Now</Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" className="border-white text-white hover:bg-teal-700">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 