import { MapPin, Activity, Video, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "map-pin":
        return <MapPin className="h-6 w-6 text-teal-600" />
      case "activity":
        return <Activity className="h-6 w-6 text-teal-600" />
      case "video":
        return <Video className="h-6 w-6 text-teal-600" />
      case "bell":
        return <Bell className="h-6 w-6 text-teal-600" />
      default:
        return <Activity className="h-6 w-6 text-teal-600" />
    }
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex items-start space-x-3">
          <div className="mt-1">{getIcon(icon)}</div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
