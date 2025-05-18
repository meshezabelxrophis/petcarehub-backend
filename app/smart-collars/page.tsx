import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Activity, Video, Bell, Thermometer, Users, Check } from "lucide-react"

export default function SmartCollarsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-teal-700">
                  Smart Collars with IoT & Health Tracking
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Monitor your pet's location, activity, and vital health parameters in real time with our innovative
                  smart collars.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/smart-collars/shop">
                  <Button className="bg-teal-600 hover:bg-teal-700">Shop Now</Button>
                </Link>
                <Link href="/smart-collars/how-it-works">
                  <Button variant="outline" className="border-teal-600 text-teal-600">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=550&width=550"
                width={550}
                height={550}
                alt="Smart Pet Collar"
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                Key Features
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                Our smart collars come packed with innovative features to keep your pets safe and healthy
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <MapPin className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">GPS Tracking & Geofencing</h3>
                <p className="text-gray-600">
                  Real-time location tracking, geofencing alerts, and route history to always know where your pet is.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Health Monitoring</h3>
                <p className="text-gray-600">
                  Track vital signs, sleep patterns, activity levels, and receive health alerts for any abnormalities.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Video className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Smart PetCam</h3>
                <p className="text-gray-600">
                  Live video streaming with night vision and two-way audio to see and communicate with your pet
                  remotely.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Bell className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Emergency & Anti-Lost Mode</h3>
                <p className="text-gray-600">
                  SOS alerts, loud beeping sound, and community tracking to help find lost pets quickly.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Thermometer className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Smart Temperature Control</h3>
                <p className="text-gray-600">
                  Heat/cold alerts and cooling & heating assistance to keep your pet comfortable in any weather.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Multi-Pet Support</h3>
                <p className="text-gray-600">
                  Track multiple pets from a single app and share updates with family members and friends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                How It Works
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                Our smart collars are easy to set up and use, providing you with peace of mind
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold">Attach the Collar</h3>
              <p className="text-gray-600">
                Simply attach the comfortable, lightweight collar to your pet's neck and adjust for a perfect fit.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold">Connect to App</h3>
              <p className="text-gray-600">
                Download our mobile app, create an account, and connect your smart collar via Bluetooth.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold">Monitor & Enjoy</h3>
              <p className="text-gray-600">
                Start monitoring your pet's location, health, and activity in real-time through the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Models Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                Choose Your Smart Collar
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl">
                We offer different models to suit your pet's needs and your budget
              </p>
            </div>
          </div>

          <Tabs defaultValue="standard" className="w-full max-w-4xl mx-auto mt-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div>
                  <Image
                    src="/placeholder.svg?height=400&width=400"
                    width={400}
                    height={400}
                    alt="Basic Smart Collar"
                    className="rounded-lg object-cover mx-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-teal-700">Basic Smart Collar</h3>
                  <p className="text-gray-600">
                    Our entry-level smart collar with essential features for pet safety and basic health monitoring.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>GPS Tracking & Geofencing</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Basic Activity Monitoring</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Emergency Alerts</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>7-Day Battery Life</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold">PKR 5,999</span>
                    <span className="text-lg text-gray-500 line-through">PKR 7,999</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-teal-600 hover:bg-teal-700">Add to Cart</Button>
                    <Button variant="outline" className="border-teal-600 text-teal-600">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="standard" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div>
                  <Image
                    src="/placeholder.svg?height=400&width=400"
                    width={400}
                    height={400}
                    alt="Standard Smart Collar"
                    className="rounded-lg object-cover mx-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-teal-700">Standard Smart Collar</h3>
                  <p className="text-gray-600">
                    Our most popular model with advanced features for comprehensive pet monitoring.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>GPS Tracking & Geofencing</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Advanced Health Monitoring</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Smart PetCam with Night Vision</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Temperature Monitoring</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>14-Day Battery Life</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold">PKR 9,999</span>
                    <span className="text-lg text-gray-500 line-through">PKR 12,999</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-teal-600 hover:bg-teal-700">Add to Cart</Button>
                    <Button variant="outline" className="border-teal-600 text-teal-600">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="premium" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div>
                  <Image
                    src="/placeholder.svg?height=400&width=400"
                    width={400}
                    height={400}
                    alt="Premium Smart Collar"
                    className="rounded-lg object-cover mx-auto"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-teal-700">Premium Smart Collar</h3>
                  <p className="text-gray-600">
                    Our top-of-the-line model with all features and premium materials for the ultimate pet care
                    experience.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>All Standard Features</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Advanced Health Analytics & Predictions</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>HD PetCam with 360° View</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Smart Temperature Control</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>Multi-Pet Support (up to 5 pets)</span>
                    </div>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                      <span>30-Day Battery Life</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold">PKR 14,999</span>
                    <span className="text-lg text-gray-500 line-through">PKR 19,999</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-teal-600 hover:bg-teal-700">Add to Cart</Button>
                    <Button variant="outline" className="border-teal-600 text-teal-600">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-600">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Keep Your Pet Safe and Healthy?
              </h2>
              <p className="max-w-[900px] md:text-xl">
                Join thousands of pet owners who trust our smart collars for their beloved companions.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/smart-collars/shop">
                <Button className="bg-white text-teal-600 hover:bg-gray-100">Shop Now</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white text-white hover:bg-teal-700">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
