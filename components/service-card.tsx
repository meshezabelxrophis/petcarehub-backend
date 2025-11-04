import { Scissors, Stethoscope, Award, Home, Activity, Hotel } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ServiceCardProps {
  title: string
  description: string
  icon: string
}

export function ServiceCard({ title, description, icon }: ServiceCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "scissors":
        return <Scissors className="h-10 w-10 text-teal-600" />
      case "stethoscope":
        return <Stethoscope className="h-10 w-10 text-teal-600" />
      case "award":
        return <Award className="h-10 w-10 text-teal-600" />
      case "home":
        return <Home className="h-10 w-10 text-teal-600" />
      case "activity":
        return <Activity className="h-10 w-10 text-teal-600" />
      case "hotel":
        return <Hotel className="h-10 w-10 text-teal-600" />
      default:
        return <Activity className="h-10 w-10 text-teal-600" />
    }
  }

  return (
    <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        {getIcon(icon)}
        <CardTitle className="text-xl font-bold mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
