"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PawPrint, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-teal-600" />
          <span className="text-xl font-bold text-teal-600">PetCare Hub</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/services" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Services
          </Link>
          <Link href="/providers" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Providers
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-teal-600 transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-teal-600 transition-colors">
            Contact
          </Link>
        </nav>
        <div className="hidden md:flex gap-4">
          <Link href="/login">
            <Button variant="outline" className="border-teal-600 text-teal-600">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-teal-600 hover:bg-teal-700">Sign Up</Button>
          </Link>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <Link href="/services" className="text-sm font-medium hover:text-teal-600 transition-colors">
              Services
            </Link>
            <Link href="/providers" className="text-sm font-medium hover:text-teal-600 transition-colors">
              Providers
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-teal-600 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-teal-600 transition-colors">
              Contact
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full border-teal-600 text-teal-600">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
