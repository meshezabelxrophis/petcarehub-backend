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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Pet Photos 📸
            </h1>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/pet-photos/leaderboard")}
                className="flex items-center px-3 md:px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
              >
                <FiTrendingUp className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">Top Pets</span>
                <span className="sm:hidden">Top</span>
              </button>
              <button
                onClick={() => navigate("/pet-photos/upload")}
                className="flex items-center px-3 md:px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                <FiUpload className="mr-1 md:mr-2" />
                <span className="hidden sm:inline">Upload</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Wall */}
      <PhotoWall />
    </div>
  );
}

