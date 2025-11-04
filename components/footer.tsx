import Link from "next/link"
import { PawPrint, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-teal-600">PetCare Hub</span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Connecting pet owners with trusted pet care service providers in Pakistan.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Services</h3>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Pet Grooming
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Veterinary Care
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Pet Training
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Pet Sitting
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Dog Walking
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Pet Boarding
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Company</h3>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              About Us
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              How It Works
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Careers
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Press
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Blog
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Support</h3>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Help Center
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Safety Center
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Community Guidelines
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              FAQs
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Contact Us
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Cookie Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-teal-600">
              Accessibility
            </Link>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PetCare Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
