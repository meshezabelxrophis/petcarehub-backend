import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  name: string
  location: string
  quote: string
  image: string
}

export function TestimonialCard({ name, location, quote, image }: TestimonialCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 h-6 w-6 text-teal-200 rotate-180" />
          <p className="pt-4 text-gray-600">{quote}</p>
        </div>
      </CardContent>
    </Card>
  )
}
