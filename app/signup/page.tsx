"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PawPrint, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <PawPrint className="h-10 w-10 text-teal-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Choose your account type and enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pet-owner" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pet-owner">Pet Owner</TabsTrigger>
              <TabsTrigger value="service-provider">Service Provider</TabsTrigger>
            </TabsList>
            <TabsContent value="pet-owner" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m.example@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" placeholder="+92 300 1234567" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" required />
              </div>
            </TabsContent>
            <TabsContent value="service-provider" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business name</Label>
                  <Input id="business-name" placeholder="Pet Care Services" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner name</Label>
                  <Input id="owner-name" placeholder="John Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Business email</Label>
                <Input id="business-email" type="email" placeholder="business@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-phone">Business phone</Label>
                <Input id="business-phone" type="tel" placeholder="+92 300 1234567" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Business address</Label>
                <Input id="business-address" placeholder="123 Main St, Islamabad" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-password">Password</Label>
                <div className="relative">
                  <Input
                    id="provider-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-confirm-password">Confirm password</Label>
                <Input id="provider-confirm-password" type="password" placeholder="••••••••" required />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full bg-teal-600 hover:bg-teal-700">Create account</Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
