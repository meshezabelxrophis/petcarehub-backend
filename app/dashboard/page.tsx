"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Calendar,
  MessageCircle,
  Bell,
  Settings,
  User,
  PawPrint,
  MapPin,
  Activity,
  Heart,
  Clock,
  Thermometer,
  BarChart,
  Plus,
} from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-teal-600">PetCare Hub</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "overview" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/pets"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "pets" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("pets")}
            >
              <PawPrint className="h-4 w-4" />
              My Pets
            </Link>
            <Link
              href="/dashboard/appointments"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "appointments" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </Link>
            <Link
              href="/dashboard/messages"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "messages" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("messages")}
            >
              <MessageCircle className="h-4 w-4" />
              Messages
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                3
              </span>
            </Link>
            <Link
              href="/dashboard/notifications"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "notifications" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="h-4 w-4" />
              Notifications
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                5
              </span>
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-teal-600 ${
                activeTab === "settings" ? "bg-teal-50 text-teal-600" : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/placeholder.svg?height=40&width=40"
              width={40}
              height={40}
              alt="User"
              className="rounded-full"
            />
            <div>
              <div className="font-medium">Sarah Ahmed</div>
              <div className="text-xs text-gray-500">sarah.ahmed@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="md:hidden">
            <PawPrint className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </header>
        <main className="grid gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, Sarah</h1>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pets">My Pets</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="tracking">Smart Tracking</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">
                      1 dog, 1 cat
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      Next: Grooming on May 18
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      From 2 service providers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Smart Collars</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1</div>
                    <p className="text-xs text-muted-foreground">
                      Battery: 78% remaining
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Pet Activity</CardTitle>
                    <CardDescription>
                      Daily activity levels for your pets over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                      <BarChart className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-gray-500">Activity Chart</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                      Your recent and upcoming pet care appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">Grooming - Max</div>
                          <div className="text-sm text-gray-500">May 18, 2023 • 10:00 AM</div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">Vet Checkup - Luna</div>
                          <div className="text-sm text-gray-500">May 22, 2023 • 2:30 PM</div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">Training - Max</div>
                          <div className="text-sm text-gray-500">May 25, 2023 • 4:00 PM</div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="pets" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">My Pets</h2>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Pet
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-1/3">
                        <Image
                          src="/placeholder.svg?height=200&width=200"
                          width={200}
                          height={200}
                          alt="Dog"
                          className="h-full w-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="w-2/3 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">Max</h3>
                            <p className="text-sm text-gray-500">Golden Retriever • 3 years old</p>
                          </div>
                          <div className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                            Smart Collar
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <Heart className="h-4 w-4 text-red-500 mr-2" />
                            <span>Health: Excellent</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Activity className="h-4 w-4 text-teal-600 mr-2" />
                            <span>Activity: High (2.5 hours today)</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                            <span>Location: Home</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                            View Profile
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            Track
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-1/3">
                        <Image
                          src="/placeholder.svg?height=200&width=200"
                          width={200}
                          height={200}
                          alt="Cat"
                          className="h-full w-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="w-2/3 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">Luna</h3>
                            <p className="text-sm text-gray-500">Persian Cat • 2 years old</p>
                          </div>
                          <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            No Collar
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <Heart className="h-4 w-4 text-red-500 mr-2" />
                            <span>Health: Good</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Activity className="h-4 w-4 text-teal-600 mr-2" />
                            <span>Activity: Unknown</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                            <span>Location: Unknown</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                            View Profile
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            Add Collar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="appointments" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Appointments</h2>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Your scheduled pet care services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                        <Calendar className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Pet Grooming - Max</p>
                            <div className="text-sm text-gray-500">Luxury Pet Spa & Grooming</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-red-600 text-red-600">
                              Cancel
                            </Button>
                            <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-gray-500" />
                          <span>May 18, 2023 • 10:00 AM</span>
                          <MapPin className="ml-3 mr-1 h-4 w-4 text-gray-500" />
                          <span>Islamabad, F-7</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Veterinary Checkup - Luna</p>
                            <div className="text-sm text-gray-500">PetHealth Veterinary Clinic</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-red-600 text-red-600">
                              Cancel
                            </Button>
                            <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-gray-500" />
                          <span>May 22, 2023 • 2:30 PM</span>
                          <MapPin className="ml-3 mr-1 h-4 w-4 text-gray-500" />
                          <span>Islamabad, E-11</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dog Training - Max</p>
                            <div className="text-sm text-gray-500">Elite Pet Training Academy</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="border-red-600 text-red-600">
                              Cancel
                            </Button>
                            <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-gray-500" />
                          <span>May 25, 2023 • 4:00 PM</span>
                          <MapPin className="ml-3 mr-1 h-4 w-4 text-gray-500" />
                          <span>Islamabad, F-10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                  <CardDescription>
                    Your completed pet care services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center opacity-70">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Calendar className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Veterinary Checkup - Max</p>
                            <div className="text-sm text-gray-500">PetHealth Veterinary Clinic</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-gray-500" />
                          <span>May 5, 2023 • 11:30 AM</span>
                          <MapPin className="ml-3 mr-1 h-4 w-4 text-gray-500" />
                          <span>Islamabad, E-11</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center opacity-70">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Calendar className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Pet Grooming - Luna</p>
                            <div className="text-sm text-gray-500">Luxury Pet Spa & Grooming</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-4 w-4 text-gray-500" />
                          <span>April 28, 2023 • 2:00 PM</span>
                          <MapPin className="ml-3 mr-1 h-4 w-4 text-gray-500" />
                          <span>Islamabad, F-7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tracking" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Smart Collar Tracking</h2>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Smart Collar
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Max's Location</CardTitle>
                    <CardDescription>
                      Real-time location tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-gray-500">Map View</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Last updated: 2 minutes ago
                      </div>
                      <Button variant="outline" size="sm" className="border-teal-600 text-teal-600">
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                    <CardDescription>
                      Max's vital signs and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm font-medium">Heart Rate</span>
                          </div>
                          <span className="font-bold">78 BPM</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-teal-600" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Normal</span>
                          <span>Elevated</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 text-teal-600 mr-2" />
                            <span className="text-sm font-medium">Activity Level</span>
                          </div>
                          <span className="font-bold">High</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-teal-600" style={{ width: "85%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 text-orange-500 mr-2" />
                            <span className="text-sm font-medium">Temperature</span>
                          </div>
                          <span className="font-bold">38.5°C</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-teal-600" style={{ width: "50%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                          View Detailed Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Max's activities throughout the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  \
