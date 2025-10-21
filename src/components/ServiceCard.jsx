import React from "react";
import { Scissors, Stethoscope, Award, Home, Activity, Hotel } from "lucide-react";

function ServiceCard({ title, description, icon }) {
  const getIcon = () => {
    switch (icon) {
      case "scissors":
        return <Scissors className="h-8 w-8" />;
      case "stethoscope":
        return <Stethoscope className="h-8 w-8" />;
      case "award":
        return <Award className="h-8 w-8" />;
      case "home":
        return <Home className="h-8 w-8" />;
      case "activity":
        return <Activity className="h-8 w-8" />;
      case "hotel":
        return <Hotel className="h-8 w-8" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
        {getIcon()}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default ServiceCard; 