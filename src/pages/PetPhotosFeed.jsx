/**
 * Pet Photos Feed Page
 * Main page for viewing all pet photos
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import PhotoWall from "../components/PhotoWall";
import { FiUpload, FiTrendingUp } from "react-icons/fi";

export default function PetPhotosFeed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal VSCO style */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              PetCare Community
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/pet-photos/leaderboard")}
                className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-teal-600 transition-colors"
              >
                <FiTrendingUp className="mr-1" size={16} />
                <span className="hidden sm:inline">Top</span>
              </button>
              <button
                onClick={() => navigate("/pet-photos/upload")}
                className="flex items-center px-3 py-1.5 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <FiUpload className="mr-1" size={16} />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Wall - VSCO grid */}
      <div className="max-w-screen-lg mx-auto">
        <PhotoWall />
      </div>
    </div>
  );
}

