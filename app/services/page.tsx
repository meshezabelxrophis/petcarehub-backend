import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Filter,
  Star,
  Scissors,
  Stethoscope,
  Award,
  Home,
  Activity,
  Hotel,
  Clock,
  DollarSign,
} from "lucide-react"
import Image from "next/image"

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-teal-50 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-teal-700">
                Find Pet Care Services
              </h1>
              <p className="max-w-[700px] text-gray-600 md:text-xl">
                Browse through our extensive list of verified pet care service providers
              </p>
            </div>
            <div className="w-full max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input type="text" placeholder="What service do you need?" className="w-full pl-10" />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input type="text" placeholder="Your location" className="w-full pl-10" />
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Service Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="grooming" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="grooming" className="ml-2 text-sm">
                          Pet Grooming
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="vet" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="vet" className="ml-2 text-sm">
                          Veterinary Care
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="training" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="training" className="ml-2 text-sm">
                          Pet Training
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="sitting" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="sitting" className="ml-2 text-sm">
                          Pet Sitting
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="walking" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="walking" className="ml-2 text-sm">
                          Dog Walking
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="boarding" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="boarding" className="ml-2 text-sm">
                          Pet Boarding
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Rating</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="5star" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="5star" className="ml-2 text-sm flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="4star" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="4star" className="ml-2 text-sm flex items-center">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="3star" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="3star" className="ml-2 text-sm flex items-center">
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                            {[...Array(2)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-gray-300" />
                            ))}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="price1" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="price1" className="ml-2 text-sm">
                          Under PKR 1,000
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price2" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="price2" className="ml-2 text-sm">
                          PKR 1,000 - 3,000
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price3" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="price3" className="ml-2 text-sm">
                          PKR 3,000 - 5,000
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="price4" className="h-4 w-4 text-teal-600 rounded" />
                        <label htmlFor="price4" className="ml-2 text-sm">
                          Above PKR 5,000
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  <TabsTrigger value="grooming">Grooming</TabsTrigger>
                  <TabsTrigger value="vet">Veterinary</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>
                <div className="text-sm text-gray-500">Showing 24 results</div>
              </div>

              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Service Card 1 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet grooming service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.8 (124)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Scissors className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Grooming</span>
                      </div>
                      <h3 className="font-bold mb-1">Luxury Pet Spa & Grooming</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Islamabad, F-7</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available Mon-Sat, 10AM-7PM</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 1,500 - 3,500</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Service Card 2 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Veterinary service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.9 (87)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Stethoscope className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Veterinary Care</span>
                      </div>
                      <h3 className="font-bold mb-1">PetHealth Veterinary Clinic</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Lahore, DHA Phase 5</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available 24/7</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 2,000 - 5,000</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Service Card 3 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet training service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.7 (56)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Award className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Training</span>
                      </div>
                      <h3 className="font-bold mb-1">Elite Pet Training Academy</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Karachi, Clifton</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available Mon-Fri, 9AM-6PM</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 3,000 - 8,000</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Service Card 4 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet sitting service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.6 (42)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Home className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Sitting</span>
                      </div>
                      <h3 className="font-bold mb-1">Cozy Pet Sitters</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Islamabad, E-11</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available 7 days, flexible hours</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 1,000 - 2,500 per day</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Service Card 5 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Dog walking service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.5 (38)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Dog Walking</span>
                      </div>
                      <h3 className="font-bold mb-1">Happy Paws Dog Walkers</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Lahore, Gulberg</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available 7 days, 6AM-8PM</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 500 - 1,000 per walk</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Service Card 6 */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet boarding service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.8 (64)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Hotel className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Boarding</span>
                      </div>
                      <h3 className="font-bold mb-1">Royal Pet Resort & Boarding</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Karachi, DHA Phase 8</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available 24/7</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 2,500 - 4,000 per night</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="flex justify-center mt-8">
                  <Button variant="outline" className="border-teal-600 text-teal-600">
                    Load More Services
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="grooming" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Grooming Service Cards would go here */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet grooming service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.8 (124)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Scissors className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Grooming</span>
                      </div>
                      <h3 className="font-bold mb-1">Luxury Pet Spa & Grooming</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Islamabad, F-7</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available Mon-Sat, 10AM-7PM</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 1,500 - 3,500</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="vet" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Veterinary Service Cards would go here */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Veterinary service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.9 (87)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Stethoscope className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Veterinary Care</span>
                      </div>
                      <h3 className="font-bold mb-1">PetHealth Veterinary Clinic</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Lahore, DHA Phase 5</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available 24/7</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 2,000 - 5,000</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="training" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Training Service Cards would go here */}
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        width={300}
                        height={200}
                        alt="Pet training service"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                        4.7 (56)
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Award className="h-4 w-4 text-teal-600 mr-2" />
                        <span className="text-sm font-medium text-teal-600">Pet Training</span>
                      </div>
                      <h3 className="font-bold mb-1">Elite Pet Training Academy</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Karachi, Clifton</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Available Mon-Fri, 9AM-6PM</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-teal-600" />
                        <span>PKR 3,000 - 8,000</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" className="border-teal-600 text-teal-600">
                        View Details
                      </Button>
                      <Button className="bg-teal-600 hover:bg-teal-700">Book Now</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
