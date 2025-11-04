import React from "react";
import { MapPin, Activity, Video, Bell } from "lucide-react";

function FeatureCard({ title, description, icon }) {
  const getIcon = () => {
    switch (icon) {
      case "map-pin":
        return <MapPin className="h-5 w-5" />;
      case "activity":
        return <Activity className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "bell":
        return <Bell className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          {getIcon()}
        </div>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard; 