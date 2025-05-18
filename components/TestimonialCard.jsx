import React from "react";
import { MapPin } from "lucide-react";

function TestimonialCard({ name, location, quote, image }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <img
        src={image}
        alt={name}
        width={100}
        height={100}
        className="h-24 w-24 rounded-full object-cover"
      />
      <div className="space-y-2">
        <h3 className="font-bold">{name}</h3>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
        <p className="text-gray-600">"{quote}"</p>
      </div>
    </div>
  );
}

export default TestimonialCard; 